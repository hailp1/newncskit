'use client'

/**
 * Protected Route Component
 * Wraps content that requires authentication
 */

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/auth'
import { isAdmin } from '@/lib/auth-utils'
import { Loader2 } from 'lucide-react'

interface ProtectedRouteProps {
  children: React.ReactNode
  requireAdmin?: boolean
}

export function ProtectedRoute({ children, requireAdmin = false }: ProtectedRouteProps) {
  const router = useRouter()
  const { isAuthenticated, isLoading, user } = useAuthStore()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/login?redirect=' + window.location.pathname)
    }

    if (!isLoading && isAuthenticated && requireAdmin) {
      if (!isAdmin(user)) {
        router.push('/dashboard')
      }
    }
  }, [isAuthenticated, isLoading, requireAdmin, user, router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600" />
          <p className="mt-2 text-gray-600">Đang tải...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  if (requireAdmin && !isAdmin(user)) {
    return null
  }

  return <>{children}</>
}
