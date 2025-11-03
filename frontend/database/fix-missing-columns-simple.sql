-- Simple fix for missing columns - No syntax errors
-- Run this in Supabase SQL Editor

-- 1. Add missing columns to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS research_domains TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS orcid_id VARCHAR(50),
ADD COLUMN IF NOT EXISTS avatar_url TEXT,
ADD COLUMN IF NOT EXISTS preferences JSONB DEFAULT '{}';

-- 2. Update existing users with sample data
UPDATE users SET research_domains = ARRAY['Computer Science'] WHERE email = 'demo@ncskit.com';
UPDATE users SET research_domains = ARRAY['Data Science'] WHERE email = 'researcher@ncskit.com';
UPDATE users SET research_domains = ARRAY['Biology'] WHERE email = 'student@ncskit.com';

-- 3. Add missing columns to projects table  
ALTER TABLE projects
ADD COLUMN IF NOT EXISTS keywords TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS research_domain VARCHAR(100);

-- 4. Update existing projects
UPDATE projects SET 
  research_domain = 'Computer Science',
  keywords = ARRAY['AI', 'healthcare']
WHERE title LIKE '%AI%';

UPDATE projects SET 
  research_domain = 'Environmental Science', 
  keywords = ARRAY['climate', 'analysis']
WHERE title LIKE '%Climate%';

-- 5. Create institutions table
CREATE TABLE IF NOT EXISTS institutions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    country VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Insert sample institutions
INSERT INTO institutions (name, country) VALUES
('NCSKIT University', 'Vietnam'),
('Tech Research Institute', 'Vietnam'),
('State University', 'Vietnam')
ON CONFLICT DO NOTHING;

-- 7. Create user_references table (avoid reserved word)
CREATE TABLE IF NOT EXISTS user_references (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    authors JSONB DEFAULT '[]',
    publication_year INTEGER,
    doi VARCHAR(255),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Create milestones table
CREATE TABLE IF NOT EXISTS milestones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    due_date DATE NOT NULL,
    is_completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. Create activities table
CREATE TABLE IF NOT EXISTS activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    activity_type VARCHAR(50) NOT NULL,
    description TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. Insert sample data
INSERT INTO milestones (project_id, title, due_date)
SELECT p.id, 'Research Planning', CURRENT_DATE + INTERVAL '30 days'
FROM projects p
WHERE NOT EXISTS (SELECT 1 FROM milestones WHERE project_id = p.id)
LIMIT 3;

INSERT INTO activities (user_id, project_id, activity_type, description)
SELECT p.owner_id, p.id, 'project_created', 'Created project: ' || p.title
FROM projects p
WHERE NOT EXISTS (SELECT 1 FROM activities WHERE project_id = p.id)
LIMIT 3;

-- 11. Create indexes
CREATE INDEX IF NOT EXISTS idx_users_research_domains ON users USING GIN(research_domains);
CREATE INDEX IF NOT EXISTS idx_projects_keywords ON projects USING GIN(keywords);

-- 12. Enable RLS on new tables
ALTER TABLE institutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_references ENABLE ROW LEVEL SECURITY;
ALTER TABLE milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

-- 13. Create basic RLS policies
CREATE POLICY "Public institutions" ON institutions FOR SELECT USING (true);

CREATE POLICY "Users can view own references" ON user_references 
FOR SELECT USING (user_id = auth.uid()::text);

CREATE POLICY "Users can manage own references" ON user_references 
FOR ALL USING (user_id = auth.uid()::text);

CREATE POLICY "Users can view project milestones" ON milestones 
FOR SELECT USING (
    project_id IN (SELECT id FROM projects WHERE owner_id = auth.uid()::text)
);

CREATE POLICY "Users can view own activities" ON activities 
FOR SELECT USING (user_id = auth.uid()::text);

-- Success message
SELECT 'Database schema updated successfully! Missing columns added.' as result;