'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { authConfig } from '@/config/auth'
import {
  ShieldCheckIcon,
  ShieldExclamationIcon,
  Cog6ToothIcon,
} from '@heroicons/react/24/outline'

export function AuthToggle() {
  const [isAuthRequired, setIsAuthRequired] = useState(authConfig.requireAuth)
  const [showSettings, setShowSettings] = useState(false)

  // This is for development only - in production, this would be handled differently
  const toggleAuth = () => {
    // Note: This won't actually change the config file, just the local state
    // In a real app, you'd need to update the config through an API
    setIsAuthRequired(!isAuthRequired)
    console.log('Auth requirement toggled:', !isAuthRequired)
  }

  if (process.env.NODE_ENV === 'production') {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {showSettings ? (
        <Card className="w-80">
          <CardHeader>
            <CardTitle className="flex items-center text-sm">
              <Cog6ToothIcon className="w-4 h-4 mr-2" />
              Development Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">Authentication Required</span>
              <Badge variant={isAuthRequired ? 'destructive' : 'secondary'}>
                {isAuthRequired ? 'ON' : 'OFF'}
              </Badge>
            </div>
            
            <div className="text-xs text-gray-600">
              Current mode: {isAuthRequired ? 'Protected routes require login' : 'All routes accessible'}
            </div>
            
            <div className="flex gap-2">
              <Button size="sm" onClick={toggleAuth} className="flex-1">
                Toggle Auth
              </Button>
              <Button size="sm" variant="outline" onClick={() => setShowSettings(false)}>
                Close
              </Button>
            </div>
            
            <div className="text-xs text-gray-500">
              Note: This only affects the UI state. To permanently change auth settings, 
              update the authConfig in /src/config/auth.ts
            </div>
          </CardContent>
        </Card>
      ) : (
        <Button
          size="sm"
          variant="outline"
          onClick={() => setShowSettings(true)}
          className="shadow-lg"
        >
          {isAuthRequired ? (
            <ShieldCheckIcon className="w-4 h-4 mr-2" />
          ) : (
            <ShieldExclamationIcon className="w-4 h-4 mr-2" />
          )}
          Dev Settings
        </Button>
      )}
    </div>
  )
}