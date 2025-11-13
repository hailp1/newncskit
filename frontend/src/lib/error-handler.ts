/**
 * Error Handler Utility
 * Centralized error handling for the application
 */

import { NextResponse } from 'next/server'
import { logger } from './logger'

export enum ErrorCode {
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  NOT_FOUND = 'NOT_FOUND',
  BAD_REQUEST = 'BAD_REQUEST',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
  TIMEOUT = 'TIMEOUT',
}

export class AppError extends Error {
  public readonly code: ErrorCode
  public readonly statusCode: number
  public readonly isOperational: boolean

  constructor(
    message: string,
    code: ErrorCode = ErrorCode.INTERNAL_ERROR,
    statusCode: number = 500,
    isOperational: boolean = true
  ) {
    super(message)
    this.code = code
    this.statusCode = statusCode
    this.isOperational = isOperational

    Error.captureStackTrace(this, this.constructor)
  }
}

/**
 * Handle API errors and return appropriate response
 */
export function handleApiError(error: unknown, context?: string): NextResponse {
  // Log the error
  if (context) {
    logger.error(`Error in ${context}:`, error)
  } else {
    logger.error('API Error:', error)
  }

  // Handle AppError
  if (error instanceof AppError) {
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        code: error.code,
      },
      { status: error.statusCode }
    )
  }

  // Handle Prisma errors
  if (error && typeof error === 'object' && 'code' in error) {
    const prismaError = error as any

    switch (prismaError.code) {
      case 'P2002':
        return NextResponse.json(
          {
            success: false,
            error: 'Dữ liệu đã tồn tại',
            code: ErrorCode.VALIDATION_ERROR,
          },
          { status: 400 }
        )

      case 'P2025':
        return NextResponse.json(
          {
            success: false,
            error: 'Không tìm thấy dữ liệu',
            code: ErrorCode.NOT_FOUND,
          },
          { status: 404 }
        )

      default:
        logger.error('Prisma error:', prismaError)
    }
  }

  // Handle generic errors
  if (error instanceof Error) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Đã xảy ra lỗi',
        code: ErrorCode.INTERNAL_ERROR,
      },
      { status: 500 }
    )
  }

  // Unknown error
  return NextResponse.json(
    {
      success: false,
      error: 'Đã xảy ra lỗi không xác định',
      code: ErrorCode.INTERNAL_ERROR,
    },
    { status: 500 }
  )
}

/**
 * Create common error responses
 */
export const ErrorResponses = {
  unauthorized: () =>
    new AppError('Unauthorized', ErrorCode.UNAUTHORIZED, 401),

  forbidden: (message: string = 'Không có quyền truy cập') =>
    new AppError(message, ErrorCode.FORBIDDEN, 403),

  notFound: (resource: string = 'Dữ liệu') =>
    new AppError(`${resource} không tìm thấy`, ErrorCode.NOT_FOUND, 404),

  badRequest: (message: string = 'Yêu cầu không hợp lệ') =>
    new AppError(message, ErrorCode.BAD_REQUEST, 400),

  validationError: (message: string) =>
    new AppError(message, ErrorCode.VALIDATION_ERROR, 400),

  internalError: (message: string = 'Lỗi hệ thống') =>
    new AppError(message, ErrorCode.INTERNAL_ERROR, 500),

  serviceUnavailable: (service: string = 'Service') =>
    new AppError(
      `${service} không khả dụng`,
      ErrorCode.SERVICE_UNAVAILABLE,
      503
    ),

  timeout: (operation: string = 'Thao tác') =>
    new AppError(`${operation} quá thời gian chờ`, ErrorCode.TIMEOUT, 408),
}
