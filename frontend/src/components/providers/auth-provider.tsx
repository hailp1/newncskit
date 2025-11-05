'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { useAuthStore } from '@/store/auth'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { initialize, initialized, isLoading } = useAuthStore()

  // Check if current route is public (blog, about, etc.)
  const isPublicRoute = pathname.startsWith('/blog') || 
                       pathname === '/about' || 
                       pathname === '/features' || 
                       pathname === '/'

  useEffect(() => {
    // Only initialize auth for non-public routes or when Supabase is properly configured
    if (!initialized && !isPublicRoute && process.env.NEXT_PUBLIC_SUPABASE_URL) {
      initialize()
    }
  }, [initialize, initialized, isPublicRoute])

  // For public routes, don't show loading spinner
  if (isPublicRoute) {
    return <>{children}</>
  }

  // Show loading spinner while initializing auth for protected routes
  if (!initialized && isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading NCSKIT...</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}