import { NextRequest, NextResponse } from 'next/server';
import { validateToken } from '@/lib/token-security';

/**
 * Token refresh endpoint
 * Handles refresh token rotation for enhanced security
 */
export async function POST(request: NextRequest) {
  try {
    // Get refresh token from request body or cookies
    const body = await request.json().catch(() => ({}));
    const refreshToken = body.refresh_token || request.cookies.get('refresh_token')?.value;

    if (!refreshToken) {
      return NextResponse.json(
        { error: 'Refresh token not provided' },
        { status: 400 }
      );
    }

    // Validate refresh token format
    const validation = validateToken(refreshToken);
    if (!validation.isValid) {
      return NextResponse.json(
        { error: 'Invalid refresh token' },
        { status: 401 }
      );
    }

    // Call backend to refresh token
    const backendResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/refresh/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${refreshToken}`,
      },
      body: JSON.stringify({
        refresh_token: refreshToken,
      }),
    });

    if (!backendResponse.ok) {
      const errorData = await backendResponse.json().catch(() => ({}));
      return NextResponse.json(
        { error: errorData.error || 'Token refresh failed' },
        { status: backendResponse.status }
      );
    }

    const tokenData = await backendResponse.json();

    // Create response with new tokens
    const response = NextResponse.json({
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token,
      expires_in: tokenData.expires_in || 3600,
      token_type: 'Bearer',
    });

    // Set secure cookies with new tokens
    const isProduction = process.env.NODE_ENV === 'production';
    const secureCookieOptions = {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'strict' as const,
      path: '/',
    };

    // Set new access token
    response.cookies.set('auth_token', tokenData.access_token, {
      ...secureCookieOptions,
      maxAge: tokenData.expires_in || 3600, // Use provided expiry or default to 1 hour
    });

    // Set new refresh token (rotate for security)
    if (tokenData.refresh_token) {
      response.cookies.set('refresh_token', tokenData.refresh_token, {
        ...secureCookieOptions,
        maxAge: 60 * 60 * 24 * 7, // 7 days
      });
    }

    return response;

  } catch (error) {
    console.error('Token refresh error:', error);
    return NextResponse.json(
      { error: 'Internal server error during token refresh' },
      { status: 500 }
    );
  }
}

/**
 * Handle preflight requests
 */
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': process.env.NEXT_PUBLIC_APP_URL || '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Credentials': 'true',
    },
  });
}