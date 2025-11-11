'use client'

import { useState, FormEvent } from 'react'
import { useAuthStore } from '@/store/auth'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle, Loader2, WifiOff, RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils'
import { parseSupabaseError, AuthErrorType } from '@/lib/errors/auth-errors'
import { retryAsync, isRetryableError } from '@/lib/utils/retry'
import { useNetworkStatus } from '@/hooks/use-network-status'
import { OAuthFallbackInstructions } from './oauth-fallback-instructions'

export interface AuthFormProps {
  mode: 'login' | 'register'
  onModeChange?: (mode: 'login' | 'register') => void
  onSuccess?: () => void
  isModal?: boolean
}

interface FormData {
  email: string
  password: string
  confirmPassword: string
  fullName: string
}

interface ValidationErrors {
  email?: string
  password?: string
  confirmPassword?: string
  fullName?: string
}

export function AuthForm({
  mode,
  onModeChange,
  onSuccess,
  isModal = false,
}: AuthFormProps) {
  const { login, register, loginWithGoogle, loginWithLinkedIn, isLoading, error, clearError } = useAuthStore()
  const networkStatus = useNetworkStatus()
  
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
  })
  
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({})
  const [localError, setLocalError] = useState<string | null>(null)
  const [errorType, setErrorType] = useState<AuthErrorType | null>(null)
  const [isSuccess, setIsSuccess] = useState(false)
  const [showError, setShowError] = useState(false)
  const [canRetry, setCanRetry] = useState(false)
  const [isRetrying, setIsRetrying] = useState(false)
  const [oauthError, setOauthError] = useState<{
    provider: 'google' | 'linkedin'
    type: 'popup_blocked' | 'access_denied' | 'general'
  } | null>(null)

  // Validate email format
  const validateEmail = (email: string): string | undefined => {
    if (!email) {
      return 'Email là bắt buộc'
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return 'Email không hợp lệ'
    }
    return undefined
  }

  // Validate password strength
  const validatePassword = (password: string): string | undefined => {
    if (!password) {
      return 'Mật khẩu là bắt buộc'
    }
    if (password.length < 6) {
      return 'Mật khẩu phải có ít nhất 6 ký tự'
    }
    return undefined
  }

  // Validate password confirmation
  const validateConfirmPassword = (confirmPassword: string, password: string): string | undefined => {
    if (mode === 'register') {
      if (!confirmPassword) {
        return 'Vui lòng xác nhận mật khẩu'
      }
      if (confirmPassword !== password) {
        return 'Mật khẩu không khớp'
      }
    }
    return undefined
  }

  // Validate full name
  const validateFullName = (fullName: string): string | undefined => {
    if (mode === 'register' && !fullName) {
      return 'Họ tên là bắt buộc'
    }
    return undefined
  }

  // Real-time validation on blur
  const handleBlur = (field: keyof FormData) => {
    let error: string | undefined

    switch (field) {
      case 'email':
        error = validateEmail(formData.email)
        break
      case 'password':
        error = validatePassword(formData.password)
        break
      case 'confirmPassword':
        error = validateConfirmPassword(formData.confirmPassword, formData.password)
        break
      case 'fullName':
        error = validateFullName(formData.fullName)
        break
    }

    setValidationErrors(prev => ({
      ...prev,
      [field]: error
    }))
  }

  // Validate entire form
  const validateForm = (): boolean => {
    const errors: ValidationErrors = {
      email: validateEmail(formData.email),
      password: validatePassword(formData.password),
    }

    if (mode === 'register') {
      errors.confirmPassword = validateConfirmPassword(formData.confirmPassword, formData.password)
      errors.fullName = validateFullName(formData.fullName)
    }

    setValidationErrors(errors)

    // Return true if no errors
    return !Object.values(errors).some(error => error !== undefined)
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setLocalError(null)
    setShowError(false)
    setCanRetry(false)
    setErrorType(null)
    clearError()

    // Check network status first
    if (networkStatus.isOffline) {
      const parsedError = parseSupabaseError(new Error('Network offline'))
      setLocalError(parsedError.message)
      setErrorType(parsedError.type)
      setCanRetry(true)
      setShowError(true)
      return
    }

    // Validate form
    if (!validateForm()) {
      return
    }

    try {
      // Wrap auth operation with retry logic for network errors
      await retryAsync(
        async () => {
          if (mode === 'login') {
            await login({
              email: formData.email,
              password: formData.password,
            })
          } else {
            await register({
              email: formData.email,
              password: formData.password,
              fullName: formData.fullName,
            })
          }
        },
        {
          maxAttempts: 2,
          initialDelay: 2000,
          shouldRetry: (error) => isRetryableError(error),
          onRetry: (error, attempt) => {
            console.log(`Retrying auth operation (attempt ${attempt})...`)
          }
        }
      )

      // Show success state briefly
      setIsSuccess(true)
      
      // Call success callback after animation
      setTimeout(() => {
        if (onSuccess) {
          onSuccess()
        }
      }, 300)
    } catch (err) {
      handleAuthError(err)
    }
  }

  const handleAuthError = (err: unknown) => {
    const parsedError = parseSupabaseError(err)
    setLocalError(parsedError.message)
    setErrorType(parsedError.type)
    setCanRetry(parsedError.isRetryable)
    
    // Trigger error animation
    setTimeout(() => {
      setShowError(true)
    }, 10)
  }

  const handleRetry = async () => {
    setIsRetrying(true)
    setLocalError(null)
    setShowError(false)
    setCanRetry(false)
    
    // Wait for retry delay
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    setIsRetrying(false)
    
    // Retry the last operation
    const submitEvent = new Event('submit') as any
    submitEvent.preventDefault = () => {}
    await handleSubmit(submitEvent)
  }

  const handleOAuthLogin = async (provider: 'google' | 'linkedin') => {
    setLocalError(null)
    setShowError(false)
    setCanRetry(false)
    setErrorType(null)
    setOauthError(null)
    clearError()

    // Check network status first
    if (networkStatus.isOffline) {
      const parsedError = parseSupabaseError(new Error('Network offline'))
      setLocalError(parsedError.message)
      setErrorType(parsedError.type)
      setCanRetry(true)
      setShowError(true)
      return
    }

    try {
      // Wrap OAuth operation with retry logic
      await retryAsync(
        async () => {
          if (provider === 'google') {
            await loginWithGoogle()
          } else {
            await loginWithLinkedIn()
          }
        },
        {
          maxAttempts: 2,
          initialDelay: 2000,
          shouldRetry: (error) => {
            // Don't retry if user cancelled or popup was blocked
            if (error instanceof Error) {
              const msg = error.message.toLowerCase()
              if (msg.includes('cancelled') || msg.includes('denied') || msg.includes('popup blocked')) {
                return false
              }
            }
            return isRetryableError(error)
          },
        }
      )
      
      // Show success state
      setIsSuccess(true)
      
      // OAuth will redirect, but call success callback just in case
      setTimeout(() => {
        if (onSuccess) {
          onSuccess()
        }
      }, 300)
    } catch (err) {
      handleAuthError(err)
      
      // Determine OAuth error type for fallback instructions
      if (err instanceof Error) {
        const msg = err.message.toLowerCase()
        if (msg.includes('popup') && msg.includes('blocked')) {
          setOauthError({ provider, type: 'popup_blocked' })
        } else if (msg.includes('access denied') || msg.includes('denied')) {
          setOauthError({ provider, type: 'access_denied' })
        } else if (errorType === AuthErrorType.OAUTH) {
          setOauthError({ provider, type: 'general' })
        }
      }
    }
  }

  const displayError = localError || error
  const isRegisterMode = mode === 'register'

  return (
    <div className={cn(
      'w-full transition-all duration-300',
      isModal ? 'max-w-md' : 'max-w-md mx-auto'
    )}>
      <div className="space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="text-center">
          <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900">
            {isRegisterMode ? 'Tạo tài khoản NCSKIT' : 'Đăng nhập vào NCSKIT'}
          </h2>
          <p className="mt-2 text-sm md:text-sm text-gray-600">
            {isRegisterMode ? 'Hoặc ' : 'Hoặc '}
            {onModeChange ? (
              <button
                type="button"
                onClick={() => onModeChange(isRegisterMode ? 'login' : 'register')}
                className="font-medium text-blue-600 hover:text-blue-500 min-h-[44px] inline-flex items-center focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded px-1"
                aria-label={isRegisterMode ? 'Chuyển sang đăng nhập' : 'Chuyển sang đăng ký'}
              >
                {isRegisterMode ? 'đăng nhập vào tài khoản có sẵn' : 'tạo tài khoản mới'}
              </button>
            ) : (
              <span className="font-medium text-blue-600">
                {isRegisterMode ? 'đăng nhập vào tài khoản có sẵn' : 'tạo tài khoản mới'}
              </span>
            )}
          </p>
        </div>

        {/* Network Status Warning */}
        {networkStatus.isOffline && !displayError && (
          <Alert 
            variant="destructive"
            className="transition-all duration-300 opacity-100 translate-y-0"
            role="alert"
            aria-live="assertive"
            aria-atomic="true"
          >
            <WifiOff className="h-4 w-4" aria-hidden="true" />
            <AlertDescription>
              Không có kết nối mạng. Vui lòng kiểm tra kết nối của bạn.
            </AlertDescription>
          </Alert>
        )}

        {/* Error Alert with fade-in animation and retry button */}
        {displayError && (
          <Alert 
            variant="destructive"
            className={`transition-all duration-300 ${
              showError 
                ? 'opacity-100 translate-y-0' 
                : 'opacity-0 -translate-y-2'
            }`}
            style={{ willChange: 'opacity, transform' }}
            role="alert"
            aria-live="assertive"
            aria-atomic="true"
          >
            <div className="flex items-start gap-2">
              {errorType === AuthErrorType.NETWORK ? (
                <WifiOff className="h-4 w-4 mt-0.5 flex-shrink-0" aria-hidden="true" />
              ) : (
                <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" aria-hidden="true" />
              )}
              <div className="flex-1">
                <AlertDescription className="mb-2">{displayError}</AlertDescription>
                {canRetry && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleRetry}
                    disabled={isRetrying || isLoading}
                    className="mt-2 h-8 text-xs bg-white hover:bg-gray-50"
                  >
                    {isRetrying ? (
                      <>
                        <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                        Đang thử lại...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="mr-1 h-3 w-3" />
                        Thử lại
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          </Alert>
        )}
        
        {/* Success State */}
        {isSuccess && (
          <Alert 
            className={`bg-green-50 border-green-200 text-green-800 transition-all duration-300 ${
              isSuccess 
                ? 'opacity-100 translate-y-0' 
                : 'opacity-0 -translate-y-2'
            }`}
            style={{ willChange: 'opacity, transform' }}
            role="status"
            aria-live="polite"
            aria-atomic="true"
          >
            <svg className="h-4 w-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <AlertDescription className="text-green-800">
              {mode === 'login' ? 'Đăng nhập thành công!' : 'Đăng ký thành công!'}
            </AlertDescription>
          </Alert>
        )}

        {/* OAuth Fallback Instructions */}
        {oauthError && (
          <OAuthFallbackInstructions 
            provider={oauthError.provider}
            errorType={oauthError.type}
          />
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name - Register only */}
          {isRegisterMode && (
            <div>
              <label htmlFor="fullName" className="sr-only">
                Họ và tên
              </label>
              <input
                id="fullName"
                name="fullName"
                type="text"
                autoComplete="name"
                required
                className={cn(
                  'appearance-none relative block w-full px-3 py-3 md:py-2 border placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 text-base md:text-sm min-h-[44px]',
                  validationErrors.fullName ? 'border-red-500' : 'border-gray-300'
                )}
                placeholder="Họ và tên"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                onBlur={() => handleBlur('fullName')}
                disabled={isLoading}
                aria-label="Họ và tên"
                aria-required="true"
                aria-invalid={!!validationErrors.fullName}
                aria-describedby={validationErrors.fullName ? 'fullName-error' : undefined}
              />
              {validationErrors.fullName && (
                <p 
                  id="fullName-error"
                  className="mt-1 text-sm text-red-600 animate-in fade-in slide-in-from-top-1 duration-200"
                  role="alert"
                  aria-live="polite"
                >
                  {validationErrors.fullName}
                </p>
              )}
            </div>
          )}

          {/* Email */}
          <div>
            <label htmlFor="email" className="sr-only">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className={cn(
                'appearance-none relative block w-full px-3 py-3 md:py-2 border placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 text-base md:text-sm min-h-[44px]',
                validationErrors.email ? 'border-red-500' : 'border-gray-300'
              )}
              placeholder="Địa chỉ email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              onBlur={() => handleBlur('email')}
              disabled={isLoading}
              aria-label="Địa chỉ email"
              aria-required="true"
              aria-invalid={!!validationErrors.email}
              aria-describedby={validationErrors.email ? 'email-error' : undefined}
            />
            {validationErrors.email && (
              <p 
                id="email-error"
                className="mt-1 text-sm text-red-600 animate-in fade-in slide-in-from-top-1 duration-200"
                role="alert"
                aria-live="polite"
              >
                {validationErrors.email}
              </p>
            )}
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="sr-only">
              Mật khẩu
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete={isRegisterMode ? 'new-password' : 'current-password'}
              required
              className={cn(
                'appearance-none relative block w-full px-3 py-3 md:py-2 border placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 text-base md:text-sm min-h-[44px]',
                validationErrors.password ? 'border-red-500' : 'border-gray-300'
              )}
              placeholder={isRegisterMode ? 'Mật khẩu (tối thiểu 6 ký tự)' : 'Mật khẩu'}
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              onBlur={() => handleBlur('password')}
              disabled={isLoading}
              aria-label="Mật khẩu"
              aria-required="true"
              aria-invalid={!!validationErrors.password}
              aria-describedby={validationErrors.password ? 'password-error' : undefined}
            />
            {validationErrors.password && (
              <p 
                id="password-error"
                className="mt-1 text-sm text-red-600 animate-in fade-in slide-in-from-top-1 duration-200"
                role="alert"
                aria-live="polite"
              >
                {validationErrors.password}
              </p>
            )}
          </div>

          {/* Confirm Password - Register only */}
          {isRegisterMode && (
            <div>
              <label htmlFor="confirmPassword" className="sr-only">
                Xác nhận mật khẩu
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                className={cn(
                  'appearance-none relative block w-full px-3 py-3 md:py-2 border placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 text-base md:text-sm min-h-[44px]',
                  validationErrors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                )}
                placeholder="Xác nhận mật khẩu"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                onBlur={() => handleBlur('confirmPassword')}
                disabled={isLoading}
                aria-label="Xác nhận mật khẩu"
                aria-required="true"
                aria-invalid={!!validationErrors.confirmPassword}
                aria-describedby={validationErrors.confirmPassword ? 'confirmPassword-error' : undefined}
              />
              {validationErrors.confirmPassword && (
                <p 
                  id="confirmPassword-error"
                  className="mt-1 text-sm text-red-600 animate-in fade-in slide-in-from-top-1 duration-200"
                  role="alert"
                  aria-live="polite"
                >
                  {validationErrors.confirmPassword}
                </p>
              )}
            </div>
          )}

          {/* Submit Button with loading and success animations */}
          <div>
            <Button
              type="submit"
              className={`w-full min-h-[44px] text-base md:text-sm transition-all duration-300 ${
                isLoading ? 'scale-95' : 'scale-100 hover:scale-105'
              } ${
                isSuccess ? 'bg-green-600 hover:bg-green-600' : ''
              }`}
              disabled={isLoading || isSuccess}
              style={{ willChange: 'transform, background-color' }}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isRegisterMode ? 'Đang tạo tài khoản...' : 'Đang đăng nhập...'}
                </>
              ) : isSuccess ? (
                <>
                  <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Thành công!
                </>
              ) : (
                isRegisterMode ? 'Đăng ký' : 'Đăng nhập'
              )}
            </Button>
          </div>
        </form>

        {/* OAuth Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">
              {isRegisterMode ? 'Hoặc đăng ký với' : 'Hoặc tiếp tục với'}
            </span>
          </div>
        </div>

        {/* OAuth Buttons with hover animations */}
        <div className="grid grid-cols-2 gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => handleOAuthLogin('google')}
            disabled={isLoading || isSuccess}
            className="min-h-[44px] text-base md:text-sm transition-all duration-200 hover:scale-105 hover:shadow-md"
            style={{ willChange: 'transform' }}
            aria-label="Đăng nhập bằng Google"
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" aria-hidden="true">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Google
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={() => handleOAuthLogin('linkedin')}
            disabled={isLoading || isSuccess}
            className="min-h-[44px] text-base md:text-sm transition-all duration-200 hover:scale-105 hover:shadow-md"
            style={{ willChange: 'transform' }}
            aria-label="Đăng nhập bằng LinkedIn"
          >
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
            </svg>
            LinkedIn
          </Button>
        </div>
      </div>
    </div>
  )
}
