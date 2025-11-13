'use client'

import { SessionProvider, useSession } from 'next-auth/react'
import { useEffect } from 'react'
import { useAuthStore } from '@/store/auth'

function SessionSync({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession()
  const setSession = useAuthStore((state) => state.setSession)

  useEffect(() => {
    if (status !== 'loading') {
      setSession(session)
    }
  }, [session, status, setSession])

  return <>{children}</>
}

export function AuthProviderWrapper({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider
      basePath="/api/auth"
      refetchInterval={0}
      refetchOnWindowFocus={false}
    >
      <SessionSync>{children}</SessionSync>
    </SessionProvider>
  )
}
