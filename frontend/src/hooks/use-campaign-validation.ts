import { useState, useCallback, useEffect } from 'react'

export interface ValidationError {
  field: string
  message: string
  code: string
  severity: 'error' | 'warning'
}

export interface ValidationResult {
  isValid: boolean
  errors: ValidationError[]
  warnings: ValidationError[]
}

export interface CampaignFormData {
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

interface ValidationRules {
  [key: string]: {
    required?: boolean
    minLength?: number
    maxLength?: number
    min?: number
    max?: number
    pattern?: RegExp
    custom?: (value: any, formData: CampaignFormData) => string | null
  }
}

const VALIDATION_RULES: ValidationRules = {
  'basicInfo.title': {
    required: true,
    minLength: 3,
    maxLength: 255,
    custom: (value: string) => {
      if (value && value.trim().length < 3) {
        return 'Tên chiến dịch phải có ít nhất 3 ký tự'
      }
      return null
    }
  },
  'basicInfo.description': {
    required: true,
    minLength: 10,
    maxLength: 2000,
    custom: (value: string) => {
      if (value && value.trim().length < 10) {
        return 'Mô tả phải có ít nhất 10 ký tự'
      }
      return null
    }
  },
  'targeting.targetParticipants': {
    required: true,
    min: 1,
    max: 10000,
    custom: (value: number) => {
      if (value && value < 1) {
        return 'Số lượng tham gia phải lớn hơn 0'
      }
      if (value && value > 10000) {
        return 'Số lượng tham gia không được vượt quá 10,000'
      }
      return null
    }
  },
  'rewards.tokenRewardPerParticipant': {
    required: true,
    min: 0.01,
    max: 1000,
    custom: (value: number) => {
      if (value && value < 0.01) {
        return 'Phần thưởng phải lớn hơn 0.01 tokens'
      }
      if (value && value > 1000) {
        return 'Phần thưởng không được vượt quá 1,000 tokens'
      }
      return null
    }
  },
  'scheduling.duration': {
    required: true,
    min: 1,
    max: 365,
    custom: (value: number) => {
      if (value && value < 1) {
        return 'Thời gian chạy phải ít nhất 1 ngày'
      }
      if (value && value > 365) {
        return 'Thời gian chạy không được vượt quá 365 ngày'
      }
      return null
    }
  },
  'survey.estimatedCompletionTime': {
    required: true,
    min: 1,
    max: 120,
    custom: (value: number) => {
      if (value && value < 1) {
        return 'Thời gian hoàn thành phải ít nhất 1 phút'
      }
      if (value && value > 120) {
        return 'Thời gian hoàn thành không nên vượt quá 120 phút'
      }
      return null
    }
  }
}

export function useCampaignValidation(formData: CampaignFormData) {
  const [errors, setErrors] = useState<ValidationError[]>([])
  const [warnings, setWarnings] = useState<ValidationError[]>([])
  const [isValidating, setIsValidating] = useState(false)

  const getNestedValue = (obj: any, path: string): any => {
    return path.split('.').reduce((current, key) => current?.[key], obj)
  }

  const validateField = useCallback((fieldPath: string, value: any): ValidationError[] => {
    const rule = VALIDATION_RULES[fieldPath]
    if (!rule) return []

    const fieldErrors: ValidationError[] = []

    // Required validation
    if (rule.required && (value === undefined || value === null || value === '')) {
      fieldErrors.push({
        field: fieldPath,
        message: 'Trường này là bắt buộc',
        code: 'REQUIRED',
        severity: 'error'
      })
      return fieldErrors
    }

    // Skip other validations if value is empty and not required
    if (!rule.required && (value === undefined || value === null || value === '')) {
      return fieldErrors
    }

    // String length validations
    if (typeof value === 'string') {
      if (rule.minLength && value.length < rule.minLength) {
        fieldErrors.push({
          field: fieldPath,
          message: `Phải có ít nhất ${rule.minLength} ký tự`,
          code: 'MIN_LENGTH',
          severity: 'error'
        })
      }
      if (rule.maxLength && value.length > rule.maxLength) {
        fieldErrors.push({
          field: fieldPath,
          message: `Không được vượt quá ${rule.maxLength} ký tự`,
          code: 'MAX_LENGTH',
          severity: 'error'
        })
      }
    }

    // Number range validations
    if (typeof value === 'number') {
      if (rule.min !== undefined && value < rule.min) {
        fieldErrors.push({
          field: fieldPath,
          message: `Giá trị phải lớn hơn hoặc bằng ${rule.min}`,
          code: 'MIN_VALUE',
          severity: 'error'
        })
      }
      if (rule.max !== undefined && value > rule.max) {
        fieldErrors.push({
          field: fieldPath,
          message: `Giá trị không được vượt quá ${rule.max}`,
          code: 'MAX_VALUE',
          severity: 'error'
        })
      }
    }

    // Pattern validation
    if (rule.pattern && typeof value === 'string' && !rule.pattern.test(value)) {
      fieldErrors.push({
        field: fieldPath,
        message: 'Định dạng không hợp lệ',
        code: 'INVALID_FORMAT',
        severity: 'error'
      })
    }

    // Custom validation
    if (rule.custom) {
      const customError = rule.custom(value, formData)
      if (customError) {
        fieldErrors.push({
          field: fieldPath,
          message: customError,
          code: 'CUSTOM_VALIDATION',
          severity: 'error'
        })
      }
    }

    return fieldErrors
  }, [formData])

  const validateStep = useCallback((stepId: string): ValidationResult => {
    const stepErrors: ValidationError[] = []
    const stepWarnings: ValidationError[] = []

    const fieldsToValidate = getFieldsForStep(stepId)
    
    fieldsToValidate.forEach(fieldPath => {
      const value = getNestedValue(formData, fieldPath)
      const fieldErrors = validateField(fieldPath, value)
      stepErrors.push(...fieldErrors)
    })

    // Add step-specific business logic validations
    const businessValidation = validateStepBusinessLogic(stepId, formData)
    stepErrors.push(...businessValidation.errors)
    stepWarnings.push(...businessValidation.warnings)

    return {
      isValid: stepErrors.length === 0,
      errors: stepErrors,
      warnings: stepWarnings
    }
  }, [formData, validateField])

  const validateAllFields = useCallback((): ValidationResult => {
    const allErrors: ValidationError[] = []
    const allWarnings: ValidationError[] = []

    Object.keys(VALIDATION_RULES).forEach(fieldPath => {
      const value = getNestedValue(formData, fieldPath)
      const fieldErrors = validateField(fieldPath, value)
      allErrors.push(...fieldErrors)
    })

    // Add global business logic validations
    const globalValidation = validateGlobalBusinessLogic(formData)
    allErrors.push(...globalValidation.errors)
    allWarnings.push(...globalValidation.warnings)

    return {
      isValid: allErrors.length === 0,
      errors: allErrors,
      warnings: allWarnings
    }
  }, [formData, validateField])

  const validateFieldAsync = useCallback(async (fieldPath: string, value: any): Promise<ValidationError[]> => {
    setIsValidating(true)
    
    try {
      // Simulate async validation (e.g., checking uniqueness)
      await new Promise(resolve => setTimeout(resolve, 300))
      
      const asyncErrors: ValidationError[] = []
      
      // Example: Check campaign title uniqueness
      if (fieldPath === 'basicInfo.title' && value) {
        // TODO: Implement actual API call
        const isUnique = await checkCampaignTitleUniqueness(value)
        if (!isUnique) {
          asyncErrors.push({
            field: fieldPath,
            message: 'Tên chiến dịch đã tồn tại',
            code: 'DUPLICATE_TITLE',
            severity: 'error'
          })
        }
      }
      
      return asyncErrors
    } finally {
      setIsValidating(false)
    }
  }, [])

  // Real-time validation effect
  useEffect(() => {
    const allValidation = validateAllFields()
    setErrors(allValidation.errors)
    setWarnings(allValidation.warnings)
  }, [formData, validateAllFields])

  return {
    errors,
    warnings,
    isValidating,
    validateField,
    validateStep,
    validateAllFields,
    validateFieldAsync,
    hasErrors: errors.length > 0,
    hasWarnings: warnings.length > 0,
    getFieldErrors: (fieldPath: string) => errors.filter(e => e.field === fieldPath),
    getFieldWarnings: (fieldPath: string) => warnings.filter(w => w.field === fieldPath)
  }
}

function getFieldsForStep(stepId: string): string[] {
  switch (stepId) {
    case 'basic':
      return ['basicInfo.title', 'basicInfo.description']
    case 'targeting':
      return ['targeting.targetParticipants']
    case 'rewards':
      return ['rewards.tokenRewardPerParticipant']
    case 'scheduling':
      return ['scheduling.duration']
    case 'survey':
      return ['survey.estimatedCompletionTime']
    default:
      return []
  }
}

function validateStepBusinessLogic(stepId: string, formData: CampaignFormData): { errors: ValidationError[], warnings: ValidationError[] } {
  const errors: ValidationError[] = []
  const warnings: ValidationError[] = []

  switch (stepId) {
    case 'rewards':
      // Check if total cost is reasonable
      const totalCost = formData.targeting.targetParticipants * formData.rewards.tokenRewardPerParticipant
      const estimatedCost = totalCost * (1 + formData.rewards.adminFeePercentage / 100)
      
      if (estimatedCost > 10000) {
        warnings.push({
          field: 'rewards.estimatedCost',
          message: 'Chi phí ước tính khá cao. Bạn có chắc chắn muốn tiếp tục?',
          code: 'HIGH_COST',
          severity: 'warning'
        })
      }
      
      if (formData.rewards.tokenRewardPerParticipant < 1) {
        warnings.push({
          field: 'rewards.tokenRewardPerParticipant',
          message: 'Phần thưởng thấp có thể ảnh hưởng đến tỷ lệ tham gia',
          code: 'LOW_REWARD',
          severity: 'warning'
        })
      }
      break

    case 'targeting':
      if (formData.targeting.targetParticipants > 1000) {
        warnings.push({
          field: 'targeting.targetParticipants',
          message: 'Số lượng tham gia lớn có thể mất nhiều thời gian để hoàn thành',
          code: 'LARGE_TARGET',
          severity: 'warning'
        })
      }
      break

    case 'scheduling':
      if (formData.scheduling.duration < 7) {
        warnings.push({
          field: 'scheduling.duration',
          message: 'Thời gian ngắn có thể không đủ để đạt được số lượng tham gia mong muốn',
          code: 'SHORT_DURATION',
          severity: 'warning'
        })
      }
      break
  }

  return { errors, warnings }
}

function validateGlobalBusinessLogic(formData: CampaignFormData): { errors: ValidationError[], warnings: ValidationError[] } {
  const errors: ValidationError[] = []
  const warnings: ValidationError[] = []

  // Check if survey is configured
  if (!formData.survey.surveyId && Object.keys(formData.survey.surveyConfig).length === 0) {
    errors.push({
      field: 'survey.surveyConfig',
      message: 'Bạn cần chọn hoặc tạo một khảo sát',
      code: 'NO_SURVEY',
      severity: 'error'
    })
  }

  // Check completion time vs reward ratio
  const timeToRewardRatio = formData.survey.estimatedCompletionTime / formData.rewards.tokenRewardPerParticipant
  if (timeToRewardRatio > 5) {
    warnings.push({
      field: 'rewards.tokenRewardPerParticipant',
      message: 'Tỷ lệ thời gian/phần thưởng có thể không hấp dẫn với người tham gia',
      code: 'POOR_TIME_REWARD_RATIO',
      severity: 'warning'
    })
  }

  return { errors, warnings }
}

async function checkCampaignTitleUniqueness(title: string): Promise<boolean> {
  // TODO: Implement actual API call to check title uniqueness
  // For now, simulate with a simple check
  const existingTitles = ['Test Campaign', 'Sample Survey', 'Demo Campaign']
  return !existingTitles.includes(title)
}