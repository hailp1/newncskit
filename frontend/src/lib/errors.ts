import { ErrorType } from '@/types/workflow';

export class AppError extends Error {
  constructor(
    message: string,
    public type: ErrorType,
    public suggestions: string[] = [],
    public canRetry: boolean = false,
    public field?: string
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class ValidationError extends AppError {
  constructor(field: string, message: string, suggestions: string[]) {
    super(message, 'warning', suggestions, false, field);
    this.name = 'ValidationError';
  }
}

export class NetworkError extends AppError {
  constructor(message: string) {
    super(
      message,
      'error',
      ['Check your internet connection', 'Try again in a moment'],
      true
    );
    this.name = 'NetworkError';
  }
}

export class AnalysisError extends AppError {
  constructor(analysisType: string, message: string) {
    super(
      `${analysisType} analysis failed: ${message}`,
      'error',
      ['Check your data configuration', 'Review variable selections', 'Try a different analysis type'],
      true
    );
    this.name = 'AnalysisError';
  }
}

// Error Logger
interface ErrorLog {
  timestamp: Date;
  error: Error;
  context: {
    userId?: string;
    projectId?: string;
    step?: string;
    userAgent: string;
  };
  stackTrace?: string;
}

export class ErrorLogger {
  static log(error: Error, context: Partial<ErrorLog['context']> = {}) {
    const log: ErrorLog = {
      timestamp: new Date(),
      error,
      context: {
        ...context,
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
      },
      stackTrace: error.stack,
    };

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error logged:', log);
    }

    // Store locally for debugging
    this.storeLocal(log);

    // Monitoring service (Sentry) will be integrated in future release
    // For now, errors are logged locally and can be viewed in browser console
  }

  private static storeLocal(log: ErrorLog) {
    if (typeof window === 'undefined') return;

    try {
      const logs = JSON.parse(localStorage.getItem('error-logs') || '[]');
      logs.push({
        ...log,
        timestamp: log.timestamp.toISOString(),
      });

      // Keep only last 50 errors
      if (logs.length > 50) {
        logs.shift();
      }

      localStorage.setItem('error-logs', JSON.stringify(logs));
    } catch (e) {
      console.error('Failed to store error log:', e);
    }
  }

  static getLogs(): ErrorLog[] {
    if (typeof window === 'undefined') return [];

    try {
      const logs = JSON.parse(localStorage.getItem('error-logs') || '[]');
      return logs.map((log: any) => ({
        ...log,
        timestamp: new Date(log.timestamp),
      }));
    } catch (e) {
      console.error('Failed to retrieve error logs:', e);
      return [];
    }
  }

  static clearLogs() {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('error-logs');
  }
}

// Retry utility
export async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> {
  let lastError: Error;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      
      if (i < maxRetries - 1) {
        // Exponential backoff
        await new Promise((resolve) => setTimeout(resolve, delay * (i + 1)));
      }
    }
  }

  throw lastError!;
}
