-- ============================================================================
-- QUICK FIX - Run This First
-- ============================================================================
-- This script will show you what columns exist and help diagnose the issue
-- ============================================================================

-- Step 1: Show all columns in analysis_variables
SELECT 
  '=== COLUMNS IN analysis_variables ===' as info;

SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'analysis_variables'
ORDER BY ordinal_position;

-- Step 2: Check for foreign key constraints
SELECT 
  '=== FOREIGN KEY CONSTRAINTS ===' as info;

SELECT
  tc.constraint_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_name = 'analysis_variables';

-- Step 3: Show current RLS policies
SELECT 
  '=== RLS POLICIES ===' as info;

SELECT
  policyname,
  cmd as operation
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename = 'analysis_variables';

-- Step 4: Count existing data
SELECT 
  '=== DATA COUNT ===' as info;

SELECT 
  COUNT(*) as total_variables,
  COUNT(DISTINCT CASE 
    WHEN column_name = 'project_id' THEN 1
    WHEN column_name = 'analysis_project_id' THEN 1
    ELSE NULL
  END) as has_project_reference
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'analysis_variables';

