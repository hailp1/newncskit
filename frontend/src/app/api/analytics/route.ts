// Analytics API Gateway
// Forwards requests to R Analytics Docker service with circuit breaker, caching, and retry logic

import { NextRequest, NextResponse } from 'next/server'
import { analyticsCircuitBreaker, CircuitState } from '@/lib/circuit-breaker'
import { analyticsCache } from '@/lib/analytics-cache'
import { logAnalyticsError, logApiError } from '@/lib/monitoring/error-logger'
import { env } from '@/config/env'

const ANALYTICS_SERVICE_URL = env.analytics.url
const ANALYTICS_API_KEY = env.analytics.apiKey
const REQUEST_TIMEOUT = 30000 // 30 seconds
const MAX_RETRIES = 3
const RETRY_DELAY = 1000 // 1 second

interface AnalyticsRequest {
  endpoint: string
  method: 'GET' | 'POST'
  params?: Record<string, any>
  projectId?: string
  useCache?: boolean
}

/**
 * Validate request body
 */
function validateRequest(body: any): { valid: boolean; error?: string } {
  if (!body.endpoint) {
    return { valid: false, error: 'Missing endpoint' }
  }

  if (!body.method || !['GET', 'POST'].includes(body.method)) {
    return { valid: false, error: 'Invalid method' }
  }

  return { valid: true }
}

/**
 * Make request with timeout
 */
async function fetchWithTimeout(
  url: string,
  options: RequestInit,
  timeout: number
): Promise<Response> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeout)

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    })
    clearTimeout(timeoutId)
    return response
  } catch (error) {
    clearTimeout(timeoutId)
    throw error
  }
}

/**
 * Make request with retry logic
 */
async function fetchWithRetry(
  url: string,
  options: RequestInit,
  maxRetries: number = MAX_RETRIES
): Promise<Response> {
  let lastError: Error | null = null

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetchWithTimeout(url, options, REQUEST_TIMEOUT)
      
      // Don't retry on client errors (4xx)
      if (response.status >= 400 && response.status < 500) {
        return response
      }

      // Retry on server errors (5xx)
      if (response.status >= 500 && attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * (attempt + 1)))
        continue
      }

      return response
    } catch (error) {
      lastError = error as Error
      
      // Don't retry on timeout if it's the last attempt
      if (attempt === maxRetries) {
        throw lastError
      }

      // Wait before retry with exponential backoff
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * Math.pow(2, attempt)))
    }
  }

  throw lastError || new Error('Max retries exceeded')
}

/**
 * Forward request to R Analytics service
 */
async function forwardToAnalytics(request: AnalyticsRequest): Promise<any> {
  const { endpoint, method, params, projectId } = request

  // Build URL
  let url = `${ANALYTICS_SERVICE_URL}${endpoint}`
  if (projectId && method === 'POST') {
    url += `?project_id=${projectId}`
  }

  // Make request
  const options: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': ANALYTICS_API_KEY
    }
  }

  if (method === 'POST' && params) {
    options.body = JSON.stringify(params)
  }

  const response = await fetchWithRetry(url, options)

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Analytics service error: ${response.status} - ${errorText}`)
  }

  return await response.json()
}

/**
 * POST /api/analytics
 * Main analytics gateway endpoint
 */
export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body: AnalyticsRequest = await request.json()

    // Validate request
    const validation = validateRequest(body)
    if (!validation.valid) {
      return NextResponse.json(
        { success: false, error: validation.error },
        { status: 400 }
      )
    }

    // Check circuit breaker
    if (!analyticsCircuitBreaker.canAttempt()) {
      const state = analyticsCircuitBreaker.getState()
      return NextResponse.json(
        {
          success: false,
          error: 'Analytics service is temporarily unavailable',
          circuitState: state.state,
          retryAfter: state.nextAttemptTime
            ? Math.ceil((state.nextAttemptTime - Date.now()) / 1000)
            : null
        },
        { status: 503 }
      )
    }

    // Check cache if enabled
    if (body.useCache !== false) {
      const cached = await analyticsCache.get(body.endpoint, body.params || {})
      if (cached) {
        return NextResponse.json({
          success: true,
          data: cached,
          cached: true,
          timestamp: new Date().toISOString()
        })
      }
    }

    // Forward request to analytics service
    try {
      const result = await forwardToAnalytics(body)

      // Record success in circuit breaker
      analyticsCircuitBreaker.recordSuccess()

      // Cache result if successful
      if (result.success && body.useCache !== false) {
        await analyticsCache.set(body.endpoint, body.params || {}, result)
      }

      return NextResponse.json({
        success: true,
        data: result,
        cached: false,
        timestamp: new Date().toISOString()
      })
    } catch (error) {
      // Record failure in circuit breaker
      analyticsCircuitBreaker.recordFailure()

      // Log analytics error
      logAnalyticsError(
        error instanceof Error ? error : 'Analytics request failed',
        {
          action: body.endpoint,
          data: body.params
        }
      )

      throw error
    }
  } catch (error) {
    console.error('Analytics gateway error:', error)

    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    const isTimeout = errorMessage.includes('aborted') || errorMessage.includes('timeout')

    // Log API error
    logApiError(
      error instanceof Error ? error : errorMessage,
      {
        endpoint: '/api/analytics',
        method: 'POST',
        statusCode: isTimeout ? 504 : 500,
        requestData: await request.json().catch(() => ({})),
        responseData: { error: errorMessage }
      }
    )

    return NextResponse.json(
      {
        success: false,
        error: isTimeout ? 'Request timeout' : 'Analytics service error',
        details: errorMessage,
        timestamp: new Date().toISOString()
      },
      { status: isTimeout ? 504 : 500 }
    )
  }
}

/**
 * GET /api/analytics
 * Get gateway status
 */
export async function GET() {
  const circuitState = analyticsCircuitBreaker.getState()

  return NextResponse.json({
    status: 'ok',
    service: 'analytics-gateway',
    version: '1.0.0',
    circuitBreaker: {
      state: circuitState.state,
      failureCount: circuitState.failureCount,
      isAvailable: circuitState.state !== CircuitState.OPEN
    },
    config: {
      serviceUrl: ANALYTICS_SERVICE_URL,
      timeout: REQUEST_TIMEOUT,
      maxRetries: MAX_RETRIES
    },
    timestamp: new Date().toISOString()
  })
}
