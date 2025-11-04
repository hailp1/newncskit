-- =====================================================
-- NCSKIT SAMPLE PRODUCTION DATA
-- =====================================================
-- This file contains realistic sample data for all tables
-- Ready for production deployment

-- =====================================================
-- 1. BUSINESS DOMAINS DATA
-- =====================================================

INSERT INTO public.business_domains (name, name_vi, description, description_vi, icon, color) VALUES
('Marketing', 'Marketing', 'Marketing and consumer behavior research', 'Nghiên cứu marketing và hành vi người tiêu dùng', 'chart-bar', '#3B82F6'),
('Tourism', 'Du lịch', 'Tourism and hospitality industry research', 'Nghiên cứu ngành du lịch và khách sạn', 'globe-alt', '#10B981'),
('Human Resources', 'Nhân sự', 'Human resource management and organizational behavior', 'Quản lý nhân sự và hành vi tổ chức', 'users', '#8B5CF6'),
('Information Systems', 'Hệ thống thông tin', 'Management information systems and technology adoption', 'Hệ thống thông tin quản lý và chấp nhận công nghệ', 'computer-desktop', '#F59E0B'),
('Finance', 'Tài chính', 'Financial management and investment research', 'Quản lý tài chính và nghiên cứu đầu tư', 'currency-dollar', '#EF4444'),
('Retail', 'Bán lẻ', 'Retail management and consumer shopping behavior', 'Quản lý bán lẻ và hành vi mua sắm', 'shopping-bag', '#EC4899');

-- =====================================================
-- 2. MARKETING MODELS DATA
-- =====================================================

INSERT INTO public.marketing_models (name, name_vi, abbreviation, description, description_vi, category, complexity_level, citation, year_developed, key_authors) VALUES
('Theory of Planned Behavior', 'Lý thuyết Hành vi Có Kế hoạch', 'TPB', 'A theory that links beliefs and behavior, predicting an individual''s intention to engage in a behavior', 'Lý thuyết liên kết niềm tin và hành vi, dự đoán ý định của cá nhân tham gia vào một hành vi', 'Behavioral', 3, 'Ajzen, I. (1991). The theory of planned behavior. Organizational Behavior and Human Decision Processes, 50(2), 179-211.', 1991, ARRAY['Icek Ajzen']),

('Technology Acceptance Model', 'Mô hình Chấp nhận Công nghệ', 'TAM', 'A model that explains how users come to accept and use technology', 'Mô hình giải thích cách người dùng chấp nhận và sử dụng công nghệ', 'Technology', 3, 'Davis, F. D. (1989). Perceived usefulness, perceived ease of use, and user acceptance of information technology. MIS Quarterly, 13(3), 319-340.', 1989, ARRAY['Fred Davis']),

('SERVQUAL Model', 'Mô hình SERVQUAL', 'SERVQUAL', 'A service quality measurement model based on five dimensions', 'Mô hình đo lường chất lượng dịch vụ dựa trên năm thành phần', 'Service Quality', 4, 'Parasuraman, A., Zeithaml, V. A., & Berry, L. L. (1988). SERVQUAL: A multiple-item scale for measuring consumer perceptions of service quality. Journal of Retailing, 64(1), 12-40.', 1988, ARRAY['A. Parasuraman', 'Valarie Zeithaml', 'Leonard Berry']),

('Customer Satisfaction Model', 'Mô hình Sự Hài lòng Khách hàng', 'CSM', 'A model explaining the relationship between customer satisfaction and loyalty', 'Mô hình giải thích mối quan hệ giữa sự hài lòng và lòng trung thành của khách hàng', 'Customer Behavior', 3, 'Oliver, R. L. (1980). A cognitive model of the antecedents and consequences of satisfaction decisions. Journal of Marketing Research, 17(4), 460-469.', 1980, ARRAY['Richard Oliver']),

('Brand Equity Model', 'Mô hình Giá trị Thương hiệu', 'BEM', 'A model measuring brand equity through brand awareness, perceived quality, brand associations, and brand loyalty', 'Mô hình đo lường giá trị thương hiệu thông qua nhận biết thương hiệu, chất lượng cảm nhận, liên tưởng thương hiệu và lòng trung thành', 'Branding', 4, 'Aaker, D. A. (1991). Managing Brand Equity. New York: Free Press.', 1991, ARRAY['David Aaker']),

('E-Service Quality Model', 'Mô hình Chất lượng Dịch vụ Điện tử', 'E-S-QUAL', 'A model for measuring electronic service quality in online environments', 'Mô hình đo lường chất lượng dịch vụ điện tử trong môi trường trực tuyến', 'Digital Service', 4, 'Parasuraman, A., Zeithaml, V. A., & Malhotra, A. (2005). E-S-QUAL: A multiple-item scale for assessing electronic service quality. Journal of Service Research, 7(3), 213-233.', 2005, ARRAY['A. Parasuraman', 'Valarie Zeithaml', 'Arvind Malhotra']);

-- =====================================================
-- 3. RESEARCH VARIABLES DATA
-- =====================================================

-- TPB Variables
INSERT INTO public.research_variables (model_id, name, name_vi, type, description, description_vi, measurement_scale, sample_questions, is_required, order_index) VALUES
(1, 'Attitude', 'Thái độ', 'independent', 'Individual''s positive or negative evaluation of performing the behavior', 'Đánh giá tích cực hoặc tiêu cực của cá nhân về việc thực hiện hành vi', 'Likert 7-point', ARRAY['I think using this product is a good idea', 'Using this product would be pleasant for me'], true, 1),
(1, 'Subjective Norm', 'Chuẩn mực Chủ quan', 'independent', 'Perceived social pressure to perform or not perform the behavior', 'Áp lực xã hội cảm nhận để thực hiện hoặc không thực hiện hành vi', 'Likert 7-point', ARRAY['People important to me think I should use this product', 'Most people who are important to me would approve of my using this product'], true, 2),
(1, 'Perceived Behavioral Control', 'Kiểm soát Hành vi Cảm nhận', 'independent', 'Perceived ease or difficulty of performing the behavior', 'Mức độ dễ dàng hoặc khó khăn cảm nhận khi thực hiện hành vi', 'Likert 7-point', ARRAY['I have complete control over using this product', 'Using this product is entirely within my control'], true, 3),
(1, 'Behavioral Intention', 'Ý định Hành vi', 'dependent', 'Individual''s intention to perform the behavior', 'Ý định của cá nhân thực hiện hành vi', 'Likert 7-point', ARRAY['I intend to use this product in the future', 'I plan to use this product regularly'], true, 4);

-- TAM Variables
INSERT INTO public.research_variables (model_id, name, name_vi, type, description, description_vi, measurement_scale, sample_questions, is_required, order_index) VALUES
(2, 'Perceived Usefulness', 'Tính Hữu ích Cảm nhận', 'independent', 'The degree to which a person believes that using technology would enhance job performance', 'Mức độ mà một người tin rằng việc sử dụng công nghệ sẽ nâng cao hiệu suất công việc', 'Likert 7-point', ARRAY['Using this system would improve my job performance', 'Using this system would increase my productivity'], true, 1),
(2, 'Perceived Ease of Use', 'Tính Dễ sử dụng Cảm nhận', 'independent', 'The degree to which a person believes that using technology would be free of effort', 'Mức độ mà một người tin rằng việc sử dụng công nghệ sẽ không tốn công sức', 'Likert 7-point', ARRAY['Learning to use this system would be easy for me', 'I would find this system easy to use'], true, 2),
(2, 'Attitude Toward Use', 'Thái độ đối với Việc sử dụng', 'mediating', 'User''s positive or negative feelings about using the technology', 'Cảm xúc tích cực hoặc tiêu cực của người dùng về việc sử dụng công nghệ', 'Likert 7-point', ARRAY['Using this system is a good idea', 'Using this system is pleasant'], false, 3),
(2, 'Behavioral Intention to Use', 'Ý định Hành vi Sử dụng', 'dependent', 'User''s intention to use the technology', 'Ý định của người dùng sử dụng công nghệ', 'Likert 7-point', ARRAY['I intend to use this system', 'I plan to use this system regularly'], true, 4);

-- SERVQUAL Variables
INSERT INTO public.research_variables (model_id, name, name_vi, type, description, description_vi, measurement_scale, sample_questions, is_required, order_index) VALUES
(3, 'Tangibles', 'Phương tiện Hữu hình', 'independent', 'Physical facilities, equipment, and appearance of personnel', 'Cơ sở vật chất, thiết bị và diện mạo của nhân viên', 'Likert 7-point', ARRAY['The company has modern-looking equipment', 'The company''s physical facilities are visually appealing'], true, 1),
(3, 'Reliability', 'Độ Tin cậy', 'independent', 'Ability to perform the promised service dependably and accurately', 'Khả năng thực hiện dịch vụ đã hứa một cách đáng tin cậy và chính xác', 'Likert 7-point', ARRAY['The company provides services at the time it promises to do so', 'The company performs the service right the first time'], true, 2),
(3, 'Responsiveness', 'Khả năng Đáp ứng', 'independent', 'Willingness to help customers and provide prompt service', 'Sẵn sàng giúp đỡ khách hàng và cung cấp dịch vụ nhanh chóng', 'Likert 7-point', ARRAY['Employees tell customers exactly when services will be performed', 'Employees give prompt service to customers'], true, 3),
(3, 'Assurance', 'Sự Đảm bảo', 'independent', 'Knowledge and courtesy of employees and their ability to inspire trust', 'Kiến thức và sự lịch sự của nhân viên và khả năng tạo niềm tin', 'Likert 7-point', ARRAY['Employees have the knowledge to answer customer questions', 'The behavior of employees instills confidence in customers'], true, 4),
(3, 'Empathy', 'Sự Đồng cảm', 'independent', 'Caring, individualized attention the firm provides its customers', 'Sự quan tâm, chú ý cá nhân mà công ty dành cho khách hàng', 'Likert 7-point', ARRAY['The company gives customers individual attention', 'Employees understand the specific needs of customers'], true, 5),
(3, 'Service Quality', 'Chất lượng Dịch vụ', 'dependent', 'Overall perception of service quality', 'Nhận thức tổng thể về chất lượng dịch vụ', 'Likert 7-point', ARRAY['Overall, I am satisfied with the service quality', 'The service quality meets my expectations'], true, 6);

-- =====================================================
-- 4. VARIABLE RELATIONSHIPS DATA
-- =====================================================

-- TPB Relationships
INSERT INTO public.variable_relationships (model_id, from_variable_id, to_variable_id, relationship_type, strength, hypothesis_template) VALUES
(1, 1, 4, 'direct', 'strong', 'Attitude has a positive effect on behavioral intention'),
(1, 2, 4, 'direct', 'moderate', 'Subjective norm has a positive effect on behavioral intention'),
(1, 3, 4, 'direct', 'moderate', 'Perceived behavioral control has a positive effect on behavioral intention');

-- TAM Relationships
INSERT INTO public.variable_relationships (model_id, from_variable_id, to_variable_id, relationship_type, strength, hypothesis_template) VALUES
(2, 5, 7, 'direct', 'strong', 'Perceived usefulness has a positive effect on attitude toward use'),
(2, 6, 7, 'direct', 'strong', 'Perceived ease of use has a positive effect on attitude toward use'),
(2, 6, 5, 'direct', 'moderate', 'Perceived ease of use has a positive effect on perceived usefulness'),
(2, 7, 8, 'direct', 'strong', 'Attitude toward use has a positive effect on behavioral intention to use'),
(2, 5, 8, 'direct', 'moderate', 'Perceived usefulness has a positive effect on behavioral intention to use');

-- SERVQUAL Relationships
INSERT INTO public.variable_relationships (model_id, from_variable_id, to_variable_id, relationship_type, strength, hypothesis_template) VALUES
(3, 9, 14, 'direct', 'moderate', 'Tangibles has a positive effect on service quality'),
(3, 10, 14, 'direct', 'strong', 'Reliability has a positive effect on service quality'),
(3, 11, 14, 'direct', 'strong', 'Responsiveness has a positive effect on service quality'),
(3, 12, 14, 'direct', 'strong', 'Assurance has a positive effect on service quality'),
(3, 13, 14, 'direct', 'moderate', 'Empathy has a positive effect on service quality');

-- =====================================================
-- 5. RESEARCH OUTLINE TEMPLATES DATA
-- =====================================================

INSERT INTO public.research_outline_templates (name, name_vi, model_id, business_domain_id, template_type, content_structure, variables_mapping, sample_content) VALUES
('TPB Consumer Behavior Research Template', 'Mẫu Nghiên cứu Hành vi Tiêu dùng TPB', 1, 1, 'thesis', 
'{"chapters": [
  {"title": "Introduction", "title_vi": "Giới thiệu", "sections": ["Background", "Problem Statement", "Objectives", "Significance"]},
  {"title": "Literature Review", "title_vi": "Tổng quan tài liệu", "sections": ["Theoretical Foundation", "Previous Studies", "Research Gap"]},
  {"title": "Methodology", "title_vi": "Phương pháp nghiên cứu", "sections": ["Research Design", "Sample", "Data Collection", "Analysis"]},
  {"title": "Results", "title_vi": "Kết quả", "sections": ["Descriptive Statistics", "Hypothesis Testing", "Model Evaluation"]},
  {"title": "Discussion", "title_vi": "Thảo luận", "sections": ["Findings Interpretation", "Implications", "Limitations", "Future Research"]}
]}',
'{"attitude": "independent_variable_1", "subjective_norm": "independent_variable_2", "pbc": "independent_variable_3", "intention": "dependent_variable"}',
'This template provides a comprehensive structure for consumer behavior research using the Theory of Planned Behavior framework.'),

('TAM Technology Adoption Study', 'Nghiên cứu Chấp nhận Công nghệ TAM', 2, 4, 'journal_article',
'{"sections": [
  {"title": "Abstract", "title_vi": "Tóm tắt", "content": "Research overview and key findings"},
  {"title": "Introduction", "title_vi": "Giới thiệu", "content": "Technology adoption context and research questions"},
  {"title": "Theoretical Framework", "title_vi": "Khung lý thuyết", "content": "TAM model explanation and hypotheses"},
  {"title": "Methodology", "title_vi": "Phương pháp", "content": "Survey design and data collection"},
  {"title": "Results", "title_vi": "Kết quả", "content": "Statistical analysis and findings"},
  {"title": "Discussion and Conclusion", "title_vi": "Thảo luận và Kết luận", "content": "Implications and future research"}
]}',
'{"perceived_usefulness": "key_predictor", "perceived_ease_of_use": "key_predictor", "attitude": "mediator", "intention": "outcome"}',
'Template for technology adoption research using Technology Acceptance Model in organizational contexts.'),

('SERVQUAL Service Quality Assessment', 'Đánh giá Chất lượng Dịch vụ SERVQUAL', 3, 2, 'thesis',
'{"chapters": [
  {"title": "Introduction", "title_vi": "Giới thiệu", "sections": ["Service Industry Context", "Quality Importance", "Research Objectives"]},
  {"title": "Literature Review", "title_vi": "Tổng quan tài liệu", "sections": ["Service Quality Concepts", "SERVQUAL Model", "Industry Applications"]},
  {"title": "Research Methodology", "title_vi": "Phương pháp nghiên cứu", "sections": ["SERVQUAL Instrument", "Sampling Method", "Data Analysis Plan"]},
  {"title": "Findings", "title_vi": "Phát hiện", "sections": ["Service Quality Dimensions", "Gap Analysis", "Customer Satisfaction"]},
  {"title": "Recommendations", "title_vi": "Khuyến nghị", "sections": ["Service Improvements", "Management Implications", "Implementation Strategy"]}
]}',
'{"tangibles": "dimension_1", "reliability": "dimension_2", "responsiveness": "dimension_3", "assurance": "dimension_4", "empathy": "dimension_5"}',
'Comprehensive template for service quality research in hospitality and tourism industries.');

-- =====================================================
-- 6. SURVEY QUESTION TEMPLATES DATA
-- =====================================================

-- TPB Questions
INSERT INTO public.survey_question_templates (variable_id, question_text, question_text_vi, question_type, scale_labels, validation_rules, order_index, source_reference, reliability_alpha) VALUES
(1, 'Using [product/service] is beneficial for me', 'Việc sử dụng [sản phẩm/dịch vụ] có lợi cho tôi', 'likert_7', '{"1": "Strongly Disagree", "7": "Strongly Agree"}', '{"required": true, "min": 1, "max": 7}', 1, 'Ajzen (1991)', 0.89),
(1, 'Using [product/service] is a wise choice', 'Việc sử dụng [sản phẩm/dịch vụ] là một lựa chọn khôn ngoan', 'likert_7', '{"1": "Strongly Disagree", "7": "Strongly Agree"}', '{"required": true, "min": 1, "max": 7}', 2, 'Ajzen (1991)', 0.89),
(2, 'Most people who are important to me think I should use [product/service]', 'Hầu hết những người quan trọng với tôi nghĩ rằng tôi nên sử dụng [sản phẩm/dịch vụ]', 'likert_7', '{"1": "Strongly Disagree", "7": "Strongly Agree"}', '{"required": true, "min": 1, "max": 7}', 1, 'Ajzen (1991)', 0.85),
(3, 'I have complete control over using [product/service]', 'Tôi có toàn quyền kiểm soát việc sử dụng [sản phẩm/dịch vụ]', 'likert_7', '{"1": "Strongly Disagree", "7": "Strongly Agree"}', '{"required": true, "min": 1, "max": 7}', 1, 'Ajzen (1991)', 0.82),
(4, 'I intend to use [product/service] in the future', 'Tôi có ý định sử dụng [sản phẩm/dịch vụ] trong tương lai', 'likert_7', '{"1": "Strongly Disagree", "7": "Strongly Agree"}', '{"required": true, "min": 1, "max": 7}', 1, 'Ajzen (1991)', 0.91);

-- TAM Questions
INSERT INTO public.survey_question_templates (variable_id, question_text, question_text_vi, question_type, scale_labels, validation_rules, order_index, source_reference, reliability_alpha) VALUES
(5, 'Using this system would improve my job performance', 'Việc sử dụng hệ thống này sẽ cải thiện hiệu suất công việc của tôi', 'likert_7', '{"1": "Strongly Disagree", "7": "Strongly Agree"}', '{"required": true, "min": 1, "max": 7}', 1, 'Davis (1989)', 0.94),
(5, 'Using this system would increase my productivity', 'Việc sử dụng hệ thống này sẽ tăng năng suất của tôi', 'likert_7', '{"1": "Strongly Disagree", "7": "Strongly Agree"}', '{"required": true, "min": 1, "max": 7}', 2, 'Davis (1989)', 0.94),
(6, 'Learning to use this system would be easy for me', 'Việc học cách sử dụng hệ thống này sẽ dễ dàng đối với tôi', 'likert_7', '{"1": "Strongly Disagree", "7": "Strongly Agree"}', '{"required": true, "min": 1, "max": 7}', 1, 'Davis (1989)', 0.91),
(8, 'I intend to use this system regularly', 'Tôi có ý định sử dụng hệ thống này thường xuyên', 'likert_7', '{"1": "Strongly Disagree", "7": "Strongly Agree"}', '{"required": true, "min": 1, "max": 7}', 1, 'Davis (1989)', 0.89);

-- =====================================================
-- 7. SAMPLE USERS DATA
-- =====================================================

-- Note: User data will be created through Supabase Auth
-- This is just for reference structure

-- Sample user profiles (to be inserted after user registration)
-- INSERT INTO public.user_profiles (user_id, research_domain, experience_level, preferred_language) VALUES
-- ('user-uuid-1', 'Marketing', 'intermediate', 'vi'),
-- ('user-uuid-2', 'Tourism', 'advanced', 'vi'),
-- ('user-uuid-3', 'Information Systems', 'beginner', 'vi');

-- =====================================================
-- 8. SAMPLE PROJECTS DATA
-- =====================================================

-- Note: These will be inserted with actual user UUIDs after user registration
-- Sample project structure for reference:

/*
INSERT INTO public.projects (id, user_id, title, description, business_domain_id, status, progress, research_type) VALUES
('project-uuid-1', 'user-uuid-1', 'Consumer Adoption of E-commerce Platforms', 'A study examining factors influencing consumer adoption of e-commerce platforms using TPB framework', 1, 'in_progress', 65, 'quantitative'),
('project-uuid-2', 'user-uuid-2', 'Service Quality in Hotel Industry', 'Assessment of service quality dimensions in luxury hotels using SERVQUAL model', 2, 'draft', 30, 'quantitative'),
('project-uuid-3', 'user-uuid-3', 'Technology Acceptance in Remote Work', 'Analysis of factors affecting technology acceptance in remote work environments', 4, 'completed', 100, 'mixed_methods');

-- Sample project models
INSERT INTO public.project_models (project_id, model_id, is_primary) VALUES
('project-uuid-1', 1, true),
('project-uuid-2', 3, true),
('project-uuid-3', 2, true);

-- Sample research hypotheses
INSERT INTO public.research_hypotheses (project_id, hypothesis_number, statement, type, expected_direction) VALUES
('project-uuid-1', 'H1', 'Attitude toward e-commerce platforms positively influences behavioral intention to use', 'main', 'positive'),
('project-uuid-1', 'H2', 'Subjective norm positively influences behavioral intention to use e-commerce platforms', 'main', 'positive'),
('project-uuid-2', 'H1', 'Service reliability positively influences overall service quality perception', 'main', 'positive'),
('project-uuid-3', 'H1', 'Perceived usefulness of remote work technology positively influences usage intention', 'main', 'positive');
*/

-- =====================================================
-- 9. USAGE STATISTICS INITIALIZATION
-- =====================================================

INSERT INTO public.usage_statistics (metric_type, metric_value, additional_data) VALUES
('total_users', 0, '{"description": "Total registered users"}'),
('total_projects', 0, '{"description": "Total research projects created"}'),
('total_outlines_generated', 0, '{"description": "Total AI-generated research outlines"}'),
('most_used_model', 1, '{"model_name": "Theory of Planned Behavior", "usage_count": 0}'),
('avg_project_completion', 0, '{"description": "Average project completion percentage"}');

-- =====================================================
-- DATA INSERTION COMPLETE
-- =====================================================

-- Update template usage counts
UPDATE public.research_outline_templates SET usage_count = 0;

-- Verify data insertion
SELECT 
    'business_domains' as table_name, COUNT(*) as record_count FROM public.business_domains
UNION ALL
SELECT 
    'marketing_models' as table_name, COUNT(*) as record_count FROM public.marketing_models
UNION ALL
SELECT 
    'research_variables' as table_name, COUNT(*) as record_count FROM public.research_variables
UNION ALL
SELECT 
    'variable_relationships' as table_name, COUNT(*) as record_count FROM public.variable_relationships
UNION ALL
SELECT 
    'research_outline_templates' as table_name, COUNT(*) as record_count FROM public.research_outline_templates
UNION ALL
SELECT 
    'survey_question_templates' as table_name, COUNT(*) as record_count FROM public.survey_question_templates;

COMMENT ON TABLE public.business_domains IS 'Sample data loaded: 6 business domains';
COMMENT ON TABLE public.marketing_models IS 'Sample data loaded: 6 marketing models with full details';
COMMENT ON TABLE public.research_variables IS 'Sample data loaded: Variables for TPB, TAM, and SERVQUAL models';
COMMENT ON TABLE public.research_outline_templates IS 'Sample data loaded: 3 comprehensive research templates';