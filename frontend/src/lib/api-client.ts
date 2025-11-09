/**
 * API Client Utilities
 * Ensures correct API URLs regardless of routing context
 */

/**
 * Get absolute API URL
 * Prevents issues with relative paths in nested routes
 */
export function getApiUrl(path: string): string {
  // Remove leading slash if present
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  
  // In browser, use window.location.origin
  if (typeof window !== 'undefined') {
    return `${window.location.origin}/${cleanPath}`;
  }
  
  // On server, use environment variable or default
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  return `${baseUrl}/${cleanPath}`;
}

/**
 * Fetch wrapper with automatic URL resolution
 */
export async function apiFetch(path: string, options?: RequestInit): Promise<Response> {
  const url = getApiUrl(path);
  console.log(`[API Client] Fetching: ${url}`);
  
  return fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });
}
