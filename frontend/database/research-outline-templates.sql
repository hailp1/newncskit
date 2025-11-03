-- Research Outline Templates Database
-- Tạo templates sẵn cho các mô hình để tiết kiệm token Gemini

-- 1. Bảng templates đề cương nghiên cứu
CREATE TABLE IF NOT EXISTS research_outline_templates (
    id SERIAL PRIMARY KEY,
    model_id INTEGER REFERENCES marketing_models(id),
    business_domain_id INTEGER REFERENCES business_domains(id),
    template_name VARCHAR(200) NOT NULL,
    
    -- Template sections
    title_template TEXT,
    abstract_template TEXT,
    introduction_template TEXT,
    literature_review_template TEXT,
    theoretical_framework_template TEXT,
    methodology_template TEXT,
    expected_results_template TEXT,
    implications_template TEXT,
    
    -- Hypotheses templates
    hypotheses_templates TEXT[], -- Array of hypothesis templates
    
    -- Variables and questions
    suggested_variables JSONB, -- JSON array of variables with questions
    
    -- References
    reference_templates TEXT[],
    
    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Bảng hypothesis templates
CREATE TABLE IF NOT EXISTS hypothesis_templates (
    id SERIAL PRIMARY KEY,
    model_id INTEGER REFERENCES marketing_models(id),
    hypothesis_text TEXT NOT NULL,
    independent_variable VARCHAR(200),
    dependent_variable VARCHAR(200),
    relationship_type VARCHAR(50), -- 'positive', 'negative', 'mediating', 'moderating'
    explanation TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Bảng survey question templates
CREATE TABLE IF NOT EXISTS survey_question_templates (
    id SERIAL PRIMARY KEY,
    variable_id INTEGER REFERENCES research_variables(id),
    question_text TEXT NOT NULL,
    question_type VARCHAR(50) DEFAULT 'likert_5',
    scale_labels TEXT[] DEFAULT ARRAY['Hoàn toàn không đồng ý', 'Không đồng ý', 'Trung lập', 'Đồng ý', 'Hoàn toàn đồng ý'],
    is_reverse_coded BOOLEAN DEFAULT FALSE,
    usage_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert templates cho TPB Model
INSERT INTO research_outline_templates (
    model_id, business_domain_id, template_name,
    title_template, abstract_template, introduction_template,
    literature_review_template, theoretical_framework_template,
    methodology_template, expected_results_template, implications_template,
    hypotheses_templates, suggested_variables, reference_templates
) VALUES (
    1, 1, 'TPB Marketing Template',
    
    'Nghiên cứu ảnh hưởng của [FACTORS] đến ý định [BEHAVIOR] của [TARGET_GROUP] dựa trên Lý thuyết Hành vi Có Kế hoạch',
    
    'Nghiên cứu này áp dụng Lý thuyết Hành vi Có Kế hoạch (Theory of Planned Behavior - TPB) để tìm hiểu các yếu tố ảnh hưởng đến ý định [BEHAVIOR] của [TARGET_GROUP]. Mô hình TPB cho rằng ý định hành vi được quyết định bởi ba yếu tố chính: thái độ đối với hành vi, chuẩn mực chủ quan và kiểm soát hành vi cảm nhận. Nghiên cứu sử dụng phương pháp định lượng với mẫu [SAMPLE_SIZE] [TARGET_GROUP] tại [LOCATION]. Kết quả nghiên cứu sẽ cung cấp hiểu biết sâu sắc về động lực [BEHAVIOR] và đề xuất các chiến lược marketing hiệu quả.',
    
    'Trong bối cảnh [CONTEXT], việc hiểu rõ các yếu tố ảnh hưởng đến ý định [BEHAVIOR] của [TARGET_GROUP] trở nên quan trọng. [PROBLEM_STATEMENT]. Nghiên cứu này nhằm khám phá mối quan hệ giữa thái độ, chuẩn mực xã hội, kiểm soát hành vi và ý định [BEHAVIOR], từ đó đưa ra những khuyến nghị thực tiễn cho [STAKEHOLDERS].',
    
    'Các nghiên cứu trước đây đã chứng minh hiệu quả của mô hình TPB trong dự đoán ý định hành vi trong nhiều lĩnh vực khác nhau. [LITERATURE_REVIEW_CONTENT]. Tuy nhiên, vẫn còn khoảng trống nghiên cứu về [RESEARCH_GAP] trong bối cảnh [SPECIFIC_CONTEXT].',
    
    'Lý thuyết Hành vi Có Kế hoạch (Ajzen, 1985) là một trong những mô hình được sử dụng rộng rãi nhất để dự đoán và giải thích hành vi con người. Theo TPB, ý định hành vi được quyết định bởi ba yếu tố: (1) Thái độ đối với hành vi - đánh giá tích cực hay tiêu cực về việc thực hiện hành vi; (2) Chuẩn mực chủ quan - áp lực xã hội cảm nhận để thực hiện hay không thực hiện hành vi; (3) Kiểm soát hành vi cảm nhận - nhận thức về khả năng kiểm soát việc thực hiện hành vi.',
    
    'Nghiên cứu sử dụng phương pháp định lượng với thiết kế nghiên cứu mô tả tương quan. Mẫu nghiên cứu gồm [SAMPLE_SIZE] [TARGET_GROUP] được chọn bằng phương pháp [SAMPLING_METHOD]. Dữ liệu được thu thập thông qua bảng câu hỏi khảo sát trực tuyến với các thang đo đã được kiểm định. Phương pháp phân tích bao gồm thống kê mô tả, phân tích tương quan và mô hình cấu trúc tuyến tính (SEM).',
    
    'Kết quả nghiên cứu dự kiến sẽ xác định được mức độ ảnh hưởng của từng yếu tố trong mô hình TPB đến ý định [BEHAVIOR]. Nghiên cứu cũng có thể phát hiện ra các yếu tố điều tiết hoặc trung gian trong mối quan hệ này, góp phần làm phong phú thêm lý thuyết TPB trong bối cảnh [SPECIFIC_CONTEXT].',
    
    'Về mặt lý thuyết, nghiên cứu góp phần mở rộng và kiểm định mô hình TPB trong bối cảnh [CONTEXT]. Về mặt thực tiễn, kết quả nghiên cứu cung cấp cơ sở khoa học cho [STAKEHOLDERS] trong việc xây dựng các chiến lược [STRATEGY_TYPE] hiệu quả, tập trung vào các yếu tố có ảnh hưởng mạnh nhất đến ý định [BEHAVIOR].',
    
    ARRAY[
        'H1: Thái độ đối với [BEHAVIOR] có ảnh hưởng tích cực đến ý định [BEHAVIOR] của [TARGET_GROUP]',
        'H2: Chuẩn mực chủ quan có ảnh hưởng tích cực đến ý định [BEHAVIOR] của [TARGET_GROUP]', 
        'H3: Kiểm soát hành vi cảm nhận có ảnh hưởng tích cực đến ý định [BEHAVIOR] của [TARGET_GROUP]',
        'H4: Thái độ đối với [BEHAVIOR] có ảnh hưởng mạnh nhất đến ý định [BEHAVIOR] so với các yếu tố khác'
    ],
    
    '[
        {
            "name": "Thái độ đối với hành vi",
            "type": "independent",
            "description": "Đánh giá tích cực hay tiêu cực của cá nhân về việc thực hiện hành vi",
            "questions": [
                "Tôi nghĩ [BEHAVIOR] là một ý tưởng tốt",
                "Tôi có thái độ tích cực với việc [BEHAVIOR]",
                "[BEHAVIOR] sẽ mang lại lợi ích cho tôi",
                "Tôi thích [BEHAVIOR]"
            ]
        },
        {
            "name": "Chuẩn mực chủ quan", 
            "type": "independent",
            "description": "Áp lực xã hội cảm nhận để thực hiện hành vi",
            "questions": [
                "Những người quan trọng với tôi nghĩ tôi nên [BEHAVIOR]",
                "Gia đình tôi ủng hộ việc tôi [BEHAVIOR]",
                "Bạn bè của tôi khuyến khích tôi [BEHAVIOR]",
                "Xã hội mong đợi tôi [BEHAVIOR]"
            ]
        },
        {
            "name": "Kiểm soát hành vi cảm nhận",
            "type": "independent", 
            "description": "Nhận thức về khả năng kiểm soát việc thực hiện hành vi",
            "questions": [
                "Tôi có đủ khả năng để [BEHAVIOR]",
                "Việc [BEHAVIOR] hoàn toàn phụ thuộc vào tôi",
                "Tôi tự tin có thể [BEHAVIOR] nếu muốn",
                "Tôi có đủ tài nguyên để [BEHAVIOR]"
            ]
        },
        {
            "name": "Ý định hành vi",
            "type": "dependent",
            "description": "Ý định thực hiện hành vi trong tương lai",
            "questions": [
                "Tôi có ý định [BEHAVIOR] trong tương lai gần",
                "Tôi sẽ cố gắng [BEHAVIOR]",
                "Tôi dự định [BEHAVIOR] trong [TIME_FRAME]",
                "Khả năng tôi [BEHAVIOR] là rất cao"
            ]
        }
    ]'::jsonb,
    
    ARRAY[
        'Ajzen, I. (1985). From intentions to actions: A theory of planned behavior. In J. Kuhl & J. Beckmann (Eds.), Action control: From cognition to behavior (pp. 11-39). Springer.',
        'Ajzen, I. (1991). The theory of planned behavior. Organizational Behavior and Human Decision Processes, 50(2), 179-211.',
        'Fishbein, M., & Ajzen, I. (2010). Predicting and changing behavior: The reasoned action approach. Psychology Press.',
        'Armitage, C. J., & Conner, M. (2001). Efficacy of the theory of planned behaviour: A meta‐analytic review. British Journal of Social Psychology, 40(4), 471-499.'
    ]
);

-- Insert templates cho TAM Model  
INSERT INTO research_outline_templates (
    model_id, business_domain_id, template_name,
    title_template, abstract_template, introduction_template,
    literature_review_template, theoretical_framework_template,
    methodology_template, expected_results_template, implications_template,
    hypotheses_templates, suggested_variables, reference_templates
) VALUES (
    2, 4, 'TAM Technology Adoption Template',
    
    'Nghiên cứu các yếu tố ảnh hưởng đến việc chấp nhận [TECHNOLOGY] của [TARGET_GROUP] dựa trên Mô hình Chấp nhận Công nghệ',
    
    'Nghiên cứu này áp dụng Mô hình Chấp nhận Công nghệ (Technology Acceptance Model - TAM) để tìm hiểu các yếu tố ảnh hưởng đến việc chấp nhận [TECHNOLOGY] của [TARGET_GROUP]. TAM cho rằng việc chấp nhận công nghệ được quyết định bởi tính hữu ích cảm nhận và tính dễ sử dụng cảm nhận. Nghiên cứu sử dụng phương pháp định lượng với [SAMPLE_SIZE] người tham gia. Kết quả sẽ cung cấp hiểu biết về động lực chấp nhận công nghệ và đề xuất cải thiện trải nghiệm người dùng.',
    
    'Trong thời đại số hóa, việc chấp nhận công nghệ mới trở thành yếu tố quan trọng quyết định thành công của các sản phẩm và dịch vụ. [TECHNOLOGY_CONTEXT]. Nghiên cứu này nhằm hiểu rõ các yếu tố ảnh hưởng đến quyết định sử dụng [TECHNOLOGY] của [TARGET_GROUP].',
    
    'Mô hình TAM đã được nghiên cứu rộng rãi trong nhiều lĩnh vực công nghệ khác nhau. [TAM_LITERATURE]. Tuy nhiên, cần có thêm nghiên cứu về [TECHNOLOGY] trong bối cảnh [SPECIFIC_CONTEXT] để hiểu rõ hơn về hành vi chấp nhận công nghệ.',
    
    'Mô hình Chấp nhận Công nghệ (Davis, 1989) dựa trên Lý thuyết Hành động Hợp lý để giải thích hành vi chấp nhận công nghệ. TAM đề xuất hai yếu tố chính: (1) Tính hữu ích cảm nhận - mức độ người dùng tin rằng công nghệ sẽ cải thiện hiệu suất công việc; (2) Tính dễ sử dụng cảm nhận - mức độ người dùng tin rằng việc sử dụng công nghệ không đòi hỏi nhiều nỗ lực.',
    
    'Nghiên cứu sử dụng phương pháp định lượng với thiết kế khảo sát cắt ngang. Mẫu nghiên cứu bao gồm [SAMPLE_SIZE] [TARGET_GROUP] có kinh nghiệm sử dụng [TECHNOLOGY]. Dữ liệu được thu thập qua bảng câu hỏi trực tuyến và phân tích bằng PLS-SEM.',
    
    'Nghiên cứu dự kiến sẽ xác định được mức độ ảnh hưởng của tính hữu ích và tính dễ sử dụng đến thái độ và ý định sử dụng [TECHNOLOGY]. Kết quả có thể phát hiện thêm các yếu tố điều tiết như kinh nghiệm sử dụng, độ tuổi, hoặc trình độ công nghệ.',
    
    'Nghiên cứu góp phần mở rộng lý thuyết TAM trong bối cảnh [TECHNOLOGY]. Về mặt thực tiễn, kết quả giúp các nhà phát triển cải thiện thiết kế giao diện và trải nghiệm người dùng, tăng tỷ lệ chấp nhận công nghệ.',
    
    ARRAY[
        'H1: Tính hữu ích cảm nhận có ảnh hưởng tích cực đến thái độ sử dụng [TECHNOLOGY]',
        'H2: Tính dễ sử dụng cảm nhận có ảnh hưởng tích cực đến thái độ sử dụng [TECHNOLOGY]',
        'H3: Tính dễ sử dụng cảm nhận có ảnh hưởng tích cực đến tính hữu ích cảm nhận',
        'H4: Thái độ sử dụng có ảnh hưởng tích cực đến ý định sử dụng [TECHNOLOGY]'
    ],
    
    '[
        {
            "name": "Tính hữu ích cảm nhận",
            "type": "independent",
            "description": "Mức độ người dùng tin rằng công nghệ sẽ cải thiện hiệu suất",
            "questions": [
                "Sử dụng [TECHNOLOGY] sẽ cải thiện hiệu suất công việc của tôi",
                "[TECHNOLOGY] hữu ích cho công việc của tôi", 
                "[TECHNOLOGY] giúp tôi hoàn thành công việc nhanh hơn",
                "[TECHNOLOGY] tăng năng suất làm việc của tôi"
            ]
        },
        {
            "name": "Tính dễ sử dụng cảm nhận",
            "type": "independent", 
            "description": "Mức độ người dùng tin rằng việc sử dụng không đòi hỏi nhiều nỗ lực",
            "questions": [
                "Tôi thấy [TECHNOLOGY] dễ sử dụng",
                "Học cách sử dụng [TECHNOLOGY] rất dễ dàng",
                "Tương tác với [TECHNOLOGY] rõ ràng và dễ hiểu", 
                "Tôi có thể thành thạo [TECHNOLOGY] một cách dễ dàng"
            ]
        },
        {
            "name": "Thái độ sử dụng",
            "type": "mediating",
            "description": "Cảm xúc tích cực hay tiêu cực về việc sử dụng công nghệ",
            "questions": [
                "Sử dụng [TECHNOLOGY] là ý tưởng hay",
                "Tôi thích sử dụng [TECHNOLOGY]",
                "Làm việc với [TECHNOLOGY] thú vị",
                "Sử dụng [TECHNOLOGY] mang lại cảm giác tích cực"
            ]
        },
        {
            "name": "Ý định sử dụng",
            "type": "dependent",
            "description": "Ý định tiếp tục sử dụng công nghệ trong tương lai",
            "questions": [
                "Tôi có ý định sử dụng [TECHNOLOGY] thường xuyên",
                "Tôi sẽ sử dụng [TECHNOLOGY] khi có cơ hội",
                "Tôi dự định tiếp tục sử dụng [TECHNOLOGY]",
                "Tôi sẽ khuyến khích người khác sử dụng [TECHNOLOGY]"
            ]
        }
    ]'::jsonb,
    
    ARRAY[
        'Davis, F. D. (1989). Perceived usefulness, perceived ease of use, and user acceptance of information technology. MIS Quarterly, 13(3), 319-340.',
        'Venkatesh, V., & Davis, F. D. (2000). A theoretical extension of the technology acceptance model: Four longitudinal field studies. Management Science, 46(2), 186-204.',
        'King, W. R., & He, J. (2006). A meta-analysis of the technology acceptance model. Information & Management, 43(6), 740-755.',
        'Marangunić, N., & Granić, A. (2015). Technology acceptance model: A literature review from 1986 to 2013. Universal Access in the Information Society, 14(1), 81-95.'
    ]
);

-- Insert hypothesis templates
INSERT INTO hypothesis_templates (model_id, hypothesis_text, independent_variable, dependent_variable, relationship_type, explanation) VALUES
(1, 'Thái độ đối với [BEHAVIOR] có ảnh hưởng tích cực đến ý định [BEHAVIOR]', 'Attitude', 'Behavioral Intention', 'positive', 'Khi cá nhân có thái độ tích cực về một hành vi, họ có xu hướng có ý định cao hơn để thực hiện hành vi đó'),
(1, 'Chuẩn mực chủ quan có ảnh hưởng tích cực đến ý định [BEHAVIOR]', 'Subjective Norm', 'Behavioral Intention', 'positive', 'Áp lực xã hội và kỳ vọng từ những người quan trọng sẽ tăng ý định thực hiện hành vi'),
(1, 'Kiểm soát hành vi cảm nhận có ảnh hưởng tích cực đến ý định [BEHAVIOR]', 'Perceived Behavioral Control', 'Behavioral Intention', 'positive', 'Khi cá nhân cảm thấy có khả năng kiểm soát hành vi, ý định thực hiện sẽ tăng lên'),

(2, 'Tính hữu ích cảm nhận có ảnh hưởng tích cực đến thái độ sử dụng [TECHNOLOGY]', 'Perceived Usefulness', 'Attitude', 'positive', 'Người dùng sẽ có thái độ tích cực hơn với công nghệ mà họ cảm thấy hữu ích'),
(2, 'Tính dễ sử dụng cảm nhận có ảnh hưởng tích cực đến tính hữu ích cảm nhận', 'Perceived Ease of Use', 'Perceived Usefulness', 'positive', 'Công nghệ dễ sử dụng thường được cảm nhận là hữu ích hơn'),
(2, 'Thái độ sử dụng có ảnh hưởng tích cực đến ý định sử dụng [TECHNOLOGY]', 'Attitude', 'Behavioral Intention', 'positive', 'Thái độ tích cực sẽ dẫn đến ý định sử dụng cao hơn');

-- Insert survey question templates
INSERT INTO survey_question_templates (variable_id, question_text, question_type, is_reverse_coded) VALUES
-- TPB Questions
(1, 'Tôi nghĩ [BEHAVIOR] là một ý tưởng tốt', 'likert_5', false),
(1, 'Tôi có thái độ tích cực với việc [BEHAVIOR]', 'likert_5', false),
(1, '[BEHAVIOR] sẽ mang lại lợi ích cho tôi', 'likert_5', false),
(1, 'Tôi không thích [BEHAVIOR]', 'likert_5', true),

(2, 'Những người quan trọng với tôi nghĩ tôi nên [BEHAVIOR]', 'likert_5', false),
(2, 'Gia đình tôi ủng hộ việc tôi [BEHAVIOR]', 'likert_5', false),
(2, 'Bạn bè của tôi khuyến khích tôi [BEHAVIOR]', 'likert_5', false),

(3, 'Tôi có đủ khả năng để [BEHAVIOR]', 'likert_5', false),
(3, 'Việc [BEHAVIOR] hoàn toàn phụ thuộc vào tôi', 'likert_5', false),
(3, 'Tôi tự tin có thể [BEHAVIOR] nếu muốn', 'likert_5', false),

(4, 'Tôi có ý định [BEHAVIOR] trong tương lai gần', 'likert_5', false),
(4, 'Tôi sẽ cố gắng [BEHAVIOR]', 'likert_5', false),
(4, 'Khả năng tôi [BEHAVIOR] là rất cao', 'likert_5', false);

-- Create function to get template by model and domain
CREATE OR REPLACE FUNCTION get_research_template(
    p_model_id INTEGER,
    p_domain_id INTEGER DEFAULT NULL
)
RETURNS TABLE(
    template_data JSONB
) AS $$
BEGIN
    RETURN QUERY
    SELECT jsonb_build_object(
        'title_template', rt.title_template,
        'abstract_template', rt.abstract_template,
        'introduction_template', rt.introduction_template,
        'literature_review_template', rt.literature_review_template,
        'theoretical_framework_template', rt.theoretical_framework_template,
        'methodology_template', rt.methodology_template,
        'expected_results_template', rt.expected_results_template,
        'implications_template', rt.implications_template,
        'hypotheses_templates', rt.hypotheses_templates,
        'suggested_variables', rt.suggested_variables,
        'reference_templates', rt.reference_templates,
        'model_info', jsonb_build_object(
            'name', mm.name,
            'description', mm.description,
            'category', mm.category,
            'key_concepts', mm.key_concepts
        )
    ) as template_data
    FROM research_outline_templates rt
    JOIN marketing_models mm ON rt.model_id = mm.id
    WHERE rt.model_id = p_model_id
    AND (p_domain_id IS NULL OR rt.business_domain_id = p_domain_id)
    LIMIT 1;
END;
$$ LANGUAGE plpgsql;