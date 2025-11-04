-- =====================================================
-- NCSKIT COMPLETE PRODUCTION DATABASE SCHEMA
-- =====================================================
-- This file contains the complete database schema with relationships
-- and sample data for production deployment

-- =====================================================
-- 1. USER MANAGEMENT TABLES
-- =====================================================

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255),
    avatar_url TEXT,
    orcid_id VARCHAR(50),
    institution VARCHAR(255),
    department VARCHAR(255),
    position VARCHAR(255),
    research_interests TEXT[],
    bio TEXT,
    website_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User profiles with additional research info
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    research_domain VARCHAR(100),
    experience_level VARCHAR(50) CHECK (experience_level IN ('beginner', 'intermediate', 'advanced', 'expert')),
    preferred_language VARCHAR(10) DEFAULT 'vi',
    notification_preferences JSONB DEFAULT '{"email": true, "push": false}',
    privacy_settings JSONB DEFAULT '{"profile_public": true, "email_public": false}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 2. BUSINESS DOMAINS & MARKETING MODELS
-- =====================================================

-- Business domains
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

-- Marketing theoretical models
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

-- Research variables for each model
CREATE TABLE IF NOT EXISTS public.research_variables (
    id SERIAL PRIMARY KEY,
    model_id INTEGER REFERENCES public.marketing_models(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    name_vi VARCHAR(100) NOT NULL,
    type VARCHAR(50) CHECK (type IN ('independent', 'dependent', 'mediating', 'moderating', 'control')),
    description TEXT,
    description_vi TEXT,
    measurement_scale VARCHAR(50),
    sample_questions TEXT[],
    is_required BOOLEAN DEFAULT false,
    order_index INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Variable relationships (for structural equation modeling)
CREATE TABLE IF NOT EXISTS public.variable_relationships (
    id SERIAL PRIMARY KEY,
    model_id INTEGER REFERENCES public.marketing_models(id) ON DELETE CASCADE,
    from_variable_id INTEGER REFERENCES public.research_variables(id) ON DELETE CASCADE,
    to_variable_id INTEGER REFERENCES public.research_variables(id) ON DELETE CASCADE,
    relationship_type VARCHAR(50) CHECK (relationship_type IN ('direct', 'indirect', 'bidirectional')),
    strength VARCHAR(20) CHECK (strength IN ('weak', 'moderate', 'strong')),
    hypothesis_template TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 3. PROJECT MANAGEMENT
-- =====================================================

-- Research projects
CREATE TABLE IF NOT EXISTS public.projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    business_domain_id INTEGER REFERENCES public.business_domains(id),
    status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'in_progress', 'completed', 'published', 'archived')),
    progress INTEGER DEFAULT 0 CHECK (progress BETWEEN 0 AND 100),
    research_type VARCHAR(50) CHECK (research_type IN ('quantitative', 'qualitative', 'mixed_methods')),
    target_population TEXT,
    sample_size INTEGER,
    data_collection_method VARCHAR(100),
    timeline_start DATE,
    timeline_end DATE,
    budget DECIMAL(12,2),
    keywords TEXT[],
    tags TEXT[],
    is_public BOOLEAN DEFAULT false,
    collaboration_enabled BOOLEAN DEFAULT false,
    ai_generated BOOLEAN DEFAULT false,
    outline_generated_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Project models (many-to-many relationship)
CREATE TABLE IF NOT EXISTS public.project_models (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    model_id INTEGER REFERENCES public.marketing_models(id) ON DELETE CASCADE,
    is_primary BOOLEAN DEFAULT false,
    customization_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(project_id, model_id)
);

-- Project variables (customized for each project)
CREATE TABLE IF NOT EXISTS public.project_variables (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    variable_id INTEGER REFERENCES public.research_variables(id) ON DELETE CASCADE,
    custom_name VARCHAR(100),
    custom_description TEXT,
    is_included BOOLEAN DEFAULT true,
    measurement_items TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Research hypotheses
CREATE TABLE IF NOT EXISTS public.research_hypotheses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    hypothesis_number VARCHAR(10),
    statement TEXT NOT NULL,
    statement_vi TEXT,
    type VARCHAR(50) CHECK (type IN ('main', 'sub', 'null', 'alternative')),
    from_variable_id INTEGER REFERENCES public.research_variables(id),
    to_variable_id INTEGER REFERENCES public.research_variables(id),
    expected_direction VARCHAR(20) CHECK (expected_direction IN ('positive', 'negative', 'neutral')),
    rationale TEXT,
    is_supported BOOLEAN,
    test_result JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 4. RESEARCH TEMPLATES & OUTLINES
-- =====================================================

-- Research outline templates
CREATE TABLE IF NOT EXISTS public.research_outline_templates (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    name_vi VARCHAR(200) NOT NULL,
    model_id INTEGER REFERENCES public.marketing_models(id),
    business_domain_id INTEGER REFERENCES public.business_domains(id),
    template_type VARCHAR(50) CHECK (template_type IN ('thesis', 'dissertation', 'journal_article', 'conference_paper')),
    content_structure JSONB NOT NULL,
    variables_mapping JSONB,
    sample_content TEXT,
    usage_count INTEGER DEFAULT 0,
    rating DECIMAL(3,2) DEFAULT 0.0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Generated research outlines
CREATE TABLE IF NOT EXISTS public.research_outlines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    template_id INTEGER REFERENCES public.research_outline_templates(id),
    title VARCHAR(500),
    content JSONB NOT NULL,
    generated_by VARCHAR(50) DEFAULT 'ai',
    generation_prompt TEXT,
    tokens_used INTEGER,
    generation_time_ms INTEGER,
    quality_score DECIMAL(3,2),
    user_rating INTEGER CHECK (user_rating BETWEEN 1 AND 5),
    user_feedback TEXT,
    version INTEGER DEFAULT 1,
    is_current BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 5. SURVEY & QUESTIONNAIRE MANAGEMENT
-- =====================================================

-- Survey question templates
CREATE TABLE IF NOT EXISTS public.survey_question_templates (
    id SERIAL PRIMARY KEY,
    variable_id INTEGER REFERENCES public.research_variables(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    question_text_vi TEXT,
    question_type VARCHAR(50) CHECK (question_type IN ('likert_5', 'likert_7', 'multiple_choice', 'open_ended', 'semantic_differential')),
    scale_labels JSONB,
    validation_rules JSONB,
    order_index INTEGER,
    source_reference TEXT,
    reliability_alpha DECIMAL(4,3),
    validity_notes TEXT,
    usage_count INTEGER DEFAULT 0,
    is_validated BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Project surveys
CREATE TABLE IF NOT EXISTS public.project_surveys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    title VARCHAR(300) NOT NULL,
    description TEXT,
    instructions TEXT,
    estimated_duration INTEGER, -- in minutes
    target_respondents INTEGER,
    status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused', 'completed', 'archived')),
    launch_date TIMESTAMP WITH TIME ZONE,
    close_date TIMESTAMP WITH TIME ZONE,
    response_count INTEGER DEFAULT 0,
    completion_rate DECIMAL(5,2) DEFAULT 0.0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Survey questions (customized from templates)
CREATE TABLE IF NOT EXISTS public.survey_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    survey_id UUID REFERENCES public.project_surveys(id) ON DELETE CASCADE,
    template_id INTEGER REFERENCES public.survey_question_templates(id),
    question_text TEXT NOT NULL,
    question_type VARCHAR(50),
    options JSONB,
    is_required BOOLEAN DEFAULT true,
    order_index INTEGER,
    section VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 6. COLLABORATION & SHARING
-- =====================================================

-- Project collaborators
CREATE TABLE IF NOT EXISTS public.project_collaborators (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    role VARCHAR(50) CHECK (role IN ('owner', 'editor', 'reviewer', 'viewer')),
    permissions JSONB DEFAULT '{"read": true, "write": false, "delete": false}',
    invited_by UUID REFERENCES public.users(id),
    invited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    accepted_at TIMESTAMP WITH TIME ZONE,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'removed')),
    UNIQUE(project_id, user_id)
);

-- Project comments and feedback
CREATE TABLE IF NOT EXISTS public.project_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    parent_comment_id UUID REFERENCES public.project_comments(id),
    content TEXT NOT NULL,
    comment_type VARCHAR(50) CHECK (comment_type IN ('general', 'suggestion', 'question', 'approval', 'revision_request')),
    section_reference VARCHAR(100),
    is_resolved BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 7. ANALYTICS & TRACKING
-- =====================================================

-- User activity logs
CREATE TABLE IF NOT EXISTS public.user_activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    activity_type VARCHAR(100) NOT NULL,
    resource_type VARCHAR(50),
    resource_id UUID,
    details JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Project analytics
CREATE TABLE IF NOT EXISTS public.project_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    metric_name VARCHAR(100) NOT NULL,
    metric_value DECIMAL(12,4),
    metric_date DATE DEFAULT CURRENT_DATE,
    additional_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- System usage statistics
CREATE TABLE IF NOT EXISTS public.usage_statistics (
    id SERIAL PRIMARY KEY,
    date DATE DEFAULT CURRENT_DATE,
    metric_type VARCHAR(100) NOT NULL,
    metric_value INTEGER DEFAULT 0,
    additional_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(date, metric_type)
);

-- =====================================================
-- 8. INDEXES FOR PERFORMANCE
-- =====================================================

-- User indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON public.user_profiles(user_id);

-- Project indexes
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON public.projects(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON public.projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON public.projects(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_projects_business_domain ON public.projects(business_domain_id);

-- Model and variable indexes
CREATE INDEX IF NOT EXISTS idx_research_variables_model_id ON public.research_variables(model_id);
CREATE INDEX IF NOT EXISTS idx_variable_relationships_model_id ON public.variable_relationships(model_id);
CREATE INDEX IF NOT EXISTS idx_project_models_project_id ON public.project_models(project_id);

-- Template indexes
CREATE INDEX IF NOT EXISTS idx_outline_templates_model_id ON public.research_outline_templates(model_id);
CREATE INDEX IF NOT EXISTS idx_survey_templates_variable_id ON public.survey_question_templates(variable_id);

-- Activity indexes
CREATE INDEX IF NOT EXISTS idx_user_activities_user_id ON public.user_activities(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activities_created_at ON public.user_activities(created_at DESC);

-- =====================================================
-- 9. ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_models ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_variables ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.research_hypotheses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.research_outlines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_surveys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.survey_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_collaborators ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_analytics ENABLE ROW LEVEL SECURITY;

-- User policies
CREATE POLICY "Users can view own profile" ON public.users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);

-- Project policies
CREATE POLICY "Users can view own projects" ON public.projects
    FOR SELECT USING (auth.uid() = user_id OR is_public = true);

CREATE POLICY "Users can create projects" ON public.projects
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own projects" ON public.projects
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own projects" ON public.projects
    FOR DELETE USING (auth.uid() = user_id);

-- Collaborator policies
CREATE POLICY "View project collaborators" ON public.project_collaborators
    FOR SELECT USING (
        auth.uid() = user_id OR 
        EXISTS (
            SELECT 1 FROM public.projects 
            WHERE id = project_id AND user_id = auth.uid()
        )
    );

-- =====================================================
-- 10. FUNCTIONS AND TRIGGERS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON public.user_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON public.projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to calculate project progress
CREATE OR REPLACE FUNCTION calculate_project_progress(project_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
    total_sections INTEGER := 10; -- Total sections in a research project
    completed_sections INTEGER := 0;
BEGIN
    -- Count completed sections based on project data
    IF EXISTS (SELECT 1 FROM public.projects WHERE id = project_uuid AND title IS NOT NULL AND title != '') THEN
        completed_sections := completed_sections + 1;
    END IF;
    
    IF EXISTS (SELECT 1 FROM public.projects WHERE id = project_uuid AND description IS NOT NULL AND description != '') THEN
        completed_sections := completed_sections + 1;
    END IF;
    
    IF EXISTS (SELECT 1 FROM public.project_models WHERE project_id = project_uuid) THEN
        completed_sections := completed_sections + 2;
    END IF;
    
    IF EXISTS (SELECT 1 FROM public.research_hypotheses WHERE project_id = project_uuid) THEN
        completed_sections := completed_sections + 2;
    END IF;
    
    IF EXISTS (SELECT 1 FROM public.research_outlines WHERE project_id = project_uuid) THEN
        completed_sections := completed_sections + 3;
    END IF;
    
    IF EXISTS (SELECT 1 FROM public.project_surveys WHERE project_id = project_uuid) THEN
        completed_sections := completed_sections + 1;
    END IF;
    
    RETURN LEAST(100, (completed_sections * 100 / total_sections));
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- SCHEMA CREATION COMPLETE
-- =====================================================

COMMENT ON SCHEMA public IS 'NCSKIT Marketing Research Platform - Complete Production Schema';