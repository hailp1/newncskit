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
          <div className="py-6 min-h-[calc(100vh-4rem)]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              {children}
            </div>
          </div>
          
          {/* Footer */}
          <footer className="bg-white border-t border-gray-200 mt-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                {/* About */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Về NCSKIT</h3>
                  <p className="text-sm text-gray-600">
                    Nền tảng phân tích dữ liệu khảo sát miễn phí cho nhà nghiên cứu Việt Nam.
                  </p>
                </div>
                
                {/* Quick Links */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Liên Kết</h3>
                  <ul className="space-y-2 text-sm">
                    <li><a href="/blog" className="text-gray-600 hover:text-blue-600">Blog</a></li>
                    <li><a href="/about" className="text-gray-600 hover:text-blue-600">Giới Thiệu</a></li>
                    <li><a href="/contact" className="text-gray-600 hover:text-blue-600">Liên Hệ</a></li>
                  </ul>
                </div>
                
                {/* Resources */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Tài Nguyên</h3>
                  <ul className="space-y-2 text-sm">
                    <li><a href="/blog" className="text-gray-600 hover:text-blue-600">Hướng Dẫn</a></li>
                    <li><a href="/blog" className="text-gray-600 hover:text-blue-600">Video Tutorial</a></li>
                    <li><a href="/blog" className="text-gray-600 hover:text-blue-600">FAQ</a></li>
                  </ul>
                </div>
                
                {/* Contact */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Liên Hệ</h3>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>Email: support@ncskit.org</li>
                    <li>Website: app.ncskit.org</li>
                  </ul>
                </div>
              </div>
              
              <div className="mt-8 pt-6 border-t border-gray-200">
                <p className="text-sm text-gray-500 text-center">
                  © 2024 NCSKIT. Made with ❤️ in Vietnam 🇻🇳
                </p>
              </div>
            </div>
          </footer>
        </main>
      </div>
    </div>
  )
}