-- ============================================================================
-- HOTFIX: Fix analysis_variables column name
-- ============================================================================
-- Date: 2024-11-10
-- Issue: Column 'project_id' not found in schema cache
-- Solution: Check and rename column if needed
-- ============================================================================

-- Step 1: Check if table exists and what columns it has
DO $$
DECLARE
  table_exists BOOLEAN;
  has_project_id BOOLEAN;
  has_analysis_project_id BOOLEAN;
BEGIN
  -- Check if table exists
  SELECT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'analysis_variables'
  ) INTO table_exists;

  IF NOT table_exists THEN
    RAISE NOTICE 'Table analysis_variables does NOT exist - will be created';
    
    -- Create the table with correct schema
    CREATE TABLE analysis_variables (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      project_id UUID REFERENCES analysis_projects(id) ON DELETE CASCADE NOT NULL,
      column_name VARCHAR(255) NOT NULL,
      display_name VARCHAR(255),
      data_type VARCHAR(50) CHECK (data_type IN ('numeric', 'categorical', 'text', 'date')),
      is_demographic BOOLEAN DEFAULT FALSE,
      demographic_type VARCHAR(50) CHECK (demographic_type IN ('categorical', 'ordinal', 'continuous')),
      semantic_name VARCHAR(100),
      variable_group_id UUID REFERENCES variable_groups(id) ON DELETE SET NULL,
      missing_count INTEGER DEFAULT 0,
      unique_count INTEGER DEFAULT 0,
      min_value NUMERIC,
      max_value NUMERIC,
      mean_value NUMERIC,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      UNIQUE(project_id, column_name)
    );

    -- Create indexes
    CREATE INDEX idx_analysis_variables_project ON analysis_variables(project_id);
    CREATE INDEX idx_analysis_variables_demographic ON analysis_variables(is_demographic);
    CREATE INDEX idx_analysis_variables_group ON analysis_variables(variable_group_id);

    -- Enable RLS
    ALTER TABLE analysis_variables ENABLE ROW LEVEL SECURITY;

    -- Create RLS policies
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

    RAISE NOTICE '✓ Table analysis_variables created with project_id column';
    RETURN;
  END IF;

  -- Table exists, check columns
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'analysis_variables' 
    AND column_name = 'project_id'
  ) INTO has_project_id;

  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'analysis_variables' 
    AND column_name = 'analysis_project_id'
  ) INTO has_analysis_project_id;

  RAISE NOTICE 'Table analysis_variables exists';
  RAISE NOTICE 'Has project_id column: %', has_project_id;
  RAISE NOTICE 'Has analysis_project_id column: %', has_analysis_project_id;

  -- Fix column name if needed
  IF has_analysis_project_id AND NOT has_project_id THEN
    RAISE NOTICE 'Renaming analysis_project_id to project_id...';
    
    -- Rename the column
    ALTER TABLE analysis_variables 
    RENAME COLUMN analysis_project_id TO project_id;
    
    RAISE NOTICE '✓ Column renamed from analysis_project_id to project_id';
  ELSIF has_project_id THEN
    RAISE NOTICE '✓ Column project_id already exists - no action needed';
  ELSE
    RAISE EXCEPTION 'Table exists but has neither project_id nor analysis_project_id column!';
  END IF;
END $$;

-- Step 2: Verify the fix
DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '=== VERIFICATION ===';
  RAISE NOTICE 'Run this query to verify:';
  RAISE NOTICE 'SELECT column_name, data_type FROM information_schema.columns';
  RAISE NOTICE 'WHERE table_name = ''analysis_variables'' AND column_name LIKE ''%project%'';';
  RAISE NOTICE '';
END $$;

