'use client'

import { Suspense, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/store/auth'
import { forceRefreshAuth } from '@/lib/force-refresh-auth'
import { DashboardSkeleton } from '@/components/skeletons/dashboard-skeleton'
import { useToast } from '@/hooks/use-toast'
import {
  PlusIcon,
  BeakerIcon,
  DocumentTextIcon,
  BookOpenIcon,
  ChartBarIcon,
  UserIcon,
  SparklesIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline'
import Link from 'next/link'

function DashboardContent() {
  const { user, logout, updateUser } = useAuthStore()
  const [isRefreshing, setIsRefreshing] = useState(false)
  const { showSuccess, showError } = useToast()

  const handleRefreshAuth = async () => {
    setIsRefreshing(true)
    try {
      const freshUserData = await forceRefreshAuth()
      if (freshUserData) {
        updateUser(freshUserData)
        showSuccess("Success", "Profile refreshed successfully!")
      } else {
        showError("Error", "Failed to refresh profile. Please try again.")
      }
    } catch (error) {
      console.error('Refresh error:', error)
      showError("Error", "An error occurred while refreshing your profile.")
    } finally {
      setIsRefreshing(false)
    }
  }

  // No need for auth checking here since the layout handles it
  // The layout ensures user is authenticated before rendering this component

  const quickActions = [
    {
      title: 'New Project',
      description: 'Start a new research project',
      icon: PlusIcon,
      href: '/projects/new',
      color: 'bg-blue-500'
    },
    {
      title: 'Data Analysis',
      description: 'Upload and analyze CSV data',
      icon: ChartBarIcon,
      href: '/analysis/new',
      color: 'bg-indigo-500'
    },
    {
      title: 'Survey Campaigns',
      description: 'Create and manage campaigns',
      icon: BeakerIcon,
      href: '/campaigns',
      color: 'bg-purple-500'
    },
    {
      title: 'Smart Editor',
      description: 'AI-powered writing assistant',
      icon: DocumentTextIcon,
      href: '/editor',
      color: 'bg-green-500'
    },
    {
      title: 'Research Topics',
      description: 'Discover trending topics',
      icon: SparklesIcon,
      href: '/topics',
      color: 'bg-orange-500'
    },
    {
      title: 'Journal Finder',
      description: 'Find suitable journals',
      icon: BookOpenIcon,
      href: '/journals',
      color: 'bg-teal-500'
    }
  ]

  return (
    <div className="space-y-8 md:space-y-10">
      {/* Welcome Header - Premium Design with Effects */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-2xl p-8 md:p-10 text-white shadow-2xl relative overflow-hidden">
        {/* Animated background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] bg-[size:30px_30px]"></div>
        </div>
        {/* Glowing orb */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full filter blur-3xl"></div>
        
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="flex-1">
            <div className="inline-flex items-center gap-2 px-4 py-2 mb-4 bg-white/20 backdrop-blur-md rounded-full text-sm font-semibold shadow-lg">
              <SparklesIcon className="w-4 h-4 animate-pulse" />
              <span>Dashboard</span>
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold mb-3 tracking-tight">
              Welcome back, {user?.full_name || user?.email || 'Guest'}! 👋
            </h1>
            <p className="text-blue-100 text-lg md:text-xl font-light">
              Ready to advance your research today?
            </p>
          </div>
          <div className="flex items-center gap-5">
            <div className="text-right hidden sm:block bg-white/10 backdrop-blur-md rounded-xl px-4 py-3">
              <p className="text-xs text-blue-200 mb-1 uppercase tracking-wide">Role</p>
              <p className="font-bold text-xl capitalize">{user?.role === 'user' ? 'Researcher' : user?.role || 'Guest'}</p>
            </div>
            <div className="flex items-center justify-center w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-white/20 backdrop-blur-md border-2 border-white/40 shadow-xl">
              <UserIcon className="h-8 w-8 md:h-10 md:w-10 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* User Info Card - Premium Design */}
      {user && (
        <Card className="border-2 border-gray-200 shadow-xl hover:shadow-2xl transition-all duration-500 bg-white/80 backdrop-blur-sm">
          <CardHeader className="pb-6 pt-8">
            <CardTitle className="flex items-center text-2xl font-bold">
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 mr-4 shadow-lg">
                <UserIcon className="h-6 w-6 text-blue-600" />
              </div>
              Account Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
              <div className="p-6 rounded-xl bg-gradient-to-br from-gray-50 to-blue-50/30 border border-gray-200 hover:border-blue-300 transition-all duration-300 hover:shadow-lg group">
                <p className="text-sm font-semibold text-gray-600 mb-2 uppercase tracking-wide">Email</p>
                <p className="font-bold text-gray-900 break-all text-lg group-hover:text-blue-600 transition-colors">{user.email || 'Not available'}</p>
              </div>
              <div className="p-6 rounded-xl bg-gradient-to-br from-gray-50 to-indigo-50/30 border border-gray-200 hover:border-indigo-300 transition-all duration-300 hover:shadow-lg group">
                <p className="text-sm font-semibold text-gray-600 mb-2 uppercase tracking-wide">Full Name</p>
                <p className="font-bold text-gray-900 text-lg group-hover:text-indigo-600 transition-colors">{user.full_name || 'Not set'}</p>
              </div>
              <div className="p-6 rounded-xl bg-gradient-to-br from-gray-50 to-purple-50/30 border border-gray-200 hover:border-purple-300 transition-all duration-300 hover:shadow-lg group">
                <p className="text-sm font-semibold text-gray-600 mb-2 uppercase tracking-wide">Account Type</p>
                <p className="font-bold text-gray-900 capitalize text-lg group-hover:text-purple-600 transition-colors">{user.role || 'Guest'}</p>
              </div>
            </div>
            <div className="mt-8 pt-6 border-t-2 border-gray-200 flex flex-wrap gap-4">
              <Button 
                onClick={handleRefreshAuth} 
                variant="outline" 
                size="default"
                disabled={isRefreshing}
                className="min-w-[160px] hover:bg-blue-50 hover:border-blue-400 transition-all duration-300"
              >
                <ArrowPathIcon className={`h-5 w-5 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                Refresh Profile
              </Button>
              <Button 
                onClick={logout} 
                variant="outline" 
                size="default" 
                className="min-w-[120px] hover:bg-red-50 hover:border-red-400 hover:text-red-600 transition-all duration-300"
              >
                Logout
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
      
      {!user && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <UserIcon className="h-5 w-5 mr-2" />
              Guest Mode
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              You're browsing as a guest. Login to access personalized features.
            </p>
            <Link href="/auth">
              <Button>Login / Sign Up</Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions - Premium Grid with Animations */}
      <div>
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-gray-900">
            Quick Actions
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {quickActions.map((action, index) => (
            <Card 
              key={action.title} 
              className="group hover:shadow-2xl transition-all duration-500 cursor-pointer border-2 border-gray-200 hover:border-blue-400 bg-white hover:-translate-y-2 relative overflow-hidden"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-transparent to-blue-50/0 group-hover:to-blue-50/50 transition-all duration-500"></div>
              
              <Link href={action.href} className="block h-full relative z-10">
                <CardContent className="p-8">
                  <div className="flex items-start gap-5">
                    <div className={`flex-shrink-0 p-4 rounded-2xl ${action.color} group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-lg`}>
                      <action.icon className="h-7 w-7 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-900 mb-2 text-lg group-hover:text-blue-600 transition-colors">
                        {action.title}
                      </h3>
                      <p className="text-sm text-gray-600 leading-relaxed font-medium">{action.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Link>
            </Card>
          ))}
        </div>
      </div>

      {/* Welcome Notice - Premium Info Card */}
      <Card className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 border-2 border-blue-200 shadow-xl hover:shadow-2xl transition-all duration-500">
        <CardContent className="p-8">
          <div className="flex items-start gap-5">
            <div className="flex-shrink-0 flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100 shadow-lg">
              <SparklesIcon className="h-7 w-7 text-blue-600 animate-pulse" />
            </div>
            <div className="flex-1">
              <p className="text-lg font-bold text-blue-900 mb-2">Welcome to NCSKIT</p>
              <p className="text-base text-blue-700 leading-relaxed font-medium">
                Your research management platform is ready to use. Start by creating a new project or analyzing your data.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardContent />
    </Suspense>
  )
}