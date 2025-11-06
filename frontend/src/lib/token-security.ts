/**
 * Token Security utilities for OAuth token management
 */

import { jwtDecode } from 'jwt-decode';

// Token configuration
const TOKEN_STORAGE_KEY = 'auth_token';
const REFRESH_TOKEN_STORAGE_KEY = 'refresh_token';
const TOKEN_EXPIRY_BUFFER = 5 * 60 * 1000; // 5 minutes buffer before expiry

interface TokenPayload {
  exp: number;
  iat: number;
  sub: string;
  email?: string;
  role?: string;
  provider?: string;
}

interface TokenValidationResult {
  isValid: boolean;
  isExpired: boolean;
  payload?: TokenPayload;
  error?: string;
}

/**
 * Validate JWT token structure and expiry
 */
export function validateToken(token: string): TokenValidationResult {
  if (!token) {
    return {
      isValid: false,
      isExpired: false,
      error: 'Token is empty',
    };
  }

  try {
    const payload = jwtDecode<TokenPayload>(token);
    
    // Check if token has required fields
    if (!payload.exp || !payload.sub) {
      return {
        isValid: false,
        isExpired: false,
        error: 'Token missing required fields',
      };
    }

    // Check if token is expired (with buffer)
    const now = Date.now();
    const expiry = payload.exp * 1000; // Convert to milliseconds
    const isExpired = now >= (expiry - TOKEN_EXPIRY_BUFFER);

    return {
      isValid: !isExpired,
      isExpired,
      payload,
    };

  } catch (error) {
    return {
      isValid: false,
      isExpired: false,
      error: 'Invalid token format',
    };
  }
}

/**
 * Securely store authentication token
 */
export function storeToken(token: string, refreshToken?: string): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  try {
    // Validate token before storing
    const validation = validateToken(token);
    if (!validation.isValid) {
      console.error('Cannot store invalid token:', validation.error);
      return false;
    }

    // Store in httpOnly cookie via API call for maximum security
    // This is handled by the OAuth callback handler
    
    // Also store in sessionStorage as fallback (less secure but accessible to client)
    sessionStorage.setItem(TOKEN_STORAGE_KEY, token);
    
    if (refreshToken) {
      sessionStorage.setItem(REFRESH_TOKEN_STORAGE_KEY, refreshToken);
    }

    return true;
  } catch (error) {
    console.error('Failed to store token:', error);
    return false;
  }
}

/**
 * Retrieve authentication token
 */
export function getToken(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    // Try to get from sessionStorage first
    const token = sessionStorage.getItem(TOKEN_STORAGE_KEY);
    
    if (token) {
      const validation = validateToken(token);
      if (validation.isValid) {
        return token;
      } else if (validation.isExpired) {
        // Token expired, try to refresh
        refreshTokenIfNeeded();
        return null;
      }
    }

    return null;
  } catch (error) {
    console.error('Failed to retrieve token:', error);
    return null;
  }
}

/**
 * Get refresh token
 */
export function getRefreshToken(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    return sessionStorage.getItem(REFRESH_TOKEN_STORAGE_KEY);
  } catch (error) {
    console.error('Failed to retrieve refresh token:', error);
    return null;
  }
}

/**
 * Clear all stored tokens
 */
export function clearTokens(): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    sessionStorage.removeItem(TOKEN_STORAGE_KEY);
    sessionStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY);
    
    // Also clear httpOnly cookies via API call
    fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'include',
    }).catch(error => {
      console.error('Failed to clear httpOnly cookies:', error);
    });
  } catch (error) {
    console.error('Failed to clear tokens:', error);
  }
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  const token = getToken();
  return token !== null;
}

/**
 * Get current user info from token
 */
export function getCurrentUser(): TokenPayload | null {
  const token = getToken();
  if (!token) {
    return null;
  }

  const validation = validateToken(token);
  return validation.payload || null;
}

/**
 * Refresh token if needed
 */
export async function refreshTokenIfNeeded(): Promise<string | null> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    return null;
  }

  try {
    const response = await fetch('/api/auth/refresh', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refresh_token: refreshToken }),
      credentials: 'include',
    });

    if (response.ok) {
      const data = await response.json();
      if (data.access_token) {
        storeToken(data.access_token, data.refresh_token);
        return data.access_token;
      }
    }

    // Refresh failed, clear tokens
    clearTokens();
    return null;
  } catch (error) {
    console.error('Token refresh failed:', error);
    clearTokens();
    return null;
  }
}

/**
 * Create authorization header for API requests
 */
export function getAuthHeader(): Record<string, string> {
  const token = getToken();
  if (!token) {
    return {};
  }

  return {
    'Authorization': `Bearer ${token}`,
  };
}

/**
 * Validate OAuth access token from provider
 */
export async function validateOAuthToken(
  token: string, 
  provider: string
): Promise<{ isValid: boolean; userInfo?: any; error?: string }> {
  try {
    let validationUrl: string;
    let headers: Record<string, string> = {};

    switch (provider) {
      case 'google':
        validationUrl = `https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=${token}`;
        break;
      case 'linkedin':
        validationUrl = 'https://api.linkedin.com/v2/people/~';
        headers['Authorization'] = `Bearer ${token}`;
        break;
      case 'orcid':
        validationUrl = 'https://pub.orcid.org/v3.0/status';
        headers['Authorization'] = `Bearer ${token}`;
        break;
      default:
        return { isValid: false, error: 'Unsupported provider' };
    }

    const response = await fetch(validationUrl, { headers });
    
    if (response.ok) {
      const userInfo = await response.json();
      return { isValid: true, userInfo };
    } else {
      return { isValid: false, error: 'Token validation failed' };
    }
  } catch (error) {
    return { isValid: false, error: 'Token validation error' };
  }
}

/**
 * Secure token comparison to prevent timing attacks
 */
export function secureTokenCompare(token1: string, token2: string): boolean {
  if (token1.length !== token2.length) {
    return false;
  }

  let result = 0;
  for (let i = 0; i < token1.length; i++) {
    result |= token1.charCodeAt(i) ^ token2.charCodeAt(i);
  }

  return result === 0;
}

/**
 * Generate secure random token
 */
export function generateSecureToken(length: number = 32): string {
  if (typeof window !== 'undefined' && window.crypto && window.crypto.getRandomValues) {
    const array = new Uint8Array(length);
    window.crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  } else {
    // Fallback for environments without crypto API
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }
}

/**
 * Token expiry monitoring
 */
export function startTokenExpiryMonitoring(onExpiry: () => void): () => void {
  const checkInterval = 60 * 1000; // Check every minute
  
  const intervalId = setInterval(() => {
    const token = getToken();
    if (!token) {
      onExpiry();
      return;
    }

    const validation = validateToken(token);
    if (validation.isExpired) {
      onExpiry();
    }
  }, checkInterval);

  // Return cleanup function
  return () => clearInterval(intervalId);
}

/**
 * Get token expiry time
 */
export function getTokenExpiry(): Date | null {
  const token = getToken();
  if (!token) {
    return null;
  }

  const validation = validateToken(token);
  if (validation.payload?.exp) {
    return new Date(validation.payload.exp * 1000);
  }

  return null;
}

/**
 * Check if token will expire soon
 */
export function isTokenExpiringSoon(bufferMinutes: number = 5): boolean {
  const expiry = getTokenExpiry();
  if (!expiry) {
    return true; // No token or invalid token
  }

  const now = new Date();
  const bufferTime = bufferMinutes * 60 * 1000;
  
  return (expiry.getTime() - now.getTime()) <= bufferTime;
}