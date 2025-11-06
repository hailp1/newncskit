'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

interface OAuthError {
  code: string;
  message: string;
  provider?: string;
  timestamp: number;
  retryCount: number;
}

interface UseOAuthErrorRecoveryReturn {
  error: OAuthError | null;
  isRecovering: boolean;
  canRetry: boolean;
  clearError: () => void;
  retryAuth: (provider: string) => Promise<void>;
  reportError: (code: string, message: string, provider?: string) => void;
}

const MAX_RETRY_ATTEMPTS = 3;
const RETRY_DELAY = 1000; // 1 second

export function useOAuthErrorRecovery(): UseOAuthErrorRecoveryReturn {
  const [error, setError] = useState<OAuthError | null>(null);
  const [isRecovering, setIsRecovering] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Check for URL error parameters on mount
  useEffect(() => {
    const errorCode = searchParams.get('error');
    const errorMessage = searchParams.get('message');
    const provider = searchParams.get('provider');

    if (errorCode) {
      reportError(
        errorCode,
        errorMessage || 'An error occurred during authentication',
        provider || undefined
      );
    }
  }, [searchParams]);

  const clearError = useCallback(() => {
    setError(null);
    setIsRecovering(false);
    
    // Clear error parameters from URL
    const url = new URL(window.location.href);
    url.searchParams.delete('error');
    url.searchParams.delete('message');
    url.searchParams.delete('provider');
    
    if (url.searchParams.toString() !== window.location.search.slice(1)) {
      router.replace(url.pathname + (url.searchParams.toString() ? '?' + url.searchParams.toString() : ''));
    }
  }, [router]);

  const reportError = useCallback((code: string, message: string, provider?: string) => {
    const newError: OAuthError = {
      code,
      message,
      provider,
      timestamp: Date.now(),
      retryCount: 0,
    };

    setError(newError);
    
    // Log error for debugging
    console.error('OAuth Error:', newError);
    
    // Report to analytics/monitoring service if available
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'oauth_error', {
        error_code: code,
        provider: provider || 'unknown',
        error_message: message,
      });
    }
  }, []);

  const retryAuth = useCallback(async (provider: string) => {
    if (!error || error.retryCount >= MAX_RETRY_ATTEMPTS) {
      return;
    }

    setIsRecovering(true);

    try {
      // Wait before retry to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * (error.retryCount + 1)));

      // Update retry count
      setError(prev => prev ? { ...prev, retryCount: prev.retryCount + 1 } : null);

      // Redirect to auth with provider
      router.push(`/auth?provider=${provider}&retry=${error.retryCount + 1}`);
      
    } catch (retryError) {
      console.error('Retry failed:', retryError);
      reportError(
        'retry_failed',
        'Failed to retry authentication',
        provider
      );
    } finally {
      setIsRecovering(false);
    }
  }, [error, router, reportError]);

  const canRetry = error ? error.retryCount < MAX_RETRY_ATTEMPTS : false;

  return {
    error,
    isRecovering,
    canRetry,
    clearError,
    retryAuth,
    reportError,
  };
}

// Helper function to get user-friendly error messages
export function getOAuthErrorMessage(code: string, provider?: string): string {
  const providerName = provider ? provider.charAt(0).toUpperCase() + provider.slice(1) : 'OAuth';
  
  const messages: Record<string, string> = {
    // OAuth 2.0 standard errors
    'invalid_request': `Invalid ${providerName} request. Please try again.`,
    'unauthorized_client': `${providerName} application is not authorized.`,
    'access_denied': `You cancelled the ${providerName} login process.`,
    'unsupported_response_type': `${providerName} authentication method is not supported.`,
    'invalid_scope': `Invalid permissions requested from ${providerName}.`,
    'server_error': `${providerName} server error. Please try again later.`,
    'temporarily_unavailable': `${providerName} is temporarily unavailable.`,
    
    // Custom application errors
    'oauth_error': `${providerName} authentication failed.`,
    'oauth_callback_failed': `Failed to process ${providerName} authentication.`,
    'missing_code': `${providerName} authorization code not received.`,
    'token_exchange_failed': `Failed to exchange ${providerName} authorization code.`,
    'profile_fetch_failed': `Failed to retrieve ${providerName} profile.`,
    'backend_auth_failed': `Failed to authenticate with backend service.`,
    'account_creation_failed': `Failed to create account with ${providerName} data.`,
    'account_linking_failed': `Failed to link ${providerName} account.`,
    
    // Network and technical errors
    'network_error': 'Network connection error. Please check your internet connection.',
    'timeout_error': 'Authentication request timed out. Please try again.',
    'rate_limit_exceeded': 'Too many authentication attempts. Please wait and try again.',
    
    // Account-related errors
    'account_deactivated': 'Your account has been deactivated. Please contact support.',
    'email_not_verified': 'Please verify your email address before signing in.',
    'account_suspended': 'Your account has been suspended. Please contact support.',
    
    // Default fallback
    'unknown_error': `An unexpected error occurred during ${providerName} authentication.`,
  };

  return messages[code] || messages['unknown_error'];
}

// Helper function to determine if an error is recoverable
export function isRecoverableError(code: string): boolean {
  const recoverableErrors = [
    'server_error',
    'temporarily_unavailable',
    'network_error',
    'timeout_error',
    'oauth_callback_failed',
    'token_exchange_failed',
    'profile_fetch_failed',
    'backend_auth_failed',
  ];

  return recoverableErrors.includes(code);
}

// Helper function to get recovery suggestions
export function getRecoverySuggestion(code: string, provider?: string): string {
  const providerName = provider ? provider.charAt(0).toUpperCase() + provider.slice(1) : 'OAuth';
  
  const suggestions: Record<string, string> = {
    'access_denied': 'You can try signing in again or use a different authentication method.',
    'server_error': 'Please wait a moment and try again.',
    'temporarily_unavailable': 'Please try again in a few minutes.',
    'network_error': 'Please check your internet connection and try again.',
    'timeout_error': 'Please try again with a stable internet connection.',
    'rate_limit_exceeded': 'Please wait a few minutes before trying again.',
    'account_deactivated': 'Please contact support to reactivate your account.',
    'email_not_verified': 'Check your email for a verification link.',
    'invalid_request': 'Please try signing in again.',
    'oauth_callback_failed': 'Please try the authentication process again.',
  };

  return suggestions[code] || `Please try signing in with ${providerName} again, or contact support if the problem persists.`;
}