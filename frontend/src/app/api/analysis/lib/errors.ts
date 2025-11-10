import type { NextResponse } from 'next/server';

export interface ApiErrorOptions {
  status?: number;
  details?: Record<string, unknown>;
  cause?: unknown;
}

/**
 * Structured API error used across analysis handlers.
 */
export class ApiError extends Error {
  readonly status: number;
  readonly details?: Record<string, unknown>;
  readonly cause?: unknown;

  constructor(message: string, options: ApiErrorOptions = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = options.status ?? 500;
    this.details = options.details;
    this.cause = options.cause;
  }
}

/**
 * Type guard for ApiError instances or compatible shapes.
 */
export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

/**
 * Helper to normalize unknown errors into ApiError shape.
 */
export function toApiError(error: unknown, fallbackMessage = 'Unexpected server error'): ApiError {
  if (isApiError(error)) {
    return error;
  }

  if (error instanceof Error) {
    return new ApiError(error.message, {
      status: 500,
      cause: error,
    });
  }

  return new ApiError(fallbackMessage, { status: 500, details: { error } });
}

/**
 * Narrowly typed NextResponse error payload.
 */
export type ApiErrorResponse = {
  success: false;
  error: string;
  correlationId: string;
  timestamp: string;
  details?: Record<string, unknown>;
};

export type ErrorResponder = (error: Error | string, status: number, correlationId: string) => NextResponse<ApiErrorResponse>;

