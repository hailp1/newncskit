-- ============================================================================
-- SIMPLE FIX: Rename column if needed
-- ============================================================================
-- Just run this - it will check and fix automatically
-- ============================================================================

-- Check if we need to rename the column
DO $$
DECLARE
  has_wrong_name BOOLEAN;
BEGIN
  -- Check if column has wrong name
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public'
    AND table_name = 'analysis_variables' 
    AND column_name = 'analysis_project_id'
  ) INTO has_wrong_name;

  -- Rename if needed
  IF has_wrong_name THEN
    RAISE NOTICE 'Found analysis_project_id - renaming to project_id...';
    ALTER TABLE analysis_variables 
    RENAME COLUMN analysis_project_id TO project_id;
    RAISE NOTICE '✓ Column renamed successfully!';
  ELSE
    RAISE NOTICE '✓ Column name is already correct (project_id)';
  END IF;
END $$;

-- Verify the result
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public'
AND table_name = 'analysis_variables' 
AND column_name = 'project_id';

