// Template Service for Research Outline Generation
// Lấy templates từ database để tiết kiệm token Gemini

export interface ResearchTemplate {
  title_template: string
  abstract_template: string
  introduction_template: string
  literature_review_template: string
  theoretical_framework_template: string
  methodology_template: string
  expected_results_template: string
  implications_template: string
  hypotheses_templates: string[]
  suggested_variables: Array<{
    name: string
    type: string
    description: string
    questions: string[]
  }>
  reference_templates: string[]
  model_info: {
    name: string
    description: string
    category: string
    key_concepts: string[]
  }
}

class TemplateService {
  // Get template from database (mock for now, will connect to Supabase later)
  async getResearchTemplate(modelId: number, domainId?: number): Promise<ResearchTemplate | null> {
    try {
      // Mock templates for now - in production, this would query Supabase
      const templates = this.getMockTemplates()
      return templates[modelId] || null
    } catch (error) {
      console.error('Failed to get template:', error)
      return null
    }
  }

  // Fill template with project-specific data
  fillTemplate(template: ResearchTemplate, projectData: {
    title: string
    description: string
    domain: string
    targetGroup?: string
    behavior?: string
    technology?: string
    context?: string
  }): ResearchTemplate {
    const placeholders = {
      '[BEHAVIOR]': projectData.behavior || 'sử dụng sản phẩm/dịch vụ',
      '[TARGET_GROUP]': projectData.targetGroup || 'khách hàng',
      '[TECHNOLOGY]': projectData.technology || 'hệ thống',
      '[CONTEXT]': projectData.context || projectData.domain,
      '[FACTORS]': 'các yếu tố',
      '[SAMPLE_SIZE]': '300',
      '[LOCATION]': 'Việt Nam',
      '[PROBLEM_STATEMENT]': `Trong bối cảnh ${projectData.domain}, cần hiểu rõ các yếu tố ảnh hưởng đến hành vi của ${projectData.targetGroup || 'khách hàng'}.`,
      '[STAKEHOLDERS]': 'các nhà quản lý và nhà hoạch định chính sách',
      '[STRATEGY_TYPE]': 'marketing và truyền thông',
      '[TIME_FRAME]': '6 tháng tới',
      '[SAMPLING_METHOD]': 'lấy mẫu thuận tiện',
      '[LITERATURE_REVIEW_CONTENT]': 'Nhiều nghiên cứu đã chứng minh tính hiệu quả của mô hình này trong việc dự đoán hành vi.',
      '[RESEARCH_GAP]': 'ảnh hưởng của các yếu tố văn hóa địa phương',
      '[SPECIFIC_CONTEXT]': `${projectData.domain} tại Việt Nam`,
      '[TECHNOLOGY_CONTEXT]': `Sự phát triển nhanh chóng của ${projectData.technology || 'công nghệ số'} đòi hỏi sự hiểu biết sâu sắc về hành vi chấp nhận của người dùng.`,
      '[TAM_LITERATURE]': 'Các nghiên cứu về TAM đã được thực hiện rộng rãi trong nhiều lĩnh vực từ e-commerce đến mobile banking.'
    }

    const filledTemplate = { ...template }
    
    // Replace placeholders in all text fields
    Object.keys(filledTemplate).forEach(key => {
      if (typeof filledTemplate[key as keyof ResearchTemplate] === 'string') {
        let text = filledTemplate[key as keyof ResearchTemplate] as string
        Object.entries(placeholders).forEach(([placeholder, value]) => {
          text = text.replace(new RegExp(placeholder, 'g'), value)
        })
        ;(filledTemplate as any)[key] = text
      } else if (Array.isArray(filledTemplate[key as keyof ResearchTemplate])) {
        const array = filledTemplate[key as keyof ResearchTemplate] as string[]
        ;(filledTemplate as any)[key] = array.map(item => {
          let text = item
          Object.entries(placeholders).forEach(([placeholder, value]) => {
            text = text.replace(new RegExp(placeholder, 'g'), value)
          })
          return text
        })
      }
    })

    // Fill variables questions
    if (filledTemplate.suggested_variables) {
      filledTemplate.suggested_variables = filledTemplate.suggested_variables.map(variable => ({
        ...variable,
        questions: variable.questions.map(question => {
          let text = question
          Object.entries(placeholders).forEach(([placeholder, value]) => {
            text = text.replace(new RegExp(placeholder, 'g'), value)
          })
          return text
        })
      }))
    }

    return filledTemplate
  }

  // Generate research outline using template + minimal AI
  async generateOutlineFromTemplate(
    modelId: number, 
    projectData: {
      title: string
      description: string
      domain: string
      targetGroup?: string
      behavior?: string
      technology?: string
    }
  ): Promise<any> {
    try {
      // Get template
      const template = await this.getResearchTemplate(modelId)
      if (!template) {
        throw new Error('Template not found')
      }

      // Fill template with project data
      const filledTemplate = this.fillTemplate(template, projectData)

      // Convert to research outline format
      return {
        title: filledTemplate.title_template,
        abstract: filledTemplate.abstract_template,
        introduction: filledTemplate.introduction_template,
        literatureReview: filledTemplate.literature_review_template,
        theoreticalFramework: filledTemplate.theoretical_framework_template,
        hypotheses: filledTemplate.hypotheses_templates,
        methodology: filledTemplate.methodology_template,
        expectedResults: filledTemplate.expected_results_template,
        implications: filledTemplate.implications_template,
        references: filledTemplate.reference_templates,
        suggestedVariables: filledTemplate.suggested_variables.map(v => ({
          name: v.name,
          type: v.type as 'independent' | 'dependent' | 'mediating' | 'moderating',
          description: v.description,
          measurementItems: v.questions
        }))
      }
    } catch (error) {
      console.error('Failed to generate outline from template:', error)
      throw error
    }
  }

  // Mock templates (in production, these would come from database)
  private getMockTemplates(): Record<number, ResearchTemplate> {
    return {
      // TPB Template
      1: {
        title_template: 'Nghiên cứu ảnh hưởng của [FACTORS] đến ý định [BEHAVIOR] của [TARGET_GROUP] dựa trên Lý thuyết Hành vi Có Kế hoạch',
        abstract_template: 'Nghiên cứu này áp dụng Lý thuyết Hành vi Có Kế hoạch (Theory of Planned Behavior - TPB) để tìm hiểu các yếu tố ảnh hưởng đến ý định [BEHAVIOR] của [TARGET_GROUP]. Mô hình TPB cho rằng ý định hành vi được quyết định bởi ba yếu tố chính: thái độ đối với hành vi, chuẩn mực chủ quan và kiểm soát hành vi cảm nhận. Nghiên cứu sử dụng phương pháp định lượng với mẫu [SAMPLE_SIZE] [TARGET_GROUP] tại [LOCATION]. Kết quả nghiên cứu sẽ cung cấp hiểu biết sâu sắc về động lực [BEHAVIOR] và đề xuất các chiến lược marketing hiệu quả.',
        introduction_template: 'Trong bối cảnh [CONTEXT], việc hiểu rõ các yếu tố ảnh hưởng đến ý định [BEHAVIOR] của [TARGET_GROUP] trở nên quan trọng. [PROBLEM_STATEMENT]. Nghiên cứu này nhằm khám phá mối quan hệ giữa thái độ, chuẩn mực xã hội, kiểm soát hành vi và ý định [BEHAVIOR], từ đó đưa ra những khuyến nghị thực tiễn cho [STAKEHOLDERS].',
        literature_review_template: 'Các nghiên cứu trước đây đã chứng minh hiệu quả của mô hình TPB trong dự đoán ý định hành vi trong nhiều lĩnh vực khác nhau. [LITERATURE_REVIEW_CONTENT]. Tuy nhiên, vẫn còn khoảng trống nghiên cứu về [RESEARCH_GAP] trong bối cảnh [SPECIFIC_CONTEXT].',
        theoretical_framework_template: 'Lý thuyết Hành vi Có Kế hoạch (Ajzen, 1985) là một trong những mô hình được sử dụng rộng rãi nhất để dự đoán và giải thích hành vi con người. Theo TPB, ý định hành vi được quyết định bởi ba yếu tố: (1) Thái độ đối với hành vi - đánh giá tích cực hay tiêu cực về việc thực hiện hành vi; (2) Chuẩn mực chủ quan - áp lực xã hội cảm nhận để thực hiện hay không thực hiện hành vi; (3) Kiểm soát hành vi cảm nhận - nhận thức về khả năng kiểm soát việc thực hiện hành vi.',
        methodology_template: 'Nghiên cứu sử dụng phương pháp định lượng với thiết kế nghiên cứu mô tả tương quan. Mẫu nghiên cứu gồm [SAMPLE_SIZE] [TARGET_GROUP] được chọn bằng phương pháp [SAMPLING_METHOD]. Dữ liệu được thu thập thông qua bảng câu hỏi khảo sát trực tuyến với các thang đo đã được kiểm định. Phương pháp phân tích bao gồm thống kê mô tả, phân tích tương quan và mô hình cấu trúc tuyến tính (SEM).',
        expected_results_template: 'Kết quả nghiên cứu dự kiến sẽ xác định được mức độ ảnh hưởng của từng yếu tố trong mô hình TPB đến ý định [BEHAVIOR]. Nghiên cứu cũng có thể phát hiện ra các yếu tố điều tiết hoặc trung gian trong mối quan hệ này, góp phần làm phong phú thêm lý thuyết TPB trong bối cảnh [SPECIFIC_CONTEXT].',
        implications_template: 'Về mặt lý thuyết, nghiên cứu góp phần mở rộng và kiểm định mô hình TPB trong bối cảnh [CONTEXT]. Về mặt thực tiễn, kết quả nghiên cứu cung cấp cơ sở khoa học cho [STAKEHOLDERS] trong việc xây dựng các chiến lược [STRATEGY_TYPE] hiệu quả, tập trung vào các yếu tố có ảnh hưởng mạnh nhất đến ý định [BEHAVIOR].',
        hypotheses_templates: [
          'H1: Thái độ đối với [BEHAVIOR] có ảnh hưởng tích cực đến ý định [BEHAVIOR] của [TARGET_GROUP]',
          'H2: Chuẩn mực chủ quan có ảnh hưởng tích cực đến ý định [BEHAVIOR] của [TARGET_GROUP]',
          'H3: Kiểm soát hành vi cảm nhận có ảnh hưởng tích cực đến ý định [BEHAVIOR] của [TARGET_GROUP]',
          'H4: Thái độ đối với [BEHAVIOR] có ảnh hưởng mạnh nhất đến ý định [BEHAVIOR] so với các yếu tố khác'
        ],
        suggested_variables: [
          {
            name: 'Thái độ đối với hành vi',
            type: 'independent',
            description: 'Đánh giá tích cực hay tiêu cực của cá nhân về việc thực hiện hành vi',
            questions: [
              'Tôi nghĩ [BEHAVIOR] là một ý tưởng tốt',
              'Tôi có thái độ tích cực với việc [BEHAVIOR]',
              '[BEHAVIOR] sẽ mang lại lợi ích cho tôi',
              'Tôi thích [BEHAVIOR]'
            ]
          },
          {
            name: 'Chuẩn mực chủ quan',
            type: 'independent',
            description: 'Áp lực xã hội cảm nhận để thực hiện hành vi',
            questions: [
              'Những người quan trọng với tôi nghĩ tôi nên [BEHAVIOR]',
              'Gia đình tôi ủng hộ việc tôi [BEHAVIOR]',
              'Bạn bè của tôi khuyến khích tôi [BEHAVIOR]',
              'Xã hội mong đợi tôi [BEHAVIOR]'
            ]
          },
          {
            name: 'Kiểm soát hành vi cảm nhận',
            type: 'independent',
            description: 'Nhận thức về khả năng kiểm soát việc thực hiện hành vi',
            questions: [
              'Tôi có đủ khả năng để [BEHAVIOR]',
              'Việc [BEHAVIOR] hoàn toàn phụ thuộc vào tôi',
              'Tôi tự tin có thể [BEHAVIOR] nếu muốn',
              'Tôi có đủ tài nguyên để [BEHAVIOR]'
            ]
          },
          {
            name: 'Ý định hành vi',
            type: 'dependent',
            description: 'Ý định thực hiện hành vi trong tương lai',
            questions: [
              'Tôi có ý định [BEHAVIOR] trong tương lai gần',
              'Tôi sẽ cố gắng [BEHAVIOR]',
              'Tôi dự định [BEHAVIOR] trong [TIME_FRAME]',
              'Khả năng tôi [BEHAVIOR] là rất cao'
            ]
          }
        ],
        reference_templates: [
          'Ajzen, I. (1985). From intentions to actions: A theory of planned behavior. In J. Kuhl & J. Beckmann (Eds.), Action control: From cognition to behavior (pp. 11-39). Springer.',
          'Ajzen, I. (1991). The theory of planned behavior. Organizational Behavior and Human Decision Processes, 50(2), 179-211.',
          'Fishbein, M., & Ajzen, I. (2010). Predicting and changing behavior: The reasoned action approach. Psychology Press.',
          'Armitage, C. J., & Conner, M. (2001). Efficacy of the theory of planned behaviour: A meta‐analytic review. British Journal of Social Psychology, 40(4), 471-499.'
        ],
        model_info: {
          name: 'Theory of Planned Behavior (TPB)',
          description: 'Mô hình dự đoán hành vi dựa trên thái độ, chuẩn mực chủ quan và kiểm soát hành vi',
          category: 'consumer_behavior',
          key_concepts: ['Attitude', 'Subjective Norm', 'Perceived Behavioral Control', 'Behavioral Intention']
        }
      },

      // TAM Template
      2: {
        title_template: 'Nghiên cứu các yếu tố ảnh hưởng đến việc chấp nhận [TECHNOLOGY] của [TARGET_GROUP] dựa trên Mô hình Chấp nhận Công nghệ',
        abstract_template: 'Nghiên cứu này áp dụng Mô hình Chấp nhận Công nghệ (Technology Acceptance Model - TAM) để tìm hiểu các yếu tố ảnh hưởng đến việc chấp nhận [TECHNOLOGY] của [TARGET_GROUP]. TAM cho rằng việc chấp nhận công nghệ được quyết định bởi tính hữu ích cảm nhận và tính dễ sử dụng cảm nhận. Nghiên cứu sử dụng phương pháp định lượng với [SAMPLE_SIZE] người tham gia. Kết quả sẽ cung cấp hiểu biết về động lực chấp nhận công nghệ và đề xuất cải thiện trải nghiệm người dùng.',
        introduction_template: 'Trong thời đại số hóa, việc chấp nhận công nghệ mới trở thành yếu tố quan trọng quyết định thành công của các sản phẩm và dịch vụ. [TECHNOLOGY_CONTEXT]. Nghiên cứu này nhằm hiểu rõ các yếu tố ảnh hưởng đến quyết định sử dụng [TECHNOLOGY] của [TARGET_GROUP].',
        literature_review_template: 'Mô hình TAM đã được nghiên cứu rộng rãi trong nhiều lĩnh vực công nghệ khác nhau. [TAM_LITERATURE]. Tuy nhiên, cần có thêm nghiên cứu về [TECHNOLOGY] trong bối cảnh [SPECIFIC_CONTEXT] để hiểu rõ hơn về hành vi chấp nhận công nghệ.',
        theoretical_framework_template: 'Mô hình Chấp nhận Công nghệ (Davis, 1989) dựa trên Lý thuyết Hành động Hợp lý để giải thích hành vi chấp nhận công nghệ. TAM đề xuất hai yếu tố chính: (1) Tính hữu ích cảm nhận - mức độ người dùng tin rằng công nghệ sẽ cải thiện hiệu suất công việc; (2) Tính dễ sử dụng cảm nhận - mức độ người dùng tin rằng việc sử dụng công nghệ không đòi hỏi nhiều nỗ lực.',
        methodology_template: 'Nghiên cứu sử dụng phương pháp định lượng với thiết kế khảo sát cắt ngang. Mẫu nghiên cứu bao gồm [SAMPLE_SIZE] [TARGET_GROUP] có kinh nghiệm sử dụng [TECHNOLOGY]. Dữ liệu được thu thập qua bảng câu hỏi trực tuyến và phân tích bằng PLS-SEM.',
        expected_results_template: 'Nghiên cứu dự kiến sẽ xác định được mức độ ảnh hưởng của tính hữu ích và tính dễ sử dụng đến thái độ và ý định sử dụng [TECHNOLOGY]. Kết quả có thể phát hiện thêm các yếu tố điều tiết như kinh nghiệm sử dụng, độ tuổi, hoặc trình độ công nghệ.',
        implications_template: 'Nghiên cứu góp phần mở rộng lý thuyết TAM trong bối cảnh [TECHNOLOGY]. Về mặt thực tiễn, kết quả giúp các nhà phát triển cải thiện thiết kế giao diện và trải nghiệm người dùng, tăng tỷ lệ chấp nhận công nghệ.',
        hypotheses_templates: [
          'H1: Tính hữu ích cảm nhận có ảnh hưởng tích cực đến thái độ sử dụng [TECHNOLOGY]',
          'H2: Tính dễ sử dụng cảm nhận có ảnh hưởng tích cực đến thái độ sử dụng [TECHNOLOGY]',
          'H3: Tính dễ sử dụng cảm nhận có ảnh hưởng tích cực đến tính hữu ích cảm nhận',
          'H4: Thái độ sử dụng có ảnh hưởng tích cực đến ý định sử dụng [TECHNOLOGY]'
        ],
        suggested_variables: [
          {
            name: 'Tính hữu ích cảm nhận',
            type: 'independent',
            description: 'Mức độ người dùng tin rằng công nghệ sẽ cải thiện hiệu suất',
            questions: [
              'Sử dụng [TECHNOLOGY] sẽ cải thiện hiệu suất công việc của tôi',
              '[TECHNOLOGY] hữu ích cho công việc của tôi',
              '[TECHNOLOGY] giúp tôi hoàn thành công việc nhanh hơn',
              '[TECHNOLOGY] tăng năng suất làm việc của tôi'
            ]
          },
          {
            name: 'Tính dễ sử dụng cảm nhận',
            type: 'independent',
            description: 'Mức độ người dùng tin rằng việc sử dụng không đòi hỏi nhiều nỗ lực',
            questions: [
              'Tôi thấy [TECHNOLOGY] dễ sử dụng',
              'Học cách sử dụng [TECHNOLOGY] rất dễ dàng',
              'Tương tác với [TECHNOLOGY] rõ ràng và dễ hiểu',
              'Tôi có thể thành thạo [TECHNOLOGY] một cách dễ dàng'
            ]
          },
          {
            name: 'Thái độ sử dụng',
            type: 'mediating',
            description: 'Cảm xúc tích cực hay tiêu cực về việc sử dụng công nghệ',
            questions: [
              'Sử dụng [TECHNOLOGY] là ý tưởng hay',
              'Tôi thích sử dụng [TECHNOLOGY]',
              'Làm việc với [TECHNOLOGY] thú vị',
              'Sử dụng [TECHNOLOGY] mang lại cảm giác tích cực'
            ]
          },
          {
            name: 'Ý định sử dụng',
            type: 'dependent',
            description: 'Ý định tiếp tục sử dụng công nghệ trong tương lai',
            questions: [
              'Tôi có ý định sử dụng [TECHNOLOGY] thường xuyên',
              'Tôi sẽ sử dụng [TECHNOLOGY] khi có cơ hội',
              'Tôi dự định tiếp tục sử dụng [TECHNOLOGY]',
              'Tôi sẽ khuyến khích người khác sử dụng [TECHNOLOGY]'
            ]
          }
        ],
        reference_templates: [
          'Davis, F. D. (1989). Perceived usefulness, perceived ease of use, and user acceptance of information technology. MIS Quarterly, 13(3), 319-340.',
          'Venkatesh, V., & Davis, F. D. (2000). A theoretical extension of the technology acceptance model: Four longitudinal field studies. Management Science, 46(2), 186-204.',
          'King, W. R., & He, J. (2006). A meta-analysis of the technology acceptance model. Information & Management, 43(6), 740-755.',
          'Marangunić, N., & Granić, A. (2015). Technology acceptance model: A literature review from 1986 to 2013. Universal Access in the Information Society, 14(1), 81-95.'
        ],
        model_info: {
          name: 'Technology Acceptance Model (TAM)',
          description: 'Mô hình chấp nhận công nghệ dựa trên tính hữu ích và dễ sử dụng',
          category: 'technology_adoption',
          key_concepts: ['Perceived Usefulness', 'Perceived Ease of Use', 'Attitude', 'Behavioral Intention']
        }
      }
    }
  }
}

export const templateService = new TemplateService()