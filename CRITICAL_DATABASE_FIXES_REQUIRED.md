# 🚨 CRITICAL DATABASE FIXES REQUIRED

**Date:** 2024-11-10  
**Priority:** URGENT - BLOCKING PRODUCTION  
**Status:** ⚠️ REQUIRES MANUAL DATABASE MIGRATION

---

## 📋 Summary

Data Analysis Flow is experiencing database schema issues that prevent file uploads. The root cause is a column name mismatch between the code and the production database schema.

---

## 🐛 Issues Identified

### Issue #1: Column Name Mismatch
**Error:** `Could not find the 'project_id' column of 'analysis_variables' in the schema cache`

**Root Cause:**
- Production database has column named `analysis_project_id`
- Code has been updated to use `project_id`
- Supabase schema cache is out of sync

### Issue #2: RLS Policy Violation (RESOLVED in code)
**Error:** `new row violates row-level security policy for table "analysis_variables"`

**Root Cause:**
- RLS policy used `FOR ALL` with only `USING` clause
- Missing `WITH CHECK` clause for INSERT operations

**Status:** ✅ Fixed in code, needs database migration

---

## ✅ Solutions Prepared

### Solution 1: Verify Current Schema

Run this query in Supabase SQL Editor to check current state:

```sql
-- File: supabase/migrations/verify_analysis_variables_schema.sql

SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'analysis_variables'
ORDER BY ordinal_position;
```

**Expected Output:**
- If you see `analysis_project_id` → Need to run migration
- If you see `project_id` → Schema is correct, just refresh cache

### Solution 2: Apply Column Rename Migration

Run this migration in Supabase SQL Editor:

```sql
-- File: supabase/migrations/20241110_check_and_fix_column_name.sql

DO $$
BEGIN
  -- Check if analysis_project_id exists
  IF EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'analysis_variables' 
    AND column_name = 'analysis_project_id'
  ) THEN
    -- Rename the column
    ALTER TABLE analysis_variables 
    RENAME COLUMN analysis_project_id TO project_id;
    
    RAISE NOTICE 'Renamed analysis_project_id to project_id';
  ELSE
    RAISE NOTICE 'Column analysis_project_id does not exist, no action needed';
  END IF;
END $$;

-- Update indexes
DROP INDEX IF EXISTS idx_analysis_variables_analysis_project;
CREATE INDEX IF NOT EXISTS idx_analysis_variables_project ON analysis_variables(project_id);
```

### Solution 3: Fix RLS Policies

Run this migration in Supabase SQL Editor:

```sql
-- File: supabase/migrations/20241110_fix_analysis_variables_rls.sql

-- Drop old policies
DROP POLICY IF EXISTS "Users can manage variables of their projects" ON analysis_variables;
DROP POLICY IF EXISTS "Users can view variables of their projects" ON analysis_variables;
DROP POLICY IF EXISTS "Users can insert variables for their projects" ON analysis_variables;
DROP POLICY IF EXISTS "Users can update variables of their projects" ON analysis_variables;
DROP POLICY IF EXISTS "Users can delete variables of their projects" ON analysis_variables;

-- Create new policies with correct column name
CREATE POLICY "Users can view variables of their projects"
  ON analysis_variables FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM analysis_projects
      WHERE analysis_projects.id = analysis_variables.project_id
      AND analysis_projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert variables for their projects"
  ON analysis_variables FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM analysis_projects
      WHERE analysis_projects.id = analysis_variables.project_id
      AND analysis_projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update variables of their projects"
  ON analysis_variables FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM analysis_projects
      WHERE analysis_projects.id = analysis_variables.project_id
      AND analysis_projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete variables of their projects"
  ON analysis_variables FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM analysis_projects
      WHERE analysis_projects.id = analysis_variables.project_id
      AND analysis_projects.user_id = auth.uid()
    )
  );
```

---

## 📝 Step-by-Step Migration Guide

### Step 1: Backup Database
```bash
# In Supabase Dashboard
# Settings → Database → Backups → Create Backup
```

### Step 2: Verify Current Schema
1. Go to Supabase Dashboard
2. SQL Editor → New Query
3. Copy and paste content from `verify_analysis_variables_schema.sql`
4. Run query
5. Check if column is `analysis_project_id` or `project_id`

### Step 3: Apply Migrations (if needed)

**If column is `analysis_project_id`:**

1. **Run Column Rename Migration:**
   ```sql
   -- Copy entire content from:
   -- supabase/migrations/20241110_check_and_fix_column_name.sql
   ```

2. **Run RLS Policy Fix:**
   ```sql
   -- Copy entire content from:
   -- supabase/migrations/20241110_fix_analysis_variables_rls.sql
   ```

3. **Verify Changes:**
   ```sql
   -- Run verify script again
   SELECT column_name FROM information_schema.columns
   WHERE table_name = 'analysis_variables' AND column_name = 'project_id';
   
   -- Should return 1 row with 'project_id'
   ```

### Step 4: Refresh Schema Cache

**Option A: Via Dashboard**
1. Go to Settings → API
2. Click "Refresh schema cache" button
3. Wait 30 seconds

**Option B: Via SQL**
```sql
NOTIFY pgrst, 'reload schema';
```

**Option C: Restart API (if above don't work)**
1. Settings → API
2. Restart API server

### Step 5: Test Upload

1. Go to https://app.ncskit.org/analysis/new
2. Upload a test CSV file
3. Verify no errors
4. Check database for created project and variables

---

## 🔍 Verification Checklist

After applying migrations, verify:

- [ ] Column `project_id` exists in `analysis_variables` table
- [ ] Index `idx_analysis_variables_project` exists
- [ ] 4 RLS policies exist on `analysis_variables`:
  - [ ] Users can view variables of their projects
  - [ ] Users can insert variables for their projects
  - [ ] Users can update variables of their projects
  - [ ] Users can delete variables of their projects
- [ ] Schema cache refreshed
- [ ] Test upload succeeds
- [ ] Variables are created in database
- [ ] No RLS policy violations

---

## 🚨 Rollback Plan

If migrations cause issues:

### Rollback Step 1: Restore Column Name
```sql
ALTER TABLE analysis_variables 
RENAME COLUMN project_id TO analysis_project_id;

DROP INDEX IF EXISTS idx_analysis_variables_project;
CREATE INDEX idx_analysis_variables_analysis_project 
ON analysis_variables(analysis_project_id);
```

### Rollback Step 2: Restore Old RLS Policy
```sql
DROP POLICY IF EXISTS "Users can view variables of their projects" ON analysis_variables;
DROP POLICY IF EXISTS "Users can insert variables for their projects" ON analysis_variables;
DROP POLICY IF EXISTS "Users can update variables of their projects" ON analysis_variables;
DROP POLICY IF EXISTS "Users can delete variables of their projects" ON analysis_variables;

CREATE POLICY "Users can manage variables of their projects"
  ON analysis_variables FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM analysis_projects
      WHERE analysis_projects.id = analysis_variables.analysis_project_id
      AND analysis_projects.user_id = auth.uid()
    )
  );
```

### Rollback Step 3: Revert Code Changes
```bash
git revert HEAD~2  # Revert last 2 commits
git push origin main
```

---

## 📊 Impact Assessment

### Before Fix:
- ❌ Upload fails with 500 error
- ❌ No projects can be created
- ❌ Data analysis flow completely blocked
- ❌ Users cannot use the feature

### After Fix:
- ✅ Upload works correctly
- ✅ Projects and variables created
- ✅ Data analysis flow functional
- ✅ Users can analyze data

---

## 🎯 Success Criteria

Migration is successful when:

1. ✅ No errors in Supabase logs
2. ✅ Upload endpoint returns 200 status
3. ✅ Project created in `analysis_projects` table
4. ✅ Variables created in `analysis_variables` table
5. ✅ Health check endpoint works
6. ✅ Grouping endpoint works
7. ✅ End-to-end flow completes

---

## 📞 Support

If you encounter issues:

1. **Check Supabase Logs:**
   - Dashboard → Logs → Database
   - Look for errors related to `analysis_variables`

2. **Check API Logs:**
   - Dashboard → Logs → API
   - Look for RLS policy violations

3. **Verify Schema:**
   - Run verification query again
   - Check column names and policies

4. **Contact Support:**
   - Provide error messages
   - Provide correlation IDs from logs
   - Provide screenshots if possible

---

## 📚 Related Files

### Migration Files:
- `supabase/migrations/20241110_check_and_fix_column_name.sql`
- `supabase/migrations/20241110_fix_analysis_variables_rls.sql`
- `supabase/migrations/verify_analysis_variables_schema.sql`

### Code Files Changed:
- `frontend/src/app/api/analysis/upload/route.ts`
- `frontend/src/app/api/analysis/group/route.ts`
- `frontend/src/app/api/analysis/variables/route.ts`
- `frontend/src/app/api/analysis/health/route.ts`

### Documentation:
- `DATA_ANALYSIS_FLOW_VERIFICATION.md`
- `PRE_RELEASE_CHECKLIST.md`

---

## ⏱️ Estimated Time

- Backup: 2 minutes
- Verify schema: 1 minute
- Apply migrations: 2 minutes
- Refresh cache: 1 minute
- Test: 2 minutes

**Total: ~10 minutes**

---

## ✅ Final Notes

- These migrations are **idempotent** - safe to run multiple times
- Migrations check for existing state before making changes
- No data loss will occur
- Minimal downtime (< 1 minute during cache refresh)
- Can be rolled back if needed

**Status:** Ready to apply to production

**Last Updated:** 2024-11-10  
**Prepared by:** Kiro AI Assistant

