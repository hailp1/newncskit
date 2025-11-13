-- ============================================================================
-- Variable Role Tags Migration
-- Created: 2024-11-10
-- Description: Add role tagging support for variables and groups to enable
--              automatic configuration of advanced analyses (Regression, SEM, Mediation)
-- ============================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- PART 1: CREATE VARIABLE_ROLE_TAGS TABLE
-- ============================================================================

-- Table: variable_role_tags
-- Description: Stores role assignments for variables and groups
-- Roles: none, independent (IV), dependent (DV), mediator, moderator, control, latent
CREATE TABLE IF NOT EXISTS variable_role_tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL,
  variable_id UUID,
  group_id UUID,
  role VARCHAR(20) NOT NULL CHECK (
    role IN ('none', 'independent', 'dependent', 'mediator', 'moderator', 'control', 'latent')
  ),
  is_user_assigned BOOLEAN DEFAULT FALSE,
  confidence NUMERIC(3,2) CHECK (confidence >= 0 AND confidence <= 1),
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure exactly one of variable_id or group_id is set (XOR constraint)
  CONSTRAINT role_tag_entity_xor CHECK (
    (variable_id IS NOT NULL AND group_id IS NULL) OR
    (variable_id IS NULL AND group_id IS NOT NULL)
  ),
  
  -- Ensure unique role assignment per entity
  CONSTRAINT unique_variable_role UNIQUE (project_id, variable_id),
  CONSTRAINT unique_group_role UNIQUE (project_id, group_id)
);

-- Add foreign key constraints
-- Note: Using conditional approach to handle different table structures
DO $$
BEGIN
  -- Try to add FK to analysis_projects (primary table name)
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'analysis_projects') THEN
    ALTER TABLE variable_role_tags
    ADD CONSTRAINT fk_role_tags_project
    FOREIGN KEY (project_id) REFERENCES analysis_projects(id) ON DELETE CASCADE;
  END IF;
  
  -- Try to add FK to analysis_variables
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'analysis_variables') THEN
    ALTER TABLE variable_role_tags
    ADD CONSTRAINT fk_role_tags_variable
    FOREIGN KEY (variable_id) REFERENCES analysis_variables(id) ON DELETE CASCADE;
  END IF;
  
  -- Try to add FK to variable_groups
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'variable_groups') THEN
    ALTER TABLE variable_role_tags
    ADD CONSTRAINT fk_role_tags_group
    FOREIGN KEY (group_id) REFERENCES variable_groups(id) ON DELETE CASCADE;
  END IF;
END $$;

-- ============================================================================
-- PART 2: CREATE INDEXES
-- ============================================================================

-- Index on project_id for fast project-level queries
CREATE INDEX IF NOT EXISTS idx_role_tags_project 
ON variable_role_tags(project_id);

-- Index on variable_id for fast variable lookups
CREATE INDEX IF NOT EXISTS idx_role_tags_variable 
ON variable_role_tags(variable_id) 
WHERE variable_id IS NOT NULL;

-- Index on group_id for fast group lookups
CREATE INDEX IF NOT EXISTS idx_role_tags_group 
ON variable_role_tags(group_id) 
WHERE group_id IS NOT NULL;

-- Index on role for filtering by role type
CREATE INDEX IF NOT EXISTS idx_role_tags_role 
ON variable_role_tags(role);

-- Composite index for project + role queries
CREATE INDEX IF NOT EXISTS idx_role_tags_project_role 
ON variable_role_tags(project_id, role);

-- ============================================================================
-- PART 3: UPDATE VARIABLE_GROUPS TABLE
-- ============================================================================

-- Add default_role column to variable_groups table
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'variable_groups') THEN
    -- Add column if it doesn't exist
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'variable_groups' 
      AND column_name = 'default_role'
    ) THEN
      ALTER TABLE variable_groups 
      ADD COLUMN default_role VARCHAR(20) DEFAULT 'none' CHECK (
        default_role IN ('none', 'independent', 'dependent', 'mediator', 'moderator', 'control', 'latent')
      );
      
      -- Add comment
      COMMENT ON COLUMN variable_groups.default_role IS 'Default role applied to all variables in this group';
    END IF;
  END IF;
END $$;

-- ============================================================================
-- PART 4: HELPER FUNCTIONS
-- ============================================================================

-- Function: Get role tags for a project
CREATE OR REPLACE FUNCTION get_project_role_tags(project_uuid UUID)
RETURNS TABLE (
  id UUID,
  entity_type VARCHAR,
  entity_id UUID,
  entity_name VARCHAR,
  role VARCHAR,
  is_user_assigned BOOLEAN,
  confidence NUMERIC,
  reason TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    vrt.id,
    CASE 
      WHEN vrt.variable_id IS NOT NULL THEN 'variable'::VARCHAR
      WHEN vrt.group_id IS NOT NULL THEN 'group'::VARCHAR
    END as entity_type,
    COALESCE(vrt.variable_id, vrt.group_id) as entity_id,
    COALESCE(av.column_name, vg.name) as entity_name,
    vrt.role,
    vrt.is_user_assigned,
    vrt.confidence,
    vrt.reason
  FROM variable_role_tags vrt
  LEFT JOIN analysis_variables av ON av.id = vrt.variable_id
  LEFT JOIN variable_groups vg ON vg.id = vrt.group_id
  WHERE vrt.project_id = project_uuid
  ORDER BY entity_type, entity_name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Get variables by role for a project
CREATE OR REPLACE FUNCTION get_variables_by_role(
  project_uuid UUID,
  role_filter VARCHAR
)
RETURNS TABLE (
  variable_id UUID,
  column_name VARCHAR,
  display_name VARCHAR,
  is_user_assigned BOOLEAN,
  confidence NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    av.id as variable_id,
    av.column_name,
    av.display_name,
    vrt.is_user_assigned,
    vrt.confidence
  FROM variable_role_tags vrt
  JOIN analysis_variables av ON av.id = vrt.variable_id
  WHERE vrt.project_id = project_uuid
    AND vrt.role = role_filter
    AND vrt.variable_id IS NOT NULL
  ORDER BY av.column_name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Validate role configuration for analysis type
CREATE OR REPLACE FUNCTION validate_role_configuration(
  project_uuid UUID,
  analysis_type VARCHAR
)
RETURNS TABLE (
  is_valid BOOLEAN,
  error_messages TEXT[],
  warning_messages TEXT[]
) AS $$
DECLARE
  iv_count INTEGER;
  dv_count INTEGER;
  mediator_count INTEGER;
  latent_count INTEGER;
  errors TEXT[] := '{}';
  warnings TEXT[] := '{}';
  valid BOOLEAN := TRUE;
BEGIN
  -- Count roles
  SELECT 
    COUNT(*) FILTER (WHERE role = 'independent'),
    COUNT(*) FILTER (WHERE role = 'dependent'),
    COUNT(*) FILTER (WHERE role = 'mediator'),
    COUNT(*) FILTER (WHERE role = 'latent')
  INTO iv_count, dv_count, mediator_count, latent_count
  FROM variable_role_tags
  WHERE project_id = project_uuid;
  
  -- Validate based on analysis type
  IF analysis_type = 'regression' THEN
    IF dv_count = 0 THEN
      errors := array_append(errors, 'Regression requires exactly one Dependent Variable (DV)');
      valid := FALSE;
    ELSIF dv_count > 1 THEN
      errors := array_append(errors, 'Regression requires exactly one DV, but ' || dv_count || ' were found');
      valid := FALSE;
    END IF;
    
    IF iv_count = 0 THEN
      errors := array_append(errors, 'Regression requires at least one Independent Variable (IV)');
      valid := FALSE;
    END IF;
    
    IF iv_count > 10 THEN
      warnings := array_append(warnings, iv_count || ' IVs may cause multicollinearity. Consider reducing.');
    END IF;
    
  ELSIF analysis_type = 'sem' OR analysis_type = 'cfa' THEN
    IF latent_count < 2 THEN
      errors := array_append(errors, 'SEM/CFA requires at least 2 latent variables');
      valid := FALSE;
    END IF;
    
  ELSIF analysis_type = 'mediation' THEN
    IF iv_count = 0 THEN
      errors := array_append(errors, 'Mediation requires at least one IV');
      valid := FALSE;
    END IF;
    
    IF dv_count = 0 THEN
      errors := array_append(errors, 'Mediation requires at least one DV');
      valid := FALSE;
    END IF;
    
    IF mediator_count = 0 THEN
      errors := array_append(errors, 'Mediation requires at least one Mediator');
      valid := FALSE;
    END IF;
    
    IF mediator_count > 3 THEN
      warnings := array_append(warnings, 'Multiple mediators detected. Consider testing them separately.');
    END IF;
  END IF;
  
  RETURN QUERY SELECT valid, errors, warnings;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Update role tag timestamp
CREATE OR REPLACE FUNCTION update_role_tag_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- PART 5: TRIGGERS
-- ============================================================================

-- Trigger: Update timestamp on role tag changes
DROP TRIGGER IF EXISTS update_variable_role_tags_timestamp ON variable_role_tags;
CREATE TRIGGER update_variable_role_tags_timestamp
BEFORE UPDATE ON variable_role_tags
FOR EACH ROW
EXECUTE FUNCTION update_role_tag_timestamp();

-- ============================================================================
-- PART 6: ROW LEVEL SECURITY
-- ============================================================================

-- Enable RLS on variable_role_tags
ALTER TABLE variable_role_tags ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view role tags of their projects
CREATE POLICY "Users can view role tags of their projects"
ON variable_role_tags FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM analysis_projects
    WHERE analysis_projects.id = variable_role_tags.project_id
    AND analysis_projects.user_id = auth.uid()
  )
);

-- Policy: Users can create role tags for their projects
CREATE POLICY "Users can create role tags for their projects"
ON variable_role_tags FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM analysis_projects
    WHERE analysis_projects.id = variable_role_tags.project_id
    AND analysis_projects.user_id = auth.uid()
  )
);

-- Policy: Users can update role tags of their projects
CREATE POLICY "Users can update role tags of their projects"
ON variable_role_tags FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM analysis_projects
    WHERE analysis_projects.id = variable_role_tags.project_id
    AND analysis_projects.user_id = auth.uid()
  )
);

-- Policy: Users can delete role tags of their projects
CREATE POLICY "Users can delete role tags of their projects"
ON variable_role_tags FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM analysis_projects
    WHERE analysis_projects.id = variable_role_tags.project_id
    AND analysis_projects.user_id = auth.uid()
  )
);

-- ============================================================================
-- PART 7: COMMENTS FOR DOCUMENTATION
-- ============================================================================

COMMENT ON TABLE variable_role_tags IS 'Stores role assignments (IV, DV, Mediator, etc.) for variables and groups to enable automatic analysis configuration';
COMMENT ON COLUMN variable_role_tags.role IS 'Role type: none, independent (IV), dependent (DV), mediator, moderator, control, latent';
COMMENT ON COLUMN variable_role_tags.is_user_assigned IS 'TRUE if user manually assigned, FALSE if system-suggested';
COMMENT ON COLUMN variable_role_tags.confidence IS 'Confidence score for system suggestions (0-1)';
COMMENT ON COLUMN variable_role_tags.reason IS 'Explanation for why this role was suggested';

-- ============================================================================
-- PART 8: SAMPLE DATA (OPTIONAL - FOR TESTING)
-- ============================================================================

-- Uncomment to insert sample role tags for testing
/*
-- Example: Insert role tags for a test project
INSERT INTO variable_role_tags (project_id, variable_id, role, is_user_assigned, confidence, reason)
VALUES 
  ('test-project-uuid', 'var-1-uuid', 'independent', FALSE, 0.85, 'Variable name suggests predictor role'),
  ('test-project-uuid', 'var-2-uuid', 'dependent', FALSE, 0.90, 'Contains outcome keyword'),
  ('test-project-uuid', 'var-3-uuid', 'control', FALSE, 0.95, 'Demographic variable: age');
*/

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================

-- Verify migration
DO $$
BEGIN
  RAISE NOTICE 'Variable Role Tags Migration Completed Successfully';
  RAISE NOTICE 'Created table: variable_role_tags';
  RAISE NOTICE 'Created indexes: 5 indexes for performance';
  RAISE NOTICE 'Added column: variable_groups.default_role';
  RAISE NOTICE 'Created functions: 4 helper functions';
  RAISE NOTICE 'Created triggers: 1 timestamp trigger';
  RAISE NOTICE 'Enabled RLS: 4 security policies';
END $$;
