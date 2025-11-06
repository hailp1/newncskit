-- Migration: Create Survey Campaigns Table
-- Date: 2024-11-05
-- Description: Create survey_campaigns table for managing survey campaigns with token rewards

\c ncskit;

-- Create enum types for campaign status
CREATE TYPE campaign_status AS ENUM (
    'draft',
    'active',
    'paused', 
    'completed',
    'cancelled'
);

-- Create survey_campaigns table
CREATE TABLE IF NOT EXISTS survey_campaigns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    survey_id UUID, -- Will reference surveys table when created
    title VARCHAR(300) NOT NULL,
    description TEXT,
    
    -- Campaign Configuration
    target_participants INTEGER NOT NULL DEFAULT 100,
    token_reward_per_participant INTEGER NOT NULL DEFAULT 10,
    duration_days INTEGER NOT NULL DEFAULT 30,
    eligibility_criteria JSONB DEFAULT '{}'::jsonb,
    
    -- Campaign Status
    status campaign_status DEFAULT 'draft',
    
    -- Participation Tracking
    total_participants INTEGER DEFAULT 0,
    completed_responses INTEGER DEFAULT 0,
    total_tokens_awarded INTEGER DEFAULT 0,
    admin_fee_collected DECIMAL(10,2) DEFAULT 0.00,
    admin_fee_percentage DECIMAL(5,2) DEFAULT 5.00, -- 5% default admin fee
    
    -- Timeline
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    launched_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    
    -- Metadata
    campaign_data JSONB DEFAULT '{}'::jsonb,
    
    -- Constraints
    CONSTRAINT positive_target_participants CHECK (target_participants > 0),
    CONSTRAINT positive_token_reward CHECK (token_reward_per_participant >= 0),
    CONSTRAINT positive_duration CHECK (duration_days > 0),
    CONSTRAINT valid_admin_fee_percentage CHECK (admin_fee_percentage >= 0 AND admin_fee_percentage <= 100)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_survey_campaigns_project_id ON survey_campaigns(project_id);
CREATE INDEX IF NOT EXISTS idx_survey_campaigns_status ON survey_campaigns(status);
CREATE INDEX IF NOT EXISTS idx_survey_campaigns_created_at ON survey_campaigns(created_at);
CREATE INDEX IF NOT EXISTS idx_survey_campaigns_launched_at ON survey_campaigns(launched_at);
CREATE INDEX IF NOT EXISTS idx_survey_campaigns_eligibility_criteria ON survey_campaigns USING GIN (eligibility_criteria);
CREATE INDEX IF NOT EXISTS idx_survey_campaigns_campaign_data ON survey_campaigns USING GIN (campaign_data);

-- Create trigger for updated_at
CREATE TRIGGER update_survey_campaigns_updated_at 
    BEFORE UPDATE ON survey_campaigns 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add comments
COMMENT ON TABLE survey_campaigns IS 'Survey campaigns for collecting data from community members with token rewards';
COMMENT ON COLUMN survey_campaigns.eligibility_criteria IS 'JSON criteria for participant eligibility (demographics, experience, etc.)';
COMMENT ON COLUMN survey_campaigns.campaign_data IS 'Additional campaign configuration and metadata';
COMMENT ON COLUMN survey_campaigns.admin_fee_percentage IS 'Percentage of total token rewards collected as admin fee';