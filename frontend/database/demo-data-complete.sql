-- Complete Demo Data for Marketing Research Platform
-- This file creates demo data for dashboard metrics and project management

-- 1. Create additional tables for metrics
CREATE TABLE IF NOT EXISTS user_stats (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    words_written INTEGER DEFAULT 0,
    references_added INTEGER DEFAULT 0,
    projects_completed INTEGER DEFAULT 0,
    total_research_hours INTEGER DEFAULT 0,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS project_documents (
    id SERIAL PRIMARY KEY,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    content TEXT,
    word_count INTEGER DEFAULT 0,
    document_type VARCHAR(50) DEFAULT 'outline', -- 'outline', 'draft', 'final', 'notes'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS project_references (
    id SERIAL PRIMARY KEY,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    title VARCHAR(500) NOT NULL,
    authors TEXT,
    year INTEGER,
    journal VARCHAR(200),
    doi VARCHAR(100),
    url TEXT,
    citation_style VARCHAR(50) DEFAULT 'apa',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS activities (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    activity_type VARCHAR(50) NOT NULL, -- 'project_created', 'outline_generated', 'document_updated', 'reference_added'
    description TEXT NOT NULL,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Update projects table with additional fields
ALTER TABLE projects ADD COLUMN IF NOT EXISTS word_count INTEGER DEFAULT 0;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS reference_count INTEGER DEFAULT 0;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS completion_percentage INTEGER DEFAULT 0;

-- 3. Create demo user (for testing)
INSERT INTO auth.users (id, email, created_at, updated_at) 
VALUES ('demo-user-123', 'demo@ncskit.com', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- 4. Insert demo projects
INSERT INTO projects (
    id, title, description, business_domain_id, selected_models, 
    research_outline, status, progress, owner_id, phase, 
    word_count, reference_count, is_active, completion_percentage,
    created_at, updated_at, last_activity
) VALUES 
-- Active Projects
('proj-001', 
 'Nghiên cứu ảnh hưởng của Social Media Marketing đến hành vi mua hàng của Gen Z', 
 'Nghiên cứu này tập trung vào việc phân tích tác động của các chiến lược marketing trên mạng xã hội đến quyết định mua hàng của thế hệ Z tại Việt Nam.',
 1, ARRAY[1, 2], 
 '{"title": "Social Media Marketing Impact on Gen Z Purchase Behavior", "abstract": "This research examines the influence of social media marketing strategies on Generation Z purchasing decisions in Vietnam.", "hypotheses": ["H1: Social media advertising positively influences Gen Z purchase intention", "H2: Influencer marketing has stronger impact than traditional advertising"]}',
 'in_progress', 75, 'demo-user-123', 'execution',
 2500, 15, true, 75,
 NOW() - INTERVAL '30 days', NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days'),

('proj-002',
 'Đánh giá chất lượng dịch vụ khách sạn thông qua mô hình SERVQUAL',
 'Ứng dụng mô hình SERVQUAL để đánh giá chất lượng dịch vụ tại các khách sạn 4-5 sao ở TP.HCM và đề xuất giải pháp cải thiện.',
 2, ARRAY[3],
 '{"title": "Hotel Service Quality Assessment using SERVQUAL Model", "abstract": "Application of SERVQUAL model to evaluate service quality in 4-5 star hotels in Ho Chi Minh City.", "hypotheses": ["H1: Tangibles significantly affect service quality perception", "H2: Reliability is the most important dimension"]}',
 'in_progress', 60, 'demo-user-123', 'execution',
 1800, 12, true, 60,
 NOW() - INTERVAL '25 days', NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day'),

('proj-003',
 'Nghiên cứu sự chấp nhận công nghệ AI trong giáo dục trực tuyến',
 'Sử dụng mô hình TAM để nghiên cứu các yếu tố ảnh hưởng đến việc chấp nhận và sử dụng công nghệ AI trong giáo dục trực tuyến.',
 4, ARRAY[2],
 '{"title": "AI Technology Acceptance in Online Education", "abstract": "Using TAM model to study factors affecting AI technology acceptance in online education.", "hypotheses": ["H1: Perceived usefulness positively affects AI acceptance", "H2: Perceived ease of use influences attitude toward AI"]}',
 'planning', 40, 'demo-user-123', 'planning',
 1200, 8, true, 40,
 NOW() - INTERVAL '15 days', NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days'),

-- Completed Projects
('proj-004',
 'Phân tích hành vi tiêu dùng thực phẩm organic của người tiêu dùng Việt Nam',
 'Nghiên cứu các yếu tố ảnh hưởng đến ý định mua và hành vi tiêu dùng thực phẩm organic tại thị trường Việt Nam.',
 1, ARRAY[1, 4],
 '{"title": "Organic Food Consumption Behavior in Vietnam", "abstract": "Study of factors influencing organic food purchase intention and consumption behavior in Vietnamese market.", "hypotheses": ["H1: Health consciousness affects organic food purchase", "H2: Price sensitivity moderates the relationship"]}',
 'completed', 100, 'demo-user-123', 'management',
 4500, 25, false, 100,
 NOW() - INTERVAL '90 days', NOW() - INTERVAL '10 days', NOW() - INTERVAL '10 days'),

('proj-005',
 'Đánh giá hiệu quả của Digital Marketing trong ngành du lịch',
 'Nghiên cứu tác động của các kênh digital marketing đến quyết định lựa chọn điểm đến du lịch của khách hàng.',
 2, ARRAY[1, 6],
 '{"title": "Digital Marketing Effectiveness in Tourism Industry", "abstract": "Research on digital marketing channels impact on tourist destination choice decisions.", "hypotheses": ["H1: Social media marketing influences destination choice", "H2: Online reviews affect booking decisions"]}',
 'completed', 100, 'demo-user-123', 'management',
 3800, 20, false, 100,
 NOW() - INTERVAL '120 days', NOW() - INTERVAL '15 days', NOW() - INTERVAL '15 days');

-- 5. Insert demo documents
INSERT INTO project_documents (project_id, title, content, word_count, document_type) VALUES
('proj-001', 'Research Outline', 'Detailed research outline for Social Media Marketing study...', 1200, 'outline'),
('proj-001', 'Literature Review Draft', 'Comprehensive literature review on social media marketing...', 800, 'draft'),
('proj-001', 'Survey Questions', 'Questionnaire for data collection...', 500, 'notes'),

('proj-002', 'SERVQUAL Analysis', 'Analysis of hotel service quality using SERVQUAL dimensions...', 900, 'outline'),
('proj-002', 'Data Collection Plan', 'Methodology for collecting service quality data...', 600, 'notes'),
('proj-002', 'Preliminary Results', 'Initial findings from pilot study...', 300, 'draft'),

('proj-004', 'Final Report', 'Complete research report on organic food consumption...', 4500, 'final'),
('proj-005', 'Digital Marketing Analysis', 'Comprehensive analysis of digital marketing effectiveness...', 3800, 'final');

-- 6. Insert demo references
INSERT INTO project_references (project_id, title, authors, year, journal, doi) VALUES
('proj-001', 'Social Media Marketing: A Literature Review and Directions for Future Research', 'Lamberton, C., & Stephen, A. T.', 2016, 'Journal of Marketing', '10.1509/jm.15.0417'),
('proj-001', 'The Impact of Social Media on Consumer Buying Behavior', 'Hajli, N.', 2014, 'Journal of Business Research', '10.1016/j.jbusres.2013.10.014'),
('proj-001', 'Generation Z and Social Media Marketing', 'Turner, A.', 2015, 'Marketing Research', NULL),

('proj-002', 'SERVQUAL: A Multiple-Item Scale for Measuring Consumer Perceptions of Service Quality', 'Parasuraman, A., Zeithaml, V. A., & Berry, L. L.', 1988, 'Journal of Retailing', NULL),
('proj-002', 'Service Quality in Tourism Industry: A Review', 'Chen, C. F., & Tsai, D.', 2007, 'Tourism Management', '10.1016/j.tourman.2006.02.002'),

('proj-003', 'Technology Acceptance Model: A Literature Review', 'King, W. R., & He, J.', 2006, 'Information & Management', '10.1016/j.im.2005.08.006'),
('proj-003', 'AI in Education: Current Applications and Future Prospects', 'Holmes, W., Bialik, M., & Fadel, C.', 2019, 'Educational Technology Research', NULL),

('proj-004', 'Organic Food Consumption: A Literature Review', 'Rana, J., & Paul, J.', 2017, 'Appetite', '10.1016/j.appet.2017.04.012'),
('proj-004', 'Consumer Behavior towards Organic Food Products', 'Kushwah, S., Dhir, A., & Sagar, M.', 2019, 'Journal of Cleaner Production', '10.1016/j.jclepro.2019.04.017'),

('proj-005', 'Digital Marketing in Tourism: A Review', 'Buhalis, D., & Foerste, M.', 2015, 'Information Technology & Tourism', '10.1007/s40558-014-0022-z');

-- 7. Insert user stats
INSERT INTO user_stats (user_id, words_written, references_added, projects_completed, total_research_hours) VALUES
('demo-user-123', 12800, 65, 2, 240);

-- 8. Insert demo activities
INSERT INTO activities (user_id, project_id, activity_type, description, metadata) VALUES
('demo-user-123', 'proj-001', 'document_updated', 'Updated literature review section', '{"document_type": "draft", "words_added": 200}'),
('demo-user-123', 'proj-002', 'reference_added', 'Added new reference about service quality', '{"reference_title": "Service Quality Measurement"}'),
('demo-user-123', 'proj-003', 'project_created', 'Created new project on AI in education', '{"models_selected": ["TAM"]}'),
('demo-user-123', 'proj-001', 'outline_generated', 'Generated research outline using AI', '{"ai_model": "gemini-2.5-pro"}'),
('demo-user-123', 'proj-002', 'document_updated', 'Updated methodology section', '{"document_type": "outline", "words_added": 150}'),
('demo-user-123', 'proj-004', 'project_completed', 'Completed organic food research project', '{"final_word_count": 4500}'),
('demo-user-123', 'proj-005', 'project_completed', 'Completed digital marketing research', '{"final_word_count": 3800}'),
('demo-user-123', 'proj-001', 'reference_added', 'Added social media marketing reference', '{"reference_count": 15}');

-- 9. Create functions for dashboard metrics
CREATE OR REPLACE FUNCTION get_user_dashboard_stats(p_user_id UUID)
RETURNS TABLE(
    active_projects INTEGER,
    total_words INTEGER,
    total_references INTEGER,
    completed_projects INTEGER,
    recent_activity_count INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        (SELECT COUNT(*)::INTEGER FROM projects WHERE owner_id = p_user_id AND is_active = true),
        (SELECT COALESCE(SUM(word_count), 0)::INTEGER FROM projects WHERE owner_id = p_user_id),
        (SELECT COALESCE(SUM(reference_count), 0)::INTEGER FROM projects WHERE owner_id = p_user_id),
        (SELECT COUNT(*)::INTEGER FROM projects WHERE owner_id = p_user_id AND status = 'completed'),
        (SELECT COUNT(*)::INTEGER FROM activities WHERE user_id = p_user_id AND created_at > NOW() - INTERVAL '7 days');
END;
$$ LANGUAGE plpgsql;

-- 10. Create function to get recent activities
CREATE OR REPLACE FUNCTION get_recent_activities(p_user_id UUID, p_limit INTEGER DEFAULT 10)
RETURNS TABLE(
    id INTEGER,
    activity_type VARCHAR(50),
    description TEXT,
    project_title VARCHAR(200),
    created_at TIMESTAMP,
    metadata JSONB
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        a.id,
        a.activity_type,
        a.description,
        COALESCE(p.title, 'Unknown Project') as project_title,
        a.created_at,
        a.metadata
    FROM activities a
    LEFT JOIN projects p ON a.project_id = p.id
    WHERE a.user_id = p_user_id
    ORDER BY a.created_at DESC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- 11. Create function to get recent projects
CREATE OR REPLACE FUNCTION get_recent_projects(p_user_id UUID, p_limit INTEGER DEFAULT 5)
RETURNS TABLE(
    id UUID,
    title VARCHAR(200),
    status VARCHAR(50),
    progress INTEGER,
    last_activity TIMESTAMP,
    word_count INTEGER,
    reference_count INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        p.title,
        p.status,
        p.progress,
        p.last_activity,
        p.word_count,
        p.reference_count
    FROM projects p
    WHERE p.owner_id = p_user_id
    ORDER BY p.last_activity DESC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- 12. Update word counts and reference counts for existing projects
UPDATE projects SET 
    word_count = (SELECT COALESCE(SUM(word_count), 0) FROM project_documents WHERE project_id = projects.id),
    reference_count = (SELECT COUNT(*) FROM project_references WHERE project_id = projects.id)
WHERE owner_id = 'demo-user-123';

-- 13. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_projects_owner_active ON projects(owner_id, is_active);
CREATE INDEX IF NOT EXISTS idx_activities_user_date ON activities(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_projects_last_activity ON projects(owner_id, last_activity DESC);

-- 14. Insert some additional recent activities for better demo
INSERT INTO activities (user_id, project_id, activity_type, description, created_at) VALUES
('demo-user-123', 'proj-001', 'document_updated', 'Added new section to literature review', NOW() - INTERVAL '2 hours'),
('demo-user-123', 'proj-002', 'reference_added', 'Added reference about hotel service quality', NOW() - INTERVAL '5 hours'),
('demo-user-123', 'proj-003', 'outline_generated', 'Generated AI-powered research outline', NOW() - INTERVAL '1 day'),
('demo-user-123', 'proj-001', 'reference_added', 'Added social media marketing study reference', NOW() - INTERVAL '2 days'),
('demo-user-123', 'proj-002', 'document_updated', 'Updated methodology section', NOW() - INTERVAL '3 days');

-- Test the functions
-- SELECT * FROM get_user_dashboard_stats('demo-user-123');
-- SELECT * FROM get_recent_activities('demo-user-123', 5);
-- SELECT * FROM get_recent_projects('demo-user-123', 3);