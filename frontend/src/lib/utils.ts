import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
/**

 * Retry a function with exponential backoff
 * 
 * @param fn - The async function to retry
 * @param options - Retry configuration
 * @returns The result of the function
 * @throws The last error if all retries fail
 * 
 * Requirements: 7.5
 */
export async function retryWithExponentialBackoff<T>(
  fn: () => Promise<T>,
  options: {
    maxAttempts?: number;
    baseDelay?: number; // milliseconds
    maxDelay?: number; // milliseconds
    onRetry?: (attempt: number, error: Error) => void;
  } = {}
): Promise<T> {
  const {
    maxAttempts = 3,
    baseDelay = 1000, // 1 second
    maxDelay = 10000, // 10 seconds
    onRetry,
  } = options;

  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      // If this was the last attempt, throw the error
      if (attempt === maxAttempts) {
        throw lastError;
      }

      // Calculate delay with exponential backoff: baseDelay * 2^(attempt-1)
      // For baseDelay=1000: 1s, 2s, 4s
      const delay = Math.min(baseDelay * Math.pow(2, attempt - 1), maxDelay);

      // Call onRetry callback if provided
      if (onRetry) {
        onRetry(attempt, lastError);
      }

      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  // This should never be reached, but TypeScript needs it
  throw lastError || new Error('Retry failed');
}

/**
 * Retry status for tracking retry attempts
 */
export interface RetryStatus {
  attempt: number;
  maxAttempts: number;
  isRetrying: boolean;
  lastError?: Error;
}
