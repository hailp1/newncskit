/**
 * Retry Utility for Failed Requests
 * Provides exponential backoff and configurable retry logic
 */

export interface RetryOptions {
  maxAttempts?: number
  initialDelay?: number // milliseconds
  maxDelay?: number // milliseconds
  backoffMultiplier?: number
  shouldRetry?: (error: unknown, attempt: number) => boolean
  onRetry?: (error: unknown, attempt: number) => void
}

const DEFAULT_OPTIONS: Required<RetryOptions> = {
  maxAttempts: 3,
  initialDelay: 1000, // 1 second
  maxDelay: 10000, // 10 seconds
  backoffMultiplier: 2,
  shouldRetry: () => true,
  onRetry: () => {},
}

/**
 * Calculate delay with exponential backoff
 */
function calculateDelay(attempt: number, options: Required<RetryOptions>): number {
  const delay = options.initialDelay * Math.pow(options.backoffMultiplier, attempt - 1)
  return Math.min(delay, options.maxDelay)
}

/**
 * Sleep for specified milliseconds
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Retry an async function with exponential backoff
 */
export async function retryAsync<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const opts = { ...DEFAULT_OPTIONS, ...options }
  let lastError: unknown

  for (let attempt = 1; attempt <= opts.maxAttempts; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error

      // Check if we should retry
      const isLastAttempt = attempt === opts.maxAttempts
      const shouldRetry = opts.shouldRetry(error, attempt)

      if (isLastAttempt || !shouldRetry) {
        throw error
      }

      // Calculate delay and wait
      const delay = calculateDelay(attempt, opts)
      opts.onRetry(error, attempt)
      
      await sleep(delay)
    }
  }

  // This should never be reached, but TypeScript needs it
  throw lastError
}

/**
 * Check if error is retryable based on common patterns
 */
export function isRetryableError(error: unknown): boolean {
  if (error instanceof TypeError && error.message.includes('fetch')) {
    return true
  }

  if (error instanceof Error) {
    const message = error.message.toLowerCase()
    return (
      message.includes('network') ||
      message.includes('timeout') ||
      message.includes('connection') ||
      message.includes('500') ||
      message.includes('502') ||
      message.includes('503') ||
      message.includes('504')
    )
  }

  return false
}

/**
 * Create a retry wrapper for auth operations
 */
export function createAuthRetry(options: RetryOptions = {}) {
  return <T>(fn: () => Promise<T>): Promise<T> => {
    return retryAsync(fn, {
      maxAttempts: 2, // Only retry once for auth operations
      initialDelay: 2000, // 2 seconds
      shouldRetry: isRetryableError,
      ...options,
    })
  }
}
