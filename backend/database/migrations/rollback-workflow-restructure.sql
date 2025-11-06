-- Rollback Script for Workflow Restructure Migrations
-- Date: 2024-11-05
-- Description: Rollback all changes made by the workflow restructure migrations

\c ncskit;

-- Drop triggers first
DROP TRIGGER IF EXISTS milestone_status_change_trigger ON progress_tracking;
DROP TRIGGER IF EXISTS update_progress_tracking_updated_at ON progress_tracking;
DROP TRIGGER IF EXISTS update_question_bank_updated_at ON question_bank;
DROP TRIGGER IF EXISTS update_survey_campaigns_updated_at ON survey_campaigns;

-- Drop functions
DROP FUNCTION IF EXISTS create_milestone_timeline_event();

-- Drop tables in reverse dependency order
DROP TABLE IF EXISTS timeline_events CASCADE;
DROP TABLE IF EXISTS progress_tracking CASCADE;
DROP TABLE IF EXISTS question_bank CASCADE;
DROP TABLE IF EXISTS survey_campaigns CASCADE;

-- Remove columns from projects table
ALTER TABLE projects 
DROP COLUMN IF EXISTS research_design,
DROP COLUMN IF EXISTS data_collection,
DROP COLUMN IF EXISTS progress_tracking,
DROP COLUMN IF EXISTS publication_info;

-- Drop custom types
DROP TYPE IF EXISTS submission_status CASCADE;
DROP TYPE IF EXISTS milestone_status CASCADE;
DROP TYPE IF EXISTS milestone_type CASCADE;
DROP TYPE IF EXISTS question_type CASCADE;
DROP TYPE IF EXISTS campaign_status CASCADE;
DROP TYPE IF EXISTS data_collection_status CASCADE;
DROP TYPE IF EXISTS data_collection_method CASCADE;
DROP TYPE IF EXISTS project_stage CASCADE;

-- Remove migration records
DELETE FROM schema_migrations WHERE migration_name IN (
    '001-enhance-project-structure',
    '002-create-survey-campaigns', 
    '003-create-question-bank',
    '004-create-progress-tracking'
);

-- Drop migration tracking table if it's empty
DELETE FROM schema_migrations WHERE migration_name LIKE '%workflow-restructure%';

SELECT 'Rollback completed successfully. All workflow restructure changes have been reverted.' as status;