# OAuth Setup Guide for NCSKit

This guide provides comprehensive instructions for setting up OAuth authentication with Google, LinkedIn, and ORCID providers for the NCSKit platform.

## Overview

NCSKit supports three OAuth providers:
- **Google OAuth 2.0** - For general users
- **LinkedIn OAuth 2.0** - For professional networking
- **ORCID OAuth 2.0** - For academic researchers

## Prerequisites

- Access to Google Cloud Console
- Access to LinkedIn Developer Console
- Access to ORCID Developer Tools (optional)
- Admin access to your NCSKit deployment

## Google OAuth Setup

### 1. Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API and Google OAuth2 API

### 2. Configure OAuth Consent Screen

1. Navigate to **APIs & Services** > **OAuth consent screen**
2. Choose **External** user type
3. Fill in the required information:
   - **App name**: NCSKit
   - **User support email**: Your support email
   - **Developer contact information**: Your contact email
4. Add scopes:
   - `openid`
   - `email`
   - `profile`
5. Add test users if needed

### 3. Create OAuth 2.0 Credentials

1. Navigate to **APIs & Services** > **Credentials**
2. Click **Create Credentials** > **OAuth 2.0 Client IDs**
3. Choose **Web application**
4. Configure redirect URIs:

#### Development Environment
```
http://localhost:3000/api/auth/callback/google
http://localhost:3000/auth/google_connect.php
```

#### Production Environment
```
https://ncskit.org/api/auth/callback/google
https://ncskit.org/auth/google_connect.php
```

5. Save the **Client ID** and **Client Secret**

### 4. Environment Configuration

Add to your `.env.local` (development) or `.env.production`:

```env
# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id
```

## LinkedIn OAuth Setup

### 1. Create LinkedIn App

1. Go to [LinkedIn Developer Portal](https://developer.linkedin.com/)
2. Click **Create App**
3. Fill in the required information:
   - **App name**: NCSKit
   - **LinkedIn Page**: Your company page
   - **Privacy policy URL**: `https://ncskit.org/privacy`
   - **App logo**: Upload your logo

### 2. Configure OAuth Settings

1. Go to the **Auth** tab
2. Add redirect URLs:

#### Development Environment
```
http://localhost:3000/api/auth/callback/linkedin
```

#### Production Environment
```
https://ncskit.org/api/auth/callback/linkedin
```

3. Request access to the following scopes:
   - `r_liteprofile` - Basic profile information
   - `r_emailaddress` - Email address

### 3. Environment Configuration

Add to your environment file:

```env
# LinkedIn OAuth
LINKEDIN_CLIENT_ID=your-linkedin-client-id
LINKEDIN_CLIENT_SECRET=your-linkedin-client-secret
```

## ORCID OAuth Setup (Optional)

### 1. Register ORCID Application

1. Go to [ORCID Developer Tools](https://orcid.org/developer-tools)
2. Sign in with your ORCID account
3. Click **Register for the free ORCID public API**
4. Fill in the application details:
   - **Application name**: NCSKit
   - **Website URL**: `https://ncskit.org`
   - **Description**: Academic research collaboration platform

### 2. Configure Redirect URIs

Add the following redirect URIs:

#### Development Environment
```
http://localhost:3000/api/auth/callback/orcid
```

#### Production Environment
```
https://ncskit.org/api/auth/callback/orcid
```

### 3. Environment Configuration

Add to your environment file:

```env
# ORCID OAuth
ORCID_CLIENT_ID=your-orcid-client-id
ORCID_CLIENT_SECRET=your-orcid-client-secret
```

## Complete Environment Configuration

Here's a complete example of OAuth-related environment variables:

### Development (.env.local)
```env
# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret-min-32-chars

# Google OAuth
GOOGLE_CLIENT_ID=833302579226-sijs8vgn0shv0362lhcer3tijqb46cj9.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
NEXT_PUBLIC_GOOGLE_CLIENT_ID=833302579226-sijs8vgn0shv0362lhcer3tijqb46cj9.apps.googleusercontent.com

# LinkedIn OAuth
LINKEDIN_CLIENT_ID=77eom4b93mels0
LINKEDIN_CLIENT_SECRET=your-linkedin-client-secret

# ORCID OAuth (Optional)
ORCID_CLIENT_ID=your-orcid-client-id
ORCID_CLIENT_SECRET=your-orcid-client-secret

# OAuth Security
OAUTH_STATE_SECRET=your-oauth-state-secret-for-csrf-protection
OAUTH_SESSION_TIMEOUT=3600

# OAuth Redirect URIs
OAUTH_GOOGLE_REDIRECT_URI=http://localhost:3000/auth/google_connect.php
OAUTH_LINKEDIN_REDIRECT_URI=http://localhost:3000/api/auth/callback/linkedin
OAUTH_ORCID_REDIRECT_URI=http://localhost:3000/api/auth/callback/orcid
```

### Production (.env.production)
```env
# NextAuth Configuration
NEXTAUTH_URL=https://ncskit.org
NEXTAUTH_SECRET=your-super-secure-nextauth-secret-for-production

# Google OAuth
GOOGLE_CLIENT_ID=833302579226-sijs8vgn0shv0362lhcer3tijqb46cj9.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-production-google-client-secret
NEXT_PUBLIC_GOOGLE_CLIENT_ID=833302579226-sijs8vgn0shv0362lhcer3tijqb46cj9.apps.googleusercontent.com

# LinkedIn OAuth
LINKEDIN_CLIENT_ID=77eom4b93mels0
LINKEDIN_CLIENT_SECRET=your-production-linkedin-client-secret

# ORCID OAuth (Optional)
ORCID_CLIENT_ID=your-production-orcid-client-id
ORCID_CLIENT_SECRET=your-production-orcid-client-secret

# OAuth Security
OAUTH_STATE_SECRET=your-super-secure-oauth-state-secret-for-production
OAUTH_SESSION_TIMEOUT=3600

# OAuth Redirect URIs
OAUTH_GOOGLE_REDIRECT_URI=https://ncskit.org/auth/google_connect.php
OAUTH_LINKEDIN_REDIRECT_URI=https://ncskit.org/api/auth/callback/linkedin
OAUTH_ORCID_REDIRECT_URI=https://ncskit.org/api/auth/callback/orcid
```

## Testing OAuth Integration

### 1. Development Testing

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Navigate to `http://localhost:3000/auth`

3. Test each OAuth provider:
   - Click "Continue with Google"
   - Click "Continue with LinkedIn"
   - Click "Continue with ORCID" (if configured)

4. Verify successful authentication and user creation

### 2. Production Testing

1. Deploy your application to production
2. Test OAuth flows on your production domain
3. Verify redirect URIs are working correctly
4. Check that user data is being stored properly

## Security Considerations

### CSRF Protection
- State parameters are automatically generated and validated
- Session storage is used for state management
- Origin validation is performed on callbacks

### Token Security
- Access tokens are stored in HTTP-only cookies
- Refresh tokens are rotated on each use
- Token expiry is monitored and handled automatically

### Data Validation
- All OAuth profile data is sanitized before storage
- Email format validation is performed
- Provider-specific data validation is implemented

## Troubleshooting

### Common Issues

#### 1. Redirect URI Mismatch
**Error**: `redirect_uri_mismatch`
**Solution**: Ensure redirect URIs in OAuth provider settings match exactly with your application URLs

#### 2. Invalid Client ID
**Error**: `invalid_client`
**Solution**: Verify that client IDs and secrets are correctly set in environment variables

#### 3. Scope Issues
**Error**: `invalid_scope`
**Solution**: Check that requested scopes are approved in your OAuth provider settings

#### 4. CORS Errors
**Error**: Cross-origin request blocked
**Solution**: Verify CORS settings in your backend configuration

### Debug Mode

Enable debug mode by setting:
```env
NODE_ENV=development
```

This will show additional debug information in the OAuth status component.

### Logging

OAuth events are logged to the console and application logs. Check logs for detailed error information:

- Authentication attempts
- Token validation failures
- Provider API errors
- Security violations

## Support

For additional support:
1. Check the [troubleshooting section](#troubleshooting)
2. Review application logs
3. Contact the development team
4. Refer to provider-specific documentation:
   - [Google OAuth 2.0](https://developers.google.com/identity/protocols/oauth2)
   - [LinkedIn OAuth 2.0](https://docs.microsoft.com/en-us/linkedin/shared/authentication/authorization-code-flow)
   - [ORCID OAuth 2.0](https://info.orcid.org/documentation/api-tutorials/api-tutorial-get-and-authenticated-orcid-id/)

## Security Best Practices

1. **Keep secrets secure**: Never commit OAuth secrets to version control
2. **Use HTTPS in production**: Always use secure connections for OAuth flows
3. **Rotate secrets regularly**: Update OAuth secrets periodically
4. **Monitor for suspicious activity**: Watch for unusual authentication patterns
5. **Validate all data**: Always validate and sanitize OAuth profile data
6. **Implement rate limiting**: Protect against OAuth abuse
7. **Use secure cookies**: Enable secure, HTTP-only cookies in production