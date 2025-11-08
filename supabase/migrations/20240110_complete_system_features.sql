-- ============================================================================
-- Complete System Features
-- Created: 2024-01-10
-- Description: Additional system features including notifications, payments, and AI
-- ============================================================================

-- ============================================================================
-- PART 1: NOTIFICATIONS SYSTEM
-- ============================================================================

-- Table: notifications
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type VARCHAR(50) NOT NULL CHECK (
    type IN (
      'system', 'analysis_complete', 'analysis_failed', 'token_earned',
      'token_spent', 'referral_reward', 'project_shared', 'comment_reply',
      'subscription_expiring', 'export_ready', 'health_check_warning'
    )
  ),
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  action_url TEXT,
  action_label VARCHAR(100),
  priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}',
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_type ON notifications(type);
CREATE INDEX idx_notifications_read ON notifications(is_read);
CREATE INDEX idx_notifications_created ON notifications(created_at DESC);
CREATE INDEX idx_notifications_priority ON notifications(priority);

-- ============================================================================
-- PART 2: PAYMENT & SUBSCRIPTION SYSTEM
-- ============================================================================

-- Table: payment_transactions
CREATE TABLE IF NOT EXISTS payment_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  transaction_type VARCHAR(50) NOT NULL CHECK (
    transaction_type IN ('token_purchase', 'subscription', 'refund', 'adjustment')
  ),
  amount_usd NUMERIC(10,2) NOT NULL,
  amount_vnd INTEGER NOT NULL,
  currency VARCHAR(3) DEFAULT 'VND',
  payment_method VARCHAR(50),
  payment_provider VARCHAR(50),
  provider_transaction_id VARCHAR(255),
  status VARCHAR(20) DEFAULT 'pending' CHECK (
    status IN ('pending', 'processing', 'completed', 'failed', 'refunded', 'cancelled')
  ),
  tokens_purchased INTEGER,
  package_id INTEGER REFERENCES token_packages(id),
  invoice_number VARCHAR(100) UNIQUE,
  invoice_url TEXT,
  metadata JSONB DEFAULT '{}',
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_payment_transactions_user ON payment_transactions(user_id);
CREATE INDEX idx_payment_transactions_status ON payment_transactions(status);
CREATE INDEX idx_payment_transactions_type ON payment_transactions(transaction_type);
CREATE INDEX idx_payment_transactions_created ON payment_transactions(created_at DESC);

-- Table: subscription_history
CREATE TABLE IF NOT EXISTS subscription_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  subscription_type VARCHAR(20) NOT NULL,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  status VARCHAR(20) DEFAULT 'active' CHECK (
    status IN ('active', 'expired', 'cancelled', 'suspended')
  ),
  payment_transaction_id UUID REFERENCES payment_transactions(id),
  auto_renew BOOLEAN DEFAULT FALSE,
  cancelled_at TIMESTAMP WITH TIME ZONE,
  cancellation_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_subscription_history_user ON subscription_history(user_id);
CREATE INDEX idx_subscription_history_status ON subscription_history(status);
CREATE INDEX idx_subscription_history_dates ON subscription_history(start_date, end_date);

-- ============================================================================
-- PART 3: AI ASSISTANT & CHAT
-- ============================================================================

-- Table: ai_conversations
CREATE TABLE IF NOT EXISTS ai_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  analysis_project_id UUID REFERENCES analysis_projects(id) ON DELETE SET NULL,
  title VARCHAR(255),
  context_type VARCHAR(50) CHECK (
    context_type IN ('general', 'project', 'analysis', 'methodology', 'statistics')
  ),
  is_active BOOLEAN DEFAULT TRUE,
  message_count INTEGER DEFAULT 0,
  tokens_used INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_ai_conversations_user ON ai_conversations(user_id);
CREATE INDEX idx_ai_conversations_project ON ai_conversations(project_id);
CREATE INDEX idx_ai_conversations_analysis ON ai_conversations(analysis_project_id);
CREATE INDEX idx_ai_conversations_active ON ai_conversations(is_active);

-- Table: ai_messages
CREATE TABLE IF NOT EXISTS ai_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES ai_conversations(id) ON DELETE CASCADE NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  tokens_used INTEGER DEFAULT 0,
  model VARCHAR(50),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_ai_messages_conversation ON ai_messages(conversation_id);
CREATE INDEX idx_ai_messages_created ON ai_messages(created_at);

-- ============================================================================
-- PART 4: RESEARCH OUTLINE GENERATION
-- ============================================================================

-- Table: research_outlines
CREATE TABLE IF NOT EXISTS research_outlines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  business_domain_id INTEGER REFERENCES business_domains(id),
  selected_models INTEGER[] DEFAULT '{}',
  
  -- Outline content
  title VARCHAR(500),
  abstract TEXT,
  introduction TEXT,
  literature_review TEXT,
  methodology TEXT,
  expected_results TEXT,
  references TEXT,
  
  -- Structure
  outline_structure JSONB DEFAULT '{}',
  sections JSONB DEFAULT '[]',
  
  -- Generation metadata
  generation_method VARCHAR(50) DEFAULT 'ai' CHECK (
    generation_method IN ('ai', 'template', 'manual', 'hybrid')
  ),
  ai_model VARCHAR(50),
  tokens_used INTEGER DEFAULT 0,
  generation_time_ms INTEGER,
  
  -- Status
  status VARCHAR(20) DEFAULT 'draft' CHECK (
    status IN ('draft', 'generated', 'reviewed', 'approved', 'published')
  ),
  version INTEGER DEFAULT 1,
  
  -- Metrics
  word_count INTEGER DEFAULT 0,
  reference_count INTEGER DEFAULT 0,
  quality_score INTEGER CHECK (quality_score >= 0 AND quality_score <= 100),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_research_outlines_project ON research_outlines(project_id);
CREATE INDEX idx_research_outlines_user ON research_outlines(user_id);
CREATE INDEX idx_research_outlines_status ON research_outlines(status);
CREATE INDEX idx_research_outlines_domain ON research_outlines(business_domain_id);

-- Table: outline_versions
CREATE TABLE IF NOT EXISTS outline_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  outline_id UUID REFERENCES research_outlines(id) ON DELETE CASCADE NOT NULL,
  version_number INTEGER NOT NULL,
  content JSONB NOT NULL,
  changes_summary TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(outline_id, version_number)
);

CREATE INDEX idx_outline_versions_outline ON outline_versions(outline_id);
CREATE INDEX idx_outline_versions_number ON outline_versions(version_number);

-- ============================================================================
-- PART 5: LITERATURE & REFERENCES
-- ============================================================================

-- Table: literature_sources
CREATE TABLE IF NOT EXISTS literature_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(500) NOT NULL,
  authors TEXT[] DEFAULT '{}',
  year INTEGER,
  publication_type VARCHAR(50) CHECK (
    publication_type IN ('journal', 'conference', 'book', 'thesis', 'report', 'web')
  ),
  journal_name VARCHAR(255),
  volume VARCHAR(50),
  issue VARCHAR(50),
  pages VARCHAR(50),
  doi VARCHAR(255),
  url TEXT,
  abstract TEXT,
  keywords TEXT[] DEFAULT '{}',
  citation_count INTEGER DEFAULT 0,
  is_verified BOOLEAN DEFAULT FALSE,
  added_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_literature_sources_title ON literature_sources USING gin(to_tsvector('english', title));
CREATE INDEX idx_literature_sources_authors ON literature_sources USING gin(authors);
CREATE INDEX idx_literature_sources_year ON literature_sources(year);
CREATE INDEX idx_literature_sources_type ON literature_sources(publication_type);

-- Table: project_references
CREATE TABLE IF NOT EXISTS project_references (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  literature_source_id UUID REFERENCES literature_sources(id) ON DELETE CASCADE NOT NULL,
  citation_context TEXT,
  section VARCHAR(100),
  relevance_score INTEGER CHECK (relevance_score >= 1 AND relevance_score <= 5),
  notes TEXT,
  added_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(project_id, literature_source_id)
);

CREATE INDEX idx_project_references_project ON project_references(project_id);
CREATE INDEX idx_project_references_source ON project_references(literature_source_id);

-- ============================================================================
-- PART 6: COLLABORATION & COMMENTS
-- ============================================================================

-- Table: project_comments
CREATE TABLE IF NOT EXISTS project_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  parent_comment_id UUID REFERENCES project_comments(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  section VARCHAR(100),
  status VARCHAR(20) DEFAULT 'active' CHECK (
    status IN ('active', 'resolved', 'deleted')
  ),
  is_pinned BOOLEAN DEFAULT FALSE,
  resolved_by UUID REFERENCES auth.users(id),
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_project_comments_project ON project_comments(project_id);
CREATE INDEX idx_project_comments_user ON project_comments(user_id);
CREATE INDEX idx_project_comments_parent ON project_comments(parent_comment_id);
CREATE INDEX idx_project_comments_status ON project_comments(status);

-- Table: project_activity
CREATE TABLE IF NOT EXISTS project_activity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  activity_type VARCHAR(50) NOT NULL CHECK (
    activity_type IN (
      'created', 'updated', 'deleted', 'shared', 'commented',
      'outline_generated', 'analysis_added', 'reference_added',
      'status_changed', 'collaborator_added', 'exported'
    )
  ),
  description TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_project_activity_project ON project_activity(project_id);
CREATE INDEX idx_project_activity_user ON project_activity(user_id);
CREATE INDEX idx_project_activity_type ON project_activity(activity_type);
CREATE INDEX idx_project_activity_created ON project_activity(created_at DESC);

-- ============================================================================
-- PART 7: SYSTEM SETTINGS & CONFIGURATION
-- ============================================================================

-- Table: system_settings
CREATE TABLE IF NOT EXISTS system_settings (
  id SERIAL PRIMARY KEY,
  setting_key VARCHAR(100) NOT NULL UNIQUE,
  setting_value JSONB NOT NULL,
  setting_type VARCHAR(50) NOT NULL CHECK (
    setting_type IN ('string', 'number', 'boolean', 'json', 'array')
  ),
  category VARCHAR(50),
  description TEXT,
  is_public BOOLEAN DEFAULT FALSE,
  is_editable BOOLEAN DEFAULT TRUE,
  updated_by UUID REFERENCES auth.users(id),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_system_settings_key ON system_settings(setting_key);
CREATE INDEX idx_system_settings_category ON system_settings(category);

-- Table: feature_flags
CREATE TABLE IF NOT EXISTS feature_flags (
  id SERIAL PRIMARY KEY,
  flag_name VARCHAR(100) NOT NULL UNIQUE,
  is_enabled BOOLEAN DEFAULT FALSE,
  description TEXT,
  rollout_percentage INTEGER DEFAULT 0 CHECK (
    rollout_percentage >= 0 AND rollout_percentage <= 100
  ),
  target_users UUID[] DEFAULT '{}',
  target_roles VARCHAR[] DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_feature_flags_name ON feature_flags(flag_name);
CREATE INDEX idx_feature_flags_enabled ON feature_flags(is_enabled);

-- ============================================================================
-- PART 8: ANALYTICS & METRICS
-- ============================================================================

-- Table: user_analytics
CREATE TABLE IF NOT EXISTS user_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  event_type VARCHAR(100) NOT NULL,
  event_category VARCHAR(50),
  event_data JSONB DEFAULT '{}',
  session_id VARCHAR(255),
  page_url TEXT,
  referrer TEXT,
  user_agent TEXT,
  ip_address INET,
  country VARCHAR(2),
  city VARCHAR(100),
  device_type VARCHAR(50),
  browser VARCHAR(50),
  os VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_user_analytics_user ON user_analytics(user_id);
CREATE INDEX idx_user_analytics_event ON user_analytics(event_type);
CREATE INDEX idx_user_analytics_category ON user_analytics(event_category);
CREATE INDEX idx_user_analytics_created ON user_analytics(created_at DESC);
CREATE INDEX idx_user_analytics_session ON user_analytics(session_id);

-- Table: system_metrics
CREATE TABLE IF NOT EXISTS system_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_name VARCHAR(100) NOT NULL,
  metric_value NUMERIC NOT NULL,
  metric_unit VARCHAR(50),
  dimensions JSONB DEFAULT '{}',
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_system_metrics_name ON system_metrics(metric_name);
CREATE INDEX idx_system_metrics_recorded ON system_metrics(recorded_at DESC);

-- ============================================================================
-- PART 9: HELPER FUNCTIONS
-- ============================================================================

-- Function: Mark notification as read
CREATE OR REPLACE FUNCTION mark_notification_read(notification_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE notifications
  SET is_read = TRUE, read_at = NOW()
  WHERE id = notification_uuid AND user_id = auth.uid();
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Get unread notification count
CREATE OR REPLACE FUNCTION get_unread_notification_count(user_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
  count INTEGER;
BEGIN
  SELECT COUNT(*) INTO count
  FROM notifications
  WHERE user_id = user_uuid AND is_read = FALSE;
  
  RETURN count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Create notification
CREATE OR REPLACE FUNCTION create_notification(
  user_uuid UUID,
  notif_type VARCHAR,
  notif_title VARCHAR,
  notif_message TEXT,
  notif_action_url TEXT DEFAULT NULL,
  notif_priority VARCHAR DEFAULT 'normal'
)
RETURNS UUID AS $$
DECLARE
  new_id UUID;
BEGIN
  INSERT INTO notifications (
    user_id, type, title, message, action_url, priority
  ) VALUES (
    user_uuid, notif_type, notif_title, notif_message, notif_action_url, notif_priority
  ) RETURNING id INTO new_id;
  
  RETURN new_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Check feature flag
CREATE OR REPLACE FUNCTION is_feature_enabled(
  flag_name_param VARCHAR,
  user_uuid UUID DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  flag_record RECORD;
  user_role VARCHAR;
BEGIN
  SELECT * INTO flag_record FROM feature_flags WHERE flag_name = flag_name_param;
  
  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;
  
  IF NOT flag_record.is_enabled THEN
    RETURN FALSE;
  END IF;
  
  -- Check if user is in target users
  IF user_uuid IS NOT NULL AND user_uuid = ANY(flag_record.target_users) THEN
    RETURN TRUE;
  END IF;
  
  -- Check if user role is in target roles
  IF user_uuid IS NOT NULL THEN
    SELECT role INTO user_role FROM profiles WHERE id = user_uuid;
    IF user_role = ANY(flag_record.target_roles) THEN
      RETURN TRUE;
    END IF;
  END IF;
  
  -- Check rollout percentage
  IF flag_record.rollout_percentage = 100 THEN
    RETURN TRUE;
  ELSIF flag_record.rollout_percentage = 0 THEN
    RETURN FALSE;
  ELSE
    -- Simple hash-based rollout
    RETURN (hashtext(user_uuid::TEXT) % 100) < flag_record.rollout_percentage;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Log user event
CREATE OR REPLACE FUNCTION log_user_event(
  user_uuid UUID,
  event_type_param VARCHAR,
  event_data_param JSONB DEFAULT '{}'
)
RETURNS UUID AS $$
DECLARE
  new_id UUID;
BEGIN
  INSERT INTO user_analytics (user_id, event_type, event_data)
  VALUES (user_uuid, event_type_param, event_data_param)
  RETURNING id INTO new_id;
  
  RETURN new_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Get user subscription status
CREATE OR REPLACE FUNCTION get_user_subscription_status(user_uuid UUID)
RETURNS TABLE (
  is_subscribed BOOLEAN,
  subscription_type VARCHAR,
  expires_at TIMESTAMP WITH TIME ZONE,
  days_remaining INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    CASE WHEN p.subscription_expires_at > NOW() THEN TRUE ELSE FALSE END as is_subscribed,
    p.subscription_type,
    p.subscription_expires_at as expires_at,
    EXTRACT(DAY FROM (p.subscription_expires_at - NOW()))::INTEGER as days_remaining
  FROM profiles p
  WHERE p.id = user_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Update project activity
CREATE OR REPLACE FUNCTION log_project_activity()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO project_activity (project_id, user_id, activity_type, description)
    VALUES (NEW.id, NEW.user_id, 'created', 'Project created: ' || NEW.title);
  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.status != NEW.status THEN
      INSERT INTO project_activity (project_id, user_id, activity_type, description, metadata)
      VALUES (
        NEW.id, NEW.user_id, 'status_changed',
        'Status changed from ' || OLD.status || ' to ' || NEW.status,
        jsonb_build_object('old_status', OLD.status, 'new_status', NEW.status)
      );
    END IF;
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO project_activity (project_id, user_id, activity_type, description)
    VALUES (OLD.id, OLD.user_id, 'deleted', 'Project deleted: ' || OLD.title);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- PART 10: TRIGGERS
-- ============================================================================

-- Trigger: Log project activity
DROP TRIGGER IF EXISTS trigger_log_project_activity ON projects;
CREATE TRIGGER trigger_log_project_activity
AFTER INSERT OR UPDATE OR DELETE ON projects
FOR EACH ROW EXECUTE FUNCTION log_project_activity();

-- Trigger: Update timestamps
DROP TRIGGER IF EXISTS update_ai_conversations_updated_at ON ai_conversations;
CREATE TRIGGER update_ai_conversations_updated_at
BEFORE UPDATE ON ai_conversations
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_research_outlines_updated_at ON research_outlines;
CREATE TRIGGER update_research_outlines_updated_at
BEFORE UPDATE ON research_outlines
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_project_comments_updated_at ON project_comments;
CREATE TRIGGER update_project_comments_updated_at
BEFORE UPDATE ON project_comments
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_feature_flags_updated_at ON feature_flags;
CREATE TRIGGER update_feature_flags_updated_at
BEFORE UPDATE ON feature_flags
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- PART 11: ROW LEVEL SECURITY
-- ============================================================================

-- Enable RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE research_outlines ENABLE ROW LEVEL SECURITY;
ALTER TABLE outline_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE literature_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_references ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE feature_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_metrics ENABLE ROW LEVEL SECURITY;

-- RLS Policies: notifications
CREATE POLICY "Users can view their own notifications"
ON notifications FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
ON notifications FOR UPDATE
USING (auth.uid() = user_id);

-- RLS Policies: payment_transactions
CREATE POLICY "Users can view their own transactions"
ON payment_transactions FOR SELECT
USING (auth.uid() = user_id);

-- RLS Policies: subscription_history
CREATE POLICY "Users can view their own subscription history"
ON subscription_history FOR SELECT
USING (auth.uid() = user_id);

-- RLS Policies: ai_conversations
CREATE POLICY "Users can manage their own conversations"
ON ai_conversations FOR ALL
USING (auth.uid() = user_id);

-- RLS Policies: ai_messages
CREATE POLICY "Users can view messages in their conversations"
ON ai_messages FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM ai_conversations
    WHERE ai_conversations.id = ai_messages.conversation_id
    AND ai_conversations.user_id = auth.uid()
  )
);

CREATE POLICY "Users can create messages in their conversations"
ON ai_messages FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM ai_conversations
    WHERE ai_conversations.id = ai_messages.conversation_id
    AND ai_conversations.user_id = auth.uid()
  )
);

-- RLS Policies: research_outlines
CREATE POLICY "Users can view outlines of their projects"
ON research_outlines FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can manage outlines of their projects"
ON research_outlines FOR ALL
USING (auth.uid() = user_id);

-- RLS Policies: literature_sources
CREATE POLICY "Anyone can view verified literature sources"
ON literature_sources FOR SELECT
USING (is_verified = TRUE);

CREATE POLICY "Users can add literature sources"
ON literature_sources FOR INSERT
WITH CHECK (auth.uid() = added_by);

-- RLS Policies: project_references
CREATE POLICY "Users can view references of their projects"
ON project_references FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM projects
    WHERE projects.id = project_references.project_id
    AND projects.user_id = auth.uid()
  )
);

CREATE POLICY "Users can manage references of their projects"
ON project_references FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM projects
    WHERE projects.id = project_references.project_id
    AND projects.user_id = auth.uid()
  )
);

-- RLS Policies: project_comments
CREATE POLICY "Users can view comments on their projects"
ON project_comments FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM projects
    WHERE projects.id = project_comments.project_id
    AND projects.user_id = auth.uid()
  ) OR
  auth.uid() = user_id
);

CREATE POLICY "Users can create comments on accessible projects"
ON project_comments FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM projects
    WHERE projects.id = project_comments.project_id
    AND projects.user_id = auth.uid()
  ) OR
  EXISTS (
    SELECT 1 FROM project_collaborators
    WHERE project_collaborators.project_id = project_comments.project_id
    AND project_collaborators.user_id = auth.uid()
  )
);

-- RLS Policies: project_activity
CREATE POLICY "Users can view activity of their projects"
ON project_activity FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM projects
    WHERE projects.id = project_activity.project_id
    AND projects.user_id = auth.uid()
  )
);

-- RLS Policies: system_settings
CREATE POLICY "Anyone can view public settings"
ON system_settings FOR SELECT
USING (is_public = TRUE);

-- RLS Policies: feature_flags
CREATE POLICY "Anyone can view feature flags"
ON feature_flags FOR SELECT
USING (true);

-- RLS Policies: user_analytics
CREATE POLICY "Users can view their own analytics"
ON user_analytics FOR SELECT
USING (auth.uid() = user_id);

-- ============================================================================
-- PART 12: INITIAL DATA
-- ============================================================================

-- Insert default system settings
INSERT INTO system_settings (setting_key, setting_value, setting_type, category, description, is_public) VALUES
('max_file_size_mb', '50', 'number', 'upload', 'Maximum file upload size in MB', TRUE),
('max_projects_per_user', '100', 'number', 'limits', 'Maximum projects per user', TRUE),
('token_reward_referral', '50', 'number', 'tokens', 'Tokens rewarded for successful referral', TRUE),
('token_cost_ai_query', '5', 'number', 'tokens', 'Token cost per AI query', TRUE),
('token_cost_analysis', '10', 'number', 'tokens', 'Token cost per analysis execution', TRUE),
('maintenance_mode', 'false', 'boolean', 'system', 'System maintenance mode', TRUE),
('ai_model_default', '"gpt-4"', 'string', 'ai', 'Default AI model for queries', FALSE)
ON CONFLICT (setting_key) DO NOTHING;

-- Insert default feature flags
INSERT INTO feature_flags (flag_name, is_enabled, description, rollout_percentage) VALUES
('advanced_analytics', TRUE, 'Enable advanced statistical analyses', 100),
('ai_assistant', TRUE, 'Enable AI research assistant', 100),
('collaboration', TRUE, 'Enable project collaboration features', 100),
('export_pdf', TRUE, 'Enable PDF export functionality', 100),
('export_excel', TRUE, 'Enable Excel export functionality', 100),
('literature_search', FALSE, 'Enable integrated literature search', 0),
('auto_translation', FALSE, 'Enable automatic translation', 0)
ON CONFLICT (flag_name) DO NOTHING;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE notifications IS 'User notifications and alerts';
COMMENT ON TABLE payment_transactions IS 'Payment and purchase transactions';
COMMENT ON TABLE subscription_history IS 'User subscription history';
COMMENT ON TABLE ai_conversations IS 'AI assistant conversation threads';
COMMENT ON TABLE ai_messages IS 'Individual messages in AI conversations';
COMMENT ON TABLE research_outlines IS 'Generated research outlines';
COMMENT ON TABLE outline_versions IS 'Version history of research outlines';
COMMENT ON TABLE literature_sources IS 'Academic literature and references';
COMMENT ON TABLE project_references IS 'References linked to projects';
COMMENT ON TABLE project_comments IS 'Comments and discussions on projects';
COMMENT ON TABLE project_activity IS 'Activity log for projects';
COMMENT ON TABLE system_settings IS 'System-wide configuration settings';
COMMENT ON TABLE feature_flags IS 'Feature flags for gradual rollout';
COMMENT ON TABLE user_analytics IS 'User behavior and analytics events';
COMMENT ON TABLE system_metrics IS 'System performance metrics';

COMMENT ON FUNCTION mark_notification_read IS 'Mark a notification as read';
COMMENT ON FUNCTION get_unread_notification_count IS 'Get count of unread notifications';
COMMENT ON FUNCTION create_notification IS 'Create a new notification';
COMMENT ON FUNCTION is_feature_enabled IS 'Check if a feature flag is enabled for user';
COMMENT ON FUNCTION log_user_event IS 'Log a user analytics event';
COMMENT ON FUNCTION get_user_subscription_status IS 'Get user subscription status and expiry';
