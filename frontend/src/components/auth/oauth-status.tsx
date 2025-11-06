'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Link as LinkIcon, 
  Unlink, 
  CheckCircle, 
  AlertCircle,
  ExternalLink,
  RefreshCw,
  Eye,
  EyeOff,
  Copy,
  Bug,
  Shield,
  Clock
} from 'lucide-react';
import { getCurrentUser, getTokenExpiry, isTokenExpiringSoon } from '@/lib/token-security';
import { useOAuthErrorRecovery } from '@/hooks/use-oauth-error-recovery';

interface OAuthStatusProps {
  user: {
    oauth_provider?: string;
    oauth_id?: string;
    orcid_id?: string;
    profile_image?: string;
    email_verified: boolean;
    id?: string;
    email?: string;
    role?: string;
  };
  onLink?: (provider: string) => void;
  onUnlink?: () => void;
  showDebugInfo?: boolean;
}

interface ConnectionStatus {
  provider: string;
  status: 'connected' | 'disconnected' | 'error' | 'checking';
  lastChecked?: Date;
  error?: string;
}

export default function OAuthStatus({ 
  user, 
  onLink, 
  onUnlink, 
  showDebugInfo = false 
}: OAuthStatusProps) {
  const [isLinking, setIsLinking] = useState(false);
  const [isUnlinking, setIsUnlinking] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus[]>([]);
  const [showDebugDetails, setShowDebugDetails] = useState(false);
  const [tokenInfo, setTokenInfo] = useState<any>(null);
  
  const { error: oauthError, clearError, canRetry, retryAuth } = useOAuthErrorRecovery();

  // Get current token information
  useEffect(() => {
    const currentUser = getCurrentUser();
    const tokenExpiry = getTokenExpiry();
    const expiringSoon = isTokenExpiringSoon();

    setTokenInfo({
      user: currentUser,
      expiry: tokenExpiry,
      expiringSoon,
      isAuthenticated: !!currentUser,
    });
  }, []);

  // Check connection status for linked providers
  useEffect(() => {
    if (user.oauth_provider) {
      checkConnectionStatus(user.oauth_provider);
    }
  }, [user.oauth_provider]);

  const providers = [
    {
      id: 'google',
      name: 'Google',
      color: 'bg-red-100 text-red-800',
      icon: (
        <svg className="w-4 h-4" viewBox="0 0 24 24">
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
      )
    },
    {
      id: 'linkedin',
      name: 'LinkedIn',
      color: 'bg-blue-100 text-blue-800',
      icon: (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="#0A66C2">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
        </svg>
      )
    },
    {
      id: 'orcid',
      name: 'ORCID',
      color: 'bg-green-100 text-green-800',
      icon: (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="#A6CE39">
          <path d="M12 0C5.372 0 0 5.372 0 12s5.372 12 12 12 12-5.372 12-12S18.628 0 12 0zM7.369 4.378c.525 0 .947.431.947.947 0 .525-.422.947-.947.947-.525 0-.946-.422-.946-.947 0-.516.421-.947.946-.947zm-.722 3.038h1.444v10.041H6.647V7.416zm3.562 0h3.9c3.712 0 5.344 2.653 5.344 5.025 0 2.578-2.016 5.016-5.325 5.016h-3.919V7.416zm1.444 1.303v7.444h2.297c2.359 0 3.988-1.303 3.988-3.722 0-2.359-1.303-3.722-3.847-3.722h-2.438z"/>
        </svg>
      )
    }
  ];

  const handleLink = async (provider: string) => {
    setIsLinking(true);
    try {
      if (onLink) {
        await onLink(provider);
      }
    } finally {
      setIsLinking(false);
    }
  };

  const handleUnlink = async () => {
    setIsUnlinking(true);
    try {
      if (onUnlink) {
        await onUnlink();
      }
    } finally {
      setIsUnlinking(false);
    }
  };

  const checkConnectionStatus = async (provider: string) => {
    setConnectionStatus(prev => 
      prev.map(status => 
        status.provider === provider 
          ? { ...status, status: 'checking' }
          : status
      )
    );

    try {
      // Simple connectivity check - could be enhanced with actual API calls
      const response = await fetch(`/api/auth/check-connection?provider=${provider}`, {
        credentials: 'include',
      });

      const newStatus: ConnectionStatus = {
        provider,
        status: response.ok ? 'connected' : 'error',
        lastChecked: new Date(),
        error: response.ok ? undefined : 'Connection check failed',
      };

      setConnectionStatus(prev => {
        const filtered = prev.filter(s => s.provider !== provider);
        return [...filtered, newStatus];
      });
    } catch (error) {
      setConnectionStatus(prev => {
        const filtered = prev.filter(s => s.provider !== provider);
        return [...filtered, {
          provider,
          status: 'error',
          lastChecked: new Date(),
          error: 'Network error',
        }];
      });
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const linkedProvider = providers.find(p => p.id === user.oauth_provider);
  const providerStatus = connectionStatus.find(s => s.provider === user.oauth_provider);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <LinkIcon className="h-5 w-5" />
            Connected Accounts
          </div>
          {showDebugInfo && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowDebugDetails(!showDebugDetails)}
            >
              <Bug className="h-4 w-4" />
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        
        <Tabs defaultValue="status" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="status">Status</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
          </TabsList>
          
          <TabsContent value="status" className="space-y-4">
            {/* OAuth Error Display */}
            {oauthError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="flex items-center justify-between">
                  <span>{oauthError.message}</span>
                  <div className="flex gap-2">
                    {canRetry && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => retryAuth(oauthError.provider || 'google')}
                      >
                        <RefreshCw className="h-4 w-4 mr-1" />
                        Retry
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={clearError}
                    >
                      Dismiss
                    </Button>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {/* Email Verification Status */}
            <Alert className={user.email_verified ? "border-green-200 bg-green-50" : "border-yellow-200 bg-yellow-50"}>
              {user.email_verified ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <AlertCircle className="h-4 w-4 text-yellow-600" />
              )}
              <AlertDescription className={user.email_verified ? "text-green-800" : "text-yellow-800"}>
                Email {user.email_verified ? 'verified' : 'not verified'}
                {!user.email_verified && ' - Please check your inbox'}
              </AlertDescription>
            </Alert>

            {/* Current OAuth Connection */}
            {linkedProvider ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 border rounded-lg bg-gray-50">
                  <div className="flex items-center gap-3">
                    {linkedProvider.icon}
                    <div>
                      <div className="font-medium">{linkedProvider.name}</div>
                      <div className="text-sm text-gray-500 flex items-center gap-2">
                        {providerStatus?.status === 'checking' && (
                          <>
                            <div className="w-3 h-3 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                            Checking...
                          </>
                        )}
                        {providerStatus?.status === 'connected' && (
                          <>
                            <CheckCircle className="h-3 w-3 text-green-600" />
                            Connected
                          </>
                        )}
                        {providerStatus?.status === 'error' && (
                          <>
                            <AlertCircle className="h-3 w-3 text-red-600" />
                            Connection issue
                          </>
                        )}
                        {!providerStatus && 'Connected'}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={linkedProvider.color}>
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Linked
                    </Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => checkConnectionStatus(linkedProvider.id)}
                      disabled={providerStatus?.status === 'checking'}
                    >
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleUnlink}
                      disabled={isUnlinking}
                    >
                      {isUnlinking ? (
                        <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Unlink className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                {/* Connection Details */}
                {providerStatus?.lastChecked && (
                  <div className="text-xs text-gray-500">
                    Last checked: {providerStatus.lastChecked.toLocaleTimeString()}
                  </div>
                )}
                
                {providerStatus?.error && (
                  <Alert variant="destructive" className="mt-2">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{providerStatus.error}</AlertDescription>
                  </Alert>
                )}

                {/* ORCID ID Display */}
                {user.orcid_id && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <ExternalLink className="h-4 w-4" />
                    <span>ORCID ID: </span>
                    <a 
                      href={`https://orcid.org/${user.orcid_id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {user.orcid_id}
                    </a>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(user.orcid_id!)}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              /* Available Providers to Link */
              <div className="space-y-3">
                <p className="text-sm text-gray-600">
                  Link your account with social providers for easier sign-in:
                </p>
                
                <div className="grid gap-2">
                  {providers.map((provider) => (
                    <div key={provider.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                      <div className="flex items-center gap-3">
                        {provider.icon}
                        <div>
                          <div className="font-medium">{provider.name}</div>
                          <div className="text-sm text-gray-500">
                            {provider.id === 'orcid' ? 'Academic identifier' : 'Social login'}
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleLink(provider.id)}
                        disabled={isLinking}
                      >
                        {isLinking ? (
                          <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <>
                            <LinkIcon className="h-4 w-4 mr-1" />
                            Link
                          </>
                        )}
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="security" className="space-y-4">
            {/* Token Information */}
            {tokenInfo && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  <span className="font-medium">Security Status</span>
                </div>

                {/* Authentication Status */}
                <Alert className={tokenInfo.isAuthenticated ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
                  {tokenInfo.isAuthenticated ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-red-600" />
                  )}
                  <AlertDescription className={tokenInfo.isAuthenticated ? "text-green-800" : "text-red-800"}>
                    {tokenInfo.isAuthenticated ? 'Authenticated' : 'Not authenticated'}
                  </AlertDescription>
                </Alert>

                {/* Token Expiry Warning */}
                {tokenInfo.expiringSoon && tokenInfo.expiry && (
                  <Alert variant="destructive">
                    <Clock className="h-4 w-4" />
                    <AlertDescription>
                      Your session will expire at {tokenInfo.expiry.toLocaleString()}
                    </AlertDescription>
                  </Alert>
                )}

                {/* Debug Information */}
                {showDebugInfo && (
                  <div className="space-y-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowDebugDetails(!showDebugDetails)}
                    >
                      {showDebugDetails ? <EyeOff className="h-4 w-4 mr-1" /> : <Eye className="h-4 w-4 mr-1" />}
                      {showDebugDetails ? 'Hide' : 'Show'} Debug Info
                    </Button>

                    {showDebugDetails && (
                      <div className="bg-gray-100 p-3 rounded text-xs font-mono space-y-2">
                        <div>
                          <strong>User ID:</strong> {tokenInfo.user?.sub || 'N/A'}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(tokenInfo.user?.sub || '')}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                        <div>
                          <strong>Email:</strong> {tokenInfo.user?.email || user.email || 'N/A'}
                        </div>
                        <div>
                          <strong>Role:</strong> {tokenInfo.user?.role || user.role || 'N/A'}
                        </div>
                        <div>
                          <strong>Provider:</strong> {user.oauth_provider || 'N/A'}
                        </div>
                        <div>
                          <strong>Token Expiry:</strong> {tokenInfo.expiry?.toISOString() || 'N/A'}
                        </div>
                        <div>
                          <strong>Environment:</strong> {process.env.NODE_ENV}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Security Note */}
        <div className="text-xs text-gray-500 pt-2 border-t">
          <p>
            Linking accounts allows you to sign in using your social accounts. 
            You can unlink at any time from your profile settings.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}