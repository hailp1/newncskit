# Rollback Procedures

**Document Version:** 1.0  
**Last Updated:** November 11, 2025  
**Related:** `CLEANUP_COMPLETED.md`

---

## Overview

This document provides step-by-step procedures to rollback changes made during the project cleanup. All removed code and files have been backed up to `.backup/` directory and can be restored if needed.

⚠️ **WARNING:** Rollback procedures should only be used if absolutely necessary. Always backup current state before rolling back.

---

## Table of Contents

1. [Quick Reference](#quick-reference)
2. [Full Rollback Procedures](#full-rollback-procedures)
   - [Rollback Django Backend](#1-rollback-django-backend)
   - [Rollback Supabase Configuration](#2-rollback-supabase-configuration)
   - [Rollback Supabase Code](#3-rollback-supabase-code)
   - [Rollback Legacy Documentation](#4-rollback-legacy-documentation)
   - [Rollback Security Fixes](#5-rollback-security-fixes)
   - [Rollback Documentation Structure](#6-rollback-documentation-structure)
   - [Rollback Dependency Updates](#7-rollback-dependency-updates)
3. [Partial Rollback Scenarios](#partial-rollback-scenarios)
4. [Post-Rollback Verification](#post-rollback-verification)
5. [Troubleshooting](#troubleshooting)

---

## Quick Reference

### Backup Locations

| Component | Backup Location | Date |
|-----------|----------------|------|
| Django Backend | `.backup/django-backend-20251111-192255/` | Nov 11, 2025 19:22 |
| Supabase Config | `.backup/supabase-config-20251111-192348/` | Nov 11, 2025 19:23 |
| Supabase Code | `.backup/supabase-code-20251111-192348/` | Nov 11, 2025 19:23 |
| Supabase Directory | `.backup/supabase-directory-20251111-193031/` | Nov 11, 2025 19:30 |
| Legacy Docs | `.backup/legacy-docs-20251111-192511/` | Nov 11, 2025 19:25 |

### Quick Restore Commands

```bash
# Restore Django Backend
cp -r .backup/django-backend-20251111-192255/backend ./

# Restore Supabase Configuration
cp -r .backup/supabase-config-20251111-192348/supabase ./

# Restore Supabase Code
cp -r .backup/supabase-code-20251111-192348/* ./frontend/src/

# Restore Legacy Documentation
cp -r .backup/legacy-docs-20251111-192511/* ./
```

---

## Full Rollback Procedures

### 1. Rollback Django Backend

**When to use:** If you need to restore Django backend functionality.

#### Prerequisites
- Backup exists at `.backup/django-backend-20251111-192255/`
- PostgreSQL database is running
- Python 3.x is installed

#### Steps

**Step 1: Restore Django Backend Directory**
```bash
# Navigate to project root
cd /path/to/ncskit

# Restore backend directory
cp -r .backup/django-backend-20251111-192255/backend ./

# Verify restoration
ls -la backend/
```

**Step 2: Restore Django Environment Variables**
```bash
# Edit .env.production or create .env for Django
# Add Django-specific variables:
# - DATABASE_URL (for Django)
# - SECRET_KEY
# - DEBUG=False
# - ALLOWED_HOSTS
```

**Step 3: Install Django Dependencies**
```bash
cd backend
pip install -r requirements.txt
```

**Step 4: Run Django Migrations**
```bash
python manage.py migrate
```

**Step 5: Start Django Server**
```bash
# Development
python manage.py runserver 0.0.0.0:8001

# Production (with gunicorn)
gunicorn config.wsgi:application --bind 0.0.0.0:8001
```

**Step 6: Update Frontend API Client**
```bash
# Edit frontend/src/services/api-client.ts
# Uncomment or add:
# const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8001'
```

**Step 7: Verify Django Backend**
```bash
# Test Django health endpoint
curl http://localhost:8001/api/health/

# Test Django admin
# Navigate to http://localhost:8001/admin/
```

#### Verification Checklist
- [ ] Django server starts without errors
- [ ] Database migrations applied successfully
- [ ] Admin interface accessible
- [ ] API endpoints responding
- [ ] Frontend can connect to Django backend

---

### 2. Rollback Supabase Configuration

**When to use:** If you need to restore Supabase project configuration.

#### Prerequisites
- Backup exists at `.backup/supabase-config-20251111-192348/`
- Supabase CLI installed (`npm install -g supabase`)
- Supabase project exists

#### Steps

**Step 1: Restore Supabase Directory**
```bash
# Navigate to project root
cd /path/to/ncskit

# Restore supabase directory
cp -r .backup/supabase-config-20251111-192348/supabase ./

# Verify restoration
ls -la supabase/
```

**Step 2: Restore Supabase Environment Variables**
```bash
# Edit frontend/.env.local
# Add Supabase variables:
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

**Step 3: Link to Supabase Project**
```bash
cd supabase
supabase link --project-ref your-project-ref
```

**Step 4: Apply Supabase Migrations**
```bash
supabase db push
```

**Step 5: Start Supabase Locally (Optional)**
```bash
supabase start
```

#### Verification Checklist
- [ ] Supabase directory restored
- [ ] Environment variables configured
- [ ] Supabase project linked
- [ ] Migrations applied successfully
- [ ] Supabase services accessible

---

### 3. Rollback Supabase Code

**When to use:** If you need to restore Supabase client code in the application.

#### Prerequisites
- Backup exists at `.backup/supabase-code-20251111-192348/`
- Supabase configuration restored (see above)
- Supabase packages installed

#### Steps

**Step 1: Install Supabase Packages**
```bash
cd frontend
npm install @supabase/supabase-js @supabase/auth-helpers-nextjs
```

**Step 2: Restore Supabase Library Files**
```bash
# Navigate to project root
cd /path/to/ncskit

# Restore Supabase client files
mkdir -p frontend/src/lib/supabase
cp .backup/supabase-code-20251111-192348/lib/supabase/* frontend/src/lib/supabase/

# Verify restoration
ls -la frontend/src/lib/supabase/
```

**Step 3: Restore Supabase Type Definitions**
```bash
# Restore type files
cp .backup/supabase-code-20251111-192348/types/supabase*.ts frontend/src/types/

# Verify restoration
ls -la frontend/src/types/supabase*.ts
```

**Step 4: Restore Supabase Store Files**
```bash
# Restore auth store backup
cp .backup/supabase-code-20251111-192348/store/auth-supabase.backup.ts frontend/src/store/

# Verify restoration
ls -la frontend/src/store/auth-supabase.backup.ts
```

**Step 5: Update Service Files**

You'll need to manually update service files to use Supabase instead of Prisma:

```typescript
// Example: frontend/src/services/user.service.ts
// Change from:
import { prisma } from '@/lib/prisma'

// Back to:
import { createClient } from '@/lib/supabase/client'
const supabase = createClient()
```

**Step 6: Update Type Exports**
```bash
# Edit frontend/src/types/index.ts
# Add back Supabase type exports
```

**Step 7: Regenerate Supabase Types**
```bash
cd frontend
npx supabase gen types typescript --project-id your-project-id > src/types/supabase.ts
```

#### Verification Checklist
- [ ] Supabase packages installed
- [ ] Supabase client files restored
- [ ] Type definitions restored
- [ ] Service files updated
- [ ] No TypeScript errors
- [ ] Application builds successfully

---

### 4. Rollback Legacy Documentation

**When to use:** If you need to restore old documentation files.

#### Prerequisites
- Backup exists at `.backup/legacy-docs-20251111-192511/`

#### Steps

**Step 1: Restore All Legacy Documentation**
```bash
# Navigate to project root
cd /path/to/ncskit

# Restore all legacy docs
cp -r .backup/legacy-docs-20251111-192511/* ./

# Verify restoration
ls -la *.md
```

**Step 2: Restore Specific Documentation Categories (Optional)**

If you only need specific categories:

```bash
# Restore only admin fix guides
cp .backup/legacy-docs-20251111-192511/ADMIN_FIX_*.md ./

# Restore only status reports
cp .backup/legacy-docs-20251111-192511/CURRENT_STATUS*.md ./

# Restore only summaries
cp .backup/legacy-docs-20251111-192511/*_SUMMARY.md ./
```

**Step 3: Restore Cleanup Scripts**
```bash
# Restore PowerShell script
cp .backup/legacy-docs-20251111-192511/cleanup-legacy.ps1 ./

# Restore Bash script
cp .backup/legacy-docs-20251111-192511/cleanup-legacy.sh ./
```

**Step 4: Restore SQL Scripts**
```bash
# Restore SQL scripts
cp .backup/legacy-docs-20251111-192511/*.sql ./
```

#### Verification Checklist
- [ ] Documentation files restored
- [ ] Scripts restored (if needed)
- [ ] SQL files restored (if needed)
- [ ] Files are readable

---

### 5. Rollback Security Fixes

**When to use:** If security fixes cause issues (NOT RECOMMENDED).

⚠️ **WARNING:** Rolling back security fixes will re-introduce security vulnerabilities. Only do this in a development environment for debugging purposes.

#### Steps

**Step 1: Restore Hardcoded Gemini API Key (NOT RECOMMENDED)**

```bash
# Edit frontend/src/services/gemini.ts
# Change from:
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY

# Back to (from backup):
# const GEMINI_API_KEY = 'your-api-key-here'
```

**Step 2: Restore Supabase Credentials in .env Files**

```bash
# Edit frontend/.env.local
# Add back Supabase credentials:
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

**Step 3: Remove Environment Variable Validation**

```bash
# Edit frontend/src/services/gemini.ts
# Remove or comment out:
# if (!GEMINI_API_KEY) {
#   throw new Error('GEMINI_API_KEY environment variable is required')
# }
```

⚠️ **IMPORTANT:** After debugging, immediately re-apply security fixes!

---

### 6. Rollback Documentation Structure

**When to use:** If new documentation structure causes issues.

#### Steps

**Step 1: Remove New Documentation Structure**
```bash
# Navigate to project root
cd /path/to/ncskit

# Remove docs directory
rm -rf docs/
```

**Step 2: Restore Legacy Documentation**
```bash
# Restore all legacy docs (see section 4)
cp -r .backup/legacy-docs-20251111-192511/* ./
```

**Step 3: Restore Original README**
```bash
# If you have a backup of the original README
cp .backup/README.md.backup ./README.md
```

#### Verification Checklist
- [ ] docs/ directory removed
- [ ] Legacy documentation restored
- [ ] README restored (if needed)

---

### 7. Rollback Dependency Updates

**When to use:** If updated dependencies cause breaking changes.

#### Steps

**Step 1: Check Current Package Versions**
```bash
cd frontend
npm list vitest @vitest/coverage-v8 @vitest/ui
```

**Step 2: Restore Previous Package Versions**

Edit `frontend/package.json` and change versions back:

```json
{
  "devDependencies": {
    "vitest": "^3.x.x",  // Change back from 4.0.8
    "@vitest/coverage-v8": "^3.x.x",  // Change back from 4.0.8
    "@vitest/ui": "^3.x.x"  // Change back from 4.0.8
  }
}
```

**Step 3: Reinstall Dependencies**
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
```

**Step 4: Verify Tests Still Work**
```bash
npm run test
```

#### Verification Checklist
- [ ] Package versions rolled back
- [ ] Dependencies installed successfully
- [ ] Tests run without errors
- [ ] Build process works

---

## Partial Rollback Scenarios

### Scenario 1: Restore Only Django Backend

If you only need Django backend without affecting other changes:

```bash
# Restore Django backend
cp -r .backup/django-backend-20251111-192255/backend ./

# Install dependencies
cd backend
pip install -r requirements.txt

# Run migrations
python manage.py migrate

# Start server
python manage.py runserver 0.0.0.0:8001
```

### Scenario 2: Restore Only Supabase Client

If you only need Supabase client code:

```bash
# Install Supabase packages
cd frontend
npm install @supabase/supabase-js @supabase/auth-helpers-nextjs

# Restore Supabase files
cp -r .backup/supabase-code-20251111-192348/lib/supabase frontend/src/lib/
cp .backup/supabase-code-20251111-192348/types/supabase*.ts frontend/src/types/

# Restore environment variables
# Edit frontend/.env.local and add Supabase credentials
```

### Scenario 3: Restore Specific Documentation

If you only need specific documentation files:

```bash
# Restore specific admin guide
cp .backup/legacy-docs-20251111-192511/ADMIN_FIX_SPECIFIC.md ./

# Or restore all admin guides
cp .backup/legacy-docs-20251111-192511/ADMIN_FIX_*.md ./
```

---

## Post-Rollback Verification

After any rollback, perform these verification steps:

### 1. Check File Restoration
```bash
# Verify files exist
ls -la [restored-directory]

# Check file contents
cat [restored-file]
```

### 2. Install Dependencies
```bash
# Frontend
cd frontend
npm install

# Backend (if restored)
cd backend
pip install -r requirements.txt
```

### 3. Run Type Checking
```bash
cd frontend
npm run type-check
```

### 4. Run Build
```bash
cd frontend
npm run build
```

### 5. Run Tests
```bash
cd frontend
npm run test
```

### 6. Start Development Server
```bash
cd frontend
npm run dev
```

### 7. Manual Testing
- [ ] Application loads without errors
- [ ] Authentication works
- [ ] Core features work
- [ ] No console errors
- [ ] Database operations work

---

## Troubleshooting

### Issue: Files Not Restoring

**Problem:** `cp` command fails or files not appearing

**Solutions:**
1. Check backup directory exists:
   ```bash
   ls -la .backup/
   ```

2. Use absolute paths:
   ```bash
   cp -r /full/path/to/.backup/component/* /full/path/to/destination/
   ```

3. Check permissions:
   ```bash
   chmod -R 755 .backup/
   ```

### Issue: Dependencies Not Installing

**Problem:** `npm install` or `pip install` fails

**Solutions:**
1. Clear caches:
   ```bash
   # npm
   npm cache clean --force
   rm -rf node_modules package-lock.json
   npm install

   # pip
   pip cache purge
   pip install -r requirements.txt
   ```

2. Check Node/Python versions:
   ```bash
   node --version  # Should be 18.x or higher
   python --version  # Should be 3.8 or higher
   ```

### Issue: Database Errors After Rollback

**Problem:** Database schema mismatch or migration errors

**Solutions:**
1. Reset database (development only):
   ```bash
   # Prisma
   npx prisma migrate reset

   # Django
   python manage.py migrate --fake-initial
   ```

2. Check database connection:
   ```bash
   psql -U postgres -d ncskit
   ```

3. Restore database from backup:
   ```bash
   psql -U postgres -d ncskit < backup.sql
   ```

### Issue: TypeScript Errors After Rollback

**Problem:** Type errors or missing imports

**Solutions:**
1. Regenerate Prisma client:
   ```bash
   npm run db:generate
   ```

2. Restart TypeScript server:
   - VS Code: Ctrl+Shift+P → "TypeScript: Restart TS Server"

3. Clear TypeScript cache:
   ```bash
   rm -rf .next
   rm -rf node_modules/.cache
   ```

### Issue: Environment Variables Not Working

**Problem:** Application can't find environment variables

**Solutions:**
1. Verify file name and location:
   ```bash
   ls -la frontend/.env.local
   ```

2. Check file format (no spaces around =):
   ```env
   DATABASE_URL=postgresql://...  # ✅ Good
   DATABASE_URL = postgresql://...  # ❌ Bad
   ```

3. Restart development server:
   ```bash
   # Stop server (Ctrl+C)
   npm run dev
   ```

---

## Emergency Full Rollback

If everything is broken and you need to restore to pre-cleanup state:

```bash
# 1. Stop all running processes
# Press Ctrl+C in all terminals

# 2. Navigate to project root
cd /path/to/ncskit

# 3. Restore all components
cp -r .backup/django-backend-20251111-192255/backend ./
cp -r .backup/supabase-config-20251111-192348/supabase ./
cp -r .backup/supabase-code-20251111-192348/* ./frontend/src/
cp -r .backup/legacy-docs-20251111-192511/* ./

# 4. Restore environment variables
# Edit frontend/.env.local and add all Supabase credentials

# 5. Reinstall all dependencies
cd frontend
rm -rf node_modules package-lock.json
npm install

cd ../backend
pip install -r requirements.txt

# 6. Reset database
cd ../frontend
npx prisma migrate reset

# 7. Start services
# Terminal 1: Django backend
cd backend
python manage.py runserver 0.0.0.0:8001

# Terminal 2: Frontend
cd frontend
npm run dev

# Terminal 3: R service
cd r-analytics
docker-compose up

# 8. Verify everything works
# - Test authentication
# - Test core features
# - Check for errors
```

---

## Best Practices

### Before Rolling Back
1. ✅ Backup current state before rollback
2. ✅ Document why you're rolling back
3. ✅ Test in development environment first
4. ✅ Notify team members

### During Rollback
1. ✅ Follow steps in order
2. ✅ Verify each step before proceeding
3. ✅ Document any issues encountered
4. ✅ Keep terminal output for debugging

### After Rollback
1. ✅ Run full test suite
2. ✅ Verify all features work
3. ✅ Document what was rolled back
4. ✅ Plan how to fix the original issue

---

## Support

If you encounter issues during rollback:

1. **Check this document** for troubleshooting steps
2. **Review logs** for error messages
3. **Check backup integrity**:
   ```bash
   ls -la .backup/
   du -sh .backup/*
   ```
4. **Verify backup contents**:
   ```bash
   ls -la .backup/[component]/
   ```

---

## Related Documentation

- **Cleanup Summary:** `CLEANUP_COMPLETED.md`
- **Known Issues:** `KNOWN_ISSUES.md`
- **Security Audit:** `SECURITY_AUDIT_REPORT.md`
- **Setup Guide:** `docs/setup/local-setup.md`

---

**Document Version:** 1.0  
**Last Updated:** November 11, 2025  
**Maintained By:** Development Team  
**Next Review:** December 11, 2025
