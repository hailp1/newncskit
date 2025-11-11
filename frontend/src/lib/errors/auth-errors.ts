/**
 * Authentication Error Handling Utilities
 * Provides comprehensive error detection, categorization, and user-friendly messages
 */

export enum AuthErrorType {
  VALIDATION = 'validation',
  AUTHENTICATION = 'authentication',
  NETWORK = 'network',
  OAUTH = 'oauth',
  RATE_LIMIT = 'rate_limit',
  SERVER = 'server',
  UNKNOWN = 'unknown',
}

export interface AuthError {
  type: AuthErrorType
  message: string
  originalError?: Error | unknown
  isRetryable: boolean
  retryAfter?: number // seconds
}

/**
 * Detect if error is network-related
 */
export function isNetworkError(error: unknown): boolean {
  if (error instanceof TypeError && error.message.includes('fetch')) {
    return true
  }
  
  if (error instanceof Error) {
    const message = error.message.toLowerCase()
    return (
      message.includes('network') ||
      message.includes('fetch') ||
      message.includes('connection') ||
      message.includes('timeout') ||
      message.includes('offline') ||
      message.includes('unreachable')
    )
  }
  
  // Check if browser is offline
  if (typeof window !== 'undefined' && !window.navigator.onLine) {
    return true
  }
  
  return false
}

/**
 * Detect if error is rate limit related
 */
export function isRateLimitError(error: unknown): boolean {
  if (error instanceof Error) {
    const message = error.message.toLowerCase()
    return (
      message.includes('rate limit') ||
      message.includes('too many requests') ||
      message.includes('429')
    )
  }
  return false
}

/**
 * Detect if error is OAuth related
 */
export function isOAuthError(error: unknown): boolean {
  if (error instanceof Error) {
    const message = error.message.toLowerCase()
    return (
      message.includes('oauth') ||
      message.includes('popup') ||
      message.includes('blocked') ||
      message.includes('provider') ||
      message.includes('window closed') ||
      message.includes('user cancelled') ||
      message.includes('access denied')
    )
  }
  return false
}

/**
 * Detect if error is popup blocker related
 */
export function isPopupBlockedError(error: unknown): boolean {
  if (error instanceof Error) {
    const message = error.message.toLowerCase()
    return (
      message.includes('popup') && message.includes('blocked') ||
      message.includes('popup blocker') ||
      message.includes('window.open')
    )
  }
  return false
}

/**
 * Parse Supabase auth error messages
 */
export function parseSupabaseError(error: unknown): AuthError {
  if (!error) {
    return {
      type: AuthErrorType.UNKNOWN,
      message: 'Đã xảy ra lỗi không xác định',
      isRetryable: false,
    }
  }

  const errorMessage = error instanceof Error ? error.message : String(error)
  const lowerMessage = errorMessage.toLowerCase()

  // Network errors
  if (isNetworkError(error)) {
    return {
      type: AuthErrorType.NETWORK,
      message: 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng.',
      originalError: error,
      isRetryable: true,
    }
  }

  // Rate limit errors
  if (isRateLimitError(error)) {
    return {
      type: AuthErrorType.RATE_LIMIT,
      message: 'Bạn đã thử quá nhiều lần. Vui lòng đợi một chút rồi thử lại.',
      originalError: error,
      isRetryable: true,
      retryAfter: 60, // 1 minute
    }
  }

  // Popup blocker errors
  if (isPopupBlockedError(error)) {
    return {
      type: AuthErrorType.OAUTH,
      message: 'Cửa sổ đăng nhập bị chặn. Vui lòng cho phép popup và thử lại.',
      originalError: error,
      isRetryable: true,
    }
  }

  // OAuth errors
  if (isOAuthError(error)) {
    // Check for specific OAuth error patterns
    if (lowerMessage.includes('user cancelled') || lowerMessage.includes('window closed')) {
      return {
        type: AuthErrorType.OAUTH,
        message: 'Đăng nhập đã bị hủy',
        originalError: error,
        isRetryable: true,
      }
    }
    
    if (lowerMessage.includes('access denied')) {
      return {
        type: AuthErrorType.OAUTH,
        message: 'Quyền truy cập bị từ chối. Vui lòng cấp quyền và thử lại.',
        originalError: error,
        isRetryable: true,
      }
    }
    
    return {
      type: AuthErrorType.OAUTH,
      message: 'Đăng nhập OAuth thất bại. Vui lòng kiểm tra cài đặt trình duyệt.',
      originalError: error,
      isRetryable: true,
    }
  }

  // Invalid credentials
  if (lowerMessage.includes('invalid') && (lowerMessage.includes('credentials') || lowerMessage.includes('password'))) {
    return {
      type: AuthErrorType.AUTHENTICATION,
      message: 'Email hoặc mật khẩu không đúng',
      originalError: error,
      isRetryable: false,
    }
  }

  // User not found
  if (lowerMessage.includes('user not found') || lowerMessage.includes('no user')) {
    return {
      type: AuthErrorType.AUTHENTICATION,
      message: 'Tài khoản không tồn tại',
      originalError: error,
      isRetryable: false,
    }
  }

  // Email already exists
  if (lowerMessage.includes('already') && lowerMessage.includes('registered')) {
    return {
      type: AuthErrorType.AUTHENTICATION,
      message: 'Email này đã được đăng ký',
      originalError: error,
      isRetryable: false,
    }
  }

  // Email not confirmed
  if (lowerMessage.includes('email not confirmed') || lowerMessage.includes('verify')) {
    return {
      type: AuthErrorType.AUTHENTICATION,
      message: 'Vui lòng xác nhận email của bạn trước khi đăng nhập',
      originalError: error,
      isRetryable: false,
    }
  }

  // Weak password
  if (lowerMessage.includes('password') && (lowerMessage.includes('weak') || lowerMessage.includes('short'))) {
    return {
      type: AuthErrorType.VALIDATION,
      message: 'Mật khẩu quá yếu. Vui lòng chọn mật khẩu mạnh hơn.',
      originalError: error,
      isRetryable: false,
    }
  }

  // Invalid email format
  if (lowerMessage.includes('invalid') && lowerMessage.includes('email')) {
    return {
      type: AuthErrorType.VALIDATION,
      message: 'Định dạng email không hợp lệ',
      originalError: error,
      isRetryable: false,
    }
  }

  // Server errors (5xx)
  if (lowerMessage.includes('500') || lowerMessage.includes('server error') || lowerMessage.includes('internal')) {
    return {
      type: AuthErrorType.SERVER,
      message: 'Lỗi máy chủ. Vui lòng thử lại sau.',
      originalError: error,
      isRetryable: true,
    }
  }

  // Session expired
  if (lowerMessage.includes('session') && (lowerMessage.includes('expired') || lowerMessage.includes('invalid'))) {
    return {
      type: AuthErrorType.AUTHENTICATION,
      message: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.',
      originalError: error,
      isRetryable: false,
    }
  }

  // Default error
  return {
    type: AuthErrorType.UNKNOWN,
    message: errorMessage || 'Đã xảy ra lỗi. Vui lòng thử lại.',
    originalError: error,
    isRetryable: true,
  }
}

/**
 * Get user-friendly error message for display
 */
export function getErrorMessage(error: unknown, context: 'login' | 'register' | 'oauth'): string {
  const parsedError = parseSupabaseError(error)
  
  // Add context-specific messages
  if (parsedError.type === AuthErrorType.UNKNOWN) {
    switch (context) {
      case 'login':
        return 'Đăng nhập thất bại. Vui lòng thử lại.'
      case 'register':
        return 'Đăng ký thất bại. Vui lòng thử lại.'
      case 'oauth':
        return 'Đăng nhập thất bại. Vui lòng thử lại.'
    }
  }
  
  return parsedError.message
}

/**
 * Check if error should show retry button
 */
export function shouldShowRetry(error: unknown): boolean {
  const parsedError = parseSupabaseError(error)
  return parsedError.isRetryable
}

/**
 * Get retry delay in seconds
 */
export function getRetryDelay(error: unknown): number {
  const parsedError = parseSupabaseError(error)
  return parsedError.retryAfter || 3 // Default 3 seconds
}
