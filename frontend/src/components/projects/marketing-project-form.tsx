'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeftIcon, CheckIcon, SparklesIcon } from '@heroicons/react/24/outline'
import { geminiService } from '@/services/gemini'

const BUSINESS_DOMAINS = [
  { id: 1, name: 'Marketing', description: 'Nghiên cứu hành vi tiêu dùng, thương hiệu, quảng cáo', icon: '📊' },
  { id: 2, name: 'Du lịch & Khách sạn', description: 'Nghiên cứu trải nghiệm khách hàng, dịch vụ du lịch', icon: '🗺️' },
  { id: 3, name: 'Nhân sự', description: 'Nghiên cứu động lực làm việc, văn hóa tổ chức', icon: '👥' },
  { id: 4, name: 'Hệ thống thông tin quản lý', description: 'Nghiên cứu chấp nhận công nghệ, chuyển đổi số', icon: '💻' },
  { id: 5, name: 'Tài chính & Ngân hàng', description: 'Nghiên cứu hành vi đầu tư, dịch vụ tài chính', icon: '💰' },
  { id: 6, name: 'Bán lẻ & Thương mại điện tử', description: 'Nghiên cứu mua sắm online, trải nghiệm khách hàng', icon: '🛒' }
]

const MARKETING_MODELS = [
  { 
    id: 1, 
    name: 'Theory of Planned Behavior (TPB)', 
    description: 'Mô hình dự đoán hành vi dựa trên thái độ, chuẩn mực chủ quan và kiểm soát hành vi', 
    category: 'consumer_behavior',
    variables: ['Attitude', 'Subjective Norm', 'Perceived Behavioral Control', 'Behavioral Intention']
  },
  { 
    id: 2, 
    name: 'Technology Acceptance Model (TAM)', 
    description: 'Mô hình chấp nhận công nghệ dựa trên tính hữu ích và dễ sử dụng', 
    category: 'technology_adoption',
    variables: ['Perceived Usefulness', 'Perceived Ease of Use', 'Attitude', 'Behavioral Intention']
  },
  { 
    id: 3, 
    name: 'SERVQUAL Model', 
    description: 'Mô hình đo lường chất lượng dịch vụ qua 5 thành phần', 
    category: 'service_quality',
    variables: ['Tangibles', 'Reliability', 'Responsiveness', 'Assurance', 'Empathy']
  },
  { 
    id: 4, 
    name: 'Customer Satisfaction Model', 
    description: 'Mô hình sự hài lòng khách hàng và ý định tái mua', 
    category: 'customer_satisfaction',
    variables: ['Expectation', 'Performance', 'Satisfaction', 'Repurchase Intention']
  },
  { 
    id: 5, 
    name: 'Brand Equity Model', 
    description: 'Mô hình giá trị thương hiệu của Aaker', 
    category: 'brand_management',
    variables: ['Brand Awareness', 'Brand Loyalty', 'Perceived Quality', 'Brand Associations']
  },
  { 
    id: 6, 
    name: 'E-Service Quality (E-S-QUAL)', 
    description: 'Mô hình chất lượng dịch vụ điện tử', 
    category: 'digital_service',
    variables: ['Efficiency', 'System Availability', 'Fulfillment', 'Privacy']
  }
]

interface MarketingProjectFormProps {
  onSuccess?: (project: any) => void
  onCancel?: () => void
}

export function MarketingProjectForm({ onSuccess, onCancel }: MarketingProjectFormProps) {
  const router = useRouter()
  const [step, setStep] = useState(1) // 1: Basic Info, 2: Select Models, 3: Generate Outline
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Form data
  const [projectData, setProjectData] = useState({
    title: '',
    description: '',
    businessDomainId: 0,
    selectedModels: [] as number[],
    researchObjectives: [] as string[]
  })
  
  const [generatedOutline, setGeneratedOutline] = useState<any>(null)

  const selectedDomain = BUSINESS_DOMAINS.find(d => d.id === projectData.businessDomainId)
  const selectedModelObjects = MARKETING_MODELS.filter(m => projectData.selectedModels.includes(m.id))

  const handleBasicInfoSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (projectData.title.length < 5) {
      setError('Tiêu đề phải có ít nhất 5 ký tự')
      return
    }
    if (projectData.description.length < 20) {
      setError('Mô tả phải có ít nhất 20 ký tự')
      return
    }
    if (!projectData.businessDomainId) {
      setError('Vui lòng chọn lĩnh vực kinh doanh')
      return
    }
    setError(null)
    setStep(2)
  }

  const handleModelSelection = () => {
    if (projectData.selectedModels.length === 0) {
      setError('Vui lòng chọn ít nhất một mô hình lý thuyết')
      return
    }
    setError(null)
    setStep(3)
  }

  const generateOutline = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const outline = await geminiService.generateResearchOutline({
        projectTitle: projectData.title,
        projectDescription: projectData.description,
        businessDomain: selectedDomain?.name || '',
        selectedModels: selectedModelObjects.map(m => ({
          id: m.id,
          name: m.name,
          description: m.description,
          category: m.category
        })),
        researchObjectives: projectData.researchObjectives
      })
      
      setGeneratedOutline(outline)
    } catch (err) {
      setError('Không thể tạo đề cương. Vui lòng thử lại.')
      console.error('Outline generation error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const createProject = async () => {
    setIsLoading(true)
    
    try {
      // Save project with generated outline
      const projectPayload = {
        title: generatedOutline?.title || projectData.title,
        description: projectData.description,
        business_domain_id: projectData.businessDomainId,
        selected_models: projectData.selectedModels,
        research_outline: JSON.stringify(generatedOutline),
        status: 'outline_generated'
      }
      
      // In real app, save to backend
      console.log('Creating project:', projectPayload)
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Redirect to project detail or success page
      router.push('/projects?created=true')
      onSuccess?.(projectPayload)
      
    } catch (err) {
      setError('Không thể tạo dự án. Vui lòng thử lại.')
    } finally {
      setIsLoading(false)
    }
  }

  const toggleModel = (modelId: number) => {
    setProjectData(prev => ({
      ...prev,
      selectedModels: prev.selectedModels.includes(modelId)
        ? prev.selectedModels.filter(id => id !== modelId)
        : [...prev.selectedModels, modelId]
    }))
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Progress Steps */}
      <div className="flex items-center justify-center space-x-4 mb-8">
        {[1, 2, 3].map((stepNum) => (
          <div key={stepNum} className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              step >= stepNum ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
            }`}>
              {step > stepNum ? <CheckIcon className="w-4 h-4" /> : stepNum}
            </div>
            {stepNum < 3 && (
              <div className={`w-16 h-1 mx-2 ${
                step > stepNum ? 'bg-blue-600' : 'bg-gray-200'
              }`} />
            )}
          </div>
        ))}
      </div>

      {/* Step 1: Basic Information */}
      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span>📝</span>
              Thông tin cơ bản dự án
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleBasicInfoSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">Tiêu đề dự án *</label>
                <Input
                  value={projectData.title}
                  onChange={(e) => setProjectData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="VD: Nghiên cứu ảnh hưởng của chất lượng dịch vụ đến sự hài lòng khách hàng"
                  className="text-base"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Mô tả dự án *</label>
                <textarea
                  value={projectData.description}
                  onChange={(e) => setProjectData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Mô tả chi tiết về mục tiêu, phạm vi và ý nghĩa của nghiên cứu..."
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Lĩnh vực kinh doanh *</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {BUSINESS_DOMAINS.map((domain) => (
                    <div
                      key={domain.id}
                      onClick={() => setProjectData(prev => ({ ...prev, businessDomainId: domain.id }))}
                      className={`p-4 border rounded-lg cursor-pointer transition-all ${
                        projectData.businessDomainId === domain.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-2xl">{domain.icon}</span>
                        <div>
                          <h3 className="font-medium">{domain.name}</h3>
                          <p className="text-sm text-gray-600">{domain.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {error && (
                <div className="p-3 text-sm text-red-500 bg-red-50 border border-red-200 rounded-md">
                  {error}
                </div>
              )}

              <div className="flex gap-3">
                <Button type="button" variant="outline" onClick={onCancel}>
                  <ArrowLeftIcon className="w-4 h-4 mr-2" />
                  Hủy
                </Button>
                <Button type="submit" className="flex-1">
                  Tiếp theo: Chọn mô hình lý thuyết
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Select Models */}
      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span>🧠</span>
              Chọn mô hình lý thuyết
            </CardTitle>
            <p className="text-sm text-gray-600">
              Chọn các mô hình lý thuyết phù hợp với nghiên cứu của bạn
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {MARKETING_MODELS.map((model) => (
                <div
                  key={model.id}
                  onClick={() => toggleModel(model.id)}
                  className={`p-4 border rounded-lg cursor-pointer transition-all ${
                    projectData.selectedModels.includes(model.id)
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center mt-1 ${
                      projectData.selectedModels.includes(model.id)
                        ? 'border-blue-500 bg-blue-500'
                        : 'border-gray-300'
                    }`}>
                      {projectData.selectedModels.includes(model.id) && (
                        <CheckIcon className="w-3 h-3 text-white" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium">{model.name}</h3>
                      <p className="text-sm text-gray-600 mb-2">{model.description}</p>
                      <div className="flex flex-wrap gap-1">
                        {model.variables.map((variable, idx) => (
                          <span key={idx} className="px-2 py-1 bg-gray-100 text-xs rounded">
                            {variable}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {error && (
              <div className="p-3 text-sm text-red-500 bg-red-50 border border-red-200 rounded-md mt-4">
                {error}
              </div>
            )}

            <div className="flex gap-3 mt-6">
              <Button type="button" variant="outline" onClick={() => setStep(1)}>
                <ArrowLeftIcon className="w-4 h-4 mr-2" />
                Quay lại
              </Button>
              <Button onClick={handleModelSelection} className="flex-1">
                Tiếp theo: Tạo đề cương
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Generate Outline */}
      {step === 3 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <SparklesIcon className="w-5 h-5" />
              Tạo đề cương nghiên cứu với AI
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!generatedOutline ? (
              <div className="text-center py-8">
                <div className="mb-6">
                  <h3 className="text-lg font-medium mb-2">Sẵn sàng tạo đề cương?</h3>
                  <p className="text-gray-600">
                    AI sẽ phân tích thông tin dự án và các mô hình đã chọn để tạo đề cương nghiên cứu chi tiết
                  </p>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg mb-6 text-left">
                  <h4 className="font-medium mb-2">Thông tin dự án:</h4>
                  <p><strong>Tiêu đề:</strong> {projectData.title}</p>
                  <p><strong>Lĩnh vực:</strong> {selectedDomain?.name}</p>
                  <p><strong>Mô hình đã chọn:</strong> {selectedModelObjects.map(m => m.name).join(', ')}</p>
                </div>

                <div className="flex gap-3">
                  <Button type="button" variant="outline" onClick={() => setStep(2)}>
                    <ArrowLeftIcon className="w-4 h-4 mr-2" />
                    Quay lại
                  </Button>
                  <Button 
                    onClick={generateOutline} 
                    disabled={isLoading}
                    className="flex-1"
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                        Đang tạo đề cương...
                      </>
                    ) : (
                      <>
                        <SparklesIcon className="w-4 h-4 mr-2" />
                        Tạo đề cương với AI
                      </>
                    )}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                  <h3 className="text-green-800 font-medium">✅ Đề cương đã được tạo thành công!</h3>
                  <p className="text-green-700 text-sm">AI đã phân tích và tạo đề cương nghiên cứu chi tiết cho dự án của bạn.</p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg max-h-96 overflow-y-auto">
                  <h4 className="font-medium mb-2">Xem trước đề cương:</h4>
                  <div className="text-sm space-y-2">
                    <p><strong>Tiêu đề:</strong> {generatedOutline.title}</p>
                    <p><strong>Tóm tắt:</strong> {generatedOutline.abstract?.substring(0, 200)}...</p>
                    <p><strong>Số giả thuyết:</strong> {generatedOutline.hypotheses?.length || 0}</p>
                    <p><strong>Số biến đề xuất:</strong> {generatedOutline.suggestedVariables?.length || 0}</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button type="button" variant="outline" onClick={() => setGeneratedOutline(null)}>
                    Tạo lại đề cương
                  </Button>
                  <Button 
                    onClick={createProject} 
                    disabled={isLoading}
                    className="flex-1"
                  >
                    {isLoading ? 'Đang tạo dự án...' : 'Tạo dự án'}
                  </Button>
                </div>
              </div>
            )}

            {error && (
              <div className="p-3 text-sm text-red-500 bg-red-50 border border-red-200 rounded-md mt-4">
                {error}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}