/**
 * Next.js Middleware
 * Handles authentication and session management
 */

import { type NextRequest, NextResponse } from 'next/server'
import { updateSession, requireAuth } from '@/lib/supabase/middleware'

// Protected routes that require authentication
const protectedRoutes = [
  '/dashboard',
  '/projects',
  '/editor',
  '/references',
  '/analytics',
  '/journals',
  '/topics',
  '/reviews',
  '/analysis',
  '/blog-admin',
  '/admin',
  '/profile',
  '/settings',
  '/docs',
]

// Public routes that don't require authentication
const publicRoutes = [
  '/',
  '/auth',
  '/login',
  '/register',
  '/about',
  '/features',
  '/blog',
  '/contact',
  '/privacy',
  '/terms',
  '/setup-guide',
  '/tutorials',
]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Check if the route is protected
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))
  const isPublicRoute = publicRoutes.some(route => 
    pathname === route || pathname.startsWith(`${route}/`)
  )

  // Update session for all requests
  const response = await updateSession(request)

  // If it's a protected route, check authentication
  if (isProtectedRoute) {
    const user = await requireAuth(request)

    if (!user) {
      // Redirect to login with return URL
      // CRITICAL: Use public URL to avoid redirecting to localhost inside Tunnel
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://ncskit.org'
      const redirectUrl = new URL('/auth/login', baseUrl)
      redirectUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(redirectUrl)
    }
  }

  // If user is authenticated and trying to access auth pages, redirect to dashboard
  // BUT exclude /auth/callback which is needed for OAuth completion
  if ((pathname.startsWith('/auth/login') || pathname.startsWith('/auth/register')) && !pathname.includes('/auth/callback')) {
    const user = await requireAuth(request)
    
    if (user) {
      // If there's a callbackUrl, redirect there instead of dashboard
      const callbackUrl = request.nextUrl.searchParams.get('callbackUrl')
      if (callbackUrl) {
        return NextResponse.redirect(new URL(callbackUrl))
      }
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://ncskit.org'
      return NextResponse.redirect(new URL('/dashboard', baseUrl))
    }
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - api routes (handled separately)
     */
    '/((?!_next/static|_next/image|favicon.ico|api|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
