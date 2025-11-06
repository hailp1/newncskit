import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/token-security';

/**
 * Check OAuth provider connection status
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const provider = searchParams.get('provider');

    if (!provider) {
      return NextResponse.json(
        { error: 'Provider parameter is required' },
        { status: 400 }
      );
    }

    // Get current user from token
    const currentUser = getCurrentUser();
    if (!currentUser) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Check with backend API
    const backendResponse = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/auth/check-connection/?provider=${provider}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${request.cookies.get('auth_token')?.value}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!backendResponse.ok) {
      const errorData = await backendResponse.json().catch(() => ({}));
      return NextResponse.json(
        { 
          error: errorData.error || 'Connection check failed',
          status: 'error',
          provider,
        },
        { status: backendResponse.status }
      );
    }

    const connectionData = await backendResponse.json();

    return NextResponse.json({
      status: 'connected',
      provider,
      lastChecked: new Date().toISOString(),
      ...connectionData,
    });

  } catch (error) {
    console.error('Connection check error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        status: 'error',
      },
      { status: 500 }
    );
  }
}

/**
 * Handle preflight requests
 */
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': process.env.NEXT_PUBLIC_APP_URL || '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Credentials': 'true',
    },
  });
}