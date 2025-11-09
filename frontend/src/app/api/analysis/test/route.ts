import { NextResponse } from 'next/server';

/**
 * Test endpoint to verify API routes are working
 */
export async function GET() {
  return NextResponse.json(
    {
      success: true,
      message: 'Analysis API is working',
      timestamp: new Date().toISOString(),
      endpoints: {
        upload: '/api/analysis/upload (POST)',
        health: '/api/analysis/health (POST)',
        test: '/api/analysis/test (GET)',
      }
    },
    {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store',
      }
    }
  );
}

export async function POST() {
  return NextResponse.json(
    {
      success: true,
      message: 'POST request received',
      timestamp: new Date().toISOString(),
    },
    {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      }
    }
  );
}
