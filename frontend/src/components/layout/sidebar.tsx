'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/store/auth'
import { forceRefreshAuth } from '@/lib/force-refresh-auth'
import { useViewport } from '@/hooks/use-viewport'
import { useSidebar } from './responsive-layout'
import {
  HomeIcon,
  BeakerIcon,
  DocumentTextIcon,
  BookOpenIcon,
  PresentationChartBarIcon,
  AcademicCapIcon,
  ClipboardDocumentListIcon,
  ChatBubbleLeftRightIcon,
  CogIcon,
  UserIcon,
  FolderIcon,
  KeyIcon,
  PhotoIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ArrowPathIcon,
  ShieldCheckIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
  { 
    name: 'Projects', 
    href: '/projects', 
    icon: BeakerIcon,
    description: 'Create and manage research projects with integrated surveys'
  },
  { 
    name: 'Data Analysis', 
    href: '/analysis', 
    icon: PresentationChartBarIcon,
    description: 'Upload data and perform statistical analysis'
  },
  { 
    name: 'Survey Campaigns', 
    href: '/campaigns', 
    icon: ClipboardDocumentListIcon,
    description: 'Manage survey campaigns and participant rewards'
  },
  { name: 'Topic Suggestions', href: '/topics', icon: AcademicCapIcon },
  { name: 'References', href: '/references', icon: BookOpenIcon },
  { name: 'Smart Editor', href: '/editor', icon: DocumentTextIcon },
  { name: 'Journal Matcher', href: '/journals', icon: ClipboardDocumentListIcon },
  { name: 'Review Manager', href: '/reviews', icon: ChatBubbleLeftRightIcon },
  { name: 'Blog', href: '/blog', icon: BookOpenIcon },
  { 
    name: 'Documentation', 
    href: 'https://docs.ncskit.org', 
    icon: BookOpenIcon,
    description: 'User guides, API docs, and system architecture',
    external: true
  },
]

const adminNavigation = [
  { name: 'Admin Dashboard', href: '/admin', icon: CogIcon },
  { name: 'Manage Users', href: '/admin/users', icon: UserIcon },
  { name: 'Manage Projects', href: '/admin/projects', icon: FolderIcon },
  { name: 'Survey Campaigns', href: '/admin/campaigns', icon: ClipboardDocumentListIcon },
  { name: 'Question Bank', href: '/admin/questions', icon: BookOpenIcon },
  { name: 'Revenue Management', href: '/admin/revenue', icon: KeyIcon },
  { name: 'Manage Posts', href: '/admin/posts', icon: DocumentTextIcon },
  { name: 'Token System', href: '/admin/tokens', icon: KeyIcon },
  { name: 'Permissions', href: '/admin/permissions', icon: CogIcon },
  { name: 'Rewards & Tasks', href: '/admin/rewards', icon: KeyIcon },
  { name: 'Branding Settings', href: '/settings/branding', icon: PhotoIcon },
]

import { isAdmin as checkIsAdmin } from '@/lib/auth-utils'

export function Sidebar() {
  const pathname = usePathname()
  const { user, logout, updateUser } = useAuthStore()
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const { isMobile, isTablet, isDesktop } = useViewport()
  
  // Try to get sidebar context (may not exist on all pages)
  let sidebarContext = null
  try {
    sidebarContext = useSidebar()
  } catch {
    // Sidebar context not available
  }
  
  const isAdmin = checkIsAdmin(user)
  const isCollapsed = isTablet && sidebarContext && !sidebarContext.isOpen

  const handleLogout = async () => {
    try {
      await logout()
      window.location.href = '/auth/login'
    } catch (error) {
      console.error('Logout error:', error)
    }
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
    <div className={cn(
      'flex flex-col bg-white h-full',
      isMobile && 'w-full'
    )}>
      {/* Mobile: Close button */}
      {isMobile && sidebarContext && (
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Menu</h2>
          <button
            onClick={() => sidebarContext.toggle(false)}
            className="p-2 rounded-md text-gray-600 hover:bg-gray-100 touch-target"
            aria-label="Close menu"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>
      )}

      <nav className={cn(
        'flex-1 overflow-y-auto space-y-1',
        isMobile ? 'px-4 py-4' : 'px-3 py-6'
      )}>
            {navigation.map((item) => {
              const isActive = pathname === item.href || 
                (item.href !== '/dashboard' && pathname.startsWith(item.href))
              
              const LinkComponent = item.external ? 'a' : Link;
              const linkProps = item.external 
                ? { target: '_blank', rel: 'noopener noreferrer' }
                : {};
              
              return (
                <LinkComponent
                  key={item.name}
                  href={item.href}
                  {...linkProps}
                  onClick={() => {
                    if (isMobile && sidebarContext) {
                      sidebarContext.toggle(false)
                    }
                  }}
                  className={cn(
                    "group flex items-center px-2 py-2 font-medium rounded-md relative transition-colors",
                    isMobile ? 'text-base touch-target' : 'text-sm',
                    isActive
                      ? "bg-blue-100 text-blue-900"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900",
                    isCollapsed && "justify-center"
                  )}
                  title={item.description || item.name}
                >
                  <item.icon
                    className={cn(
                      "flex-shrink-0",
                      isMobile ? 'h-6 w-6' : 'h-5 w-5',
                      isCollapsed ? 'mr-0' : 'mr-3',
                      isActive ? "text-blue-500" : "text-gray-400 group-hover:text-gray-500"
                    )}
                  />
                  {!isCollapsed && (
                    <div className="flex-1">
                      <div>{item.name}</div>
                      {item.description && !isMobile && (
                        <div className="text-xs text-gray-500 mt-0.5 leading-tight">
                          {item.description}
                        </div>
                      )}
                    </div>
                  )}
                  {!isCollapsed && (
                    <>
                      {/* Enhanced workflow indicators */}
                      {item.name === 'Projects' && (
                        <div className="ml-2">
                          <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                        </div>
                      )}
                      {item.name === 'Survey Campaigns' && (
                        <div className="ml-2">
                          <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                        </div>
                      )}
                    </>
                  )}
                </LinkComponent>
              )
            })}
            
          {/* Admin Section */}
          {isAdmin && !isCollapsed && (
            <div className="pt-6 mt-6 border-t border-gray-200">
              <div className="px-2 pb-3">
                <h3 className={cn(
                  'font-semibold text-gray-500 uppercase tracking-wider',
                  isMobile ? 'text-sm' : 'text-xs'
                )}>
                  Administration
                </h3>
              </div>
              {adminNavigation.map((item) => {
                const isActive = pathname === item.href || 
                  (item.href !== '/admin' && pathname.startsWith(item.href))
                
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => {
                      if (isMobile && sidebarContext) {
                        sidebarContext.toggle(false)
                      }
                    }}
                    className={cn(
                      "group flex items-center px-2 py-2 font-medium rounded-md transition-colors",
                      isMobile ? 'text-base touch-target' : 'text-sm',
                      isActive
                        ? "bg-red-100 text-red-900"
                        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                    )}
                  >
                    <item.icon
                      className={cn(
                        "mr-3 flex-shrink-0",
                        isMobile ? 'h-6 w-6' : 'h-5 w-5',
                        isActive ? "text-red-500" : "text-gray-400 group-hover:text-gray-500"
                      )}
                    />
                    {item.name}
                  </Link>
                )
              })}
            </div>
          )}
        </nav>

        {/* User Menu - Fixed at bottom */}
        {!isCollapsed && (
          <div className="flex-shrink-0 border-t border-gray-200 bg-white">
            <div className={cn(
              isMobile ? 'px-4 py-4' : 'px-3 py-4'
            )}>
              {/* User Info - Clickable to toggle menu */}
              {user && (
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className={cn(
                    'w-full flex items-center px-2 py-2 hover:bg-gray-50 rounded-md transition-colors',
                    isMobile ? 'text-base touch-target' : 'text-sm'
                  )}
                >
                  <div className="flex-shrink-0">
                    <div className={cn(
                      'rounded-full bg-blue-600 flex items-center justify-center text-white font-medium',
                      isMobile ? 'h-10 w-10' : 'h-8 w-8'
                    )}>
                      {user.full_name ? user.full_name.charAt(0).toUpperCase() : user.email?.charAt(0).toUpperCase()}
                    </div>
                  </div>
                  <div className="ml-3 flex-1 min-w-0 text-left">
                    <p className={cn(
                      'font-medium text-gray-900 truncate',
                      isMobile ? 'text-base' : 'text-sm'
                    )}>
                      {user.full_name || 'User'}
                    </p>
                    <p className={cn(
                      'text-gray-500 truncate',
                      isMobile ? 'text-sm' : 'text-xs'
                    )}>
                      {user.email}
                    </p>
                  </div>
                  {isUserMenuOpen ? (
                    <ChevronUpIcon className="h-5 w-5 text-gray-400" />
                  ) : (
                    <ChevronDownIcon className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              )}

              {/* Dropdown Menu */}
              {isUserMenuOpen && user && (
                <div className="mt-2 space-y-1 border-t border-gray-200 pt-2">
                  <Link
                    href="/profile"
                    onClick={() => {
                      if (isMobile && sidebarContext) {
                        sidebarContext.toggle(false)
                      }
                    }}
                    className={cn(
                      "group flex items-center px-2 py-2 font-medium rounded-md transition-colors",
                      isMobile ? 'text-base touch-target' : 'text-sm',
                      pathname === '/profile'
                        ? "bg-blue-100 text-blue-900"
                        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                    )}
                  >
                    <UserIcon
                      className={cn(
                        "mr-3 flex-shrink-0",
                        isMobile ? 'h-6 w-6' : 'h-5 w-5',
                        pathname === '/profile' ? "text-blue-500" : "text-gray-400 group-hover:text-gray-500"
                      )}
                    />
                    Quản lý tài khoản
                  </Link>

                  <Link
                    href="/settings"
                    onClick={() => {
                      if (isMobile && sidebarContext) {
                        sidebarContext.toggle(false)
                      }
                    }}
                    className={cn(
                      "group flex items-center px-2 py-2 font-medium rounded-md transition-colors",
                      isMobile ? 'text-base touch-target' : 'text-sm',
                      pathname === '/settings'
                        ? "bg-blue-100 text-blue-900"
                        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                    )}
                  >
                    <CogIcon
                      className={cn(
                        "mr-3 flex-shrink-0",
                        isMobile ? 'h-6 w-6' : 'h-5 w-5',
                        pathname === '/settings' ? "text-blue-500" : "text-gray-400 group-hover:text-gray-500"
                      )}
                    />
                    Cài đặt
                  </Link>

                  {/* Refresh Profile Button */}
                  <button
                    onClick={handleRefreshProfile}
                    disabled={isRefreshing}
                    className={cn(
                      'w-full group flex items-center px-2 py-2 font-medium rounded-md text-gray-600 hover:bg-gray-100 hover:text-gray-900 disabled:opacity-50 transition-colors',
                      isMobile ? 'text-base touch-target' : 'text-sm'
                    )}
                  >
                    <ArrowPathIcon
                      className={cn(
                        "mr-3 flex-shrink-0 text-gray-400 group-hover:text-gray-500",
                        isMobile ? 'h-6 w-6' : 'h-5 w-5',
                        isRefreshing && "animate-spin"
                      )}
                    />
                    Làm mới thông tin
                  </button>

                  {/* Admin Settings - Only for admins */}
                  {isAdmin && (
                    <Link
                      href="/admin/settings"
                      onClick={() => {
                        if (isMobile && sidebarContext) {
                          sidebarContext.toggle(false)
                        }
                      }}
                      className={cn(
                        "group flex items-center px-2 py-2 font-medium rounded-md transition-colors",
                        isMobile ? 'text-base touch-target' : 'text-sm',
                        pathname === '/admin/settings'
                          ? "bg-red-100 text-red-900"
                          : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                      )}
                    >
                      <ShieldCheckIcon
                        className={cn(
                          "mr-3 flex-shrink-0",
                          isMobile ? 'h-6 w-6' : 'h-5 w-5',
                          pathname === '/admin/settings' ? "text-red-500" : "text-gray-400 group-hover:text-gray-500"
                        )}
                      />
                      Cài đặt Admin
                    </Link>
                  )}

                  {/* Logout Button */}
                  <button
                    onClick={handleLogout}
                    className={cn(
                      'w-full group flex items-center px-2 py-2 font-medium rounded-md text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors',
                      isMobile ? 'text-base touch-target' : 'text-sm'
                    )}
                  >
                    <svg
                      className={cn(
                        'mr-3 flex-shrink-0 text-red-400 group-hover:text-red-500',
                        isMobile ? 'h-6 w-6' : 'h-5 w-5'
                      )}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                      />
                    </svg>
                    Đăng xuất
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
    </div>
  )
}