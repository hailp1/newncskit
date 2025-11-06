'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/store/auth'
import { authConfig } from '@/config/auth'
import { 
  BeakerIcon, 
  DocumentTextIcon, 
  BookOpenIcon, 
  PresentationChartBarIcon,
  UserCircleIcon,
  Cog6ToothIcon,
  ChevronDownIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline'
import { cn } from '@/lib/utils'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: PresentationChartBarIcon },
  { name: 'Projects', href: '/projects', icon: BeakerIcon },
  { name: 'Blog', href: '/blog', icon: BookOpenIcon },
  { name: 'Editor', href: '/editor', icon: DocumentTextIcon },
]

export function Navbar() {
  const pathname = usePathname()
  const { user, logout, isAuthenticated } = useAuthStore()
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const userMenuRef = useRef<HTMLDivElement>(null)

  // Show navbar for dashboard pages regardless of auth status when auth is disabled
  const shouldShowNavbar = !authConfig.requireAuth || isAuthenticated

  // Close user menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  if (!shouldShowNavbar) {
    return null
  }

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="text-xl font-bold text-blue-600">
                NCSKIT
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {navigation.map((item) => {
                const isActive = pathname.startsWith(item.href)
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium",
                      isActive
                        ? "border-blue-500 text-gray-900"
                        : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                    )}
                  >
                    <item.icon className="w-4 h-4 mr-2" />
                    {item.name}
                  </Link>
                )
              })}
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                {/* Admin Panel Button - Show for admin users */}
                {(user?.is_staff || user?.is_superuser || user?.role === 'admin' || 
                  user?.email === 'admin@ncskit.com' || user?.email === 'admin@ncskit.org') && (
                  <Link href="/admin">
                    <Button 
                      size="sm"
                      className="bg-red-600 hover:bg-red-700 text-white font-medium px-4 py-2 rounded-md shadow-sm transition-colors"
                    >
                      <Cog6ToothIcon className="w-4 h-4 mr-2" />
                      Admin Panel
                    </Button>
                  </Link>
                )}
                
                <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <UserCircleIcon className="w-8 h-8 text-gray-400" />
                  <span>
                    {user?.profile.firstName || 'Demo'} {user?.profile.lastName || 'User'}
                  </span>
                  <ChevronDownIcon className={cn(
                    "w-4 h-4 transition-transform",
                    isUserMenuOpen ? "rotate-180" : ""
                  )} />
                </button>

                {/* User Dropdown Menu */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-50">
                    <div className="py-1">
                      {/* User Info */}
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-900">
                          {user?.profile.firstName} {user?.profile.lastName}
                        </p>
                        <p className="text-sm text-gray-500">{user?.email}</p>
                        {user?.profile.institution && (
                          <p className="text-xs text-gray-400">{user.profile.institution}</p>
                        )}
                      </div>

                      {/* Menu Items */}
                      <Link
                        href="/profile"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <UserCircleIcon className="w-4 h-4 mr-3" />
                        Thông tin cá nhân
                      </Link>

                      <Link
                        href="/settings"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <Cog6ToothIcon className="w-4 h-4 mr-3" />
                        Cài đặt
                      </Link>

                      <div className="border-t border-gray-100">
                        <button
                          onClick={() => {
                            logout()
                            setIsUserMenuOpen(false)
                          }}
                          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          <ArrowRightOnRectangleIcon className="w-4 h-4 mr-3" />
                          Đăng xuất
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              </>
            ) : (
              <>
                <Link href="/features" className="text-gray-600 hover:text-gray-900">
                  Features
                </Link>
                <Link href="/blog" className="text-gray-600 hover:text-gray-900">
                  Blog
                </Link>
                <Link href="/about" className="text-gray-600 hover:text-gray-900">
                  About
                </Link>
                <Button asChild variant="outline">
                  <Link href="/login">Sign In</Link>
                </Button>
                <Button asChild>
                  <Link href="/auth-info">Get Started</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}