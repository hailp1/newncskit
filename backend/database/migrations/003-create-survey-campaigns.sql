-- Migration: Create Survey Campaigns Tables
-- Description: Creates tables for campaign management, participants, and analytics
-- Author: Kiro AI
-- Date: 2024-01-09

-- ============================================================================
-- 1. Create survey_campaigns table
-- ============================================================================

CREATE TABLE IF NOT EXISTS survey_campaigns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  survey_id UUID, -- References surveys table (if exists)
  created_by UUID NOT NULL, -- References auth.users
  
  -- Basic Info
  title VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(50),
  tags TEXT[],
  
  -- Configuration
  target_participants INTEGER NOT NULL CHECK (target_participants > 0),
  token_reward_per_participant DECIMAL(10,2) NOT NULL CHECK (token_reward_per_participant >= 0),
  admin_fee_percentage DECIMAL(5,2) DEFAULT 5.0 CHECK (admin_fee_percentage >= 0 AND admin_fee_percentage <= 100),
  duration_days INTEGER NOT NULL CHECK (duration_days > 0 AND duration_days <= 365),
  
  -- Eligibility Criteria (stored as JSONB for flexibility)
  eligibility_criteria JSONB DEFAULT '{}'::jsonb,
  demographic_filters JSONB DEFAULT '{}'::jsonb,
  
  -- Status & Lifecycle
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused', 'completed', 'cancelled')),
  launched_at TIMESTAMP,
  completed_at TIMESTAMP,
  cancelled_at TIMESTAMP,
  
  -- Participation Tracking
  current_participants INTEGER DEFAULT 0 CHECK (current_participants >= 0),
  completed_responses INTEGER DEFAULT 0 CHECK (completed_responses >= 0),
  total_tokens_awarded DECIMAL(12,2) DEFAULT 0 CHECK (total_tokens_awarded >= 0),
  admin_fees_collected DECIMAL(12,2) DEFAULT 0 CHECK (admin_fees_collected >= 0),
  
  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT valid_participant_counts CHECK (completed_responses <= current_participants),
  CONSTRAINT valid_participant_target CHECK (current_participants <= target_participants * 2) -- Allow 2x oversubscription
);

-- Add indexes for common queries
CREATE INDEX idx_campaigns_status ON survey_campaigns(status);
CREATE INDEX idx_campaigns_created_by ON survey_campaigns(created_by);
CREATE INDEX idx_campaigns_project ON survey_campaigns(project_id);
CREATE INDEX idx_campaigns_created_at ON survey_campaigns(created_at DESC);
CREATE INDEX idx_campaigns_status_created ON survey_campaigns(status, created_at DESC);
CREATE INDEX idx_campaigns_user_status ON survey_campaigns(created_by, status);

-- Add comment
COMMENT ON TABLE survey_campaigns IS 'Stores survey campaign configurations and tracking data';

-- ============================================================================
-- 2. Create campaign_participants table
-- ============================================================================

CREATE TABLE IF NOT EXISTS campaign_participants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID NOT NULL REFERENCES survey_campaigns(id) ON DELETE CASCADE,
  user_id UUID NOT NULL, -- References auth.users
  
  -- Participation Status
  status VARCHAR(20) DEFAULT 'invited' CHECK (status IN ('invited', 'started', 'completed', 'dropped_out')),
  invited_at TIMESTAMP DEFAULT NOW(),
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  dropped_out_at TIMESTAMP,
  
  -- Rewards
  tokens_awarded DECIMAL(10,2) DEFAULT 0 CHECK (tokens_awarded >= 0),
  reward_paid_at TIMESTAMP,
  
  -- Quality Metrics
  response_quality_score DECIMAL(3,2) CHECK (response_quality_score >= 0 AND response_quality_score <= 5),
  completion_time_minutes INTEGER CHECK (completion_time_minutes > 0),
  
  -- Device & Context
  device_type VARCHAR(20), -- 'desktop', 'mobile', 'tablet'
  user_agent TEXT,
  ip_address INET,
  
  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT unique_participant UNIQUE (campaign_id, user_id),
  CONSTRAINT valid_timestamps CHECK (
    (started_at IS NULL OR started_at >= invited_at) AND
    (completed_at IS NULL OR completed_at >= started_at) AND
    (dropped_out_at IS NULL OR dropped_out_at >= started_at)
  )
);

-- Add indexes
CREATE INDEX idx_participants_campaign ON campaign_participants(campaign_id);
CREATE INDEX idx_participants_user ON campaign_participants(user_id);
CREATE INDEX idx_participants_status ON campaign_participants(status);
CREATE INDEX idx_participants_campaign_status ON campaign_participants(campaign_id, status);
CREATE INDEX idx_participants_completed_at ON campaign_participants(completed_at DESC);

-- Add comment
COMMENT ON TABLE campaign_participants IS 'Tracks individual participant engagement with campaigns';

-- ============================================================================
-- 3. Create campaign_analytics table (daily aggregates)
-- ============================================================================

CREATE TABLE IF NOT EXISTS campaign_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID NOT NULL REFERENCES survey_campaigns(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  
  -- Daily Metrics
  views INTEGER DEFAULT 0 CHECK (views >= 0),
  clicks INTEGER DEFAULT 0 CHECK (clicks >= 0),
  starts INTEGER DEFAULT 0 CHECK (starts >= 0),
  completions INTEGER DEFAULT 0 CHECK (completions >= 0),
  dropouts INTEGER DEFAULT 0 CHECK (dropouts >= 0),
  
  -- Aggregated Quality Metrics
  avg_completion_time_minutes DECIMAL(6,2) CHECK (avg_completion_time_minutes >= 0),
  avg_response_quality DECIMAL(3,2) CHECK (avg_response_quality >= 0 AND avg_response_quality <= 5),
  
  -- Financial
  tokens_distributed DECIMAL(10,2) DEFAULT 0 CHECK (tokens_distributed >= 0),
  
  -- Device Breakdown
  desktop_count INTEGER DEFAULT 0,
  mobile_count INTEGER DEFAULT 0,
  tablet_count INTEGER DEFAULT 0,
  
  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT unique_campaign_date UNIQUE (campaign_id, date),
  CONSTRAINT valid_funnel CHECK (clicks <= views AND starts <= clicks)
);

-- Add indexes
CREATE INDEX idx_analytics_campaign ON campaign_analytics(campaign_id);
CREATE INDEX idx_analytics_date ON campaign_analytics(date DESC);
CREATE INDEX idx_analytics_campaign_date ON campaign_analytics(campaign_id, date DESC);

-- Add comment
COMMENT ON TABLE campaign_analytics IS 'Daily aggregated analytics for campaign performance tracking';

-- ============================================================================
-- 4. Create campaign_templates table (optional)
-- ============================================================================

CREATE TABLE IF NOT EXISTS campaign_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(50) NOT NULL,
  icon VARCHAR(50),
  
  -- Template Configuration (stored as JSONB)
  default_config JSONB NOT NULL,
  
  -- Guidance
  tips TEXT[],
  best_practices TEXT[],
  
  -- Metadata
  is_system_template BOOLEAN DEFAULT false,
  created_by UUID, -- NULL for system templates
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  CONSTRAINT unique_template_name UNIQUE (name, created_by)
);

-- Add indexes
CREATE INDEX idx_templates_category ON campaign_templates(category);
CREATE INDEX idx_templates_created_by ON campaign_templates(created_by);
CREATE INDEX idx_templates_system ON campaign_templates(is_system_template);

-- Add comment
COMMENT ON TABLE campaign_templates IS 'Stores campaign templates for quick campaign creation';

-- ============================================================================
-- 5. Create triggers for updated_at timestamps
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to all tables
CREATE TRIGGER update_survey_campaigns_updated_at
  BEFORE UPDATE ON survey_campaigns
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_campaign_participants_updated_at
  BEFORE UPDATE ON campaign_participants
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_campaign_analytics_updated_at
  BEFORE UPDATE ON campaign_analytics
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_campaign_templates_updated_at
  BEFORE UPDATE ON campaign_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 6. Insert default campaign templates
-- ============================================================================

INSERT INTO campaign_templates (name, description, category, icon, default_config, tips, best_practices, is_system_template)
VALUES
  (
    'Academic Research Survey',
    'Standard template for academic research studies',
    'academic',
    'graduation-cap',
    '{
      "targetParticipants": 200,
      "tokenRewardPerParticipant": 10,
      "duration": 30,
      "eligibilityCriteria": {
        "minAge": 18,
        "requiredDemographics": ["age", "education"],
        "excludedGroups": []
      },
      "estimatedCompletionTime": 15
    }'::jsonb,
    ARRAY[
      'Clearly state research purpose and IRB approval',
      'Ensure informed consent is obtained',
      'Provide contact information for questions'
    ],
    ARRAY[
      'Use clear, unbiased language',
      'Pilot test with small group first',
      'Provide progress indicators'
    ],
    true
  ),
  (
    'Market Research Survey',
    'Template for product/service feedback collection',
    'market',
    'shopping-cart',
    '{
      "targetParticipants": 500,
      "tokenRewardPerParticipant": 5,
      "duration": 14,
      "eligibilityCriteria": {
        "minAge": 18,
        "requiredDemographics": ["age", "location", "income"],
        "excludedGroups": []
      },
      "estimatedCompletionTime": 10
    }'::jsonb,
    ARRAY[
      'Focus on specific product/service features',
      'Include screening questions for target audience',
      'Keep survey concise for better completion rates'
    ],
    ARRAY[
      'Use skip logic to reduce survey length',
      'Include attention check questions',
      'Offer incentive for completion'
    ],
    true
  ),
  (
    'Social Research Survey',
    'Template for social science and behavioral studies',
    'social',
    'users',
    '{
      "targetParticipants": 300,
      "tokenRewardPerParticipant": 8,
      "duration": 21,
      "eligibilityCriteria": {
        "minAge": 18,
        "requiredDemographics": ["age", "gender", "education"],
        "excludedGroups": []
      },
      "estimatedCompletionTime": 12
    }'::jsonb,
    ARRAY[
      'Consider cultural sensitivity in questions',
      'Use validated scales when possible',
      'Ensure anonymity and confidentiality'
    ],
    ARRAY[
      'Randomize question order to reduce bias',
      'Include reverse-coded items',
      'Provide clear instructions'
    ],
    true
  ),
  (
    'Health & Wellness Survey',
    'Template for health-related research and feedback',
    'health',
    'heart',
    '{
      "targetParticipants": 250,
      "tokenRewardPerParticipant": 12,
      "duration": 28,
      "eligibilityCriteria": {
        "minAge": 18,
        "requiredDemographics": ["age", "gender"],
        "excludedGroups": []
      },
      "estimatedCompletionTime": 18
    }'::jsonb,
    ARRAY[
      'Ensure HIPAA compliance if collecting health data',
      'Use validated health assessment tools',
      'Provide resources for participants if needed'
    ],
    ARRAY[
      'Use sensitive language for health topics',
      'Allow "prefer not to answer" options',
      'Provide clear data usage policies'
    ],
    true
  )
ON CONFLICT DO NOTHING;

-- ============================================================================
-- 7. Grant permissions (adjust based on your auth setup)
-- ============================================================================

-- Grant permissions to authenticated users
-- GRANT SELECT, INSERT, UPDATE ON survey_campaigns TO authenticated;
-- GRANT SELECT, INSERT, UPDATE ON campaign_participants TO authenticated;
-- GRANT SELECT ON campaign_analytics TO authenticated;
-- GRANT SELECT ON campaign_templates TO authenticated;

-- ============================================================================
-- Migration Complete
-- ============================================================================

-- Verify tables were created
DO $$
BEGIN
  RAISE NOTICE 'Migration 003 completed successfully';
  RAISE NOTICE 'Created tables: survey_campaigns, campaign_participants, campaign_analytics, campaign_templates';
  RAISE NOTICE 'Created indexes for optimal query performance';
  RAISE NOTICE 'Inserted 4 default campaign templates';
END $$;
