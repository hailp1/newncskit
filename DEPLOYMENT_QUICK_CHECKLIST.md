# 🚀 Deployment Quick Checklist - NCSKIT to Vercel

**Status:** ✅ READY FOR DEPLOYMENT  
**Estimated Time:** 15-30 minutes

---

## Pre-Deployment (5 minutes)

### 1. Verify Database ✅
- [x] Migrations run successfully
- [x] Admin user created
- [x] RLS policies active
- [x] Helper functions working

**Command to verify:**
```sql
-- In Supabase SQL Editor
SELECT COUNT(*) FROM public.profiles;
SELECT COUNT(*) FROM public.permissions;
SELECT public.is_admin(auth.uid());
```

### 2. Get Supabase Credentials
- [ ] Copy `NEXT_PUBLIC_SUPABASE_URL` from Supabase Dashboard
- [ ] Copy `NEXT_PUBLIC_SUPABASE_ANON_KEY` from Supabase Dashboard
- [ ] Copy `SUPABASE_SERVICE_ROLE_KEY` from Supabase Dashboard (⚠️ Keep secret!)

**Where to find:**
Supabase Dashboard → Settings → API

---

## Vercel Configuration (10 minutes)

### 3. Configure Environment Variables in Vercel

Go to: Vercel Dashboard → Your Project → Settings → Environment Variables

#### Required Variables (Must Set):
```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://hfczndbrexnaoczxmopn.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[paste from Supabase]
SUPABASE_SERVICE_ROLE_KEY=[paste from Supabase - KEEP SECRET]

# App
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
NODE_ENV=production
```

#### Optional Variables (Can Set Later):
```bash
# Analytics (if R service is ready)
NEXT_PUBLIC_ANALYTICS_URL=https://analytics.ncskit.app
ANALYTICS_API_KEY=[generate strong key]

# Monitoring (optional)
SENTRY_DSN=[if using Sentry]
SLACK_WEBHOOK_URL=[if using Slack alerts]
```

**Important:** 
- Set environment for: Production, Preview, Development
- Click "Save" after each variable

---

## Deploy (5 minutes)

### 4. Deploy to Vercel

#### Option A: Vercel CLI (Recommended)
```bash
# Install Vercel CLI (if not installed)
npm i -g vercel

# Login
vercel login

# Deploy to production
vercel --prod
```

#### Option B: GitHub Integration
1. Push code to GitHub main branch
2. Vercel will auto-deploy
3. Wait for build to complete

#### Option C: Vercel Dashboard
1. Go to Vercel Dashboard
2. Click "Deploy" button
3. Select branch: main
4. Click "Deploy"

---

## Post-Deployment Verification (10 minutes)

### 5. Immediate Checks (First 5 minutes)

- [ ] **Site loads:** Visit https://your-app.vercel.app
- [ ] **No build errors:** Check Vercel deployment logs
- [ ] **Login works:** Try logging in with test account
- [ ] **Admin access:** Visit /admin/users (if admin)
- [ ] **No console errors:** Open browser DevTools

### 6. Functional Tests (Next 5 minutes)

- [ ] **User Registration:** Create new account
- [ ] **User Login:** Login with credentials
- [ ] **Profile Page:** View and edit profile
- [ ] **Settings Page:** Update settings
- [ ] **Admin Features:** (if admin)
  - [ ] View users list
  - [ ] Update user role
  - [ ] Manage permissions

### 7. Monitor Logs

```bash
# Watch Vercel logs
vercel logs --follow

# Or in Vercel Dashboard:
# Your Project → Deployments → [Latest] → Logs
```

---

## Quick Troubleshooting

### Issue: "Supabase connection failed"
**Fix:** Check environment variables in Vercel
```bash
# Verify in Vercel Dashboard:
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
```

### Issue: "Admin features not working"
**Fix:** Check service role key
```bash
# Verify in Vercel Dashboard:
SUPABASE_SERVICE_ROLE_KEY
```

### Issue: "Build failed"
**Fix:** Check build logs in Vercel
```bash
# Common fixes:
1. Clear build cache in Vercel
2. Redeploy
3. Check for TypeScript errors
```

### Issue: "Analytics not working"
**Fix:** This is expected if R service not deployed yet
```bash
# Analytics is optional for initial deployment
# Can be configured later
```

---

## Success Criteria ✅

Your deployment is successful if:

- ✅ Site loads without errors
- ✅ Users can register and login
- ✅ Profile pages work
- ✅ Admin can access admin pages
- ✅ No critical errors in logs
- ✅ Database operations work

---

## Rollback Plan (If Needed)

### Quick Rollback
```bash
# Option 1: Vercel CLI
vercel rollback

# Option 2: Vercel Dashboard
# Deployments → Previous Deployment → Promote to Production
```

### Database Rollback (If Needed)
```sql
-- See: supabase/migrations/README_ADMIN_SYSTEM_MIGRATION.md
-- Section: Rollback Plan
```

---

## Post-Deployment Tasks (Can Do Later)

### Within 24 Hours:
- [ ] Monitor error logs
- [ ] Check performance metrics
- [ ] Verify all features work
- [ ] Test on mobile devices

### Within 1 Week:
- [ ] Set up Sentry for error tracking
- [ ] Configure Slack alerts
- [ ] Deploy R Analytics service
- [ ] Set up email notifications

### Within 1 Month:
- [ ] Performance optimization
- [ ] Security audit
- [ ] User feedback collection
- [ ] Plan next features

---

## Quick Commands Reference

```bash
# Deploy to production
vercel --prod

# Check deployment status
vercel ls

# View logs
vercel logs

# Rollback
vercel rollback

# Open deployment in browser
vercel open
```

---

## Support

### Documentation:
- Full Audit Report: `PRE_RELEASE_AUDIT_REPORT.md`
- Vercel Guide: `VERCEL_DEPLOYMENT_CHECKLIST.md`
- Database Guide: `supabase/migrations/README_ADMIN_SYSTEM_MIGRATION.md`

### Contacts:
- Support: support@ncskit.com
- Emergency: [Your contact]

---

## Deployment Status

- [ ] Pre-deployment checks complete
- [ ] Environment variables configured
- [ ] Deployed to Vercel
- [ ] Post-deployment verification complete
- [ ] Monitoring active

**Deployed by:** _______________  
**Date:** _______________  
**Deployment URL:** _______________  
**Status:** ☐ Success ☐ Issues ☐ Rolled Back

---

**🎉 Good luck with your deployment!**

Remember: You can always rollback if needed. The database migration is already complete and tested.
