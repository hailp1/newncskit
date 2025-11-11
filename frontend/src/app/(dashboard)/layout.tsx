'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Footer } from '@/components/layout/footer'
import { Sidebar } from '@/components/layout/sidebar'
import { useAuthStore } from '@/store/auth'
import { useNetworkStatus } from '@/hooks/use-network-status'
import { isAdmin } from '@/lib/auth-utils'
import { Wifi, WifiOff, Loader2, UserIcon, ShieldCheckIcon } from 'lucide-react'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, isLoading } = useAuthStore()
  const { isOnline } = useNetworkStatus()
  const pathname = usePathname()
  const userIsAdmin = isAdmin(user)

  // Auth is already initialized in root layout - no need to initialize again

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
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* ============================================
          HEADER SECTION - Fixed at top
          ============================================ */}
      <header className="bg-white shadow-sm border-b border-gray-200 fixed top-0 left-0 right-0 z-50">
        {/* Network Status Bar */}
        {!isOnline && (
          <div className="bg-red-600 text-white text-center py-2 text-sm">
            <WifiOff className="inline h-4 w-4 mr-1" />
            Không có kết nối internet - Một số tính năng có thể không hoạt động
          </div>
        )}

        {/* Main Header */}
        <div className="mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo & Navigation */}
            <div className="flex items-center space-x-8">
              <Link href="/" className="flex items-center space-x-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
                  <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                  </svg>
                </div>
                <span className="text-xl font-bold text-gray-900">NCSKIT</span>
              </Link>

              <nav className="hidden md:flex items-center space-x-1">
                <Link
                  href="/dashboard"
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    pathname === '/dashboard'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  Dashboard
                </Link>
                <Link
                  href="/projects"
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    pathname.startsWith('/projects')
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  Projects
                </Link>
                <Link
                  href="/analysis"
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    pathname.startsWith('/analysis')
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  Analysis
                </Link>
                <Link
                  href="/blog"
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    pathname.startsWith('/blog')
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  Blog
                </Link>
                
                {userIsAdmin && (
                  <Link
                    href="/admin"
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-1 ${
                      pathname.startsWith('/admin')
                        ? 'bg-red-100 text-red-700'
                        : 'text-red-600 hover:text-red-700 hover:bg-red-50'
                    }`}
                  >
                    <ShieldCheckIcon className="h-4 w-4" />
                    Admin
                  </Link>
                )}
              </nav>
            </div>

            {/* User Info */}
            {user && (
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 text-sm text-gray-700">
                  <UserIcon className="h-5 w-5 text-gray-400" />
                  <span className="hidden sm:inline">{user.full_name || user.email}</span>
                  {user.role && (
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-700 capitalize">
                      {user.role}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ============================================
          CONTENT SECTION - Sidebar + Main Content
          ============================================ */}
      <div className="flex min-h-screen">
        {/* Sidebar - Fixed on desktop, hidden on mobile */}
        <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:left-0 lg:top-16 lg:bottom-0 lg:z-40 lg:overflow-y-auto bg-white border-r border-gray-200">
          <Sidebar />
        </aside>
        
        {/* Main Content Area */}
        <main className="flex-1 lg:ml-64 flex flex-col pt-16">
          <div className="flex-1 py-6 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
              {children}
            </div>
          </div>
          
          {/* Footer - Inside main content area */}
          <Footer />
        </main>
      </div>
    </div>
  )
}