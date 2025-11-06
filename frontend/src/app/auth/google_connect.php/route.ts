import { NextRequest, NextResponse } from 'next/server';
import { validateOAuthCallback, validateRequestSecurity } from '@/lib/oauth-security';
import { validateOAuthToken } from '@/lib/token-security';

/**
 * Custom Google OAuth callback handler for production compatibility
 * Handles the redirect URI: https://ncskit.org/auth/google_connect.php
 * This endpoint provides backward compatibility with existing Google OAuth app configuration
 */
export async function GET(request: NextRequest) {
  // Validate request security (origin, referer)
  const securityValidation = validateRequestSecurity(request);
  if (!securityValidation.isValid) {
    console.error('OAuth security validation failed:', securityValidation.error);
    return NextResponse.redirect(
      new URL(`/auth?error=security_error&message=${encodeURIComponent(securityValidation.error || 'Security validation failed')}`, request.url)
    );
  }

  const { searchParams } = new URL(request.url);
  
  // Validate OAuth callback parameters with CSRF protection
  const callbackValidation = validateOAuthCallback(searchParams, 'google');
  
  if (!callbackValidation.isValid) {
    console.error('Google OAuth callback validation failed:', callbackValidation.error);
    const errorMessage = callbackValidation.error || 'OAuth callback validation failed';
    return NextResponse.redirect(
      new URL(`/auth?error=oauth_error&message=${encodeURIComponent(errorMessage)}`, request.url)
    );
  }

  const { code, state } = callbackValidation;

  try {
    // Exchange authorization code for access token
    const tokenResponse = await exchangeCodeForTokens(code, request.url);
    
    if (!tokenResponse.access_token) {
      throw new Error('No access token received from Google');
    }

    // Validate the access token with Google
    const tokenValidation = await validateOAuthToken(tokenResponse.access_token, 'google');
    if (!tokenValidation.isValid) {
      throw new Error('Invalid access token received from Google');
    }

    // Get user profile from Google
    const googleUser = await getGoogleUserProfile(tokenResponse.access_token);
    
    if (!googleUser.email) {
      throw new Error('No email address received from Google profile');
    }

    // Additional security: verify token audience matches our client ID
    if (tokenValidation.userInfo?.aud !== process.env.GOOGLE_CLIENT_ID) {
      throw new Error('Token audience mismatch - possible token substitution attack');
    }

    // Authenticate with backend
    const authResult = await authenticateWithBackend({
      email: googleUser.email,
      name: googleUser.name,
      provider: 'google',
      provider_id: googleUser.id,
      image: googleUser.picture,
      access_token: tokenResponse.access_token,
      refresh_token: tokenResponse.refresh_token,
    });

    // Create response with redirect to dashboard
    const response = NextResponse.redirect(new URL('/dashboard', request.url));
    
    // Set secure authentication cookies
    setAuthCookies(response, authResult);

    console.log('Google OAuth authentication successful for user:', googleUser.email);
    return response;

  } catch (error) {
    console.error('Google OAuth callback error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Authentication failed';
    return NextResponse.redirect(
      new URL(`/auth?error=oauth_callback_failed&message=${encodeURIComponent(errorMessage)}`, request.url)
    );
  }
}

/**
 * Handle POST requests (some OAuth flows may use POST)
 */
export async function POST(request: NextRequest) {
  return GET(request);
}

/**
 * Exchange authorization code for access and refresh tokens
 */
async function exchangeCodeForTokens(code: string, requestUrl: string) {
  const baseUrl = new URL(requestUrl).origin;
  const redirectUri = `${baseUrl}/auth/google_connect.php`;

  const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      code,
      grant_type: 'authorization_code',
      redirect_uri: redirectUri,
    }),
  });

  const tokens = await tokenResponse.json();

  if (!tokenResponse.ok) {
    console.error('Token exchange failed:', tokens);
    throw new Error(tokens.error_description || 'Failed to exchange authorization code for tokens');
  }

  return tokens;
}

/**
 * Get user profile information from Google API
 */
async function getGoogleUserProfile(accessToken: string) {
  const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  const googleUser = await userResponse.json();

  if (!userResponse.ok) {
    console.error('Failed to get Google user profile:', googleUser);
    throw new Error('Failed to retrieve user profile from Google');
  }

  return googleUser;
}

/**
 * Authenticate user with backend service
 */
async function authenticateWithBackend(userData: {
  email: string;
  name: string;
  provider: string;
  provider_id: string;
  image?: string;
  access_token: string;
  refresh_token?: string;
}) {
  const backendResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/oauth/callback/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userData),
  });

  const backendData = await backendResponse.json();

  if (!backendResponse.ok) {
    console.error('Backend authentication failed:', backendData);
    throw new Error(backendData.error || 'Backend authentication failed');
  }

  return backendData;
}

/**
 * Set secure authentication cookies with enhanced security
 */
function setAuthCookies(response: NextResponse, authResult: any) {
  const isProduction = process.env.NODE_ENV === 'production';
  
  // Enhanced cookie security settings
  const secureCookieOptions = {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'strict' as const, // Stricter CSRF protection
    path: '/',
    domain: isProduction ? '.ncskit.org' : undefined, // Allow subdomains in production
  };

  // Set access token cookie with shorter expiry for security
  if (authResult.access_token) {
    response.cookies.set('auth_token', authResult.access_token, {
      ...secureCookieOptions,
      maxAge: 60 * 60, // 1 hour - shorter for security
    });
  }

  // Set refresh token cookie with longer expiry
  if (authResult.refresh_token) {
    response.cookies.set('refresh_token', authResult.refresh_token, {
      ...secureCookieOptions,
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });
  }

  // Set session token for CSRF protection
  const sessionToken = generateSecureSessionToken();
  response.cookies.set('session_token', sessionToken, {
    ...secureCookieOptions,
    maxAge: 60 * 60 * 24, // 24 hours
  });

  // Set user info cookie (non-sensitive data) - accessible to client
  if (authResult.user) {
    const userInfo = {
      id: authResult.user.id,
      email: authResult.user.email,
      name: authResult.user.name || authResult.user.full_name,
      role: authResult.user.role,
      provider: 'google',
      authenticated_at: new Date().toISOString(),
    };

    response.cookies.set('user_info', JSON.stringify(userInfo), {
      httpOnly: false, // Accessible to client-side for UI
      secure: isProduction,
      sameSite: 'strict' as const,
      maxAge: 60 * 60, // 1 hour - same as access token
      path: '/',
    });
  }
}

/**
 * Generate secure session token for additional CSRF protection
 */
function generateSecureSessionToken(): string {
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  } else {
    // Fallback for environments without crypto API
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }
}

/**
 * Get user-friendly error message for OAuth errors
 */
function getErrorMessage(error: string): string {
  const errorMessages: Record<string, string> = {
    'access_denied': 'You cancelled the login process. Please try again.',
    'invalid_request': 'Invalid login request. Please try again.',
    'unauthorized_client': 'Application is not authorized. Please contact support.',
    'unsupported_response_type': 'Login method not supported. Please contact support.',
    'invalid_scope': 'Invalid permissions requested. Please contact support.',
    'server_error': 'Google login is temporarily unavailable. Please try again later.',
    'temporarily_unavailable': 'Google login is temporarily unavailable. Please try again later.',
  };

  return errorMessages[error] || 'An error occurred during login. Please try again.';
}