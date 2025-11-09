# Admin System Migration - Quick Start

## 🚀 5-Minute Setup

### Step 1: Choose Your Migration (30 seconds)

**Got "relation public.profiles does not exist" error?**
→ Use `20241110_admin_system_standalone.sql` ✅

**Have an existing database with profiles table?**
→ Use `20241110_admin_system_complete.sql`

**Not sure?**
→ Use `20241110_admin_system_standalone.sql` (safer option)

---

### Step 2: Run Migration (2 minutes)

1. Open [Supabase Dashboard](https://app.supabase.com)
2. Go to **SQL Editor**
3. Click **New Query**
4. Copy & paste the chosen migration file
5. Click **Run** (or Ctrl+Enter)
6. Wait for "Success" message

---

### Step 3: Verify (1 minute)

Run this quick check:

```sql
-- Should return 2 rows (profiles, permissions)
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('profiles', 'permissions');

-- Should return 6 rows (new columns)
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'profiles' 
  AND column_name IN ('institution', 'orcid_id', 'research_domains', 'role', 'subscription_type', 'is_active');
```

Both queries should return the expected number of rows.

---

### Step 4: Create Admin User (1 minute)

```sql
-- Replace with your email
UPDATE public.profiles 
SET role = 'super_admin', is_active = true
WHERE email = 'your-email@example.com';

-- Verify
SELECT email, role, is_active 
FROM public.profiles 
WHERE role = 'super_admin';
```

---

### Step 5: Test (30 seconds)

```sql
-- Test helper functions
SELECT public.is_admin(auth.uid()) as am_i_admin;
SELECT public.get_user_role(auth.uid()) as my_role;

-- Grant yourself a test permission
INSERT INTO public.permissions (user_id, permission, granted_by)
VALUES (auth.uid(), 'test_permission', auth.uid());

-- Check it works
SELECT public.has_permission(auth.uid(), 'test_permission') as has_test;
```

---

## ✅ Done!

Your admin system is now set up with:
- ✅ Enhanced profiles table (role, subscription, institution, ORCID)
- ✅ Permissions table for granular access control
- ✅ RLS policies for security
- ✅ Helper functions (is_admin, has_permission, get_user_role)

---

## 🆘 Got an Error?

### "relation public.profiles does not exist"
→ Use `20241110_admin_system_standalone.sql` instead

### "column already exists"
→ Migration already ran successfully, you're good!

### "policy already exists"
→ Migration already ran successfully, you're good!

### Other errors?
→ See `TROUBLESHOOTING.md` for detailed solutions

---

## 📚 Next Steps

1. **Verify everything works:**
   ```bash
   # Run full verification
   # Copy & paste: verify_admin_system_migration.sql
   ```

2. **Update your application:**
   - Phase 2: Service Layer (Tasks 2-4)
   - Phase 3: Utilities (Tasks 5-6)
   - Phase 4: UI Components (Tasks 7-10)

3. **Read the docs:**
   - `README_ADMIN_SYSTEM_MIGRATION.md` - Full guide
   - `ADMIN_SYSTEM_MIGRATION_CHECKLIST.md` - Deployment checklist
   - `TROUBLESHOOTING.md` - Common issues

---

## 🎯 Quick Reference

| File | Purpose |
|------|---------|
| `20241110_admin_system_standalone.sql` | **Use this for fresh databases** ⭐ |
| `20241110_admin_system_complete.sql` | Use for existing databases with profiles |
| `verify_admin_system_migration.sql` | Verify migration success |
| `TROUBLESHOOTING.md` | Fix common errors |

---

**Time to complete:** ~5 minutes  
**Difficulty:** Easy  
**Prerequisites:** Supabase account with project

**Questions?** Check `TROUBLESHOOTING.md` or the full `README_ADMIN_SYSTEM_MIGRATION.md`
