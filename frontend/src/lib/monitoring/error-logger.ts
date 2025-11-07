/**
 * Error Logging and Monitoring Utility
 * 
 * This module provides centralized error logging and monitoring capabilities.
 * It can be extended to integrate with Sentry, Vercel Analytics, or other monitoring services.
 */

import { env, isDevelopment, isProduction } from '@/config/env'

export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export enum ErrorCategory {
  API = 'api',
  DATABASE = 'database',
  AUTHENTICATION = 'authentication',
  ANALYTICS = 'analytics',
  HEALTH_CHECK = 'health_check',
  NETWORK = 'network',
  VALIDATION = 'validation',
  UNKNOWN = 'unknown'
}

export interface ErrorContext {
  userId?: string
  userEmail?: string
  url?: string
  method?: string
  statusCode?: number
  requestId?: string
  timestamp?: string
  additionalData?: Record<string, any>
}

export interface ErrorLog {
  id: string
  message: string
  stack?: string
  severity: ErrorSeverity
  category: ErrorCategory
  context: ErrorContext
  timestamp: string
  environment: string
}

class ErrorLogger {
  private static instance: ErrorLogger
  private logs: ErrorLog[] = []
  private maxLogs: number = 100
  private notificationCallbacks: Array<(error: ErrorLog) => void> = []

  private constructor() {
    // Initialize error logger
    if (typeof window !== 'undefined') {
      // Set up global error handler
      window.addEventListener('error', (event) => {
        this.logError(event.error, {
          severity: ErrorSeverity.HIGH,
          category: ErrorCategory.UNKNOWN,
          context: {
            url: window.location.href,
            additionalData: {
              message: event.message,
              filename: event.filename,
              lineno: event.lineno,
              colno: event.colno
            }
          }
        })
      })

      // Set up unhandled promise rejection handler
      window.addEventListener('unhandledrejection', (event) => {
        this.logError(event.reason, {
          severity: ErrorSeverity.HIGH,
          category: ErrorCategory.UNKNOWN,
          context: {
            url: window.location.href,
            additionalData: {
              promise: 'Unhandled Promise Rejection'
            }
          }
        })
      })
    }
  }

  public static getInstance(): ErrorLogger {
    if (!ErrorLogger.instance) {
      ErrorLogger.instance = new ErrorLogger()
    }
    return ErrorLogger.instance
  }

  /**
   * Log an error with context
   */
  public logError(
    error: Error | string,
    options: {
      severity?: ErrorSeverity
      category?: ErrorCategory
      context?: ErrorContext
    } = {}
  ): void {
    const errorMessage = typeof error === 'string' ? error : error.message
    const errorStack = typeof error === 'string' ? undefined : error.stack

    const errorLog: ErrorLog = {
      id: this.generateId(),
      message: errorMessage,
      stack: errorStack,
      severity: options.severity || ErrorSeverity.MEDIUM,
      category: options.category || ErrorCategory.UNKNOWN,
      context: {
        ...options.context,
        timestamp: new Date().toISOString(),
        url: typeof window !== 'undefined' ? window.location.href : undefined
      },
      timestamp: new Date().toISOString(),
      environment: env.app.env
    }

    // Add to in-memory logs
    this.logs.unshift(errorLog)
    if (this.logs.length > this.maxLogs) {
      this.logs.pop()
    }

    // Console log in development
    if (isDevelopment) {
      console.error('[ErrorLogger]', errorLog)
    }

    // Send to monitoring service
    this.sendToMonitoring(errorLog)

    // Trigger notification callbacks
    this.notificationCallbacks.forEach(callback => {
      try {
        callback(errorLog)
      } catch (err) {
        console.error('Error in notification callback:', err)
      }
    })

    // Store in localStorage for persistence (optional)
    if (typeof window !== 'undefined') {
      try {
        const storedLogs = this.getStoredLogs()
        storedLogs.unshift(errorLog)
        localStorage.setItem('error_logs', JSON.stringify(storedLogs.slice(0, 50)))
      } catch (err) {
        // Ignore localStorage errors
      }
    }
  }

  /**
   * Log API errors
   */
  public logApiError(
    error: Error | string,
    context: {
      endpoint: string
      method: string
      statusCode?: number
      requestData?: any
      responseData?: any
    }
  ): void {
    this.logError(error, {
      severity: context.statusCode && context.statusCode >= 500 
        ? ErrorSeverity.HIGH 
        : ErrorSeverity.MEDIUM,
      category: ErrorCategory.API,
      context: {
        url: context.endpoint,
        method: context.method,
        statusCode: context.statusCode,
        additionalData: {
          requestData: context.requestData,
          responseData: context.responseData
        }
      }
    })
  }

  /**
   * Log health check failures
   */
  public logHealthCheckFailure(
    service: string,
    error: Error | string,
    context?: ErrorContext
  ): void {
    this.logError(error, {
      severity: ErrorSeverity.CRITICAL,
      category: ErrorCategory.HEALTH_CHECK,
      context: {
        ...context,
        additionalData: {
          service,
          ...context?.additionalData
        }
      }
    })
  }

  /**
   * Log analytics errors
   */
  public logAnalyticsError(
    error: Error | string,
    context: {
      action: string
      data?: any
    }
  ): void {
    this.logError(error, {
      severity: ErrorSeverity.MEDIUM,
      category: ErrorCategory.ANALYTICS,
      context: {
        additionalData: context
      }
    })
  }

  /**
   * Get recent error logs
   */
  public getLogs(limit?: number): ErrorLog[] {
    return limit ? this.logs.slice(0, limit) : this.logs
  }

  /**
   * Get logs by severity
   */
  public getLogsBySeverity(severity: ErrorSeverity): ErrorLog[] {
    return this.logs.filter(log => log.severity === severity)
  }

  /**
   * Get logs by category
   */
  public getLogsByCategory(category: ErrorCategory): ErrorLog[] {
    return this.logs.filter(log => log.category === category)
  }

  /**
   * Clear all logs
   */
  public clearLogs(): void {
    this.logs = []
    if (typeof window !== 'undefined') {
      localStorage.removeItem('error_logs')
    }
  }

  /**
   * Register a notification callback
   */
  public onError(callback: (error: ErrorLog) => void): () => void {
    this.notificationCallbacks.push(callback)
    
    // Return unsubscribe function
    return () => {
      const index = this.notificationCallbacks.indexOf(callback)
      if (index > -1) {
        this.notificationCallbacks.splice(index, 1)
      }
    }
  }

  /**
   * Send error to monitoring service
   */
  private async sendToMonitoring(errorLog: ErrorLog): Promise<void> {
    // Only send critical and high severity errors in production
    if (
      !isProduction ||
      (errorLog.severity !== ErrorSeverity.CRITICAL && errorLog.severity !== ErrorSeverity.HIGH)
    ) {
      return
    }

    try {
      // Send to monitoring endpoint
      await fetch('/api/monitoring/error', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(errorLog)
      })
    } catch (err) {
      // Silently fail - don't want to create infinite error loop
      console.error('Failed to send error to monitoring service:', err)
    }
  }

  /**
   * Get stored logs from localStorage
   */
  private getStoredLogs(): ErrorLog[] {
    if (typeof window === 'undefined') return []
    
    try {
      const stored = localStorage.getItem('error_logs')
      return stored ? JSON.parse(stored) : []
    } catch {
      return []
    }
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }
}

// Export singleton instance
export const errorLogger = ErrorLogger.getInstance()

// Export convenience functions
export const logError = (error: Error | string, options?: Parameters<typeof errorLogger.logError>[1]) => {
  errorLogger.logError(error, options)
}

export const logApiError = (error: Error | string, context: Parameters<typeof errorLogger.logApiError>[1]) => {
  errorLogger.logApiError(error, context)
}

export const logHealthCheckFailure = (service: string, error: Error | string, context?: ErrorContext) => {
  errorLogger.logHealthCheckFailure(service, error, context)
}

export const logAnalyticsError = (error: Error | string, context: Parameters<typeof errorLogger.logAnalyticsError>[1]) => {
  errorLogger.logAnalyticsError(error, context)
}
