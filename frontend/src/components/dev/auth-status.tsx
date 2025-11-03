'use client'

import { useEffect, useState } from 'react'
import { useAuthStore } from '@/store/auth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function AuthStatus() {
  const { user, isAuthenticated, isLoading, error, logout, initialize } = useAuthStore()
  const [localStorageStatus, setLocalStorageStatus] = useState<string>('Checking...')

  useEffect(() => {
    // Check localStorage on client side only
    if (typeof window !== 'undefined') {
      const hasData = localStorage.getItem('auth-storage')
      setLocalStorageStatus(hasData ? '✅ Has data' : '❌ Empty')
    }
  }, [isAuthenticated])

  if (process.env.NODE_ENV === 'production') {
    return null
  }

  return (
    <Card className="fixed top-4 right-4 w-80 z-50 bg-white shadow-lg">
      <CardHeader>
        <CardTitle className="text-sm">🔐 Auth Status</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="text-xs space-y-1">
          <div className="flex justify-between">
            <span>Status:</span>
            <span className={isAuthenticated ? 'text-green-600' : 'text-red-600'}>
              {isAuthenticated ? '✅ Logged In' : '❌ Not Logged In'}
            </span>
          </div>
          
          <div className="flex justify-between">
            <span>Loading:</span>
            <span>{isLoading ? '⏳ Yes' : '✅ No'}</span>
          </div>
          
          {user && (
            <>
              <div className="flex justify-between">
                <span>User:</span>
                <span className="text-blue-600">{user.email}</span>
              </div>
              
              <div className="flex justify-between">
                <span>Name:</span>
                <span>{user.profile.firstName} {user.profile.lastName}</span>
              </div>
              
              <div className="flex justify-between">
                <span>Institution:</span>
                <span className="text-xs">{user.profile.institution || 'N/A'}</span>
              </div>
            </>
          )}
          
          {error && (
            <div className="text-red-600 text-xs">
              Error: {error}
            </div>
          )}
        </div>
        
        <div className="flex gap-2">
          {isAuthenticated ? (
            <Button size="sm" onClick={logout} variant="outline">
              Logout
            </Button>
          ) : (
            <Button size="sm" onClick={() => window.location.href = '/login'} variant="outline">
              Login
            </Button>
          )}
          
          <Button size="sm" onClick={initialize} variant="outline">
            Refresh
          </Button>
        </div>
        
        <div className="text-xs text-gray-500">
          LocalStorage: {localStorageStatus}
        </div>
      </CardContent>
    </Card>
  )
}