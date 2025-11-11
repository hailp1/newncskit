'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuthStore } from '@/store/auth'
import { useAuthModal } from '@/hooks/use-auth-modal'
import { preloadAuthModal } from '@/components/auth/lazy-auth-modal'
import { forceRefreshAuth } from '@/lib/force-refresh-auth'
import { isAdmin as checkIsAdmin } from '@/lib/auth-utils'
import { Button } from '@/components/ui/button'
import {
  Bars3Icon,
  XMarkIcon,
  UserIcon,
  ChevronDownIcon,
  BeakerIcon,
  DocumentTextIcon,
  BookOpenIcon,
  ChartBarIcon,
  AcademicCapIcon,
  SparklesIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  ArrowPathIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: ChartBarIcon },
  { name: 'Projects', href: '/projects', icon: BeakerIcon },
  { name: 'Editor', href: '/editor', icon: DocumentTextIcon },
  { name: 'Journals', href: '/journals', icon: BookOpenIcon },
  { name: 'Topics', href: '/topics', icon: AcademicCapIcon },
  { name: 'Analysis', href: '/analysis', icon: SparklesIcon },
  { name: 'Blog Admin', href: '/blog-admin', icon: BookOpenIcon },
]

const publicNavigation = [
  { name: 'Home', href: '/' },
  { name: 'Features', href: '/features' },
  { name: 'Blog', href: '/blog' },
  { name: 'About', href: '/about' },
]

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const { user, isAuthenticated, logout, updateUser } = useAuthStore()
  const { openLogin, openRegister } = useAuthModal()
  const pathname = usePathname()
  const isAdmin = checkIsAdmin(user)

  const handleLogout = async () => {
    await logout()
    setUserMenuOpen(false)
  }

  const handleRefreshProfile = async () => {
    setIsRefreshing(true)
    try {
      const freshUserData = await forceRefreshAuth()
      if (freshUserData) {
        updateUser(freshUserData)
      }
    } catch (error) {
      console.error('Refresh error:', error)
    } finally {
      setIsRefreshing(false)
    }
  }

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8" aria-label="Top">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
                <BeakerIcon className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">NCSKIT</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-6">
            {isAuthenticated ? (
              // Authenticated Navigation
              <>
                {navigation.map((item) => {
                  const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-blue-100 text-blue-700'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      }`}
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.name}</span>
                    </Link>
                  )
                })}
              </>
            ) : (
              // Public Navigation
              <>
                {publicNavigation.map((item) => {
                  const isActive = pathname === item.href
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-blue-100 text-blue-700'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      }`}
                    >
                      {item.name}
                    </Link>
                  )
                })}
              </>
            )}
          </div>

          {/* Right side */}
          <div className="flex items-center space-x-4">
            {isAuthenticated && user ? (
              // User Menu
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center space-x-2 rounded-full bg-gray-50 p-2 text-sm hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <UserIcon className="h-5 w-5 text-gray-600" />
                  <span className="hidden sm:block text-gray-700">{user.full_name}</span>
                  <ChevronDownIcon className="h-4 w-4 text-gray-600" />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 z-50">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900">{user.full_name || 'User'}</p>
                      <p className="text-xs text-gray-500 truncate">{user.email}</p>
                      <p className="text-xs text-blue-600 capitalize mt-1">{user.role || 'user'}</p>
                    </div>
                    <Link
                      href="/profile"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <UserIcon className="mr-3 h-4 w-4" />
                      Quản lý tài khoản
                    </Link>
                    <Link
                      href="/settings"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <Cog6ToothIcon className="mr-3 h-4 w-4" />
                      Cài đặt
                    </Link>
                    <button
                      onClick={handleRefreshProfile}
                      disabled={isRefreshing}
                      className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-50"
                    >
                      <ArrowPathIcon className={`mr-3 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                      Làm mới thông tin
                    </button>
                    {isAdmin && (
                      <>
                        <div className="border-t border-gray-100 my-1"></div>
                        <Link
                          href="/admin"
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          <ShieldCheckIcon className="mr-3 h-4 w-4" />
                          Admin Panel
                        </Link>
                        <Link
                          href="/admin/settings"
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          <Cog6ToothIcon className="mr-3 h-4 w-4" />
                          Cài đặt Admin
                        </Link>
                      </>
                    )}
                    <div className="border-t border-gray-100 my-1"></div>
                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      <ArrowRightOnRectangleIcon className="mr-3 h-4 w-4" />
                      Đăng xuất
                    </button>
                  </div>
                )}
              </div>
            ) : (
              // Auth Buttons
              <div className="flex items-center space-x-2">
                <Button 
                  onClick={openLogin} 
                  onMouseEnter={preloadAuthModal}
                  onFocus={preloadAuthModal}
                  variant="outline" 
                  size="sm"
                >
                  Login
                </Button>
                <Button 
                  onClick={openRegister}
                  onMouseEnter={preloadAuthModal}
                  onFocus={preloadAuthModal}
                  size="sm"
                >
                  Sign Up
                </Button>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              type="button"
              className="md:hidden rounded-md p-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <XMarkIcon className="h-6 w-6" />
              ) : (
                <Bars3Icon className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden">
            <div className="space-y-1 pb-3 pt-2">
              {isAuthenticated ? (
                <>
                  {navigation.map((item) => {
                    const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        className={`flex items-center space-x-2 rounded-md px-3 py-2 text-base font-medium ${
                          isActive
                            ? 'bg-blue-100 text-blue-700'
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                        }`}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <item.icon className="h-5 w-5" />
                        <span>{item.name}</span>
                      </Link>
                    )
                  })}
                  {user && (
                    <div className="border-t border-gray-200 pt-4">
                      <div className="px-3 py-2">
                        <p className="text-base font-medium text-gray-900">{user.full_name}</p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                      </div>
                      <Link
                        href="/profile"
                        className="block rounded-md px-3 py-2 text-base font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Profile
                      </Link>
                      <Link
                        href="/settings"
                        className="block rounded-md px-3 py-2 text-base font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Settings
                      </Link>
                      {user.role === 'admin' && (
                        <Link
                          href="/admin"
                          className="block rounded-md px-3 py-2 text-base font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          Admin Panel
                        </Link>
                      )}
                      <button
                        onClick={() => {
                          handleLogout()
                          setMobileMenuOpen(false)
                        }}
                        className="block w-full rounded-md px-3 py-2 text-left text-base font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                      >
                        Sign out
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <>
                  {publicNavigation.map((item) => {
                    const isActive = pathname === item.href
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        className={`block rounded-md px-3 py-2 text-base font-medium ${
                          isActive
                            ? 'bg-blue-100 text-blue-700'
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                        }`}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        {item.name}
                      </Link>
                    )
                  })}
                  <div className="border-t border-gray-200 pt-4">
                    <button
                      onClick={() => {
                        openLogin()
                        setMobileMenuOpen(false)
                      }}
                      onTouchStart={preloadAuthModal}
                      className="block w-full text-left rounded-md px-3 py-2 text-base font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    >
                      Login
                    </button>
                    <button
                      onClick={() => {
                        openRegister()
                        setMobileMenuOpen(false)
                      }}
                      onTouchStart={preloadAuthModal}
                      className="block w-full text-left rounded-md px-3 py-2 text-base font-medium bg-blue-600 text-white hover:bg-blue-700"
                    >
                      Sign Up
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  )
}