-- Insert sample data for development and testing

-- Sample users (these would normally be created through Supabase Auth)
INSERT INTO users (id, email, first_name, last_name, institution, research_domains, subscription_type) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'john.doe@university.edu', 'John', 'Doe', 'University of Research', ARRAY['Computer Science', 'Artificial Intelligence'], 'premium'),
('550e8400-e29b-41d4-a716-446655440002', 'jane.smith@institute.org', 'Jane', 'Smith', 'Research Institute', ARRAY['Medicine', 'Biotechnology'], 'free'),
('550e8400-e29b-41d4-a716-446655440003', 'bob.wilson@college.edu', 'Bob', 'Wilson', 'Science College', ARRAY['Physics', 'Engineering'], 'institutional');

-- Sample projects
INSERT INTO projects (id, title, description, phase, status, progress, owner_id, start_date, end_date) VALUES
('650e8400-e29b-41d4-a716-446655440001', 'Machine Learning Applications in Healthcare', 'Comprehensive study on ML applications for medical diagnosis and treatment optimization', 'writing', 'active', 75, '550e8400-e29b-41d4-a716-446655440001', '2024-01-01', '2024-06-30'),
('650e8400-e29b-41d4-a716-446655440002', 'Sustainable Energy Systems Research', 'Analysis of renewable energy integration in smart grids', 'execution', 'active', 45, '550e8400-e29b-41d4-a716-446655440002', '2024-02-01', '2024-08-31'),
('650e8400-e29b-41d4-a716-446655440003', 'Quantum Computing Algorithms', 'Development of new quantum algorithms for cryptography', 'planning', 'active', 20, '550e8400-e29b-41d4-a716-446655440003', '2024-03-01', '2024-12-31');

-- Sample project collaborators
INSERT INTO project_collaborators (project_id, user_id, role, joined_at) VALUES
('650e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002', 'editor', NOW()),
('650e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001', 'viewer', NOW());

-- Sample documents
INSERT INTO documents (id, project_id, title, content, type, created_by) VALUES
('750e8400-e29b-41d4-a716-446655440001', '650e8400-e29b-41d4-a716-446655440001', 'Main Manuscript', '# Machine Learning in Healthcare\n\n## Abstract\n\nThis paper presents...', 'manuscript', '550e8400-e29b-41d4-a716-446655440001'),
('750e8400-e29b-41d4-a716-446655440002', '650e8400-e29b-41d4-a716-446655440001', 'Research Notes', 'Key findings from literature review...', 'notes', '550e8400-e29b-41d4-a716-446655440001'),
('750e8400-e29b-41d4-a716-446655440003', '650e8400-e29b-41d4-a716-446655440002', 'Energy Analysis', '# Renewable Energy Integration\n\n## Introduction\n\nSmart grids represent...', 'manuscript', '550e8400-e29b-41d4-a716-446655440002');

-- Sample references
INSERT INTO references (id, title, authors, publication, metadata, tags, user_id, project_id) VALUES
('850e8400-e29b-41d4-a716-446655440001', 'Deep Learning for Medical Image Analysis', 
 '[{"firstName": "Alice", "lastName": "Johnson"}, {"firstName": "Bob", "lastName": "Chen"}]',
 '{"journal": "Nature Medicine", "year": 2023, "volume": "29", "issue": "4", "pages": "123-145", "doi": "10.1038/s41591-023-01234-5"}',
 '{"type": "journal", "abstract": "Comprehensive review of deep learning applications...", "keywords": ["deep learning", "medical imaging", "AI"], "citationCount": 156, "impactFactor": 87.241}',
 ARRAY['AI', 'Healthcare', 'Deep Learning'],
 '550e8400-e29b-41d4-a716-446655440001',
 '650e8400-e29b-41d4-a716-446655440001'),

('850e8400-e29b-41d4-a716-446655440002', 'Sustainable Energy Systems: Challenges and Opportunities',
 '[{"firstName": "Carol", "lastName": "Davis"}, {"firstName": "David", "lastName": "Miller"}]',
 '{"journal": "Energy Policy", "year": 2023, "volume": "175", "pages": "113456", "doi": "10.1016/j.enpol.2023.113456"}',
 '{"type": "journal", "abstract": "Analysis of sustainable energy challenges...", "keywords": ["renewable energy", "sustainability", "policy"], "citationCount": 89, "impactFactor": 6.142}',
 ARRAY['Energy', 'Sustainability', 'Policy'],
 '550e8400-e29b-41d4-a716-446655440002',
 '650e8400-e29b-41d4-a716-446655440002');

-- Sample milestones
INSERT INTO milestones (id, project_id, title, description, due_date, completed) VALUES
('950e8400-e29b-41d4-a716-446655440001', '650e8400-e29b-41d4-a716-446655440001', 'Literature Review Complete', 'Finish comprehensive literature review', '2024-02-15', true),
('950e8400-e29b-41d4-a716-446655440002', '650e8400-e29b-41d4-a716-446655440001', 'Data Collection', 'Collect and preprocess medical imaging data', '2024-03-30', true),
('950e8400-e29b-41d4-a716-446655440003', '650e8400-e29b-41d4-a716-446655440001', 'Model Development', 'Develop and train ML models', '2024-05-15', false),
('950e8400-e29b-41d4-a716-446655440004', '650e8400-e29b-41d4-a716-446655440002', 'System Design', 'Complete smart grid system design', '2024-04-30', false);

-- Sample activities
INSERT INTO activities (user_id, project_id, type, description) VALUES
('550e8400-e29b-41d4-a716-446655440001', '650e8400-e29b-41d4-a716-446655440001', 'document_edit', 'Updated methodology section in main manuscript'),
('550e8400-e29b-41d4-a716-446655440001', '650e8400-e29b-41d4-a716-446655440001', 'reference_added', 'Added 5 new references to literature review'),
('550e8400-e29b-41d4-a716-446655440002', '650e8400-e29b-41d4-a716-446655440002', 'milestone_completed', 'Completed initial energy analysis'),
('550e8400-e29b-41d4-a716-446655440001', '650e8400-e29b-41d4-a716-446655440001', 'collaboration', 'Invited Jane Smith as project collaborator');