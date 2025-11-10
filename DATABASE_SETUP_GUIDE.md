# 📚 Database Setup Guide - NCSKit Analysis Flow

**Last Updated:** 2025-11-10  
**Status:** ✅ Production Ready

---

## 🎯 Quick Start

### For Fresh Database Setup

Run these migrations in order:

1. **Core Tables** (if not already created)
   ```
   supabase/migrations/20240107_create_analysis_tables.sql
   ```

2. **Storage Bucket**
   ```
   supabase/migrations/20241110_create_storage_bucket.sql
   ```

3. **Variable Role Tags**
   ```
   supabase/migrations/20241110_variable_role_tags.sql
   ```

4. **Master Fix** (fixes all known issues)
   ```
   supabase/migrations/20241110_MASTER_FIX_ALL_ISSUES.sql
   ```

### For Existing Database with Issues

Just run the **Master Fix**:
```
supabase/migrations/20241110_MASTER_FIX_ALL_ISSUES.sql
```

This will automatically:
- ✅ Fix column name (analysis_project_id → project_id)
- ✅ Create storage bucket if missing
- ✅ Setup storage RLS policies
- ✅ Fix table RLS policies

---

## 📁 Migration Files Structure

### ✅ KEEP - Core Migrations (Run in Order)

1. **20240107_create_analysis_tables.sql**
   - Creates all analysis tables
   - Sets up indexes and RLS policies
   - **Status:** Core migration

2. **20241110_create_storage_bucket.sql**
   - Creates CSV file storage bucket
   - Sets up storage RLS policies
   - **Status:** Required for file uploads

3. **20241110_variable_role_tags.sql**
   - Creates role tagging system
   - Enables advanced analysis configuration
   - **Status:** Required for analysis

4. **20241110_MASTER_FIX_ALL_ISSUES.sql** ⭐ NEW
   - Fixes all known database issues
   - Safe to run multiple times
   - **Status:** Hotfix for production

### ✅ KEEP - Admin System (Optional)

5. **20241110_admin_system_complete.sql**
   - Complete admin system setup
   - **Status:** Optional feature

### ❌ REMOVED - Temporary/Duplicate Files

All temporary diagnostic and fix files have been removed:
- ~~20241110_check_and_fix_column_name.sql~~
- ~~20241110_diagnose_column_issue.sql~~
- ~~20241110_ensure_analysis_variables_exists.sql~~
- ~~QUICK_FIX_RUN_THIS_FIRST.sql~~
- ~~RUN_THIS_FIRST_CREATE_ALL_TABLES.sql~~
- ~~SIMPLE_FIX_RUN_ORIGINAL_MIGRATION.sql~~
- ~~20241110_hotfix_analysis_variables_column.sql~~
- ~~SIMPLE_COLUMN_FIX.sql~~
- ~~verify_*.sql~~

---

## 🔧 Common Issues & Solutions

### Issue 1: "Could not find the 'project_id' column"

**Solution:** Run `20241110_MASTER_FIX_ALL_ISSUES.sql`

This fixes the column name from `analysis_project_id` to `project_id`.

### Issue 2: "Storage bucket not found"

**Solution:** Run `20241110_MASTER_FIX_ALL_ISSUES.sql`

This creates the storage bucket if missing.

### Issue 3: "Permission denied" on uploads

**Solution:** Run `20241110_MASTER_FIX_ALL_ISSUES.sql`

This fixes all RLS policies.

---

## ✅ Verification Queries

After running migrations, verify everything is correct:

### 1. Check Column Name
```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'analysis_variables' 
AND column_name = 'project_id';
```
**Expected:** 1 row with `project_id` column

### 2. Check Storage Bucket
```sql
SELECT id, name, public, file_size_limit 
FROM storage.buckets 
WHERE id = 'analysis-csv-files';
```
**Expected:** 1 row with bucket details

### 3. Check RLS Policies
```sql
SELECT policyname, cmd 
FROM pg_policies 
WHERE tablename = 'analysis_variables';
```
**Expected:** 4 policies (SELECT, INSERT, UPDATE, DELETE)

### 4. Check Storage Policies
```sql
SELECT policyname 
FROM pg_policies 
WHERE tablename = 'objects' 
AND policyname LIKE '%CSV%';
```
**Expected:** 4 policies for CSV files

---

## 🧪 Testing

After setup, test the flow:

1. **Upload CSV**
   - Go to: https://app.ncskit.org/analysis/new
   - Upload a CSV file
   - Should succeed with 200 status

2. **Check Database**
   ```sql
   SELECT * FROM analysis_projects ORDER BY created_at DESC LIMIT 1;
   SELECT * FROM analysis_variables WHERE project_id = '<project_id>';
   ```

3. **Check Storage**
   - Go to Supabase Dashboard → Storage → analysis-csv-files
   - Should see uploaded file

---

## 📊 Database Schema Overview

### Core Tables

1. **analysis_projects** - Project metadata
2. **analysis_variables** - CSV columns/variables
3. **variable_groups** - Variable groupings
4. **variable_role_tags** - Role assignments (IV, DV, etc.)
5. **demographic_ranks** - Custom rank definitions
6. **ordinal_categories** - Ordered categories
7. **analysis_configurations** - Analysis settings
8. **analysis_results** - Analysis results

### Storage

- **Bucket:** `analysis-csv-files`
- **Size Limit:** 50MB
- **Allowed Types:** CSV, Excel, Text
- **Access:** Private (user-isolated)

---

## 🚀 Deployment Checklist

Before deploying to production:

- [ ] Run all core migrations in order
- [ ] Run master fix migration
- [ ] Verify all tables exist
- [ ] Verify storage bucket exists
- [ ] Verify RLS policies active
- [ ] Test CSV upload
- [ ] Test variable creation
- [ ] Check error logs

---

## 📝 Maintenance

### Regular Checks

Run these queries monthly:

```sql
-- Check table sizes
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
AND tablename LIKE 'analysis_%'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Check storage usage
SELECT 
  bucket_id,
  COUNT(*) as file_count,
  pg_size_pretty(SUM(metadata->>'size')::bigint) as total_size
FROM storage.objects
WHERE bucket_id = 'analysis-csv-files'
GROUP BY bucket_id;
```

### Cleanup Old Data

```sql
-- Delete projects older than 90 days (adjust as needed)
DELETE FROM analysis_projects 
WHERE created_at < NOW() - INTERVAL '90 days'
AND status = 'completed';

-- Vacuum tables
VACUUM ANALYZE analysis_projects;
VACUUM ANALYZE analysis_variables;
```

---

## 🆘 Support

### If Issues Persist

1. Check Supabase logs
2. Run verification queries
3. Check RLS policies are active
4. Verify user authentication
5. Check network connectivity

### Contact

- GitHub Issues: [Report Issue](https://github.com/hailp1/newncskit/issues)
- Documentation: See other MD files in root

---

**Last Migration:** `20241110_MASTER_FIX_ALL_ISSUES.sql`  
**Status:** ✅ All systems operational  
**Next Review:** Monthly maintenance check

