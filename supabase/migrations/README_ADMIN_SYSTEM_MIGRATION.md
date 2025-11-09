# Admin System Migration Guide

## Overview

This guide provides instructions for running the admin system database migrations that add:
- Enhanced profiles table with role, subscription, institution, and ORCID fields
- Permissions table for granular access control
- RLS policies for admin access management
- Helper functions for permission checks

## Migration Files

### For Existing Databases (with profiles table)
1. **20241110_admin_system_profiles_update.sql** - Profiles table updates
2. **20241110_admin_system_permissions_table.sql** - Permissions table creation
3. **20241110_admin_system_rls_policies.sql** - RLS policies setup
4. **20241110_admin_system_complete.sql** - Combined migration (includes base schema check)

### For Fresh/New Databases
5. **20241110_admin_system_standalone.sql** - Complete standalone migration (recommended for new databases)

## Running Migrations

### Choose Your Migration Path

**If you have an existing database with profiles table:**
- Use `20241110_admin_system_complete.sql`

**If you have a fresh/new database OR got "relation does not exist" error:**
- Use `20241110_admin_system_standalone.sql` (includes base schema)

### Option 1: Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Click **New Query**
4. Copy the contents of the appropriate migration file:
   - **Fresh database:** `20241110_admin_system_standalone.sql`
   - **Existing database:** `20241110_admin_system_complete.sql`
5. Paste into the editor
6. Click **Run** to execute

### Option 2: Command Line (psql)

```bash
# Set your database connection details
export PGHOST=your-project.supabase.co
export PGUSER=postgres
export PGDATABASE=postgres
export PGPASSWORD=your-password

# Run the complete migration
psql -f supabase/migrations/20241110_admin_system_complete.sql
```

### Option 3: Supabase CLI

```bash
# Link your project (if not already linked)
supabase link --project-ref your-project-ref

# Apply migrations
supabase db push
```

## Verification Steps

After running the migration, verify the changes:

### 1. Check Profiles Table Structure

```sql
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' AND table_schema = 'public'
ORDER BY ordinal_position;
```

Expected new columns:
- `institution` (VARCHAR 255)
- `orcid_id` (VARCHAR 19)
- `research_domains` (TEXT[])
- `role` (VARCHAR 20, default 'user')
- `subscription_type` (VARCHAR 20, default 'free')
- `is_active` (BOOLEAN, default true)

### 2. Check Permissions Table

```sql
SELECT * FROM information_schema.tables 
WHERE table_name = 'permissions' AND table_schema = 'public';
```

### 3. Verify Indexes

```sql
SELECT 
  tablename,
  indexname,
  indexdef 
FROM pg_indexes 
WHERE tablename IN ('profiles', 'permissions')
  AND schemaname = 'public'
ORDER BY tablename, indexname;
```

Expected indexes on profiles:
- `idx_profiles_role`
- `idx_profiles_subscription`
- `idx_profiles_is_active`
- `idx_profiles_institution`
- `idx_profiles_orcid`

Expected indexes on permissions:
- `idx_permissions_user_id`
- `idx_permissions_expires_at`
- `idx_permissions_permission`
- `idx_permissions_granted_by`
- `idx_permissions_user_permission`

### 4. Check RLS Policies

```sql
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  cmd
FROM pg_policies 
WHERE tablename IN ('profiles', 'permissions')
ORDER BY tablename, policyname;
```

Expected policies on profiles:
- Users can view own profile
- Admins can view all profiles
- Users can update own profile
- Admins can update any profile

Expected policies on permissions:
- Users can view own permissions
- Admins can view all permissions
- Admins can grant permissions
- Admins can update permissions
- Admins can revoke permissions

### 5. Test Helper Functions

```sql
-- Test is_admin function (replace with actual user ID)
SELECT public.is_admin('your-user-id-here'::UUID);

-- Test get_user_role function
SELECT public.get_user_role('your-user-id-here'::UUID);

-- Test has_permission function
SELECT public.has_permission(
  'your-user-id-here'::UUID, 
  'create_post'
);
```

## Data Integrity Checks

### Check Existing Data

```sql
-- Count profiles
SELECT COUNT(*) as total_profiles FROM public.profiles;

-- Check role distribution
SELECT role, COUNT(*) as count 
FROM public.profiles 
GROUP BY role;

-- Check subscription types
SELECT subscription_type, COUNT(*) as count 
FROM public.profiles 
GROUP BY subscription_type;

-- Check active users
SELECT is_active, COUNT(*) as count 
FROM public.profiles 
GROUP BY is_active;
```

### Verify Constraints

```sql
-- Check constraints on profiles table
SELECT 
  conname as constraint_name,
  contype as constraint_type,
  pg_get_constraintdef(oid) as definition
FROM pg_constraint
WHERE conrelid = 'public.profiles'::regclass
ORDER BY conname;
```

## Rollback Plan

If you need to rollback the migration:

```sql
BEGIN;

-- Drop helper functions
DROP FUNCTION IF EXISTS public.has_permission(UUID, VARCHAR);
DROP FUNCTION IF EXISTS public.is_admin(UUID);
DROP FUNCTION IF EXISTS public.get_user_role(UUID);

-- Drop policies
DROP POLICY IF EXISTS "Users can view own permissions" ON public.permissions;
DROP POLICY IF EXISTS "Admins can view all permissions" ON public.permissions;
DROP POLICY IF EXISTS "Admins can grant permissions" ON public.permissions;
DROP POLICY IF EXISTS "Admins can update permissions" ON public.permissions;
DROP POLICY IF EXISTS "Admins can revoke permissions" ON public.permissions;

-- Drop permissions table
DROP TABLE IF EXISTS public.permissions;

-- Remove new columns from profiles
ALTER TABLE public.profiles 
  DROP COLUMN IF EXISTS institution,
  DROP COLUMN IF EXISTS orcid_id,
  DROP COLUMN IF EXISTS research_domains,
  DROP COLUMN IF EXISTS role,
  DROP COLUMN IF EXISTS subscription_type,
  DROP COLUMN IF EXISTS is_active;

COMMIT;
```

## Post-Migration Tasks

1. **Create Initial Admin User**
   ```sql
   -- Update an existing user to admin role
   UPDATE public.profiles 
   SET role = 'super_admin', is_active = true
   WHERE email = 'your-admin-email@example.com';
   ```

2. **Grant Initial Permissions** (if needed)
   ```sql
   -- Example: Grant blog management permissions
   INSERT INTO public.permissions (user_id, permission, granted_by)
   VALUES 
     ('admin-user-id', 'manage_users', 'admin-user-id'),
     ('admin-user-id', 'manage_permissions', 'admin-user-id');
   ```

3. **Update Application Code**
   - Update frontend services to use new fields
   - Update API endpoints to handle new permissions
   - Test admin functionality

## Troubleshooting

### Issue: Migration fails with "column already exists"

**Solution:** The migration uses `IF NOT EXISTS` clauses, but if you need to re-run:
```sql
-- Check which columns exist
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'profiles' AND table_schema = 'public';
```

### Issue: RLS policies conflict

**Solution:** Drop existing policies first:
```sql
DROP POLICY IF EXISTS "policy_name" ON public.profiles;
```

### Issue: Permission denied errors

**Solution:** Ensure you're connected as a superuser or database owner:
```sql
-- Check current role
SELECT current_user, current_database();

-- Grant necessary permissions
GRANT ALL ON public.profiles TO postgres;
GRANT ALL ON public.permissions TO postgres;
```

## Support

For issues or questions:
1. Check the verification queries above
2. Review the migration SQL for any errors
3. Check Supabase logs in the dashboard
4. Consult the design document at `.kiro/specs/admin-system-audit/design.md`

## Migration Checklist

- [ ] Backup database before migration
- [ ] Review migration SQL files
- [ ] Run migration on local/development database first
- [ ] Verify all checks pass
- [ ] Test admin functionality
- [ ] Run migration on staging database
- [ ] Verify staging environment
- [ ] Run migration on production database
- [ ] Verify production environment
- [ ] Create initial admin user
- [ ] Update application code
- [ ] Monitor for errors

---

**Migration Date:** 2024-11-10  
**Version:** 1.0  
**Status:** Ready for execution
