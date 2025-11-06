'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, RefreshCw, Home, ArrowLeft } from 'lucide-react';

export default function AuthErrorPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [errorDetails, setErrorDetails] = useState<string | null>(null);

  useEffect(() => {
    const errorParam = searchParams.get('error');
    const messageParam = searchParams.get('message');
    
    if (errorParam) {
      setError(getErrorMessage(errorParam));
      setErrorDetails(messageParam);
    } else {
      setError('An unknown error occurred during authentication.');
    }
  }, [searchParams]);

  const getErrorMessage = (errorCode: string): string => {
    const errorMessages: Record<string, string> = {
      // OAuth specific errors
      'oauth_error': 'OAuth authentication failed',
      'oauth_callback_failed': 'OAuth callback processing failed',
      'missing_code': 'Authorization code not received',
      'access_denied': 'You cancelled the login process',
      'invalid_request': 'Invalid authentication request',
      'unauthorized_client': 'Application is not authorized',
      'unsupported_response_type': 'Authentication method not supported',
      'invalid_scope': 'Invalid permissions requested',
      'server_error': 'Authentication service temporarily unavailable',
      'temporarily_unavailable': 'Authentication service temporarily unavailable',
      
      // NextAuth errors
      'Configuration': 'There is a problem with the server configuration',
      'AccessDenied': 'Access was denied',
      'Verification': 'The verification token has expired or has already been used',
      'Default': 'An error occurred during authentication',
      
      // Custom errors
      'account_deactivated': 'Your account has been deactivated',
      'email_not_verified': 'Please verify your email address',
      'provider_not_supported': 'This authentication provider is not supported',
    };

    return errorMessages[errorCode] || 'An unexpected error occurred';
  };

  const getErrorSolution = (errorCode: string): string => {
    const solutions: Record<string, string> = {
      'oauth_error': 'Please try signing in again. If the problem persists, try a different authentication method.',
      'oauth_callback_failed': 'There was an issue processing your authentication. Please try again.',
      'missing_code': 'The authentication process was interrupted. Please try signing in again.',
      'access_denied': 'You can try signing in again or use a different authentication method.',
      'invalid_request': 'Please try signing in again. If the issue continues, contact support.',
      'unauthorized_client': 'This application is not properly configured. Please contact support.',
      'server_error': 'The authentication service is temporarily down. Please try again in a few minutes.',
      'temporarily_unavailable': 'The authentication service is temporarily down. Please try again in a few minutes.',
      'account_deactivated': 'Please contact support to reactivate your account.',
      'email_not_verified': 'Check your email for a verification link, or request a new one.',
      'provider_not_supported': 'Please use a different sign-in method.',
    };

    return solutions[errorCode] || 'Please try again or contact support if the problem persists.';
  };

  const handleRetry = () => {
    router.push('/auth');
  };

  const handleGoHome = () => {
    router.push('/');
  };

  const handleGoBack = () => {
    router.back();
  };

  const errorCode = searchParams.get('error') || 'unknown';

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <Card className="shadow-lg">
          <CardHeader className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              Authentication Error
            </CardTitle>
            <CardDescription className="text-gray-600">
              We encountered an issue while trying to sign you in
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Error Alert */}
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <div className="font-medium">{error}</div>
                {errorDetails && (
                  <div className="text-sm mt-1 opacity-90">{errorDetails}</div>
                )}
              </AlertDescription>
            </Alert>

            {/* Solution */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="text-sm font-medium text-blue-800 mb-2">
                What you can do:
              </h3>
              <p className="text-sm text-blue-700">
                {getErrorSolution(errorCode)}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button 
                onClick={handleRetry} 
                className="w-full"
                size="lg"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
              
              <div className="grid grid-cols-2 gap-3">
                <Button 
                  variant="outline" 
                  onClick={handleGoBack}
                  size="sm"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Go Back
                </Button>
                
                <Button 
                  variant="outline" 
                  onClick={handleGoHome}
                  size="sm"
                >
                  <Home className="w-4 h-4 mr-2" />
                  Home
                </Button>
              </div>
            </div>

            {/* Support Information */}
            <div className="text-center pt-4 border-t border-gray-200">
              <p className="text-xs text-gray-500">
                Still having trouble?{' '}
                <a 
                  href="/contact" 
                  className="text-blue-600 hover:text-blue-500 underline"
                >
                  Contact Support
                </a>
              </p>
            </div>

            {/* Debug Information (Development Only) */}
            {process.env.NODE_ENV === 'development' && (
              <details className="text-xs text-gray-500 border-t border-gray-200 pt-4">
                <summary className="cursor-pointer hover:text-gray-700">
                  Debug Information
                </summary>
                <div className="mt-2 p-2 bg-gray-100 rounded font-mono">
                  <div>Error Code: {errorCode}</div>
                  <div>Message: {errorDetails || 'None'}</div>
                  <div>URL: {window.location.href}</div>
                  <div>Timestamp: {new Date().toISOString()}</div>
                </div>
              </details>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}