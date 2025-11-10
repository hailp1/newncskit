-- ============================================================================
-- Diagnose Column Name Issue
-- ============================================================================
-- Description: Find out what columns actually exist in analysis_variables
-- Date: 2024-11-10
-- ============================================================================

-- Show ALL columns in analysis_variables table
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default,
  ordinal_position
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'analysis_variables'
ORDER BY ordinal_position;

-- Show table structure
\d analysis_variables

-- Count rows
SELECT COUNT(*) as row_count FROM analysis_variables;

-- Show sample data (if any)
SELECT * FROM analysis_variables LIMIT 1;

