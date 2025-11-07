'use client'

/**
 * Auth Provider Component
 * Initializes authentication on app load
 */

import { useEffect } from 'react'
import { useAuthStore } from '@/store/auth'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const initialize = useAuthStore((state) => state.initialize)

  useEffect(() => {
    // Initialize auth store on mount
    initialize()
  }, [initialize])

  return <>{children}</>
}
