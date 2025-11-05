// Standardized API Response Types and Utilities

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  timestamp: string;
  requestId?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Error codes enum
export enum ErrorCodes {
  // Authentication errors
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  
  // Validation errors
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  INVALID_INPUT = 'INVALID_INPUT',
  MISSING_REQUIRED_FIELD = 'MISSING_REQUIRED_FIELD',
  
  // Database errors
  DATABASE_ERROR = 'DATABASE_ERROR',
  RECORD_NOT_FOUND = 'RECORD_NOT_FOUND',
  DUPLICATE_RECORD = 'DUPLICATE_RECORD',
  
  // File upload errors
  FILE_TOO_LARGE = 'FILE_TOO_LARGE',
  INVALID_FILE_TYPE = 'INVALID_FILE_TYPE',
  FILE_UPLOAD_FAILED = 'FILE_UPLOAD_FAILED',
  
  // Server errors
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  
  // Business logic errors
  INSUFFICIENT_PERMISSIONS = 'INSUFFICIENT_PERMISSIONS',
  RESOURCE_LIMIT_EXCEEDED = 'RESOURCE_LIMIT_EXCEEDED',
  OPERATION_NOT_ALLOWED = 'OPERATION_NOT_ALLOWED'
}

// Success response creator
export function createSuccessResponse<T>(
  data: T, 
  message?: string,
  pagination?: PaginatedResponse<any>['pagination']
): ApiResponse<T> {
  const response: ApiResponse<T> = {
    success: true,
    data,
    timestamp: new Date().toISOString(),
    requestId: generateRequestId()
  };
  
  if (pagination) {
    (response as PaginatedResponse<any>).pagination = pagination;
  }
  
  return response;
}

// Error response creator
export function createErrorResponse(
  code: ErrorCodes | string,
  message: string,
  details?: any,
  statusCode?: number
): ApiResponse {
  return {
    success: false,
    error: {
      code,
      message,
      details
    },
    timestamp: new Date().toISOString(),
    requestId: generateRequestId()
  };
}

// Common error responses
export const CommonErrors = {
  unauthorized: () => createErrorResponse(
    ErrorCodes.UNAUTHORIZED,
    'Authentication required. Please log in to continue.'
  ),
  
  forbidden: () => createErrorResponse(
    ErrorCodes.FORBIDDEN,
    'You do not have permission to perform this action.'
  ),
  
  notFound: (resource: string = 'Resource') => createErrorResponse(
    ErrorCodes.RECORD_NOT_FOUND,
    `${resource} not found.`
  ),
  
  validationError: (details: any) => createErrorResponse(
    ErrorCodes.VALIDATION_ERROR,
    'Validation failed. Please check your input.',
    details
  ),
  
  databaseError: (details?: any) => createErrorResponse(
    ErrorCodes.DATABASE_ERROR,
    'A database error occurred. Please try again later.',
    process.env.NODE_ENV === 'development' ? details : undefined
  ),
  
  internalServerError: (details?: any) => createErrorResponse(
    ErrorCodes.INTERNAL_SERVER_ERROR,
    'An internal server error occurred. Please try again later.',
    process.env.NODE_ENV === 'development' ? details : undefined
  ),
  
  fileTooLarge: (maxSize: string) => createErrorResponse(
    ErrorCodes.FILE_TOO_LARGE,
    `File size exceeds the maximum limit of ${maxSize}.`
  ),
  
  invalidFileType: (allowedTypes: string[]) => createErrorResponse(
    ErrorCodes.INVALID_FILE_TYPE,
    `Invalid file type. Allowed types: ${allowedTypes.join(', ')}`
  ),
  
  rateLimitExceeded: () => createErrorResponse(
    ErrorCodes.RATE_LIMIT_EXCEEDED,
    'Too many requests. Please try again later.'
  )
};

// Request ID generator
function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Response wrapper for Next.js API routes
export function apiResponse<T>(
  data: T,
  options?: {
    message?: string;
    statusCode?: number;
    pagination?: PaginatedResponse<any>['pagination'];
  }
) {
  const response = createSuccessResponse(data, options?.message, options?.pagination);
  return Response.json(response, { status: options?.statusCode || 200 });
}

export function apiError(
  code: ErrorCodes | string,
  message: string,
  options?: {
    details?: any;
    statusCode?: number;
  }
) {
  const response = createErrorResponse(code, message, options?.details);
  return Response.json(response, { status: options?.statusCode || 400 });
}

// Error handler middleware for API routes
export function handleApiError(error: any): Response {
  console.error('API Error:', error);
  
  // Database connection errors
  if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
    return apiError(
      ErrorCodes.SERVICE_UNAVAILABLE,
      'Database service is currently unavailable.',
      { statusCode: 503, details: process.env.NODE_ENV === 'development' ? error.message : undefined }
    );
  }
  
  // PostgreSQL specific errors
  if (error.code === '23505') { // Unique violation
    return apiError(
      ErrorCodes.DUPLICATE_RECORD,
      'A record with this information already exists.',
      { statusCode: 409 }
    );
  }
  
  if (error.code === '23503') { // Foreign key violation
    return apiError(
      ErrorCodes.VALIDATION_ERROR,
      'Referenced record does not exist.',
      { statusCode: 400 }
    );
  }
  
  if (error.code === '42P01') { // Table does not exist
    return apiError(
      ErrorCodes.DATABASE_ERROR,
      'Database schema error. Please contact support.',
      { statusCode: 500 }
    );
  }
  
  // Default error response
  return apiError(
    ErrorCodes.INTERNAL_SERVER_ERROR,
    'An unexpected error occurred.',
    { 
      statusCode: 500,
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }
  );
}

// Client-side error handler
export function handleClientError(error: any): string {
  if (error.response?.data?.error) {
    return error.response.data.error.message;
  }
  
  if (error.message) {
    return error.message;
  }
  
  return 'An unexpected error occurred. Please try again.';
}