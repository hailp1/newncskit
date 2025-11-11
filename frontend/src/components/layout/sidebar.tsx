'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/store/auth'
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
  const { user, logout } = useAuthStore()
  
  const isAdmin = checkIsAdmin(user)

  const handleLogout = async () => {
    try {
      await logout()
      window.location.href = '/auth/login'
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  return (
    <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:left-0 lg:top-16 lg:bottom-0 lg:z-40">
      <div className="flex-1 flex flex-col bg-white border-r border-gray-200 h-full">
        <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
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
                  className={cn(
                    "group flex items-center px-2 py-2 text-sm font-medium rounded-md relative",
                    isActive
                      ? "bg-blue-100 text-blue-900"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  )}
                  title={item.description || item.name}
                >
                  <item.icon
                    className={cn(
                      "mr-3 flex-shrink-0 h-5 w-5",
                      isActive ? "text-blue-500" : "text-gray-400 group-hover:text-gray-500"
                    )}
                  />
                  <div className="flex-1">
                    <div>{item.name}</div>
                    {item.description && (
                      <div className="text-xs text-gray-500 mt-0.5 leading-tight">
                        {item.description}
                      </div>
                    )}
                  </div>
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
                </LinkComponent>
              )
            })}
            
          {/* Admin Section */}
          {isAdmin && (
            <div className="pt-6 mt-6 border-t border-gray-200">
              <div className="px-2 pb-3">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
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
                    className={cn(
                      "group flex items-center px-2 py-2 text-sm font-medium rounded-md",
                      isActive
                        ? "bg-red-100 text-red-900"
                        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                    )}
                  >
                    <item.icon
                      className={cn(
                        "mr-3 flex-shrink-0 h-5 w-5",
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
        <div className="flex-shrink-0 border-t border-gray-200 bg-white">
          <div className="px-3 py-4 space-y-2">
            {/* User Info */}
            {user && (
              <div className="flex items-center px-2 py-2 text-sm">
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-medium">
                    {user.full_name ? user.full_name.charAt(0).toUpperCase() : user.email?.charAt(0).toUpperCase()}
                  </div>
                </div>
                <div className="ml-3 flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {user.full_name || 'User'}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {user.email}
                  </p>
                </div>
              </div>
            )}

            {/* User Actions */}
            <div className="space-y-1">
              <Link
                href="/profile"
                className={cn(
                  "group flex items-center px-2 py-2 text-sm font-medium rounded-md",
                  pathname === '/profile'
                    ? "bg-blue-100 text-blue-900"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                )}
              >
                <UserIcon
                  className={cn(
                    "mr-3 flex-shrink-0 h-5 w-5",
                    pathname === '/profile' ? "text-blue-500" : "text-gray-400 group-hover:text-gray-500"
                  )}
                />
                Quản lý tài khoản
              </Link>

              <Link
                href="/settings"
                className={cn(
                  "group flex items-center px-2 py-2 text-sm font-medium rounded-md",
                  pathname === '/settings'
                    ? "bg-blue-100 text-blue-900"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                )}
              >
                <CogIcon
                  className={cn(
                    "mr-3 flex-shrink-0 h-5 w-5",
                    pathname === '/settings' ? "text-blue-500" : "text-gray-400 group-hover:text-gray-500"
                  )}
                />
                Cài đặt
              </Link>

              <button
                onClick={handleLogout}
                className="w-full group flex items-center px-2 py-2 text-sm font-medium rounded-md text-red-600 hover:bg-red-50 hover:text-red-700"
              >
                <svg
                  className="mr-3 flex-shrink-0 h-5 w-5 text-red-400 group-hover:text-red-500"
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
          </div>
        </div>
      </div>
    </aside>
  )
}