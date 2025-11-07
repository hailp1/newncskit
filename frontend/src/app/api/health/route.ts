// Combined Health Check Endpoint
// Checks all services and returns overall system health

import { NextResponse } from 'next/server'

interface ServiceHealth {
  status: 'healthy' | 'unhealthy' | 'degraded'
  latency?: number
  error?: string
  [key: string]: any
}

async function checkService(url: string, timeout: number = 5000): Promise<ServiceHealth> {
  const startTime = Date.now()

  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeout)

    const response = await fetch(url, {
      signal: controller.signal
    })

    clearTimeout(timeoutId)
    const latency = Date.now() - startTime

    if (!response.ok) {
      return {
        status: 'unhealthy',
        latency,
        error: `HTTP ${response.status}`
      }
    }

    const data = await response.json()
    return {
      ...data,
      latency
    }
  } catch (error) {
    const latency = Date.now() - startTime
    return {
      status: 'unhealthy',
      latency,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  try {
    // Check all services in parallel
    const [vercelHealth, supabaseHealth, dockerHealth] = await Promise.all([
      checkService(`${baseUrl}/api/health/vercel`),
      checkService(`${baseUrl}/api/health/supabase`),
      checkService(`${baseUrl}/api/health/docker`)
    ])

    // Determine overall status
    const allHealthy = [vercelHealth, supabaseHealth, dockerHealth].every(
      h => h.status === 'healthy'
    )
    const anyUnhealthy = [vercelHealth, supabaseHealth, dockerHealth].some(
      h => h.status === 'unhealthy'
    )

    const overallStatus = allHealthy ? 'healthy' : anyUnhealthy ? 'degraded' : 'unhealthy'

    return NextResponse.json({
      status: overallStatus,
      timestamp: new Date().toISOString(),
      services: {
        vercel: vercelHealth,
        supabase: supabaseHealth,
        docker: dockerHealth
      },
      summary: {
        total: 3,
        healthy: [vercelHealth, supabaseHealth, dockerHealth].filter(h => h.status === 'healthy').length,
        unhealthy: [vercelHealth, supabaseHealth, dockerHealth].filter(h => h.status === 'unhealthy').length,
        degraded: [vercelHealth, supabaseHealth, dockerHealth].filter(h => h.status === 'degraded').length
      }
    }, { status: overallStatus === 'healthy' ? 200 : 503 })
  } catch (error) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}
