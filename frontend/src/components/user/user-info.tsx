'use client'

import { useSession } from 'next-auth/react'
import { User, Shield, Crown } from 'lucide-react'

export function UserInfo() {
  const { data: session, status } = useSession()

  if (status === 'loading') {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600" />
        <span>Đang tải...</span>
      </div>
    )
  }

  if (!session?.user) {
    return null
  }

  const user = session.user as any
  const isAdmin = user.role === 'admin'

  return (
    <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200 shadow-sm">
      {/* Avatar */}
      <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
        isAdmin ? 'bg-gradient-to-br from-purple-500 to-blue-600' : 'bg-blue-500'
      } text-white font-semibold`}>
        {isAdmin ? (
          <Crown className="w-5 h-5" />
        ) : (
          <User className="w-5 h-5" />
        )}
      </div>

      {/* User Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold text-gray-900 truncate">
            {user.name || user.email}
          </p>
          {isAdmin && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
              <Shield className="w-3 h-3" />
              Admin
            </span>
          )}
        </div>
        <p className="text-xs text-gray-500 truncate">
          {user.email}
        </p>
      </div>
    </div>
  )
}
