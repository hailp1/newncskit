// Docker R Analytics Health Check Endpoint
import { NextResponse } from 'next/server'
import { logHealthCheckFailure } from '@/lib/monitoring/error-logger'
import { env } from '@/config/env'

const ANALYTICS_SERVICE_URL = env.analytics.url
const HEALTH_TIMEOUT = 5000 // 5 seconds

export async function GET() {
  const startTime = Date.now()

  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), HEALTH_TIMEOUT)

    const response = await fetch(`${ANALYTICS_SERVICE_URL}/health`, {
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json'
      }
    })

    clearTimeout(timeoutId)
    const latency = Date.now() - startTime

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }

    const healthData = await response.json()

    return NextResponse.json({
      status: 'healthy',
      service: 'r-analytics-docker',
      timestamp: new Date().toISOString(),
      latency,
      analytics: healthData,
      config: {
        serviceUrl: ANALYTICS_SERVICE_URL,
        timeout: HEALTH_TIMEOUT
      }
    })
  } catch (error) {
    const latency = Date.now() - startTime
    const isTimeout = error instanceof Error && error.name === 'AbortError'
    const errorMessage = isTimeout ? 'Connection timeout' : (error instanceof Error ? error.message : 'Unknown error')

    // Log health check failure
    logHealthCheckFailure('docker-analytics', errorMessage, {
      additionalData: {
        latency,
        timeout: isTimeout,
        serviceUrl: ANALYTICS_SERVICE_URL,
        stack: error instanceof Error ? error.stack : undefined
      }
    })

    return NextResponse.json(
      {
        status: 'unhealthy',
        service: 'r-analytics-docker',
        error: errorMessage,
        latency,
        timestamp: new Date().toISOString(),
        config: {
          serviceUrl: ANALYTICS_SERVICE_URL,
          timeout: HEALTH_TIMEOUT
        }
      },
      { status: 503 }
    )
  }
}
