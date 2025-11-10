# 🚨 URGENT: Database Setup Required

**Problem:** Production database is missing analysis tables completely!

**Solution:** Run this ONE migration file to create everything.

---

## ⚡ Quick Fix (5 minutes)

### Step 1: Open Supabase SQL Editor

1. Go to https://supabase.com/dashboard
2. Select your project
3. Click **SQL Editor** in left sidebar
4. Click **New Query**

### Step 2: Copy and Run This Migration

Copy the ENTIRE content of this file:
```
supabase/migrations/RUN_THIS_FIRST_CREATE_ALL_TABLES.sql
```

And paste it into the SQL Editor, then click **Run**.

### Step 3: Verify Tables Created

Run this query to verify:
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('analysis_projects', 'analysis_variables', 'variable_groups')
ORDER BY table_name;
```

You should see 3 tables:
- analysis_projects
- analysis_variables  
- variable_groups

### Step 4: Refresh Schema Cache

1. Go to **Settings** → **API**
2. Click **"Refresh schema cache"**
3. Wait 30 seconds

### Step 5: Test Upload

1. Go to https://app.ncskit.org/analysis/new
2. Upload a CSV file
3. It should work now! ✅

---

## 📋 What This Migration Does

1. ✅ Creates `analysis_projects` table
   - Stores project metadata
   - Links to user via `user_id`
   - Has RLS policies for security

2. ✅ Creates `analysis_variables` table
   - Stores CSV columns/variables
   - Links to project via `project_id` (correct name!)
   - Has RLS policies for security

3. ✅ Creates `variable_groups` table
   - Stores variable groupings
   - Links to project
   - Has RLS policies

4. ✅ Creates all indexes for performance

5. ✅ Enables Row Level Security (RLS)

6. ✅ Creates all RLS policies

---

## ✅ Success Criteria

After running the migration:

- ✅ 3 tables exist
- ✅ RLS is enabled on all tables
- ✅ Policies allow users to access their own data
- ✅ Upload works without errors
- ✅ Variables are created in database

---

## 🆘 If You Get Errors

### Error: "relation auth.users does not exist"
**Solution:** Your Supabase project might not have auth enabled. Contact Supabase support.

### Error: "extension uuid-ossp does not exist"
**Solution:** Run this first:
```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

### Error: "permission denied"
**Solution:** Make sure you're logged in as the project owner or have admin access.

---

## 📞 After Running Migration

Send me a message saying "Migration complete" and I'll help you test!

---

**Estimated Time:** 5 minutes  
**Risk Level:** LOW (migration is idempotent - safe to run multiple times)  
**Rollback:** Not needed (creates new tables, doesn't modify existing data)

