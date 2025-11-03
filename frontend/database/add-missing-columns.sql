-- Add missing columns to existing users table
-- This is a patch to add research_domains and other missing columns

-- Add missing columns to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS research_domains TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS research_interests TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS expertise_areas TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS orcid_id VARCHAR(50),
ADD COLUMN IF NOT EXISTS avatar_url TEXT,
ADD COLUMN IF NOT EXISTS preferences JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS user_role VARCHAR(20) DEFAULT 'researcher',
ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active';

-- Add missing columns to projects table  
ALTER TABLE projects
ADD COLUMN IF NOT EXISTS research_domain VARCHAR(100),
ADD COLUMN IF NOT EXISTS keywords TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS phase VARCHAR(20) DEFAULT 'planning',
ADD COLUMN IF NOT EXISTS visibility VARCHAR(20) DEFAULT 'private',
ADD COLUMN IF NOT EXISTS start_date DATE,
ADD COLUMN IF NOT EXISTS end_date DATE;

-- Update existing users with sample research domains
UPDATE users SET research_domains = ARRAY['Computer Science'] WHERE email = 'demo@ncskit.com';
UPDATE users SET research_domains = ARRAY['Data Science', 'Statistics'] WHERE email = 'researcher@ncskit.com';
UPDATE users SET research_domains = ARRAY['Biology'] WHERE email = 'student@ncskit.com';

-- Update existing projects with sample data
UPDATE projects SET 
  research_domain = 'Computer Science',
  keywords = ARRAY['AI', 'healthcare', 'machine learning'],
  phase = 'execution'
WHERE title LIKE '%AI%';

UPDATE projects SET 
  research_domain = 'Environmental Science', 
  keywords = ARRAY['climate', 'data analysis'],
  phase = 'analysis'
WHERE title LIKE '%Climate%';

-- Create institutions table if not exists
CREATE TABLE IF NOT EXISTS institutions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    short_name VARCHAR(50),
    country VARCHAR(100),
    city VARCHAR(100),
    website_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert sample institutions
INSERT INTO institutions (name, short_name, country, city) VALUES
('NCSKIT University', 'NCSKIT', 'Vietnam', 'Ho Chi Minh City'),
('Tech Research Institute', 'TRI', 'Vietnam', 'Hanoi'),
('State University', 'SU', 'Vietnam', 'Da Nang')
ON CONFLICT DO NOTHING;

-- Create milestones table if not exists
CREATE TABLE IF NOT EXISTS milestones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    due_date DATE NOT NULL,
    is_completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create documents table if not exists
CREATE TABLE IF NOT EXISTS documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    title VARCHAR(500) NOT NULL,
    content TEXT DEFAULT '',
    type VARCHAR(50) DEFAULT 'manuscript',
    status VARCHAR(50) DEFAULT 'draft',
    version INTEGER DEFAULT 1,
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create references table if not exists
CREATE TABLE IF NOT EXISTS "references" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    authors JSONB NOT NULL DEFAULT '[]',
    publication_title VARCHAR(500),
    publication_year INTEGER,
    doi VARCHAR(255),
    url TEXT,
    abstract TEXT,
    keywords TEXT[] DEFAULT '{}',
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    tags TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create activities table if not exists
CREATE TABLE IF NOT EXISTS activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    type VARCHAR(50) NOT NULL,
    description TEXT NOT NULL,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert sample milestones
INSERT INTO milestones (project_id, title, description, due_date, is_completed, created_by)
SELECT 
    p.id,
    'Research Planning',
    'Complete initial research planning and methodology',
    CURRENT_DATE + INTERVAL '30 days',
    false,
    p.owner_id
FROM projects p
WHERE NOT EXISTS (SELECT 1 FROM milestones WHERE project_id = p.id)
LIMIT 3;

-- Insert sample documents
INSERT INTO documents (project_id, title, content, created_by)
SELECT 
    p.id,
    p.title || ' - Research Proposal',
    '# ' || p.title || '\n\n## Abstract\n\n' || COALESCE(p.description, 'Research proposal document') || '\n\n## Methodology\n\nTo be completed...',
    p.owner_id
FROM projects p
WHERE NOT EXISTS (SELECT 1 FROM documents WHERE project_id = p.id)
LIMIT 3;

-- Insert sample activities
INSERT INTO activities (user_id, project_id, type, description)
SELECT 
    p.owner_id,
    p.id,
    'project_created',
    'Created project: ' || p.title
FROM projects p
WHERE NOT EXISTS (SELECT 1 FROM activities WHERE project_id = p.id AND type = 'project_created')
LIMIT 3;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_research_domains ON users USING GIN(research_domains);
CREATE INDEX IF NOT EXISTS idx_projects_keywords ON projects USING GIN(keywords);
CREATE INDEX IF NOT EXISTS idx_references_tags ON "references" USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_activities_user_id ON activities(user_id);
CREATE INDEX IF NOT EXISTS idx_activities_project_id ON activities(project_id);

-- Enable Row Level Security on new tables
ALTER TABLE institutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE "references" ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for new tables
CREATE POLICY "Public institutions" ON institutions FOR SELECT USING (true);

CREATE POLICY "Users can view project milestones" ON milestones FOR SELECT USING (
    project_id IN (
        SELECT id FROM projects WHERE owner_id = auth.uid()::text
    )
);

CREATE POLICY "Users can view project documents" ON documents FOR SELECT USING (
    project_id IN (
        SELECT id FROM projects WHERE owner_id = auth.uid()::text
    )
);

CREATE POLICY "Users can view own references" ON "references" FOR SELECT USING (user_id = auth.uid()::text);
CREATE POLICY "Users can manage own references" ON "references" FOR ALL USING (user_id = auth.uid()::text);

CREATE POLICY "Users can view own activities" ON activities FOR SELECT USING (user_id = auth.uid()::text);
CREATE POLICY "Users can create activities" ON activities FOR INSERT WITH CHECK (user_id = auth.uid()::text);

-- Update trigger function for new tables
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create updated_at triggers for new tables
CREATE TRIGGER update_institutions_updated_at BEFORE UPDATE ON institutions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_milestones_updated_at BEFORE UPDATE ON milestones FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON documents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_references_updated_at BEFORE UPDATE ON "references" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();