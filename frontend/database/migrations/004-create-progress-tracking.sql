-- Migration: Create Progress Tracking Table
-- Date: 2024-11-05
-- Description: Create progress_tracking table for detailed milestone management

\c ncskit;

-- Create enum types for milestone types and status
CREATE TYPE milestone_type AS ENUM (
    'research_planning',
    'theoretical_framework',
    'survey_design',
    'data_collection',
    'data_analysis',
    'writing',
    'review',
    'submission',
    'publication'
);

CREATE TYPE milestone_status AS ENUM (
    'not_started',
    'in_progress',
    'completed',
    'blocked',
    'skipped'
);

-- Create progress_tracking table
CREATE TABLE IF NOT EXISTS progress_tracking (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    
    -- Milestone Information
    milestone_name VARCHAR(300) NOT NULL,
    milestone_description TEXT,
    milestone_type milestone_type NOT NULL,
    milestone_status milestone_status DEFAULT 'not_started',
    
    -- Progress Details
    progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
    estimated_hours INTEGER,
    actual_hours INTEGER,
    
    -- Timeline
    planned_start_date TIMESTAMP WITH TIME ZONE,
    actual_start_date TIMESTAMP WITH TIME ZONE,
    planned_completion_date TIMESTAMP WITH TIME ZONE,
    actual_completion_date TIMESTAMP WITH TIME ZONE,
    
    -- Dependencies and Order
    order_index INTEGER NOT NULL DEFAULT 0,
    depends_on UUID[] DEFAULT '{}', -- Array of milestone IDs this depends on
    
    -- Metadata
    notes TEXT,
    attachments JSONB DEFAULT '[]'::jsonb, -- Array of file references
    milestone_data JSONB DEFAULT '{}'::jsonb, -- Additional milestone-specific data
    
    -- Tracking
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES users(id),
    completed_by UUID REFERENCES users(id),
    
    -- Constraints
    CONSTRAINT valid_dates CHECK (
        (planned_start_date IS NULL OR planned_completion_date IS NULL OR planned_start_date <= planned_completion_date) AND
        (actual_start_date IS NULL OR actual_completion_date IS NULL OR actual_start_date <= actual_completion_date)
    ),
    CONSTRAINT valid_hours CHECK (estimated_hours IS NULL OR estimated_hours >= 0),
    CONSTRAINT valid_actual_hours CHECK (actual_hours IS NULL OR actual_hours >= 0)
);

-- Create timeline_events table for detailed activity tracking
CREATE TABLE IF NOT EXISTS timeline_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    milestone_id UUID REFERENCES progress_tracking(id) ON DELETE CASCADE,
    
    -- Event Information
    event_type VARCHAR(100) NOT NULL, -- 'milestone_started', 'milestone_completed', 'status_changed', etc.
    event_description TEXT NOT NULL,
    event_data JSONB DEFAULT '{}'::jsonb,
    
    -- Timeline
    event_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- User tracking
    user_id UUID REFERENCES users(id),
    
    -- Metadata
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_progress_tracking_project_id ON progress_tracking(project_id);
CREATE INDEX IF NOT EXISTS idx_progress_tracking_milestone_type ON progress_tracking(milestone_type);
CREATE INDEX IF NOT EXISTS idx_progress_tracking_milestone_status ON progress_tracking(milestone_status);
CREATE INDEX IF NOT EXISTS idx_progress_tracking_order_index ON progress_tracking(order_index);
CREATE INDEX IF NOT EXISTS idx_progress_tracking_planned_completion ON progress_tracking(planned_completion_date);
CREATE INDEX IF NOT EXISTS idx_progress_tracking_actual_completion ON progress_tracking(actual_completion_date);
CREATE INDEX IF NOT EXISTS idx_progress_tracking_created_by ON progress_tracking(created_by);
CREATE INDEX IF NOT EXISTS idx_progress_tracking_milestone_data ON progress_tracking USING GIN (milestone_data);

-- Timeline events indexes
CREATE INDEX IF NOT EXISTS idx_timeline_events_project_id ON timeline_events(project_id);
CREATE INDEX IF NOT EXISTS idx_timeline_events_milestone_id ON timeline_events(milestone_id);
CREATE INDEX IF NOT EXISTS idx_timeline_events_event_type ON timeline_events(event_type);
CREATE INDEX IF NOT EXISTS idx_timeline_events_timestamp ON timeline_events(event_timestamp);
CREATE INDEX IF NOT EXISTS idx_timeline_events_user_id ON timeline_events(user_id);

-- Create composite indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_progress_tracking_project_status ON progress_tracking(project_id, milestone_status);
CREATE INDEX IF NOT EXISTS idx_progress_tracking_project_type ON progress_tracking(project_id, milestone_type);
CREATE INDEX IF NOT EXISTS idx_timeline_events_project_timestamp ON timeline_events(project_id, event_timestamp);

-- Create triggers for updated_at
CREATE TRIGGER update_progress_tracking_updated_at 
    BEFORE UPDATE ON progress_tracking 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function to automatically create timeline events when milestones change
CREATE OR REPLACE FUNCTION create_milestone_timeline_event()
RETURNS TRIGGER AS $$
BEGIN
    -- Create timeline event when milestone status changes
    IF OLD.milestone_status IS DISTINCT FROM NEW.milestone_status THEN
        INSERT INTO timeline_events (
            project_id, 
            milestone_id, 
            event_type, 
            event_description, 
            event_data,
            user_id
        ) VALUES (
            NEW.project_id,
            NEW.id,
            'status_changed',
            'Milestone status changed from ' || COALESCE(OLD.milestone_status::text, 'null') || ' to ' || NEW.milestone_status::text,
            jsonb_build_object(
                'old_status', OLD.milestone_status,
                'new_status', NEW.milestone_status,
                'milestone_name', NEW.milestone_name
            ),
            NEW.completed_by
        );
    END IF;
    
    -- Create timeline event when milestone is completed
    IF OLD.milestone_status != 'completed' AND NEW.milestone_status = 'completed' THEN
        INSERT INTO timeline_events (
            project_id, 
            milestone_id, 
            event_type, 
            event_description, 
            event_data,
            user_id
        ) VALUES (
            NEW.project_id,
            NEW.id,
            'milestone_completed',
            'Milestone "' || NEW.milestone_name || '" completed',
            jsonb_build_object(
                'milestone_name', NEW.milestone_name,
                'milestone_type', NEW.milestone_type,
                'completion_date', NEW.actual_completion_date
            ),
            NEW.completed_by
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timeline event creation
CREATE TRIGGER milestone_status_change_trigger
    AFTER UPDATE ON progress_tracking
    FOR EACH ROW
    EXECUTE FUNCTION create_milestone_timeline_event();

-- Add comments
COMMENT ON TABLE progress_tracking IS 'Detailed milestone tracking for project progress management';
COMMENT ON TABLE timeline_events IS 'Timeline of events and activities for projects and milestones';
COMMENT ON COLUMN progress_tracking.depends_on IS 'Array of milestone IDs that must be completed before this milestone can start';
COMMENT ON COLUMN progress_tracking.milestone_data IS 'Additional milestone-specific configuration and data';
COMMENT ON COLUMN timeline_events.event_data IS 'JSON data specific to the event type';
COMMENT ON COLUMN timeline_events.metadata IS 'Additional metadata for the timeline event';