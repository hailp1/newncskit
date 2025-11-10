-- ============================================================================
-- Check and Fix Column Name in analysis_variables
-- ============================================================================
-- Description: Rename analysis_project_id to project_id if it exists
-- Date: 2024-11-10
-- Issue: "Could not find the 'project_id' column in the schema cache"
-- ============================================================================

-- Check if analysis_project_id column exists and rename it to project_id
DO $$
DECLARE
  v_column_name TEXT;
BEGIN
  -- First, find what column actually exists for the project reference
  SELECT column_name INTO v_column_name
  FROM information_schema.columns 
  WHERE table_schema = 'public' 
    AND table_name = 'analysis_variables' 
    AND column_name IN ('project_id', 'analysis_project_id')
  LIMIT 1;
  
  IF v_column_name IS NULL THEN
    RAISE NOTICE 'No project reference column found! Checking all columns...';
    
    -- Show all columns for debugging
    FOR v_column_name IN 
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
        AND table_name = 'analysis_variables'
      ORDER BY ordinal_position
    LOOP
      RAISE NOTICE 'Found column: %', v_column_name;
    END LOOP;
    
    RAISE EXCEPTION 'Cannot find project reference column in analysis_variables table';
  END IF;
  
  RAISE NOTICE 'Found project reference column: %', v_column_name;
  
  -- If it's analysis_project_id, rename it
  IF v_column_name = 'analysis_project_id' THEN
    ALTER TABLE analysis_variables 
    RENAME COLUMN analysis_project_id TO project_id;
    
    RAISE NOTICE 'Renamed analysis_project_id to project_id';
  ELSIF v_column_name = 'project_id' THEN
    RAISE NOTICE 'Column already named project_id - no action needed';
  END IF;
  
  -- Final verification
  IF EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'analysis_variables' 
    AND column_name = 'project_id'
  ) THEN
    RAISE NOTICE '✓ Column project_id exists - OK';
  ELSE
    RAISE EXCEPTION 'Column project_id does not exist after migration!';
  END IF;
END $$;

-- Update indexes if needed
DROP INDEX IF EXISTS idx_analysis_variables_analysis_project;
CREATE INDEX IF NOT EXISTS idx_analysis_variables_project ON analysis_variables(project_id);

-- Update RLS policies to use correct column name
DROP POLICY IF EXISTS "Users can view variables of their projects" ON analysis_variables;
DROP POLICY IF EXISTS "Users can insert variables for their projects" ON analysis_variables;
DROP POLICY IF EXISTS "Users can update variables of their projects" ON analysis_variables;
DROP POLICY IF EXISTS "Users can delete variables of their projects" ON analysis_variables;

-- Recreate RLS policies with correct column name
CREATE POLICY "Users can view variables of their projects"
  ON analysis_variables FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM analysis_projects
      WHERE analysis_projects.id = analysis_variables.project_id
      AND analysis_projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert variables for their projects"
  ON analysis_variables FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM analysis_projects
      WHERE analysis_projects.id = analysis_variables.project_id
      AND analysis_projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update variables of their projects"
  ON analysis_variables FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM analysis_projects
      WHERE analysis_projects.id = analysis_variables.project_id
      AND analysis_projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete variables of their projects"
  ON analysis_variables FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM analysis_projects
      WHERE analysis_projects.id = analysis_variables.project_id
      AND analysis_projects.user_id = auth.uid()
    )
  );

-- Log completion
DO $$
BEGIN
  RAISE NOTICE '=== Migration Complete ===';
  RAISE NOTICE 'Column name: project_id';
  RAISE NOTICE 'Index: idx_analysis_variables_project';
  RAISE NOTICE 'RLS policies: 4 policies created';
END $$;

