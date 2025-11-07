// Vercel Health Check Endpoint
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const healthData = {
      status: 'healthy',
      service: 'vercel-frontend',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      region: process.env.VERCEL_REGION || 'unknown',
      deployment: {
        id: process.env.VERCEL_DEPLOYMENT_ID || 'local',
        url: process.env.VERCEL_URL || 'localhost',
        git: {
          commit: process.env.VERCEL_GIT_COMMIT_SHA || 'unknown',
          branch: process.env.VERCEL_GIT_COMMIT_REF || 'unknown'
        }
      },
      runtime: {
        node: process.version,
        platform: process.platform,
        arch: process.arch
      },
      uptime: process.uptime()
    }

    return NextResponse.json(healthData)
  } catch (error) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        service: 'vercel-frontend',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}
