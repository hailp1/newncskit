// Supabase Health Check Endpoint
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { logHealthCheckFailure, ErrorSeverity } from '@/lib/monitoring/error-logger'

export async function GET() {
  const startTime = Date.now()

  try {
    const supabase = await createClient()

    // Test database connection
    const { error: dbError } = await supabase
      .from('profiles')
      .select('count')
      .limit(1)
      .single()

    const dbLatency = Date.now() - startTime

    // Test auth service
    const authStartTime = Date.now()
    const { data: { session }, error: authError } = await supabase.auth.getSession()
    const authLatency = Date.now() - authStartTime

    // Test storage (just check if accessible)
    const storageStartTime = Date.now()
    const { data: buckets, error: storageError } = await supabase.storage.listBuckets()
    const storageLatency = Date.now() - storageStartTime

    const isHealthy = !dbError && !authError && !storageError

    // Log errors if any component is unhealthy
    if (dbError) {
      logHealthCheckFailure('supabase-database', dbError.message, {
        additionalData: { latency: dbLatency }
      })
    }
    if (authError) {
      logHealthCheckFailure('supabase-auth', authError.message, {
        additionalData: { latency: authLatency }
      })
    }
    if (storageError) {
      logHealthCheckFailure('supabase-storage', storageError.message, {
        additionalData: { latency: storageLatency }
      })
    }

    return NextResponse.json({
      status: isHealthy ? 'healthy' : 'degraded',
      service: 'supabase',
      timestamp: new Date().toISOString(),
      checks: {
        database: {
          status: dbError ? 'unhealthy' : 'healthy',
          latency: dbLatency,
          error: dbError?.message
        },
        auth: {
          status: authError ? 'unhealthy' : 'healthy',
          latency: authLatency,
          authenticated: !!session,
          error: authError?.message
        },
        storage: {
          status: storageError ? 'unhealthy' : 'healthy',
          latency: storageLatency,
          bucketsCount: buckets?.length || 0,
          error: storageError?.message
        }
      },
      config: {
        url: process.env.NEXT_PUBLIC_SUPABASE_URL || 'not configured',
        hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      }
    }, { status: isHealthy ? 200 : 503 })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    
    // Log critical health check failure
    logHealthCheckFailure('supabase', errorMessage, {
      additionalData: { 
        latency: Date.now() - startTime,
        stack: error instanceof Error ? error.stack : undefined
      }
    })

    return NextResponse.json(
      {
        status: 'unhealthy',
        service: 'supabase',
        error: errorMessage,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}
