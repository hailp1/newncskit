-- Master Migration Script for Workflow Restructure
-- Date: 2024-11-05
-- Description: Runs all migrations for enhanced project structure in correct order

-- Ensure we're connected to the correct database
\c ncskit;

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Run migrations in order
\i frontend/database/migrations/001-enhance-project-structure.sql
\i frontend/database/migrations/002-create-survey-campaigns.sql  
\i frontend/database/migrations/003-create-question-bank.sql
\i frontend/database/migrations/004-create-progress-tracking.sql

-- Create a migration tracking table to keep track of applied migrations
CREATE TABLE IF NOT EXISTS schema_migrations (
    id SERIAL PRIMARY KEY,
    migration_name VARCHAR(255) NOT NULL UNIQUE,
    applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    checksum VARCHAR(64)
);

-- Record the applied migrations
INSERT INTO schema_migrations (migration_name) VALUES 
    ('001-enhance-project-structure'),
    ('002-create-survey-campaigns'),
    ('003-create-question-bank'),
    ('004-create-progress-tracking')
ON CONFLICT (migration_name) DO NOTHING;

-- Create some sample data for question bank to get started
INSERT INTO question_bank (
    text, 
    text_vi,
    type, 
    theoretical_model, 
    research_variable, 
    construct, 
    source,
    reliability,
    tags,
    category,
    scale
) VALUES 
-- TAM (Technology Acceptance Model) Questions
(
    'I find the system useful in my job',
    'Tôi thấy hệ thống này hữu ích trong công việc của mình',
    'likert',
    'Technology Acceptance Model',
    'Perceived Usefulness',
    'Usefulness',
    'Davis, F. D. (1989). Perceived usefulness, perceived ease of use, and user acceptance of information technology',
    0.97,
    ARRAY['technology', 'usefulness', 'tam'],
    'Technology Adoption',
    '{"min": 1, "max": 7, "labels": ["Strongly Disagree", "Disagree", "Somewhat Disagree", "Neutral", "Somewhat Agree", "Agree", "Strongly Agree"]}'::jsonb
),
(
    'Using the system enables me to accomplish tasks more quickly',
    'Việc sử dụng hệ thống giúp tôi hoàn thành công việc nhanh hơn',
    'likert',
    'Technology Acceptance Model',
    'Perceived Usefulness',
    'Efficiency',
    'Davis, F. D. (1989). Perceived usefulness, perceived ease of use, and user acceptance of information technology',
    0.91,
    ARRAY['technology', 'efficiency', 'tam'],
    'Technology Adoption',
    '{"min": 1, "max": 7, "labels": ["Strongly Disagree", "Disagree", "Somewhat Disagree", "Neutral", "Somewhat Agree", "Agree", "Strongly Agree"]}'::jsonb
),
(
    'I find the system easy to use',
    'Tôi thấy hệ thống này dễ sử dụng',
    'likert',
    'Technology Acceptance Model',
    'Perceived Ease of Use',
    'Ease of Use',
    'Davis, F. D. (1989). Perceived usefulness, perceived ease of use, and user acceptance of information technology',
    0.94,
    ARRAY['technology', 'ease-of-use', 'tam'],
    'Technology Adoption',
    '{"min": 1, "max": 7, "labels": ["Strongly Disagree", "Disagree", "Somewhat Disagree", "Neutral", "Somewhat Agree", "Agree", "Strongly Agree"]}'::jsonb
),

-- TPB (Theory of Planned Behavior) Questions
(
    'I intend to use this product/service in the future',
    'Tôi có ý định sử dụng sản phẩm/dịch vụ này trong tương lai',
    'likert',
    'Theory of Planned Behavior',
    'Behavioral Intention',
    'Intention',
    'Ajzen, I. (1991). The theory of planned behavior',
    0.89,
    ARRAY['behavior', 'intention', 'tpb'],
    'Behavioral Theory',
    '{"min": 1, "max": 7, "labels": ["Strongly Disagree", "Disagree", "Somewhat Disagree", "Neutral", "Somewhat Agree", "Agree", "Strongly Agree"]}'::jsonb
),
(
    'Most people who are important to me think I should use this product/service',
    'Hầu hết những người quan trọng với tôi nghĩ rằng tôi nên sử dụng sản phẩm/dịch vụ này',
    'likert',
    'Theory of Planned Behavior',
    'Subjective Norm',
    'Social Influence',
    'Ajzen, I. (1991). The theory of planned behavior',
    0.82,
    ARRAY['behavior', 'social-norm', 'tpb'],
    'Behavioral Theory',
    '{"min": 1, "max": 7, "labels": ["Strongly Disagree", "Disagree", "Somewhat Disagree", "Neutral", "Somewhat Agree", "Agree", "Strongly Agree"]}'::jsonb
),

-- SERVQUAL Questions
(
    'The service provider has modern-looking equipment',
    'Nhà cung cấp dịch vụ có thiết bị trông hiện đại',
    'likert',
    'Service Quality Model',
    'Tangibles',
    'Physical Facilities',
    'Parasuraman, A., Zeithaml, V. A., & Berry, L. L. (1988). SERVQUAL: A multiple-item scale for measuring consumer perceptions of service quality',
    0.72,
    ARRAY['service-quality', 'tangibles', 'servqual'],
    'Service Management',
    '{"min": 1, "max": 7, "labels": ["Strongly Disagree", "Disagree", "Somewhat Disagree", "Neutral", "Somewhat Agree", "Agree", "Strongly Agree"]}'::jsonb
),
(
    'The service provider is dependable',
    'Nhà cung cấp dịch vụ đáng tin cậy',
    'likert',
    'Service Quality Model',
    'Reliability',
    'Dependability',
    'Parasuraman, A., Zeithaml, V. A., & Berry, L. L. (1988). SERVQUAL: A multiple-item scale for measuring consumer perceptions of service quality',
    0.83,
    ARRAY['service-quality', 'reliability', 'servqual'],
    'Service Management',
    '{"min": 1, "max": 7, "labels": ["Strongly Disagree", "Disagree", "Somewhat Disagree", "Neutral", "Somewhat Agree", "Agree", "Strongly Agree"]}'::jsonb
)
ON CONFLICT DO NOTHING;

-- Create default progress tracking milestones template
INSERT INTO progress_tracking (
    project_id,
    milestone_name,
    milestone_description,
    milestone_type,
    order_index
) 
SELECT 
    p.id,
    milestone_data.name,
    milestone_data.description,
    milestone_data.type::milestone_type,
    milestone_data.order_idx
FROM projects p
CROSS JOIN (
    VALUES 
        ('Hoàn tất ý tưởng', 'Complete initial research idea and problem definition', 'research_planning', 1),
        ('Hoàn tất khung lý thuyết mô hình và biến', 'Complete theoretical framework, models and variable definitions', 'theoretical_framework', 2),
        ('Hoàn tất bản survey và bảng hỏi định tính', 'Complete survey design and qualitative questionnaire', 'survey_design', 3),
        ('Hoàn tất thu thập số liệu survey/kết quả hỏi', 'Complete data collection from surveys and interviews', 'data_collection', 4),
        ('Hoàn tất chạy phân tích các chỉ số định tính', 'Complete quantitative analysis and statistical tests', 'data_analysis', 5),
        ('Hoàn tất nội dung bài sơ lượt', 'Complete initial draft of manuscript', 'writing', 6),
        ('Hoàn tất bài với đầy đủ trích dẫn', 'Complete manuscript with full citations', 'writing', 7),
        ('Hoàn tất định dạng bài đúng chuẩn quốc tế', 'Complete manuscript formatting to international standards', 'review', 8),
        ('Hoàn tất quyết đạo văn', 'Complete plagiarism check and final review', 'review', 9),
        ('Đã submit kèm trạng thái', 'Submitted to journal with status tracking', 'submission', 10),
        ('Đã công bố kèm link', 'Published with publication link', 'publication', 11)
) AS milestone_data(name, description, type, order_idx)
WHERE NOT EXISTS (
    SELECT 1 FROM progress_tracking pt WHERE pt.project_id = p.id
)
ON CONFLICT DO NOTHING;

COMMIT;

-- Display summary of created objects
SELECT 'Migration completed successfully. Created:' as status;
SELECT 'Enhanced projects table with research_design, data_collection, progress_tracking, publication_info columns' as enhancement;
SELECT 'Created survey_campaigns table for campaign management' as table_created;
SELECT 'Created question_bank table with sample questions' as table_created;  
SELECT 'Created progress_tracking and timeline_events tables' as table_created;
SELECT COUNT(*) || ' sample questions added to question bank' as sample_data FROM question_bank;
SELECT COUNT(*) || ' projects now have default milestone templates' as milestone_data FROM progress_tracking;