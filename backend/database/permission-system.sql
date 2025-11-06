-- =====================================================
-- PERMISSION & COST MANAGEMENT SYSTEM
-- =====================================================

-- Create feature_permissions table
CREATE TABLE IF NOT EXISTS public.feature_permissions (
    id SERIAL PRIMARY KEY,
    feature_name VARCHAR(100) NOT NULL UNIQUE,
    feature_name_vi VARCHAR(100) NOT NULL,
    description TEXT,
    description_vi TEXT,
    category VARCHAR(50) NOT NULL, -- 'ai', 'project', 'collaboration', 'export', 'analysis'
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_role_permissions table
CREATE TABLE IF NOT EXISTS public.user_role_permissions (
    id SERIAL PRIMARY KEY,
    role VARCHAR(50) NOT NULL, -- 'free', 'premium', 'institutional', 'admin'
    feature_id INTEGER REFERENCES public.feature_permissions(id),
    is_allowed BOOLEAN DEFAULT FALSE,
    token_cost INTEGER DEFAULT 0, -- cost per use
    daily_limit INTEGER, -- daily usage limit
    monthly_limit INTEGER, -- monthly usage limit
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(role, feature_id)
);

-- Create feature_usage_costs table
CREATE TABLE IF NOT EXISTS public.feature_usage_costs (
    id SERIAL PRIMARY KEY,
    feature_id INTEGER REFERENCES public.feature_permissions(id),
    user_role VARCHAR(50) NOT NULL,
    base_cost INTEGER NOT NULL,
    premium_cost INTEGER DEFAULT 0,
    bulk_discount_threshold INTEGER DEFAULT 0, -- usage count for discount
    bulk_discount_rate DECIMAL(3,2) DEFAULT 0, -- discount percentage
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_feature_usage table
CREATE TABLE IF NOT EXISTS public.user_feature_usage (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    feature_id INTEGER REFERENCES public.feature_permissions(id),
    usage_date DATE DEFAULT CURRENT_DATE,
    usage_count INTEGER DEFAULT 1,
    tokens_spent INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, feature_id, usage_date)
);

-- Create referral_rewards table
CREATE TABLE IF NOT EXISTS public.referral_rewards (
    id SERIAL PRIMARY KEY,
    reward_type VARCHAR(50) NOT NULL, -- 'signup', 'first_purchase', 'monthly_active'
    reward_name VARCHAR(100) NOT NULL,
    reward_name_vi VARCHAR(100) NOT NULL,
    token_amount INTEGER NOT NULL,
    conditions JSONB, -- conditions for earning reward
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create task_rewards table  
CREATE TABLE IF NOT EXISTS public.task_rewards (
    id SERIAL PRIMARY KEY,
    task_name VARCHAR(100) NOT NULL,
    task_name_vi VARCHAR(100) NOT NULL,
    description TEXT,
    description_vi TEXT,
    task_type VARCHAR(50) NOT NULL, -- 'daily', 'weekly', 'monthly', 'achievement'
    token_reward INTEGER NOT NULL,
    requirements JSONB, -- task requirements
    max_completions INTEGER DEFAULT 1, -- how many times can be completed
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert feature permissions
INSERT INTO public.feature_permissions (feature_name, feature_name_vi, description, description_vi, category) VALUES
('ai_outline_generation', 'Tạo đề cương AI', 'Generate research outline using AI', 'Tạo đề cương nghiên cứu bằng AI', 'ai'),
('ai_content_suggestions', 'Gợi ý nội dung AI', 'Get AI-powered content suggestions', 'Nhận gợi ý nội dung từ AI', 'ai'),
('advanced_project_templates', 'Template dự án nâng cao', 'Access to premium project templates', 'Truy cập template dự án cao cấp', 'project'),
('collaboration_features', 'Tính năng cộng tác', 'Real-time collaboration with team members', 'Cộng tác thời gian thực với nhóm', 'collaboration'),
('export_pdf_word', 'Xuất PDF/Word', 'Export projects to PDF and Word formats', 'Xuất dự án ra định dạng PDF và Word', 'export'),
('advanced_analytics', 'Phân tích nâng cao', 'Advanced project analytics and insights', 'Phân tích và thống kê dự án nâng cao', 'analysis'),
('unlimited_projects', 'Dự án không giới hạn', 'Create unlimited number of projects', 'Tạo số lượng dự án không giới hạn', 'project'),
('priority_support', 'Hỗ trợ ưu tiên', 'Priority customer support', 'Hỗ trợ khách hàng ưu tiên', 'support'),
('api_access', 'Truy cập API', 'Access to platform APIs', 'Truy cập các API của nền tảng', 'integration'),
('custom_branding', 'Thương hiệu tùy chỉnh', 'Custom branding for institutional users', 'Thương hiệu tùy chỉnh cho tổ chức', 'customization');

-- Insert role permissions
INSERT INTO public.user_role_permissions (role, feature_id, is_allowed, token_cost, daily_limit, monthly_limit) VALUES
-- Free user permissions
('free', 1, true, 50, 3, 10), -- AI outline generation
('free', 2, true, 20, 10, 50), -- AI content suggestions  
('free', 3, false, 0, 0, 0), -- Advanced templates
('free', 4, false, 0, 0, 0), -- Collaboration
('free', 5, true, 30, 2, 5), -- Export PDF/Word
('free', 6, false, 0, 0, 0), -- Advanced analytics
('free', 7, false, 0, 0, 0), -- Unlimited projects (limited to 3)
('free', 8, false, 0, 0, 0), -- Priority support
('free', 9, false, 0, 0, 0), -- API access
('free', 10, false, 0, 0, 0), -- Custom branding

-- Premium user permissions
('premium', 1, true, 25, 10, 50), -- AI outline generation (reduced cost)
('premium', 2, true, 10, 50, 200), -- AI content suggestions (reduced cost)
('premium', 3, true, 0, 0, 0), -- Advanced templates (free)
('premium', 4, true, 0, 0, 0), -- Collaboration (free)
('premium', 5, true, 0, 0, 0), -- Export PDF/Word (free)
('premium', 6, true, 0, 0, 0), -- Advanced analytics (free)
('premium', 7, true, 0, 0, 0), -- Unlimited projects (free)
('premium', 8, true, 0, 0, 0), -- Priority support (free)
('premium', 9, true, 100, 100, 1000), -- API access
('premium', 10, false, 0, 0, 0), -- Custom branding

-- Institutional user permissions
('institutional', 1, true, 10, 0, 0), -- AI outline generation (lowest cost, unlimited)
('institutional', 2, true, 5, 0, 0), -- AI content suggestions (lowest cost, unlimited)
('institutional', 3, true, 0, 0, 0), -- Advanced templates (free)
('institutional', 4, true, 0, 0, 0), -- Collaboration (free)
('institutional', 5, true, 0, 0, 0), -- Export PDF/Word (free)
('institutional', 6, true, 0, 0, 0), -- Advanced analytics (free)
('institutional', 7, true, 0, 0, 0), -- Unlimited projects (free)
('institutional', 8, true, 0, 0, 0), -- Priority support (free)
('institutional', 9, true, 0, 0, 0), -- API access (free)
('institutional', 10, true, 0, 0, 0); -- Custom branding (free)

-- Insert referral rewards
INSERT INTO public.referral_rewards (reward_type, reward_name, reward_name_vi, token_amount, conditions) VALUES
('signup', 'New User Signup', 'Đăng ký người dùng mới', 100, '{"action": "user_signup", "verified": true}'),
('first_purchase', 'First Token Purchase', 'Mua token lần đầu', 200, '{"action": "token_purchase", "min_amount": 1000}'),
('monthly_active', 'Monthly Active Referral', 'Giới thiệu hoạt động hàng tháng', 50, '{"action": "monthly_login", "min_days": 15}'),
('premium_upgrade', 'Premium Upgrade', 'Nâng cấp Premium', 500, '{"action": "subscription_upgrade", "plan": "premium"}');

-- Insert task rewards
INSERT INTO public.task_rewards (task_name, task_name_vi, description, description_vi, task_type, token_reward, requirements, max_completions) VALUES
('daily_login', 'Đăng nhập hàng ngày', 'Login to the platform daily', 'Đăng nhập vào nền tảng hàng ngày', 'daily', 10, '{"action": "login"}', 1),
('weekly_project_creation', 'Tạo dự án hàng tuần', 'Create at least one project per week', 'Tạo ít nhất một dự án mỗi tuần', 'weekly', 50, '{"action": "create_project", "count": 1}', 1),
('complete_profile', 'Hoàn thành hồ sơ', 'Complete your user profile 100%', 'Hoàn thành hồ sơ người dùng 100%', 'achievement', 100, '{"action": "profile_completion", "percentage": 100}', 1),
('first_ai_generation', 'Tạo AI lần đầu', 'Use AI outline generation for the first time', 'Sử dụng tạo đề cương AI lần đầu tiên', 'achievement', 75, '{"action": "ai_usage", "feature": "outline_generation"}', 1),
('social_share', 'Chia sẻ mạng xã hội', 'Share your project on social media', 'Chia sẻ dự án trên mạng xã hội', 'achievement', 25, '{"action": "social_share"}', 5);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_user_role_permissions_role ON public.user_role_permissions(role);
CREATE INDEX IF NOT EXISTS idx_user_feature_usage_user_date ON public.user_feature_usage(user_id, usage_date);
CREATE INDEX IF NOT EXISTS idx_feature_permissions_category ON public.feature_permissions(category);

-- Success message
SELECT 'PERMISSION & COST MANAGEMENT SYSTEM CREATED' as status;