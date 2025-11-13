# Known Issues and Solutions

**Last Updated:** November 11, 2025  
**Status:** Active - Post Cleanup

---

## 🔴 HIGH PRIORITY ISSUES

### 1. xlsx Package Vulnerability ⚠️

**Status:** KNOWN - NO FIX AVAILABLE  
**Severity:** HIGH  
**Impact:** Potential security risk in Excel export functionality

#### Issue
The `xlsx` package has known vulnerabilities:
- Prototype Pollution (GHSA-4r6h-8v6p-xvw6)
- Regular Expression Denial of Service (ReDoS) (GHSA-5pgg-2g8v-p4x9)

#### Root Cause
Package maintainer has not released a fix for these vulnerabilities.

#### Workaround
- Risk is documented and accepted for current version
- Excel export functionality still works
- Vulnerability only exploitable in specific scenarios

#### Permanent Solution
Replace `xlsx` with safer alternative like `exceljs`:
```bash
npm uninstall xlsx
npm install exceljs
```

**Documentation:** See `frontend/docs/xlsx-replacement-evaluation.md`  
**Timeline:** Planned for next sprint  
**Tracking:** Follow-up task in `CLEANUP_COMPLETED.md`

---

## 🟡 MEDIUM PRIORITY ISSUES

### 2. Remaining Supabase References 📝

**Status:** KNOWN - INCREMENTAL CLEANUP  
**Severity:** MEDIUM  
**Impact:** Code cleanliness, potential confusion

#### Issue
Some service files still contain Supabase references (commented out or in unused code paths).

#### Files Affected
See `SUPABASE_REFACTOR_TODO.md` for complete list of files requiring refactoring.

#### Solution
Continue incremental refactoring as files are touched during development.

**Timeline:** Ongoing  
**Priority:** Clean up when working on related features

### 3. Storage Solution for Production 📦

**Status:** KNOWN - PLANNING REQUIRED  
**Severity:** MEDIUM  
**Impact:** File uploads in production

#### Issue
Currently using local filesystem for file uploads. This won't work in serverless/production environments.

#### Options
1. **Vercel Blob Storage** (Recommended for Vercel deployment)
2. **AWS S3** (Most flexible, widely supported)
3. **Cloudflare R2** (S3-compatible, cost-effective)

#### Solution
Implement cloud storage before production deployment.

**Timeline:** Before production launch  
**Documentation:** To be created during implementation

---

## 🟢 LOW PRIORITY ISSUES

### 4. Django Admin Features Removed 🔧

**Status:** KNOWN - FEATURES REMOVED  
**Severity:** LOW  
**Impact:** Some admin dashboard features not available

#### Issue
Admin dashboard metrics and monitoring features that relied on Django backend have been removed.

#### Affected Features
- System metrics monitoring
- Admin activity logs
- Configuration management UI

#### Solution
Reimplement with Next.js API routes if needed in the future.

**Timeline:** Future enhancement (as needed)  
**Priority:** Low - not critical for core functionality

---

## 🐛 COMMON ISSUES AND SOLUTIONS

### Prisma Type Errors

#### Issue
TypeScript reports missing properties in Prisma client:
- `Property 'analysisProject' does not exist`
- `Property 'title' does not exist in type ProjectCreateInput`

#### Root Cause
Prisma client not regenerated after schema updates or TypeScript server cache issue.

#### Solutions

**Solution 1: Regenerate Prisma Client**
```bash
cd frontend
rm -rf node_modules/@prisma
npm run db:generate
# Restart TypeScript server in VS Code: Ctrl+Shift+P -> "TypeScript: Restart TS Server"
```

**Solution 2: Restart Development Server**
```bash
# Stop dev server (Ctrl+C)
rm -rf .next
npm run dev
```

**Solution 3: Verify Schema**
```bash
npx prisma validate
npx prisma format
npm run db:push
```

### Database Connection Issues

#### Issue
Cannot connect to PostgreSQL database.

#### Solutions

**1. Check PostgreSQL is running**
```bash
# Windows
pg_ctl status

# Linux/Mac
sudo systemctl status postgresql
```

**2. Verify connection string**
```env
# .env.local
DATABASE_URL="postgresql://user:password@localhost:5432/ncskit"
```

**3. Test connection**
```bash
psql -U postgres -d ncskit
```

**4. Create database if not exists**
```bash
psql -U postgres
CREATE DATABASE ncskit;
\q
```

### R Service Issues

#### Issue
R service not responding or health check fails.

#### Solutions

**1. Check Docker is running**
```bash
docker ps
```

**2. Start R service**
```bash
cd r-analytics
docker-compose up -d
```

**3. Check logs**
```bash
docker-compose logs r-analytics
```

**4. Rebuild if needed**
```bash
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

**5. Test health endpoint**
```bash
curl http://localhost:8000/health
```

### File Upload Issues

#### Issue
File upload fails or files not found.

#### Solutions

**1. Create uploads directory**
```bash
cd frontend
mkdir -p public/uploads
```

**2. Check permissions**
```bash
# Linux/Mac
chmod 755 public/uploads

# Windows - ensure write permissions
```

**3. Verify file size limit**
- Max file size: 10MB
- Only CSV files allowed

### Authentication Issues

#### Issue
Login/Register not working or session not persisting.

#### Solutions

**1. Check NEXTAUTH_SECRET**
```bash
# Generate new secret
openssl rand -base64 32

# Add to .env.local
NEXTAUTH_SECRET=<generated-secret>
```

**2. Verify NEXTAUTH_URL**
```env
# Development
NEXTAUTH_URL=http://localhost:3000

# Production
NEXTAUTH_URL=https://your-domain.com
```

**3. Clear browser cookies**
- Clear cookies for localhost:3000
- Try incognito mode

**4. Check database tables**
```sql
-- Verify NextAuth tables exist
SELECT * FROM accounts LIMIT 1;
SELECT * FROM sessions LIMIT 1;
SELECT * FROM users LIMIT 1;
```

### Build Issues

#### Issue
`npm run build` fails.

#### Solutions

**1. Clear cache**
```bash
rm -rf .next
rm -rf node_modules/.cache
```

**2. Reinstall dependencies**
```bash
rm -rf node_modules
rm package-lock.json
npm install
```

**3. Check TypeScript errors**
```bash
npm run type-check
```

**4. Skip type check for build (temporary)**
```bash
npm run build:prod
```

### Environment Variable Issues

#### Issue
Environment variables not loaded.

#### Solutions

**1. Verify file name**
- Must be `.env.local` (not `.env`)
- Must be in `frontend/` directory

**2. Restart dev server**
```bash
# Stop server
# Start again
npm run dev
```

**3. Check variable names**
- Must start with `NEXT_PUBLIC_` for client-side
- Server-side variables don't need prefix

**4. Validate environment**
```bash
node -e "require('./src/lib/env-validation')"
```

### Analytics Issues

#### Issue
Analysis fails or times out.

#### Solutions

**1. Check R service is running**
```bash
curl http://localhost:8000/health
```

**2. Increase timeout**
```typescript
// In analytics API route
const analysisResult = await rServiceClient.analyzeSentiment(
  csvData,
  textColumn,
  { timeout: 180000 } // 3 minutes
)
```

**3. Check CSV file format**
- Must have headers
- Must be valid CSV
- Check for special characters

**4. Clear cache**
```bash
rm -rf frontend/.cache/analysis
```

### Migration Issues

#### Issue
Database migration fails.

#### Solutions

**1. Check migration status**
```bash
npx prisma migrate status
```

**2. Reset database (WARNING: deletes data)**
```bash
npx prisma migrate reset
```

**3. Deploy pending migrations**
```bash
npm run db:migrate:deploy
```

**4. Resolve conflicts**
```bash
# If migrations conflict
npx prisma migrate resolve --applied <migration-name>
```

### Cache Issues

#### Issue
Old data showing or changes not reflected.

#### Solutions

**1. Clear Next.js cache**
```bash
rm -rf .next
```

**2. Clear analysis cache**
```bash
rm -rf .cache/analysis
```

**3. Hard refresh browser**
- Chrome/Edge: Ctrl+Shift+R
- Firefox: Ctrl+F5

**4. Disable cache in development**
```typescript
// next.config.js
module.exports = {
  // ...
  onDemandEntries: {
    maxInactiveAge: 0,
  },
}
```

### Logging Issues

#### Issue
Logs not showing or log files not created.

#### Solutions

**1. Check log directory**
```bash
mkdir -p logs
chmod 755 logs
```

**2. Verify logger configuration**
```typescript
// src/lib/logger.ts
// Check file paths and permissions
```

**3. View logs**
```bash
# Development logs
tail -f logs/app.log

# Error logs
tail -f logs/error.log
```

---

## 🔧 Quick Troubleshooting Checklist

When something doesn't work, try these in order:

1. ✅ Restart development server
2. ✅ Clear `.next` cache
3. ✅ Regenerate Prisma client (`npm run db:generate`)
4. ✅ Restart TypeScript server (VS Code: Ctrl+Shift+P → "TypeScript: Restart TS Server")
5. ✅ Check environment variables in `.env.local`
6. ✅ Verify database connection (`psql -U postgres -d ncskit`)
7. ✅ Check R service health (`curl http://localhost:8000/health`)
8. ✅ Clear browser cache/cookies
9. ✅ Check logs for errors
10. ✅ Reinstall dependencies (last resort)

---

## 📞 Getting Help

### Check Logs
- **Next.js:** Terminal output
- **R service:** `docker-compose logs`
- **Database:** PostgreSQL logs

### Verify Setup
```bash
# Validate environment
npm run validate-env

# Validate Prisma schema
npx prisma validate

# Test R service
curl http://localhost:8000/health
```

### Full Reset (Development Only)
```bash
rm -rf .next node_modules
npm install
npm run db:generate
npm run db:migrate
npm run dev
```

---

## 🎯 Prevention Tips

**1. Always regenerate Prisma after schema changes**
```bash
npm run db:generate
```

**2. Never commit sensitive files**
```bash
git add .env.example  # ✅ Good
# Never: git add .env.local  # ❌ Bad
```

**3. Keep dependencies updated**
```bash
npm outdated
npm update
```

**4. Regular database backups**
```bash
pg_dump -U postgres ncskit > backup.sql
```

**5. Monitor R service health**
```bash
curl http://localhost:8000/health
```

---

## 📚 Related Documentation

- **Cleanup Summary:** `CLEANUP_COMPLETED.md`
- **Security Audit:** `SECURITY_AUDIT_REPORT.md`
- **Supabase Refactoring:** `SUPABASE_REFACTOR_TODO.md`
- **Setup Guide:** `docs/setup/local-setup.md`
- **Troubleshooting:** `docs/troubleshooting/admin-issues.md`

---

**Last Updated:** November 11, 2025  
**Status:** Active - Post Cleanup  
**Next Review:** December 11, 2025
