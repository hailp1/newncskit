'use client'

import { useEffect } from 'react'
import { Navbar } from '@/components/layout/navbar'
import { Sidebar } from '@/components/layout/sidebar'
import { useAuthStore } from '@/store/auth'
import { useNetworkStatus } from '@/hooks/use-network-status'
import { Wifi, WifiOff, Loader2 } from 'lucide-react'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { isAuthenticated, isLoading, initialize } = useAuthStore()
  const { isOnline, isConnected } = useNetworkStatus()

  useEffect(() => {
    // Initialize auth store to get user session
    initialize()
  }, [initialize])

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600" />
          <p className="mt-2 text-gray-600">Đang tải...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Network status indicator */}
      {!isOnline && (
        <div className="bg-red-600 text-white text-center py-2 text-sm">
          <WifiOff className="inline h-4 w-4 mr-1" />
          Không có kết nối internet - Một số tính năng có thể không hoạt động
        </div>
      )}
      
      {!isConnected && isOnline && (
        <div className="bg-yellow-600 text-white text-center py-2 text-sm">
          <Wifi className="inline h-4 w-4 mr-1" />
          Vấn đề kết nối - Đang thử lại...
        </div>
      )}

      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 lg:ml-64 pt-16">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}