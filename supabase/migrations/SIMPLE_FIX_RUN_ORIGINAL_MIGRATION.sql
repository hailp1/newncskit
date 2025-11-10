-- ============================================================================
-- SIMPLE FIX: Run Original Migration
-- ============================================================================
-- This runs the ORIGINAL 20240107_create_analysis_tables.sql migration
-- which creates tables with CORRECT schema (project_id, not analysis_project_id)
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- Table: analysis_projects
-- ============================================================================

CREATE TABLE IF NOT EXISTS analysis_projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  csv_file_path TEXT NOT NULL,
  csv_file_size INTEGER NOT NULL,
  row_count INTEGER NOT NULL,
  column_count INTEGER NOT NULL,
  status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'configured', 'analyzing', 'completed', 'error')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_analysis_projects_user ON analysis_projects(user_id);
CREATE INDEX IF NOT EXISTS idx_analysis_projects_status ON analysis_projects(status);
CREATE INDEX IF NOT EXISTS idx_analysis_projects_created ON analysis_projects(created_at DESC);

ALTER TABLE analysis_projects ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own projects" ON analysis_projects;
DROP POLICY IF EXISTS "Users can create their own projects" ON analysis_projects;
DROP POLICY IF EXISTS "Users can update their own projects" ON analysis_projects;
DROP POLICY IF EXISTS "Users can delete their own projects" ON analysis_projects;

CREATE POLICY "Users can view their own projects"
  ON analysis_projects FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own projects"
  ON analysis_projects FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own projects"
  ON analysis_projects FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own projects"
  ON analysis_projects FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- Table: analysis_variables (with project_id - CORRECT NAME!)
-- ============================================================================

CREATE TABLE IF NOT EXISTS analysis_variables (
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

CREATE INDEX IF NOT EXISTS idx_analysis_variables_project ON analysis_variables(project_id);
CREATE INDEX IF NOT EXISTS idx_analysis_variables_demographic ON analysis_variables(is_demographic);

ALTER TABLE analysis_variables ENABLE ROW LEVEL SECURITY;

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

-- ============================================================================
-- Table: variable_groups
-- ============================================================================

CREATE TABLE IF NOT EXISTS variable_groups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES analysis_projects(id) ON DELETE CASCADE NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  group_type VARCHAR(50) DEFAULT 'construct' CHECK (group_type IN ('construct', 'demographic', 'control')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_variable_groups_project ON variable_groups(project_id);

ALTER TABLE variable_groups ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view groups of their projects" ON variable_groups;
DROP POLICY IF EXISTS "Users can manage groups of their projects" ON variable_groups;

CREATE POLICY "Users can view groups of their projects"
  ON variable_groups FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM analysis_projects
      WHERE analysis_projects.id = variable_groups.project_id
      AND analysis_projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage groups of their projects"
  ON variable_groups FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM analysis_projects
      WHERE analysis_projects.id = variable_groups.project_id
      AND analysis_projects.user_id = auth.uid()
    )
  );

-- ============================================================================
-- DONE!
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE 'MIGRATION COMPLETE!';
  RAISE NOTICE '========================================';
  RAISE NOTICE '';
  RAISE NOTICE '✓ analysis_projects created';
  RAISE NOTICE '✓ analysis_variables created (with project_id column)';
  RAISE NOTICE '✓ variable_groups created';
  RAISE NOTICE '✓ All RLS policies created';
  RAISE NOTICE '✓ All indexes created';
  RAISE NOTICE '';
  RAISE NOTICE 'NEXT STEP: Refresh schema cache!';
  RAISE NOTICE '1. Go to Settings → API';
  RAISE NOTICE '2. Click "Refresh schema cache"';
  RAISE NOTICE '3. Wait 30 seconds';
  RAISE NOTICE '4. Try upload again';
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
END $$;

