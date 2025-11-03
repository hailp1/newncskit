-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types/enums
CREATE TYPE research_phase AS ENUM ('planning', 'execution', 'writing', 'submission', 'management');
CREATE TYPE project_status AS ENUM ('active', 'paused', 'completed', 'archived');
CREATE TYPE document_type AS ENUM ('manuscript', 'notes', 'methodology', 'data_analysis', 'presentation');
CREATE TYPE activity_type AS ENUM ('document_edit', 'reference_added', 'milestone_completed', 'collaboration');
CREATE TYPE subscription_type AS ENUM ('free', 'premium', 'institutional');
CREATE TYPE collaborator_role AS ENUM ('owner', 'editor', 'viewer');

-- Users table (extends Supabase auth.users)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    institution VARCHAR(255),
    orcid_id VARCHAR(50),
    avatar_url TEXT,
    subscription_type subscription_type DEFAULT 'free',
    research_domains TEXT[] DEFAULT '{}',
    preferences JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Projects table
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    phase research_phase DEFAULT 'planning',
    status project_status DEFAULT 'active',
    progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    start_date DATE,
    end_date DATE,
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
    title VARCHAR(255) NOT NULL,
    content TEXT DEFAULT '',
    version INTEGER DEFAULT 1,
    type document_type DEFAULT 'manuscript',
    metadata JSONB DEFAULT '{}',
    created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- References table
CREATE TABLE references (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    authors JSONB NOT NULL DEFAULT '[]',
    publication JSONB NOT NULL DEFAULT '{}',
    metadata JSONB NOT NULL DEFAULT '{}',
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
    title VARCHAR(255) NOT NULL,
    description TEXT,
    due_date DATE NOT NULL,
    completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Activities table (for tracking user activities)
CREATE TABLE activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    type activity_type NOT NULL,
    description TEXT NOT NULL,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_projects_owner_id ON projects(owner_id);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_project_collaborators_project_id ON project_collaborators(project_id);
CREATE INDEX idx_project_collaborators_user_id ON project_collaborators(user_id);
CREATE INDEX idx_documents_project_id ON documents(project_id);
CREATE INDEX idx_documents_created_by ON documents(created_by);
CREATE INDEX idx_references_user_id ON references(user_id);
CREATE INDEX idx_references_project_id ON references(project_id);
CREATE INDEX idx_milestones_project_id ON milestones(project_id);
CREATE INDEX idx_activities_user_id ON activities(user_id);
CREATE INDEX idx_activities_project_id ON activities(project_id);
CREATE INDEX idx_activities_created_at ON activities(created_at);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON documents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_references_updated_at BEFORE UPDATE ON references FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_milestones_updated_at BEFORE UPDATE ON milestones FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_collaborators ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE references ENABLE ROW LEVEL SECURITY;
ALTER TABLE milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view own profile" ON users FOR SELECT USING (auth.uid()::text = id::text);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid()::text = id::text);

-- Projects policies
CREATE POLICY "Users can view own projects" ON projects FOR SELECT USING (
    owner_id::text = auth.uid()::text OR 
    id IN (SELECT project_id FROM project_collaborators WHERE user_id::text = auth.uid()::text)
);
CREATE POLICY "Users can create projects" ON projects FOR INSERT WITH CHECK (owner_id::text = auth.uid()::text);
CREATE POLICY "Project owners can update projects" ON projects FOR UPDATE USING (owner_id::text = auth.uid()::text);
CREATE POLICY "Project owners can delete projects" ON projects FOR DELETE USING (owner_id::text = auth.uid()::text);

-- Project collaborators policies
CREATE POLICY "Users can view project collaborators" ON project_collaborators FOR SELECT USING (
    user_id::text = auth.uid()::text OR 
    project_id IN (SELECT id FROM projects WHERE owner_id::text = auth.uid()::text)
);
CREATE POLICY "Project owners can manage collaborators" ON project_collaborators FOR ALL USING (
    project_id IN (SELECT id FROM projects WHERE owner_id::text = auth.uid()::text)
);

-- Documents policies
CREATE POLICY "Users can view project documents" ON documents FOR SELECT USING (
    project_id IN (
        SELECT id FROM projects WHERE owner_id::text = auth.uid()::text
        UNION
        SELECT project_id FROM project_collaborators WHERE user_id::text = auth.uid()::text
    )
);
CREATE POLICY "Users can create documents" ON documents FOR INSERT WITH CHECK (
    created_by::text = auth.uid()::text AND
    project_id IN (
        SELECT id FROM projects WHERE owner_id::text = auth.uid()::text
        UNION
        SELECT project_id FROM project_collaborators WHERE user_id::text = auth.uid()::text AND role IN ('owner', 'editor')
    )
);
CREATE POLICY "Users can update own documents" ON documents FOR UPDATE USING (
    created_by::text = auth.uid()::text OR
    project_id IN (SELECT id FROM projects WHERE owner_id::text = auth.uid()::text)
);

-- References policies
CREATE POLICY "Users can view own references" ON references FOR SELECT USING (user_id::text = auth.uid()::text);
CREATE POLICY "Users can create references" ON references FOR INSERT WITH CHECK (user_id::text = auth.uid()::text);
CREATE POLICY "Users can update own references" ON references FOR UPDATE USING (user_id::text = auth.uid()::text);
CREATE POLICY "Users can delete own references" ON references FOR DELETE USING (user_id::text = auth.uid()::text);

-- Milestones policies
CREATE POLICY "Users can view project milestones" ON milestones FOR SELECT USING (
    project_id IN (
        SELECT id FROM projects WHERE owner_id::text = auth.uid()::text
        UNION
        SELECT project_id FROM project_collaborators WHERE user_id::text = auth.uid()::text
    )
);
CREATE POLICY "Users can manage project milestones" ON milestones FOR ALL USING (
    project_id IN (
        SELECT id FROM projects WHERE owner_id::text = auth.uid()::text
        UNION
        SELECT project_id FROM project_collaborators WHERE user_id::text = auth.uid()::text AND role IN ('owner', 'editor')
    )
);

-- Activities policies
CREATE POLICY "Users can view own activities" ON activities FOR SELECT USING (user_id::text = auth.uid()::text);
CREATE POLICY "Users can create activities" ON activities FOR INSERT WITH CHECK (user_id::text = auth.uid()::text);