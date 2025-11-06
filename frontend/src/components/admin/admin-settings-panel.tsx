'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  CogIcon, 
  ShieldCheckIcon, 
  UsersIcon, 
  ChartBarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline'
import Link from 'next/link'
import type { User } from '@/types'

interface AdminSettingsPanelProps {
  user: User | null
}

export default function AdminSettingsPanel({ user }: AdminSettingsPanelProps) {
  const [systemStatus, setSystemStatus] = useState({
    database: 'healthy',
    cache: 'healthy',
    api: 'healthy',
    storage: 'healthy'
  })

  const adminStats = {
    totalUsers: 156,
    activeCampaigns: 23,
    pendingReviews: 8,
    systemAlerts: 2
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircleIcon className="w-4 h-4 text-green-500" />
      case 'warning':
        return <ExclamationTriangleIcon className="w-4 h-4 text-yellow-500" />
      case 'error':
        return <ExclamationTriangleIcon className="w-4 h-4 text-red-500" />
      default:
        return <CogIcon className="w-4 h-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'bg-green-100 text-green-800'
      case 'warning':
        return 'bg-yellow-100 text-yellow-800'
      case 'error':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <Card className="border-orange-200 bg-orange-50">
      <CardHeader>
        <CardTitle className="flex items-center text-orange-800">
          <ShieldCheckIcon className="w-5 h-5 mr-2" />
          Admin Panel
          <Badge variant="secondary" className="ml-2 bg-orange-200 text-orange-800">
            {user?.role || 'Admin'}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-white rounded-lg border">
            <UsersIcon className="w-6 h-6 mx-auto text-blue-600 mb-1" />
            <div className="text-lg font-semibold">{adminStats.totalUsers}</div>
            <div className="text-xs text-gray-600">Total Users</div>
          </div>
          <div className="text-center p-3 bg-white rounded-lg border">
            <ChartBarIcon className="w-6 h-6 mx-auto text-green-600 mb-1" />
            <div className="text-lg font-semibold">{adminStats.activeCampaigns}</div>
            <div className="text-xs text-gray-600">Active Campaigns</div>
          </div>
          <div className="text-center p-3 bg-white rounded-lg border">
            <ExclamationTriangleIcon className="w-6 h-6 mx-auto text-yellow-600 mb-1" />
            <div className="text-lg font-semibold">{adminStats.pendingReviews}</div>
            <div className="text-xs text-gray-600">Pending Reviews</div>
          </div>
          <div className="text-center p-3 bg-white rounded-lg border">
            <CogIcon className="w-6 h-6 mx-auto text-red-600 mb-1" />
            <div className="text-lg font-semibold">{adminStats.systemAlerts}</div>
            <div className="text-xs text-gray-600">System Alerts</div>
          </div>
        </div>

        {/* System Status */}
        <div className="bg-white rounded-lg border p-4">
          <h4 className="font-medium mb-3">System Status</h4>
          <div className="grid grid-cols-2 gap-3">
            {Object.entries(systemStatus).map(([service, status]) => (
              <div key={service} className="flex items-center justify-between">
                <span className="text-sm capitalize">{service}</span>
                <div className="flex items-center space-x-2">
                  {getStatusIcon(status)}
                  <Badge className={getStatusColor(status)}>
                    {status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-2">
          <Link href="/admin">
            <Button size="sm" className="bg-orange-600 hover:bg-orange-700">
              <CogIcon className="w-4 h-4 mr-1" />
              Admin Dashboard
            </Button>
          </Link>
          <Link href="/admin/users">
            <Button size="sm" variant="outline">
              <UsersIcon className="w-4 h-4 mr-1" />
              Manage Users
            </Button>
          </Link>
          <Link href="/admin/config">
            <Button size="sm" variant="outline">
              <CogIcon className="w-4 h-4 mr-1" />
              System Config
            </Button>
          </Link>
        </div>

        {/* Admin Info */}
        <div className="text-xs text-orange-700 bg-orange-100 p-2 rounded">
          <strong>Admin Access:</strong> You have administrative privileges. 
          Use these tools responsibly to manage the platform.
        </div>
      </CardContent>
    </Card>
  )
}