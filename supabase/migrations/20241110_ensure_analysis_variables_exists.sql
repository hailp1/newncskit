-- ============================================================================
-- Ensure analysis_variables Table Exists with Correct Schema
-- ============================================================================
-- This will check if table exists and create/fix it if needed
-- ============================================================================

-- Check if table exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'analysis_variables'
  ) THEN
    RAISE NOTICE 'Table analysis_variables does not exist! Creating it...';
    
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
      variable_group_id UUID,
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
    
    -- Enable RLS
    ALTER TABLE analysis_variables ENABLE ROW LEVEL SECURITY;
    
    RAISE NOTICE 'Table analysis_variables created successfully';
  ELSE
    RAISE NOTICE 'Table analysis_variables already exists';
  END IF;
END $$;

-- Now check and fix column name if needed
DO $$
DECLARE
  v_has_project_id BOOLEAN;
  v_has_analysis_project_id BOOLEAN;
BEGIN
  -- Check which column exists
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'analysis_variables' 
    AND column_name = 'project_id'
  ) INTO v_has_project_id;
  
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'analysis_variables' 
    AND column_name = 'analysis_project_id'
  ) INTO v_has_analysis_project_id;
  
  IF v_has_project_id THEN
    RAISE NOTICE '✓ Column project_id exists - correct!';
  ELSIF v_has_analysis_project_id THEN
    RAISE NOTICE 'Found analysis_project_id, renaming to project_id...';
    ALTER TABLE analysis_variables RENAME COLUMN analysis_project_id TO project_id;
    RAISE NOTICE '✓ Renamed to project_id';
  ELSE
    RAISE EXCEPTION 'Neither project_id nor analysis_project_id found in analysis_variables!';
  END IF;
END $$;

-- Create/update RLS policies
DROP POLICY IF EXISTS "Users can view variables of their projects" ON analysis_variables;
DROP POLICY IF EXISTS "Users can insert variables for their projects" ON analysis_variables;
DROP POLICY IF EXISTS "Users can update variables of their projects" ON analysis_variables;
DROP POLICY IF EXISTS "Users can delete variables of their projects" ON analysis_variables;
DROP POLICY IF EXISTS "Users can manage variables of their projects" ON analysis_variables;

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

-- Final verification
DO $$
BEGIN
  RAISE NOTICE '=== FINAL STATUS ===';
  RAISE NOTICE 'Table: analysis_variables';
  RAISE NOTICE 'Column: project_id';
  RAISE NOTICE 'RLS: 4 policies created';
  RAISE NOTICE 'Ready for use!';
END $$;

