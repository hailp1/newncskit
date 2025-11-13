'use client'

import { useSession, signOut } from 'next-auth/react'
import { useAuthStore } from '@/store/auth'
import { isAdmin } from '@/lib/auth-utils'
import { useState } from 'react'

export default function DebugSession() {
  const { data: session, status } = useSession()
  const { user, isAuthenticated } = useAuthStore()
  const [fixing, setFixing] = useState(false)
  const [fixResult, setFixResult] = useState<any>(null)
  const [creating, setCreating] = useState(false)
  const [createResult, setCreateResult] = useState<any>(null)

  const handleFixRole = async () => {
    setFixing(true)
    setFixResult(null)

    try {
      const response = await fetch('/api/debug/fix-role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userId: user?.id,
          email: user?.email || session?.user?.email || 'phuchai.le@gmail.com'
        }),
      })

      const data = await response.json()
      setFixResult(data)

      if (data.success) {
        alert('✅ Role fixed! Logging out in 2 seconds...')
        setTimeout(() => {
          signOut({ callbackUrl: '/auth/login' })
        }, 2000)
      } else {
        alert('❌ Failed: ' + (data.error || 'Unknown error'))
      }
    } catch (error) {
      console.error('Fix role error:', error)
      alert('❌ Error: ' + (error instanceof Error ? error.message : 'Unknown'))
    } finally {
      setFixing(false)
    }
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Debug Session</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* NextAuth Session */}
        <div className="bg-white p-4 rounded-lg border">
          <h2 className="text-lg font-semibold mb-3">NextAuth Session</h2>
          <div className="space-y-2">
            <p><strong>Status:</strong> {status}</p>
            <p><strong>User ID:</strong> {(session?.user as any)?.id || 'N/A'}</p>
            <p><strong>Email:</strong> {session?.user?.email || 'N/A'}</p>
            <p><strong>Name:</strong> {session?.user?.name || 'N/A'}</p>
            <p><strong>Role:</strong> {(session?.user as any)?.role || 'N/A'}</p>
            <p><strong>Is Admin:</strong> {isAdmin(session?.user as any) ? '✅ YES' : '❌ NO'}</p>
          </div>
          
          <details className="mt-4">
            <summary className="cursor-pointer font-medium">Full Session</summary>
            <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto">
              {JSON.stringify(session, null, 2)}
            </pre>
          </details>
        </div>

        {/* Auth Store */}
        <div className="bg-white p-4 rounded-lg border">
          <h2 className="text-lg font-semibold mb-3">Auth Store</h2>
          <div className="space-y-2">
            <p><strong>Authenticated:</strong> {isAuthenticated ? '✅ YES' : '❌ NO'}</p>
            <p><strong>User ID:</strong> {user?.id || 'N/A'}</p>
            <p><strong>Email:</strong> {user?.email || 'N/A'}</p>
            <p><strong>Name:</strong> {user?.full_name || 'N/A'}</p>
            <p><strong>Role:</strong> {user?.role || 'N/A'}</p>
            <p><strong>Is Admin:</strong> {isAdmin(user) ? '✅ YES' : '❌ NO'}</p>
          </div>
          
          <details className="mt-4">
            <summary className="cursor-pointer font-medium">Full User</summary>
            <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto">
              {JSON.stringify(user, null, 2)}
            </pre>
          </details>
        </div>
      </div>
      
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-semibold mb-2">Expected for Admin:</h3>
        <ul className="text-sm space-y-1">
          <li>✅ Role should be "admin"</li>
          <li>✅ Is Admin should be YES</li>
          <li>✅ Both NextAuth and Store should match</li>
        </ul>
      </div>

      {/* Fix Role Button */}
      {user && user.role !== 'admin' && (
        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h3 className="font-semibold mb-2 text-yellow-800">⚠️ Role Issue Detected</h3>
          <p className="text-sm text-yellow-700 mb-3">
            Current role is "{user.role}" but should be "admin"
          </p>
          <div className="space-y-3">
            <button
              onClick={handleFixRole}
              disabled={fixing}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {fixing ? '🔧 Fixing...' : '🔧 Fix Role to Admin'}
            </button>
            
            <div className="mt-3 p-3 bg-white rounded border border-yellow-300">
              <p className="text-sm font-semibold mb-2">📝 After clicking Fix:</p>
              <ol className="text-sm space-y-1 list-decimal list-inside">
                <li>Wait for success message</li>
                <li>You will be logged out automatically</li>
                <li>Login again with same credentials</li>
                <li>Role will be "admin" ✅</li>
              </ol>
            </div>
            
            <button
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 text-sm"
            >
              🚪 Manual Logout Now
            </button>
          </div>
        </div>
      )}

      {/* Fix Result */}
      {fixResult && (
        <div className={`mt-4 p-4 rounded-lg ${fixResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
          <h3 className="font-semibold mb-2">{fixResult.success ? '✅ Success' : '❌ Error'}</h3>
          <pre className="text-xs overflow-auto">
            {JSON.stringify(fixResult, null, 2)}
          </pre>
          
          {!fixResult.success && fixResult.suggestion && (
            <div className="mt-4">
              <button
                onClick={async () => {
                  setCreating(true)
                  try {
                    const res = await fetch('/api/debug/create-admin', { method: 'POST' })
                    const data = await res.json()
                    setCreateResult(data)
                    if (data.success) {
                      alert('✅ Admin created! Please login with:\nEmail: phuchai.le@gmail.com\nPassword: Admin123')
                    }
                  } catch (err) {
                    alert('❌ Error creating admin')
                  } finally {
                    setCreating(false)
                  }
                }}
                disabled={creating}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
              >
                {creating ? '⏳ Creating...' : '➕ Create Admin Account'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Create Result */}
      {createResult && (
        <div className="mt-4 p-4 rounded-lg bg-green-50 border border-green-200">
          <h3 className="font-semibold mb-2">✅ Admin Account {createResult.action === 'created' ? 'Created' : 'Updated'}</h3>
          <pre className="text-xs overflow-auto">
            {JSON.stringify(createResult, null, 2)}
          </pre>
          <div className="mt-4 p-3 bg-white rounded border">
            <p className="font-semibold mb-2">Login Credentials:</p>
            <p className="text-sm">Email: phuchai.le@gmail.com</p>
            <p className="text-sm">Password: Admin123</p>
            <a href="/auth/login" className="mt-2 inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
              Go to Login
            </a>
          </div>
        </div>
      )}
    </div>
  )
}
