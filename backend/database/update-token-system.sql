-- Update token system to currency system
-- Add password management fields

-- Add password management fields to users table
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS password_reset_required BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS password_reset_token VARCHAR(255),
ADD COLUMN IF NOT EXISTS password_reset_expires_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS last_password_change TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Rename api_tokens to user_tokens (currency system)
DROP TABLE IF EXISTS public.user_tokens;
CREATE TABLE public.user_tokens (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    transaction_type VARCHAR(50) NOT NULL, -- 'earn', 'spend', 'purchase', 'referral', 'task_reward'
    amount INTEGER NOT NULL, -- positive for earn, negative for spend
    balance_after INTEGER NOT NULL,
    description TEXT,
    reference_type VARCHAR(50), -- 'referral', 'task', 'purchase', 'ai_usage', 'project_creation'
    reference_id VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id)
);

-- Create token_packages table for purchasing tokens
CREATE TABLE IF NOT EXISTS public.token_packages (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    name_vi VARCHAR(100) NOT NULL,
    token_amount INTEGER NOT NULL,
    price_vnd INTEGER NOT NULL,
    price_usd DECIMAL(10,2),
    bonus_tokens INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create referral_system table
CREATE TABLE IF NOT EXISTS public.referral_system (
    id SERIAL PRIMARY KEY,
    referrer_id UUID REFERENCES auth.users(id),
    referred_id UUID REFERENCES auth.users(id),
    referral_code VARCHAR(20) UNIQUE,
    tokens_earned INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'pending', -- pending, completed, cancelled
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE
);

-- Create system_tasks table
CREATE TABLE IF NOT EXISTS public.system_tasks (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    name_vi VARCHAR(100) NOT NULL,
    description TEXT,
    description_vi TEXT,
    token_reward INTEGER NOT NULL,
    task_type VARCHAR(50) NOT NULL, -- 'daily', 'weekly', 'one_time', 'achievement'
    requirements JSONB, -- task requirements
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_task_completions table
CREATE TABLE IF NOT EXISTS public.user_task_completions (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    task_id INTEGER REFERENCES public.system_tasks(id),
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    tokens_earned INTEGER NOT NULL,
    UNIQUE(user_id, task_id)
);

-- Insert sample token packages
INSERT INTO public.token_packages (name, name_vi, token_amount, price_vnd, price_usd, bonus_tokens) VALUES
('Gói Cơ Bản', 'Basic Package', 1000, 50000, 2.50, 0),
('Gói Tiêu Chuẩn', 'Standard Package', 2500, 100000, 5.00, 250),
('Gói Cao Cấp', 'Premium Package', 5000, 200000, 10.00, 750),
('Gói Doanh Nghiệp', 'Enterprise Package', 10000, 350000, 17.50, 2000);

-- Insert sample system tasks
INSERT INTO public.system_tasks (name, name_vi, description, description_vi, token_reward, task_type, requirements) VALUES
('Đăng nhập hàng ngày', 'Daily Login', 'Login to the system daily', 'Đăng nhập vào hệ thống hàng ngày', 10, 'daily', '{"action": "login"}'),
('Tạo dự án đầu tiên', 'Create First Project', 'Create your first research project', 'Tạo dự án nghiên cứu đầu tiên', 100, 'one_time', '{"action": "create_project", "count": 1}'),
('Hoàn thành hồ sơ', 'Complete Profile', 'Fill out your complete profile', 'Hoàn thiện thông tin hồ sơ cá nhân', 50, 'one_time', '{"action": "complete_profile"}'),
('Giới thiệu bạn bè', 'Refer Friends', 'Successfully refer a new user', 'Giới thiệu thành công người dùng mới', 200, 'achievement', '{"action": "referral", "count": 1}');

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_user_tokens_user_id ON public.user_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_user_tokens_created_at ON public.user_tokens(created_at);
CREATE INDEX IF NOT EXISTS idx_referral_system_referrer ON public.referral_system(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referral_system_referred ON public.referral_system(referred_id);
CREATE INDEX IF NOT EXISTS idx_user_task_completions_user ON public.user_task_completions(user_id);

-- Update existing users with initial token balance
UPDATE public.users 
SET token_balance = COALESCE(token_balance, 100)
WHERE token_balance IS NULL OR token_balance = 0;

-- Success message
SELECT 'TOKEN SYSTEM UPDATED TO CURRENCY SYSTEM' as status;