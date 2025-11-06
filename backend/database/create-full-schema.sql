-- NCSKIT Full Database Schema
-- Generated from Supabase TypeScript types
-- Compatible with PostgreSQL 15+

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types/enums
CREATE TYPE research_phase AS ENUM ('planning', 'execution', 'writing', 'submission', 'management');
CREATE TYPE project_status AS ENUM ('draft', 'outline_generated', 'active', 'paused', 'completed', 'archived');
CREATE TYPE document_type AS ENUM ('manuscript', 'notes', 'methodology', 'data_analysis', 'presentation');
CREATE TYPE activity_type AS ENUM ('document_edit', 'reference_added', 'milestone_completed', 'collaboration');
CREATE TYPE subscription_type AS ENUM ('free', 'premium', 'institutional');
CREATE TYPE collaborator_role AS ENUM ('owner', 'editor', 'viewer');
CREATE TYPE account_status AS ENUM ('active', 'suspended', 'pending');

-- =============================================
-- CORE TABLES
-- =============================================

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    full_name VARCHAR(200),
    institution VARCHAR(200),
    orcid_id VARCHAR(50),
    avatar_url TEXT,
    subscription_type subscription_type DEFAULT 'free',
    token_balance INTEGER DEFAULT 0,
    account_status account_status DEFAULT 'active',
    research_domains TEXT[],
    preferences JSONB,
    role VARCHAR(50),
    status VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Business domains table
CREATE TABLE business_domains (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    name_vi VARCHAR(200),
    description TEXT NOT NULL,
    description_vi TEXT,
    icon VARCHAR(100) NOT NULL,
    color VARCHAR(20) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Marketing models table
CREATE TABLE marketing_models (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    name_vi VARCHAR(200),
    abbreviation VARCHAR(20),
    description TEXT NOT NULL,
    description_vi TEXT,
    category VARCHAR(100) NOT NULL,
    year_developed INTEGER,
    key_authors TEXT[],
    application_areas TEXT[],
    variables JSONB,
    relationships JSONB,
    academic_references JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Projects table
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(300) NOT NULL,
    description TEXT NOT NULL,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    business_domain_id INTEGER NOT NULL REFERENCES business_domains(id),
    selected_models INTEGER[] DEFAULT '{}',
    research_outline JSONB,
    status project_status DEFAULT 'draft',
    progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    phase research_phase DEFAULT 'planning',
    tags TEXT[],
    word_count INTEGER,
    reference_count INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Project collaborators table
CREATE TABLE project_collaborators (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role collaborator_role DEFAULT 'viewer',
    permissions TEXT[] DEFAULT '{}',
    invited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    joined_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(project_id, user_id)
);

-- Documents table
CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    title VARCHAR(300) NOT NULL,
    content TEXT DEFAULT '',
    version INTEGER DEFAULT 1,
    type document_type DEFAULT 'manuscript',
    metadata JSONB DEFAULT '{}',
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- References table
CREATE TABLE "references" (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(500) NOT NULL,
    authors JSONB NOT NULL,
    publication JSONB NOT NULL,
    metadata JSONB DEFAULT '{}',
    tags TEXT[] DEFAULT '{}',
    notes TEXT,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Milestones table
CREATE TABLE milestones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    title VARCHAR(300) NOT NULL,
    description TEXT NOT NULL,
    due_date TIMESTAMP WITH TIME ZONE NOT NULL,
    completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Activities table
CREATE TABLE activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    type activity_type NOT NULL,
    description TEXT NOT NULL,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- ADMIN & SYSTEM TABLES
-- =============================================

-- Admin logs table
CREATE TABLE admin_logs (
    id SERIAL PRIMARY KEY,
    admin_id UUID NOT NULL REFERENCES users(id),
    action VARCHAR(100) NOT NULL,
    target_type VARCHAR(50) NOT NULL,
    target_id INTEGER NOT NULL,
    details JSONB,
    ip_address INET,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User tokens table
CREATE TABLE user_tokens (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL, -- Note: This might need to be UUID if referencing users table
    transaction_type VARCHAR(50) NOT NULL,
    amount INTEGER NOT NULL,
    balance_after INTEGER NOT NULL,
    description TEXT NOT NULL,
    reference_type VARCHAR(50),
    reference_id INTEGER,
    created_by INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Posts table (for blog/content management)
CREATE TABLE posts (
    id SERIAL PRIMARY KEY,
    title VARCHAR(300) NOT NULL,
    content TEXT NOT NULL,
    author_id INTEGER NOT NULL, -- Note: This might need to be UUID if referencing users table
    author_name VARCHAR(200),
    status VARCHAR(20) DEFAULT 'draft',
    category VARCHAR(100),
    published_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Permissions table
CREATE TABLE permissions (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    permission VARCHAR(100) NOT NULL,
    granted_by UUID REFERENCES users(id),
    granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(user_id, permission)
);

-- Rewards table
CREATE TABLE rewards (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    reward_type VARCHAR(50) NOT NULL,
    amount INTEGER NOT NULL,
    description TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================

-- Users indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_subscription_type ON users(subscription_type);
CREATE INDEX idx_users_account_status ON users(account_status);
CREATE INDEX idx_users_created_at ON users(created_at);

-- Projects indexes
CREATE INDEX idx_projects_user_id ON projects(user_id);
CREATE INDEX idx_projects_business_domain_id ON projects(business_domain_id);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_phase ON projects(phase);
CREATE INDEX idx_projects_created_at ON projects(created_at);

-- Project collaborators indexes
CREATE INDEX idx_project_collaborators_project_id ON project_collaborators(project_id);
CREATE INDEX idx_project_collaborators_user_id ON project_collaborators(user_id);

-- Documents indexes
CREATE INDEX idx_documents_project_id ON documents(project_id);
CREATE INDEX idx_documents_created_by ON documents(created_by);
CREATE INDEX idx_documents_type ON documents(type);

-- References indexes
CREATE INDEX idx_references_user_id ON "references"(user_id);
CREATE INDEX idx_references_project_id ON "references"(project_id);

-- Activities indexes
CREATE INDEX idx_activities_user_id ON activities(user_id);
CREATE INDEX idx_activities_project_id ON activities(project_id);
CREATE INDEX idx_activities_type ON activities(type);
CREATE INDEX idx_activities_created_at ON activities(created_at);

-- Admin logs indexes
CREATE INDEX idx_admin_logs_admin_id ON admin_logs(admin_id);
CREATE INDEX idx_admin_logs_action ON admin_logs(action);
CREATE INDEX idx_admin_logs_created_at ON admin_logs(created_at);

-- =============================================
-- TRIGGERS FOR UPDATED_AT
-- =============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers to tables with updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_business_domains_updated_at BEFORE UPDATE ON business_domains FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_marketing_models_updated_at BEFORE UPDATE ON marketing_models FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON documents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_references_updated_at BEFORE UPDATE ON "references" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_milestones_updated_at BEFORE UPDATE ON milestones FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_posts_updated_at BEFORE UPDATE ON posts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_rewards_updated_at BEFORE UPDATE ON rewards FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- SAMPLE DATA (Optional)
-- =============================================

-- Insert sample business domains
INSERT INTO business_domains (name, name_vi, description, description_vi, icon, color) VALUES
('Marketing', 'Tiếp thị', 'Marketing research and consumer behavior', 'Nghiên cứu tiếp thị và hành vi người tiêu dùng', 'marketing', '#3B82F6'),
('Finance', 'Tài chính', 'Financial analysis and investment research', 'Phân tích tài chính và nghiên cứu đầu tư', 'finance', '#10B981'),
('Operations', 'Vận hành', 'Operations management and supply chain', 'Quản lý vận hành và chuỗi cung ứng', 'operations', '#F59E0B'),
('Strategy', 'Chiến lược', 'Strategic management and business planning', 'Quản lý chiến lược và lập kế hoạch kinh doanh', 'strategy', '#EF4444'),
('Human Resources', 'Nhân sự', 'HR management and organizational behavior', 'Quản lý nhân sự và hành vi tổ chức', 'hr', '#8B5CF6');

-- Insert sample marketing models
INSERT INTO marketing_models (name, name_vi, abbreviation, description, description_vi, category, year_developed, key_authors, application_areas) VALUES
('Technology Acceptance Model', 'Mô hình Chấp nhận Công nghệ', 'TAM', 'Model explaining user acceptance of technology', 'Mô hình giải thích sự chấp nhận công nghệ của người dùng', 'Technology Adoption', 1989, ARRAY['Fred Davis'], ARRAY['Technology Adoption', 'User Experience']),
('Theory of Planned Behavior', 'Lý thuyết Hành vi Có kế hoạch', 'TPB', 'Theory explaining human behavior prediction', 'Lý thuyết giải thích dự đoán hành vi con người', 'Behavioral Theory', 1985, ARRAY['Icek Ajzen'], ARRAY['Consumer Behavior', 'Social Psychology']),
('Service Quality Model', 'Mô hình Chất lượng Dịch vụ', 'SERVQUAL', 'Model for measuring service quality', 'Mô hình đo lường chất lượng dịch vụ', 'Service Management', 1988, ARRAY['Parasuraman', 'Zeithaml', 'Berry'], ARRAY['Service Quality', 'Customer Satisfaction']);

COMMENT ON TABLE users IS 'User accounts and profiles';
COMMENT ON TABLE projects IS 'Research projects created by users';
COMMENT ON TABLE business_domains IS 'Business domains/categories for research';
COMMENT ON TABLE marketing_models IS 'Marketing and business models database';
COMMENT ON TABLE project_collaborators IS 'Project collaboration and permissions';
COMMENT ON TABLE documents IS 'Project documents and manuscripts';
COMMENT ON TABLE "references" IS 'Academic references and citations';
COMMENT ON TABLE milestones IS 'Project milestones and deadlines';
COMMENT ON TABLE activities IS 'User and project activity logs';
COMMENT ON TABLE admin_logs IS 'Administrative action logs';
COMMENT ON TABLE permissions IS 'User permissions and roles';
COMMENT ON TABLE rewards IS 'User rewards and incentives';

-- Grant permissions (adjust as needed)
-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO ncskit_user;
-- GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO ncskit_user;