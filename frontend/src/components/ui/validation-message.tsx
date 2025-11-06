import React from 'react'
import { AlertCircle, AlertTriangle, CheckCircle, Info } from 'lucide-react'
import { ValidationError } from '@/hooks/use-campaign-validation'

interface ValidationMessageProps {
  errors?: ValidationError[]
  warnings?: ValidationError[]
  className?: string
}

export function ValidationMessage({ errors = [], warnings = [], className = '' }: ValidationMessageProps) {
  if (errors.length === 0 && warnings.length === 0) {
    return null
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {errors.map((error, index) => (
        <div key={`error-${index}`} className="flex items-start space-x-2 p-3 bg-red-50 border border-red-200 rounded-md">
          <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm text-red-700 font-medium">Lỗi</p>
            <p className="text-sm text-red-600">{error.message}</p>
          </div>
        </div>
      ))}
      
      {warnings.map((warning, index) => (
        <div key={`warning-${index}`} className="flex items-start space-x-2 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
          <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm text-yellow-700 font-medium">Cảnh báo</p>
            <p className="text-sm text-yellow-600">{warning.message}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

interface FieldValidationProps {
  fieldPath: string
  errors: ValidationError[]
  warnings: ValidationError[]
  showSuccess?: boolean
  className?: string
}

export function FieldValidation({ 
  fieldPath, 
  errors, 
  warnings, 
  showSuccess = false, 
  className = '' 
}: FieldValidationProps) {
  const fieldErrors = errors.filter(e => e.field === fieldPath)
  const fieldWarnings = warnings.filter(w => w.field === fieldPath)
  
  const hasErrors = fieldErrors.length > 0
  const hasWarnings = fieldWarnings.length > 0
  const isValid = !hasErrors && !hasWarnings

  if (!hasErrors && !hasWarnings && !showSuccess) {
    return null
  }

  return (
    <div className={`mt-1 ${className}`}>
      {fieldErrors.map((error, index) => (
        <div key={`field-error-${index}`} className="flex items-center space-x-1 text-red-600">
          <AlertCircle className="h-3 w-3" />
          <span className="text-xs">{error.message}</span>
        </div>
      ))}
      
      {fieldWarnings.map((warning, index) => (
        <div key={`field-warning-${index}`} className="flex items-center space-x-1 text-yellow-600">
          <AlertTriangle className="h-3 w-3" />
          <span className="text-xs">{warning.message}</span>
        </div>
      ))}
      
      {showSuccess && isValid && (
        <div className="flex items-center space-x-1 text-green-600">
          <CheckCircle className="h-3 w-3" />
          <span className="text-xs">Hợp lệ</span>
        </div>
      )}
    </div>
  )
}

interface ValidationSummaryProps {
  errors: ValidationError[]
  warnings: ValidationError[]
  className?: string
}

export function ValidationSummary({ errors, warnings, className = '' }: ValidationSummaryProps) {
  const totalIssues = errors.length + warnings.length
  
  if (totalIssues === 0) {
    return (
      <div className={`flex items-center space-x-2 p-3 bg-green-50 border border-green-200 rounded-md ${className}`}>
        <CheckCircle className="h-4 w-4 text-green-500" />
        <span className="text-sm text-green-700 font-medium">Tất cả thông tin đã hợp lệ</span>
      </div>
    )
  }

  return (
    <div className={`p-3 bg-gray-50 border border-gray-200 rounded-md ${className}`}>
      <div className="flex items-center space-x-2 mb-2">
        <Info className="h-4 w-4 text-gray-500" />
        <span className="text-sm text-gray-700 font-medium">Tóm tắt xác thực</span>
      </div>
      
      <div className="space-y-1 text-sm">
        {errors.length > 0 && (
          <div className="flex items-center space-x-2 text-red-600">
            <AlertCircle className="h-3 w-3" />
            <span>{errors.length} lỗi cần khắc phục</span>
          </div>
        )}
        
        {warnings.length > 0 && (
          <div className="flex items-center space-x-2 text-yellow-600">
            <AlertTriangle className="h-3 w-3" />
            <span>{warnings.length} cảnh báo</span>
          </div>
        )}
      </div>
    </div>
  )
}