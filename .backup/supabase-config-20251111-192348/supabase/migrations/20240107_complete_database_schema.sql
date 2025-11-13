-- ============================================================================
-- NCSKIT Complete Database Schema
-- Created: 2024-01-07
-- Description: Full database schema for NCSKIT research platform
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- PART 1: USER MANAGEMENT & AUTHENTICATION
-- ============================================================================

-- Table: profiles (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL UNIQUE,
  full_name VARCHAR(255),
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  avatar_url TEXT,
  institution VARCHAR(255),
  department VARCHAR(255),
  position VARCHAR(255),
  academic_title VARCHAR(100),
  bio TEXT,
  phone VARCHAR(20),
  date_of_birth DATE,
  gender VARCHAR(10),
  
  -- Research info
  research_domains TEXT[] DEFAULT '{}',
  orcid_id VARCHAR(50),
  website_url TEXT,
  linkedin_url TEXT,
  google_scholar_url TEXT,
  
  -- Account settings
  role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'admin', 'moderator')),
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended', 'banned')),
  subscription_type VARCHAR(20) DEFAULT 'free' CHECK (subscription_type IN ('free', 'premium', 'institutional')),
  subscription_expires_at TIMESTAMP WITH TIME ZONE,
  
  -- Token system
  token_balance INTEGER DEFAULT 100,
  total_tokens_earned INTEGER DEFAULT 100,
  total_tokens_spent INTEGER DEFAULT 0,
  token_tier VARCHAR(20) DEFAULT 'bronze' CHECK (token_tier IN ('bronze', 'silver', 'gold', 'platinum')),
  
  -- Referral system
  referral_code VARCHAR(20) UNIQUE,
  referred_by_code VARCHAR(20),
  referred_by_user_id UUID REFERENCES profiles(id),
  referral_count INTEGER DEFAULT 0,
  referral_tokens_earned INTEGER DEFAULT 0,
  
  -- Activity tracking
  projects_created INTEGER DEFAULT 0,
  outlines_generated INTEGER DEFAULT 0,
  ai_queries_made INTEGER DEFAULT 0,
  last_login_at TIMESTAMP WITH TIME ZONE,
  login_count INTEGER DEFAULT 0,
  last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Preferences
  preferred_language VARCHAR(10) DEFAULT 'vi',
  timezone VARCHAR(50) DEFAULT 'Asia/Ho_Chi_Minh',
  notification_preferences JSONB DEFAULT '{"push": false, "email": true, "marketing": true, "token_updates": true, "referral_updates": true, "research_updates": true}',
  privacy_settings JSONB DEFAULT '{"email_public": false, "profile_public": true, "show_institution": true, "show_research_interests": true}',
  ui_preferences JSONB DEFAULT '{"theme": "light", "dashboard_layout": "default", "sidebar_collapsed": false}',
  preferences JSONB DEFAULT '{}',
  
  -- Security
  email_verified BOOLEAN DEFAULT FALSE,
  email_verified_at TIMESTAMP WITH TIME ZONE,
  phone_verified BOOLEAN DEFAULT FALSE,
  two_factor_enabled BOOLEAN DEFAULT FALSE,
  password_reset_required BOOLEAN DEFAULT FALSE,
  password_reset_token VARCHAR(255),
  password_reset_expires_at TIMESTAMP WITH TIME ZONE,
  last_password_change TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_status ON profiles(status);
CREATE INDEX idx_profiles_referral_code ON profiles(referral_code);

-- ============================================================================
-- PART 2: ADMIN & PERMISSIONS
-- ============================================================================

-- Table: admin_roles
CREATE TABLE IF NOT EXISTS admin_roles (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE,
  description TEXT,
  permissions JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: admin_permissions
CREATE TABLE IF NOT EXISTS admin_permissions (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: admin_logs
CREATE TABLE IF NOT EXISTS admin_logs (
  id SERIAL PRIMARY KEY,
  admin_id UUID REFERENCES profiles(id),
  action VARCHAR(100) NOT NULL,
  target_type VARCHAR(50),
  target_id INTEGER,
  details JSONB,
  ip_address INET,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_admin_logs_admin ON admin_logs(admin_id);
CREATE INDEX idx_admin_logs_created ON admin_logs(created_at DESC);

-- Table: permissions
CREATE TABLE IF NOT EXISTS permissions (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  permission VARCHAR(100) NOT NULL,
  resource_type VARCHAR(50),
  granted_by UUID REFERENCES profiles(id),
  granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_permissions_user ON permissions(user_id);

-- ============================================================================
-- PART 3: BUSINESS DOMAINS & MARKETING MODELS
-- ============================================================================

-- Table: business_domains
CREATE TABLE IF NOT EXISTS business_domains (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  name_vi VARCHAR(100) NOT NULL,
  description TEXT,
  description_vi TEXT,
  icon VARCHAR(50),
  color VARCHAR(20),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: marketing_models
CREATE TABLE IF NOT EXISTS marketing_models (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  name_vi VARCHAR(100) NOT NULL,
  abbreviation VARCHAR(20),
  description TEXT,
  description_vi TEXT,
  category VARCHAR(50),
  complexity_level INTEGER,
  citation TEXT,
  year_developed INTEGER,
  key_authors TEXT[],
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- PART 4: PROJECTS & DATASETS
-- ============================================================================

-- Table: projects
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(200) NOT NULL,
  description TEXT,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  business_domain_id INTEGER REFERENCES business_domains(id),
  selected_models INTEGER[],
  research_outline JSONB,
  status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'completed', 'archived')),
  progress INTEGER DEFAULT 0,
  phase VARCHAR(50) DEFAULT 'planning',
  tags TEXT[],
  word_count INTEGER DEFAULT 0,
  reference_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_projects_user ON projects(user_id);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_created ON projects(created_at DESC);

-- Table: datasets
CREATE TABLE IF NOT EXISTS datasets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  file_path TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  file_type VARCHAR(50),
  row_count INTEGER,
  column_count INTEGER,
  status VARCHAR(50) DEFAULT 'uploaded',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_datasets_project ON datasets(project_id);

-- Table: project_collaborators
CREATE TABLE IF NOT EXISTS project_collaborators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  role VARCHAR(20) DEFAULT 'viewer' CHECK (role IN ('owner', 'editor', 'viewer')),
  permissions TEXT[] DEFAULT '{}',
  invited_by UUID REFERENCES profiles(id),
  invited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  joined_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(project_id, user_id)
);

CREATE INDEX idx_project_collaborators_project ON project_collaborators(project_id);
CREATE INDEX idx_project_collaborators_user ON project_collaborators(user_id);

-- ============================================================================
-- PART 5: TOKEN SYSTEM
-- ============================================================================

-- Table: token_packages
CREATE TABLE IF NOT EXISTS token_packages (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  name_vi VARCHAR(100) NOT NULL,
  description TEXT,
  description_vi TEXT,
  token_amount INTEGER NOT NULL,
  bonus_tokens INTEGER DEFAULT 0,
  price_usd NUMERIC NOT NULL,
  price_vnd INTEGER NOT NULL,
  package_type VARCHAR(20) DEFAULT 'standard',
  is_active BOOLEAN DEFAULT TRUE,
  is_featured BOOLEAN DEFAULT FALSE,
  max_purchases_per_user INTEGER,
  valid_from TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  valid_until TIMESTAMP WITH TIME ZONE,
  display_order INTEGER DEFAULT 0,
  badge_text VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: token_transactions
CREATE TABLE IF NOT EXISTS token_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  transaction_type VARCHAR(50) NOT NULL,
  amount INTEGER NOT NULL,
  balance_before INTEGER NOT NULL,
  balance_after INTEGER NOT NULL,
  description TEXT NOT NULL,
  reference_id UUID,
  reference_type VARCHAR(50),
  from_user_id UUID REFERENCES profiles(id),
  to_user_id UUID REFERENCES profiles(id),
  created_by_admin UUID REFERENCES profiles(id),
  admin_notes TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_token_transactions_user ON token_transactions(user_id);
CREATE INDEX idx_token_transactions_type ON token_transactions(transaction_type);
CREATE INDEX idx_token_transactions_created ON token_transactions(created_at DESC);

-- Table: token_pricing
CREATE TABLE IF NOT EXISTS token_pricing (
  id SERIAL PRIMARY KEY,
  feature_name VARCHAR(100) NOT NULL,
  feature_name_vi VARCHAR(100) NOT NULL,
  description TEXT,
  description_vi TEXT,
  token_cost INTEGER NOT NULL,
  category VARCHAR(50) NOT NULL,
  daily_limit INTEGER,
  subscription_discount NUMERIC DEFAULT 0.0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- PART 6: FEATURE PERMISSIONS & USAGE
-- ============================================================================

-- Table: feature_permissions
CREATE TABLE IF NOT EXISTS feature_permissions (
  id SERIAL PRIMARY KEY,
  feature_name VARCHAR(100) NOT NULL,
  feature_name_vi VARCHAR(100) NOT NULL,
  description TEXT,
  description_vi TEXT,
  category VARCHAR(50) NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: user_role_permissions
CREATE TABLE IF NOT EXISTS user_role_permissions (
  id SERIAL PRIMARY KEY,
  role VARCHAR(50) NOT NULL,
  feature_id INTEGER REFERENCES feature_permissions(id),
  is_allowed BOOLEAN DEFAULT FALSE,
  token_cost INTEGER DEFAULT 0,
  daily_limit INTEGER,
  monthly_limit INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: user_feature_usage
CREATE TABLE IF NOT EXISTS user_feature_usage (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  feature_id INTEGER REFERENCES feature_permissions(id),
  usage_date DATE DEFAULT CURRENT_DATE,
  usage_count INTEGER DEFAULT 1,
  tokens_spent INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_user_feature_usage_user ON user_feature_usage(user_id);
CREATE INDEX idx_user_feature_usage_date ON user_feature_usage(usage_date DESC);

-- ============================================================================
-- PART 7: REFERRAL SYSTEM
-- ============================================================================

-- Table: referrals
CREATE TABLE IF NOT EXISTS referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  referrer_code VARCHAR(20) NOT NULL,
  referred_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  referred_email VARCHAR(255) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'expired', 'cancelled')),
  completed_at TIMESTAMP WITH TIME ZONE,
  referrer_reward_tokens INTEGER DEFAULT 0,
  referred_reward_tokens INTEGER DEFAULT 0,
  reward_given BOOLEAN DEFAULT FALSE,
  reward_given_at TIMESTAMP WITH TIME ZONE,
  referral_source VARCHAR(100),
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_referrals_referrer ON referrals(referrer_id);
CREATE INDEX idx_referrals_referred ON referrals(referred_id);
CREATE INDEX idx_referrals_code ON referrals(referrer_code);

-- Table: referral_rewards
CREATE TABLE IF NOT EXISTS referral_rewards (
  id SERIAL PRIMARY KEY,
  reward_type VARCHAR(50) NOT NULL,
  reward_name VARCHAR(100) NOT NULL,
  reward_name_vi VARCHAR(100) NOT NULL,
  token_amount INTEGER NOT NULL,
  conditions JSONB,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- PART 8: BLOG & CONTENT
-- ============================================================================

-- Table: posts
CREATE TABLE IF NOT EXISTS posts (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE,
  excerpt TEXT,
  content TEXT,
  author_id UUID REFERENCES profiles(id),
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'scheduled', 'archived')),
  category VARCHAR(100),
  tags JSONB DEFAULT '[]',
  featured_image VARCHAR(255),
  meta_description TEXT,
  view_count INTEGER DEFAULT 0,
  like_count INTEGER DEFAULT 0,
  published_at TIMESTAMP WITH TIME ZONE,
  scheduled_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_posts_author ON posts(author_id);
CREATE INDEX idx_posts_status ON posts(status);
CREATE INDEX idx_posts_slug ON posts(slug);
CREATE INDEX idx_posts_published ON posts(published_at DESC);

-- ============================================================================
-- PART 9: CSV ANALYSIS WORKFLOW
-- ============================================================================

-- Table: analysis_projects
CREATE TABLE IF NOT EXISTS analysis_projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  csv_file_path TEXT NOT NULL,
  csv_file_size INTEGER NOT NULL,
  row_count INTEGER NOT NULL,
  column_count INTEGER NOT NULL,
  status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'configured', 'analyzing', 'completed', 'error')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_analysis_projects_user ON analysis_projects(user_id);
CREATE INDEX idx_analysis_projects_project ON analysis_projects(project_id);
CREATE INDEX idx_analysis_projects_status ON analysis_projects(status);

-- Table: variable_groups
CREATE TABLE IF NOT EXISTS variable_groups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  analysis_project_id UUID REFERENCES analysis_projects(id) ON DELETE CASCADE NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  group_type VARCHAR(50) DEFAULT 'construct' CHECK (group_type IN ('construct', 'demographic', 'control')),
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_variable_groups_analysis_project ON variable_groups(analysis_project_id);

-- Table: analysis_variables
CREATE TABLE IF NOT EXISTS analysis_variables (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  analysis_project_id UUID REFERENCES analysis_projects(id) ON DELETE CASCADE NOT NULL,
  column_name VARCHAR(255) NOT NULL,
  display_name VARCHAR(255),
  data_type VARCHAR(50) CHECK (data_type IN ('numeric', 'categorical', 'text', 'date')),
  is_demographic BOOLEAN DEFAULT FALSE,
  demographic_type VARCHAR(50) CHECK (demographic_type IN ('categorical', 'ordinal', 'continuous')),
  semantic_name VARCHAR(100),
  variable_group_id UUID REFERENCES variable_groups(id) ON DELETE SET NULL,
  missing_count INTEGER DEFAULT 0,
  unique_count INTEGER DEFAULT 0,
  min_value NUMERIC,
  max_value NUMERIC,
  mean_value NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(analysis_project_id, column_name)
);

CREATE INDEX idx_analysis_variables_project ON analysis_variables(analysis_project_id);
CREATE INDEX idx_analysis_variables_demographic ON analysis_variables(is_demographic);

-- Table: demographic_ranks
CREATE TABLE IF NOT EXISTS demographic_ranks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  variable_id UUID REFERENCES analysis_variables(id) ON DELETE CASCADE NOT NULL,
  rank_order INTEGER NOT NULL,
  label VARCHAR(255) NOT NULL,
  min_value NUMERIC,
  max_value NUMERIC,
  is_open_ended_min BOOLEAN DEFAULT FALSE,
  is_open_ended_max BOOLEAN DEFAULT FALSE,
  count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(variable_id, rank_order)
);

CREATE INDEX idx_demographic_ranks_variable ON demographic_ranks(variable_id);

-- Table: ordinal_categories
CREATE TABLE IF NOT EXISTS ordinal_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  variable_id UUID REFERENCES analysis_variables(id) ON DELETE CASCADE NOT NULL,
  category_order INTEGER NOT NULL,
  category_value VARCHAR(255) NOT NULL,
  category_label VARCHAR(255),
  count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(variable_id, category_order)
);

CREATE INDEX idx_ordinal_categories_variable ON ordinal_categories(variable_id);

-- Table: analysis_configurations
CREATE TABLE IF NOT EXISTS analysis_configurations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  analysis_project_id UUID REFERENCES analysis_projects(id) ON DELETE CASCADE NOT NULL,
  analysis_type VARCHAR(100) NOT NULL CHECK (
    analysis_type IN (
      'descriptive', 'reliability', 'efa', 'cfa', 
      'correlation', 'ttest', 'anova', 'regression', 'sem',
      'moderation', 'mediation', 'moderated_mediation',
      'multigroup', 'discriminant_validity', 'cmb',
      'normality', 'heteroscedasticity', 'multicollinearity'
    )
  ),
  configuration JSONB NOT NULL DEFAULT '{}',
  is_enabled BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(analysis_project_id, analysis_type)
);

CREATE INDEX idx_analysis_configurations_project ON analysis_configurations(analysis_project_id);

-- Table: analysis_results
CREATE TABLE IF NOT EXISTS analysis_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  analysis_project_id UUID REFERENCES analysis_projects(id) ON DELETE CASCADE NOT NULL,
  analysis_type VARCHAR(100) NOT NULL,
  results JSONB NOT NULL,
  execution_time_ms INTEGER,
  executed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_analysis_results_project ON analysis_results(analysis_project_id);
CREATE INDEX idx_analysis_results_type ON analysis_results(analysis_type);

-- ============================================================================
-- PART 10: CACHE & PERFORMANCE
-- ============================================================================

-- Table: analytics_cache
CREATE TABLE IF NOT EXISTS analytics_cache (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key VARCHAR(255) NOT NULL UNIQUE,
  endpoint VARCHAR(255) NOT NULL,
  params JSONB,
  data JSONB NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_analytics_cache_key ON analytics_cache(key);
CREATE INDEX idx_analytics_cache_expires ON analytics_cache(expires_at);

-- ============================================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================================

-- Function: Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_datasets_updated_at BEFORE UPDATE ON datasets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_analysis_projects_updated_at BEFORE UPDATE ON analysis_projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_referrals_updated_at BEFORE UPDATE ON referrals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_posts_updated_at BEFORE UPDATE ON posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE datasets ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_collaborators ENABLE ROW LEVEL SECURITY;
ALTER TABLE analysis_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE variable_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE analysis_variables ENABLE ROW LEVEL SECURITY;
ALTER TABLE demographic_ranks ENABLE ROW LEVEL SECURITY;
ALTER TABLE ordinal_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE analysis_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE analysis_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE token_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- RLS Policies for projects
CREATE POLICY "Users can view their own projects" ON projects FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create projects" ON projects FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own projects" ON projects FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own projects" ON projects FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for analysis_projects
CREATE POLICY "Users can view their own analysis projects" ON analysis_projects FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create analysis projects" ON analysis_projects FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own analysis projects" ON analysis_projects FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own analysis projects" ON analysis_projects FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for posts
CREATE POLICY "Anyone can view published posts" ON posts FOR SELECT USING (status = 'published');
CREATE POLICY "Authors can view their own posts" ON posts FOR SELECT USING (auth.uid() = author_id);
CREATE POLICY "Authors can create posts" ON posts FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY "Authors can update their own posts" ON posts FOR UPDATE USING (auth.uid() = author_id);
CREATE POLICY "Authors can delete their own posts" ON posts FOR DELETE USING (auth.uid() = author_id);

-- ============================================================================
-- INITIAL DATA
-- ============================================================================

-- Insert default admin role
INSERT INTO admin_roles (name, description, permissions) VALUES
('super_admin', 'Full system access', '{"all": true}'),
('admin', 'Standard admin access', '{"users": true, "projects": true, "content": true}'),
('moderator', 'Content moderation', '{"content": true, "posts": true}')
ON CONFLICT (name) DO NOTHING;

-- Insert default feature permissions
INSERT INTO feature_permissions (feature_name, feature_name_vi, category, description) VALUES
('csv_analysis', 'Phân tích CSV', 'analysis', 'Upload and analyze CSV survey data'),
('project_creation', 'Tạo dự án', 'projects', 'Create research projects'),
('ai_assistant', 'Trợ lý AI', 'ai', 'AI-powered research assistance'),
('data_export', 'Xuất dữ liệu', 'export', 'Export analysis results')
ON CONFLICT DO NOTHING;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE profiles IS 'User profiles extending Supabase auth';
COMMENT ON TABLE projects IS 'Research projects';
COMMENT ON TABLE analysis_projects IS 'CSV analysis projects';
COMMENT ON TABLE posts IS 'Blog posts and articles';
COMMENT ON TABLE token_transactions IS 'Token transaction history';
COMMENT ON TABLE referrals IS 'User referral system';
