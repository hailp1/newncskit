-- ============================================================================
-- Fix RLS Policy for analysis_variables
-- ============================================================================
-- Description: Fix RLS policy to allow INSERT operations
-- Date: 2024-11-10
-- Issue: "new row violates row-level security policy for table analysis_variables"
-- ============================================================================

-- Drop the existing policy that doesn't work for INSERT
DROP POLICY IF EXISTS "Users can manage variables of their projects" ON analysis_variables;

-- Create separate policies for different operations

-- Policy for INSERT: Check that the project belongs to the user
CREATE POLICY "Users can insert variables for their projects"
  ON analysis_variables FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM analysis_projects
      WHERE analysis_projects.id = analysis_variables.analysis_project_id
      AND analysis_projects.user_id = auth.uid()
    )
  );

-- Policy for UPDATE: Check that the project belongs to the user
CREATE POLICY "Users can update variables of their projects"
  ON analysis_variables FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM analysis_projects
      WHERE analysis_projects.id = analysis_variables.analysis_project_id
      AND analysis_projects.user_id = auth.uid()
    )
  );

-- Policy for DELETE: Check that the project belongs to the user
CREATE POLICY "Users can delete variables of their projects"
  ON analysis_variables FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM analysis_projects
      WHERE analysis_projects.id = analysis_variables.analysis_project_id
      AND analysis_projects.user_id = auth.uid()
    )
  );

-- Log completion
DO $$
BEGIN
  RAISE NOTICE 'Fixed RLS policies for analysis_variables';
  RAISE NOTICE 'Created 3 separate policies: INSERT, UPDATE, DELETE';
  RAISE NOTICE 'INSERT policy uses WITH CHECK clause';
END $$;

