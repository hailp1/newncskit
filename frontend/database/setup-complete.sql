-- =====================================================
-- NCSKIT COMPLETE DATABASE SETUP
-- =====================================================
-- Run this script in Supabase SQL Editor to setup the complete system

-- =====================================================
-- 1. BUSINESS DOMAINS
-- =====================================================
CREATE TABLE IF NOT EXISTS public.business_domains (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    name_vi VARCHAR(100) NOT NULL,
    description TEXT,
    description_vi TEXT,
    icon VARCHAR(50),
    color VARCHAR(20),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

INSERT INTO public.business_domains (name, name_vi, description, description_vi, icon, color) VALUES
('Marketing', 'Marketing', 'Consumer behavior, brand management, digital marketing', 'Hành vi người tiêu dùng, quản lý thương hiệu, marketing số', 'chart-bar', '#3B82F6'),
('Tourism & Hospitality', 'Du lịch & Khách sạn', 'Tourism management, hospitality services', 'Quản lý du lịch, dịch vụ khách sạn', 'globe-alt', '#10B981'),
('Human Resource Management', 'Quản lý Nhân sự', 'Employee engagement, organizational behavior', 'Sự gắn kết nhân viên, hành vi tổ chức', 'users', '#8B5CF6'),
('Information Systems', 'Hệ thống Thông tin', 'Technology adoption, digital transformation', 'Chấp nhận công nghệ, chuyển đổi số', 'computer-desktop', '#F59E0B'),
('Finance & Banking', 'Tài chính & Ngân hàng', 'Financial services, investment behavior', 'Dịch vụ tài chính, hành vi đầu tư', 'currency-dollar', '#EF4444'),
('Retail & E-commerce', 'Bán lẻ & Thương mại điện tử', 'Consumer shopping behavior, online purchasing', 'Hành vi mua sắm, mua hàng trực tuyến', 'shopping-bag', '#EC4899')
ON CONFLICT (name) DO NOTHING;

-- =====================================================
-- 2. MARKETING MODELS
-- =====================================================
CREATE TABLE IF NOT EXISTS public.marketing_models (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    name_vi VARCHAR(100) NOT NULL,
    abbreviation VARCHAR(20),
    description TEXT,
    description_vi TEXT,
    category VARCHAR(50),
    complexity_level INTEGER CHECK (complexity_level BETWEEN 1 AND 5),
    citation TEXT,
    year_developed INTEGER,
    key_authors TEXT[],
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert marketing models (keeping essential ones)
INSERT INTO public.marketing_models (name, name_vi, abbreviation, description, description_vi, category, year_developed, key_authors, complexity_level, citation, is_active) VALUES
('Theory of Planned Behavior', 'Lý thuyết Hành vi Có Kế hoạch', 'TPB', 'Predicts behavior based on attitudes, subjective norms, and perceived behavioral control', 'Dự đoán hành vi dựa trên thái độ, chuẩn mực chủ quan và nhận thức kiểm soát hành vi', 'Social Psychology', 1991, ARRAY['Icek Ajzen'], 3, 'Ajzen, I. (1991). The theory of planned behavior. Organizational Behavior and Human Decision Processes, 50(2), 179-211.', true),
('Technology Acceptance Model', 'Mô hình Chấp nhận Công nghệ', 'TAM', 'Explains user acceptance of technology based on perceived usefulness and ease of use', 'Giải thích sự chấp nhận công nghệ của người dùng dựa trên tính hữu ích và dễ sử dụng nhận thức', 'Technology Adoption', 1989, ARRAY['Fred Davis'], 3, 'Davis, F. D. (1989). Perceived usefulness, perceived ease of use, and user acceptance of information technology. MIS Quarterly, 13(3), 319-340.', true),
('SERVQUAL Model', 'Mô hình SERVQUAL', 'SERVQUAL', 'Measures service quality through five dimensions: reliability, assurance, tangibles, empathy, responsiveness', 'Đo lường chất lượng dịch vụ qua năm thành phần: độ tin cậy, đảm bảo, hữu hình, đồng cảm, phản hồi', 'Service Quality', 1988, ARRAY['Parasuraman', 'Zeithaml', 'Berry'], 4, 'Parasuraman, A., Zeithaml, V. A., & Berry, L. L. (1988). SERVQUAL: A multiple-item scale for measuring consumer perceptions of service quality. Journal of Retailing, 64(1), 12-40.', true),
('Signaling Theory', 'Lý thuyết Tín hiệu', 'ST', 'Explains how parties credibly convey information to resolve information asymmetry', 'Giải thích cách các bên truyền tải thông tin đáng tin cậy để giải quyết bất cân xứng thông tin', 'Economic Theory', 1973, ARRAY['Michael Spence'], 4, 'Spence, M. (1973). Job market signaling. The Quarterly Journal of Economics, 87(3), 355-374.', true)
ON CONFLICT (name) DO NOTHING;

-- =====================================================
-- 3. USER SYSTEM WITH ADMIN SUPPORT
-- =====================================================
-- Add admin columns to users table
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'user',
ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active',
ADD COLUMN IF NOT EXISTS password_reset_required BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS token_balance INTEGER DEFAULT 100;

-- Make name columns nullable
DO $$
BEGIN
    BEGIN
        ALTER TABLE public.users ALTER COLUMN first_name DROP NOT NULL;
    EXCEPTION WHEN OTHERS THEN NULL;
    END;
    BEGIN
        ALTER TABLE public.users ALTER COLUMN last_name DROP NOT NULL;
    EXCEPTION WHEN OTHERS THEN NULL;
    END;
END $$;

-- =====================================================
-- 4. ADMIN SYSTEM
-- =====================================================
CREATE TABLE IF NOT EXISTS public.admin_permissions (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.admin_roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    permissions JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.admin_logs (
    id SERIAL PRIMARY KEY,
    admin_id UUID,
    action VARCHAR(100) NOT NULL,
    target_type VARCHAR(50),
    target_id INTEGER,
    details JSONB,
    ip_address INET,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 5. TOKEN SYSTEM
-- =====================================================
CREATE TABLE IF NOT EXISTS public.user_tokens (
    id SERIAL PRIMARY KEY,
    user_id UUID,
    transaction_type VARCHAR(50) NOT NULL,
    amount INTEGER NOT NULL,
    balance_after INTEGER NOT NULL,
    description TEXT,
    reference_type VARCHAR(50),
    reference_id VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

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

-- =====================================================
-- 6. PERMISSION SYSTEM
-- =====================================================
CREATE TABLE IF NOT EXISTS public.feature_permissions (
    id SERIAL PRIMARY KEY,
    feature_name VARCHAR(100) NOT NULL UNIQUE,
    feature_name_vi VARCHAR(100) NOT NULL,
    description TEXT,
    description_vi TEXT,
    category VARCHAR(50) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.user_role_permissions (
    id SERIAL PRIMARY KEY,
    role VARCHAR(50) NOT NULL,
    feature_id INTEGER REFERENCES public.feature_permissions(id),
    is_allowed BOOLEAN DEFAULT FALSE,
    token_cost INTEGER DEFAULT 0,
    daily_limit INTEGER,
    monthly_limit INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(role, feature_id)
);

-- =====================================================
-- 7. INDEXES
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);
CREATE INDEX IF NOT EXISTS idx_users_status ON public.users(status);
CREATE INDEX IF NOT EXISTS idx_user_tokens_user_id ON public.user_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_admin_logs_admin_id ON public.admin_logs(admin_id);

-- =====================================================
-- 8. SAMPLE DATA
-- =====================================================
-- Insert admin permissions
INSERT INTO public.admin_permissions (name, description) VALUES
('user_management', 'Manage users - create, edit, delete, view'),
('project_management', 'Manage projects - view, edit, delete all projects'),
('post_management', 'Manage posts and content'),
('token_management', 'Manage API tokens'),
('system_settings', 'Access system settings and configurations')
ON CONFLICT (name) DO NOTHING;

-- Insert sample token packages
INSERT INTO public.token_packages (name, name_vi, token_amount, price_vnd, price_usd, bonus_tokens) VALUES
('Gói Cơ Bản', 'Basic Package', 1000, 50000, 2.50, 0),
('Gói Tiêu Chuẩn', 'Standard Package', 2500, 100000, 5.00, 250),
('Gói Cao Cấp', 'Premium Package', 5000, 200000, 10.00, 750)
ON CONFLICT (name) DO NOTHING;

-- Insert feature permissions
INSERT INTO public.feature_permissions (feature_name, feature_name_vi, description, description_vi, category) VALUES
('ai_outline_generation', 'Tạo đề cương AI', 'Generate research outline using AI', 'Tạo đề cương nghiên cứu bằng AI', 'ai'),
('ai_content_suggestions', 'Gợi ý nội dung AI', 'Get AI-powered content suggestions', 'Nhận gợi ý nội dung từ AI', 'ai'),
('export_pdf_word', 'Xuất PDF/Word', 'Export projects to PDF and Word formats', 'Xuất dự án ra định dạng PDF và Word', 'export'),
('unlimited_projects', 'Dự án không giới hạn', 'Create unlimited number of projects', 'Tạo số lượng dự án không giới hạn', 'project')
ON CONFLICT (feature_name) DO NOTHING;

-- Success message
SELECT 'NCSKIT DATABASE SETUP COMPLETED SUCCESSFULLY' as status;