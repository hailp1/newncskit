-- Migration: Enhance Project Structure for Workflow Restructure
-- Date: 2024-11-05
-- Description: Add research_design, data_collection, and progress fields to projects table

\c ncskit;

-- Create enum types for project stages and data collection methods
CREATE TYPE project_stage AS ENUM (
    'idea_complete',
    'theoretical_framework_complete', 
    'survey_complete',
    'data_collection_complete',
    'analysis_complete',
    'draft_complete',
    'citation_complete',
    'format_complete',
    'plagiarism_check_complete',
    'submitted',
    'published'
);

CREATE TYPE data_collection_method AS ENUM (
    'internal_survey',
    'external_data'
);

CREATE TYPE data_collection_status AS ENUM (
    'not_started',
    'active', 
    'completed'
);

CREATE TYPE submission_status AS ENUM (
    'draft',
    'submitted',
    'under_review',
    'accepted',
    'published'
);

-- Add new columns to projects table
ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS research_design JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS data_collection JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS progress_tracking JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS publication_info JSONB DEFAULT '{}'::jsonb;

-- Add indexes for the new JSONB columns for better query performance
CREATE INDEX IF NOT EXISTS idx_projects_research_design ON projects USING GIN (research_design);
CREATE INDEX IF NOT EXISTS idx_projects_data_collection ON projects USING GIN (data_collection);
CREATE INDEX IF NOT EXISTS idx_projects_progress_tracking ON projects USING GIN (progress_tracking);
CREATE INDEX IF NOT EXISTS idx_projects_publication_info ON projects USING GIN (publication_info);

-- Add comments to document the new columns
COMMENT ON COLUMN projects.research_design IS 'Research design data including theoretical frameworks, variables, and hypotheses';
COMMENT ON COLUMN projects.data_collection IS 'Data collection configuration including survey settings and campaign info';
COMMENT ON COLUMN projects.progress_tracking IS 'Project progress tracking with current stage and completed milestones';
COMMENT ON COLUMN projects.publication_info IS 'Publication tracking information including submission status and journal details';