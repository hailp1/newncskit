# Environment Variables Documentation

This document provides comprehensive information about all environment variables used in the NCSKIT application.

## Table of Contents

- [Overview](#overview)
- [Required Variables](#required-variables)
- [Optional Variables](#optional-variables)
- [Environment-Specific Configuration](#environment-specific-configuration)
- [Security Best Practices](#security-best-practices)
- [Troubleshooting](#troubleshooting)

## Overview

NCSKIT uses environment variables to configure different aspects of the application across development, staging, and production environments. Variables are loaded from:

- **Development**: `.env.local` (not committed to Git)
- **Production**: Vercel Environment Variables Dashboard
- **Template**: `.env.example` (committed to Git as reference)

### Variable Naming Convention

- `NEXT_PUBLIC_*`: Exposed to the browser (client-side)
- No prefix: Server-side only (never exposed to client)

## Required Variables

These variables MUST be set for the application to function properly.

### Supabase Configuration

#### `NEXT_PUBLIC_SUPABASE_URL`
- **Type**: String (URL)
- **Required**: Yes
- **Exposed to Client**: Yes
- **Description**: Your Supabase project URL
- **Example**: `https://abcdefghijklmnop.supabase.co`
- **Where to Get**: Supabase Dashboard → Settings → API → Project URL
- **Used In**: All Supabase client connections

#### `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **Type**: String (JWT)
- **Required**: Yes
- **Exposed to Client**: Yes
- **Description**: Supabase anonymous key for client-side requests
- **Security**: Safe to expose - protected by Row Level Security (RLS)
- **Where to Get**: Supabase Dashboard → Settings → API → Project API keys → anon/public
- **Used In**: Client-side Supabase operations

#### `SUPABASE_SERVICE_ROLE_KEY`
- **Type**: String (JWT)
- **Required**: Yes
- **Exposed to Client**: No (Server-side only)
- **Description**: Service role key with elevated privileges
- **Security**: CRITICAL - Never expose to client! Bypasses RLS.
- **Where to Get**: Supabase Dashboard → Settings → API → Project API keys → service_role
- **Used In**: Server-side admin operations, bypassing RLS when necessary

### Analytics Service Configuration

#### `NEXT_PUBLIC_ANALYTICS_URL`
- **Type**: String (URL)
- **Required**: Yes
- **Exposed to Client**: Yes
- **Description**: URL of the R Analytics Docker service
- **Development**: `http://localhost:8000`
- **Production**: `https://analytics.ncskit.app` (via Cloudflare Tunnel)
- **Used In**: Analytics API calls, health checks

#### `ANALYTICS_API_KEY`
- **Type**: String
- **Required**: Yes
- **Exposed to Client**: No (Server-side only)
- **Description**: API key for authenticating analytics requests
- **Security**: Generate a strong, unique key (min 32 characters)
- **Example**: Use `openssl rand -base64 32` to generate
- **Used In**: API Gateway authentication for analytics requests

### App Configuration

#### `NEXT_PUBLIC_APP_URL`
- **Type**: String (URL)
- **Required**: Yes
- **Exposed to Client**: Yes
- **Description**: Base URL of the application
- **Development**: `http://localhost:3000`
- **Production**: `https://ncskit.vercel.app`
- **Used In**: Absolute URL generation, sitemap, robots.txt, OAuth redirects

#### `NODE_ENV`
- **Type**: String (enum)
- **Required**: Yes
- **Exposed to Client**: No
- **Values**: `development`, `production`, `test`
- **Description**: Node environment mode
- **Auto-set**: Usually set automatically by Next.js/Vercel
- **Used In**: Conditional logic, logging, error handling

## Optional Variables

These variables enhance functionality but are not required for basic operation.

### Monitoring & Error Tracking

#### `SENTRY_DSN`
- **Type**: String (URL)
- **Required**: No
- **Exposed to Client**: Yes (if used client-side)
- **Description**: Sentry Data Source Name for error tracking
- **Where to Get**: Sentry Dashboard → Settings → Projects → [Your Project] → Client Keys
- **Used In**: Error logging and monitoring
- **Recommendation**: Highly recommended for production

#### `SENTRY_AUTH_TOKEN`
- **Type**: String
- **Required**: No (only for source maps upload)
- **Exposed to Client**: No
- **Description**: Sentry authentication token for uploading source maps
- **Where to Get**: Sentry Dashboard → Settings → Auth Tokens

#### `SENTRY_ORG` & `SENTRY_PROJECT`
- **Type**: String
- **Required**: No (only if using Sentry)
- **Description**: Your Sentry organization and project names

#### `VERCEL_ANALYTICS_ID`
- **Type**: String
- **Required**: No
- **Exposed to Client**: Yes
- **Description**: Vercel Analytics ID
- **Auto-configured**: Usually set automatically by Vercel
- **Used In**: Vercel Analytics integration

### Notification Services

#### `SLACK_WEBHOOK_URL`
- **Type**: String (URL)
- **Required**: No
- **Exposed to Client**: No
- **Description**: Slack incoming webhook for alerts and notifications
- **Where to Get**: Slack → Apps → Incoming Webhooks → Add to Slack
- **Used In**: Health check failure alerts, critical error notifications
- **Recommendation**: Recommended for production monitoring

#### `EMAIL_SERVICE_API_KEY`
- **Type**: String
- **Required**: No
- **Exposed to Client**: No
- **Description**: API key for email service (SendGrid, Mailgun, etc.)
- **Used In**: Sending notification emails

#### `EMAIL_FROM`
- **Type**: String (email)
- **Required**: No
- **Default**: `noreply@ncskit.app`
- **Description**: From address for outgoing emails

#### `EMAIL_ADMIN`
- **Type**: String (email)
- **Required**: No
- **Description**: Admin email for receiving critical alerts

### Feature Flags

#### `NEXT_PUBLIC_ENABLE_ANALYTICS`
- **Type**: Boolean
- **Required**: No
- **Default**: `true`
- **Exposed to Client**: Yes
- **Description**: Enable/disable analytics features

#### `NEXT_PUBLIC_ENABLE_REALTIME`
- **Type**: Boolean
- **Required**: No
- **Default**: `true`
- **Exposed to Client**: Yes
- **Description**: Enable/disable Supabase Realtime features

#### `NEXT_PUBLIC_ENABLE_FILE_UPLOAD`
- **Type**: Boolean
- **Required**: No
- **Default**: `true`
- **Exposed to Client**: Yes
- **Description**: Enable/disable file upload functionality

#### `NEXT_PUBLIC_MAINTENANCE_MODE`
- **Type**: Boolean
- **Required**: No
- **Default**: `false`
- **Exposed to Client**: Yes
- **Description**: Enable maintenance mode (shows maintenance page)

### Performance & Caching

#### `UPSTASH_REDIS_REST_URL`
- **Type**: String (URL)
- **Required**: No
- **Exposed to Client**: No
- **Description**: Upstash Redis REST API URL
- **Where to Get**: Upstash Dashboard → Your Database → REST API
- **Used In**: Distributed caching, rate limiting

#### `UPSTASH_REDIS_REST_TOKEN`
- **Type**: String
- **Required**: No
- **Exposed to Client**: No
- **Description**: Upstash Redis REST API token
- **Where to Get**: Upstash Dashboard → Your Database → REST API

#### `CACHE_TTL_ANALYTICS`
- **Type**: Number (seconds)
- **Required**: No
- **Default**: `3600` (1 hour)
- **Description**: Cache TTL for analytics results

#### `CACHE_TTL_STATIC`
- **Type**: Number (seconds)
- **Required**: No
- **Default**: `86400` (24 hours)
- **Description**: Cache TTL for static content

### Security & Rate Limiting

#### `RATE_LIMIT_REQUESTS`
- **Type**: Number
- **Required**: No
- **Default**: `100`
- **Description**: Maximum requests per time window

#### `RATE_LIMIT_WINDOW`
- **Type**: Number (seconds)
- **Required**: No
- **Default**: `60`
- **Description**: Time window for rate limiting

### Development Only

#### `DEBUG`
- **Type**: Boolean
- **Required**: No
- **Default**: `false`
- **Description**: Enable verbose debug logging
- **Use**: Development only

#### `LOG_LEVEL`
- **Type**: String (enum)
- **Required**: No
- **Default**: `info`
- **Values**: `debug`, `info`, `warn`, `error`
- **Description**: Logging level

## Environment-Specific Configuration

### Development Setup

1. Copy the example file:
   ```bash
   cp .env.example .env.local
   ```

2. Fill in required values:
   ```bash
   # Supabase (from your dev project)
   NEXT_PUBLIC_SUPABASE_URL=https://your-dev-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-dev-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-dev-service-role-key
   
   # Analytics (local Docker)
   NEXT_PUBLIC_ANALYTICS_URL=http://localhost:8000
   ANALYTICS_API_KEY=dev-key-12345
   
   # App
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   NODE_ENV=development
   ```

3. Start development server:
   ```bash
   npm run dev
   ```

### Production Setup (Vercel)

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables

2. Add all required variables:
   - Set environment: Production
   - Add each variable with its production value

3. Add optional variables as needed (Sentry, Slack, etc.)

4. Deploy:
   ```bash
   git push origin main
   ```

### Staging Setup

For staging environment, create a separate Supabase project and configure:

1. In Vercel, add environment variables with environment: Preview
2. Use staging-specific values
3. Deploy to preview branch

## Security Best Practices

### DO ✅

- Use `.env.local` for local development (gitignored)
- Store production secrets in Vercel Environment Variables
- Use strong, unique keys for production (min 32 characters)
- Rotate API keys regularly
- Use different keys for dev/staging/prod
- Enable Vercel's environment variable encryption
- Audit environment variable access logs

### DON'T ❌

- Never commit `.env.local` or `.env.production` with real credentials
- Never expose `SUPABASE_SERVICE_ROLE_KEY` to the client
- Never hardcode secrets in source code
- Never share production keys in Slack/email
- Never use development keys in production
- Never log sensitive environment variables

### Key Generation

Generate secure keys using:

```bash
# Generate random API key
openssl rand -base64 32

# Generate UUID
uuidgen

# Generate hex string
openssl rand -hex 32
```

## Troubleshooting

### Application Won't Start

**Error**: "Missing required environment variables"

**Solution**: Ensure all required variables are set in `.env.local`:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_ANALYTICS_URL`
- `ANALYTICS_API_KEY`
- `NEXT_PUBLIC_APP_URL`

### Supabase Connection Failed

**Error**: "Failed to connect to Supabase"

**Solution**:
1. Verify `NEXT_PUBLIC_SUPABASE_URL` is correct
2. Check `NEXT_PUBLIC_SUPABASE_ANON_KEY` is valid
3. Ensure Supabase project is active
4. Check network connectivity

### Analytics Service Unavailable

**Error**: "Analytics service unavailable"

**Solution**:
1. Verify Docker container is running: `docker ps`
2. Check `NEXT_PUBLIC_ANALYTICS_URL` is correct
3. For production, verify Cloudflare Tunnel is active
4. Test health endpoint: `curl $NEXT_PUBLIC_ANALYTICS_URL/health`

### Environment Variables Not Loading

**Issue**: Variables are undefined in code

**Solution**:
1. Restart development server after changing `.env.local`
2. For `NEXT_PUBLIC_*` variables, rebuild the app
3. Check variable names match exactly (case-sensitive)
4. Ensure no spaces around `=` in env file

### Production Deployment Issues

**Issue**: App works locally but fails in production

**Solution**:
1. Verify all required variables are set in Vercel dashboard
2. Check environment is set to "Production"
3. Redeploy after adding/changing variables
4. Check Vercel deployment logs for specific errors

## Validation

The application validates required environment variables on startup. If validation fails, you'll see an error message indicating which variables are missing or invalid.

To manually validate your environment configuration:

```bash
npm run validate-env
```

This will check:
- All required variables are present
- URLs are valid format
- Keys meet minimum length requirements
- No placeholder values in production

## References

- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [Supabase API Settings](https://supabase.com/docs/guides/api)
- [Sentry Configuration](https://docs.sentry.io/platforms/javascript/guides/nextjs/)
