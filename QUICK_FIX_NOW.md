# ⚡ QUICK FIX - Do This Now!

**Issue:** Upload CSV fails with "Could not find the 'project_id' column"  
**Time to fix:** 2 minutes  
**Status:** 🚨 URGENT

---

## 🎯 Quick Steps

### 1. Open Supabase Dashboard
Go to: https://supabase.com/dashboard/project/YOUR_PROJECT/sql

### 2. Copy This SQL
Open file: `supabase/migrations/20241110_hotfix_analysis_variables_column.sql`

Or copy from here:
```sql
-- Check and fix column name
DO $
DECLARE
  table_exists BOOLEAN;
  has_project_id BOOLEAN;
  has_analysis_project_id BOOLEAN;
BEGIN
  -- Check if table exists
  SELECT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'analysis_variables'
  ) INTO table_exists;

  IF NOT table_exists THEN
    RAISE NOTICE 'Creating table...';
    -- [Full CREATE TABLE statement from migration file]
    RETURN;
  END IF;

  -- Check columns
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'analysis_variables' 
    AND column_name = 'project_id'
  ) INTO has_project_id;

  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'analysis_variables' 
    AND column_name = 'analysis_project_id'
  ) INTO has_analysis_project_id;

  -- Fix if needed
  IF has_analysis_project_id AND NOT has_project_id THEN
    ALTER TABLE analysis_variables 
    RENAME COLUMN analysis_project_id TO project_id;
    RAISE NOTICE 'Fixed: Renamed to project_id';
  ELSIF has_project_id THEN
    RAISE NOTICE 'OK: project_id exists';
  END IF;
END $;
```

### 3. Run It
Click "Run" button in SQL Editor

### 4. Check Result
Should see message:
- "OK: project_id exists" ✅
- OR "Fixed: Renamed to project_id" ✅

### 5. Test Upload
Go back to: https://app.ncskit.org/analysis/new  
Upload CSV again → Should work! ✅

---

## 🔍 Quick Verify

Run this to verify:
```sql
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'analysis_variables' 
AND column_name = 'project_id';
```

Should return 1 row ✅

---

## ✅ Success Indicators

After fix, you should see:
- ✅ No error about "project_id not found"
- ✅ Upload progress bar reaches 100%
- ✅ Success message appears
- ✅ Health check displays

---

## 🆘 If Still Fails

Check console for new error message and report it.

---

**DO THIS NOW!** Then test upload again.

