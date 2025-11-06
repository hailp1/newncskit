'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  ShieldCheckIcon, 
  CogIcon, 
  UsersIcon, 
  ChartBarIcon,
  CircleStackIcon,
  BellIcon,
  KeyIcon,
  ServerIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  EyeIcon,
  PaintBrushIcon
} from '@heroicons/react/24/outline'
import Link from 'next/link'

interface SystemMetrics {
  userCount: number
  activeUsersToday: number
  activeCampaigns: number
  totalRevenue: number
  systemHealth: {
    database: 'healthy' | 'warning' | 'error'
    api: 'healthy' | 'warning' | 'error'
    storage: 'healthy' | 'warning' | 'error'
    cache: 'healthy' | 'warning' | 'error'
    timestamp: string
  }
  performanceMetrics: {
    cpuUsage: number
    memoryUsage: number
    diskUsage: number
    loadAverage: number
  }
}

interface AdminActivity {
  id: string
  adminUserName: string
  actionType: string
  actionTypeDisplay: string
  description: string
  createdAt: string
}

interface EnhancedAdminDashboardProps {
  user: any
}

export default function EnhancedAdminDashboard({ user }: EnhancedAdminDashboardProps) {
  const [systemMetrics, setSystemMetrics] = useState<SystemMetrics | null>(null)
  const [adminActivities, setAdminActivities] = useState<AdminActivity[]>([])
  const [loading, setLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())

  // Fetch system metrics
  const fetchSystemMetrics = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001'
      const response = await fetch(`${apiUrl}/api/admin/monitoring/metrics/`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      })
      if (response.ok) {
        const data = await response.json()
        setSystemMetrics(data)
      }
    } catch (error) {
      console.error('Failed to fetch system metrics:', error)
    }
  }

  // Fetch admin activities
  const fetchAdminActivities = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001'
      const response = await fetch(`${apiUrl}/api/admin/activities/?limit=10`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      })
      if (response.ok) {
        const data = await response.json()
        setAdminActivities(data.results || [])
      }
    } catch (error) {
      console.error('Failed to fetch admin activities:', error)
    }
  }

  // Initial load and periodic refresh
  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      await Promise.all([fetchSystemMetrics(), fetchAdminActivities()])
      setLoading(false)
      setLastUpdate(new Date())
    }

    loadData()

    // Refresh every 30 seconds
    const interval = setInterval(loadData, 30000)
    return () => clearInterval(interval)
  }, [])

  const adminFeatures = [
    {
      title: 'Quản lý người dùng',
      description: 'Xem, chỉnh sửa và quản lý tài khoản người dùng',
      icon: UsersIcon,
      href: '/admin/users',
      color: 'blue',
      count: systemMetrics?.userCount || 0
    },
    {
      title: 'Cấu hình hệ thống',
      description: 'Thiết lập và cấu hình các thông số hệ thống',
      icon: CogIcon,
      href: '/admin/config',
      color: 'green'
    },
    {
      title: 'Thống kê & Báo cáo',
      description: 'Xem báo cáo sử dụng và thống kê hệ thống',
      icon: ChartBarIcon,
      href: '/admin/analytics',
      color: 'purple'
    },
    {
      title: 'Quản lý Campaign',
      description: 'Quản lý và giám sát các campaign khảo sát',
      icon: CircleStackIcon,
      href: '/admin/campaigns',
      color: 'orange',
      count: systemMetrics?.activeCampaigns || 0
    },
    {
      title: 'Quản lý giao diện',
      description: 'Tùy chỉnh logo, màu sắc và giao diện hệ thống',
      icon: PaintBrushIcon,
      href: '/admin/brand',
      color: 'pink'
    },
    {
      title: 'Bảo mật & Quyền truy cập',
      description: 'Quản lý quyền truy cập và bảo mật hệ thống',
      icon: KeyIcon,
      href: '/admin/security',
      color: 'indigo'
    }
  ]

  const getHealthStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircleIcon className="w-5 h-5 text-green-500" />
      case 'warning':
        return <ExclamationTriangleIcon className="w-5 h-5 text-yellow-500" />
      case 'error':
        return <ExclamationTriangleIcon className="w-5 h-5 text-red-500" />
      default:
        return <ClockIcon className="w-5 h-5 text-gray-500" />
    }
  }

  const getHealthStatusColor = (status: string) => {
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

  const getColorClasses = (color: string) => {
    const colorMap = {
      blue: 'border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100',
      green: 'border-green-200 bg-green-50 text-green-700 hover:bg-green-100',
      purple: 'border-purple-200 bg-purple-50 text-purple-700 hover:bg-purple-100',
      orange: 'border-orange-200 bg-orange-50 text-orange-700 hover:bg-orange-100',
      red: 'border-red-200 bg-red-50 text-red-700 hover:bg-red-100',
      indigo: 'border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100',
      pink: 'border-pink-200 bg-pink-50 text-pink-700 hover:bg-pink-100'
    }
    return colorMap[color as keyof typeof colorMap] || colorMap.blue
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 1) return 'Vừa xong'
    if (diffInMinutes < 60) return `${diffInMinutes} phút trước`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} giờ trước`
    return `${Math.floor(diffInMinutes / 1440)} ngày trước`
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Admin Header */}
      <Card className="border-orange-200 bg-gradient-to-r from-orange-50 to-amber-50">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0">
                <ShieldCheckIcon className="h-12 w-12 text-orange-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-orange-900">
                  Bảng điều khiển quản trị nâng cao
                </h2>
                <p className="text-orange-700">
                  Chào mừng {user?.profile?.firstName || user?.first_name || 'Admin'}, bạn đang có quyền quản trị hệ thống
                </p>
                <div className="flex items-center mt-2 space-x-4">
                  <Badge className="bg-orange-100 text-orange-800">
                    Super Admin
                  </Badge>
                  <span className="text-sm text-orange-600">
                    Cập nhật lần cuối: {lastUpdate.toLocaleTimeString('vi-VN')}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex space-x-3">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  fetchSystemMetrics()
                  fetchAdminActivities()
                  setLastUpdate(new Date())
                }}
              >
                Làm mới
              </Button>
              <Link href="/admin">
                <Button className="bg-orange-600 hover:bg-orange-700 text-white">
                  <ServerIcon className="w-4 h-4 mr-2" />
                  Admin Panel
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tổng người dùng</p>
                <p className="text-2xl font-bold text-gray-900">{systemMetrics?.userCount || 0}</p>
                <p className="text-xs text-green-600 flex items-center mt-1">
                  <ArrowUpIcon className="w-3 h-3 mr-1" />
                  Hoạt động hôm nay: {systemMetrics?.activeUsersToday || 0}
                </p>
              </div>
              <UsersIcon className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Campaign đang chạy</p>
                <p className="text-2xl font-bold text-gray-900">{systemMetrics?.activeCampaigns || 0}</p>
                <p className="text-xs text-blue-600 flex items-center mt-1">
                  <EyeIcon className="w-3 h-3 mr-1" />
                  Đang hoạt động
                </p>
              </div>
              <ChartBarIcon className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tổng doanh thu</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${systemMetrics?.totalRevenue?.toLocaleString() || '0'}
                </p>
                <p className="text-xs text-green-600 flex items-center mt-1">
                  <ArrowUpIcon className="w-3 h-3 mr-1" />
                  Từ phí admin
                </p>
              </div>
              <CircleStackIcon className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Trạng thái hệ thống</p>
                <p className="text-2xl font-bold text-green-600">Tốt</p>
                <p className="text-xs text-gray-600 flex items-center mt-1">
                  <CheckCircleIcon className="w-3 h-3 mr-1" />
                  Tất cả dịch vụ hoạt động
                </p>
              </div>
              <ServerIcon className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Health & Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <ServerIcon className="h-5 w-5 mr-2 text-green-600" />
              Trạng thái dịch vụ
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {systemMetrics?.systemHealth && Object.entries(systemMetrics.systemHealth).map(([service, status]) => {
                if (service === 'timestamp') return null
                return (
                  <div key={service} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {getHealthStatusIcon(status)}
                      <span className="text-sm font-medium capitalize">{service}</span>
                    </div>
                    <Badge className={getHealthStatusColor(status)}>
                      {status === 'healthy' ? 'Tốt' : status === 'warning' ? 'Cảnh báo' : 'Lỗi'}
                    </Badge>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Hiệu suất hệ thống</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>CPU Usage</span>
                  <span>{systemMetrics?.performanceMetrics?.cpuUsage || 0}%</span>
                </div>
                <Progress value={systemMetrics?.performanceMetrics?.cpuUsage || 0} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Memory Usage</span>
                  <span>{systemMetrics?.performanceMetrics?.memoryUsage || 0}%</span>
                </div>
                <Progress value={systemMetrics?.performanceMetrics?.memoryUsage || 0} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Disk Usage</span>
                  <span>{systemMetrics?.performanceMetrics?.diskUsage || 0}%</span>
                </div>
                <Progress value={systemMetrics?.performanceMetrics?.diskUsage || 0} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Admin Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {adminFeatures.map((feature) => {
          const Icon = feature.icon
          return (
            <Link key={feature.href} href={feature.href}>
              <Card className={`transition-all duration-200 hover:shadow-lg cursor-pointer ${getColorClasses(feature.color)}`}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0">
                        <Icon className="h-8 w-8" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold mb-2">
                          {feature.title}
                        </h3>
                        <p className="text-sm opacity-80">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                    {feature.count !== undefined && (
                      <Badge variant="secondary">
                        {feature.count}
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>
          )
        })}
      </div>

      {/* Recent Admin Activities */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Hoạt động quản trị gần đây</span>
            <Link href="/admin/activities">
              <Button variant="outline" size="sm">
                Xem tất cả
              </Button>
            </Link>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {adminActivities.length > 0 ? (
              adminActivities.map((activity) => (
                <div key={activity.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <div>
                      <span className="text-sm font-medium">{activity.description}</span>
                      <p className="text-xs text-gray-500">bởi {activity.adminUserName}</p>
                    </div>
                  </div>
                  <span className="text-xs text-gray-500">
                    {formatTimeAgo(activity.createdAt)}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500 text-center py-4">
                Chưa có hoạt động quản trị nào
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Thao tác nhanh</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Link href="/admin/users/create">
              <Button variant="outline" size="sm">
                <UsersIcon className="w-4 h-4 mr-2" />
                Tạo người dùng mới
              </Button>
            </Link>
            <Button variant="outline" size="sm" onClick={() => {/* Implement backup */}}>
              <CircleStackIcon className="w-4 h-4 mr-2" />
              Backup dữ liệu
            </Button>
            <Link href="/admin/analytics">
              <Button variant="outline" size="sm">
                <ChartBarIcon className="w-4 h-4 mr-2" />
                Xem báo cáo hôm nay
              </Button>
            </Link>
            <Link href="/admin/notifications">
              <Button variant="outline" size="sm">
                <BellIcon className="w-4 h-4 mr-2" />
                Gửi thông báo
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}