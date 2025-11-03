-- =====================================================
-- NCSKIT Research Management Platform - Complete Database Schema
-- =====================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- ENUMS & CUSTOM TYPES
-- =====================================================

-- User related enums
CREATE TYPE subscription_type AS ENUM ('free', 'premium', 'institutional', 'enterprise');
CREATE TYPE user_status AS ENUM ('active', 'inactive', 'suspended', 'pending_verification');
CREATE TYPE user_role AS ENUM ('student', 'researcher', 'professor', 'admin', 'institution_admin');

-- Project related enums
CREATE TYPE project_status AS ENUM ('planning', 'active', 'paused', 'completed', 'archived', 'cancelled');
CREATE TYPE project_phase AS ENUM ('conception', 'planning', 'execution', 'analysis', 'writing', 'submission', 'published');
CREATE TYPE project_visibility AS ENUM ('private', 'team', 'institution', 'public');
CREATE TYPE collaborator_role AS ENUM ('owner', 'co_investigator', 'researcher', 'analyst', 'writer', 'reviewer', 'viewer');

-- Document related enums
CREATE TYPE document_type AS ENUM ('manuscript', 'proposal', 'methodology', 'data_analysis', 'presentation', 'notes', 'report');
CREATE TYPE document_status AS ENUM ('draft', 'in_review', 'approved', 'published', 'archived');

-- Reference related enums
CREATE TYPE reference_type AS ENUM ('journal_article', 'book', 'book_chapter', 'conference_paper', 'thesis', 'report', 'website', 'dataset');
CREATE TYPE publication_status AS ENUM ('published', 'in_press', 'preprint', 'submitted', 'in_preparation');

-- Activity related enums
CREATE TYPE activity_type AS ENUM (
    'user_login', 'user_logout', 'profile_update',
    'project_created', 'project_updated', 'project_deleted', 'project_archived',
    'document_created', 'document_updated', 'document_deleted', 'document_shared',
    'reference_added', 'reference_updated', 'reference_deleted', 'reference_imported',
    'collaboration_invited', 'collaboration_accepted', 'collaboration_removed',
    'milestone_created', 'milestone_completed', 'milestone_updated',
    'task_created', 'task_completed', 'task_assigned',
    'comment_added', 'file_uploaded', 'backup_created'
);

-- Notification related enums
CREATE TYPE notification_type AS ENUM ('info', 'warning', 'success', 'error', 'reminder');
CREATE TYPE notification_priority AS ENUM ('low', 'medium', 'high', 'urgent');

-- =====================================================
-- CORE TABLES
-- =====================================================

-- Users table (extends Supabase auth.users)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    display_name VARCHAR(200),
    avatar_url TEXT,
    
    -- Academic information
    institution VARCHAR(255),
    department VARCHAR(255),
    position VARCHAR(100),
    orcid_id VARCHAR(50) UNIQUE,
    google_scholar_id VARCHAR(100),
    researchgate_id VARCHAR(100),
    
    -- Account details
    subscription_type subscription_type DEFAULT 'free',
    user_role user_role DEFAULT 'researcher',
    status user_status DEFAULT 'active',
    
    -- Research profile
    research_domains TEXT[] DEFAULT '{}',
    research_interests TEXT[] DEFAULT '{}',
    expertise_areas TEXT[] DEFAULT '{}',
    languages TEXT[] DEFAULT '{"en"}',
    
    -- Settings & preferences
    preferences JSONB DEFAULT '{}',
    notification_settings JSONB DEFAULT '{}',
    privacy_settings JSONB DEFAULT '{}',
    
    -- Metadata
    last_login_at TIMESTAMP WITH TIME ZONE,
    email_verified_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Institutions table
CREATE TABLE institutions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    short_name VARCHAR(50),
    country VARCHAR(100),
    city VARCHAR(100),
    website_url TEXT,
    logo_url TEXT,
    type VARCHAR(50), -- university, research_institute, company, etc.
    
    -- Contact information
    contact_email VARCHAR(255),
    contact_phone VARCHAR(50),
    address TEXT,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User institution affiliations
CREATE TABLE user_institutions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
    department VARCHAR(255),
    position VARCHAR(100),
    start_date DATE,
    end_date DATE,
    is_primary BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, institution_id)
);

-- =====================================================
-- PROJECT MANAGEMENT
-- =====================================================

-- Projects table
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(500) NOT NULL,
    description TEXT,
    abstract TEXT,
    
    -- Project classification
    research_domain VARCHAR(100),
    research_type VARCHAR(100), -- experimental, theoretical, review, meta-analysis
    methodology TEXT[],
    keywords TEXT[],
    
    -- Status and progress
    status project_status DEFAULT 'planning',
    phase project_phase DEFAULT 'conception',
    visibility project_visibility DEFAULT 'private',
    progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    
    -- Ownership and collaboration
    owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    institution_id UUID REFERENCES institutions(id),
    
    -- Timeline
    start_date DATE,
    expected_end_date DATE,
    actual_end_date DATE,
    
    -- Funding and resources
    funding_source VARCHAR(255),
    budget_amount DECIMAL(15,2),
    currency VARCHAR(10) DEFAULT 'USD',
    
    -- External identifiers
    external_id VARCHAR(100), -- Grant number, protocol number, etc.
    doi VARCHAR(255),
    
    -- Settings
    settings JSONB DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    archived_at TIMESTAMP WITH TIME ZONE
);

-- Project collaborators
CREATE TABLE project_collaborators (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    role collaborator_role DEFAULT 'researcher',
    permissions TEXT[] DEFAULT '{}', -- read, write, admin, invite, etc.
    contribution_percentage DECIMAL(5,2) DEFAULT 0,
    
    -- Invitation details
    invited_by UUID REFERENCES users(id),
    invited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    joined_at TIMESTAMP WITH TIME ZONE,
    left_at TIMESTAMP WITH TIME ZONE,
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    
    UNIQUE(project_id, user_id)
);

-- Project milestones
CREATE TABLE milestones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    
    title VARCHAR(255) NOT NULL,
    description TEXT,
    
    -- Timeline
    due_date DATE NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE,
    
    -- Status and progress
    is_completed BOOLEAN DEFAULT FALSE,
    progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    
    -- Assignment
    assigned_to UUID REFERENCES users(id),
    created_by UUID NOT NULL REFERENCES users(id),
    
    -- Priority and dependencies
    priority INTEGER DEFAULT 1 CHECK (priority >= 1 AND priority <= 5),
    depends_on UUID[] DEFAULT '{}', -- Array of milestone IDs
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Project tasks
CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    milestone_id UUID REFERENCES milestones(id) ON DELETE SET NULL,
    
    title VARCHAR(255) NOT NULL,
    description TEXT,
    
    -- Assignment and status
    assigned_to UUID REFERENCES users(id),
    created_by UUID NOT NULL REFERENCES users(id),
    is_completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMP WITH TIME ZONE,
    
    -- Timeline
    due_date DATE,
    estimated_hours DECIMAL(8,2),
    actual_hours DECIMAL(8,2),
    
    -- Priority and labels
    priority INTEGER DEFAULT 1 CHECK (priority >= 1 AND priority <= 5),
    labels TEXT[] DEFAULT '{}',
    
    -- Dependencies
    depends_on UUID[] DEFAULT '{}', -- Array of task IDs
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- DOCUMENT MANAGEMENT
-- =====================================================

-- Documents table
CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    
    title VARCHAR(500) NOT NULL,
    content TEXT DEFAULT '',
    content_type VARCHAR(50) DEFAULT 'text/markdown', -- text/markdown, text/html, application/json
    
    -- Document metadata
    type document_type DEFAULT 'manuscript',
    status document_status DEFAULT 'draft',
    version INTEGER DEFAULT 1,
    word_count INTEGER DEFAULT 0,
    
    -- Authorship
    created_by UUID NOT NULL REFERENCES users(id),
    last_edited_by UUID REFERENCES users(id),
    
    -- File information
    file_path TEXT,
    file_size BIGINT,
    file_hash VARCHAR(64),
    
    -- Collaboration
    is_collaborative BOOLEAN DEFAULT TRUE,
    lock_user_id UUID REFERENCES users(id), -- For edit locking
    locked_at TIMESTAMP WITH TIME ZONE,
    
    -- Publishing
    published_at TIMESTAMP WITH TIME ZONE,
    published_url TEXT,
    
    -- Settings and metadata
    settings JSONB DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Document versions (for version control)
CREATE TABLE document_versions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    
    version_number INTEGER NOT NULL,
    content TEXT NOT NULL,
    content_diff TEXT, -- Diff from previous version
    
    -- Version metadata
    title VARCHAR(500),
    change_summary TEXT,
    word_count INTEGER DEFAULT 0,
    
    -- Author information
    created_by UUID NOT NULL REFERENCES users(id),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(document_id, version_number)
);

-- Document comments
CREATE TABLE document_comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    
    content TEXT NOT NULL,
    
    -- Position in document (for inline comments)
    selection_start INTEGER,
    selection_end INTEGER,
    line_number INTEGER,
    
    -- Threading
    parent_comment_id UUID REFERENCES document_comments(id) ON DELETE CASCADE,
    
    -- Status
    is_resolved BOOLEAN DEFAULT FALSE,
    resolved_by UUID REFERENCES users(id),
    resolved_at TIMESTAMP WITH TIME ZONE,
    
    -- Author
    created_by UUID NOT NULL REFERENCES users(id),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- REFERENCE MANAGEMENT
-- =====================================================

-- References table
CREATE TABLE references (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Basic information
    title TEXT NOT NULL,
    authors JSONB NOT NULL DEFAULT '[]', -- Array of author objects
    
    -- Publication details
    type reference_type DEFAULT 'journal_article',
    publication_title VARCHAR(500), -- Journal, book, conference name
    publisher VARCHAR(255),
    publication_date DATE,
    publication_year INTEGER,
    status publication_status DEFAULT 'published',
    
    -- Identifiers
    doi VARCHAR(255),
    pmid VARCHAR(50),
    isbn VARCHAR(50),
    issn VARCHAR(50),
    arxiv_id VARCHAR(50),
    
    -- Citation details
    volume VARCHAR(50),
    issue VARCHAR(50),
    pages VARCHAR(100),
    article_number VARCHAR(50),
    
    -- URLs and files
    url TEXT,
    pdf_url TEXT,
    file_path TEXT,
    
    -- Content and metadata
    abstract TEXT,
    keywords TEXT[] DEFAULT '{}',
    language VARCHAR(10) DEFAULT 'en',
    
    -- User-specific data
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    
    -- Organization
    tags TEXT[] DEFAULT '{}',
    folders TEXT[] DEFAULT '{}',
    notes TEXT,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    
    -- Import information
    imported_from VARCHAR(100), -- pubmed, crossref, manual, etc.
    import_id VARCHAR(255),
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reference citations (many-to-many between documents and references)
CREATE TABLE document_citations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    reference_id UUID NOT NULL REFERENCES references(id) ON DELETE CASCADE,
    
    -- Citation context
    citation_text TEXT,
    page_number INTEGER,
    context_before TEXT,
    context_after TEXT,
    
    -- Citation style
    citation_style VARCHAR(50) DEFAULT 'apa', -- apa, mla, chicago, etc.
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(document_id, reference_id)
);

-- =====================================================
-- JOURNAL AND PUBLICATION MANAGEMENT
-- =====================================================

-- Journals table
CREATE TABLE journals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Basic information
    title VARCHAR(500) NOT NULL,
    short_title VARCHAR(100),
    issn VARCHAR(50),
    e_issn VARCHAR(50),
    
    -- Publisher information
    publisher VARCHAR(255),
    publisher_country VARCHAR(100),
    
    -- Indexing and metrics
    impact_factor DECIMAL(8,3),
    sjr_score DECIMAL(8,3),
    h_index INTEGER,
    quartile VARCHAR(10), -- Q1, Q2, Q3, Q4
    
    -- Scope and details
    subject_areas TEXT[],
    research_domains TEXT[],
    languages TEXT[] DEFAULT '{"en"}',
    
    -- Submission details
    submission_url TEXT,
    guidelines_url TEXT,
    review_time_weeks INTEGER,
    acceptance_rate DECIMAL(5,2),
    
    -- Open access information
    is_open_access BOOLEAN DEFAULT FALSE,
    apc_amount DECIMAL(10,2),
    apc_currency VARCHAR(10),
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Journal submissions
CREATE TABLE journal_submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    journal_id UUID NOT NULL REFERENCES journals(id),
    document_id UUID REFERENCES documents(id),
    
    -- Submission details
    submission_date DATE NOT NULL,
    manuscript_id VARCHAR(100), -- Journal's internal ID
    
    -- Status tracking
    status VARCHAR(50) DEFAULT 'submitted', -- submitted, under_review, revision_requested, accepted, rejected
    decision_date DATE,
    decision_notes TEXT,
    
    -- Review process
    reviewer_comments TEXT,
    editor_comments TEXT,
    revision_deadline DATE,
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- ANALYTICS AND TRACKING
-- =====================================================

-- User activities
CREATE TABLE activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Actor and target
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    
    -- Activity details
    type activity_type NOT NULL,
    description TEXT NOT NULL,
    
    -- Context
    entity_type VARCHAR(50), -- project, document, reference, etc.
    entity_id UUID,
    
    -- Additional data
    metadata JSONB DEFAULT '{}',
    ip_address INET,
    user_agent TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User sessions
CREATE TABLE user_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Session details
    session_token VARCHAR(255) UNIQUE NOT NULL,
    device_info JSONB,
    ip_address INET,
    location JSONB, -- Country, city, etc.
    
    -- Timestamps
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ended_at TIMESTAMP WITH TIME ZONE,
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE
);

-- =====================================================
-- NOTIFICATIONS AND COMMUNICATION
-- =====================================================

-- Notifications
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Recipient
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Content
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type notification_type DEFAULT 'info',
    priority notification_priority DEFAULT 'medium',
    
    -- Context
    entity_type VARCHAR(50),
    entity_id UUID,
    action_url TEXT,
    
    -- Status
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP WITH TIME ZONE,
    
    -- Delivery
    sent_via TEXT[] DEFAULT '{}', -- web, email, push
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE
);

-- =====================================================
-- FILE MANAGEMENT
-- =====================================================

-- Files table
CREATE TABLE files (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- File information
    filename VARCHAR(255) NOT NULL,
    original_filename VARCHAR(255) NOT NULL,
    file_path TEXT NOT NULL,
    file_size BIGINT NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    file_hash VARCHAR(64) NOT NULL,
    
    -- Ownership and context
    uploaded_by UUID NOT NULL REFERENCES users(id),
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    
    -- File metadata
    description TEXT,
    tags TEXT[] DEFAULT '{}',
    
    -- Access control
    is_public BOOLEAN DEFAULT FALSE,
    access_permissions JSONB DEFAULT '{}',
    
    -- Processing status
    processing_status VARCHAR(50) DEFAULT 'completed', -- uploading, processing, completed, failed
    processing_metadata JSONB DEFAULT '{}',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- User indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_institution ON users(institution);
CREATE INDEX idx_users_subscription_type ON users(subscription_type);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_users_research_domains ON users USING GIN(research_domains);

-- Project indexes
CREATE INDEX idx_projects_owner_id ON projects(owner_id);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_phase ON projects(phase);
CREATE INDEX idx_projects_visibility ON projects(visibility);
CREATE INDEX idx_projects_institution_id ON projects(institution_id);
CREATE INDEX idx_projects_research_domain ON projects(research_domain);
CREATE INDEX idx_projects_keywords ON projects USING GIN(keywords);

-- Collaboration indexes
CREATE INDEX idx_project_collaborators_project_id ON project_collaborators(project_id);
CREATE INDEX idx_project_collaborators_user_id ON project_collaborators(user_id);
CREATE INDEX idx_project_collaborators_role ON project_collaborators(role);

-- Document indexes
CREATE INDEX idx_documents_project_id ON documents(project_id);
CREATE INDEX idx_documents_created_by ON documents(created_by);
CREATE INDEX idx_documents_type ON documents(type);
CREATE INDEX idx_documents_status ON documents(status);

-- Reference indexes
CREATE INDEX idx_references_user_id ON references(user_id);
CREATE INDEX idx_references_project_id ON references(project_id);
CREATE INDEX idx_references_type ON references(type);
CREATE INDEX idx_references_doi ON references(doi);
CREATE INDEX idx_references_tags ON references USING GIN(tags);
CREATE INDEX idx_references_keywords ON references USING GIN(keywords);

-- Activity indexes
CREATE INDEX idx_activities_user_id ON activities(user_id);
CREATE INDEX idx_activities_project_id ON activities(project_id);
CREATE INDEX idx_activities_type ON activities(type);
CREATE INDEX idx_activities_created_at ON activities(created_at);
CREATE INDEX idx_activities_entity ON activities(entity_type, entity_id);

-- Notification indexes
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);

-- =====================================================
-- TRIGGERS AND FUNCTIONS
-- =====================================================

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create updated_at triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_institutions_updated_at BEFORE UPDATE ON institutions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_milestones_updated_at BEFORE UPDATE ON milestones FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON documents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_references_updated_at BEFORE UPDATE ON references FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_journals_updated_at BEFORE UPDATE ON journals FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to update document word count
CREATE OR REPLACE FUNCTION update_document_word_count()
RETURNS TRIGGER AS $$
BEGIN
    NEW.word_count = array_length(string_to_array(trim(NEW.content), ' '), 1);
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_document_word_count_trigger 
    BEFORE INSERT OR UPDATE OF content ON documents 
    FOR EACH ROW EXECUTE FUNCTION update_document_word_count();

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE institutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_institutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_collaborators ENABLE ROW LEVEL SECURITY;
ALTER TABLE milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE references ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_citations ENABLE ROW LEVEL SECURITY;
ALTER TABLE journals ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE files ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view own profile" ON users FOR SELECT USING (auth.uid()::text = id::text);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid()::text = id::text);

-- Projects policies
CREATE POLICY "Users can view accessible projects" ON projects FOR SELECT USING (
    owner_id::text = auth.uid()::text OR 
    visibility = 'public' OR
    id IN (SELECT project_id FROM project_collaborators WHERE user_id::text = auth.uid()::text)
);
CREATE POLICY "Users can create projects" ON projects FOR INSERT WITH CHECK (owner_id::text = auth.uid()::text);
CREATE POLICY "Project owners can update projects" ON projects FOR UPDATE USING (owner_id::text = auth.uid()::text);
CREATE POLICY "Project owners can delete projects" ON projects FOR DELETE USING (owner_id::text = auth.uid()::text);

-- Project collaborators policies
CREATE POLICY "Users can view project collaborators" ON project_collaborators FOR SELECT USING (
    user_id::text = auth.uid()::text OR 
    project_id IN (SELECT id FROM projects WHERE owner_id::text = auth.uid()::text) OR
    project_id IN (SELECT project_id FROM project_collaborators WHERE user_id::text = auth.uid()::text)
);

-- Documents policies
CREATE POLICY "Users can view project documents" ON documents FOR SELECT USING (
    project_id IN (
        SELECT id FROM projects WHERE owner_id::text = auth.uid()::text
        UNION
        SELECT project_id FROM project_collaborators WHERE user_id::text = auth.uid()::text
    )
);

-- References policies
CREATE POLICY "Users can view own references" ON references FOR SELECT USING (user_id::text = auth.uid()::text);
CREATE POLICY "Users can manage own references" ON references FOR ALL USING (user_id::text = auth.uid()::text);

-- Activities policies
CREATE POLICY "Users can view own activities" ON activities FOR SELECT USING (user_id::text = auth.uid()::text);
CREATE POLICY "Users can create activities" ON activities FOR INSERT WITH CHECK (user_id::text = auth.uid()::text);

-- Notifications policies
CREATE POLICY "Users can view own notifications" ON notifications FOR SELECT USING (user_id::text = auth.uid()::text);
CREATE POLICY "Users can update own notifications" ON notifications FOR UPDATE USING (user_id::text = auth.uid()::text);

-- Files policies
CREATE POLICY "Users can view accessible files" ON files FOR SELECT USING (
    uploaded_by::text = auth.uid()::text OR
    is_public = true OR
    project_id IN (
        SELECT id FROM projects WHERE owner_id::text = auth.uid()::text
        UNION
        SELECT project_id FROM project_collaborators WHERE user_id::text = auth.uid()::text
    )
);

-- =====================================================
-- VIEWS FOR COMMON QUERIES
-- =====================================================

-- User profile view with institution info
CREATE VIEW user_profiles AS
SELECT 
    u.*,
    i.name as institution_name,
    ui.department,
    ui.position as institution_position
FROM users u
LEFT JOIN user_institutions ui ON u.id = ui.user_id AND ui.is_primary = true
LEFT JOIN institutions i ON ui.institution_id = i.id;

-- Project overview view
CREATE VIEW project_overview AS
SELECT 
    p.*,
    u.first_name || ' ' || u.last_name as owner_name,
    i.name as institution_name,
    COUNT(DISTINCT pc.user_id) as collaborator_count,
    COUNT(DISTINCT d.id) as document_count,
    COUNT(DISTINCT m.id) as milestone_count,
    COUNT(DISTINCT m.id) FILTER (WHERE m.is_completed = true) as completed_milestones
FROM projects p
LEFT JOIN users u ON p.owner_id = u.id
LEFT JOIN institutions i ON p.institution_id = i.id
LEFT JOIN project_collaborators pc ON p.id = pc.project_id
LEFT JOIN documents d ON p.id = d.project_id
LEFT JOIN milestones m ON p.id = m.project_id
GROUP BY p.id, u.first_name, u.last_name, i.name;

-- =====================================================
-- INITIAL DATA SETUP
-- =====================================================

-- Insert sample institutions
INSERT INTO institutions (name, short_name, country, type) VALUES
('NCSKIT University', 'NCSKIT', 'Vietnam', 'university'),
('Tech Research Institute', 'TRI', 'Vietnam', 'research_institute'),
('State University', 'SU', 'Vietnam', 'university')
ON CONFLICT DO NOTHING;

-- This completes the comprehensive database schema for NCSKIT
-- Next step: Run this in Supabase SQL Editor to create all tables