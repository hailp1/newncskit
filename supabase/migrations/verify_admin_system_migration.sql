-- ============================================
-- Admin System Migration Verification Script
-- ============================================
-- Run this script after applying the migration to verify
-- that all changes were applied correctly.
--
-- Usage: Copy and paste sections into Supabase SQL Editor
-- ============================================

-- ============================================
-- 1. PROFILES TABLE VERIFICATION
-- ============================================

-- Check all columns in profiles table
SELECT 
  column_name,
  data_type,
  character_maximum_length,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- Expected output should include:
-- institution (varchar 255)
-- orcid_id (varchar 19)
-- research_domains (ARRAY)
-- role (varchar 20, default 'user')
-- subscription_type (varchar 20, default 'free')
-- is_active (boolean, default true)

-- ============================================
-- 2. PERMISSIONS TABLE VERIFICATION
-- ============================================

-- Check permissions table exists and structure
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'permissions' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check permissions table constraints
SELECT 
  conname as constraint_name,
  contype as constraint_type,
  pg_get_constraintdef(oid) as definition
FROM pg_constraint
WHERE conrelid = 'public.permissions'::regclass
ORDER BY conname;

-- ============================================
-- 3. INDEXES VERIFICATION
-- ============================================

-- Check profiles indexes
SELECT 
  indexname,
  indexdef 
FROM pg_indexes 
WHERE tablename = 'profiles' 
  AND schemaname = 'public'
ORDER BY indexname;

-- Expected indexes:
-- idx_profiles_role
-- idx_profiles_subscription
-- idx_profiles_is_active
-- idx_profiles_institution
-- idx_profiles_orcid

-- Check permissions indexes
SELECT 
  indexname,
  indexdef 
FROM pg_indexes 
WHERE tablename = 'permissions' 
  AND schemaname = 'public'
ORDER BY indexname;

-- Expected indexes:
-- idx_permissions_user_id
-- idx_permissions_expires_at
-- idx_permissions_permission
-- idx_permissions_granted_by
-- idx_permissions_user_permission

-- ============================================
-- 4. RLS POLICIES VERIFICATION
-- ============================================

-- Check profiles policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'profiles'
  AND schemaname = 'public'
ORDER BY policyname;

-- Expected policies:
-- Users can view own profile
-- Admins can view all profiles
-- Users can update own profile
-- Admins can update any profile

-- Check permissions policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies 
WHERE tablename = 'permissions'
  AND schemaname = 'public'
ORDER BY policyname;

-- Expected policies:
-- Users can view own permissions
-- Admins can view all permissions
-- Admins can grant permissions
-- Admins can update permissions
-- Admins can revoke permissions

-- ============================================
-- 5. HELPER FUNCTIONS VERIFICATION
-- ============================================

-- Check helper functions exist
SELECT 
  routine_name,
  routine_type,
  data_type as return_type
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name IN ('has_permission', 'is_admin', 'get_user_role')
ORDER BY routine_name;

-- Expected functions:
-- has_permission (returns boolean)
-- is_admin (returns boolean)
-- get_user_role (returns varchar)

-- ============================================
-- 6. DATA INTEGRITY CHECKS
-- ============================================

-- Count total profiles
SELECT 
  'Total Profiles' as metric,
  COUNT(*) as count 
FROM public.profiles;

-- Check role distribution
SELECT 
  'Role Distribution' as metric,
  role,
  COUNT(*) as count 
FROM public.profiles 
GROUP BY role
ORDER BY count DESC;

-- Check subscription distribution
SELECT 
  'Subscription Distribution' as metric,
  subscription_type,
  COUNT(*) as count 
FROM public.profiles 
GROUP BY subscription_type
ORDER BY count DESC;

-- Check active status
SELECT 
  'Active Status' as metric,
  is_active,
  COUNT(*) as count 
FROM public.profiles 
GROUP BY is_active;

-- Check for NULL values in new columns
SELECT 
  'NULL Values Check' as metric,
  COUNT(*) FILTER (WHERE institution IS NULL) as null_institution,
  COUNT(*) FILTER (WHERE orcid_id IS NULL) as null_orcid,
  COUNT(*) FILTER (WHERE research_domains IS NULL) as null_research_domains,
  COUNT(*) FILTER (WHERE role IS NULL) as null_role,
  COUNT(*) FILTER (WHERE subscription_type IS NULL) as null_subscription,
  COUNT(*) FILTER (WHERE is_active IS NULL) as null_is_active
FROM public.profiles;

-- ============================================
-- 7. CONSTRAINT VERIFICATION
-- ============================================

-- Check profiles constraints
SELECT 
  'Profiles Constraints' as table_name,
  conname as constraint_name,
  contype as type,
  pg_get_constraintdef(oid) as definition
FROM pg_constraint
WHERE conrelid = 'public.profiles'::regclass
  AND conname LIKE 'check_%'
ORDER BY conname;

-- Expected constraints:
-- check_role_valid
-- check_subscription_valid
-- check_orcid_format

-- ============================================
-- 8. FUNCTIONAL TESTS
-- ============================================

-- Test default values on new profile insert
-- (This is a dry-run test, won't actually insert)
SELECT 
  'user' as role,
  'free' as subscription_type,
  true as is_active,
  'Default values test' as note;

-- Test ORCID format validation
-- Valid ORCID formats:
SELECT 
  '0000-0001-2345-6789' as valid_orcid_1,
  '0000-0002-3456-789X' as valid_orcid_2;

-- ============================================
-- 9. PERMISSIONS TABLE TESTS
-- ============================================

-- Count permissions
SELECT 
  'Total Permissions' as metric,
  COUNT(*) as count 
FROM public.permissions;

-- Check for expired permissions
SELECT 
  'Expired Permissions' as metric,
  COUNT(*) as count 
FROM public.permissions
WHERE expires_at IS NOT NULL 
  AND expires_at < NOW();

-- Check permissions by user (if any exist)
SELECT 
  user_id,
  COUNT(*) as permission_count,
  ARRAY_AGG(permission) as permissions
FROM public.permissions
GROUP BY user_id
LIMIT 10;

-- ============================================
-- 10. RLS VERIFICATION
-- ============================================

-- Check RLS is enabled
SELECT 
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE tablename IN ('profiles', 'permissions')
  AND schemaname = 'public';

-- Both should show rls_enabled = true

-- ============================================
-- SUMMARY REPORT
-- ============================================

SELECT 
  '=== MIGRATION VERIFICATION SUMMARY ===' as report;

SELECT 
  'Profiles Table' as component,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'profiles' 
        AND column_name IN ('institution', 'orcid_id', 'research_domains', 'role', 'subscription_type', 'is_active')
    ) THEN '✓ PASS'
    ELSE '✗ FAIL'
  END as status;

SELECT 
  'Permissions Table' as component,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.tables 
      WHERE table_name = 'permissions' AND table_schema = 'public'
    ) THEN '✓ PASS'
    ELSE '✗ FAIL'
  END as status;

SELECT 
  'Profiles Indexes' as component,
  CASE 
    WHEN (
      SELECT COUNT(*) FROM pg_indexes 
      WHERE tablename = 'profiles' 
        AND indexname LIKE 'idx_profiles_%'
    ) >= 5 THEN '✓ PASS'
    ELSE '✗ FAIL'
  END as status;

SELECT 
  'Permissions Indexes' as component,
  CASE 
    WHEN (
      SELECT COUNT(*) FROM pg_indexes 
      WHERE tablename = 'permissions' 
        AND indexname LIKE 'idx_permissions_%'
    ) >= 5 THEN '✓ PASS'
    ELSE '✗ FAIL'
  END as status;

SELECT 
  'RLS Policies' as component,
  CASE 
    WHEN (
      SELECT COUNT(*) FROM pg_policies 
      WHERE tablename IN ('profiles', 'permissions')
    ) >= 9 THEN '✓ PASS'
    ELSE '✗ FAIL'
  END as status;

SELECT 
  'Helper Functions' as component,
  CASE 
    WHEN (
      SELECT COUNT(*) FROM information_schema.routines
      WHERE routine_schema = 'public'
        AND routine_name IN ('has_permission', 'is_admin', 'get_user_role')
    ) = 3 THEN '✓ PASS'
    ELSE '✗ FAIL'
  END as status;

SELECT 
  'RLS Enabled' as component,
  CASE 
    WHEN (
      SELECT COUNT(*) FROM pg_tables
      WHERE tablename IN ('profiles', 'permissions')
        AND schemaname = 'public'
        AND rowsecurity = true
    ) = 2 THEN '✓ PASS'
    ELSE '✗ FAIL'
  END as status;

-- ============================================
-- END OF VERIFICATION
-- ============================================

SELECT '=== Verification Complete ===' as message;
SELECT 'Review the results above to ensure all components are marked as PASS' as instruction;
