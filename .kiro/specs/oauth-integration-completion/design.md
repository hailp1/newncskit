# OAuth Integration Completion Design

## Overview

This design document outlines the completion of OAuth authentication system for NCSKit platform, focusing on LinkedIn and Google providers with proper production deployment support. The system will handle both development and production environments with custom redirect URI handling for Google OAuth.

## Architecture

### Current State Analysis

The system already has:
- NextAuth.js configuration with Google, LinkedIn, and ORCID providers
- Backend OAuth callback endpoints in Django
- Frontend social login buttons
- Database integration for user management

### Missing Components

1. **Production Google OAuth Handler**: Custom endpoint `/auth/google_connect.php` for production compatibility
2. **Environment-specific Configuration**: Proper handling of development vs production URLs
3. **Error Handling**: Comprehensive error handling and user feedback
4. **Security Enhancements**: CSRF protection and token validation

## Components and Interfaces

### 1. Frontend Components

#### Enhanced Social Login Buttons
- **Location**: `frontend/src/components/auth/social-login-buttons.tsx`
- **Enhancements**: 
  - Loading states during OAuth flow
  - Error handling with user-friendly messages
  - Environment-aware redirect URLs

#### Custom Google OAuth Handler
- **Location**: `frontend/src/app/auth/google_connect.php/route.ts`
- **Purpose**: Handle Google OAuth callback for production compatibility
- **Features**:
  - Token exchange with Google OAuth API
  - User profile retrieval
  - Backend authentication integration
  - Error handling and redirects

### 2. Backend Components

#### OAuth Views Enhancement
- **Location**: `backend/apps/authentication/oauth_views.py`
- **Enhancements**:
  - Improved error handling
  - Security validation
  - Logging for debugging

#### Environment Configuration
- **Location**: `backend/ncskit_backend/settings.py`
- **Additions**:
  - OAuth provider credentials
  - Environment-specific URLs
  - Security settings

### 3. Configuration Components

#### Environment Variables
```env
# Google OAuth
GOOGLE_CLIENT_ID=833302579226-sijs8vgn0shv0362lhcer3tijqb46cj9.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=[secret]

# LinkedIn OAuth  
LINKEDIN_CLIENT_ID=77eom4b93mels0
LINKEDIN_CLIENT_SECRET=your-linkedin-client-secret

# NextAuth
NEXTAUTH_URL=http://localhost:3000 (dev) / https://ncskit.org (prod)
NEXTAUTH_SECRET=[secret]

# Backend API
NEXT_PUBLIC_API_URL=http://localhost:8000 (dev) / https://api.ncskit.org (prod)
```

## Data Models

### User Model Extensions
The existing User model already supports OAuth fields:
- `oauth_provider`: Provider name (google, linkedin, orcid)
- `oauth_id`: Provider-specific user ID
- `profile_image`: User avatar from OAuth provider
- `email_verified`: Auto-verified for OAuth users

### OAuth Session Data
```typescript
interface OAuthSession {
  user: {
    id: string;
    email: string;
    name: string;
    image?: string;
    role: string;
  };
  provider: string;
  accessToken?: string;
  refreshToken?: string;
}
```

## Error Handling

### Frontend Error Handling
1. **OAuth Provider Errors**: Display user-friendly messages for common OAuth errors
2. **Network Errors**: Handle connection issues with retry mechanisms
3. **Validation Errors**: Show specific field validation errors
4. **Redirect Errors**: Proper error page with navigation options

### Backend Error Handling
1. **Token Validation**: Verify OAuth tokens before processing
2. **User Creation Errors**: Handle database constraints and conflicts
3. **Provider API Errors**: Graceful handling of third-party API failures
4. **Security Violations**: Log and block suspicious activities

### Error Response Format
```json
{
  "error": "oauth_error",
  "message": "User-friendly error message",
  "details": "Technical details for debugging",
  "code": "OAUTH_001"
}
```

## Security Considerations

### CSRF Protection
- State parameter validation for OAuth flows
- Secure token storage in HTTP-only cookies
- Origin validation for callback URLs

### Token Security
- Short-lived access tokens (1 hour)
- Secure refresh token rotation
- Encrypted token storage

### Data Validation
- Input sanitization for OAuth profile data
- Email format validation
- Provider ID verification

## Testing Strategy

### Unit Tests
1. **OAuth Callback Handler**: Test token exchange and user creation
2. **User Authentication**: Test login flow and session management
3. **Error Handling**: Test various error scenarios
4. **Security Validation**: Test CSRF and token validation

### Integration Tests
1. **OAuth Flow**: End-to-end OAuth authentication
2. **Provider Integration**: Test with actual OAuth providers
3. **Database Operations**: Test user creation and updates
4. **Session Management**: Test login/logout flows

### Manual Testing
1. **Development Environment**: Test localhost OAuth flows
2. **Production Environment**: Test production OAuth flows
3. **Error Scenarios**: Test network failures and invalid tokens
4. **User Experience**: Test UI feedback and navigation

## Deployment Configuration

### Development Environment
- Redirect URIs: `http://localhost:3000/api/auth/callback/*`
- Custom handler: `http://localhost:3000/auth/google_connect.php`
- API URL: `http://localhost:8000`

### Production Environment
- Redirect URIs: `https://ncskit.org/api/auth/callback/*`
- Custom handler: `https://ncskit.org/auth/google_connect.php`
- API URL: `https://api.ncskit.org`

### Google Cloud Console Configuration
Required redirect URIs to add:
1. `http://localhost:3000/api/auth/callback/google` (development)
2. `https://ncskit.org/api/auth/callback/google` (production)
3. `https://ncskit.org/auth/google_connect.php` (production compatibility)

## Performance Considerations

### Caching Strategy
- Cache OAuth provider configurations
- Cache user profile data temporarily
- Implement session caching for frequent requests

### Rate Limiting
- Limit OAuth callback requests per IP
- Implement exponential backoff for failed requests
- Monitor and alert on unusual OAuth activity

### Monitoring
- Track OAuth success/failure rates
- Monitor provider API response times
- Log security events for audit trails