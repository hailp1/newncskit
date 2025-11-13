-- CSV Analysis Workflow Database Schema
-- Created: 2024-01-07
-- Description: Tables for CSV analysis projects, variables, groups, and results

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- Table: analysis_projects
-- Description: Stores analysis project metadata and CSV file information
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

-- Indexes for analysis_projects
CREATE INDEX idx_analysis_projects_user ON analysis_projects(user_id);
CREATE INDEX idx_analysis_projects_status ON analysis_projects(status);
CREATE INDEX idx_analysis_projects_created ON analysis_projects(created_at DESC);

-- RLS Policies for analysis_projects
ALTER TABLE analysis_projects ENABLE ROW LEVEL SECURITY;

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
-- Table: variable_groups
-- Description: Groups of related variables (constructs, demographics, etc.)
-- ============================================================================

CREATE TABLE IF NOT EXISTS variable_groups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES analysis_projects(id) ON DELETE CASCADE NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  group_type VARCHAR(50) DEFAULT 'construct' CHECK (group_type IN ('construct', 'demographic', 'control')),
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for variable_groups
CREATE INDEX idx_variable_groups_project ON variable_groups(project_id);
CREATE INDEX idx_variable_groups_order ON variable_groups(display_order);

-- RLS Policies for variable_groups
ALTER TABLE variable_groups ENABLE ROW LEVEL SECURITY;

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
-- Table: analysis_variables
-- Description: Individual variables (columns) from the CSV file
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
  variable_group_id UUID REFERENCES variable_groups(id) ON DELETE SET NULL,
  missing_count INTEGER DEFAULT 0,
  unique_count INTEGER DEFAULT 0,
  min_value NUMERIC,
  max_value NUMERIC,
  mean_value NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(project_id, column_name)
);

-- Indexes for analysis_variables
CREATE INDEX idx_analysis_variables_project ON analysis_variables(project_id);
CREATE INDEX idx_analysis_variables_demographic ON analysis_variables(is_demographic);
CREATE INDEX idx_analysis_variables_group ON analysis_variables(variable_group_id);

-- RLS Policies for analysis_variables
ALTER TABLE analysis_variables ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view variables of their projects"
  ON analysis_variables FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM analysis_projects
      WHERE analysis_projects.id = analysis_variables.project_id
      AND analysis_projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage variables of their projects"
  ON analysis_variables FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM analysis_projects
      WHERE analysis_projects.id = analysis_variables.project_id
      AND analysis_projects.user_id = auth.uid()
    )
  );

-- ============================================================================
-- Table: demographic_ranks
-- Description: Custom rank definitions for continuous demographic variables
-- ============================================================================

CREATE TABLE IF NOT EXISTS demographic_ranks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  variable_id UUID REFERENCES analysis_variables(id) ON DELETE CASCADE NOT NULL,
  rank_order INTEGER NOT NULL,
  label VARCHAR(255) NOT NULL,
  min_value NUMERIC,
  max_value NUMERIC,
  is_open_ended_min BOOLEAN DEFAULT FALSE,
  is_open_ended_max BOOLEAN DEFAULT FALSE,
  count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(variable_id, rank_order)
);

-- Indexes for demographic_ranks
CREATE INDEX idx_demographic_ranks_variable ON demographic_ranks(variable_id);
CREATE INDEX idx_demographic_ranks_order ON demographic_ranks(rank_order);

-- RLS Policies for demographic_ranks
ALTER TABLE demographic_ranks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view ranks of their variables"
  ON demographic_ranks FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM analysis_variables av
      JOIN analysis_projects ap ON ap.id = av.project_id
      WHERE av.id = demographic_ranks.variable_id
      AND ap.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage ranks of their variables"
  ON demographic_ranks FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM analysis_variables av
      JOIN analysis_projects ap ON ap.id = av.project_id
      WHERE av.id = demographic_ranks.variable_id
      AND ap.user_id = auth.uid()
    )
  );

-- ============================================================================
-- Table: ordinal_categories
-- Description: Ordered categories for ordinal demographic variables
-- ============================================================================

CREATE TABLE IF NOT EXISTS ordinal_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  variable_id UUID REFERENCES analysis_variables(id) ON DELETE CASCADE NOT NULL,
  category_order INTEGER NOT NULL,
  category_value VARCHAR(255) NOT NULL,
  category_label VARCHAR(255),
  count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(variable_id, category_order)
);

-- Indexes for ordinal_categories
CREATE INDEX idx_ordinal_categories_variable ON ordinal_categories(variable_id);
CREATE INDEX idx_ordinal_categories_order ON ordinal_categories(category_order);

-- RLS Policies for ordinal_categories
ALTER TABLE ordinal_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view categories of their variables"
  ON ordinal_categories FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM analysis_variables av
      JOIN analysis_projects ap ON ap.id = av.project_id
      WHERE av.id = ordinal_categories.variable_id
      AND ap.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage categories of their variables"
  ON ordinal_categories FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM analysis_variables av
      JOIN analysis_projects ap ON ap.id = av.project_id
      WHERE av.id = ordinal_categories.variable_id
      AND ap.user_id = auth.uid()
    )
  );

-- ============================================================================
-- Table: analysis_configurations
-- Description: Configuration for each analysis type to be executed
-- ============================================================================

CREATE TABLE IF NOT EXISTS analysis_configurations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES analysis_projects(id) ON DELETE CASCADE NOT NULL,
  analysis_type VARCHAR(100) NOT NULL CHECK (
    analysis_type IN (
      'descriptive', 'reliability', 'efa', 'cfa', 
      'correlation', 'ttest', 'anova', 'regression', 'sem'
    )
  ),
  configuration JSONB NOT NULL DEFAULT '{}',
  is_enabled BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(project_id, analysis_type)
);

-- Indexes for analysis_configurations
CREATE INDEX idx_analysis_configurations_project ON analysis_configurations(project_id);
CREATE INDEX idx_analysis_configurations_type ON analysis_configurations(analysis_type);
CREATE INDEX idx_analysis_configurations_enabled ON analysis_configurations(is_enabled);

-- RLS Policies for analysis_configurations
ALTER TABLE analysis_configurations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view configurations of their projects"
  ON analysis_configurations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM analysis_projects
      WHERE analysis_projects.id = analysis_configurations.project_id
      AND analysis_projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage configurations of their projects"
  ON analysis_configurations FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM analysis_projects
      WHERE analysis_projects.id = analysis_configurations.project_id
      AND analysis_projects.user_id = auth.uid()
    )
  );

-- ============================================================================
-- Table: analysis_results
-- Description: Stores results from executed analyses
-- ============================================================================

CREATE TABLE IF NOT EXISTS analysis_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES analysis_projects(id) ON DELETE CASCADE NOT NULL,
  analysis_type VARCHAR(100) NOT NULL,
  results JSONB NOT NULL,
  execution_time_ms INTEGER,
  executed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for analysis_results
CREATE INDEX idx_analysis_results_project ON analysis_results(project_id);
CREATE INDEX idx_analysis_results_type ON analysis_results(analysis_type);
CREATE INDEX idx_analysis_results_executed ON analysis_results(executed_at DESC);

-- RLS Policies for analysis_results
ALTER TABLE analysis_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view results of their projects"
  ON analysis_results FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM analysis_projects
      WHERE analysis_projects.id = analysis_results.project_id
      AND analysis_projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage results of their projects"
  ON analysis_results FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM analysis_projects
      WHERE analysis_projects.id = analysis_results.project_id
      AND analysis_projects.user_id = auth.uid()
    )
  );

-- ============================================================================
-- Functions and Triggers
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for analysis_projects
CREATE TRIGGER update_analysis_projects_updated_at
  BEFORE UPDATE ON analysis_projects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- Comments for documentation
-- ============================================================================

COMMENT ON TABLE analysis_projects IS 'Stores CSV analysis project metadata';
COMMENT ON TABLE variable_groups IS 'Groups of related variables (constructs)';
COMMENT ON TABLE analysis_variables IS 'Individual variables from CSV files';
COMMENT ON TABLE demographic_ranks IS 'Custom rank definitions for continuous demographics';
COMMENT ON TABLE ordinal_categories IS 'Ordered categories for ordinal demographics';
COMMENT ON TABLE analysis_configurations IS 'Configuration for each analysis type';
COMMENT ON TABLE analysis_results IS 'Results from executed statistical analyses';
