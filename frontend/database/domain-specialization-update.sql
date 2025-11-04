-- Update Database Schema: Domain + Specialization Structure
-- Domain: Kinh tế, Kỹ thuật, Y học, etc.
-- Specialization: Marketing, Management, Finance, etc.

-- 1. Create domains table (high-level fields)
CREATE TABLE IF NOT EXISTS domains (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    icon VARCHAR(50),
    color VARCHAR(20) DEFAULT 'blue',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Create specializations table (specific fields within domains)
CREATE TABLE IF NOT EXISTS specializations (
    id SERIAL PRIMARY KEY,
    domain_id INTEGER REFERENCES domains(id),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    icon VARCHAR(50),
    keywords TEXT[], -- Related keywords for this specialization
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Update projects table to use both domain and specialization
ALTER TABLE projects ADD COLUMN IF NOT EXISTS domain_id INTEGER REFERENCES domains(id);
ALTER TABLE projects ADD COLUMN IF NOT EXISTS specialization_id INTEGER REFERENCES specializations(id);

-- 4. Update marketing_models to reference specializations instead of business_domains
ALTER TABLE marketing_models ADD COLUMN IF NOT EXISTS specialization_id INTEGER REFERENCES specializations(id);

-- 5. Insert domain data
INSERT INTO domains (name, description, icon, color) VALUES
('Kinh tế', 'Các lĩnh vực nghiên cứu kinh tế và kinh doanh', 'chart-bar', 'blue'),
('Kỹ thuật', 'Các lĩnh vực kỹ thuật và công nghệ', 'cog', 'green'),
('Y học', 'Các lĩnh vực y tế và sức khỏe', 'heart', 'red'),
('Giáo dục', 'Các lĩnh vực giáo dục và đào tạo', 'academic-cap', 'purple'),
('Xã hội học', 'Các lĩnh vực xã hội và nhân văn', 'users', 'orange'),
('Khoa học tự nhiên', 'Các lĩnh vực khoa học cơ bản', 'beaker', 'teal');

-- 6. Insert specialization data for Economics domain
INSERT INTO specializations (domain_id, name, description, icon, keywords) VALUES
-- Economics specializations
(1, 'Marketing', 'Nghiên cứu về marketing, quảng cáo và hành vi tiêu dùng', 'megaphone', ARRAY['marketing', 'advertising', 'consumer behavior', 'brand management', 'digital marketing']),
(1, 'Management', 'Nghiên cứu về quản trị doanh nghiệp và lãnh đạo', 'briefcase', ARRAY['management', 'leadership', 'strategy', 'organizational behavior', 'human resources']),
(1, 'Finance', 'Nghiên cứu về tài chính và đầu tư', 'banknotes', ARRAY['finance', 'investment', 'banking', 'financial markets', 'corporate finance']),
(1, 'Accounting', 'Nghiên cứu về kế toán và kiểm toán', 'calculator', ARRAY['accounting', 'auditing', 'financial reporting', 'taxation', 'cost accounting']),
(1, 'Economics', 'Nghiên cứu kinh tế học lý thuyết và ứng dụng', 'chart-line', ARRAY['microeconomics', 'macroeconomics', 'econometrics', 'development economics']),
(1, 'International Business', 'Nghiên cứu về kinh doanh quốc tế', 'globe', ARRAY['international trade', 'global business', 'cross-cultural management', 'export-import']),
(1, 'Entrepreneurship', 'Nghiên cứu về khởi nghiệp và đổi mới', 'light-bulb', ARRAY['startup', 'innovation', 'venture capital', 'business model', 'entrepreneurial finance']),
(1, 'Supply Chain Management', 'Nghiên cứu về quản lý chuỗi cung ứng', 'truck', ARRAY['logistics', 'operations', 'inventory management', 'procurement', 'distribution']),

-- Engineering specializations
(2, 'Software Engineering', 'Nghiên cứu về phát triển phần mềm', 'code', ARRAY['software development', 'programming', 'system design', 'software architecture']),
(2, 'Civil Engineering', 'Nghiên cứu về xây dựng và hạ tầng', 'building', ARRAY['construction', 'infrastructure', 'structural engineering', 'transportation']),
(2, 'Mechanical Engineering', 'Nghiên cứu về cơ khí và chế tạo', 'cog', ARRAY['manufacturing', 'automation', 'robotics', 'mechanical design']),
(2, 'Electrical Engineering', 'Nghiên cứu về điện và điện tử', 'bolt', ARRAY['electronics', 'power systems', 'telecommunications', 'control systems']),

-- Medicine specializations
(3, 'Clinical Medicine', 'Nghiên cứu lâm sàng và điều trị', 'heart', ARRAY['clinical trials', 'patient care', 'diagnosis', 'treatment']),
(3, 'Public Health', 'Nghiên cứu về sức khỏe cộng đồng', 'shield-check', ARRAY['epidemiology', 'health policy', 'disease prevention', 'health promotion']),
(3, 'Biomedical Engineering', 'Nghiên cứu về kỹ thuật y sinh', 'cpu-chip', ARRAY['medical devices', 'biotechnology', 'biomaterials', 'medical imaging']),

-- Education specializations
(4, 'Educational Technology', 'Nghiên cứu về công nghệ giáo dục', 'computer-desktop', ARRAY['e-learning', 'educational software', 'online education', 'learning management systems']),
(4, 'Curriculum Development', 'Nghiên cứu về phát triển chương trình giảng dạy', 'book-open', ARRAY['curriculum design', 'instructional design', 'learning objectives', 'assessment']),
(4, 'Educational Psychology', 'Nghiên cứu về tâm lý học giáo dục', 'brain', ARRAY['learning psychology', 'student motivation', 'cognitive development', 'educational assessment']);

-- 7. Update marketing_models to link with specializations
UPDATE marketing_models SET specialization_id = 1 WHERE category IN ('consumer_behavior', 'brand_management', 'digital_marketing'); -- Marketing
UPDATE marketing_models SET specialization_id = 2 WHERE category IN ('organizational_behavior', 'human_resources'); -- Management
UPDATE marketing_models SET specialization_id = 4 WHERE category = 'technology_adoption'; -- Can be linked to Educational Technology or Software Engineering

-- 8. Create view for easy querying
CREATE OR REPLACE VIEW domain_specialization_view AS
SELECT 
    d.id as domain_id,
    d.name as domain_name,
    d.description as domain_description,
    d.icon as domain_icon,
    d.color as domain_color,
    s.id as specialization_id,
    s.name as specialization_name,
    s.description as specialization_description,
    s.icon as specialization_icon,
    s.keywords as specialization_keywords
FROM domains d
LEFT JOIN specializations s ON d.id = s.domain_id
ORDER BY d.name, s.name;

-- 9. Create function to get specializations by domain
CREATE OR REPLACE FUNCTION get_specializations_by_domain(p_domain_id INTEGER)
RETURNS TABLE(
    id INTEGER,
    name VARCHAR(100),
    description TEXT,
    icon VARCHAR(50),
    keywords TEXT[]
) AS $$
BEGIN
    RETURN QUERY
    SELECT s.id, s.name, s.description, s.icon, s.keywords
    FROM specializations s
    WHERE s.domain_id = p_domain_id
    ORDER BY s.name;
END;
$$ LANGUAGE plpgsql;

-- 10. Create function to get marketing models by specialization
CREATE OR REPLACE FUNCTION get_models_by_specialization(p_specialization_id INTEGER)
RETURNS TABLE(
    id INTEGER,
    name VARCHAR(200),
    description TEXT,
    category VARCHAR(100),
    key_concepts TEXT[],
    applications TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT m.id, m.name, m.description, m.category, m.key_concepts, m.applications
    FROM marketing_models m
    WHERE m.specialization_id = p_specialization_id
    ORDER BY m.name;
END;
$$ LANGUAGE plpgsql;

-- 11. Update demo projects to use new structure
UPDATE projects SET 
    domain_id = 1, -- Economics
    specialization_id = 1 -- Marketing
WHERE id IN ('proj-001', 'proj-004', 'proj-005');

UPDATE projects SET 
    domain_id = 1, -- Economics
    specialization_id = 2 -- Management  
WHERE id = 'proj-002';

UPDATE projects SET 
    domain_id = 2, -- Engineering
    specialization_id = 9 -- Software Engineering
WHERE id = 'proj-003';

-- 12. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_specializations_domain ON specializations(domain_id);
CREATE INDEX IF NOT EXISTS idx_projects_domain_spec ON projects(domain_id, specialization_id);
CREATE INDEX IF NOT EXISTS idx_marketing_models_spec ON marketing_models(specialization_id);

-- Test queries
-- SELECT * FROM domain_specialization_view;
-- SELECT * FROM get_specializations_by_domain(1); -- Economics specializations
-- SELECT * FROM get_models_by_specialization(1); -- Marketing models