import { describe, it, expect } from 'vitest'
import { AppError, handleApiError } from '@/lib/error-handler'
import { NextResponse } from 'next/server'

describe('Error Handling Integration', () => {
  describe('AppError', () => {
    it('should create AppError with default status code', () => {
      const error = new AppError('Test error')
      
      expect(error.message).toBe('Test error')
      expect(error.statusCode).toBe(500)
      expect(error.name).toBe('AppError')
    })

    it('should create AppError with custom status code', () => {
      const error = new AppError('Not found', 404)
      
      expect(error.message).toBe('Not found')
      expect(error.statusCode).toBe(404)
    })

    it('should create AppError with error code', () => {
      const error = new AppError('Validation failed', 400, 'VALIDATION_ERROR')
      
      expect(error.message).toBe('Validation failed')
      expect(error.statusCode).toBe(400)
      expect(error.code).toBe('VALIDATION_ERROR')
    })
  })

  describe('handleApiError', () => {
    it('should handle AppError correctly', () => {
      const error = new AppError('Custom error', 403, 'FORBIDDEN')
      const response = handleApiError(error)
      
      expect(response).toBeInstanceOf(NextResponse)
      expect(response.status).toBe(403)
    })

    it('should handle generic errors', () => {
      const error = new Error('Generic error')
      const response = handleApiError(error)
      
      expect(response).toBeInstanceOf(NextResponse)
      expect(response.status).toBe(500)
    })

    it('should handle unknown errors', () => {
      const error = 'String error'
      const response = handleApiError(error)
      
      expect(response).toBeInstanceOf(NextResponse)
      expect(response.status).toBe(500)
    })
  })

  describe('Error Scenarios', () => {
    it('should handle database connection errors', () => {
      const error = new Error('Connection refused')
      const response = handleApiError(error)
      
      expect(response.status).toBe(500)
    })

    it('should handle validation errors', () => {
      const error = new AppError('Invalid input', 400, 'VALIDATION_ERROR')
      const response = handleApiError(error)
      
      expect(response.status).toBe(400)
    })

    it('should handle authentication errors', () => {
      const error = new AppError('Unauthorized', 401, 'AUTH_ERROR')
      const response = handleApiError(error)
      
      expect(response.status).toBe(401)
    })

    it('should handle authorization errors', () => {
      const error = new AppError('Forbidden', 403, 'FORBIDDEN')
      const response = handleApiError(error)
      
      expect(response.status).toBe(403)
    })

    it('should handle not found errors', () => {
      const error = new AppError('Resource not found', 404, 'NOT_FOUND')
      const response = handleApiError(error)
      
      expect(response.status).toBe(404)
    })
  })
})
