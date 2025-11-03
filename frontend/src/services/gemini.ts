// Gemini AI Service for Research Outline Generation
import { GoogleGenerativeAI } from '@google/generative-ai'
import { templateService } from './templates'

const GEMINI_API_KEY = 'AIzaSyCo8p2IapVdrr03Ed4Aforvd68mdUg7RDI'
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY)

export interface ResearchOutlineRequest {
  projectTitle: string
  projectDescription: string
  businessDomain: string
  selectedModels: Array<{
    id: number
    name: string
    description: string
    category: string
  }>
  researchObjectives?: string[]
}

export interface ResearchOutline {
  title: string
  abstract: string
  introduction: string
  literatureReview: string
  theoreticalFramework: string
  hypotheses: string[]
  methodology: string
  expectedResults: string
  implications: string
  references: string[]
  suggestedVariables: Array<{
    name: string
    type: 'independent' | 'dependent' | 'mediating' | 'moderating'
    description: string
    measurementItems: string[]
  }>
}

class GeminiService {
  private model = genAI.getGenerativeModel({ model: 'gemini-2.5-pro' })

  async generateResearchOutline(request: ResearchOutlineRequest): Promise<ResearchOutline> {
    try {
      // Try to use template first (saves tokens)
      if (request.selectedModels.length === 1) {
        const modelId = request.selectedModels[0].id
        try {
          const templateOutline = await templateService.generateOutlineFromTemplate(modelId, {
            title: request.projectTitle,
            description: request.projectDescription,
            domain: request.businessDomain,
            targetGroup: this.extractTargetGroup(request.projectDescription),
            behavior: this.extractBehavior(request.projectTitle, request.projectDescription),
            technology: this.extractTechnology(request.projectTitle, request.projectDescription)
          })
          
          // Use AI to refine and customize the template
          const refinedOutline = await this.refineOutlineWithAI(templateOutline, request)
          return refinedOutline
        } catch (templateError) {
          console.log('Template generation failed, falling back to full AI generation')
        }
      }
      
      // Fallback to full AI generation
      const prompt = this.buildResearchOutlinePrompt(request)
      
      const result = await this.model.generateContent(prompt)
      const response = result.response
      const text = response.text()
      
      return this.parseResearchOutline(text)
    } catch (error) {
      console.error('Gemini API Error:', error)
      throw new Error('Failed to generate research outline')
    }
  }

  // Refine template with AI (uses fewer tokens)
  private async refineOutlineWithAI(templateOutline: any, request: ResearchOutlineRequest): Promise<ResearchOutline> {
    const prompt = `
Bạn là chuyên gia nghiên cứu. Hãy tinh chỉnh và cải thiện đề cương nghiên cứu sau để phù hợp với dự án cụ thể:

**Dự án:** ${request.projectTitle}
**Mô tả:** ${request.projectDescription}
**Lĩnh vực:** ${request.businessDomain}

**Đề cương hiện tại:**
${JSON.stringify(templateOutline, null, 2)}

**Yêu cầu:**
1. Cải thiện tiêu đề cho phù hợp hơn
2. Điều chỉnh nội dung để phù hợp với bối cảnh cụ thể
3. Thêm chi tiết phù hợp với lĩnh vực ${request.businessDomain}
4. Đảm bảo tính nhất quán và logic

Trả về JSON với cấu trúc tương tự, đã được cải thiện.
`

    try {
      const result = await this.model.generateContent(prompt)
      const response = result.response
      const text = response.text()
      
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0])
      }
      
      return templateOutline // Return original if parsing fails
    } catch (error) {
      console.log('AI refinement failed, using template as-is')
      return templateOutline
    }
  }

  // Extract target group from description
  private extractTargetGroup(description: string): string {
    const keywords = {
      'khách hàng': 'khách hàng',
      'sinh viên': 'sinh viên', 
      'nhân viên': 'nhân viên',
      'người dùng': 'người dùng',
      'du khách': 'du khách',
      'khách du lịch': 'khách du lịch',
      'người tiêu dùng': 'người tiêu dùng'
    }
    
    for (const [keyword, group] of Object.entries(keywords)) {
      if (description.toLowerCase().includes(keyword)) {
        return group
      }
    }
    return 'khách hàng'
  }

  // Extract behavior from title/description
  private extractBehavior(title: string, description: string): string {
    const text = (title + ' ' + description).toLowerCase()
    
    if (text.includes('mua') || text.includes('mua sắm')) return 'mua sắm'
    if (text.includes('sử dụng')) return 'sử dụng sản phẩm/dịch vụ'
    if (text.includes('chấp nhận')) return 'chấp nhận công nghệ'
    if (text.includes('du lịch')) return 'du lịch'
    if (text.includes('đầu tư')) return 'đầu tư'
    
    return 'sử dụng sản phẩm/dịch vụ'
  }

  // Extract technology from title/description
  private extractTechnology(title: string, description: string): string {
    const text = (title + ' ' + description).toLowerCase()
    
    if (text.includes('app') || text.includes('ứng dụng')) return 'ứng dụng di động'
    if (text.includes('website') || text.includes('web')) return 'website'
    if (text.includes('hệ thống')) return 'hệ thống thông tin'
    if (text.includes('ai') || text.includes('trí tuệ nhân tạo')) return 'AI'
    if (text.includes('blockchain')) return 'blockchain'
    if (text.includes('iot')) return 'IoT'
    
    return 'hệ thống số'
  }

  async generateSurveyQuestions(variables: Array<{
    name: string
    type: string
    description: string
  }>): Promise<Array<{
    variable: string
    questions: Array<{
      text: string
      type: 'likert_5' | 'likert_7' | 'multiple_choice' | 'open_ended'
      scale?: string[]
      isReverseCoded?: boolean
    }>
  }>> {
    try {
      const prompt = this.buildSurveyPrompt(variables)
      
      const result = await this.model.generateContent(prompt)
      const response = await result.response
      const text = response.text()
      
      return this.parseSurveyQuestions(text)
    } catch (error) {
      console.error('Gemini API Error:', error)
      throw new Error('Failed to generate survey questions')
    }
  }

  private buildResearchOutlinePrompt(request: ResearchOutlineRequest): string {
    const modelsInfo = request.selectedModels.map(model => 
      `- ${model.name}: ${model.description}`
    ).join('\n')

    return `
Bạn là chuyên gia nghiên cứu kinh tế và marketing. Hãy tạo một đề cương nghiên cứu chi tiết bằng tiếng Việt cho:

**Thông tin dự án:**
- Tiêu đề: ${request.projectTitle}
- Mô tả: ${request.projectDescription}
- Lĩnh vực: ${request.businessDomain}

**Các mô hình lý thuyết được chọn:**
${modelsInfo}

**Yêu cầu đề cương:**

1. **TIÊU ĐỀ NGHIÊN CỨU** (cải thiện tiêu đề gốc nếu cần)

2. **TÓM TẮT** (200-250 từ)
   - Vấn đề nghiên cứu
   - Mục tiêu
   - Phương pháp
   - Kết quả mong đợi

3. **GIỚI THIỆU** (300-400 từ)
   - Bối cảnh nghiên cứu
   - Tầm quan trọng của vấn đề
   - Khoảng trống nghiên cứu

4. **TỔNG QUAN TÀI LIỆU** (400-500 từ)
   - Các nghiên cứu liên quan
   - Phân tích gap nghiên cứu

5. **KHUNG LÝ THUYẾT** (300-400 từ)
   - Giải thích các mô hình đã chọn
   - Mối quan hệ giữa các khái niệm

6. **GIẢ THUYẾT NGHIÊN CỨU** (liệt kê 5-8 giả thuyết cụ thể)
   - H1: ...
   - H2: ...
   - (dựa trên các mô hình đã chọn)

7. **PHƯƠNG PHÁP NGHIÊN CỨU** (200-300 từ)
   - Thiết kế nghiên cứu
   - Mẫu nghiên cứu
   - Công cụ thu thập dữ liệu

8. **KẾT QUẢ MONG ĐỢI** (150-200 từ)
   - Đóng góp lý thuyết
   - Ý nghĩa thực tiễn

9. **Ý NGHĨA NGHIÊN CỨU** (150-200 từ)
   - Đóng góp cho lý thuyết
   - Ứng dụng thực tế

10. **TÀI LIỆU THAM KHẢO** (10-15 tài liệu mẫu)

11. **CÁC BIẾN NGHIÊN CỨU ĐỀ XUẤT** (cho mỗi biến, đưa ra 3-5 câu hỏi đo lường)

Hãy trả về kết quả theo định dạng JSON với cấu trúc:
{
  "title": "...",
  "abstract": "...",
  "introduction": "...",
  "literatureReview": "...",
  "theoreticalFramework": "...",
  "hypotheses": ["H1: ...", "H2: ..."],
  "methodology": "...",
  "expectedResults": "...",
  "implications": "...",
  "references": ["Tác giả (năm). Tiêu đề..."],
  "suggestedVariables": [
    {
      "name": "Tên biến",
      "type": "independent/dependent/mediating/moderating",
      "description": "Mô tả biến",
      "measurementItems": ["Câu hỏi 1", "Câu hỏi 2", ...]
    }
  ]
}
`
  }

  private buildSurveyPrompt(variables: Array<{
    name: string
    type: string
    description: string
  }>): string {
    const variablesInfo = variables.map(v => 
      `- ${v.name} (${v.type}): ${v.description}`
    ).join('\n')

    return `
Bạn là chuyên gia thiết kế khảo sát marketing. Hãy tạo câu hỏi khảo sát cho các biến sau:

${variablesInfo}

**Yêu cầu:**
1. Mỗi biến cần 3-5 câu hỏi đo lường
2. Sử dụng thang đo Likert 5 điểm (1=Hoàn toàn không đồng ý, 5=Hoàn toàn đồng ý)
3. Câu hỏi phải rõ ràng, dễ hiểu, phù hợp văn hóa Việt Nam
4. Một số câu hỏi nên được mã hóa ngược (reverse coded)
5. Câu hỏi phải đo lường chính xác khái niệm của biến

Trả về JSON format:
{
  "surveyQuestions": [
    {
      "variable": "Tên biến",
      "questions": [
        {
          "text": "Câu hỏi...",
          "type": "likert_5",
          "scale": ["Hoàn toàn không đồng ý", "Không đồng ý", "Trung lập", "Đồng ý", "Hoàn toàn đồng ý"],
          "isReverseCoded": false
        }
      ]
    }
  ]
}
`
  }

  private parseResearchOutline(text: string): ResearchOutline {
    try {
      // Try to extract JSON from the response
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0])
        return parsed
      }
      
      // Fallback: parse manually if JSON extraction fails
      return this.manualParseOutline(text)
    } catch (error) {
      console.error('Parse error:', error)
      throw new Error('Failed to parse research outline')
    }
  }

  private parseSurveyQuestions(text: string): Array<{
    variable: string
    questions: Array<{
      text: string
      type: 'likert_5' | 'likert_7' | 'multiple_choice' | 'open_ended'
      scale?: string[]
      isReverseCoded?: boolean
    }>
  }> {
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0])
        return parsed.surveyQuestions || []
      }
      
      return []
    } catch (error) {
      console.error('Parse error:', error)
      throw new Error('Failed to parse survey questions')
    }
  }

  private manualParseOutline(text: string): ResearchOutline {
    // Fallback manual parsing if JSON parsing fails
    return {
      title: "Generated Research Outline",
      abstract: text.substring(0, 500) + "...",
      introduction: "",
      literatureReview: "",
      theoreticalFramework: "",
      hypotheses: [],
      methodology: "",
      expectedResults: "",
      implications: "",
      references: [],
      suggestedVariables: []
    }
  }

  // Test connection to Gemini API
  async testConnection(): Promise<boolean> {
    try {
      const result = await this.model.generateContent("Hello, this is a test message.")
      const response = await result.response
      return response.text().length > 0
    } catch (error) {
      console.error('Gemini connection test failed:', error)
      return false
    }
  }
}

export const geminiService = new GeminiService()