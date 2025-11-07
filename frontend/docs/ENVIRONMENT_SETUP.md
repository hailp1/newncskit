# Environment Setup Guide

This guide will help you set up environment variables for the NCSKIT application.

## Quick Start

### 1. Copy the Example File

```bash
cd frontend
cp .env.example .env.local
```

### 2. Fill in Required Values

Open `.env.local` and update the following required variables:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Analytics Service
NEXT_PUBLIC_ANALYTICS_URL=http://localhost:8000
ANALYTICS_API_KEY=your-analytics-api-key-here

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Validate Your Configuration

```bash
npm run validate-env
```

This will check that all required variables are set and have valid values.

### 4. Start Development Server

```bash
npm run dev
```

The validation script runs automatically before `dev` and `build` commands.

## Getting Credentials

### Supabase

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Create a new project or select existing one
3. Go to Settings → API
4. Copy the following:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon/public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role key** → `SUPABASE_SERVICE_ROLE_KEY` (keep secret!)

### Analytics API Key

For development, generate a random key:

```bash
# On Linux/Mac
openssl rand -base64 32

# On Windows (PowerShell)
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
```

For production, use a strong, unique key and store it securely.

## Environment Files

### `.env.local` (Development)
- Used for local development
- Not committed to Git (in `.gitignore`)
- Contains your personal development credentials

### `.env.production` (Production Template)
- Template for production environment variables
- Committed to Git as reference
- Actual production values set in Vercel dashboard

### `.env.example` (Template)
- Template showing all available variables
- Committed to Git
- Use as reference when setting up new environments

## Validation

The application validates environment variables in two ways:

### 1. Startup Validation

The `src/config/env.ts` module validates variables when the application starts:

```typescript
import { env } from '@/config/env'

// Access validated environment variables
const supabaseUrl = env.supabase.url
const analyticsUrl = env.analytics.url
```

If validation fails, the application will throw an error with details about what's wrong.

### 2. Manual Validation

Run the validation script manually:

```bash
npm run validate-env
```

This checks:
- ✅ All required variables are set
- ✅ URLs are valid format
- ✅ Keys meet minimum length requirements
- ✅ No placeholder values in production
- ✅ HTTPS is used in production
- ✅ No localhost URLs in production

## Production Deployment

### Vercel Setup

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Go to Settings → Environment Variables
4. Add each variable:
   - Set **Environment**: Production
   - Enter **Name** and **Value**
   - Click **Save**

Required variables for production:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_ANALYTICS_URL` (Cloudflare Tunnel URL)
- `ANALYTICS_API_KEY`
- `NEXT_PUBLIC_APP_URL` (Your Vercel deployment URL)

Recommended variables:
- `SENTRY_DSN` (Error tracking)
- `SLACK_WEBHOOK_URL` (Alerts)

### Production Checklist

Before deploying to production:

- [ ] All required variables are set in Vercel
- [ ] Service role key is different from development
- [ ] Analytics API key is strong and unique
- [ ] All URLs use HTTPS
- [ ] No localhost URLs
- [ ] No placeholder values
- [ ] Sentry is configured (recommended)
- [ ] Slack webhook is set up (recommended)

## Troubleshooting

### "Missing required environment variable"

**Problem**: Application won't start

**Solution**: 
1. Check that `.env.local` exists
2. Run `npm run validate-env` to see which variables are missing
3. Copy from `.env.example` and fill in values

### "Invalid URL for NEXT_PUBLIC_SUPABASE_URL"

**Problem**: URL validation fails

**Solution**:
- Ensure URL starts with `https://` or `http://`
- Check for typos
- Verify URL is complete (e.g., `https://abc.supabase.co`)

### "Contains placeholder value in production"

**Problem**: Production deployment fails validation

**Solution**:
- Replace all placeholder values with real credentials
- Check for strings like "your-project", "change-this", etc.
- Generate new keys for production

### Variables not loading

**Problem**: Changes to `.env.local` not taking effect

**Solution**:
1. Restart the development server
2. For `NEXT_PUBLIC_*` variables, rebuild the app
3. Clear `.next` folder: `npm run clean && npm run dev`

### Validation passes but app still fails

**Problem**: Validation succeeds but runtime errors occur

**Solution**:
1. Check that Supabase project is active
2. Verify API keys have correct permissions
3. Test Supabase connection manually
4. Check Docker container is running (for analytics)

## Security Best Practices

### DO ✅

- Use `.env.local` for development (gitignored)
- Store production secrets in Vercel dashboard
- Use different keys for dev/staging/prod
- Generate strong, random keys (min 32 characters)
- Rotate keys regularly
- Use HTTPS in production

### DON'T ❌

- Never commit `.env.local` with real credentials
- Never expose `SUPABASE_SERVICE_ROLE_KEY` to client
- Never hardcode secrets in source code
- Never share production keys via email/Slack
- Never use development keys in production
- Never log sensitive environment variables

## Additional Resources

- [Full Environment Variables Documentation](./ENVIRONMENT_VARIABLES.md)
- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [Supabase API Settings](https://supabase.com/docs/guides/api)

## Support

If you encounter issues:

1. Run `npm run validate-env` to check configuration
2. Check the [troubleshooting section](#troubleshooting)
3. Review [ENVIRONMENT_VARIABLES.md](./ENVIRONMENT_VARIABLES.md)
4. Check application logs for specific errors
