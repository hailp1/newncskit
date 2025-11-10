/**
 * API Middleware Utilities
 * Provides reusable utilities for Next.js API routes
 */

import { NextRequest, NextResponse } from 'next/server';

/**
 * Generate unique correlation ID for request tracing
 * Format: timestamp-randomString
 */
export function generateCorrelationId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
}

/**
 * Get standard CORS headers for API responses
 */
export function getCorsHeaders(): Record<string, string> {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS, HEAD',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Correlation-ID',
    'Access-Control-Max-Age': '86400',
  };
}

/**
 * Get standard JSON response headers with CORS
 */
export function getJsonHeaders(): Record<string, string> {
  return {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-store',
    ...getCorsHeaders(),
  };
}

/**
 * API Error Response Interface
 */
export interface ApiError {
  success: false;
  error: string;
  correlationId: string;
  timestamp: string;
  details?: string;
}

/**
 * Create standardized error response
 * @param error - Error object or error message string
 * @param status - HTTP status code
 * @param correlationId - Request correlation ID
 * @returns NextResponse with error JSON
 */
export function createErrorResponse(
  error: Error | string,
  status: number,
  correlationId: string
): NextResponse<ApiError> {
  const errorMessage = typeof error === 'string' ? error : error.message;
  const errorDetails = error instanceof Error ? error.stack : undefined;

  const response: ApiError = {
    success: false,
    error: errorMessage,
    correlationId,
    timestamp: new Date().toISOString(),
    details: process.env.NODE_ENV === 'development' ? errorDetails : undefined,
  };

  // Log error with full context
  console.error(`[API Error] ${correlationId}:`, {
    error: errorMessage,
    status,
    stack: errorDetails,
    timestamp: response.timestamp,
  });

  return NextResponse.json(response, {
    status,
    headers: getJsonHeaders(),
  });
}

/**
 * API Success Response Interface
 */
export interface ApiSuccess<T = any> {
  success: true;
  data: T;
  correlationId: string;
  timestamp: string;
}

/**
 * Create standardized success response
 * @param data - Response data
 * @param correlationId - Request correlation ID
 * @returns NextResponse with success JSON
 */
export function createSuccessResponse<T>(
  data: T,
  correlationId: string
): NextResponse<ApiSuccess<T>> {
  const response: ApiSuccess<T> = {
    success: true,
    data,
    correlationId,
    timestamp: new Date().toISOString(),
  };

  return NextResponse.json(response, {
    status: 200,
    headers: getJsonHeaders(),
  });
}

/**
 * Validate HTTP method and return error response if invalid
 * @param request - Next.js request object
 * @param allowedMethods - Array of allowed HTTP methods
 * @param correlationId - Request correlation ID
 * @returns NextResponse with 405 error if method not allowed, null if valid
 */
export function validateMethod(
  request: NextRequest,
  allowedMethods: string[],
  correlationId: string
): NextResponse | null {
  const method = request.method;

  if (!allowedMethods.includes(method)) {
    console.warn(
      `[API] ${correlationId}: Method ${method} not allowed. Allowed: ${allowedMethods.join(', ')}`
    );

    return NextResponse.json(
      {
        success: false,
        error: `Method ${method} not allowed. Use ${allowedMethods.join(', ')}`,
        correlationId,
        timestamp: new Date().toISOString(),
        allowedMethods,
      },
      {
        status: 405,
        headers: {
          ...getJsonHeaders(),
          Allow: allowedMethods.join(', '),
        },
      }
    );
  }

  return null;
}

/**
 * Log incoming API request with correlation ID
 * @param request - Next.js request object
 * @param correlationId - Request correlation ID
 */
export function logRequest(request: NextRequest, correlationId: string): void {
  console.log(`[API Request] ${correlationId}:`, {
    method: request.method,
    url: request.url,
    headers: Object.fromEntries(request.headers.entries()),
    timestamp: new Date().toISOString(),
  });
}
