/**
 * OAuth Security utilities for CSRF protection and state management
 */

import { randomBytes } from 'crypto';

// State parameter configuration
const STATE_LENGTH = 32;
const STATE_EXPIRY = 10 * 60 * 1000; // 10 minutes
const STATE_STORAGE_KEY = 'oauth_states';

interface OAuthState {
  state: string;
  provider: string;
  timestamp: number;
  nonce: string;
  redirectUrl?: string;
}

/**
 * Generate a cryptographically secure random state parameter
 */
export function generateOAuthState(): string {
  if (typeof window !== 'undefined' && window.crypto && window.crypto.getRandomValues) {
    // Browser environment - use Web Crypto API
    const array = new Uint8Array(STATE_LENGTH);
    window.crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  } else {
    // Node.js environment - use crypto module
    return randomBytes(STATE_LENGTH).toString('hex');
  }
}

/**
 * Generate a nonce for additional security
 */
export function generateNonce(): string {
  return generateOAuthState();
}

/**
 * Create and store OAuth state for CSRF protection
 */
export function createOAuthState(provider: string, redirectUrl?: string): string {
  const state = generateOAuthState();
  const nonce = generateNonce();
  
  const oauthState: OAuthState = {
    state,
    provider,
    timestamp: Date.now(),
    nonce,
    redirectUrl,
  };

  // Store state in sessionStorage (more secure than localStorage)
  if (typeof window !== 'undefined') {
    try {
      const existingStates = getStoredStates();
      existingStates[state] = oauthState;
      
      // Clean up expired states
      cleanupExpiredStates(existingStates);
      
      sessionStorage.setItem(STATE_STORAGE_KEY, JSON.stringify(existingStates));
    } catch (error) {
      console.error('Failed to store OAuth state:', error);
    }
  }

  return state;
}

/**
 * Validate OAuth state parameter
 */
export function validateOAuthState(
  state: string, 
  provider: string
): { isValid: boolean; redirectUrl?: string; error?: string } {
  if (!state) {
    return { isValid: false, error: 'Missing state parameter' };
  }

  if (typeof window === 'undefined') {
    return { isValid: false, error: 'Cannot validate state on server side' };
  }

  try {
    const storedStates = getStoredStates();
    const storedState = storedStates[state];

    if (!storedState) {
      return { isValid: false, error: 'Invalid or expired state parameter' };
    }

    // Check if state has expired
    if (Date.now() - storedState.timestamp > STATE_EXPIRY) {
      // Remove expired state
      delete storedStates[state];
      sessionStorage.setItem(STATE_STORAGE_KEY, JSON.stringify(storedStates));
      return { isValid: false, error: 'State parameter has expired' };
    }

    // Check if provider matches
    if (storedState.provider !== provider) {
      return { isValid: false, error: 'State parameter provider mismatch' };
    }

    // Remove used state to prevent replay attacks
    delete storedStates[state];
    sessionStorage.setItem(STATE_STORAGE_KEY, JSON.stringify(storedStates));

    return { 
      isValid: true, 
      redirectUrl: storedState.redirectUrl 
    };

  } catch (error) {
    console.error('Failed to validate OAuth state:', error);
    return { isValid: false, error: 'Failed to validate state parameter' };
  }
}

/**
 * Get stored OAuth states from sessionStorage
 */
function getStoredStates(): Record<string, OAuthState> {
  if (typeof window === 'undefined') {
    return {};
  }

  try {
    const stored = sessionStorage.getItem(STATE_STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch (error) {
    console.error('Failed to parse stored OAuth states:', error);
    return {};
  }
}

/**
 * Clean up expired OAuth states
 */
function cleanupExpiredStates(states: Record<string, OAuthState>): void {
  const now = Date.now();
  const expiredStates: string[] = [];

  for (const [state, data] of Object.entries(states)) {
    if (now - data.timestamp > STATE_EXPIRY) {
      expiredStates.push(state);
    }
  }

  expiredStates.forEach(state => delete states[state]);
}

/**
 * Clear all OAuth states (useful for logout)
 */
export function clearOAuthStates(): void {
  if (typeof window !== 'undefined') {
    try {
      sessionStorage.removeItem(STATE_STORAGE_KEY);
    } catch (error) {
      console.error('Failed to clear OAuth states:', error);
    }
  }
}

/**
 * Validate origin for OAuth callbacks
 */
export function validateOrigin(origin: string): boolean {
  if (typeof window === 'undefined') {
    return true; // Skip validation on server side
  }

  const allowedOrigins = [
    window.location.origin,
    process.env.NEXT_PUBLIC_APP_URL,
    'http://localhost:3000',
    'https://ncskit.org',
  ].filter(Boolean);

  return allowedOrigins.includes(origin);
}

/**
 * Create secure OAuth URL with state parameter
 */
export function createSecureOAuthUrl(
  baseUrl: string,
  params: Record<string, string>,
  provider: string,
  redirectUrl?: string
): string {
  const state = createOAuthState(provider, redirectUrl);
  
  const urlParams = new URLSearchParams({
    ...params,
    state,
  });

  return `${baseUrl}?${urlParams.toString()}`;
}

/**
 * Validate OAuth callback URL parameters
 */
export function validateOAuthCallback(
  searchParams: URLSearchParams,
  provider: string
): { 
  isValid: boolean; 
  code?: string; 
  state?: string; 
  error?: string; 
  redirectUrl?: string 
} {
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');
  const errorDescription = searchParams.get('error_description');

  // Check for OAuth errors first
  if (error) {
    return {
      isValid: false,
      error: errorDescription || error,
    };
  }

  // Validate required parameters
  if (!code) {
    return {
      isValid: false,
      error: 'Missing authorization code',
    };
  }

  if (!state) {
    return {
      isValid: false,
      error: 'Missing state parameter',
    };
  }

  // Validate state parameter
  const stateValidation = validateOAuthState(state, provider);
  if (!stateValidation.isValid) {
    return {
      isValid: false,
      error: stateValidation.error || 'Invalid state parameter',
    };
  }

  return {
    isValid: true,
    code,
    state,
    redirectUrl: stateValidation.redirectUrl,
  };
}

/**
 * Generate Content Security Policy nonce for OAuth
 */
export function generateCSPNonce(): string {
  return generateOAuthState().substring(0, 16);
}

/**
 * Validate request origin and referrer
 */
export function validateRequestSecurity(request: Request): {
  isValid: boolean;
  error?: string;
} {
  const origin = request.headers.get('origin');
  const referer = request.headers.get('referer');
  
  // Validate origin
  if (origin && !validateOrigin(origin)) {
    return {
      isValid: false,
      error: 'Invalid request origin',
    };
  }

  // Validate referer for additional security
  if (referer) {
    try {
      const refererUrl = new URL(referer);
      if (!validateOrigin(refererUrl.origin)) {
        return {
          isValid: false,
          error: 'Invalid request referer',
        };
      }
    } catch (error) {
      return {
        isValid: false,
        error: 'Invalid referer URL',
      };
    }
  }

  return { isValid: true };
}