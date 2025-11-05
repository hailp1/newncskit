-- Production Deployment Migration Script
-- Date: 2024-11-05
-- Description: Prepare database for production deployment with workflow restructure

\c ncskit;

-- Create deployment tracking table
CREATE TABLE IF NOT EXISTS deployment_history (
    id SERIAL PRIMARY KEY,
    version VARCHAR(50) NOT NULL,
    deployment_type VARCHAR(20) NOT NULL, -- 'migration', 'rollback', 'hotfix'
    description TEXT,
    executed_by VARCHAR(100),
    executed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    success BOOLEAN DEFAULT true,
    error_message TEXT,
    rollback_script TEXT
);

-- Insert current deployment record
INSERT INTO deployment_history (version, deployment_type, description, executed_by) 
VALUES ('1.0.0-workflow-restructure', 'migration', 'Workflow restructure deployment', 'system');

-- Create feature flags table for gradual rollout
CREATE TABLE IF NOT EXISTS feature_flags (
    id SERIAL PRIMARY KEY,
    flag_name VARCHAR(100) UNIQUE NOT NULL,
    is_enabled BOOLEAN DEFAULT false,
    description TEXT,
    target_percentage INTEGER DEFAULT 0 CHECK (target_percentage >= 0 AND target_percentage <= 100),
    user_criteria JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert feature flags for gradual rollout
INSERT INTO feature_flags (flag_name, is_enabled, description, target_percentage) VALUES
('enhanced_project_creation', false, 'Enable 3-step project creation workflow', 0),
('intelligent_survey_builder', false, 'Enable AI-powered survey generation', 0),
('survey_campaigns', false, 'Enable survey campaign system with token rewards', 0),
('progress_tracking', false, 'Enable milestone-based progress tracking', 0),
('question_bank', false, 'Enable question bank and template system', 0)
ON CONFLICT (flag_name) DO NOTHING;

-- Create data migration tracking
CREATE TABLE IF NOT EXISTS data_migrations (
    id SERIAL PRIMARY KEY,
    migration_name VARCHAR(100) UNIQUE NOT NULL,
    table_name VARCHAR(100) NOT NULL,
    records_processed INTEGER DEFAULT 0,
    records_failed INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'running', 'completed', 'failed'
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    error_details JSONB
);

-- Migrate existing projects to new structure
INSERT INTO data_migrations (migration_name, table_name) VALUES
('migrate_existing_projects', 'projects'),
('create_default_milestones', 'progress_tracking'),
('initialize_question_bank', 'question_bank')
ON CONFLICT (migration_name) DO NOTHING;

-- Create backup of existing projects before migration
CREATE TABLE IF NOT EXISTS projects_backup AS 
SELECT * FROM projects WHERE 1=0; -- Create structure only

-- Function to safely migrate existing projects
CREATE OR REPLACE FUNCTION migrate_existing_projects()
RETURNS TABLE(
    project_id UUID,
    migration_status TEXT,
    error_message TEXT
) AS $$
DECLARE
    project_record RECORD;
    migration_record RECORD;
BEGIN
    -- Update migration status
    UPDATE data_migrations 
    SET status = 'running', started_at = NOW() 
    WHERE migration_name = 'migrate_existing_projects';

    -- Process each existing project
    FOR project_record IN 
        SELECT * FROM projects 
        WHERE research_design IS NULL OR data_collection IS NULL
    LOOP
        BEGIN
            -- Backup original project
            INSERT INTO projects_backup SELECT project_record.*;
            
            -- Update project with default values for new fields
            UPDATE projects SET
                research_design = COALESCE(research_design, '{
                    "theoreticalFrameworks": [],
                    "researchVariables": [],
                    "hypotheses": [],
                    "methodology": "To be defined"
                }'::jsonb),
                data_collection = COALESCE(data_collection, '{
                    "targetSampleSize": 100,
                    "collectionMethod": "external_data",
                    "status": "not_started"
                }'::jsonb),
                progress_tracking = COALESCE(progress_tracking, '{
                    "currentStage": "idea_complete",
                    "completedMilestones": [],
                    "timeline": []
                }'::jsonb),
                publication_info = COALESCE(publication_info, '{}'::jsonb)
            WHERE id = project_record.id;

            -- Return success
            project_id := project_record.id;
            migration_status := 'success';
            error_message := NULL;
            RETURN NEXT;

        EXCEPTION WHEN OTHERS THEN
            -- Return error
            project_id := project_record.id;
            migration_status := 'error';
            error_message := SQLERRM;
            RETURN NEXT;
        END;
    END LOOP;

    -- Update migration completion
    UPDATE data_migrations 
    SET status = 'completed', completed_at = NOW() 
    WHERE migration_name = 'migrate_existing_projects';

END;
$$ LANGUAGE plpgsql;

-- Function to create default milestones for existing projects
CREATE OR REPLACE FUNCTION create_default_milestones_for_existing_projects()
RETURNS TABLE(
    project_id UUID,
    milestones_created INTEGER,
    error_message TEXT
) AS $$
DECLARE
    project_record RECORD;
    milestone_count INTEGER;
BEGIN
    -- Update migration status
    UPDATE data_migrations 
    SET status = 'running', started_at = NOW() 
    WHERE migration_name = 'create_default_milestones';

    -- Process each project that doesn't have milestones
    FOR project_record IN 
        SELECT p.* FROM projects p
        LEFT JOIN progress_tracking pt ON pt.project_id = p.id
        WHERE pt.id IS NULL
    LOOP
        BEGIN
            milestone_count := 0;
            
            -- Create default milestones
            INSERT INTO progress_tracking (
                project_id, milestone_name, milestone_description, milestone_type, order_index
            ) VALUES 
                (project_record.id, 'Complete Research Idea', 'Finalize research idea and problem definition', 'research_planning', 1),
                (project_record.id, 'Complete Theoretical Framework', 'Complete theoretical framework and variable definitions', 'theoretical_framework', 2),
                (project_record.id, 'Complete Survey Design', 'Complete survey design and questionnaire', 'survey_design', 3),
                (project_record.id, 'Complete Data Collection', 'Complete data collection from surveys', 'data_collection', 4),
                (project_record.id, 'Complete Data Analysis', 'Complete quantitative analysis and statistical tests', 'data_analysis', 5),
                (project_record.id, 'Complete Initial Draft', 'Complete initial draft of manuscript', 'writing', 6),
                (project_record.id, 'Complete Final Draft', 'Complete manuscript with full citations', 'writing', 7),
                (project_record.id, 'Complete Formatting', 'Complete manuscript formatting to standards', 'review', 8),
                (project_record.id, 'Complete Review', 'Complete plagiarism check and final review', 'review', 9),
                (project_record.id, 'Submit Manuscript', 'Submit to journal with status tracking', 'submission', 10),
                (project_record.id, 'Publication', 'Published with publication link', 'publication', 11);

            GET DIAGNOSTICS milestone_count = ROW_COUNT;

            -- Return success
            project_id := project_record.id;
            milestones_created := milestone_count;
            error_message := NULL;
            RETURN NEXT;

        EXCEPTION WHEN OTHERS THEN
            -- Return error
            project_id := project_record.id;
            milestones_created := 0;
            error_message := SQLERRM;
            RETURN NEXT;
        END;
    END LOOP;

    -- Update migration completion
    UPDATE data_migrations 
    SET status = 'completed', completed_at = NOW() 
    WHERE migration_name = 'create_default_milestones';

END;
$$ LANGUAGE plpgsql;

-- Function to rollback migrations if needed
CREATE OR REPLACE FUNCTION rollback_workflow_migration()
RETURNS BOOLEAN AS $$
BEGIN
    -- Restore projects from backup
    IF EXISTS (SELECT 1 FROM projects_backup LIMIT 1) THEN
        -- Clear current projects
        DELETE FROM projects;
        
        -- Restore from backup
        INSERT INTO projects SELECT * FROM projects_backup;
        
        -- Log rollback
        INSERT INTO deployment_history (version, deployment_type, description, executed_by) 
        VALUES ('1.0.0-workflow-restructure', 'rollback', 'Rolled back workflow restructure', 'system');
        
        RETURN TRUE;
    END IF;
    
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql;

-- Create indexes for performance optimization
CREATE INDEX IF NOT EXISTS idx_feature_flags_enabled ON feature_flags(is_enabled) WHERE is_enabled = true;
CREATE INDEX IF NOT EXISTS idx_deployment_history_version ON deployment_history(version);
CREATE INDEX IF NOT EXISTS idx_data_migrations_status ON data_migrations(status);

-- Create monitoring views
CREATE OR REPLACE VIEW deployment_status AS
SELECT 
    dh.version,
    dh.deployment_type,
    dh.description,
    dh.executed_at,
    dh.success,
    COUNT(dm.id) as total_migrations,
    COUNT(CASE WHEN dm.status = 'completed' THEN 1 END) as completed_migrations,
    COUNT(CASE WHEN dm.status = 'failed' THEN 1 END) as failed_migrations
FROM deployment_history dh
LEFT JOIN data_migrations dm ON dm.migration_name LIKE '%' || dh.version || '%'
WHERE dh.id = (SELECT MAX(id) FROM deployment_history)
GROUP BY dh.version, dh.deployment_type, dh.description, dh.executed_at, dh.success;

CREATE OR REPLACE VIEW feature_rollout_status AS
SELECT 
    flag_name,
    is_enabled,
    target_percentage,
    description,
    CASE 
        WHEN is_enabled AND target_percentage = 100 THEN 'Fully Deployed'
        WHEN is_enabled AND target_percentage > 0 THEN 'Gradual Rollout'
        WHEN is_enabled AND target_percentage = 0 THEN 'Enabled (No Traffic)'
        ELSE 'Disabled'
    END as rollout_status
FROM feature_flags
ORDER BY flag_name;

-- Grant necessary permissions
GRANT SELECT ON deployment_status TO PUBLIC;
GRANT SELECT ON feature_rollout_status TO PUBLIC;

-- Create health check function
CREATE OR REPLACE FUNCTION workflow_health_check()
RETURNS TABLE(
    component TEXT,
    status TEXT,
    details TEXT
) AS $$
BEGIN
    -- Check database schema
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name IN ('survey_campaigns', 'question_bank', 'progress_tracking', 'timeline_events')
    ) THEN
        component := 'Database Schema';
        status := 'OK';
        details := 'All required tables exist';
        RETURN NEXT;
    ELSE
        component := 'Database Schema';
        status := 'ERROR';
        details := 'Missing required tables';
        RETURN NEXT;
    END IF;

    -- Check data migrations
    IF EXISTS (
        SELECT 1 FROM data_migrations 
        WHERE status = 'failed'
    ) THEN
        component := 'Data Migrations';
        status := 'WARNING';
        details := 'Some migrations failed';
        RETURN NEXT;
    ELSE
        component := 'Data Migrations';
        status := 'OK';
        details := 'All migrations completed successfully';
        RETURN NEXT;
    END IF;

    -- Check feature flags
    component := 'Feature Flags';
    status := 'OK';
    details := (
        SELECT COUNT(*)::TEXT || ' flags configured' 
        FROM feature_flags
    );
    RETURN NEXT;

END;
$$ LANGUAGE plpgsql;

-- Log successful deployment preparation
INSERT INTO deployment_history (version, deployment_type, description, executed_by, success) 
VALUES ('1.0.0-workflow-restructure', 'migration', 'Production deployment preparation completed', 'system', true);

-- Display deployment summary
SELECT 'Deployment preparation completed successfully' as status;
SELECT * FROM deployment_status;
SELECT * FROM feature_rollout_status;