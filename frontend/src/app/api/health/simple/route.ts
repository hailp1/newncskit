import { NextRequest, NextResponse } from 'next/server';
import {
  generateCorrelationId,
  createErrorResponse,
  createSuccessResponse,
  logRequest,
  getCorsHeaders,
} from '@/lib/api-middleware';

// Handle GET for health check
export async function GET(request: NextRequest) {
  const correlationId = generateCorrelationId();

  try {
    logRequest(request, correlationId);

    const healthData = {
      status: 'healthy',
      service: 'ncskit-frontend',
      version: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
      environment: process.env.NODE_ENV,
    };

    return createSuccessResponse(healthData, correlationId);

  } catch (error) {
    return createErrorResponse(
      error instanceof Error ? error : 'Health check failed',
      500,
      correlationId
    );
  }
}

// Handle HEAD for lightweight health check
export async function HEAD(request: NextRequest) {
  const correlationId = generateCorrelationId();

  try {
    logRequest(request, correlationId);

    // Return 200 with no body for HEAD requests
    return new NextResponse(null, {
      status: 200,
      headers: getCorsHeaders(),
    });

  } catch (error) {
    console.error(`[Health Check] ${correlationId}: HEAD request failed`, error);
    return new NextResponse(null, {
      status: 500,
      headers: getCorsHeaders(),
    });
  }
}

// Handle OPTIONS for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: getCorsHeaders(),
  });
}
