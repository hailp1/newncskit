/**
 * Next.js Middleware
 * Handles authentication and session management with NextAuth
 */

import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl
    const token = req.nextauth.token

    // Redirect /login to /auth/login
    if (pathname === '/login') {
      return NextResponse.redirect(new URL('/auth/login', req.url))
    }

    // If user is authenticated and trying to access auth pages, redirect to dashboard
    if (token && (pathname.startsWith('/auth/login') || pathname.startsWith('/auth/register'))) {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ req, token }) => {
        const { pathname } = req.nextUrl

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

        // Check if the route is protected
        const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))

        // If it's a protected route, require authentication
        if (isProtectedRoute) {
          return !!token
        }

        // Allow access to public routes
        return true
      },
    },
    pages: {
      signIn: '/auth/login',
    },
  }
)

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
