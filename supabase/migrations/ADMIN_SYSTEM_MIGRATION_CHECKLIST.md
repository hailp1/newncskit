# Admin System Migration Checklist

## Pre-Migration Checklist

- [ ] **Backup Database**
  - Go to Supabase Dashboard > Database > Backups
  - Create a manual backup before proceeding
  - Note the backup timestamp

- [ ] **Review Migration Files**
  - [ ] Read `README_ADMIN_SYSTEM_MIGRATION.md`
  - [ ] Review `20241110_admin_system_complete.sql`
  - [ ] Understand the changes being made

- [ ] **Test Environment Ready**
  - [ ] Have access to Supabase Dashboard
  - [ ] Have SQL Editor access
  - [ ] Have admin credentials ready

## Migration Steps

### Step 1: Run Migration on Development/Local

- [ ] Open Supabase Dashboard for your development project
- [ ] Navigate to **SQL Editor**
- [ ] Click **New Query**
- [ ] Copy contents of `supabase/migrations/20241110_admin_system_complete.sql`
- [ ] Paste into editor
- [ ] Click **Run** (or press Ctrl+Enter)
- [ ] Wait for completion message
- [ ] Check for any errors in output

### Step 2: Verify Migration

- [ ] Open new SQL Editor tab
- [ ] Copy contents of `supabase/migrations/verify_admin_system_migration.sql`
- [ ] Run verification script
- [ ] Review all sections:
  - [ ] Profiles table has new columns
  - [ ] Permissions table exists
  - [ ] All indexes created
  - [ ] RLS policies in place
  - [ ] Helper functions exist
  - [ ] All checks show ✓ PASS

### Step 3: Test Functionality

#### Test 1: Profile Updates
```sql
-- Update your own profile with new fields
UPDATE public.profiles 
SET 
  institution = 'Test University',
  orcid_id = '0000-0001-2345-6789',
  research_domains = ARRAY['Computer Science', 'Data Science'],
  role = 'user',
  subscription_type = 'free',
  is_active = true
WHERE id = auth.uid();

-- Verify update
SELECT * FROM public.profiles WHERE id = auth.uid();
```
- [ ] Update successful
- [ ] All new fields populated correctly

#### Test 2: Create Admin User
```sql
-- Create or update a user to admin role
UPDATE public.profiles 
SET role = 'super_admin', is_active = true
WHERE email = 'your-admin-email@example.com';

-- Verify admin role
SELECT id, email, role, is_active 
FROM public.profiles 
WHERE role IN ('admin', 'super_admin');
```
- [ ] Admin user created/updated
- [ ] Role set correctly

#### Test 3: Test Helper Functions
```sql
-- Test is_admin function
SELECT public.is_admin(auth.uid()) as am_i_admin;

-- Test get_user_role function
SELECT public.get_user_role(auth.uid()) as my_role;

-- Test has_permission function (will return false if no permissions yet)
SELECT public.has_permission(auth.uid(), 'test_permission') as has_test_perm;
```
- [ ] is_admin returns correct value
- [ ] get_user_role returns correct role
- [ ] has_permission executes without error

#### Test 4: Grant Permission
```sql
-- Grant a test permission (as admin)
INSERT INTO public.permissions (user_id, permission, granted_by)
VALUES (auth.uid(), 'test_permission', auth.uid());

-- Verify permission
SELECT * FROM public.permissions WHERE user_id = auth.uid();

-- Test has_permission again
SELECT public.has_permission(auth.uid(), 'test_permission') as has_test_perm;
```
- [ ] Permission granted successfully
- [ ] Permission visible in table
- [ ] has_permission returns true

#### Test 5: RLS Policies
```sql
-- As regular user, try to view all profiles (should only see own)
SELECT COUNT(*) as profiles_i_can_see FROM public.profiles;

-- As admin, should see all profiles
-- (Switch to admin user or update your role first)
```
- [ ] Regular users see only their profile
- [ ] Admins see all profiles

### Step 4: Data Migration (if needed)

If you have existing users that need default values:

```sql
-- Set default values for existing users
UPDATE public.profiles 
SET 
  role = COALESCE(role, 'user'),
  subscription_type = COALESCE(subscription_type, 'free'),
  is_active = COALESCE(is_active, true)
WHERE role IS NULL 
   OR subscription_type IS NULL 
   OR is_active IS NULL;

-- Verify all users have values
SELECT 
  COUNT(*) as total,
  COUNT(*) FILTER (WHERE role IS NOT NULL) as has_role,
  COUNT(*) FILTER (WHERE subscription_type IS NOT NULL) as has_subscription,
  COUNT(*) FILTER (WHERE is_active IS NOT NULL) as has_active
FROM public.profiles;
```
- [ ] All existing users have default values
- [ ] No NULL values in required fields

## Post-Migration Tasks

### Application Updates

- [ ] **Update Frontend Services**
  - [ ] UserService to use new profile fields
  - [ ] PermissionService to use permissions table
  - [ ] ProfileService to handle new fields

- [ ] **Update API Endpoints**
  - [ ] User management endpoints
  - [ ] Permission management endpoints
  - [ ] Profile endpoints

- [ ] **Update UI Components**
  - [ ] User management page
  - [ ] Permission management page
  - [ ] Settings page
  - [ ] Profile page

### Testing

- [ ] **Unit Tests**
  - [ ] Test service methods
  - [ ] Test validation functions
  - [ ] Test error handlers

- [ ] **Integration Tests**
  - [ ] Test API calls
  - [ ] Test database operations
  - [ ] Test permission checks

- [ ] **E2E Tests**
  - [ ] Test user management workflow
  - [ ] Test permission assignment
  - [ ] Test profile updates

### Documentation

- [ ] Update API documentation
- [ ] Update user guide
- [ ] Update admin guide
- [ ] Document new permission system

## Staging Environment

- [ ] Repeat all steps above on staging
- [ ] Perform full regression testing
- [ ] Test with real user data
- [ ] Monitor for 24-48 hours
- [ ] Fix any issues found

## Production Deployment

### Pre-Deployment

- [ ] **Schedule Maintenance Window**
  - [ ] Notify users in advance
  - [ ] Choose low-traffic time
  - [ ] Prepare rollback plan

- [ ] **Final Checks**
  - [ ] Staging tests all pass
  - [ ] Backup verified
  - [ ] Rollback script ready
  - [ ] Team on standby

### Deployment

- [ ] **Create Production Backup**
  ```
  Timestamp: _______________
  Backup ID: _______________
  ```

- [ ] **Run Migration**
  - [ ] Open production Supabase Dashboard
  - [ ] Run `20241110_admin_system_complete.sql`
  - [ ] Verify no errors
  - [ ] Run verification script
  - [ ] All checks pass

- [ ] **Deploy Application Code**
  - [ ] Deploy frontend updates
  - [ ] Deploy backend updates (if any)
  - [ ] Clear CDN cache
  - [ ] Verify deployment

### Post-Deployment

- [ ] **Immediate Checks (0-15 min)**
  - [ ] Site loads correctly
  - [ ] Users can login
  - [ ] Admin pages accessible
  - [ ] No console errors
  - [ ] No 500 errors in logs

- [ ] **Short-term Monitoring (15 min - 2 hours)**
  - [ ] Monitor error rates
  - [ ] Check API response times
  - [ ] Verify user actions work
  - [ ] Check database performance
  - [ ] Monitor user feedback

- [ ] **Long-term Monitoring (2-24 hours)**
  - [ ] Daily active users normal
  - [ ] No unusual error patterns
  - [ ] Performance metrics stable
  - [ ] User satisfaction maintained

## Rollback Procedure

If issues occur:

1. **Immediate Actions**
   - [ ] Stop deployment
   - [ ] Assess severity
   - [ ] Notify team

2. **Execute Rollback**
   - [ ] Revert application code
   - [ ] Run rollback SQL (see README)
   - [ ] Restore from backup if needed
   - [ ] Clear caches

3. **Post-Rollback**
   - [ ] Verify system stable
   - [ ] Notify users
   - [ ] Document issues
   - [ ] Plan fix

## Success Criteria

- [ ] All migration steps completed without errors
- [ ] All verification checks pass
- [ ] All tests pass
- [ ] No increase in error rates
- [ ] User feedback positive
- [ ] Performance metrics stable
- [ ] Admin functionality works
- [ ] Permission system operational

## Sign-Off

### Development
- Executed by: _______________
- Date: _______________
- Status: ☐ Success ☐ Failed ☐ Rolled Back
- Notes: _______________

### Staging
- Executed by: _______________
- Date: _______________
- Status: ☐ Success ☐ Failed ☐ Rolled Back
- Notes: _______________

### Production
- Executed by: _______________
- Date: _______________
- Status: ☐ Success ☐ Failed ☐ Rolled Back
- Notes: _______________

## Notes and Issues

### Issues Encountered
```
Issue 1:
Description: 
Resolution:
Date:

Issue 2:
Description:
Resolution:
Date:
```

### Lessons Learned
```
1.

2.

3.
```

## Contact Information

- Database Admin: _______________
- DevOps Lead: _______________
- Backend Lead: _______________
- Frontend Lead: _______________

---

**Migration Version:** 1.0  
**Created:** 2024-11-10  
**Last Updated:** 2024-11-10
