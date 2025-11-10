/**
 * API Response Type Definitions
 * Standardized response formats for all API endpoints
 */

/**
 * Base API Success Response
 */
export interface ApiSuccessResponse<T = any> {
  success: true;
  data: T;
  correlationId: string;
  timestamp: string;
}

/**
 * Base API Error Response
 */
export interface ApiErrorResponse {
  success: false;
  error: string;
  correlationId: string;
  timestamp: string;
  details?: string;
  allowedMethods?: string[];
}

/**
 * Upload Success Data
 */
export interface UploadSuccessData {
  project: {
    id: string;
    name: string;
    rowCount: number;
    columnCount: number;
  };
  preview: Array<Record<string, string>>;
  headers: string[];
}

/**
 * Upload Response Types
 */
export type UploadSuccessResponse = ApiSuccessResponse<UploadSuccessData>;
export type UploadErrorResponse = ApiErrorResponse;
export type UploadResponse = UploadSuccessResponse | UploadErrorResponse;

/**
 * Health Check Data
 */
export interface HealthCheckData {
  status: 'healthy' | 'degraded' | 'unhealthy';
  service: string;
  version: string;
  environment: string;
}

/**
 * Health Check Response Types
 */
export type HealthSuccessResponse = ApiSuccessResponse<HealthCheckData>;
export type HealthErrorResponse = ApiErrorResponse;
export type HealthResponse = HealthSuccessResponse | HealthErrorResponse;

/**
 * Type guard to check if response is successful
 */
export function isSuccessResponse<T>(
  response: ApiSuccessResponse<T> | ApiErrorResponse
): response is ApiSuccessResponse<T> {
  return response.success === true;
}

/**
 * Type guard to check if response is an error
 */
export function isErrorResponse(
  response: ApiSuccessResponse<any> | ApiErrorResponse
): response is ApiErrorResponse {
  return response.success === false;
}
