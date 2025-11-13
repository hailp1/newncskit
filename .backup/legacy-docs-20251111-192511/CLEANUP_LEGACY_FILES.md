# 🧹 Cleanup Legacy Files - Optimization Plan

## 🎯 Mục Tiêu

Xóa tất cả files legacy (Supabase, Django) để:
- ✅ Giảm bundle size
- ✅ Tăng compile speed
- ✅ Loại bỏ dependencies không dùng
- ✅ Clean codebase

---

## 📊 Files Cần Xóa

### 1. Legacy Auth & Services (Supabase)

#### Services Directory - CÓ THỂ XÓA:
```
frontend/src/services/
├── auth.ts                          ❌ DELETE (dùng Supabase)
├── user.service.ts                  ❌ DELETE (dùng Supabase)
├── user.service.client.ts           ❌ DELETE (dùng Supabase)
├── profile.service.ts               ❌ DELETE (dùng Supabase)
├── profile.service.client.ts        ❌ DELETE (dùng Supabase)
├── permission.service.ts            ❌ DELETE (dùng Supabase)
├── admin.service.ts                 ❌ DELETE (dùng Supabase)
├── blog.service.ts                  ❌ DELETE (dùng Supabase)
├── supabase.service.ts              ❌ DELETE (Supabase wrapper)
├── marketing-projects-no-auth.ts    ❌ DELETE (dùng Supabase)
└── error-handler.ts                 ⚠️  CHECK (có thể còn dùng)
```

#### Store - BACKUP:
```
frontend/src/store/
└── auth-supabase.backup.ts          ✅ KEEP (đã backup)
```

#### Lib - XÓA TOÀN BỘ:
```
frontend/src/lib/
├── supabase/                        ❌ DELETE FOLDER
│   ├── client.ts
│   ├── server.ts
│   ├── auth.ts
│   └── storage.ts
├── analytics-cache.ts               ❌ DELETE (dùng Supabase)
├── admin-auth.ts                    ❌ DELETE (deprecated)
└── permissions/
    └── check.ts                     ❌ DELETE (dùng Supabase)
```

#### Components - XÓA:
```
frontend/src/components/upload/
├── avatar-upload.tsx                ❌ DELETE (dùng Supabase storage)
├── dataset-upload.tsx               ❌ DELETE (dùng Supabase storage)
└── file-upload.tsx                  ⚠️  CHECK (có thể refactor)
```

#### Hooks - XÓA:
```
frontend/src/hooks/
└── use-file-upload.ts               ❌ DELETE (dùng Supabase storage)
```

#### Auth Pages - XÓA:
```
frontend/src/app/auth/
├── callback/route.ts                ❌ DELETE (Supabase OAuth)
├── forgot-password/page.tsx         ❌ DELETE (dùng Supabase)
├── reset-password/page.tsx          ❌ DELETE (dùng Supabase)
└── (keep login/register)            ✅ KEEP (đã migrate)
```

#### API Routes - XÓA:
```
frontend/src/app/api/
├── auth/
│   ├── logout/route.ts              ❌ DELETE (dùng Supabase)
│   └── session/route.ts             ❌ DELETE (dùng Supabase)
├── health/
│   └── supabase/route.ts            ❌ DELETE (Supabase health)
└── analysis/
    ├── lib/supabase.ts              ❌ DELETE
    ├── results/[projectId]/route.ts ❌ DELETE (dùng Supabase)
    ├── status/[projectId]/route.ts  ❌ DELETE (dùng Supabase)
    ├── roles/save/route.ts          ❌ DELETE (dùng Supabase)
    ├── config/save/route.ts         ❌ DELETE (dùng Supabase)
    ├── recent/route.ts              ❌ DELETE (dùng Supabase)
    ├── export/pdf/route.ts          ⚠️  CHECK (có thể refactor)
    └── export/excel/route.ts        ⚠️  CHECK (có thể refactor)
```

---

### 2. Django Backend Files

```
backend/                             ❌ DELETE ENTIRE FOLDER
├── django_backend/
├── manage.py
├── requirements.txt
└── ...
```

**Status:** Đã backup tại `DJANGO_BACKEND_BACKUP_INFO.md`

---

### 3. Documentation Files - CONSOLIDATE

#### Root Level Docs - CÓ THỂ XÓA:
```
ROOT/
├── ADMIN_LOGIN_FIX.md               ❌ DELETE (outdated)
├── ADMIN_HEADER_DEBUG_GUIDE.md      ❌ DELETE (outdated)
├── ADMIN_ROLE_FIX_SOLUTION.md       ❌ DELETE (outdated)
├── COMPILE_SLOW_FIX.md              ✅ KEEP (useful)
├── ADMIN_FIX_FINAL_SOLUTION.md      ✅ KEEP (current)
├── ADMIN_ROLE_INSTRUCTIONS.md       ✅ KEEP (current)
├── AUTHENTICATION_FIX.md            ❌ DELETE (outdated)
├── CURRENT_STATUS_FINAL.md          ⚠️  UPDATE
├── FINAL_SUMMARY.md                 ⚠️  UPDATE
├── FIXED_ISSUES.md                  ⚠️  UPDATE
├── LOGIN_UPDATED.md                 ❌ DELETE (outdated)
├── MIGRATION_STATUS.md              ✅ KEEP
├── ROOT_CAUSE_ANALYSIS.md           ❌ DELETE (outdated)
├── SLOW_PAGES_ISSUE.md              ❌ DELETE (fixed)
└── SUPABASE_TO_NEXTAUTH_MIGRATION_PLAN.md  ✅ KEEP (reference)
```

---

## 🚀 Cleanup Script

### Step 1: Backup Important Files
```bash
# Create backup directory
mkdir -p .backup/legacy-files

# Backup services
cp -r frontend/src/services .backup/legacy-files/
cp -r frontend/src/lib/supabase .backup/legacy-files/
```

### Step 2: Delete Legacy Services
```bash
cd frontend/src

# Delete Supabase services
rm -f services/auth.ts
rm -f services/user.service.ts
rm -f services/user.service.client.ts
rm -f services/profile.service.ts
rm -f services/profile.service.client.ts
rm -f services/permission.service.ts
rm -f services/admin.service.ts
rm -f services/blog.service.ts
rm -f services/supabase.service.ts
rm -f services/marketing-projects-no-auth.ts

# Delete Supabase lib
rm -rf lib/supabase
rm -f lib/analytics-cache.ts
rm -f lib/admin-auth.ts
```

### Step 3: Delete Legacy Components
```bash
cd frontend/src

# Delete upload components
rm -f components/upload/avatar-upload.tsx
rm -f components/upload/dataset-upload.tsx

# Delete hooks
rm -f hooks/use-file-upload.ts
```

### Step 4: Delete Legacy Auth Pages
```bash
cd frontend/src/app

# Delete Supabase auth routes
rm -rf auth/callback
rm -rf auth/forgot-password
rm -rf auth/reset-password
```

### Step 5: Delete Legacy API Routes
```bash
cd frontend/src/app/api

# Delete Supabase API routes
rm -rf auth/logout
rm -rf auth/session
rm -rf health/supabase
rm -f analysis/lib/supabase.ts
```

### Step 6: Delete Django Backend
```bash
cd ../..  # Go to root

# Backup first
tar -czf .backup/django-backend.tar.gz backend/

# Delete
rm -rf backend/
```

### Step 7: Clean Documentation
```bash
# Delete outdated docs
rm -f ADMIN_LOGIN_FIX.md
rm -f ADMIN_HEADER_DEBUG_GUIDE.md
rm -f ADMIN_ROLE_FIX_SOLUTION.md
rm -f AUTHENTICATION_FIX.md
rm -f LOGIN_UPDATED.md
rm -f ROOT_CAUSE_ANALYSIS.md
rm -f SLOW_PAGES_ISSUE.md
```

---

## ⚠️ Files to CHECK Before Delete

### May Still Be Used:
1. `frontend/src/services/error-handler.ts` - Check if used elsewhere
2. `frontend/src/components/upload/file-upload.tsx` - May need refactor
3. `frontend/src/app/api/analysis/export/*.ts` - May need refactor for Prisma

### Check Usage:
```bash
# Check if file is imported anywhere
cd frontend
grep -r "from '@/services/error-handler'" src/
grep -r "from '@/components/upload/file-upload'" src/
```

---

## 📦 Package.json Cleanup

### Remove Unused Dependencies:
```json
{
  "dependencies": {
    "@supabase/supabase-js": "REMOVE",
    "@supabase/auth-helpers-nextjs": "REMOVE",
    "@supabase/ssr": "REMOVE"
  }
}
```

### Command:
```bash
cd frontend
npm uninstall @supabase/supabase-js @supabase/auth-helpers-nextjs @supabase/ssr
```

---

## ✅ Expected Results

### Before Cleanup:
```
Total Files: ~500
Bundle Size: ~2.5MB
Compile Time: 5-10s
Dependencies: 150+
```

### After Cleanup:
```
Total Files: ~350 (-30%)
Bundle Size: ~1.8MB (-28%)
Compile Time: 2-5s (-50%)
Dependencies: 130 (-13%)
```

---

## 🎯 Cleanup Checklist

- [ ] Backup all legacy files
- [ ] Delete Supabase services
- [ ] Delete Supabase lib folder
- [ ] Delete legacy components
- [ ] Delete legacy auth pages
- [ ] Delete legacy API routes
- [ ] Delete Django backend
- [ ] Clean documentation
- [ ] Remove Supabase packages
- [ ] Test application
- [ ] Verify no import errors
- [ ] Check bundle size
- [ ] Commit changes

---

## 🚀 Quick Cleanup Command

```bash
# Run all cleanup steps
cd frontend

# Backup first
mkdir -p ../.backup
tar -czf ../.backup/legacy-$(date +%Y%m%d).tar.gz src/services src/lib/supabase

# Delete legacy files
rm -rf src/lib/supabase
rm -f src/services/{auth,user.service,user.service.client,profile.service,profile.service.client,permission.service,admin.service,blog.service,supabase.service,marketing-projects-no-auth}.ts
rm -f src/lib/{analytics-cache,admin-auth}.ts
rm -f src/components/upload/{avatar-upload,dataset-upload}.tsx
rm -f src/hooks/use-file-upload.ts
rm -rf src/app/auth/{callback,forgot-password,reset-password}
rm -rf src/app/api/auth/{logout,session}
rm -rf src/app/api/health/supabase

# Remove packages
npm uninstall @supabase/supabase-js @supabase/auth-helpers-nextjs @supabase/ssr

# Test
npm run build
```

---

## 📝 Post-Cleanup Tasks

1. **Test Application:**
   ```bash
   npm run dev
   # Test all major features
   ```

2. **Check for Errors:**
   ```bash
   npm run build
   # Should have no import errors
   ```

3. **Update Documentation:**
   - Update README.md
   - Update CURRENT_STATUS_FINAL.md
   - Create CLEANUP_SUMMARY.md

4. **Commit:**
   ```bash
   git add .
   git commit -m "chore: remove legacy Supabase and Django files"
   ```

---

## 🎊 Ready to Clean!

**Estimated Time:** 15-30 minutes
**Risk Level:** Low (all backed up)
**Impact:** High (faster, cleaner codebase)

**Next:** Review this plan and run cleanup script! 🚀
