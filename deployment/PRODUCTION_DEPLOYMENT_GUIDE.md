# Production Deployment Guide - app.ncskit.org

## 🎯 Overview

This guide covers the complete deployment process for NCSKIT to production domain `app.ncskit.org`.

**Target Domain:** `app.ncskit.org`  
**Platform:** Vercel  
**Database:** Supabase  
**Analytics Service:** Docker (R-Analytics)

---

## 📋 Pre-Deployment Checklist

### Code & Build
- [x] All TypeScript errors resolved
- [x] Build passes locally (`npm run build`)
- [x] Environment variables documented
- [x] API endpoints tested
- [x] Database migrations ready

### Infrastructure
- [ ] Domain `app.ncskit.org` purchased/available
- [ ] DNS access configured
- [ ] Vercel account ready
- [ ] Supabase project created
- [ ] R-Analytics service deployed

### Security
- [ ] OAuth credentials obtained (Google, LinkedIn)
- [ ] API keys secured
- [ ] Database credentials secured
- [ ] CORS configured
- [ ] Rate limiting configured

---

## 🚀 Deployment Steps

### Step 1: Vercel Project Setup

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Link project
cd frontend
vercel link

# Set production domain
vercel domains add app.ncskit.org
```

### Step 2: DNS Configuration

Add these records to your DNS provider:

```
Type: CNAME
Name: app
Value: cname.vercel-dns.com
TTL: Auto
Proxy: Disabled (if using Cloudflare)
```

**Wait 24-48 hours for DNS propagation and SSL certificate.**

### Step 3: Environment Variables

Set in Vercel Dashboard (Settings → Environment Variables):

```bash
# Application URLs
NEXT_PUBLIC_APP_URL=https://app.ncskit.org
NEXTAUTH_URL=https://app.ncskit.org

# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# LinkedIn OAuth
LINKEDIN_CLIENT_ID=your_linkedin_client_id
LINKEDIN_CLIENT_SECRET=your_linkedin_client_secret

# NextAuth
NEXTAUTH_SECRET=your_nextauth_secret

# R Analytics Service
R_ANALYTICS_URL=your_r_analytics_url
R_ANALYTICS_API_KEY=your_r_analytics_api_key

# Google AI (Gemini)
GOOGLE_AI_API_KEY=your_google_ai_api_key

# Feature Flags
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_ENABLE_BLOG=true
NEXT_PUBLIC_ENABLE_ADMIN=true
```

### Step 4: OAuth Configuration

#### Google OAuth
1. Go to https://console.cloud.google.com/
2. Navigate to **APIs & Services** → **Credentials**
3. Add redirect URI:
   ```
   https://app.ncskit.org/api/auth/callback/google
   ```
4. Add authorized origin:
   ```
   https://app.ncskit.org
   ```

#### LinkedIn OAuth
1. Go to https://www.linkedin.com/developers/apps
2. Navigate to **Auth** tab
3. Add redirect URL:
   ```
   https://app.ncskit.org/api/auth/callback/linkedin
   ```

### Step 5: Database Setup

```sql
-- Run migrations in Supabase SQL Editor

-- 1. Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Run all migration files in order
-- (Copy from supabase/migrations/*.sql)

-- 3. Set up Row Level Security (RLS)
-- (Copy from supabase/migrations/rls-policies.sql)

-- 4. Create storage buckets
INSERT INTO storage.buckets (id, name, public)
VALUES ('analysis-csv-files', 'analysis-csv-files', false);

-- 5. Set storage policies
-- (Copy from supabase/migrations/storage-policies.sql)
```

### Step 6: Deploy to Vercel

```bash
# Deploy to production
vercel --prod

# Or push to main branch (auto-deploy)
git push origin main
```

### Step 7: Verify Deployment

```bash
# Run verification script
node deployment/verify-oauth-config.js

# Manual checks
curl -I https://app.ncskit.org
curl https://app.ncskit.org/api/health
curl https://app.ncskit.org/api/auth/providers
```

---

## 🔒 Security Configuration

### 1. CORS Setup

```typescript
// middleware.ts
export const config = {
  matcher: '/api/:path*',
};

export function middleware(request: Request) {
  const origin = request.headers.get('origin');
  const allowedOrigins = ['https://app.ncskit.org'];

  if (origin && !allowedOrigins.includes(origin)) {
    return new Response('CORS not allowed', { status: 403 });
  }

  return NextResponse.next();
}
```

### 2. Rate Limiting

```typescript
// lib/rate-limit.ts
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

export const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '10 s'),
});
```

### 3. Security Headers

```javascript
// next.config.js
const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on'
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload'
  },
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN'
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    key: 'Referrer-Policy',
    value: 'origin-when-cross-origin'
  }
];

module.exports = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ];
  },
};
```

---

## 📊 Monitoring & Analytics

### 1. Vercel Analytics
- Enable in Vercel Dashboard
- Monitor performance metrics
- Track Web Vitals

### 2. Error Tracking
```typescript
// lib/error-tracking.ts
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: 'production',
  tracesSampleRate: 1.0,
});
```

### 3. Logging
```typescript
// lib/logger.ts
export const logger = {
  info: (message: string, meta?: any) => {
    console.log(JSON.stringify({ level: 'info', message, meta, timestamp: new Date() }));
  },
  error: (message: string, error?: Error) => {
    console.error(JSON.stringify({ level: 'error', message, error: error?.stack, timestamp: new Date() }));
  },
};
```

---

## 🧪 Testing in Production

### Smoke Tests
```bash
# Test homepage
curl https://app.ncskit.org

# Test API health
curl https://app.ncskit.org/api/health

# Test authentication
curl https://app.ncskit.org/api/auth/session

# Test OAuth providers
curl https://app.ncskit.org/api/auth/providers
```

### User Acceptance Testing
1. [ ] User registration works
2. [ ] Google OAuth login works
3. [ ] LinkedIn OAuth login works
4. [ ] CSV upload works
5. [ ] Analysis execution works
6. [ ] Results display correctly
7. [ ] Export functions work
8. [ ] Admin panel accessible
9. [ ] Blog posts display
10. [ ] Mobile responsive

---

## 🔄 CI/CD Pipeline

### GitHub Actions Workflow

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: cd frontend && npm ci
        
      - name: Run tests
        run: cd frontend && npm test
        
      - name: Build
        run: cd frontend && npm run build
        
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

---

## 📱 Post-Deployment

### 1. Monitor First 24 Hours
- Check error logs
- Monitor response times
- Track user registrations
- Verify OAuth flows

### 2. Performance Optimization
- Enable Vercel Edge Functions
- Configure CDN caching
- Optimize images
- Enable compression

### 3. SEO Setup
- Submit sitemap to Google
- Configure robots.txt
- Set up Google Analytics
- Add meta tags

### 4. Backup Strategy
- Daily database backups
- Weekly full backups
- Test restore procedures
- Document recovery process

---

## 🆘 Troubleshooting

### Issue: Domain not resolving
```bash
# Check DNS propagation
nslookup app.ncskit.org
dig app.ncskit.org

# Check from multiple locations
https://dnschecker.org/
```

### Issue: SSL certificate not ready
- Wait 24-48 hours for DNS propagation
- Verify DNS records are correct
- Check Vercel domain status
- Force SSL renewal in Vercel

### Issue: OAuth not working
- Verify redirect URLs match exactly
- Check environment variables
- Test with development credentials first
- Review OAuth provider logs

### Issue: Database connection fails
- Verify Supabase URL and keys
- Check IP allowlist in Supabase
- Test connection from Vercel
- Review Supabase logs

---

## 📞 Support Contacts

- **Vercel Support:** https://vercel.com/support
- **Supabase Support:** https://supabase.com/support
- **DNS Provider:** [Your DNS provider support]

---

## 📚 Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Supabase Documentation](https://supabase.com/docs)
- [OAuth Best Practices](https://oauth.net/2/)

---

**Deployment Date:** [To be filled]  
**Deployed By:** [Your name]  
**Version:** 1.0.0  
**Status:** Ready for Production
