-- ============================================================================
-- Analysis Workflow Enhancements
-- Created: 2024-01-09
-- Description: Complete analysis workflow with data health, export, and advanced features
-- ============================================================================

-- ============================================================================
-- PART 0: ENSURE ANALYSIS TABLES EXIST
-- ============================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create analysis_projects if not exists
CREATE TABLE IF NOT EXISTS analysis_projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
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

-- Create indexes if not exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_analysis_projects_user') THEN
    CREATE INDEX idx_analysis_projects_user ON analysis_projects(user_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_analysis_projects_project') THEN
    CREATE INDEX idx_analysis_projects_project ON analysis_projects(project_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_analysis_projects_status') THEN
    CREATE INDEX idx_analysis_projects_status ON analysis_projects(status);
  END IF;
END $$;

-- Enable RLS
ALTER TABLE analysis_projects ENABLE ROW LEVEL SECURITY;

-- Create RLS policies if not exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'analysis_projects' 
    AND policyname = 'Users can view their own analysis projects'
  ) THEN
    CREATE POLICY "Users can view their own analysis projects"
    ON analysis_projects FOR SELECT
    USING (auth.uid() = user_id);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'analysis_projects' 
    AND policyname = 'Users can create analysis projects'
  ) THEN
    CREATE POLICY "Users can create analysis projects"
    ON analysis_projects FOR INSERT
    WITH CHECK (auth.uid() = user_id);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'analysis_projects' 
    AND policyname = 'Users can update their own analysis projects'
  ) THEN
    CREATE POLICY "Users can update their own analysis projects"
    ON analysis_projects FOR UPDATE
    USING (auth.uid() = user_id);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'analysis_projects' 
    AND policyname = 'Users can delete their own analysis projects'
  ) THEN
    CREATE POLICY "Users can delete their own analysis projects"
    ON analysis_projects FOR DELETE
    USING (auth.uid() = user_id);
  END IF;
END $$;

-- Create variable_groups if not exists
CREATE TABLE IF NOT EXISTS variable_groups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  analysis_project_id UUID REFERENCES analysis_projects(id) ON DELETE CASCADE NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  group_type VARCHAR(50) DEFAULT 'construct' CHECK (group_type IN ('construct', 'demographic', 'control')),
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_variable_groups_analysis_project') THEN
    CREATE INDEX idx_variable_groups_analysis_project ON variable_groups(analysis_project_id);
  END IF;
END $$;

ALTER TABLE variable_groups ENABLE ROW LEVEL SECURITY;

-- Create analysis_variables if not exists
CREATE TABLE IF NOT EXISTS analysis_variables (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  analysis_project_id UUID REFERENCES analysis_projects(id) ON DELETE CASCADE NOT NULL,
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
  UNIQUE(analysis_project_id, column_name)
);

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_analysis_variables_project') THEN
    CREATE INDEX idx_analysis_variables_project ON analysis_variables(analysis_project_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_analysis_variables_demographic') THEN
    CREATE INDEX idx_analysis_variables_demographic ON analysis_variables(is_demographic);
  END IF;
END $$;

ALTER TABLE analysis_variables ENABLE ROW LEVEL SECURITY;

-- Create demographic_ranks if not exists
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

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_demographic_ranks_variable') THEN
    CREATE INDEX idx_demographic_ranks_variable ON demographic_ranks(variable_id);
  END IF;
END $$;

ALTER TABLE demographic_ranks ENABLE ROW LEVEL SECURITY;

-- Create ordinal_categories if not exists
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

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_ordinal_categories_variable') THEN
    CREATE INDEX idx_ordinal_categories_variable ON ordinal_categories(variable_id);
  END IF;
END $$;

ALTER TABLE ordinal_categories ENABLE ROW LEVEL SECURITY;

-- Create analysis_configurations if not exists
CREATE TABLE IF NOT EXISTS analysis_configurations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  analysis_project_id UUID REFERENCES analysis_projects(id) ON DELETE CASCADE NOT NULL,
  analysis_type VARCHAR(100) NOT NULL CHECK (
    analysis_type IN (
      'descriptive', 'reliability', 'efa', 'cfa', 
      'correlation', 'ttest', 'anova', 'regression', 'sem',
      'moderation', 'mediation', 'moderated_mediation',
      'multigroup', 'discriminant_validity', 'cmb',
      'normality', 'heteroscedasticity', 'multicollinearity'
    )
  ),
  configuration JSONB NOT NULL DEFAULT '{}',
  is_enabled BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(analysis_project_id, analysis_type)
);

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_analysis_configurations_project') THEN
    CREATE INDEX idx_analysis_configurations_project ON analysis_configurations(analysis_project_id);
  END IF;
END $$;

ALTER TABLE analysis_configurations ENABLE ROW LEVEL SECURITY;

-- Create analysis_results if not exists
CREATE TABLE IF NOT EXISTS analysis_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  analysis_project_id UUID REFERENCES analysis_projects(id) ON DELETE CASCADE NOT NULL,
  analysis_type VARCHAR(100) NOT NULL,
  results JSONB NOT NULL,
  execution_time_ms INTEGER,
  executed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_analysis_results_project') THEN
    CREATE INDEX idx_analysis_results_project ON analysis_results(analysis_project_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_analysis_results_type') THEN
    CREATE INDEX idx_analysis_results_type ON analysis_results(analysis_type);
  END IF;
END $$;

ALTER TABLE analysis_results ENABLE ROW LEVEL SECURITY;

-- Create update_updated_at_column function if not exists
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for analysis_projects
DROP TRIGGER IF EXISTS update_analysis_projects_updated_at ON analysis_projects;
CREATE TRIGGER update_analysis_projects_updated_at
BEFORE UPDATE ON analysis_projects
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- PART 1: DATA HEALTH & QUALITY TRACKING
-- ============================================================================

-- Table: data_health_reports
-- Stores comprehensive data quality analysis results
CREATE TABLE IF NOT EXISTS data_health_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES analysis_projects(id) ON DELETE CASCADE NOT NULL,
  overall_score INTEGER CHECK (overall_score >= 0 AND overall_score <= 100),
  total_rows INTEGER NOT NULL,
  total_columns INTEGER NOT NULL,
  
  -- Missing data metrics
  total_missing INTEGER DEFAULT 0,
  percentage_missing NUMERIC(5,2) DEFAULT 0,
  variables_with_missing TEXT[] DEFAULT '{}',
  
  -- Outlier detection
  total_outliers INTEGER DEFAULT 0,
  outlier_details JSONB DEFAULT '[]',
  
  -- Data type distribution
  numeric_count INTEGER DEFAULT 0,
  categorical_count INTEGER DEFAULT 0,
  text_count INTEGER DEFAULT 0,
  date_count INTEGER DEFAULT 0,
  
  -- Recommendations
  recommendations TEXT[] DEFAULT '{}',
  
  -- Metadata
  analysis_duration_ms INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_data_health_reports_project ON data_health_reports(project_id);
CREATE INDEX idx_data_health_reports_score ON data_health_reports(overall_score);

-- ============================================================================
-- PART 2: VARIABLE GROUPING SUGGESTIONS
-- ============================================================================

-- Table: variable_group_suggestions
-- AI-generated suggestions for grouping variables
CREATE TABLE IF NOT EXISTS variable_group_suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES analysis_projects(id) ON DELETE CASCADE NOT NULL,
  suggested_name VARCHAR(255) NOT NULL,
  variables TEXT[] NOT NULL,
  confidence NUMERIC(3,2) CHECK (confidence >= 0 AND confidence <= 1),
  reason TEXT,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'modified')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_variable_group_suggestions_project ON variable_group_suggestions(project_id);
CREATE INDEX idx_variable_group_suggestions_status ON variable_group_suggestions(status);

-- ============================================================================
-- PART 3: ANALYSIS EXECUTION TRACKING
-- ============================================================================

-- Table: analysis_jobs
-- Track long-running analysis executions
CREATE TABLE IF NOT EXISTS analysis_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES analysis_projects(id) ON DELETE CASCADE NOT NULL,
  analysis_types TEXT[] NOT NULL,
  status VARCHAR(20) DEFAULT 'queued' CHECK (
    status IN ('queued', 'running', 'completed', 'failed', 'cancelled')
  ),
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  current_step VARCHAR(255),
  error_message TEXT,
  estimated_time_seconds INTEGER,
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_analysis_jobs_project ON analysis_jobs(project_id);
CREATE INDEX idx_analysis_jobs_status ON analysis_jobs(status);
CREATE INDEX idx_analysis_jobs_created ON analysis_jobs(created_at DESC);

-- ============================================================================
-- PART 4: EXPORT HISTORY
-- ============================================================================

-- Table: analysis_exports
-- Track exported reports (Excel, PDF)
CREATE TABLE IF NOT EXISTS analysis_exports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES analysis_projects(id) ON DELETE CASCADE NOT NULL,
  export_format VARCHAR(20) NOT NULL CHECK (export_format IN ('excel', 'pdf', 'csv')),
  file_path TEXT NOT NULL,
  file_size INTEGER,
  included_analyses TEXT[] DEFAULT '{}',
  export_options JSONB DEFAULT '{}',
  download_count INTEGER DEFAULT 0,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_analysis_exports_project ON analysis_exports(project_id);
CREATE INDEX idx_analysis_exports_format ON analysis_exports(export_format);
CREATE INDEX idx_analysis_exports_expires ON analysis_exports(expires_at);

-- ============================================================================
-- PART 5: ANALYSIS TEMPLATES
-- ============================================================================

-- Table: analysis_templates
-- Pre-configured analysis templates for common research scenarios
CREATE TABLE IF NOT EXISTS analysis_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  name_vi VARCHAR(255) NOT NULL,
  description TEXT,
  description_vi TEXT,
  category VARCHAR(100),
  
  -- Template configuration
  required_variable_types JSONB DEFAULT '{}',
  default_analyses TEXT[] DEFAULT '{}',
  default_configurations JSONB DEFAULT '{}',
  
  -- Usage tracking
  usage_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  is_system_template BOOLEAN DEFAULT FALSE,
  created_by UUID REFERENCES auth.users(id),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_analysis_templates_category ON analysis_templates(category);
CREATE INDEX idx_analysis_templates_active ON analysis_templates(is_active);

-- ============================================================================
-- PART 6: USER ANALYSIS HISTORY
-- ============================================================================

-- Table: analysis_activity_log
-- Audit trail for analysis-related actions
CREATE TABLE IF NOT EXISTS analysis_activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES analysis_projects(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action VARCHAR(100) NOT NULL CHECK (
    action IN (
      'project_created', 'csv_uploaded', 'health_check_completed',
      'variables_grouped', 'demographic_configured', 'ranks_created',
      'analysis_configured', 'analysis_started', 'analysis_completed',
      'analysis_failed', 'results_viewed', 'results_exported',
      'project_deleted', 'configuration_updated'
    )
  ),
  details JSONB DEFAULT '{}',
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_analysis_activity_log_project ON analysis_activity_log(project_id);
CREATE INDEX idx_analysis_activity_log_user ON analysis_activity_log(user_id);
CREATE INDEX idx_analysis_activity_log_action ON analysis_activity_log(action);
CREATE INDEX idx_analysis_activity_log_created ON analysis_activity_log(created_at DESC);

-- ============================================================================
-- PART 7: CORRELATION CACHE
-- ============================================================================

-- Table: variable_correlations
-- Cache correlation calculations for performance
CREATE TABLE IF NOT EXISTS variable_correlations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES analysis_projects(id) ON DELETE CASCADE NOT NULL,
  variable1_id UUID REFERENCES analysis_variables(id) ON DELETE CASCADE NOT NULL,
  variable2_id UUID REFERENCES analysis_variables(id) ON DELETE CASCADE NOT NULL,
  correlation_coefficient NUMERIC(5,4),
  p_value NUMERIC,
  method VARCHAR(20) DEFAULT 'pearson' CHECK (method IN ('pearson', 'spearman', 'kendall')),
  sample_size INTEGER,
  calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(project_id, variable1_id, variable2_id, method)
);

CREATE INDEX idx_variable_correlations_project ON variable_correlations(project_id);
CREATE INDEX idx_variable_correlations_var1 ON variable_correlations(variable1_id);
CREATE INDEX idx_variable_correlations_var2 ON variable_correlations(variable2_id);

-- ============================================================================
-- PART 8: ANALYSIS NOTES & ANNOTATIONS
-- ============================================================================

-- Table: analysis_notes
-- User notes and interpretations for analysis results
CREATE TABLE IF NOT EXISTS analysis_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES analysis_projects(id) ON DELETE CASCADE NOT NULL,
  analysis_type VARCHAR(100),
  note_type VARCHAR(50) DEFAULT 'general' CHECK (
    note_type IN ('general', 'interpretation', 'finding', 'issue', 'todo')
  ),
  title VARCHAR(255),
  content TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  is_pinned BOOLEAN DEFAULT FALSE,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_analysis_notes_project ON analysis_notes(project_id);
CREATE INDEX idx_analysis_notes_type ON analysis_notes(note_type);
CREATE INDEX idx_analysis_notes_pinned ON analysis_notes(is_pinned);

-- ============================================================================
-- PART 9: SHARED ANALYSIS PROJECTS
-- ============================================================================

-- Table: analysis_project_shares
-- Share analysis projects with other users
CREATE TABLE IF NOT EXISTS analysis_project_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES analysis_projects(id) ON DELETE CASCADE NOT NULL,
  shared_with_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  shared_by_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  permission_level VARCHAR(20) DEFAULT 'view' CHECK (
    permission_level IN ('view', 'edit', 'admin')
  ),
  can_export BOOLEAN DEFAULT FALSE,
  can_delete BOOLEAN DEFAULT FALSE,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(project_id, shared_with_user_id)
);

CREATE INDEX idx_analysis_project_shares_project ON analysis_project_shares(project_id);
CREATE INDEX idx_analysis_project_shares_user ON analysis_project_shares(shared_with_user_id);
CREATE INDEX idx_analysis_project_shares_expires ON analysis_project_shares(expires_at);

-- ============================================================================
-- PART 10: ANALYSIS BENCHMARKS
-- ============================================================================

-- Table: analysis_benchmarks
-- Store benchmark data for comparison
CREATE TABLE IF NOT EXISTS analysis_benchmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  industry VARCHAR(100),
  construct VARCHAR(255),
  metric_name VARCHAR(100),
  metric_value NUMERIC,
  sample_size INTEGER,
  source TEXT,
  year INTEGER,
  region VARCHAR(100),
  notes TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_analysis_benchmarks_industry ON analysis_benchmarks(industry);
CREATE INDEX idx_analysis_benchmarks_construct ON analysis_benchmarks(construct);
CREATE INDEX idx_analysis_benchmarks_metric ON analysis_benchmarks(metric_name);

-- ============================================================================
-- PART 11: HELPER FUNCTIONS
-- ============================================================================

-- Function: Calculate data quality score
CREATE OR REPLACE FUNCTION calculate_data_quality_score(
  missing_pct NUMERIC,
  outlier_pct NUMERIC,
  type_consistency_pct NUMERIC
)
RETURNS INTEGER AS $$
DECLARE
  score INTEGER;
BEGIN
  -- Weighted scoring: 40% missing, 30% outliers, 30% type consistency
  score := ROUND(
    (100 - missing_pct) * 0.4 +
    (100 - outlier_pct) * 0.3 +
    type_consistency_pct * 0.3
  );
  
  RETURN GREATEST(0, LEAST(100, score));
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function: Get project statistics
CREATE OR REPLACE FUNCTION get_project_statistics(project_uuid UUID)
RETURNS TABLE (
  total_variables INTEGER,
  demographic_variables INTEGER,
  variable_groups INTEGER,
  completed_analyses INTEGER,
  last_analysis_date TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(DISTINCT av.id)::INTEGER as total_variables,
    COUNT(DISTINCT av.id) FILTER (WHERE av.is_demographic = TRUE)::INTEGER as demographic_variables,
    COUNT(DISTINCT vg.id)::INTEGER as variable_groups,
    COUNT(DISTINCT ar.id)::INTEGER as completed_analyses,
    MAX(ar.executed_at) as last_analysis_date
  FROM analysis_projects ap
  LEFT JOIN analysis_variables av ON av.project_id = ap.id
  LEFT JOIN variable_groups vg ON vg.project_id = ap.id
  LEFT JOIN analysis_results ar ON ar.project_id = ap.id
  WHERE ap.id = project_uuid
  GROUP BY ap.id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Log analysis activity
CREATE OR REPLACE FUNCTION log_analysis_activity()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO analysis_activity_log (project_id, user_id, action, details)
    VALUES (
      NEW.id,
      NEW.user_id,
      'project_created',
      jsonb_build_object('name', NEW.name, 'row_count', NEW.row_count)
    );
  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.status != NEW.status THEN
      INSERT INTO analysis_activity_log (project_id, user_id, action, details)
      VALUES (
        NEW.id,
        NEW.user_id,
        'configuration_updated',
        jsonb_build_object('old_status', OLD.status, 'new_status', NEW.status)
      );
    END IF;
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO analysis_activity_log (project_id, user_id, action, details)
    VALUES (
      OLD.id,
      OLD.user_id,
      'project_deleted',
      jsonb_build_object('name', OLD.name)
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Update export download count
CREATE OR REPLACE FUNCTION increment_export_download()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE analysis_exports
  SET download_count = download_count + 1
  WHERE id = NEW.id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function: Clean expired exports
CREATE OR REPLACE FUNCTION clean_expired_exports()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM analysis_exports
  WHERE expires_at < NOW()
  RETURNING COUNT(*) INTO deleted_count;
  
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Get user's recent projects
CREATE OR REPLACE FUNCTION get_user_recent_projects(
  user_uuid UUID,
  limit_count INTEGER DEFAULT 10
)
RETURNS TABLE (
  id UUID,
  name VARCHAR,
  status VARCHAR,
  row_count INTEGER,
  column_count INTEGER,
  last_activity TIMESTAMP WITH TIME ZONE,
  analysis_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    ap.id,
    ap.name,
    ap.status,
    ap.row_count,
    ap.column_count,
    GREATEST(ap.updated_at, MAX(aal.created_at)) as last_activity,
    COUNT(DISTINCT ar.id) as analysis_count
  FROM analysis_projects ap
  LEFT JOIN analysis_activity_log aal ON aal.project_id = ap.id
  LEFT JOIN analysis_results ar ON ar.project_id = ap.id
  WHERE ap.user_id = user_uuid
  GROUP BY ap.id, ap.name, ap.status, ap.row_count, ap.column_count, ap.updated_at
  ORDER BY last_activity DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- PART 12: TRIGGERS
-- ============================================================================

-- Trigger: Log project activity
DROP TRIGGER IF EXISTS trigger_log_analysis_activity ON analysis_projects;
CREATE TRIGGER trigger_log_analysis_activity
AFTER INSERT OR UPDATE OR DELETE ON analysis_projects
FOR EACH ROW EXECUTE FUNCTION log_analysis_activity();

-- Trigger: Update timestamps
DROP TRIGGER IF EXISTS update_analysis_templates_updated_at ON analysis_templates;
CREATE TRIGGER update_analysis_templates_updated_at
BEFORE UPDATE ON analysis_templates
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_analysis_notes_updated_at ON analysis_notes;
CREATE TRIGGER update_analysis_notes_updated_at
BEFORE UPDATE ON analysis_notes
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- PART 13: ROW LEVEL SECURITY
-- ============================================================================

-- Enable RLS on all new tables
ALTER TABLE data_health_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE variable_group_suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE analysis_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE analysis_exports ENABLE ROW LEVEL SECURITY;
ALTER TABLE analysis_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE analysis_activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE variable_correlations ENABLE ROW LEVEL SECURITY;
ALTER TABLE analysis_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE analysis_project_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE analysis_benchmarks ENABLE ROW LEVEL SECURITY;

-- RLS Policies: data_health_reports
CREATE POLICY "Users can view health reports of their projects"
ON data_health_reports FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM analysis_projects
    WHERE analysis_projects.id = data_health_reports.project_id
    AND analysis_projects.user_id = auth.uid()
  )
);

CREATE POLICY "Users can manage health reports of their projects"
ON data_health_reports FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM analysis_projects
    WHERE analysis_projects.id = data_health_reports.project_id
    AND analysis_projects.user_id = auth.uid()
  )
);

-- RLS Policies: variable_group_suggestions
CREATE POLICY "Users can view suggestions for their projects"
ON variable_group_suggestions FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM analysis_projects
    WHERE analysis_projects.id = variable_group_suggestions.project_id
    AND analysis_projects.user_id = auth.uid()
  )
);

CREATE POLICY "Users can manage suggestions for their projects"
ON variable_group_suggestions FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM analysis_projects
    WHERE analysis_projects.id = variable_group_suggestions.project_id
    AND analysis_projects.user_id = auth.uid()
  )
);

-- RLS Policies: analysis_jobs
CREATE POLICY "Users can view jobs for their projects"
ON analysis_jobs FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM analysis_projects
    WHERE analysis_projects.id = analysis_jobs.project_id
    AND analysis_projects.user_id = auth.uid()
  )
);

CREATE POLICY "Users can manage jobs for their projects"
ON analysis_jobs FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM analysis_projects
    WHERE analysis_projects.id = analysis_jobs.project_id
    AND analysis_projects.user_id = auth.uid()
  )
);

-- RLS Policies: analysis_exports
CREATE POLICY "Users can view exports of their projects"
ON analysis_exports FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM analysis_projects
    WHERE analysis_projects.id = analysis_exports.project_id
    AND analysis_projects.user_id = auth.uid()
  )
);

CREATE POLICY "Users can manage exports of their projects"
ON analysis_exports FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM analysis_projects
    WHERE analysis_projects.id = analysis_exports.project_id
    AND analysis_projects.user_id = auth.uid()
  )
);

-- RLS Policies: analysis_templates
CREATE POLICY "Anyone can view active templates"
ON analysis_templates FOR SELECT
USING (is_active = TRUE);

CREATE POLICY "Users can create their own templates"
ON analysis_templates FOR INSERT
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own templates"
ON analysis_templates FOR UPDATE
USING (auth.uid() = created_by);

-- RLS Policies: analysis_activity_log
CREATE POLICY "Users can view activity log of their projects"
ON analysis_activity_log FOR SELECT
USING (
  auth.uid() = user_id OR
  EXISTS (
    SELECT 1 FROM analysis_projects
    WHERE analysis_projects.id = analysis_activity_log.project_id
    AND analysis_projects.user_id = auth.uid()
  )
);

-- RLS Policies: variable_correlations
CREATE POLICY "Users can view correlations of their projects"
ON variable_correlations FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM analysis_projects
    WHERE analysis_projects.id = variable_correlations.project_id
    AND analysis_projects.user_id = auth.uid()
  )
);

-- RLS Policies: analysis_notes
CREATE POLICY "Users can view notes of their projects"
ON analysis_notes FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM analysis_projects
    WHERE analysis_projects.id = analysis_notes.project_id
    AND analysis_projects.user_id = auth.uid()
  )
);

CREATE POLICY "Users can manage notes of their projects"
ON analysis_notes FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM analysis_projects
    WHERE analysis_projects.id = analysis_notes.project_id
    AND analysis_projects.user_id = auth.uid()
  )
);

-- RLS Policies: analysis_project_shares
CREATE POLICY "Users can view shares of their projects"
ON analysis_project_shares FOR SELECT
USING (
  auth.uid() = shared_with_user_id OR
  auth.uid() = shared_by_user_id OR
  EXISTS (
    SELECT 1 FROM analysis_projects
    WHERE analysis_projects.id = analysis_project_shares.project_id
    AND analysis_projects.user_id = auth.uid()
  )
);

CREATE POLICY "Project owners can manage shares"
ON analysis_project_shares FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM analysis_projects
    WHERE analysis_projects.id = analysis_project_shares.project_id
    AND analysis_projects.user_id = auth.uid()
  )
);

-- RLS Policies: analysis_benchmarks
CREATE POLICY "Anyone can view verified benchmarks"
ON analysis_benchmarks FOR SELECT
USING (is_verified = TRUE);

-- ============================================================================
-- PART 14: INITIAL DATA
-- ============================================================================

-- Insert default analysis templates
INSERT INTO analysis_templates (
  name, name_vi, description, description_vi, category,
  default_analyses, is_system_template
) VALUES
(
  'Customer Satisfaction Survey',
  'Khảo sát hài lòng khách hàng',
  'Standard template for customer satisfaction analysis',
  'Mẫu chuẩn cho phân tích hài lòng khách hàng',
  'marketing',
  ARRAY['descriptive', 'reliability', 'efa', 'correlation'],
  TRUE
),
(
  'Employee Engagement Survey',
  'Khảo sát gắn kết nhân viên',
  'Template for analyzing employee engagement data',
  'Mẫu phân tích dữ liệu gắn kết nhân viên',
  'hr',
  ARRAY['descriptive', 'reliability', 'anova', 'regression'],
  TRUE
),
(
  'Brand Perception Study',
  'Nghiên cứu nhận thức thương hiệu',
  'Analyze brand perception and positioning',
  'Phân tích nhận thức và định vị thương hiệu',
  'marketing',
  ARRAY['descriptive', 'efa', 'cfa', 'sem'],
  TRUE
),
(
  'Service Quality Assessment',
  'Đánh giá chất lượng dịch vụ',
  'SERVQUAL-based service quality analysis',
  'Phân tích chất lượng dịch vụ theo SERVQUAL',
  'service',
  ARRAY['descriptive', 'reliability', 'efa', 'regression'],
  TRUE
)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE data_health_reports IS 'Comprehensive data quality analysis results';
COMMENT ON TABLE variable_group_suggestions IS 'AI-generated variable grouping suggestions';
COMMENT ON TABLE analysis_jobs IS 'Track long-running analysis executions';
COMMENT ON TABLE analysis_exports IS 'History of exported reports';
COMMENT ON TABLE analysis_templates IS 'Pre-configured analysis templates';
COMMENT ON TABLE analysis_activity_log IS 'Audit trail for analysis actions';
COMMENT ON TABLE variable_correlations IS 'Cached correlation calculations';
COMMENT ON TABLE analysis_notes IS 'User notes and interpretations';
COMMENT ON TABLE analysis_project_shares IS 'Shared project access control';
COMMENT ON TABLE analysis_benchmarks IS 'Industry benchmark data';

COMMENT ON FUNCTION calculate_data_quality_score IS 'Calculate overall data quality score (0-100)';
COMMENT ON FUNCTION get_project_statistics IS 'Get comprehensive project statistics';
COMMENT ON FUNCTION log_analysis_activity IS 'Automatically log project activities';
COMMENT ON FUNCTION clean_expired_exports IS 'Remove expired export files';
COMMENT ON FUNCTION get_user_recent_projects IS 'Get user''s recent analysis projects';
