'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { createOAuthState } from '@/lib/oauth-security';

interface SocialLoginButtonsProps {
  callbackUrl?: string;
  className?: string;
  onError?: (error: string) => void;
  onSuccess?: (provider: string) => void;
}

type LoadingState = {
  [key: string]: boolean;
};

export default function SocialLoginButtons({ 
  callbackUrl = '/dashboard', 
  className = '',
  onError,
  onSuccess
}: SocialLoginButtonsProps) {
  const [loadingStates, setLoadingStates] = useState<LoadingState>({});
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSocialLogin = async (provider: string) => {
    // Clear previous states
    setError(null);
    setSuccess(null);
    
    // Set loading state for this provider
    setLoadingStates(prev => ({ ...prev, [provider]: true }));

    try {
      // Create CSRF state for security
      const state = createOAuthState(provider, callbackUrl);
      
      // For Google, use custom redirect handler in production
      const useCustomHandler = provider === 'google' && process.env.NODE_ENV === 'production';
      
      if (useCustomHandler) {
        // Direct redirect to Google OAuth with custom callback
        const googleAuthUrl = createGoogleOAuthUrl(state);
        window.location.href = googleAuthUrl;
        return;
      }

      // Use NextAuth for other providers or development
      const result = await signIn(provider, { 
        callbackUrl,
        redirect: false, // Don't redirect immediately to handle errors
        state, // Pass state for CSRF protection
      });

      if (result?.error) {
        const errorMessage = getErrorMessage(result.error, provider);
        setError(errorMessage);
        onError?.(errorMessage);
      } else if (result?.ok) {
        setSuccess(`Successfully signed in with ${provider}`);
        onSuccess?.(provider);
        // Redirect after showing success message
        setTimeout(() => {
          window.location.href = result.url || callbackUrl;
        }, 1000);
      }
    } catch (error) {
      const errorMessage = `Failed to sign in with ${provider}. Please try again.`;
      console.error(`${provider} login error:`, error);
      setError(errorMessage);
      onError?.(errorMessage);
    } finally {
      // Clear loading state
      setLoadingStates(prev => ({ ...prev, [provider]: false }));
    }
  };

  const createGoogleOAuthUrl = (state: string): string => {
    const baseUrl = 'https://accounts.google.com/o/oauth2/v2/auth';
    const params = new URLSearchParams({
      client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '',
      redirect_uri: `${window.location.origin}/auth/google_connect.php`,
      response_type: 'code',
      scope: 'openid email profile',
      state,
      access_type: 'offline',
      prompt: 'consent',
    });

    return `${baseUrl}?${params.toString()}`;
  };

  const getErrorMessage = (error: string, provider: string): string => {
    const errorMessages: Record<string, string> = {
      'OAuthSignin': `There was an error signing in with ${provider}. Please try again.`,
      'OAuthCallback': `There was an error during ${provider} authentication. Please try again.`,
      'OAuthCreateAccount': `Could not create account with ${provider}. Please try again or contact support.`,
      'EmailCreateAccount': 'Could not create account. Please try again.',
      'Callback': `There was an error during authentication. Please try again.`,
      'OAuthAccountNotLinked': `This ${provider} account is already linked to another user. Please use a different account.`,
      'EmailSignin': 'Check your email for a sign in link.',
      'CredentialsSignin': 'Invalid credentials. Please check your email and password.',
      'SessionRequired': 'Please sign in to access this page.',
      'AccessDenied': 'You cancelled the login process. Please try again.',
      'Verification': 'The verification link is invalid or has expired.',
    };

    return errorMessages[error] || `An error occurred during ${provider} login. Please try again.`;
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Error Alert */}
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Success Alert */}
      {success && (
        <Alert className="mb-4 border-green-200 bg-green-50">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">{success}</AlertDescription>
        </Alert>
      )}

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <Separator className="w-full" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-2 text-gray-500">Or continue with</span>
        </div>
      </div>

      <div className="grid gap-3">
        {/* Google Login */}
        <Button
          variant="outline"
          onClick={() => handleSocialLogin('google')}
          disabled={loadingStates.google || Object.values(loadingStates).some(Boolean)}
          className="w-full h-12 text-gray-700 border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loadingStates.google ? (
            <Loader2 className="w-5 h-5 mr-3 animate-spin" />
          ) : (
            <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
          )}
          {loadingStates.google ? 'Connecting to Google...' : 'Continue with Google'}
        </Button>

        {/* LinkedIn Login */}
        <Button
          variant="outline"
          onClick={() => handleSocialLogin('linkedin')}
          disabled={loadingStates.linkedin || Object.values(loadingStates).some(Boolean)}
          className="w-full h-12 text-gray-700 border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loadingStates.linkedin ? (
            <Loader2 className="w-5 h-5 mr-3 animate-spin" />
          ) : (
            <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24" fill="#0A66C2">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
            </svg>
          )}
          {loadingStates.linkedin ? 'Connecting to LinkedIn...' : 'Continue with LinkedIn'}
        </Button>

        {/* ORCID Login */}
        <Button
          variant="outline"
          onClick={() => handleSocialLogin('orcid')}
          disabled={loadingStates.orcid || Object.values(loadingStates).some(Boolean)}
          className="w-full h-12 text-gray-700 border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loadingStates.orcid ? (
            <Loader2 className="w-5 h-5 mr-3 animate-spin" />
          ) : (
            <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24" fill="#A6CE39">
              <path d="M12 0C5.372 0 0 5.372 0 12s5.372 12 12 12 12-5.372 12-12S18.628 0 12 0zM7.369 4.378c.525 0 .947.431.947.947 0 .525-.422.947-.947.947-.525 0-.946-.422-.946-.947 0-.516.421-.947.946-.947zm-.722 3.038h1.444v10.041H6.647V7.416zm3.562 0h3.9c3.712 0 5.344 2.653 5.344 5.025 0 2.578-2.016 5.016-5.325 5.016h-3.919V7.416zm1.444 1.303v7.444h2.297c2.359 0 3.988-1.303 3.988-3.722 0-2.359-1.303-3.722-3.847-3.722h-2.438z"/>
            </svg>
          )}
          {loadingStates.orcid ? 'Connecting to ORCID...' : 'Continue with ORCID'}
        </Button>
      </div>

      <div className="text-center">
        <p className="text-xs text-gray-500">
          By continuing, you agree to our{' '}
          <a href="/terms" className="text-blue-600 hover:underline">
            Terms of Service
          </a>{' '}
          and{' '}
          <a href="/privacy" className="text-blue-600 hover:underline">
            Privacy Policy
          </a>
        </p>
      </div>
    </div>
  );
}