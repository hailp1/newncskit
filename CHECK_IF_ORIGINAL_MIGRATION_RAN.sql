-- ============================================================================
-- Check if Original Migration Was Run
-- ============================================================================
-- Run this to see if the original 20240107_create_analysis_tables.sql was executed
-- ============================================================================

-- Check if tables exist
SELECT 
  'Tables Check' as check_type,
  table_name,
  CASE 
    WHEN table_name IS NOT NULL THEN '✓ EXISTS'
    ELSE '✗ MISSING'
  END as status
FROM (
  VALUES 
    ('analysis_projects'),
    ('analysis_variables'),
    ('variable_groups')
) AS expected(table_name)
LEFT JOIN information_schema.tables t 
  ON t.table_name = expected.table_name 
  AND t.table_schema = 'public';

-- Check column name in analysis_variables
SELECT 
  'Column Check' as check_type,
  'analysis_variables.project_id' as column_name,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public'
      AND table_name = 'analysis_variables'
      AND column_name = 'project_id'
    ) THEN '✓ EXISTS (CORRECT)'
    WHEN EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public'
      AND table_name = 'analysis_variables'
      AND column_name = 'analysis_project_id'
    ) THEN '✗ WRONG NAME (analysis_project_id)'
    ELSE '✗ TABLE MISSING'
  END as status;

-- Show actual columns if table exists
SELECT 
  'Actual Columns' as info,
  column_name,
  data_type
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'analysis_variables'
ORDER BY ordinal_position;

