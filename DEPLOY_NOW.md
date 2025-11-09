# 🚀 Deploy NCSKIT to Vercel - Quick Guide

**Status**: ✅ READY TO DEPLOY  
**Estimated Time**: 10-15 minutes

---

## ⚡ Quick Deploy (3 Steps)

### Step 1: Commit & Push (2 minutes)

```bash
# Commit all changes
git add .
git commit -m "release: v1.0.0 - production ready"
git push origin main
```

### Step 2: Deploy to Vercel (5 minutes)

**Option A: One-Click Deploy** ⭐ RECOMMENDED

1. Go to https://vercel.com/new
2. Click "Import Project"
3. Select your GitHub repository
4. Configure:
   - **Root Directory**: `frontend`
   - **Framework**: Next.js (auto-detected)
   - Click "Deploy"

**Option B: CLI Deploy**

```bash
# Install Vercel CLI (if not installed)
npm install -g vercel

# Login
vercel login

# Deploy
cd frontend
vercel --prod
```

### Step 3: Configure Environment Variables (5 minutes)

In Vercel Dashboard → Settings → Environment Variables, add:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://hfczndbrexnaoczxmopn.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
NEXT_PUBLIC_ANALYTICS_URL=https://analytics.ncskit.app
ANALYTICS_API_KEY=<generate-strong-key>
NEXT_PUBLIC_APP_URL=<your-vercel-url>
NODE_ENV=production
```

**Done! Your app is live! 🎉**

---

## 📋 Pre-Deployment Checklist

Before deploying, verify:

- [x] ✅ TypeScript: 0 errors
- [x] ✅ Build: Passing
- [x] ✅ Tests: Passing
- [x] ✅ Code: Cleaned
- [x] ✅ Docs: Complete
- [ ] ⏳ Env Vars: Ready
- [ ] ⏳ Supabase: Configured
- [ ] ⏳ Domain: Ready (optional)

---

## 🔧 Detailed Instructions

### A. Prepare Supabase

1. **Get Credentials**
   ```
   Go to: https://app.supabase.com/project/_/settings/api
   Copy: URL, anon key, service_role key
   ```

2. **Verify Database**
   ```sql
   -- Check tables exist
   SELECT table_name FROM information_schema.tables 
   WHERE table_schema = 'public';
   
   -- Should see: users, projects, analysis_variables, etc.
   ```

3. **Enable RLS**
   ```sql
   -- Verify RLS is enabled
   SELECT tablename, rowsecurity 
   FROM pg_tables 
   WHERE schemaname = 'public';
   ```

### B. Configure Vercel Project

1. **Import Repository**
   - Go to https://vercel.com/new
   - Select GitHub repository
   - Click "Import"

2. **Configure Build**
   ```
   Framework Preset: Next.js
   Root Directory: frontend
   Build Command: npm run build
   Output Directory: .next
   Install Command: npm install
   Node.js Version: 20.x
   ```

3. **Add Environment Variables**
   - Go to Settings → Environment Variables
   - Add all required variables
   - Select "Production" environment
   - Click "Save"

4. **Deploy**
   - Go to Deployments tab
   - Click "Deploy" or push to main branch
   - Wait 2-3 minutes for build

### C. Verify Deployment

1. **Check Build Logs**
   ```
   Vercel Dashboard → Deployments → Latest → View Logs
   
   Should see:
   ✓ Compiled successfully
   ✓ Generating static pages
   ✓ Finalizing page optimization
   ```

2. **Test Endpoints**
   ```bash
   # Homepage
   curl https://your-app.vercel.app
   
   # API Health
   curl https://your-app.vercel.app/api/health
   
   # Supabase Connection
   curl https://your-app.vercel.app/api/health/supabase
   ```

3. **Manual Testing**
   - [ ] Open homepage
   - [ ] Register new user
   - [ ] Login
   - [ ] Create project
   - [ ] Upload CSV
   - [ ] Run analysis
   - [ ] View results

---

## 🎯 Environment Variables Reference

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | `https://xxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public anon key | `eyJhbGci...` |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-side key | `eyJhbGci...` |
| `NEXT_PUBLIC_ANALYTICS_URL` | R Analytics URL | `https://analytics.domain.com` |
| `ANALYTICS_API_KEY` | Analytics API key | `your-secret-key` |
| `NEXT_PUBLIC_APP_URL` | Your app URL | `https://app.vercel.app` |
| `NODE_ENV` | Environment | `production` |

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `SENTRY_DSN` | Error tracking | - |
| `SLACK_WEBHOOK_URL` | Notifications | - |
| `VERCEL_ANALYTICS_ID` | Analytics | Auto |

---

## 🐛 Troubleshooting

### Build Fails

**Error**: TypeScript compilation failed
```bash
# Solution: Run locally first
cd frontend
npm run type-check
npm run build
```

**Error**: Missing environment variables
```bash
# Solution: Check Vercel dashboard
# Ensure all required vars are set
```

### Runtime Errors

**Error**: 500 Internal Server Error
```bash
# Check logs
vercel logs <deployment-url>

# Common causes:
# 1. Missing env vars
# 2. Supabase connection failed
# 3. API route error
```

**Error**: CORS issues
```bash
# Check next.config.ts headers
# Verify NEXT_PUBLIC_APP_URL is correct
```

### Deployment Issues

**Error**: Deployment stuck
```bash
# Cancel and retry
vercel --prod --force
```

**Error**: Domain not working
```bash
# Check DNS settings
# Wait for propagation (up to 48h)
```

---

## 🔄 Rollback Plan

If something goes wrong:

1. **Via Vercel Dashboard**
   ```
   Deployments → Previous Deployment → Promote to Production
   ```

2. **Via CLI**
   ```bash
   vercel rollback
   ```

3. **Via Git**
   ```bash
   git revert HEAD
   git push origin main
   ```

---

## 📊 Post-Deployment Monitoring

### Day 1 Checklist

- [ ] Check error rate in Vercel dashboard
- [ ] Monitor response times
- [ ] Verify all pages load
- [ ] Test critical user flows
- [ ] Check database connections
- [ ] Review logs for errors

### Week 1 Checklist

- [ ] Monitor user registrations
- [ ] Track feature usage
- [ ] Collect user feedback
- [ ] Review performance metrics
- [ ] Check error patterns
- [ ] Plan improvements

---

## 🎉 Success Criteria

Your deployment is successful when:

- ✅ Build completes without errors
- ✅ All pages load correctly
- ✅ Users can register/login
- ✅ CSV upload works
- ✅ Analysis completes
- ✅ No critical errors in logs
- ✅ Response times < 2s
- ✅ Mobile view works

---

## 📞 Need Help?

### Quick Links

- **Vercel Docs**: https://vercel.com/docs
- **Next.js Docs**: https://nextjs.org/docs
- **Supabase Docs**: https://supabase.com/docs
- **GitHub Issues**: https://github.com/hailp1/newncskit/issues

### Support Channels

- **Email**: support@ncskit.app
- **Discord**: [Your Server]
- **GitHub**: Open an issue

---

## 🚀 Ready to Deploy?

```bash
# Final check
cd frontend
npm run type-check && npm run build

# If successful, deploy!
vercel --prod

# Or push to GitHub (if auto-deploy enabled)
git push origin main
```

**Let's go live! 🎉**

---

**Last Updated**: 2025-11-09  
**Version**: 1.0.0  
**Status**: ✅ READY
