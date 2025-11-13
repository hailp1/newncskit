'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  ArrowLeftIcon, 
  UserIcon, 
  ShieldCheckIcon,
  EnvelopeIcon,
  CalendarIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline'
import Link from 'next/link'

interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  fullName: string
  role: string
  status: string
  avatarUrl?: string
  createdAt: string
  lastLoginAt?: string
  loginCount: number
}

export default function UserDetailPage() {
  const params = useParams()
  const router = useRouter()
  const userId = params.id as string

  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [selectedRole, setSelectedRole] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('')

  useEffect(() => {
    loadUser()
  }, [userId])

  const loadUser = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/users/${userId}`)
      if (response.ok) {
        const data = await response.json()
        setUser(data)
        setSelectedRole(data.role)
        setSelectedStatus(data.status)
      }
    } catch (error) {
      console.error('Error loading user:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateRole = async () => {
    if (!user || selectedRole === user.role) return

    try {
      setSaving(true)
      const response = await fetch(`/api/users/${userId}/role`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: selectedRole })
      })

      if (response.ok) {
        await loadUser()
        alert('Cập nhật role thành công')
      } else {
        alert('Lỗi khi cập nhật role')
      }
    } catch (error) {
      console.error('Error updating role:', error)
      alert('Lỗi khi cập nhật role')
    } finally {
      setSaving(false)
    }
  }

  const handleUpdateStatus = async () => {
    if (!user || selectedStatus === user.status) return

    try {
      setSaving(true)
      const response = await fetch(`/api/users/${userId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: selectedStatus })
      })

      if (response.ok) {
        await loadUser()
        alert('Cập nhật trạng thái thành công')
      } else {
        alert('Lỗi khi cập nhật trạng thái')
      }
    } catch (error) {
      console.error('Error updating status:', error)
      alert('Lỗi khi cập nhật trạng thái')
    } finally {
      setSaving(false)
    }
  }

  const getRoleBadge = (role: string) => {
    const colors = {
      super_admin: 'bg-purple-100 text-purple-800',
      admin: 'bg-blue-100 text-blue-800',
      moderator: 'bg-green-100 text-green-800',
      user: 'bg-gray-100 text-gray-800'
    }
    return <Badge className={colors[role as keyof typeof colors] || colors.user}>{role}</Badge>
  }

  const getStatusBadge = (status: string) => {
    const colors = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800',
      suspended: 'bg-yellow-100 text-yellow-800',
      banned: 'bg-red-100 text-red-800'
    }
    return <Badge className={colors[status as keyof typeof colors] || colors.inactive}>{status}</Badge>
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-gray-600">Không tìm thấy người dùng</p>
            <Link href="/admin/users">
              <Button className="mt-4">Quay lại danh sách</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/admin/users">
          <Button variant="outline" size="sm">
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Quay lại
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Chi tiết người dùng</h1>
          <p className="text-gray-600 mt-1">Quản lý thông tin và quyền hạn</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User Profile */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Thông tin cá nhân</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="h-20 w-20 rounded-full bg-gray-200 flex items-center justify-center">
                  {user.avatarUrl ? (
                    <img src={user.avatarUrl} alt={user.fullName} className="h-20 w-20 rounded-full" />
                  ) : (
                    <UserIcon className="h-10 w-10 text-gray-400" />
                  )}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{user.fullName}</h2>
                  <p className="text-gray-600">{user.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div>
                  <Label className="text-sm text-gray-600">User ID</Label>
                  <p className="font-mono text-sm">{user.id}</p>
                </div>
                <div>
                  <Label className="text-sm text-gray-600">Ngày tạo</Label>
                  <p className="text-sm">{new Date(user.createdAt).toLocaleDateString('vi-VN')}</p>
                </div>
                <div>
                  <Label className="text-sm text-gray-600">Đăng nhập lần cuối</Label>
                  <p className="text-sm">
                    {user.lastLoginAt 
                      ? new Date(user.lastLoginAt).toLocaleDateString('vi-VN')
                      : 'Chưa đăng nhập'}
                  </p>
                </div>
                <div>
                  <Label className="text-sm text-gray-600">Số lần đăng nhập</Label>
                  <p className="text-sm">{user.loginCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Role Management */}
          <Card>
            <CardHeader>
              <CardTitle>Quản lý Role</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Role hiện tại</Label>
                <div className="mt-2">{getRoleBadge(user.role)}</div>
              </div>

              <div>
                <Label htmlFor="role">Thay đổi role</Label>
                <select
                  id="role"
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="user">User</option>
                  <option value="moderator">Moderator</option>
                  <option value="admin">Admin</option>
                  <option value="super_admin">Super Admin</option>
                </select>
              </div>

              {selectedRole !== user.role && (
                <Button 
                  onClick={handleUpdateRole} 
                  disabled={saving}
                  className="w-full"
                >
                  {saving ? 'Đang lưu...' : 'Cập nhật Role'}
                </Button>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Status Management */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Trạng thái tài khoản</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Trạng thái hiện tại</Label>
                <div className="mt-2">{getStatusBadge(user.status)}</div>
              </div>

              <div>
                <Label htmlFor="status">Thay đổi trạng thái</Label>
                <select
                  id="status"
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="suspended">Suspended</option>
                  <option value="banned">Banned</option>
                </select>
              </div>

              {selectedStatus !== user.status && (
                <Button 
                  onClick={handleUpdateStatus} 
                  disabled={saving}
                  className="w-full"
                  variant={selectedStatus === 'banned' ? 'destructive' : 'default'}
                >
                  {saving ? 'Đang lưu...' : 'Cập nhật Trạng thái'}
                </Button>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Thống kê</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Số lần đăng nhập</span>
                <span className="font-semibold">{user.loginCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Trạng thái</span>
                {user.status === 'active' ? (
                  <CheckCircleIcon className="h-5 w-5 text-green-600" />
                ) : (
                  <XCircleIcon className="h-5 w-5 text-red-600" />
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
