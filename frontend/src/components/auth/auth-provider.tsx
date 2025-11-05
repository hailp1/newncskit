'use client'

import { useEffect } from 'react'
import { useAuthStore } from '@/store/auth'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { initialize, initialized } = useAuthStore()

  useEffect(() => {
    // Initialize auth when app starts
    if (!initialized) {
      initialize()
    }
  }, [initialize, initialized])

  return <>{children}</>
}