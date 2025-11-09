# Admin System Migration - Troubleshooting Guide

## Common Errors and Solutions

### Error: "relation public.profiles does not exist"

**Cause:** The base profiles table hasn't been created yet.

**Solution:** Use the standalone migration instead:

1. Open Supabase Dashboard → SQL Editor
2. Use `20241110_admin_system_standalone.sql` instead of the complete migration
3. This file includes the base profiles table creation

```sql
-- Run this file for fresh databases
supabase/migrations/20241110_admin_system_standalone.sql
```

---

### Error: "column already exists"

**Cause:** You're trying to add columns that already exist.

**Solution:** The migration uses `ADD COLUMN IF NOT EXISTS`, so this shouldn't happen. If it does:

1. Check which columns exist:
```sql
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'profiles' AND table_schema = 'public';
```

2. Manually remove the problematic `ALTER TABLE` statements from the migration

---

### Error: "constraint already exists"

**Cause:** Constraints with the same name already exist.

**Solution:** The migration includes checks for this. If you still get the error:

```sql
-- Drop existing constraints first
ALTER TABLE public.profiles 
  DROP CONSTRAINT IF EXISTS check_role_valid,
  DROP CONSTRAINT IF EXISTS check_subscription_valid,
  DROP CONSTRAINT IF EXISTS check_orcid_format;

-- Then run the migration again
```

---

### Error: "policy already exists"

**Cause:** RLS policies with the same name already exist.

**Solution:** The migration drops existing policies first. If you still get the error:

```sql
-- Drop all existing policies on profiles
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update any profile" ON public.profiles;

-- Drop all existing policies on permissions
DROP POLICY IF EXISTS "Users can view own permissions" ON public.permissions;
DROP POLICY IF EXISTS "Admins can view all permissions" ON public.permissions;
DROP POLICY IF EXISTS "Admins can grant permissions" ON public.permissions;
DROP POLICY IF EXISTS "Admins can update permissions" ON public.permissions;
DROP POLICY IF EXISTS "Admins can revoke permissions" ON public.permissions;

-- Then run the migration again
```

---

### Error: "permission denied for schema public"

**Cause:** Insufficient database permissions.

**Solution:** Ensure you're running as a superuser or database owner:

```sql
-- Check current role
SELECT current_user, current_database();

-- Grant necessary permissions
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO postgres, authenticated;
```

---

### Error: "function update_updated_at_column() does not exist"

**Cause:** The trigger function hasn't been created.

**Solution:** Create the function first:

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

Then run the migration again.

---

### Error: "syntax error at or near..."

**Cause:** SQL syntax issue or incompatible PostgreSQL version.

**Solution:**

1. Check your PostgreSQL version:
```sql
SELECT version();
```

2. Ensure you're using PostgreSQL 12 or higher (Supabase uses 15+)

3. Copy the migration in smaller chunks and run section by section to identify the problematic part

---

### Error: "cannot execute in a read-only transaction"

**Cause:** Database is in read-only mode or you're using a read replica.

**Solution:**

1. Ensure you're connected to the primary database (not a read replica)
2. Check database status in Supabase Dashboard
3. Wait if maintenance is in progress

---

## Migration Path Decision Tree

```
Do you have an existing database?
│
├─ YES → Does it have a profiles table?
│         │
│         ├─ YES → Use: 20241110_admin_system_complete.sql
│         │
│         └─ NO → Use: 20241110_admin_system_standalone.sql
│
└─ NO (Fresh database) → Use: 20241110_admin_system_standalone.sql
```

## Verification After Migration

Always run these checks after migration:

### 1. Check Tables Exist
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('profiles', 'permissions');
```
Expected: 2 rows

### 2. Check Profiles Columns
```sql
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'profiles' 
  AND column_name IN ('institution', 'orcid_id', 'research_domains', 'role', 'subscription_type', 'is_active');
```
Expected: 6 rows

### 3. Check Permissions Table
```sql
SELECT COUNT(*) 
FROM information_schema.tables 
WHERE table_name = 'permissions';
```
Expected: 1

### 4. Check Helper Functions
```sql
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
  AND routine_name IN ('has_permission', 'is_admin', 'get_user_role');
```
Expected: 3 rows

### 5. Check RLS Enabled
```sql
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename IN ('profiles', 'permissions') 
  AND schemaname = 'public';
```
Expected: Both should have rowsecurity = true

## Still Having Issues?

### Step 1: Clean Slate (Nuclear Option)

If nothing works, start fresh:

```sql
-- WARNING: This will delete all data!
DROP TABLE IF EXISTS public.permissions CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;
DROP FUNCTION IF EXISTS public.has_permission(UUID, VARCHAR);
DROP FUNCTION IF EXISTS public.is_admin(UUID);
DROP FUNCTION IF EXISTS public.get_user_role(UUID);
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP FUNCTION IF EXISTS update_updated_at_column();

-- Then run: 20241110_admin_system_standalone.sql
```

### Step 2: Run Migrations in Parts

Instead of running the complete file, run each part separately:

1. First, run Part 1 (Base Schema)
2. Wait for success
3. Then run Part 2 (Permissions Table)
4. Wait for success
5. Continue with remaining parts

### Step 3: Check Supabase Logs

1. Go to Supabase Dashboard
2. Navigate to **Logs** → **Database**
3. Look for error messages
4. Filter by timestamp of your migration attempt

### Step 4: Use Supabase CLI

```bash
# Install Supabase CLI
npm install -g supabase

# Link your project
supabase link --project-ref your-project-ref

# Check database status
supabase db status

# Apply migration
supabase db push
```

## Getting Help

If you're still stuck:

1. **Check the verification script output:**
   - Run `verify_admin_system_migration.sql`
   - Share the output showing which checks failed

2. **Provide context:**
   - Which migration file did you use?
   - What's your PostgreSQL version?
   - Is this a fresh database or existing?
   - What's the exact error message?

3. **Check documentation:**
   - `README_ADMIN_SYSTEM_MIGRATION.md` - Full guide
   - `ADMIN_SYSTEM_MIGRATION_CHECKLIST.md` - Step-by-step checklist
   - `.kiro/specs/admin-system-audit/design.md` - Design decisions

## Quick Reference

### Migration Files by Use Case

| Use Case | File to Use |
|----------|-------------|
| Fresh Supabase project | `20241110_admin_system_standalone.sql` |
| Existing database with profiles | `20241110_admin_system_complete.sql` |
| Got "relation does not exist" error | `20241110_admin_system_standalone.sql` |
| Want to run in parts | Individual files (profiles_update, permissions_table, rls_policies) |
| Need to verify | `verify_admin_system_migration.sql` |

### Essential Commands

```sql
-- Check what exists
\dt public.*                    -- List tables
\df public.*                    -- List functions
\d public.profiles              -- Describe profiles table
\d public.permissions           -- Describe permissions table

-- Check policies
SELECT * FROM pg_policies WHERE tablename IN ('profiles', 'permissions');

-- Check indexes
SELECT * FROM pg_indexes WHERE tablename IN ('profiles', 'permissions');

-- Test functions
SELECT public.is_admin(auth.uid());
SELECT public.get_user_role(auth.uid());
```

---

**Last Updated:** 2024-11-10  
**Migration Version:** 1.0
