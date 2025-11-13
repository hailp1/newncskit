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
    <div className="space-y-6 md:space-y-8">
      {/* Welcome Header - Professional Design */}
      <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 rounded-xl p-6 md:p-8 text-white shadow-lg">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 mb-3 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium">
              <SparklesIcon className="w-4 h-4" />
              <span>Dashboard</span>
            </div>
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-2 tracking-tight">
              Welcome back, {user?.full_name || user?.email || 'Guest'}! 👋
            </h1>
            <p className="text-blue-100 text-base md:text-lg">
              Ready to advance your research today?
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm text-blue-100 mb-1">Role</p>
              <p className="font-semibold text-lg capitalize">{user?.role === 'user' ? 'Researcher' : user?.role || 'Guest'}</p>
            </div>
            <div className="flex items-center justify-center w-12 h-12 md:w-16 md:h-16 rounded-full bg-white/20 backdrop-blur-sm border-2 border-white/30">
              <UserIcon className="h-6 w-6 md:h-8 md:w-8 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* User Info Card - Enhanced Design */}
      {user && (
        <Card className="border border-gray-200 shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center text-xl font-semibold">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-50 mr-3">
                <UserIcon className="h-5 w-5 text-blue-600" />
              </div>
              Account Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
              <div className="p-4 rounded-lg bg-gray-50">
                <p className="text-sm font-medium text-gray-600 mb-1">Email</p>
                <p className="font-semibold text-gray-900 break-all">{user.email || 'Not available'}</p>
              </div>
              <div className="p-4 rounded-lg bg-gray-50">
                <p className="text-sm font-medium text-gray-600 mb-1">Full Name</p>
                <p className="font-semibold text-gray-900">{user.full_name || 'Not set'}</p>
              </div>
              <div className="p-4 rounded-lg bg-gray-50">
                <p className="text-sm font-medium text-gray-600 mb-1">Account Type</p>
                <p className="font-semibold text-gray-900 capitalize">{user.role || 'Guest'}</p>
              </div>
            </div>
            <div className="mt-6 pt-4 border-t border-gray-200 flex flex-wrap gap-3">
              <Button 
                onClick={handleRefreshAuth} 
                variant="outline" 
                size="sm"
                disabled={isRefreshing}
                className="min-w-[140px]"
              >
                <ArrowPathIcon className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                Refresh Profile
              </Button>
              <Button onClick={logout} variant="outline" size="sm" className="min-w-[100px]">
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

      {/* Quick Actions - Enhanced Grid */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Quick Actions</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {quickActions.map((action) => (
            <Card 
              key={action.title} 
              className="group hover:shadow-xl transition-all duration-300 cursor-pointer border border-gray-200 hover:border-blue-300 bg-white"
            >
              <Link href={action.href} className="block h-full">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className={`flex-shrink-0 p-3 rounded-xl ${action.color} group-hover:scale-110 transition-transform duration-300`}>
                      <action.icon className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
                        {action.title}
                      </h3>
                      <p className="text-sm text-gray-600 leading-relaxed">{action.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Link>
            </Card>
          ))}
        </div>
      </div>

      {/* Welcome Notice - Professional Info Card */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-lg bg-blue-100">
              <SparklesIcon className="h-5 w-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <p className="text-base font-semibold text-blue-900 mb-1">Welcome to NCSKIT</p>
              <p className="text-sm text-blue-700 leading-relaxed">
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