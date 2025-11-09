'use client'

import React, { useState, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { 
  ChevronLeft, 
  ChevronRight, 
  Check, 
  AlertCircle,
  Users,
  DollarSign,
  Calendar,
  Settings,
  Eye
} from 'lucide-react'

interface CampaignFormData {
  basicInfo: {
    title: string
    description: string
    category: string
    tags: string[]
  }
  targeting: {
    targetParticipants: number
    eligibilityCriteria: Record<string, any>
    demographicFilters: Record<string, any>
  }
  rewards: {
    tokenRewardPerParticipant: number
    totalBudget: number
    adminFeePercentage: number
    estimatedCost: number
  }
  scheduling: {
    startDate?: Date
    endDate?: Date
    duration: number
    autoLaunch: boolean
  }
  survey: {
    surveyId?: string
    surveyConfig: Record<string, any>
    estimatedCompletionTime: number
  }
  settings: {
    allowMultipleResponses: boolean
    requireApproval: boolean
    autoApproveParticipants: boolean
    maxResponsesPerUser: number
  }
}

interface ValidationError {
  field: string
  message: string
}

interface CampaignStep {
  id: string
  title: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  isOptional: boolean
}

const CAMPAIGN_STEPS: CampaignStep[] = [
  {
    id: 'basic',
    title: 'Thông tin cơ bản',
    description: 'Tên, mô tả và phân loại chiến dịch',
    icon: Settings,
    isOptional: false
  },
  {
    id: 'targeting',
    title: 'Đối tượng mục tiêu',
    description: 'Số lượng và tiêu chí tham gia',
    icon: Users,
    isOptional: false
  },
  {
    id: 'rewards',
    title: 'Phần thưởng',
    description: 'Token rewards và ngân sách',
    icon: DollarSign,
    isOptional: false
  },
  {
    id: 'scheduling',
    title: 'Lịch trình',
    description: 'Thời gian bắt đầu và kết thúc',
    icon: Calendar,
    isOptional: true
  },
  {
    id: 'survey',
    title: 'Cấu hình khảo sát',
    description: 'Thiết lập câu hỏi và survey',
    icon: Settings,
    isOptional: false
  },
  {
    id: 'preview',
    title: 'Xem trước',
    description: 'Kiểm tra và xác nhận',
    icon: Eye,
    isOptional: false
  }
]

export default function CampaignCreationWizard() {
  const [currentStep, setCurrentStep] = useState(0)
  const [formData, setFormData] = useState<CampaignFormData>({
    basicInfo: {
      title: '',
      description: '',
      category: 'academic',
      tags: []
    },
    targeting: {
      targetParticipants: 100,
      eligibilityCriteria: {},
      demographicFilters: {}
    },
    rewards: {
      tokenRewardPerParticipant: 10,
      totalBudget: 0,
      adminFeePercentage: 10,
      estimatedCost: 0
    },
    scheduling: {
      duration: 30,
      autoLaunch: false
    },
    survey: {
      surveyConfig: {},
      estimatedCompletionTime: 10
    },
    settings: {
      allowMultipleResponses: false,
      requireApproval: false,
      autoApproveParticipants: true,
      maxResponsesPerUser: 1
    }
  })
  const [errors, setErrors] = useState<ValidationError[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const updateFormData = useCallback((section: keyof CampaignFormData, data: any) => {
    setFormData(prev => ({
      ...prev,
      [section]: { ...prev[section], ...data }
    }))
  }, [])

  const validateStep = (stepIndex: number): ValidationError[] => {
    const step = CAMPAIGN_STEPS[stepIndex]
    const stepErrors: ValidationError[] = []

    switch (step.id) {
      case 'basic':
        if (!formData.basicInfo.title.trim()) {
          stepErrors.push({ field: 'title', message: 'Tên chiến dịch là bắt buộc' })
        }
        if (!formData.basicInfo.description.trim()) {
          stepErrors.push({ field: 'description', message: 'Mô tả chiến dịch là bắt buộc' })
        }
        break
      case 'targeting':
        if (formData.targeting.targetParticipants <= 0) {
          stepErrors.push({ field: 'targetParticipants', message: 'Số lượng tham gia phải lớn hơn 0' })
        }
        break
      case 'rewards':
        if (formData.rewards.tokenRewardPerParticipant <= 0) {
          stepErrors.push({ field: 'tokenRewardPerParticipant', message: 'Phần thưởng phải lớn hơn 0' })
        }
        break
    }

    return stepErrors
  }

  const nextStep = () => {
    const stepErrors = validateStep(currentStep)
    setErrors(stepErrors)
    
    if (stepErrors.length === 0 && currentStep < CAMPAIGN_STEPS.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const previousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
      setErrors([])
    }
  }

  const calculateEstimatedCost = () => {
    const totalRewards = formData.targeting.targetParticipants * formData.rewards.tokenRewardPerParticipant
    const adminFee = totalRewards * (formData.rewards.adminFeePercentage / 100)
    return totalRewards + adminFee
  }

  const submitCampaign = async () => {
    setIsSubmitting(true)
    try {
      // Campaign submission will be implemented with backend integration
      alert('Campaign creation feature coming soon!')
      // await campaignService.createCampaign(formData)
    } catch (error) {
      console.error('Error creating campaign:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderStepContent = () => {
    const step = CAMPAIGN_STEPS[currentStep]

    switch (step.id) {
      case 'basic':
        return (
          <div className="space-y-6">
            <div>
              <Label htmlFor="title">Tên chiến dịch *</Label>
              <Input
                id="title"
                value={formData.basicInfo.title}
                onChange={(e) => updateFormData('basicInfo', { title: e.target.value })}
                placeholder="Nhập tên chiến dịch..."
                className={errors.find(e => e.field === 'title') ? 'border-red-500' : ''}
              />
              {errors.find(e => e.field === 'title') && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.find(e => e.field === 'title')?.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="description">Mô tả chiến dịch *</Label>
              <Textarea
                id="description"
                value={formData.basicInfo.description}
                onChange={(e) => updateFormData('basicInfo', { description: e.target.value })}
                placeholder="Mô tả mục đích và nội dung của chiến dịch..."
                rows={4}
                className={errors.find(e => e.field === 'description') ? 'border-red-500' : ''}
              />
              {errors.find(e => e.field === 'description') && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.find(e => e.field === 'description')?.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="category">Danh mục</Label>
              <select
                id="category"
                value={formData.basicInfo.category}
                onChange={(e) => updateFormData('basicInfo', { category: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="academic">Nghiên cứu học thuật</option>
                <option value="market">Nghiên cứu thị trường</option>
                <option value="social">Nghiên cứu xã hội</option>
                <option value="health">Sức khỏe & Y tế</option>
                <option value="technology">Công nghệ</option>
                <option value="education">Giáo dục</option>
                <option value="general">Khảo sát chung</option>
              </select>
            </div>
          </div>
        )

      case 'targeting':
        return (
          <div className="space-y-6">
            <div>
              <Label htmlFor="targetParticipants">Số lượng tham gia mục tiêu *</Label>
              <Input
                id="targetParticipants"
                type="number"
                value={formData.targeting.targetParticipants}
                onChange={(e) => updateFormData('targeting', { targetParticipants: parseInt(e.target.value) || 0 })}
                placeholder="100"
                min="1"
                className={errors.find(e => e.field === 'targetParticipants') ? 'border-red-500' : ''}
              />
              {errors.find(e => e.field === 'targetParticipants') && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.find(e => e.field === 'targetParticipants')?.message}
                </p>
              )}
            </div>

            <div>
              <Label>Tiêu chí tham gia</Label>
              <div className="space-y-3 mt-2">
                <div className="flex items-center space-x-2">
                  <input type="checkbox" id="age18plus" className="rounded" />
                  <Label htmlFor="age18plus">Từ 18 tuổi trở lên</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input type="checkbox" id="verified" className="rounded" />
                  <Label htmlFor="verified">Tài khoản đã xác thực</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input type="checkbox" id="active" className="rounded" />
                  <Label htmlFor="active">Hoạt động trong 30 ngày qua</Label>
                </div>
              </div>
            </div>

            <div>
              <Label>Bộ lọc nhân khẩu học</Label>
              <div className="grid grid-cols-2 gap-4 mt-2">
                <div>
                  <Label htmlFor="minAge">Tuổi tối thiểu</Label>
                  <Input id="minAge" type="number" placeholder="18" />
                </div>
                <div>
                  <Label htmlFor="maxAge">Tuổi tối đa</Label>
                  <Input id="maxAge" type="number" placeholder="65" />
                </div>
              </div>
            </div>
          </div>
        )

      case 'rewards':
        return (
          <div className="space-y-6">
            <div>
              <Label htmlFor="tokenReward">Token reward mỗi người tham gia *</Label>
              <Input
                id="tokenReward"
                type="number"
                value={formData.rewards.tokenRewardPerParticipant}
                onChange={(e) => updateFormData('rewards', { tokenRewardPerParticipant: parseFloat(e.target.value) || 0 })}
                placeholder="10"
                min="0.01"
                step="0.01"
                className={errors.find(e => e.field === 'tokenRewardPerParticipant') ? 'border-red-500' : ''}
              />
              {errors.find(e => e.field === 'tokenRewardPerParticipant') && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.find(e => e.field === 'tokenRewardPerParticipant')?.message}
                </p>
              )}
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium mb-3">Ước tính chi phí</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Tổng rewards:</span>
                  <span>{(formData.targeting.targetParticipants * formData.rewards.tokenRewardPerParticipant).toFixed(2)} tokens</span>
                </div>
                <div className="flex justify-between">
                  <span>Phí hệ thống ({formData.rewards.adminFeePercentage}%):</span>
                  <span>{((formData.targeting.targetParticipants * formData.rewards.tokenRewardPerParticipant) * (formData.rewards.adminFeePercentage / 100)).toFixed(2)} tokens</span>
                </div>
                <div className="flex justify-between font-medium border-t pt-2">
                  <span>Tổng chi phí:</span>
                  <span>{calculateEstimatedCost().toFixed(2)} tokens</span>
                </div>
              </div>
            </div>
          </div>
        )

      case 'scheduling':
        return (
          <div className="space-y-6">
            <div>
              <Label htmlFor="duration">Thời gian chạy (ngày)</Label>
              <Input
                id="duration"
                type="number"
                value={formData.scheduling.duration}
                onChange={(e) => updateFormData('scheduling', { duration: parseInt(e.target.value) || 30 })}
                placeholder="30"
                min="1"
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="autoLaunch"
                checked={formData.scheduling.autoLaunch}
                onChange={(e) => updateFormData('scheduling', { autoLaunch: e.target.checked })}
                className="rounded"
              />
              <Label htmlFor="autoLaunch">Tự động khởi chạy sau khi tạo</Label>
            </div>
          </div>
        )

      case 'survey':
        return (
          <div className="space-y-6">
            <div>
              <Label htmlFor="completionTime">Thời gian hoàn thành ước tính (phút)</Label>
              <Input
                id="completionTime"
                type="number"
                value={formData.survey.estimatedCompletionTime}
                onChange={(e) => updateFormData('survey', { estimatedCompletionTime: parseInt(e.target.value) || 10 })}
                placeholder="10"
                min="1"
              />
            </div>

            <div>
              <Label>Cấu hình khảo sát</Label>
              <div className="mt-2 p-4 border-2 border-dashed border-gray-300 rounded-lg text-center">
                <p className="text-gray-500">Chọn hoặc tạo khảo sát</p>
                <Button variant="outline" className="mt-2">
                  Chọn khảo sát
                </Button>
              </div>
            </div>
          </div>
        )

      case 'preview':
        return (
          <div className="space-y-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium mb-2">Tóm tắt chiến dịch</h4>
              <div className="space-y-2 text-sm">
                <div><strong>Tên:</strong> {formData.basicInfo.title}</div>
                <div><strong>Mô tả:</strong> {formData.basicInfo.description}</div>
                <div><strong>Số lượng tham gia:</strong> {formData.targeting.targetParticipants} người</div>
                <div><strong>Reward:</strong> {formData.rewards.tokenRewardPerParticipant} tokens/người</div>
                <div><strong>Thời gian:</strong> {formData.scheduling.duration} ngày</div>
                <div><strong>Tổng chi phí:</strong> {calculateEstimatedCost().toFixed(2)} tokens</div>
              </div>
            </div>

            <div className="flex items-start space-x-2 p-4 bg-yellow-50 rounded-lg">
              <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-yellow-800">Lưu ý quan trọng</p>
                <p className="text-yellow-700">
                  Sau khi tạo chiến dịch, bạn sẽ cần có đủ tokens trong tài khoản để chi trả cho participants.
                  Chiến dịch sẽ được gửi để admin xem xét trước khi được phê duyệt.
                </p>
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  const progress = ((currentStep + 1) / CAMPAIGN_STEPS.length) * 100

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Tạo chiến dịch khảo sát</h1>
        <p className="text-gray-600">Tạo chiến dịch để thu thập dữ liệu từ cộng đồng</p>
      </div>

      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">
            Bước {currentStep + 1} / {CAMPAIGN_STEPS.length}
          </span>
          <span className="text-sm text-gray-500">{Math.round(progress)}% hoàn thành</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Step Navigation */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {CAMPAIGN_STEPS.map((step, index) => {
            const Icon = step.icon
            const isActive = index === currentStep
            const isCompleted = index < currentStep
            const hasError = errors.length > 0 && index === currentStep

            return (
              <div key={step.id} className="flex flex-col items-center">
                <div className={`
                  w-10 h-10 rounded-full flex items-center justify-center mb-2
                  ${isCompleted ? 'bg-green-500 text-white' : 
                    isActive ? (hasError ? 'bg-red-500 text-white' : 'bg-blue-500 text-white') : 
                    'bg-gray-200 text-gray-500'}
                `}>
                  {isCompleted ? <Check className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
                </div>
                <div className="text-center">
                  <div className={`text-sm font-medium ${isActive ? 'text-blue-600' : 'text-gray-500'}`}>
                    {step.title}
                  </div>
                  {step.isOptional && (
                    <Badge variant="secondary" className="text-xs mt-1">Tùy chọn</Badge>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Step Content */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            {React.createElement(CAMPAIGN_STEPS[currentStep].icon, { className: "h-5 w-5" })}
            <span>{CAMPAIGN_STEPS[currentStep].title}</span>
          </CardTitle>
          <p className="text-gray-600">{CAMPAIGN_STEPS[currentStep].description}</p>
        </CardHeader>
        <CardContent>
          {renderStepContent()}
        </CardContent>
      </Card>

      {/* Navigation Buttons */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={previousStep}
          disabled={currentStep === 0}
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Quay lại
        </Button>

        <div className="space-x-2">
          <Button variant="outline">
            Lưu nháp
          </Button>
          
          {currentStep === CAMPAIGN_STEPS.length - 1 ? (
            <Button onClick={submitCampaign} disabled={isSubmitting}>
              {isSubmitting ? 'Đang tạo...' : 'Tạo chiến dịch'}
            </Button>
          ) : (
            <Button onClick={nextStep}>
              Tiếp theo
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}