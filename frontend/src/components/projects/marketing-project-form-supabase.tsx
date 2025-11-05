'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  ArrowLeftIcon, 
  CheckIcon, 
  SparklesIcon,
  ChartBarIcon,
  GlobeAltIcon,
  UsersIcon,
  ComputerDesktopIcon,
  CurrencyDollarIcon,
  ShoppingBagIcon,
  CogIcon,
  UserGroupIcon,
  LightBulbIcon,
  HeartIcon,
  AcademicCapIcon
} from '@heroicons/react/24/outline'
import { geminiService } from '@/services/gemini'
import { marketingProjectsService } from '@/services/marketing-projects-no-auth'
import { useAuthStore } from '@/store/auth'

interface MarketingProjectFormProps {
  onSuccess?: (project: any) => void
  onCancel?: () => void
  hideNavigation?: boolean
}

// Icon mapping function
const getIconComponent = (iconName: string) => {
  const iconMap: { [key: string]: any } = {
    'chart-bar': ChartBarIcon,
    'globe-alt': GlobeAltIcon,
    'users': UsersIcon,
    'computer-desktop': ComputerDesktopIcon,
    'currency-dollar': CurrencyDollarIcon,
    'shopping-bag': ShoppingBagIcon,
    'chess-knight': CogIcon, // Using CogIcon as substitute
    'cog': CogIcon,
    'user-group': UserGroupIcon,
    'lightbulb': LightBulbIcon,
    'heart': HeartIcon,
    'academic-cap': AcademicCapIcon
  }
  
  return iconMap[iconName] || ChartBarIcon // Default fallback
}

export function MarketingProjectForm({ onSuccess, onCancel, hideNavigation = false }: MarketingProjectFormProps) {
  const router = useRouter()
  const { user } = useAuthStore()
  const [step, setStep] = useState(1) // 1: Basic Info, 2: Select Models, 3: Generate Outline
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Data from Supabase
  const [businessDomains, setBusinessDomains] = useState<any[]>([])
  const [marketingModels, setMarketingModels] = useState<any[]>([])
  
  // Form data
  const [projectData, setProjectData] = useState({
    title: '',
    description: '',
    businessDomainId: 0,
    selectedModels: [] as number[],
    researchObjectives: [] as string[]
  })
  
  const [generatedOutline, setGeneratedOutline] = useState<any>(null)

  // Load data from Supabase on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const [domains, models] = await Promise.all([
          marketingProjectsService.getBusinessDomains(),
          marketingProjectsService.getMarketingModels()
        ])
        
        setBusinessDomains(domains)
        setMarketingModels(models)
      } catch (err) {
        console.error('Failed to load data:', err)
        setError('Không thể tải dữ liệu. Vui lòng thử lại.')
      }
    }

    loadData()
  }, [])

  const selectedDomain = businessDomains.find(d => d.id === projectData.businessDomainId)
  const selectedModelObjects = marketingModels.filter(m => projectData.selectedModels.includes(m.id))

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
    if (!projectData.businessDomainId || projectData.businessDomainId === 0) {
      setError('Vui lòng chọn lĩnh vực kinh doanh')
      return
    }
    
    // Verify domain exists in available domains
    const domainExists = businessDomains.find(d => d.id === projectData.businessDomainId)
    if (!domainExists) {
      setError('Lĩnh vực kinh doanh đã chọn không hợp lệ. Vui lòng chọn lại.')
      return
    }
    
    console.log('✅ Form validation passed:', {
      title: projectData.title,
      businessDomainId: projectData.businessDomainId,
      domainName: domainExists.name
    })
    
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
      // Use test user ID when no auth (RLS disabled mode)
      const testUserId = user?.id || '9adc5570-5708-4cea-b150-4d37958509bb'
      
      // Create project in Supabase
      const newProject = await marketingProjectsService.createProject(testUserId, {
        title: generatedOutline?.title || projectData.title,
        description: projectData.description,
        business_domain_id: projectData.businessDomainId,
        selected_models: projectData.selectedModels,
        research_outline: generatedOutline,
        status: 'draft',
        progress: 60
      })
      
      console.log('✅ Project created successfully:', newProject)
      
      // Call success callback
      onSuccess?.(newProject)
      
      // Redirect to projects list with success message
      router.push('/projects?created=true&id=' + newProject.id)
      
    } catch (err: any) {
      console.error('❌ Failed to create project:', err)
      
      // Show specific error message
      if (err.message) {
        setError(err.message)
      } else if (err.toString().includes('row-level security')) {
        setError('Lỗi bảo mật: Vui lòng đăng nhập lại và thử lại.')
      } else {
        setError('Không thể tạo dự án. Vui lòng thử lại.')
      }
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
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <ComputerDesktopIcon className="w-5 h-5 text-blue-600" />
              </div>
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
                  {businessDomains.map((domain) => (
                    <div
                      key={domain.id}
                      onClick={() => setProjectData(prev => ({ ...prev, businessDomainId: domain.id }))}
                      className={`p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                        projectData.businessDomainId === domain.id
                          ? 'border-blue-500 bg-blue-50 shadow-md'
                          : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div 
                          className="w-10 h-10 rounded-lg flex items-center justify-center"
                          style={{ backgroundColor: domain.color + '20', color: domain.color }}
                        >
                          {(() => {
                            const IconComponent = getIconComponent(domain.icon)
                            return <IconComponent className="w-5 h-5" />
                          })()}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900">{domain.name_vi || domain.name}</h3>
                          <p className="text-sm text-gray-600 mt-1">{domain.description_vi || domain.description}</p>
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
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <LightBulbIcon className="w-5 h-5 text-purple-600" />
              </div>
              Chọn mô hình lý thuyết
            </CardTitle>
            <p className="text-sm text-gray-600">
              Chọn các mô hình lý thuyết phù hợp với nghiên cứu của bạn
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {marketingModels.map((model) => (
                <div
                  key={model.id}
                  onClick={() => toggleModel(model.id)}
                  className={`p-5 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                    projectData.selectedModels.includes(model.id)
                      ? 'border-blue-500 bg-blue-50 shadow-md'
                      : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mt-0.5 ${
                      projectData.selectedModels.includes(model.id)
                        ? 'border-blue-500 bg-blue-500'
                        : 'border-gray-300'
                    }`}>
                      {projectData.selectedModels.includes(model.id) && (
                        <CheckIcon className="w-4 h-4 text-white" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-gray-900">{model.name_vi || model.name}</h3>
                        {model.abbreviation && (
                          <span className="px-2 py-1 bg-gray-100 text-xs font-medium rounded-md">
                            {model.abbreviation}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{model.description_vi || model.description}</p>
                      
                      {model.category && (
                        <div className="flex items-center gap-2 mb-2">
                          <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded-md">
                            {model.category}
                          </span>
                          {model.year_developed && (
                            <span className="text-xs text-gray-500">
                              {model.year_developed}
                            </span>
                          )}
                        </div>
                      )}
                      
                      {model.key_authors && model.key_authors.length > 0 && (
                        <p className="text-xs text-gray-500 italic">
                          {model.key_authors.join(', ')}
                        </p>
                      )}
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
              <div className="w-8 h-8 bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg flex items-center justify-center">
                <SparklesIcon className="w-5 h-5 text-purple-600" />
              </div>
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