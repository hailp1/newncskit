// Error Handling Configuration
// Centralized configuration for error handling across the application

export interface ErrorHandlingConfig {
  // Retry configuration
  retry: {
    maxAttempts: number;
    baseDelay: number;
    maxDelay: number;
    backoffMultiplier: number;
    jitter: boolean;
  };
  
  // Recovery configuration
  recovery: {
    enableAutoRecovery: boolean;
    autoRecoveryDelay: number;
    maxAutoRecoveryAttempts: number;
    fallbackToManual: boolean;
  };
  
  // Logging configuration
  logging: {
    enableConsoleLogging: boolean;
    enableRemoteLogging: boolean;
    logLevel: 'error' | 'warn' | 'info' | 'debug';
    includeStackTrace: boolean;
    includeUserAgent: boolean;
    includeTimestamp: boolean;
  };
  
  // User experience configuration
  userExperience: {
    showTechnicalDetails: boolean;
    enableRecoveryActions: boolean;
    showRetryCount: boolean;
    autoHideSuccessMessages: boolean;
    successMessageDuration: number;
  };
  
  // Component-specific configuration
  components: {
    [componentName: string]: {
      enableErrorBoundary: boolean;
      enableAutoRetry: boolean;
      maxRetries: number;
      showRecoveryActions: boolean;
      fallbackComponent?: string;
    };
  };
}

// Default configuration
export const defaultErrorHandlingConfig: ErrorHandlingConfig = {
  retry: {
    maxAttempts: 3,
    baseDelay: 1000, // 1 second
    maxDelay: 30000, // 30 seconds
    backoffMultiplier: 2,
    jitter: true
  },
  
  recovery: {
    enableAutoRecovery: true,
    autoRecoveryDelay: 2000, // 2 seconds
    maxAutoRecoveryAttempts: 2,
    fallbackToManual: true
  },
  
  logging: {
    enableConsoleLogging: process.env.NODE_ENV === 'development',
    enableRemoteLogging: process.env.NODE_ENV === 'production',
    logLevel: process.env.NODE_ENV === 'development' ? 'debug' : 'error',
    includeStackTrace: process.env.NODE_ENV === 'development',
    includeUserAgent: true,
    includeTimestamp: true
  },
  
  userExperience: {
    showTechnicalDetails: process.env.NODE_ENV === 'development',
    enableRecoveryActions: true,
    showRetryCount: true,
    autoHideSuccessMessages: true,
    successMessageDuration: 5000 // 5 seconds
  },
  
  components: {
    'survey-builder': {
      enableErrorBoundary: true,
      enableAutoRetry: true,
      maxRetries: 2,
      showRecoveryActions: true,
      fallbackComponent: 'manual-survey-builder'
    },
    
    'campaign-manager': {
      enableErrorBoundary: true,
      enableAutoRetry: false, // Manual retry for campaigns
      maxRetries: 1,
      showRecoveryActions: true
    },
    
    'data-upload': {
      enableErrorBoundary: true,
      enableAutoRetry: true,
      maxRetries: 2,
      showRecoveryActions: true,
      fallbackComponent: 'sample-data-loader'
    },
    
    'progress-tracker': {
      enableErrorBoundary: true,
      enableAutoRetry: true,
      maxRetries: 3,
      showRecoveryActions: false // Simple component, just retry
    },
    
    'question-bank': {
      enableErrorBoundary: true,
      enableAutoRetry: true,
      maxRetries: 2,
      showRecoveryActions: true,
      fallbackComponent: 'manual-question-creator'
    }
  }
};

// Error categories and their handling strategies
export const errorCategories = {
  // Network-related errors
  network: {
    keywords: ['network', 'fetch', 'connection', 'timeout', 'cors'],
    strategy: 'retry',
    userMessage: 'Lỗi kết nối mạng. Đang thử lại...',
    recoveryActions: ['retry', 'check-connection']
  },
  
  // Server errors
  server: {
    keywords: ['500', '502', '503', '504', 'internal server error', 'bad gateway'],
    strategy: 'retry-with-delay',
    userMessage: 'Máy chủ đang gặp sự cố. Vui lòng thử lại sau.',
    recoveryActions: ['retry-later', 'contact-support']
  },
  
  // Authentication errors
  authentication: {
    keywords: ['unauthorized', '401', '403', 'forbidden', 'token', 'session'],
    strategy: 'redirect',
    userMessage: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.',
    recoveryActions: ['login', 'refresh-token']
  },
  
  // Validation errors
  validation: {
    keywords: ['validation', 'invalid', 'required', 'format', 'constraint'],
    strategy: 'show-form-errors',
    userMessage: 'Dữ liệu không hợp lệ. Vui lòng kiểm tra lại.',
    recoveryActions: ['fix-validation', 'reset-form']
  },
  
  // Resource not found
  notFound: {
    keywords: ['404', 'not found', 'does not exist'],
    strategy: 'redirect-or-create',
    userMessage: 'Không tìm thấy tài nguyên yêu cầu.',
    recoveryActions: ['go-back', 'create-new', 'search']
  },
  
  // Permission errors
  permission: {
    keywords: ['permission', 'access denied', 'not allowed'],
    strategy: 'show-permission-error',
    userMessage: 'Bạn không có quyền thực hiện thao tác này.',
    recoveryActions: ['request-permission', 'contact-admin']
  },
  
  // File processing errors
  fileProcessing: {
    keywords: ['file', 'upload', 'parsing', 'format', 'corrupt', 'size'],
    strategy: 'file-recovery',
    userMessage: 'Có lỗi khi xử lý file. Vui lòng kiểm tra file và thử lại.',
    recoveryActions: ['try-different-file', 'convert-format', 'reduce-size']
  },
  
  // Business logic errors
  businessLogic: {
    keywords: ['insufficient', 'limit', 'quota', 'expired', 'unavailable'],
    strategy: 'business-recovery',
    userMessage: 'Không thể thực hiện thao tác do ràng buộc nghiệp vụ.',
    recoveryActions: ['upgrade-plan', 'adjust-settings', 'contact-support']
  }
};

// Recovery action templates
export const recoveryActionTemplates = {
  retry: {
    label: 'Thử lại',
    type: 'retry' as const,
    priority: 'high' as const,
    delay: 0
  },
  
  'retry-later': {
    label: 'Thử lại sau 1 phút',
    type: 'retry' as const,
    priority: 'medium' as const,
    delay: 60000
  },
  
  'check-connection': {
    label: 'Kiểm tra kết nối',
    type: 'manual' as const,
    priority: 'high' as const,
    action: () => {
      window.open('https://www.google.com', '_blank');
    }
  },
  
  login: {
    label: 'Đăng nhập lại',
    type: 'redirect' as const,
    priority: 'high' as const,
    href: '/login'
  },
  
  'refresh-token': {
    label: 'Làm mới phiên',
    type: 'retry' as const,
    priority: 'medium' as const,
    action: async () => {
      // Implement token refresh logic
      window.location.reload();
    }
  },
  
  'go-back': {
    label: 'Quay lại',
    type: 'redirect' as const,
    priority: 'medium' as const,
    action: () => {
      window.history.back();
    }
  },
  
  'contact-support': {
    label: 'Liên hệ hỗ trợ',
    type: 'redirect' as const,
    priority: 'low' as const,
    href: 'mailto:support@ncskit.com'
  },
  
  'upgrade-plan': {
    label: 'Nâng cấp gói',
    type: 'redirect' as const,
    priority: 'medium' as const,
    href: '/pricing'
  },
  
  'try-different-file': {
    label: 'Thử file khác',
    type: 'manual' as const,
    priority: 'high' as const,
    action: () => {
      // Will be handled by component
      window.dispatchEvent(new CustomEvent('file-upload:reset'));
    }
  },
  
  'convert-format': {
    label: 'Hướng dẫn chuyển đổi',
    type: 'redirect' as const,
    priority: 'medium' as const,
    href: '/help/file-conversion'
  },
  
  'load-sample': {
    label: 'Sử dụng dữ liệu mẫu',
    type: 'fallback' as const,
    priority: 'low' as const,
    action: () => {
      window.dispatchEvent(new CustomEvent('data-upload:load-sample'));
    }
  }
};

// Error message templates by language
export const errorMessageTemplates = {
  vi: {
    generic: {
      title: 'Có lỗi xảy ra',
      message: 'Đã xảy ra lỗi không mong muốn. Vui lòng thử lại sau.',
    },
    network: {
      title: 'Lỗi kết nối',
      message: 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối internet.',
    },
    server: {
      title: 'Lỗi máy chủ',
      message: 'Máy chủ đang gặp sự cố. Chúng tôi đang khắc phục, vui lòng thử lại sau.',
    },
    validation: {
      title: 'Dữ liệu không hợp lệ',
      message: 'Vui lòng kiểm tra lại thông tin đã nhập.',
    },
    permission: {
      title: 'Không có quyền truy cập',
      message: 'Bạn không có quyền thực hiện thao tác này.',
    }
  },
  
  en: {
    generic: {
      title: 'An error occurred',
      message: 'An unexpected error occurred. Please try again later.',
    },
    network: {
      title: 'Connection error',
      message: 'Unable to connect to server. Please check your internet connection.',
    },
    server: {
      title: 'Server error',
      message: 'The server is experiencing issues. We are working to fix it, please try again later.',
    },
    validation: {
      title: 'Invalid data',
      message: 'Please check the information you entered.',
    },
    permission: {
      title: 'Access denied',
      message: 'You do not have permission to perform this action.',
    }
  }
};

// Get configuration for specific component
export function getComponentErrorConfig(componentName: string) {
  return {
    ...defaultErrorHandlingConfig,
    component: defaultErrorHandlingConfig.components[componentName] || defaultErrorHandlingConfig.components['survey-builder']
  };
}

// Determine error category
export function categorizeError(error: Error): string {
  const errorMessage = error.message.toLowerCase();
  
  for (const [category, config] of Object.entries(errorCategories)) {
    if (config.keywords.some(keyword => errorMessage.includes(keyword))) {
      return category;
    }
  }
  
  return 'generic';
}