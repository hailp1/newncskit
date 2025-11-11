'use client'

import { Suspense, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/store/auth'
import { forceRefreshAuth } from '@/lib/force-refresh-auth'
import { DashboardSkeleton } from '@/components/skeletons/dashboard-skeleton'
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

  const handleRefreshAuth = async () => {
    setIsRefreshing(true)
    try {
      const freshUserData = await forceRefreshAuth()
      if (freshUserData) {
        updateUser(freshUserData)
        alert('Profile refreshed successfully!')
      } else {
        alert('Failed to refresh profile')
      }
    } catch (error) {
      console.error('Refresh error:', error)
      alert('Error refreshing profile')
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
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">
              Welcome back, {user?.email || 'Guest'}! 👋
            </h1>
            <p className="text-blue-100">
              Ready to advance your research today?
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm text-blue-100">Role</p>
              <p className="font-semibold">{user?.role === 'user' ? 'Researcher' : user?.role || 'Guest'}</p>
            </div>
            <UserIcon className="h-12 w-12 text-blue-200" />
          </div>
        </div>
      </div>

      {/* User Info Card */}
      {user && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <UserIcon className="h-5 w-5 mr-2" />
              Account Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="font-medium">{user.email || 'Not logged in'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="font-medium">{user.email || 'Guest User'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Account Type</p>
                <p className="font-medium">{user.role || 'Guest'}</p>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t flex gap-2">
              <Button 
                onClick={handleRefreshAuth} 
                variant="outline" 
                size="sm"
                disabled={isRefreshing}
              >
                <ArrowPathIcon className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                Refresh Profile
              </Button>
              <Button onClick={logout} variant="outline" size="sm">
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

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickActions.map((action) => (
            <Card key={action.title} className="hover:shadow-lg transition-shadow cursor-pointer">
              <Link href={action.href}>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className={`p-3 rounded-lg ${action.color}`}>
                      <action.icon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{action.title}</h3>
                      <p className="text-sm text-gray-600">{action.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Link>
            </Card>
          ))}
        </div>
      </div>

      {/* Demo Notice */}
      <Card className="bg-yellow-50 border-yellow-200">
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <SparklesIcon className="h-5 w-5 text-blue-600" />
            <div>
              <p className="text-sm font-medium text-blue-800">Welcome to NCSKIT</p>
              <p className="text-xs text-blue-700">
                Your research management platform is ready to use.
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