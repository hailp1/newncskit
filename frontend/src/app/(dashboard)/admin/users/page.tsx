'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  UsersIcon, 
  MagnifyingGlassIcon,
  UserPlusIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline'
import { userServiceClient, UserProfile, UserFilters as ServiceUserFilters } from '@/services/user.service.client'
import { ErrorHandler } from '@/services/error-handler'
import { UserRole } from '@/lib/permissions/constants'

interface UserFilters {
  search: string
  subscription_type: string
  is_active: string
  role: string
}

export default function UserManagementPage() {
  const [users, setUsers] = useState<UserProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [filters, setFilters] = useState<UserFilters>({
    search: '',
    subscription_type: '',
    is_active: '',
    role: ''
  })
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [bulkActionLoading, setBulkActionLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [totalUsers, setTotalUsers] = useState(0)
  const [currentPage, setCurrentPage] = useState(0)
  const [roleChangeLoading, setRoleChangeLoading] = useState<string | null>(null)

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers()
    }, 300)

    return () => clearTimeout(timer)
  }, [filters, currentPage])

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const serviceFilters: ServiceUserFilters = {
        page: currentPage,
        limit: 20,
        search: filters.search || undefined,
        subscription_type: filters.subscription_type as any || undefined,
        is_active: filters.is_active ? filters.is_active === 'true' : undefined,
        role: filters.role as UserRole || undefined,
        sort_by: 'created_at',
        sort_order: 'desc'
      }

      const response = await userServiceClient.getUsers(serviceFilters)
      setUsers(response.users)
      setTotalUsers(response.total)
    } catch (err) {
      const errorMessage = ErrorHandler.handle(err)
      setError(errorMessage.message)
      console.error('Error fetching users:', err)
    } finally {
      setLoading(false)
    }
  }, [filters, currentPage])

  const handleBulkAction = async (action: 'activate' | 'suspend' | 'delete') => {
    if (selectedUsers.length === 0) {
      setError('Vui lòng chọn người dùng trước')
      return
    }

    const actionLabels = {
      activate: 'kích hoạt',
      suspend: 'tạm khóa',
      delete: 'xóa'
    }

    const confirmMessage = `Bạn có chắc chắn muốn ${actionLabels[action]} ${selectedUsers.length} người dùng?`
    if (!confirm(confirmMessage)) return

    try {
      setBulkActionLoading(true)
      setError(null)

      const result = await userServiceClient.bulkAction(selectedUsers, action)
      
      if (result.success_count > 0) {
        setSuccess(`Đã ${actionLabels[action]} thành công ${result.success_count} người dùng`)
        setSelectedUsers([])
        fetchUsers()
      }

      if (result.failure_count > 0) {
        setError(`Không thể ${actionLabels[action]} ${result.failure_count} người dùng`)
      }

      // Auto-hide success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      const errorMessage = ErrorHandler.handle(err)
      setError(errorMessage.message)
    } finally {
      setBulkActionLoading(false)
    }
  }

  const handleUserAction = async (userId: string, action: 'activate' | 'suspend') => {
    const user = users.find(u => u.id === userId)
    if (!user) return

    const actionLabels = {
      activate: 'kích hoạt',
      suspend: 'tạm khóa'
    }

    const confirmMessage = `Bạn có chắc chắn muốn ${actionLabels[action]} người dùng ${user.email}?`
    if (!confirm(confirmMessage)) return

    try {
      setError(null)
      const isActive = action === 'activate'
      await userServiceClient.toggleUserStatus(userId, isActive)
      
      setSuccess(`Đã ${actionLabels[action]} người dùng ${user.email} thành công`)
      fetchUsers()

      // Auto-hide success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      const errorMessage = ErrorHandler.handle(err)
      setError(errorMessage.message)
    }
  }

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    const user = users.find(u => u.id === userId)
    if (!user) return

    const confirmMessage = `Bạn có chắc chắn muốn thay đổi vai trò của ${user.email} thành ${newRole}?`
    if (!confirm(confirmMessage)) return

    try {
      setRoleChangeLoading(userId)
      setError(null)
      
      await userServiceClient.updateUserRole(userId, newRole)
      
      setSuccess(`Đã cập nhật vai trò của ${user.email} thành công`)
      fetchUsers()

      // Auto-hide success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      const errorMessage = ErrorHandler.handle(err)
      setError(errorMessage.message)
    } finally {
      setRoleChangeLoading(null)
    }
  }

  const getStatusBadge = (user: UserProfile) => {
    if (!user.is_active) {
      return <Badge variant="destructive">Tạm khóa</Badge>
    }
    return <Badge variant="secondary">Hoạt động</Badge>
  }

  const getRoleBadge = (role: UserRole) => {
    const roleLabels = {
      user: 'Người dùng',
      moderator: 'Kiểm duyệt viên',
      admin: 'Quản trị viên',
      super_admin: 'Quản trị viên cấp cao'
    }
    const roleColors = {
      user: 'bg-gray-100 text-gray-800',
      moderator: 'bg-blue-100 text-blue-800',
      admin: 'bg-purple-100 text-purple-800',
      super_admin: 'bg-red-100 text-red-800'
    }
    return (
      <Badge className={roleColors[role]}>
        {roleLabels[role]}
      </Badge>
    )
  }

  const getSubscriptionBadge = (type: string) => {
    const labels = {
      free: 'Miễn phí',
      premium: 'Cao cấp',
      institutional: 'Tổ chức'
    }
    const colors = {
      free: 'bg-gray-100 text-gray-800',
      premium: 'bg-blue-100 text-blue-800',
      institutional: 'bg-purple-100 text-purple-800'
    }
    return (
      <Badge className={colors[type as keyof typeof colors] || colors.free}>
        {labels[type as keyof typeof labels] || type}
      </Badge>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý người dùng</h1>
          <p className="text-gray-600">Quản lý tài khoản, vai trò và quyền hạn người dùng</p>
        </div>
        <div className="flex space-x-3">
          <Button onClick={() => setShowCreateModal(true)}>
            <UserPlusIcon className="w-4 h-4 mr-2" />
            Thêm người dùng
          </Button>
        </div>
      </div>

      {/* Success Message */}
      {success && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircleIcon className="h-5 w-5 text-green-600" />
              <span className="text-sm font-medium text-green-800">{success}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error Message */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <XCircleIcon className="h-5 w-5 text-red-600" />
                <span className="text-sm font-medium text-red-800">{error}</span>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setError(null)
                  fetchUsers()
                }}
              >
                Thử lại
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tìm kiếm</label>
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Tìm theo tên hoặc email..."
                  value={filters.search}
                  onChange={(e) => setFilters({...filters, search: e.target.value})}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Gói dịch vụ</label>
              <select
                value={filters.subscription_type}
                onChange={(e) => setFilters({...filters, subscription_type: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Tất cả gói</option>
                <option value="free">Miễn phí</option>
                <option value="premium">Cao cấp</option>
                <option value="institutional">Tổ chức</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Trạng thái</label>
              <select
                value={filters.is_active}
                onChange={(e) => setFilters({...filters, is_active: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Tất cả trạng thái</option>
                <option value="true">Hoạt động</option>
                <option value="false">Tạm khóa</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Vai trò</label>
              <select
                value={filters.role}
                onChange={(e) => setFilters({...filters, role: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Tất cả vai trò</option>
                <option value="user">Người dùng</option>
                <option value="moderator">Kiểm duyệt viên</option>
                <option value="admin">Quản trị viên</option>
                <option value="super_admin">Quản trị viên cấp cao</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      {selectedUsers.length > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <ExclamationTriangleIcon className="h-5 w-5 text-orange-600" />
                <span className="text-sm font-medium text-orange-800">
                  Đã chọn {selectedUsers.length} người dùng
                </span>
              </div>
              <div className="flex space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleBulkAction('activate')}
                  disabled={bulkActionLoading}
                >
                  {bulkActionLoading ? 'Đang xử lý...' : 'Kích hoạt'}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleBulkAction('suspend')}
                  disabled={bulkActionLoading}
                >
                  {bulkActionLoading ? 'Đang xử lý...' : 'Tạm khóa'}
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleBulkAction('delete')}
                  disabled={bulkActionLoading}
                >
                  {bulkActionLoading ? 'Đang xử lý...' : 'Xóa'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <UsersIcon className="h-5 w-5 mr-2" />
              Người dùng ({totalUsers})
            </div>
            {totalUsers > 20 && (
              <div className="text-sm text-gray-500">
                Trang {currentPage + 1} / {Math.ceil(totalUsers / 20)}
              </div>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {/* Skeleton loaders */}
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4 p-4 border rounded-lg animate-pulse">
                  <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                  </div>
                  <div className="h-6 w-20 bg-gray-200 rounded"></div>
                  <div className="h-6 w-20 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-8">
              <UsersIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Không tìm thấy người dùng</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <input
                        type="checkbox"
                        checked={selectedUsers.length === users.length && users.length > 0}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedUsers(users.map(u => u.id))
                          } else {
                            setSelectedUsers([])
                          }
                        }}
                        className="rounded border-gray-300"
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Người dùng
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Vai trò
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Gói dịch vụ
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Trạng thái
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ngày tham gia
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user) => {
                    const displayName = user.full_name || user.email.split('@')[0]
                    const initials = displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
                    
                    return (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="checkbox"
                            checked={selectedUsers.includes(user.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedUsers([...selectedUsers, user.id])
                              } else {
                                setSelectedUsers(selectedUsers.filter(id => id !== user.id))
                              }
                            }}
                            className="rounded border-gray-300"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              {user.avatar_url ? (
                                <img
                                  src={user.avatar_url}
                                  alt={displayName}
                                  className="h-10 w-10 rounded-full object-cover"
                                />
                              ) : (
                                <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center">
                                  <span className="text-sm font-medium text-white">
                                    {initials}
                                  </span>
                                </div>
                              )}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {displayName}
                              </div>
                              <div className="text-sm text-gray-500">{user.email}</div>
                              {user.institution && (
                                <div className="text-xs text-gray-400">{user.institution}</div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <select
                            value={user.role}
                            onChange={(e) => handleRoleChange(user.id, e.target.value as UserRole)}
                            disabled={roleChangeLoading === user.id}
                            className="text-sm border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="user">Người dùng</option>
                            <option value="moderator">Kiểm duyệt viên</option>
                            <option value="admin">Quản trị viên</option>
                            <option value="super_admin">Quản trị viên cấp cao</option>
                          </select>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getSubscriptionBadge(user.subscription_type)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(user)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(user.created_at).toLocaleDateString('vi-VN')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            {user.is_active ? (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleUserAction(user.id, 'suspend')}
                              >
                                Tạm khóa
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleUserAction(user.id, 'activate')}
                              >
                                Kích hoạt
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {totalUsers > 20 && (
            <div className="mt-6 flex items-center justify-between border-t pt-4">
              <div className="text-sm text-gray-500">
                Hiển thị {currentPage * 20 + 1} - {Math.min((currentPage + 1) * 20, totalUsers)} trong tổng số {totalUsers} người dùng
              </div>
              <div className="flex space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                  disabled={currentPage === 0 || loading}
                >
                  Trước
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage >= Math.ceil(totalUsers / 20) - 1 || loading}
                >
                  Sau
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}