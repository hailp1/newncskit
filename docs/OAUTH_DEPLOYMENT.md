# OAuth Deployment Configuration Guide

This guide covers the deployment-specific configuration for OAuth authentication in NCSKit, including environment setup, security considerations, and troubleshooting for production deployments.

## Deployment Environments

### Development Environment

#### Configuration
- **Domain**: `http://localhost:3000`
- **OAuth Callbacks**: Local development URLs
- **Security**: Relaxed for development
- **Debugging**: Enabled

#### Environment Variables (.env.local)
```env
# Environment
NODE_ENV=development
ENVIRONMENT=development

# App URLs
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:8001

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=ncskit-dev-secret-min-32-chars

# OAuth Providers
GOOGLE_CLIENT_ID=833302579226-sijs8vgn0shv0362lhcer3tijqb46cj9.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-dev-google-secret
NEXT_PUBLIC_GOOGLE_CLIENT_ID=833302579226-sijs8vgn0shv0362lhcer3tijqb46cj9.apps.googleusercontent.com

LINKEDIN_CLIENT_ID=77eom4b93mels0
LINKEDIN_CLIENT_SECRET=your-linkedin-client-secret

# OAuth Security
OAUTH_STATE_SECRET=dev-oauth-state-secret
OAUTH_SESSION_TIMEOUT=3600

# Debug Settings
DEBUG=true
LOG_LEVEL=debug
```

### Staging Environment

#### Configuration
- **Domain**: `https://staging.ncskit.org`
- **OAuth Callbacks**: Staging URLs
- **Security**: Production-like
- **Debugging**: Limited

#### Environment Variables (.env.staging)
```env
# Environment
NODE_ENV=production
ENVIRONMENT=staging

# App URLs
NEXT_PUBLIC_APP_URL=https://staging.ncskit.org
NEXT_PUBLIC_API_URL=https://api-staging.ncskit.org

# NextAuth
NEXTAUTH_URL=https://staging.ncskit.org
NEXTAUTH_SECRET=staging-super-secure-secret-min-32-chars

# OAuth Providers (Use separate staging apps)
GOOGLE_CLIENT_ID=staging-google-client-id
GOOGLE_CLIENT_SECRET=staging-google-secret
NEXT_PUBLIC_GOOGLE_CLIENT_ID=staging-google-client-id

LINKEDIN_CLIENT_ID=staging-linkedin-client-id
LINKEDIN_CLIENT_SECRET=staging-linkedin-secret

# OAuth Security
OAUTH_STATE_SECRET=staging-super-secure-oauth-state-secret
OAUTH_SESSION_TIMEOUT=3600

# Security Settings
SECURE_COOKIES=true
CSRF_PROTECTION=true
RATE_LIMITING=true
```

### Production Environment

#### Configuration
- **Domain**: `https://ncskit.org`
- **OAuth Callbacks**: Production URLs
- **Security**: Maximum security
- **Debugging**: Disabled

#### Environment Variables (.env.production)
```env
# Environment
NODE_ENV=production
ENVIRONMENT=production

# App URLs
NEXT_PUBLIC_APP_URL=https://ncskit.org
NEXT_PUBLIC_API_URL=https://api.ncskit.org

# NextAuth
NEXTAUTH_URL=https://ncskit.org
NEXTAUTH_SECRET=production-ultra-secure-secret-min-64-chars

# OAuth Providers
GOOGLE_CLIENT_ID=833302579226-sijs8vgn0shv0362lhcer3tijqb46cj9.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=production-google-secret
NEXT_PUBLIC_GOOGLE_CLIENT_ID=833302579226-sijs8vgn0shv0362lhcer3tijqb46cj9.apps.googleusercontent.com

LINKEDIN_CLIENT_ID=77eom4b93mels0
LINKEDIN_CLIENT_SECRET=production-linkedin-secret

ORCID_CLIENT_ID=production-orcid-client-id
ORCID_CLIENT_SECRET=production-orcid-secret

# OAuth Security
OAUTH_STATE_SECRET=production-ultra-secure-oauth-state-secret
OAUTH_SESSION_TIMEOUT=3600

# Security Settings
SECURE_COOKIES=true
CSRF_PROTECTION=true
RATE_LIMITING=true

# Monitoring
SENTRY_DSN=your-sentry-dsn
ANALYTICS_ID=your-analytics-id
```

## OAuth Provider Configuration by Environment

### Google OAuth Configuration

#### Development
```
Authorized JavaScript origins:
- http://localhost:3000

Authorized redirect URIs:
- http://localhost:3000/api/auth/callback/google
- http://localhost:3000/auth/google_connect.php
```

#### Staging
```
Authorized JavaScript origins:
- https://staging.ncskit.org

Authorized redirect URIs:
- https://staging.ncskit.org/api/auth/callback/google
- https://staging.ncskit.org/auth/google_connect.php
```

#### Production
```
Authorized JavaScript origins:
- https://ncskit.org
- https://www.ncskit.org

Authorized redirect URIs:
- https://ncskit.org/api/auth/callback/google
- https://ncskit.org/auth/google_connect.php
- https://www.ncskit.org/api/auth/callback/google
- https://www.ncskit.org/auth/google_connect.php
```

### LinkedIn OAuth Configuration

#### Development
```
Redirect URLs:
- http://localhost:3000/api/auth/callback/linkedin
```

#### Staging
```
Redirect URLs:
- https://staging.ncskit.org/api/auth/callback/linkedin
```

#### Production
```
Redirect URLs:
- https://ncskit.org/api/auth/callback/linkedin
- https://www.ncskit.org/api/auth/callback/linkedin
```

### ORCID OAuth Configuration

#### Development
```
Redirect URIs:
- http://localhost:3000/api/auth/callback/orcid
```

#### Staging
```
Redirect URIs:
- https://staging.ncskit.org/api/auth/callback/orcid
```

#### Production
```
Redirect URIs:
- https://ncskit.org/api/auth/callback/orcid
- https://www.ncskit.org/api/auth/callback/orcid
```

## Deployment Checklist

### Pre-Deployment

- [ ] OAuth applications created for target environment
- [ ] Redirect URIs configured correctly
- [ ] Environment variables set securely
- [ ] SSL certificates installed (staging/production)
- [ ] DNS records configured
- [ ] Database migrations completed
- [ ] Security headers configured

### Post-Deployment

- [ ] OAuth flows tested for each provider
- [ ] User registration/login tested
- [ ] Token refresh functionality verified
- [ ] Error handling tested
- [ ] Security headers verified
- [ ] HTTPS redirects working
- [ ] Monitoring and logging configured

## Security Configuration

### Production Security Headers

Configure these headers in your web server or CDN:

```nginx
# Nginx configuration
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
add_header X-Content-Type-Options nosniff always;
add_header X-Frame-Options DENY always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' https://accounts.google.com https://apis.google.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://api.ncskit.org https://accounts.google.com https://api.linkedin.com https://orcid.org; frame-src https://accounts.google.com;" always;
```

### Cookie Security

Production cookie configuration:
```typescript
const cookieOptions = {
  httpOnly: true,
  secure: true, // HTTPS only
  sameSite: 'strict' as const,
  domain: '.ncskit.org', // Allow subdomains
  path: '/',
  maxAge: 3600, // 1 hour
};
```

### Rate Limiting

Configure rate limiting for OAuth endpoints:
```typescript
// OAuth callback rate limiting
const oauthRateLimit = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 attempts per window
  message: 'Too many OAuth attempts, please try again later',
};
```

## Monitoring and Logging

### Key Metrics to Monitor

1. **OAuth Success Rate**
   - Successful authentications per provider
   - Failed authentication attempts
   - Error rates by provider

2. **Performance Metrics**
   - OAuth callback response times
   - Token refresh latency
   - Database query performance

3. **Security Metrics**
   - CSRF attack attempts
   - Invalid token attempts
   - Suspicious authentication patterns

### Logging Configuration

```typescript
// Production logging
const logger = {
  level: 'info',
  format: 'json',
  transports: [
    new winston.transports.File({ filename: 'oauth-error.log', level: 'error' }),
    new winston.transports.File({ filename: 'oauth-combined.log' }),
  ],
};
```

### Log Events to Track

- OAuth authentication attempts
- Token refresh events
- Security violations
- Provider API errors
- User account creation/updates

## Backup and Recovery

### Database Backup

Ensure regular backups of user authentication data:
```sql
-- Backup user authentication data
pg_dump -h localhost -U postgres -d ncskit -t users -t oauth_tokens > oauth_backup.sql
```

### Configuration Backup

Backup OAuth provider configurations:
- Client IDs and secrets (encrypted)
- Redirect URI configurations
- Environment variable templates

## Troubleshooting

### Common Production Issues

#### 1. Redirect URI Mismatch in Production
```
Error: redirect_uri_mismatch
Cause: Production URLs not configured in OAuth provider
Solution: Add production URLs to OAuth provider settings
```

#### 2. HTTPS Certificate Issues
```
Error: SSL certificate verification failed
Cause: Invalid or expired SSL certificate
Solution: Renew SSL certificate and verify chain
```

#### 3. CORS Issues in Production
```
Error: CORS policy blocked
Cause: Incorrect CORS configuration
Solution: Update CORS settings to allow production domain
```

#### 4. Token Refresh Failures
```
Error: Token refresh failed
Cause: Refresh token expired or invalid
Solution: Implement proper token rotation and error handling
```

### Debug Commands

#### Check OAuth Configuration
```bash
# Verify environment variables
env | grep -E "(GOOGLE|LINKEDIN|ORCID|OAUTH|NEXTAUTH)"

# Test OAuth endpoints
curl -I https://ncskit.org/api/auth/callback/google

# Check SSL certificate
openssl s_client -connect ncskit.org:443 -servername ncskit.org
```

#### Monitor OAuth Logs
```bash
# Follow OAuth logs
tail -f /var/log/ncskit/oauth.log

# Search for OAuth errors
grep -i "oauth.*error" /var/log/ncskit/*.log
```

## Performance Optimization

### Caching Strategy

1. **OAuth Provider Metadata**
   - Cache provider discovery documents
   - Cache JWKS (JSON Web Key Sets)
   - TTL: 24 hours

2. **User Session Data**
   - Cache user profile information
   - Cache role and permission data
   - TTL: 1 hour

### CDN Configuration

Configure CDN for OAuth-related assets:
```yaml
# CloudFlare configuration
cache_rules:
  - pattern: "/api/auth/*"
    cache_level: "bypass"
  - pattern: "/auth/*"
    cache_level: "bypass"
  - pattern: "/_next/static/*"
    cache_level: "cache_everything"
    edge_cache_ttl: 86400
```

## Disaster Recovery

### OAuth Provider Outage

1. **Fallback Authentication**
   - Enable email/password login
   - Display provider status messages
   - Queue OAuth attempts for retry

2. **Provider Migration**
   - Prepare alternative OAuth providers
   - Implement provider switching logic
   - Maintain user account linking

### Data Recovery

1. **User Account Recovery**
   - Backup OAuth provider mappings
   - Implement account merging logic
   - Provide manual account linking

2. **Token Recovery**
   - Implement token re-issuance
   - Force re-authentication if needed
   - Maintain audit trail

## Compliance and Privacy

### GDPR Compliance

- Implement data deletion for OAuth accounts
- Provide data export functionality
- Maintain consent records
- Handle right to be forgotten requests

### Privacy Considerations

- Minimize data collection from OAuth providers
- Implement data retention policies
- Secure transmission and storage
- Regular security audits

## Support and Maintenance

### Regular Maintenance Tasks

1. **Monthly**
   - Review OAuth provider configurations
   - Check SSL certificate expiry
   - Update security dependencies

2. **Quarterly**
   - Rotate OAuth secrets
   - Review access logs
   - Update documentation

3. **Annually**
   - Security audit
   - Performance review
   - Disaster recovery testing

### Emergency Contacts

- OAuth Provider Support
  - Google: [Google Cloud Support](https://cloud.google.com/support)
  - LinkedIn: [LinkedIn Developer Support](https://developer.linkedin.com/support)
  - ORCID: [ORCID Support](https://support.orcid.org/)

- Internal Team
  - DevOps Team: devops@ncskit.org
  - Security Team: security@ncskit.org
  - Development Team: dev@ncskit.org