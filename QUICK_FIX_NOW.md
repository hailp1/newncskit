# ⚡ QUICK FIX - Do This Now!

**Issue:** Upload CSV fails with "Could not find the 'project_id' column"  
**Time to fix:** 2 minutes  
**Status:** 🚨 URGENT

---

## 🎯 Quick Steps

### 1. Open Supabase Dashboard
Go to: https://supabase.com/dashboard/project/YOUR_PROJECT/sql

### 2. Copy This SQL
Open file: `supabase/migrations/SIMPLE_COLUMN_FIX.sql`

Or copy from here:
```sql
-- Check if we need to rename the column
DO $$
DECLARE
  has_wrong_name BOOLEAN;
BEGIN
  -- Check if column has wrong name
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public'
    AND table_name = 'analysis_variables' 
    AND column_name = 'analysis_project_id'
  ) INTO has_wrong_name;

  -- Rename if needed
  IF has_wrong_name THEN
    RAISE NOTICE 'Found analysis_project_id - renaming to project_id...';
    ALTER TABLE analysis_variables 
    RENAME COLUMN analysis_project_id TO project_id;
    RAISE NOTICE '✓ Column renamed successfully!';
  ELSE
    RAISE NOTICE '✓ Column name is already correct (project_id)';
  END IF;
END $$;

-- Verify the result
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public'
AND table_name = 'analysis_variables' 
AND column_name = 'project_id';
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

