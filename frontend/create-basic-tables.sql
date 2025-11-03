-- Create basic users table for testing
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    institution VARCHAR(255),
    subscription_type VARCHAR(20) DEFAULT 'free',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create basic projects table
CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(20) DEFAULT 'active',
    progress INTEGER DEFAULT 0,
    owner_id UUID REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert test data
INSERT INTO users (email, first_name, last_name, institution) VALUES
('demo@ncskit.com', 'Demo', 'User', 'NCSKIT University'),
('researcher@ncskit.com', 'Research', 'Scientist', 'Tech Institute'),
('student@ncskit.com', 'Graduate', 'Student', 'State University')
ON CONFLICT (email) DO NOTHING;

-- Insert test projects
INSERT INTO projects (title, description, owner_id) 
SELECT 
    'AI in Healthcare Research',
    'Exploring machine learning applications in medical diagnosis',
    u.id
FROM users u WHERE u.email = 'demo@ncskit.com'
ON CONFLICT DO NOTHING;

INSERT INTO projects (title, description, owner_id)
SELECT 
    'Climate Change Analysis',
    'Statistical analysis of global temperature trends',
    u.id
FROM users u WHERE u.email = 'researcher@ncskit.com'
ON CONFLICT DO NOTHING;