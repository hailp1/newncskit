# 🧹 Project Cleanup - Files to Remove

## 📋 Temporary Documentation Files (Safe to Delete)

### Root Directory - Temporary Guides:
1. ❌ `ADMIN_BRANDING_SETUP_GUIDE.md` - Temporary guide
2. ❌ `ADMIN_SYSTEM_COMPLETE_FIX.md` - Temporary fix doc
3. ❌ `BLOG_PERFORMANCE_OPTIMIZATION.md` - Temporary doc
4. ❌ `BLOG_SETUP_GUIDE.md` - Temporary guide
5. ❌ `CLEANUP_COMPLETE_SUMMARY.md` - Old cleanup summary
6. ❌ `COLUMN_NAME_ISSUE_SUMMARY.md` - Temporary issue doc
7. ❌ `CREATE_ADMIN_USER_GUIDE.md` - Temporary guide
8. ❌ `DASHBOARD_LAYOUT_UPDATE.md` - Temporary update doc
9. ❌ `FIX_ADMIN_MENU_NOT_SHOWING.md` - Temporary fix doc
10. ❌ `FIX_ADMIN_MENU_NOW.md` - Temporary fix doc
11. ❌ `HUONG_DAN_CAP_NHAT_LOGO_FAVICON.md` - Temporary guide
12. ❌ `QUICK_FIX_ADMIN_LOGIN.md` - Temporary fix doc
13. ❌ `QUICK_FIX_NOW.md` - Temporary fix doc
14. ❌ `README_CURRENT_STATUS.md` - Temporary status
15. ❌ `URGENT_FIX_COLUMN_NAME.md` - Temporary fix doc

### Root Directory - Temporary SQL Files:
16. ❌ `FIX_ADMIN_USER_QUICK.sql` - Temporary SQL
17. ❌ `UPDATE_ADMIN_ROLE.sql` - Temporary SQL
18. ❌ `VERIFY_ADMIN_SYSTEM.sql` - Temporary SQL

### Keep These Important Files:
- ✅ `README.md` - Main documentation
- ✅ `MASTER_README.md` - Master documentation
- ✅ `DATABASE_SETUP_GUIDE.md` - Important setup guide
- ✅ `TESTING_GUIDE.md` - Important testing guide
- ✅ `DEPLOYMENT_CHECKLIST.md` - Important for deployment
- ✅ `CONTRIBUTING.md` - Important for contributors
- ✅ `LICENSE` - Legal requirement

## 🗂️ Supabase Directory Cleanup

### Temporary Migration Files:
1. ❌ `supabase/migrations/20241110_set_admin_role_for_user.sql` - Temporary
2. ❌ `supabase/migrations/20241110_fix_duplicate_user.sql` - Temporary
3. ❌ `supabase/migrations/20241110_create_admin_user.sql` - Temporary (if exists)

### Temporary SQL Files:
4. ❌ `supabase/quick-create-admin.sql` - Temporary
5. ❌ `supabase/create-admin-user.sql` - Temporary
6. ❌ `supabase/seed-blog-posts-sample.sql` - Sample data (optional)

### Keep These:
- ✅ `supabase/migrations/20241110_admin_system_complete.sql` - Main migration
- ✅ `supabase/migrations/20241110_MASTER_FIX_ALL_ISSUES.sql` - Master fix

## 📁 Frontend Directory Cleanup

### Check for duplicate/old files:
```bash
# Look for backup files
*.bak
*.old
*.backup
*_old.*
*_backup.*

# Look for temp files
*.tmp
*.temp
~*
```

## 🧪 Scripts Directory

Check for:
- ❌ Old test scripts
- ❌ Temporary migration scripts
- ✅ Keep: `create-admin-user.js` (useful utility)

## 📝 Blog Content

Check for:
- ❌ Duplicate markdown files
- ❌ Draft files not needed
- ✅ Keep: Published blog posts

## 🎯 Cleanup Commands

### Windows (PowerShell):
```powershell
# Remove temporary markdown files
Remove-Item -Path "ADMIN_BRANDING_SETUP_GUIDE.md" -Force
Remove-Item -Path "ADMIN_SYSTEM_COMPLETE_FIX.md" -Force
Remove-Item -Path "BLOG_PERFORMANCE_OPTIMIZATION.md" -Force
Remove-Item -Path "BLOG_SETUP_GUIDE.md" -Force
Remove-Item -Path "CLEANUP_COMPLETE_SUMMARY.md" -Force
Remove-Item -Path "COLUMN_NAME_ISSUE_SUMMARY.md" -Force
Remove-Item -Path "CREATE_ADMIN_USER_GUIDE.md" -Force
Remove-Item -Path "DASHBOARD_LAYOUT_UPDATE.md" -Force
Remove-Item -Path "FIX_ADMIN_MENU_NOT_SHOWING.md" -Force
Remove-Item -Path "FIX_ADMIN_MENU_NOW.md" -Force
Remove-Item -Path "HUONG_DAN_CAP_NHAT_LOGO_FAVICON.md" -Force
Remove-Item -Path "QUICK_FIX_ADMIN_LOGIN.md" -Force
Remove-Item -Path "QUICK_FIX_NOW.md" -Force
Remove-Item -Path "README_CURRENT_STATUS.md" -Force
Remove-Item -Path "URGENT_FIX_COLUMN_NAME.md" -Force

# Remove temporary SQL files
Remove-Item -Path "FIX_ADMIN_USER_QUICK.sql" -Force
Remove-Item -Path "UPDATE_ADMIN_ROLE.sql" -Force
Remove-Item -Path "VERIFY_ADMIN_SYSTEM.sql" -Force

# Remove temporary supabase files
Remove-Item -Path "supabase\migrations\20241110_set_admin_role_for_user.sql" -Force -ErrorAction SilentlyContinue
Remove-Item -Path "supabase\migrations\20241110_fix_duplicate_user.sql" -Force -ErrorAction SilentlyContinue
Remove-Item -Path "supabase\quick-create-admin.sql" -Force -ErrorAction SilentlyContinue
Remove-Item -Path "supabase\create-admin-user.sql" -Force -ErrorAction SilentlyContinue
```

### Linux/Mac:
```bash
# Remove temporary markdown files
rm -f ADMIN_BRANDING_SETUP_GUIDE.md
rm -f ADMIN_SYSTEM_COMPLETE_FIX.md
rm -f BLOG_PERFORMANCE_OPTIMIZATION.md
rm -f BLOG_SETUP_GUIDE.md
rm -f CLEANUP_COMPLETE_SUMMARY.md
rm -f COLUMN_NAME_ISSUE_SUMMARY.md
rm -f CREATE_ADMIN_USER_GUIDE.md
rm -f DASHBOARD_LAYOUT_UPDATE.md
rm -f FIX_ADMIN_MENU_NOT_SHOWING.md
rm -f FIX_ADMIN_MENU_NOW.md
rm -f HUONG_DAN_CAP_NHAT_LOGO_FAVICON.md
rm -f QUICK_FIX_ADMIN_LOGIN.md
rm -f QUICK_FIX_NOW.md
rm -f README_CURRENT_STATUS.md
rm -f URGENT_FIX_COLUMN_NAME.md

# Remove temporary SQL files
rm -f FIX_ADMIN_USER_QUICK.sql
rm -f UPDATE_ADMIN_ROLE.sql
rm -f VERIFY_ADMIN_SYSTEM.sql

# Remove temporary supabase files
rm -f supabase/migrations/20241110_set_admin_role_for_user.sql
rm -f supabase/migrations/20241110_fix_duplicate_user.sql
rm -f supabase/quick-create-admin.sql
rm -f supabase/create-admin-user.sql
```

## 📊 Summary

### Files to Remove: ~18 files
- 15 temporary markdown documentation files
- 3 temporary SQL files in root
- 4+ temporary SQL files in supabase/

### Space Saved: ~500KB - 1MB

### Result:
- ✅ Cleaner project structure
- ✅ Easier navigation
- ✅ Only essential documentation remains
- ✅ Production-ready codebase

## ⚠️ Before Cleanup

1. **Commit current changes** to git
2. **Create a backup** if needed
3. **Review the list** to ensure nothing important is deleted
4. **Run cleanup commands**
5. **Test the application** after cleanup
6. **Commit cleanup** with message: "chore: remove temporary documentation and SQL files"

## ✅ After Cleanup

Essential documentation structure:
```
/
├── README.md                    # Main readme
├── MASTER_README.md            # Master documentation
├── DATABASE_SETUP_GUIDE.md     # Database setup
├── TESTING_GUIDE.md            # Testing guide
├── DEPLOYMENT_CHECKLIST.md     # Deployment guide
├── CONTRIBUTING.md             # Contribution guide
├── LICENSE                     # License file
└── CLEANUP_PROJECT.md          # This file (can be removed after cleanup)
```

---

**Note:** This cleanup file itself can be removed after cleanup is complete!
