/**
 * Performance Utilities
 * 
 * Utility functions for performance optimization
 * Task 16: Performance optimizations (Requirements 7.1-7.5)
 */

/**
 * Debounce function to delay execution
 * Task 16: Requirement 7.5
 * 
 * @param func - Function to debounce
 * @param delay - Delay in milliseconds
 * @returns Debounced function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout | null = null;

  return function debounced(...args: Parameters<T>) {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(() => {
      func(...args);
    }, delay);
  };
}

/**
 * Throttle function to limit execution frequency
 * 
 * @param func - Function to throttle
 * @param limit - Minimum time between executions in milliseconds
 * @returns Throttled function
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean = false;

  return function throttled(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
}

/**
 * Create a cache key from an object
 * 
 * @param obj - Object to create cache key from
 * @returns Cache key string
 */
export function createCacheKey(obj: Record<string, any>): string {
  return JSON.stringify(obj, Object.keys(obj).sort());
}

/**
 * Get item from localStorage with JSON parsing
 * 
 * @param key - localStorage key
 * @returns Parsed value or null
 */
export function getFromCache<T>(key: string): T | null {
  try {
    const cached = localStorage.getItem(key);
    if (cached) {
      return JSON.parse(cached) as T;
    }
  } catch (e) {
    console.warn(`Failed to parse cached value for key: ${key}`, e);
  }
  return null;
}

/**
 * Set item in localStorage with JSON stringification
 * 
 * @param key - localStorage key
 * @param value - Value to cache
 */
export function setInCache<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.warn(`Failed to cache value for key: ${key}`, e);
  }
}

/**
 * Clear item from localStorage
 * 
 * @param key - localStorage key
 */
export function clearFromCache(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch (e) {
    console.warn(`Failed to clear cache for key: ${key}`, e);
  }
}

/**
 * Memoize a function result based on arguments
 * 
 * @param fn - Function to memoize
 * @returns Memoized function
 */
export function memoize<T extends (...args: any[]) => any>(
  fn: T
): T {
  const cache = new Map<string, ReturnType<T>>();

  return ((...args: Parameters<T>) => {
    const key = createCacheKey(args);
    
    if (cache.has(key)) {
      return cache.get(key);
    }

    const result = fn(...args);
    cache.set(key, result);
    return result;
  }) as T;
}
