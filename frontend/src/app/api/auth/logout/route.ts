import { NextRequest, NextResponse } from 'next/server';

/**
 * Secure logout endpoint
 * Clears all authentication cookies and invalidates tokens
 */
export async function POST(request: NextRequest) {
  try {
    // Get tokens from cookies
    const authToken = request.cookies.get('auth_token')?.value;
    const refreshToken = request.cookies.get('refresh_token')?.value;

    // Call backend to invalidate tokens if available
    if (authToken || refreshToken) {
      try {
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/logout/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(authToken && { 'Authorization': `Bearer ${authToken}` }),
          },
          body: JSON.stringify({
            refresh_token: refreshToken,
          }),
        });
      } catch (error) {
        // Continue with logout even if backend call fails
        console.error('Backend logout error:', error);
      }
    }

    // Create response
    const response = NextResponse.json({
      message: 'Logged out successfully',
      timestamp: new Date().toISOString(),
    });

    // Clear all authentication cookies
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict' as const,
      path: '/',
      maxAge: 0, // Expire immediately
    };

    // Clear auth cookies
    response.cookies.set('auth_token', '', cookieOptions);
    response.cookies.set('refresh_token', '', cookieOptions);
    response.cookies.set('session_token', '', cookieOptions);
    
    // Clear user info cookie (not httpOnly)
    response.cookies.set('user_info', '', {
      ...cookieOptions,
      httpOnly: false,
    });

    // Clear NextAuth cookies if they exist
    response.cookies.set('next-auth.session-token', '', cookieOptions);
    response.cookies.set('__Secure-next-auth.session-token', '', {
      ...cookieOptions,
      secure: true,
    });

    return response;

  } catch (error) {
    console.error('Logout error:', error);
    
    // Still clear cookies even if there's an error
    const response = NextResponse.json(
      { error: 'Logout completed with errors' },
      { status: 200 } // Still return success since cookies will be cleared
    );

    // Clear cookies
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict' as const,
      path: '/',
      maxAge: 0,
    };

    response.cookies.set('auth_token', '', cookieOptions);
    response.cookies.set('refresh_token', '', cookieOptions);
    response.cookies.set('session_token', '', cookieOptions);
    response.cookies.set('user_info', '', { ...cookieOptions, httpOnly: false });

    return response;
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
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Credentials': 'true',
    },
  });
}