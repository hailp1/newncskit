-- ============================================================================
-- MASTER MIGRATION - Fix All Analysis Flow Issues
-- ============================================================================
-- Date: 2024-11-10
-- Purpose: Single comprehensive migration to fix all database issues
-- Run this ONCE to fix everything
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- PART 1: FIX COLUMN NAME ISSUE
-- ============================================================================
-- Issue: analysis_variables has wrong column name (analysis_project_id instead of project_id)
-- Solution: Rename column if needed

DO $$
DECLARE
  has_wrong_name BOOLEAN;
  has_correct_name BOOLEAN;
BEGIN
  -- Check if column has wrong name
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public'
    AND table_name = 'analysis_variables' 
    AND column_name = 'analysis_project_id'
  ) INTO has_wrong_name;

  -- Check if column has correct name
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public'
    AND table_name = 'analysis_variables' 
    AND column_name = 'project_id'
  ) INTO has_correct_name;

  -- Rename if needed
  IF has_wrong_name AND NOT has_correct_name THEN
    RAISE NOTICE '[1/4] Renaming analysis_project_id to project_id...';
    ALTER TABLE analysis_variables 
    RENAME COLUMN analysis_project_id TO project_id;
    RAISE NOTICE '✓ Column renamed successfully!';
  ELSIF has_correct_name THEN
    RAISE NOTICE '[1/4] ✓ Column name is already correct (project_id)';
  ELSE
    RAISE NOTICE '[1/4] ⚠ Warning: Neither column name found - table may not exist yet';
  END IF;
END $$;

-- ============================================================================
-- PART 2: ENSURE STORAGE BUCKET EXISTS
-- ============================================================================
-- Issue: CSV files need storage bucket
-- Solution: Create bucket if not exists

DO $$
BEGIN
  -- Create storage bucket if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM storage.buckets WHERE id = 'analysis-csv-files'
  ) THEN
    RAISE NOTICE '[2/4] Creating storage bucket...';
    
    INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
    VALUES (
      'analysis-csv-files',
      'analysis-csv-files',
      false,
      52428800, -- 50MB
      ARRAY['text/csv', 'application/vnd.ms-excel', 'text/plain']
    );
    
    RAISE NOTICE '✓ Storage bucket created!';
  ELSE
    RAISE NOTICE '[2/4] ✓ Storage bucket already exists';
  END IF;
END $$;

-- ============================================================================
-- PART 3: ENSURE RLS POLICIES FOR STORAGE
-- ============================================================================
-- Issue: Storage needs RLS policies
-- Solution: Create policies if not exist

DO $$
BEGIN
  RAISE NOTICE '[3/4] Setting up storage RLS policies...';
  
  -- Enable RLS
  ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;
  
  -- Drop existing policies if they exist
  DROP POLICY IF EXISTS "Users can upload their own CSV files" ON storage.objects;
  DROP POLICY IF EXISTS "Users can read their own CSV files" ON storage.objects;
  DROP POLICY IF EXISTS "Users can update their own CSV files" ON storage.objects;
  DROP POLICY IF EXISTS "Users can delete their own CSV files" ON storage.objects;
  
  -- Create policies
  CREATE POLICY "Users can upload their own CSV files"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'analysis-csv-files' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

  CREATE POLICY "Users can read their own CSV files"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'analysis-csv-files' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

  CREATE POLICY "Users can update their own CSV files"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'analysis-csv-files' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

  CREATE POLICY "Users can delete their own CSV files"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'analysis-csv-files' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );
  
  RAISE NOTICE '✓ Storage RLS policies created!';
END $$;

-- ============================================================================
-- PART 4: FIX ANALYSIS_VARIABLES RLS POLICIES
-- ============================================================================
-- Issue: RLS policies may be missing or incorrect
-- Solution: Recreate policies

DO $$
BEGIN
  RAISE NOTICE '[4/4] Fixing analysis_variables RLS policies...';
  
  -- Enable RLS
  ALTER TABLE analysis_variables ENABLE ROW LEVEL SECURITY;
  
  -- Drop existing policies
  DROP POLICY IF EXISTS "Users can view variables of their projects" ON analysis_variables;
  DROP POLICY IF EXISTS "Users can insert variables for their projects" ON analysis_variables;
  DROP POLICY IF EXISTS "Users can update variables of their projects" ON analysis_variables;
  DROP POLICY IF EXISTS "Users can delete variables of their projects" ON analysis_variables;
  DROP POLICY IF EXISTS "Users can manage variables of their projects" ON analysis_variables;
  
  -- Create correct policies
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
  
  RAISE NOTICE '✓ RLS policies fixed!';
END $$;

-- ============================================================================
-- VERIFICATION
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '=== MIGRATION COMPLETE ===';
  RAISE NOTICE '✓ Column name fixed (project_id)';
  RAISE NOTICE '✓ Storage bucket created';
  RAISE NOTICE '✓ Storage RLS policies created';
  RAISE NOTICE '✓ Table RLS policies fixed';
  RAISE NOTICE '';
  RAISE NOTICE 'Run these queries to verify:';
  RAISE NOTICE '';
  RAISE NOTICE '1. Check column name:';
  RAISE NOTICE '   SELECT column_name FROM information_schema.columns';
  RAISE NOTICE '   WHERE table_name = ''analysis_variables'' AND column_name = ''project_id'';';
  RAISE NOTICE '';
  RAISE NOTICE '2. Check storage bucket:';
  RAISE NOTICE '   SELECT id, name FROM storage.buckets WHERE id = ''analysis-csv-files'';';
  RAISE NOTICE '';
  RAISE NOTICE '3. Check RLS policies:';
  RAISE NOTICE '   SELECT policyname FROM pg_policies WHERE tablename = ''analysis_variables'';';
  RAISE NOTICE '';
  RAISE NOTICE 'Now test upload at: https://app.ncskit.org/analysis/new';
  RAISE NOTICE '';
END $$;

