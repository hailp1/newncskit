'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/store/auth'
import {
  PlusIcon,
  BeakerIcon,
  DocumentTextIcon,
  BookOpenIcon,
  ChartBarIcon,
  UserIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline'
import Link from 'next/link'

export default function DashboardPage() {
  const router = useRouter()
  const { user, isAuthenticated, logout } = useAuthStore()

  useEffect(() => {
    // Redirect to demo login if not authenticated
    if (!isAuthenticated) {
      router.push('/demo-login')
    }
  }, [isAuthenticated, router])

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Please login to access dashboard</p>
          <Button onClick={() => router.push('/demo-login')}>
            Go to Login
          </Button>
        </div>
      </div>
    )
  }

  const quickActions = [
    {
      title: 'New Project',
      description: 'Start a new research project',
      icon: PlusIcon,
      href: '/projects/new',
      color: 'bg-blue-500'
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
      color: 'bg-purple-500'
    },
    {
      title: 'Journal Finder',
      description: 'Find suitable journals',
      icon: BookOpenIcon,
      href: '/journals',
      color: 'bg-orange-500'
    },
    {
      title: 'Analytics',
      description: 'View research analytics',
      icon: ChartBarIcon,
      href: '/analysis',
      color: 'bg-indigo-500'
    },
    {
      title: 'Blog',
      description: 'Read research insights',
      icon: BookOpenIcon,
      href: '/blog',
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
              Welcome back, {user.full_name}! 👋
            </h1>
            <p className="text-blue-100">
              Ready to advance your research today?
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm text-blue-100">Role</p>
              <p className="font-semibold">{user.role === 'user' ? 'Researcher' : user.role}</p>
            </div>
            <UserIcon className="h-12 w-12 text-blue-200" />
          </div>
        </div>
      </div>

      {/* User Info Card */}
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
              <p className="font-medium">{user.email}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Full Name</p>
              <p className="font-medium">{user.full_name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Account Type</p>
              <p className="font-medium">Demo User</p>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t">
            <Button onClick={logout} variant="outline" size="sm">
              Logout
            </Button>
          </div>
        </CardContent>
      </Card>

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
            <SparklesIcon className="h-5 w-5 text-yellow-600" />
            <div>
              <p className="text-sm font-medium text-yellow-800">Demo Mode</p>
              <p className="text-xs text-yellow-700">
                You are using NCSKIT in demo mode. Some features may have limited functionality.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}