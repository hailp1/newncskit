// Simple Health Check Endpoint
// Returns healthy status without checking external services
// Used by useNetworkStatus hook to avoid false positives

import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json(
    {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'ncskit-frontend'
    },
    { status: 200 }
  )
}

export async function HEAD() {
  return new NextResponse(null, { status: 200 })
}
