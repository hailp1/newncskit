-- Marketing Knowledge Base Database
-- Tạo database chứa các mô hình, lý thuyết và biến marketing phổ biến

-- 1. Bảng lĩnh vực kinh tế
CREATE TABLE IF NOT EXISTS business_domains (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    icon VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Bảng mô hình lý thuyết marketing
CREATE TABLE IF NOT EXISTS marketing_models (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    domain_id INTEGER REFERENCES business_domains(id),
    category VARCHAR(100), -- 'consumer_behavior', 'brand_management', 'digital_marketing', etc.
    year_introduced INTEGER,
    authors TEXT,
    key_concepts TEXT[],
    applications TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Bảng biến nghiên cứu
CREATE TABLE IF NOT EXISTS research_variables (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    variable_type VARCHAR(50), -- 'independent', 'dependent', 'mediating', 'moderating'
    measurement_scale VARCHAR(50), -- 'nominal', 'ordinal', 'interval', 'ratio'
    model_id INTEGER REFERENCES marketing_models(id),
    sample_questions TEXT[],
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Bảng mối quan hệ giữa các biến
CREATE TABLE IF NOT EXISTS variable_relationships (
    id SERIAL PRIMARY KEY,
    independent_var_id INTEGER REFERENCES research_variables(id),
    dependent_var_id INTEGER REFERENCES research_variables(id),
    relationship_type VARCHAR(50), -- 'positive', 'negative', 'mediating', 'moderating'
    strength VARCHAR(20), -- 'weak', 'moderate', 'strong'
    evidence_level VARCHAR(20), -- 'theoretical', 'empirical', 'meta_analysis'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Bảng câu hỏi khảo sát mẫu
CREATE TABLE IF NOT EXISTS survey_questions (
    id SERIAL PRIMARY KEY,
    variable_id INTEGER REFERENCES research_variables(id),
    question_text TEXT NOT NULL,
    question_type VARCHAR(50), -- 'likert_5', 'likert_7', 'multiple_choice', 'open_ended'
    scale_labels TEXT[], -- ['Strongly Disagree', 'Disagree', ...]
    is_reverse_coded BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. Cập nhật bảng projects để focus vào kinh tế
ALTER TABLE projects ADD COLUMN IF NOT EXISTS business_domain_id INTEGER REFERENCES business_domains(id);
ALTER TABLE projects ADD COLUMN IF NOT EXISTS selected_models INTEGER[];
ALTER TABLE projects ADD COLUMN IF NOT EXISTS research_outline TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS selected_variables INTEGER[];
ALTER TABLE projects ADD COLUMN IF NOT EXISTS survey_generated BOOLEAN DEFAULT FALSE;

-- Insert dữ liệu mẫu

-- Lĩnh vực kinh tế
INSERT INTO business_domains (name, description, icon) VALUES
('Marketing', 'Nghiên cứu hành vi tiêu dùng, thương hiệu, quảng cáo', 'chart-bar'),
('Du lịch & Khách sạn', 'Nghiên cứu trải nghiệm khách hàng, dịch vụ du lịch', 'map'),
('Nhân sự', 'Nghiên cứu động lực làm việc, văn hóa tổ chức', 'users'),
('Hệ thống thông tin quản lý', 'Nghiên cứu chấp nhận công nghệ, chuyển đổi số', 'computer-desktop'),
('Tài chính & Ngân hàng', 'Nghiên cứu hành vi đầu tư, dịch vụ tài chính', 'banknotes'),
('Bán lẻ & Thương mại điện tử', 'Nghiên cứu mua sắm online, trải nghiệm khách hàng', 'shopping-cart');

-- Mô hình Marketing phổ biến
INSERT INTO marketing_models (name, description, domain_id, category, year_introduced, authors, key_concepts, applications) VALUES
-- Consumer Behavior Models
('Theory of Planned Behavior (TPB)', 'Mô hình dự đoán hành vi dựa trên thái độ, chuẩn mực chủ quan và kiểm soát hành vi', 1, 'consumer_behavior', 1985, 'Icek Ajzen', 
 ARRAY['Attitude', 'Subjective Norm', 'Perceived Behavioral Control', 'Behavioral Intention'], 
 'Dự đoán ý định mua hàng, chấp nhận sản phẩm mới'),

('Technology Acceptance Model (TAM)', 'Mô hình chấp nhận công nghệ dựa trên tính hữu ích và dễ sử dụng', 4, 'technology_adoption', 1989, 'Fred Davis', 
 ARRAY['Perceived Usefulness', 'Perceived Ease of Use', 'Attitude', 'Behavioral Intention'], 
 'Chấp nhận hệ thống thông tin, ứng dụng mobile, e-commerce'),

('SERVQUAL Model', 'Mô hình đo lường chất lượng dịch vụ qua 5 thành phần', 2, 'service_quality', 1988, 'Parasuraman, Zeithaml, Berry', 
 ARRAY['Tangibles', 'Reliability', 'Responsiveness', 'Assurance', 'Empathy'], 
 'Đánh giá chất lượng dịch vụ khách sạn, nhà hàng, ngân hàng'),

('Customer Satisfaction Model', 'Mô hình sự hài lòng khách hàng và ý định tái mua', 1, 'customer_satisfaction', 1980, 'Oliver', 
 ARRAY['Expectation', 'Performance', 'Disconfirmation', 'Satisfaction', 'Repurchase Intention'], 
 'Đo lường sự hài lòng và lòng trung thành khách hàng'),

('Brand Equity Model', 'Mô hình giá trị thương hiệu của Aaker', 1, 'brand_management', 1991, 'David Aaker', 
 ARRAY['Brand Awareness', 'Brand Loyalty', 'Perceived Quality', 'Brand Associations'], 
 'Đánh giá giá trị thương hiệu, chiến lược branding'),

('E-Service Quality (E-S-QUAL)', 'Mô hình chất lượng dịch vụ điện tử', 6, 'digital_service', 2005, 'Parasuraman, Zeithaml, Malhotra', 
 ARRAY['Efficiency', 'System Availability', 'Fulfillment', 'Privacy'], 
 'Đánh giá chất lượng website, ứng dụng thương mại điện tử'),

('Job Characteristics Model', 'Mô hình đặc điểm công việc và động lực làm việc', 3, 'human_resources', 1976, 'Hackman & Oldham', 
 ARRAY['Skill Variety', 'Task Identity', 'Task Significance', 'Autonomy', 'Feedback'], 
 'Thiết kế công việc, động lực nhân viên'),

('Organizational Culture Model', 'Mô hình văn hóa tổ chức của Hofstede', 3, 'organizational_behavior', 1980, 'Geert Hofstede', 
 ARRAY['Power Distance', 'Individualism', 'Masculinity', 'Uncertainty Avoidance'], 
 'Nghiên cứu văn hóa doanh nghiệp, quản lý đa văn hóa');

-- Biến nghiên cứu cho TPB
INSERT INTO research_variables (name, description, variable_type, measurement_scale, model_id, sample_questions) VALUES
('Attitude Toward Behavior', 'Thái độ đối với hành vi', 'independent', 'interval', 1, 
 ARRAY['Tôi nghĩ việc mua sản phẩm này là tốt', 'Tôi có thái độ tích cực với việc mua sản phẩm này']),
('Subjective Norm', 'Chuẩn mực chủ quan', 'independent', 'interval', 1, 
 ARRAY['Những người quan trọng với tôi nghĩ tôi nên mua sản phẩm này', 'Gia đình tôi ủng hộ việc tôi mua sản phẩm này']),
('Perceived Behavioral Control', 'Kiểm soát hành vi cảm nhận', 'independent', 'interval', 1, 
 ARRAY['Tôi có đủ khả năng để mua sản phẩm này', 'Việc mua sản phẩm này hoàn toàn phụ thuộc vào tôi']),
('Behavioral Intention', 'Ý định hành vi', 'dependent', 'interval', 1, 
 ARRAY['Tôi có ý định mua sản phẩm này trong tương lai gần', 'Tôi sẽ cố gắng mua sản phẩm này']);

-- Biến nghiên cứu cho TAM
INSERT INTO research_variables (name, description, variable_type, measurement_scale, model_id, sample_questions) VALUES
('Perceived Usefulness', 'Tính hữu ích cảm nhận', 'independent', 'interval', 2, 
 ARRAY['Sử dụng hệ thống này sẽ cải thiện hiệu suất công việc của tôi', 'Hệ thống này hữu ích cho công việc của tôi']),
('Perceived Ease of Use', 'Tính dễ sử dụng cảm nhận', 'independent', 'interval', 2, 
 ARRAY['Tôi thấy hệ thống này dễ sử dụng', 'Học cách sử dụng hệ thống này rất dễ dàng']),
('Attitude Toward Using', 'Thái độ đối với việc sử dụng', 'mediating', 'interval', 2, 
 ARRAY['Sử dụng hệ thống này là ý tưởng hay', 'Tôi thích sử dụng hệ thống này']),
('Behavioral Intention to Use', 'Ý định sử dụng', 'dependent', 'interval', 2, 
 ARRAY['Tôi có ý định sử dụng hệ thống này thường xuyên', 'Tôi sẽ sử dụng hệ thống này khi có cơ hội']);

-- Biến nghiên cứu cho SERVQUAL
INSERT INTO research_variables (name, description, variable_type, measurement_scale, model_id, sample_questions) VALUES
('Tangibles', 'Phương tiện hữu hình', 'independent', 'interval', 3, 
 ARRAY['Trang thiết bị của công ty này trông hiện đại', 'Cơ sở vật chất của công ty này hấp dẫn về mặt thị giác']),
('Reliability', 'Độ tin cậy', 'independent', 'interval', 3, 
 ARRAY['Công ty này thực hiện dịch vụ đúng từ lần đầu tiên', 'Công ty này cung cấp dịch vụ đúng thời gian như đã hứa']),
('Responsiveness', 'Khả năng đáp ứng', 'independent', 'interval', 3, 
 ARRAY['Nhân viên của công ty này luôn sẵn sàng giúp đỡ khách hàng', 'Nhân viên phản hồi nhanh chóng với yêu cầu của khách hàng']),
('Assurance', 'Sự đảm bảo', 'independent', 'interval', 3, 
 ARRAY['Nhân viên có kiến thức để trả lời câu hỏi của khách hàng', 'Hành vi của nhân viên tạo niềm tin cho khách hàng']),
('Empathy', 'Sự đồng cảm', 'independent', 'interval', 3, 
 ARRAY['Công ty này quan tâm đến từng khách hàng', 'Nhân viên hiểu nhu cầu cụ thể của khách hàng']),
('Service Quality', 'Chất lượng dịch vụ', 'dependent', 'interval', 3, 
 ARRAY['Nhìn chung, chất lượng dịch vụ của công ty này rất tốt', 'Tôi hài lòng với chất lượng dịch vụ của công ty này']);

-- Tạo mối quan hệ giữa các biến
INSERT INTO variable_relationships (independent_var_id, dependent_var_id, relationship_type, strength, evidence_level) VALUES
-- TPB relationships
(1, 4, 'positive', 'strong', 'meta_analysis'), -- Attitude -> Intention
(2, 4, 'positive', 'moderate', 'meta_analysis'), -- Subjective Norm -> Intention  
(3, 4, 'positive', 'strong', 'meta_analysis'), -- PBC -> Intention

-- TAM relationships
(5, 7, 'positive', 'strong', 'meta_analysis'), -- PU -> Attitude
(6, 7, 'positive', 'strong', 'meta_analysis'), -- PEOU -> Attitude
(6, 5, 'positive', 'moderate', 'empirical'), -- PEOU -> PU
(7, 8, 'positive', 'strong', 'meta_analysis'), -- Attitude -> Intention

-- SERVQUAL relationships
(9, 14, 'positive', 'moderate', 'empirical'), -- Tangibles -> Service Quality
(10, 14, 'positive', 'strong', 'meta_analysis'), -- Reliability -> Service Quality
(11, 14, 'positive', 'strong', 'empirical'), -- Responsiveness -> Service Quality
(12, 14, 'positive', 'strong', 'empirical'), -- Assurance -> Service Quality
(13, 14, 'positive', 'strong', 'empirical'); -- Empathy -> Service Quality