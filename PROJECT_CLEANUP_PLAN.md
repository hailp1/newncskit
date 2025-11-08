# Project Cleanup & Optimization Plan

**Date:** November 8, 2025  
**Status:** Ready for Execution  
**Goal:** Clean project, fix errors, optimize Docker/Vercel/Supabase

---

## 🗑️ Files to Delete (Obsolete/Duplicate)

### Root Directory - Test & Debug Files (DELETE)
```
❌ debug-login-issues.js
❌ test-complete-login.js
❌ test-linkedin-oauth.js
❌ test-login-fix.js
❌ test-oauth-simple.ps1
❌ update-oauth-simple.ps1
❌ fix-analytics-security.py
❌ fix-rate-limiting.py
❌ fix-test-endpoints.py
❌ verify-security-fixes.py
```

### Root Directory - Old Deployment Scripts (DELETE)
```
❌ DEPLOY_FINAL_RELEASE.bat
❌ deploy-to-vercel.ps1
❌ deploy-vercel.bat
❌ launch-ncskit-org.bat
❌ setup-ncskit-org.bat
```

### Root Directory - Completed Status Files (DELETE)
```
❌ CREATE_ADMIN_SUMMARY.md
❌ CRITICAL_SECURITY_FIXES_COMPLETED.md
❌ FINAL_CLEANUP_STATUS.md
❌ FRONTEND_MIGRATION_COMPLETE.md
❌ PROJECT_CLEANUP_SUMMARY.md
❌ SINGLE_PAGE_AUTH_COMPLETED.md
❌ TASK_3.4_COMPLETED.md
❌ TASK_3.5_COMPLETED.md
❌ UX_IMPROVEMENTS_COMPLETED.md
```

### Root Directory - Cloudflare Tunnel (DELETE if not using)
```
❌ cf-tunnel.exe
❌ cloudflared.log
```

### Deployment Directory - Duplicate Scripts (DELETE)
```
❌ deployment/add-env-vars.ps1
❌ deployment/add-remaining-env.ps1
❌ deployment/add-sensitive-env.ps1
❌ deployment/add-skip-validation.ps1
❌ deployment/add-vercel-env.ps1
❌ deployment/deploy-now.ps1
❌ deployment/deploy-to-vercel.ps1
❌ deployment/deploy-to-vercel.sh
❌ deployment/deploy.bat
❌ deployment/quick-deploy.ps1
❌ deployment/setup-cloudflare-tunnel.bat
❌ deployment/setup-vercel.ps1
❌ deployment/setup-vercel.sh
❌ deployment/start-ncskit-production.bat
❌ deployment/start-tunnel.bat
❌ deployment/test-live-urls.bat
❌ deployment/test-production.ps1
❌ deployment/test-supabase-connection.ps1
❌ deployment/verify-vercel-setup.ps1
```

### Deployment Directory - Status Files (DELETE)
```
❌ deployment/CHECK_DOCKER_TUNNEL_STATUS.md
❌ deployment/DEPLOYMENT_SUCCESS.md
❌ deployment/DOCKER_INTEGRATION_STATUS.md
❌ deployment/DOCKER_WORKAROUND.md
❌ deployment/FINAL_DOCKER_SUMMARY.md
❌ deployment/FINAL_FIXES_BEFORE_RELEASE.md
❌ deployment/FINAL_PRE_RELEASE_CHECKLIST.md
❌ deployment/FIXES_APPLIED_SUMMARY.md
❌ deployment/PRE_DEPLOYMENT_FIXES.md
❌ deployment/PRODUCTION_DEPLOYMENT_SUCCESS.md
❌ deployment/SUPABASE_VERCEL_CONNECTION_CHECKLIST.md
❌ deployment/TASK_10_DEPLOYMENT_STATUS.md
```

### R-Analytics - Duplicate Dockerfiles (DELETE)
```
❌ r-analytics/Dockerfile.debug
❌ r-analytics/Dockerfile.fixed
❌ r-analytics/Dockerfile.minimal
❌ r-analytics/Dockerfile.simple
❌ r-analytics/Dockerfile.workaround
```

### R-Analytics - Status Files (DELETE)
```
❌ r-analytics/FINAL_FIX_SUMMARY.md
❌ r-analytics/IMPLEMENTATION_SUMMARY.md
❌ r-analytics/REBUILD_CHECKLIST.md
❌ r-analytics/SUCCESS_REPORT.md
```

### Frontend - Cleanup Files (DELETE)
```
❌ frontend/CLEANUP_COMPLETE.md
❌ frontend/cleanup-dependencies.ps1
❌ frontend/HEALTH_MONITORING_IMPLEMENTATION.md
❌ frontend/REMOVED_DEPENDENCIES.md
❌ frontend/SUPABASE_AUTH_IMPLEMENTATION.md
```

### Supabase - Duplicate Setup Files (DELETE)
```
❌ supabase/CREATE_ADMIN_USER.md
❌ supabase/OAUTH_SETUP_GUIDE.md
❌ supabase/QUICK_SETUP.md
❌ supabase/QUICK_START.md
❌ supabase/SETUP_GUIDE.md
❌ supabase/UPDATE_OAUTH_REDIRECT.md
```

### Backend - Old Files (CHECK & DELETE if unused)
```
⚠️ backend/rate_limiting_config.py
⚠️ backend/gunicorn.conf.py
```

---

## 📁 Files to Keep (Essential)

### Root Directory - Keep
```
✅ .gitignore
✅ .env.production
✅ LICENSE
✅ README.md
✅ package.json
✅ package-lock.json
✅ Dockerfile (if using)
✅ CONTRIBUTING.md
✅ DEVELOPMENT_GUIDE.md
✅ RELEASE_CHECKLIST.md
✅ SUPABASE_DATABASE_SETUP.md
✅ CSV_ANALYSIS_AUDIT_REPORT.md
✅ DEPLOY_SUCCESS.md
✅ VARIABLE_GROUPING_DEBUG_GUIDE.md
✅ VARIABLE_GROUPING_FIXES_APPLIED.md
✅ VERCEL_DEPLOY_GUIDE.md
✅ VERCEL_ENV_SETUP.md
✅ deploy-vercel.ps1 (latest version)
```

### Deployment Directory - Keep
```
✅ deployment/build-and-start-docker.ps1
✅ deployment/complete-docker-integration.ps1
✅ deployment/DEPLOY_CSV_ANALYSIS.md
✅ deployment/DEPLOYMENT_GUIDE.md
✅ deployment/DOCKER_R_ANALYTICS_EXPLAINED.md
✅ deployment/HUONG_DAN_KET_NOI_DOCKER.md
✅ deployment/vercel-setup.md
```

### R-Analytics - Keep
```
✅ r-analytics/Dockerfile (main one)
✅ r-analytics/docker-compose.yml
✅ r-analytics/api.R
✅ r-analytics/README.md
✅ r-analytics/build.ps1
✅ r-analytics/start.ps1
✅ r-analytics/stop.ps1
✅ r-analytics/test-endpoints.ps1
✅ r-analytics/endpoints/
✅ r-analytics/modules/
```

### Supabase - Keep
```
✅ supabase/migrations/
✅ supabase/storage/
✅ supabase/DATABASE_ARCHITECTURE.md
✅ supabase/README.md
✅ supabase/00-complete-setup.sql
✅ supabase/01-schema.sql
✅ supabase/02-rls-policies.sql
✅ supabase/03-storage.sql
✅ supabase/04-functions.sql
✅ supabase/create-admin-user.sql
✅ supabase/seed-blog-posts.sql
```

---

## 🔧 Critical Fixes Needed

### 1. Docker R-Analytics

**Issues:**
- Multiple Dockerfile versions causing confusion
- Logs directory might have old logs

**Fixes:**
```bash
# Keep only main Dockerfile
# Delete: Dockerfile.debug, .fixed, .minimal, .simple, .workaround

# Clean logs
rm -rf r-analytics/logs/*
echo "*.log" > r-analytics/logs/.gitignore
```

### 2. Vercel Configuration

**Issues:**
- Environment variables might be incomplete
- Build configuration needs verification

**Fixes:**
```typescript
// Verify vercel.json has correct settings
{
  "buildCommand": "SKIP_TYPE_CHECK=true SKIP_ENV_VALIDATION=true npm run build",
  "framework": "nextjs",
  "regions": ["iad1"]
}

// Verify all env vars are set in Vercel dashboard
```

### 3. Supabase Connection

**Issues:**
- Multiple setup guides causing confusion
- Need to verify RLS policies

**Fixes:**
```sql
-- Verify RLS is enabled on all tables
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';

-- Should all show rowsecurity = true
```

### 4. Frontend Build

**Issues:**
- TypeScript errors in some files
- Unused dependencies

**Fixes:**
```bash
# Run type check
cd frontend
npm run type-check

# Check for unused dependencies
npx depcheck

# Update dependencies
npm audit fix
```

---

## 📋 Cleanup Execution Plan

### Phase 1: Backup (5 minutes)
```bash
# Create backup branch
git checkout -b backup-before-cleanup
git push origin backup-before-cleanup

# Return to main
git checkout main
```

### Phase 2: Delete Obsolete Files (10 minutes)
```bash
# Root directory
rm debug-login-issues.js test-*.js test-*.ps1 update-*.ps1 fix-*.py verify-*.py
rm DEPLOY_FINAL_RELEASE.bat deploy-to-vercel.ps1 deploy-vercel.bat
rm launch-ncskit-org.bat setup-ncskit-org.bat
rm CREATE_ADMIN_SUMMARY.md CRITICAL_SECURITY_FIXES_COMPLETED.md
rm FINAL_CLEANUP_STATUS.md FRONTEND_MIGRATION_COMPLETE.md
rm PROJECT_CLEANUP_SUMMARY.md SINGLE_PAGE_AUTH_COMPLETED.md
rm TASK_3.4_COMPLETED.md TASK_3.5_COMPLETED.md UX_IMPROVEMENTS_COMPLETED.md
rm cf-tunnel.exe cloudflared.log

# Deployment directory
cd deployment
rm add-*.ps1 deploy-*.ps1 deploy-*.sh deploy.bat quick-deploy.ps1
rm setup-*.ps1 setup-*.sh setup-*.bat start-*.bat test-*.ps1 test-*.bat
rm verify-*.ps1
rm CHECK_DOCKER_TUNNEL_STATUS.md DEPLOYMENT_SUCCESS.md
rm DOCKER_INTEGRATION_STATUS.md DOCKER_WORKAROUND.md
rm FINAL_DOCKER_SUMMARY.md FINAL_FIXES_BEFORE_RELEASE.md
rm FINAL_PRE_RELEASE_CHECKLIST.md FIXES_APPLIED_SUMMARY.md
rm PRE_DEPLOYMENT_FIXES.md PRODUCTION_DEPLOYMENT_SUCCESS.md
rm SUPABASE_VERCEL_CONNECTION_CHECKLIST.md TASK_10_DEPLOYMENT_STATUS.md
cd ..

# R-Analytics
cd r-analytics
rm Dockerfile.debug Dockerfile.fixed Dockerfile.minimal
rm Dockerfile.simple Dockerfile.workaround
rm FINAL_FIX_SUMMARY.md IMPLEMENTATION_SUMMARY.md
rm REBUILD_CHECKLIST.md SUCCESS_REPORT.md
cd ..

# Frontend
cd frontend
rm CLEANUP_COMPLETE.md cleanup-dependencies.ps1
rm HEALTH_MONITORING_IMPLEMENTATION.md REMOVED_DEPENDENCIES.md
rm SUPABASE_AUTH_IMPLEMENTATION.md
cd ..

# Supabase
cd supabase
rm CREATE_ADMIN_USER.md OAUTH_SETUP_GUIDE.md
rm QUICK_SETUP.md QUICK_START.md SETUP_GUIDE.md
rm UPDATE_OAUTH_REDIRECT.md
cd ..
```

### Phase 3: Fix TypeScript Errors (15 minutes)
```bash
cd frontend
npm run type-check 2>&1 | tee type-errors.log
# Fix any errors found
```

### Phase 4: Verify Services (10 minutes)
```bash
# Test R Analytics
cd r-analytics
docker-compose up -d
curl http://localhost:8000/health
docker-compose down
cd ..

# Test Frontend Build
cd frontend
npm run build
cd ..
```

### Phase 5: Update Documentation (10 minutes)
```bash
# Create single source of truth docs
# Keep only essential guides
```

### Phase 6: Commit & Push (5 minutes)
```bash
git add .
git commit -m "chore: Major cleanup - remove obsolete files, fix errors, optimize structure"
git push origin main
```

---

## ✅ Post-Cleanup Verification

### Check Docker R-Analytics
```bash
cd r-analytics
docker-compose up -d
curl http://localhost:8000/health
# Should return: {"status": "healthy"}
```

### Check Vercel Build
```bash
cd frontend
npm run build
# Should complete without errors
```

### Check Supabase Connection
```bash
# Test from frontend
curl https://your-project.supabase.co/rest/v1/
# Should return API info
```

### Check Git Status
```bash
git status
# Should be clean
```

---

## 📊 Expected Results

### Before Cleanup
- **Total Files:** ~500+
- **Obsolete Files:** ~80
- **Documentation Files:** ~50
- **Build Errors:** Multiple TypeScript errors
- **Disk Space:** ~2GB

### After Cleanup
- **Total Files:** ~420
- **Obsolete Files:** 0
- **Documentation Files:** ~15 (essential only)
- **Build Errors:** 0
- **Disk Space:** ~1.5GB (25% reduction)

---

## 🚨 Rollback Plan

If issues occur:

```bash
# Restore from backup branch
git checkout backup-before-cleanup
git checkout -b main-restored
git push origin main-restored --force

# Or revert specific commit
git revert <commit-hash>
git push origin main
```

---

## 📝 Final Structure

```
newncskit/
├── .kiro/                    # Kiro specs
├── backend/                  # Django backend (if used)
├── config/                   # Configuration files
├── deployment/               # Essential deployment scripts only
│   ├── build-and-start-docker.ps1
│   ├── complete-docker-integration.ps1
│   ├── DEPLOYMENT_GUIDE.md
│   └── DOCKER_R_ANALYTICS_EXPLAINED.md
├── docs/                     # Essential documentation
│   ├── API_DOCUMENTATION.md
│   ├── DEVELOPER_GUIDE.md
│   └── USER_GUIDE.md
├── frontend/                 # Next.js frontend
│   ├── src/
│   ├── public/
│   ├── package.json
│   ├── next.config.ts
│   └── vercel.json
├── r-analytics/              # R Analytics service
│   ├── endpoints/
│   ├── modules/
│   ├── Dockerfile
│   ├── docker-compose.yml
│   └── api.R
├── scripts/                  # Utility scripts
├── supabase/                 # Database setup
│   ├── migrations/
│   ├── storage/
│   └── *.sql files
├── .gitignore
├── README.md
├── LICENSE
└── package.json
```

---

**Status:** Ready to execute  
**Estimated Time:** 1 hour  
**Risk Level:** Low (backup created first)  
**Impact:** High (cleaner, faster, more maintainable)
