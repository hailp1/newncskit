'use client'

import { useEffect, useState } from 'react'

export default function ForceLogout() {
  const [status, setStatus] = useState('Logging out...')

  useEffect(() => {
    const forceLogout = async () => {
      try {
        setStatus('Clearing cookies...')
        
        // Clear all cookies
        document.cookie.split(";").forEach((c) => {
          document.cookie = c
            .replace(/^ +/, "")
            .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/")
        })
        
        setStatus('Clearing storage...')
        
        // Clear localStorage and sessionStorage
        localStorage.clear()
        sessionStorage.clear()
        
        setStatus('Clearing session...')
        
        // Call NextAuth signout API directly
        try {
          await fetch('/api/auth/signout', { method: 'POST' })
        } catch (e) {
          // Ignore errors, we're clearing anyway
        }
        
        setStatus('✅ Complete! Redirecting to login...')
        
        // Redirect to login after 1 second
        setTimeout(() => {
          window.location.href = '/auth/login'
        }, 1000)
        
      } catch (error) {
        setStatus('❌ Error: ' + (error instanceof Error ? error.message : 'Unknown'))
        // Still redirect even if error
        setTimeout(() => {
          window.location.href = '/auth/login'
        }, 2000)
      }
    }

    forceLogout()
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <div className="text-center">
          <div className="mb-4">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
          
          <h1 className="text-2xl font-bold mb-4">Force Logout</h1>
          
          <p className="text-gray-600 mb-6">{status}</p>
          
          <div className="space-y-2 text-sm text-left bg-blue-50 p-4 rounded">
            <p className="font-semibold">After redirect, login with:</p>
            <p>📧 Email: phuchai.le@gmail.com</p>
            <p>🔑 Password: Admin123</p>
            <p className="mt-2 text-green-600 font-semibold">✅ Role will be: admin</p>
          </div>
        </div>
      </div>
    </div>
  )
}
