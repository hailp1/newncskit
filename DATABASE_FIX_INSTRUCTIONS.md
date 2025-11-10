# 🔧 Database Fix Instructions - SIMPLE STEPS

**Status:** ⚠️ URGENT - Follow these steps exactly

---

## 🎯 Quick Summary

The upload is failing because of a column name issue in the database. Follow these 3 simple steps to fix it.

---

## 📋 Step-by-Step Instructions

### Step 1: Run Diagnostic Script

1. Go to **Supabase Dashboard** → **SQL Editor**
2. Click **New Query**
3. Copy and paste this entire script:

```sql
-- Show all columns in analysis_variables
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'analysis_variables'
ORDER BY ordinal_position;
```

4. Click **Run**
5. **Take a screenshot** of the results
6. Look for a column that references `analysis_projects` - it might be named:
   - `project_id` ✅ (correct name)
   - `analysis_project_id` ⚠️ (needs to be renamed)
   - Something else ❌ (we need to investigate)

---

### Step 2: Based on What You Found

#### If you see `project_id` column:
✅ **Column name is correct!** The issue is just the RLS policies.

**Run this script:**
```sql
-- Drop old policies
DROP POLICY IF EXISTS "Users can manage variables of their projects" ON analysis_variables;
DROP POLICY IF EXISTS "Users can view variables of their projects" ON analysis_variables;
DROP POLICY IF EXISTS "Users can insert variables for their projects" ON analysis_variables;
DROP POLICY IF EXISTS "Users can update variables of their projects" ON analysis_variables;
DROP POLICY IF EXISTS "Users can delete variables of their projects" ON analysis_variables;

-- Create new policies
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

Then **skip to Step 3**.

---

#### If you see `analysis_project_id` column:
⚠️ **Column needs to be renamed**

**Run this script:**
```sql
-- Rename column
ALTER TABLE analysis_variables 
RENAME COLUMN analysis_project_id TO project_id;

-- Update index
DROP INDEX IF EXISTS idx_analysis_variables_analysis_project;
CREATE INDEX idx_analysis_variables_project ON analysis_variables(project_id);

-- Drop old policies
DROP POLICY IF EXISTS "Users can manage variables of their projects" ON analysis_variables;
DROP POLICY IF EXISTS "Users can view variables of their projects" ON analysis_variables;

-- Create new policies
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

Then **continue to Step 3**.

---

#### If you see a different column name:
❌ **Unexpected column name**

**STOP and send me:**
1. Screenshot of the columns
2. The exact column name you see

---

### Step 3: Refresh Schema Cache

After running the fix script:

1. Go to **Settings** → **API**
2. Click **"Refresh schema cache"** button
3. Wait 30 seconds
4. Or run this SQL:
   ```sql
   NOTIFY pgrst, 'reload schema';
   ```

---

### Step 4: Test Upload

1. Go to https://app.ncskit.org/analysis/new
2. Try uploading a CSV file
3. It should work now! ✅

---

## ✅ Verification

After the fix, verify:

```sql
-- Should return 'project_id'
SELECT column_name 
FROM information_schema.columns
WHERE table_name = 'analysis_variables' 
  AND column_name = 'project_id';

-- Should return 4 policies
SELECT COUNT(*) 
FROM pg_policies
WHERE tablename = 'analysis_variables';
```

---

## 🆘 If It Still Doesn't Work

1. Check Supabase logs:
   - Dashboard → Logs → Database
   - Look for errors

2. Send me:
   - Error message from upload
   - Screenshot of columns (from Step 1)
   - Screenshot of policies:
     ```sql
     SELECT policyname FROM pg_policies 
     WHERE tablename = 'analysis_variables';
     ```

---

## 📞 Quick Help

**Error:** "Could not find the 'project_id' column"
→ Run Step 1 again, schema cache might not be refreshed

**Error:** "RLS policy violation"
→ Run the RLS policy script again

**Error:** "Column does not exist"
→ Send me screenshot from Step 1

---

**Last Updated:** 2024-11-10  
**Estimated Time:** 5 minutes

