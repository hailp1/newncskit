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
]

export function Sidebar() {
  const pathname = usePathname()
  const { user } = useAuthStore()
  
  const isAdmin = user?.role && ['super_admin', 'admin', 'moderator'].includes(user.role)

  return (
    <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 lg:pt-16">
      <div className="flex-1 flex flex-col min-h-0 bg-gray-50 border-r border-gray-200">
        <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
          <nav className="mt-5 flex-1 px-2 space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href || 
                (item.href !== '/dashboard' && pathname.startsWith(item.href))
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
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
                </Link>
              )
            })}
            
            {/* Admin Section */}
            {isAdmin && (
              <>
                <div className="pt-6">
                  <div className="px-2 pb-2">
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
              </>
            )}
          </nav>
        </div>
      </div>
    </div>
  )
}