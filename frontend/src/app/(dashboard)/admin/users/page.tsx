'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  UsersIcon, 
  MagnifyingGlassIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  UserPlusIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'

interface User {
  id: string
  email: string
  first_name: string
  last_name: string
  institution?: string
  subscription_type: string
  is_active: boolean
  is_staff: boolean
  date_joined: string
  last_login?: string
}

interface UserFilters {
  search: string
  subscription_type: string
  is_active: string
  is_staff: string
}

export default function UserManagementPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [filters, setFilters] = useState<UserFilters>({
    search: '',
    subscription_type: '',
    is_active: '',
    is_staff: ''
  })
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [bulkActionLoading, setBulkActionLoading] = useState(false)

  useEffect(() => {
    fetchUsers()
  }, [filters])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      
      if (filters.search) params.append('search', filters.search)
      if (filters.subscription_type) params.append('subscription_type', filters.subscription_type)
      if (filters.is_active) params.append('is_active', filters.is_active)
      if (filters.is_staff) params.append('is_staff', filters.is_staff)

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001'
      const response = await fetch(`${apiUrl}/api/admin/users/?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setUsers(data.results || [])
      } else {
        console.error('Failed to fetch users')
      }
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleBulkAction = async (action: string) => {
    if (selectedUsers.length === 0) {
      alert('Please select users first')
      return
    }

    const confirmMessage = `Are you sure you want to ${action} ${selectedUsers.length} user(s)?`
    if (!confirm(confirmMessage)) return

    try {
      setBulkActionLoading(true)
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001'
      const response = await fetch(`${apiUrl}/api/admin/users/bulk_action/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        },
        body: JSON.stringify({
          user_ids: selectedUsers,
          action: action
        })
      })

      if (response.ok) {
        const result = await response.json()
        alert(`Successfully ${action}ed ${result.success_count} users`)
        setSelectedUsers([])
        fetchUsers()
      } else {
        alert('Failed to perform bulk action')
      }
    } catch (error) {
      console.error('Error performing bulk action:', error)
      alert('Error performing bulk action')
    } finally {
      setBulkActionLoading(false)
    }
  }

  const handleUserAction = async (userId: string, action: string) => {
    const user = users.find(u => u.id === userId)
    if (!user) return

    const confirmMessage = `Are you sure you want to ${action} user ${user.email}?`
    if (!confirm(confirmMessage)) return

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001'
      const response = await fetch(`${apiUrl}/api/admin/users/${userId}/${action}/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      })

      if (response.ok) {
        alert(`Successfully ${action}ed user ${user.email}`)
        fetchUsers()
      } else {
        alert(`Failed to ${action} user`)
      }
    } catch (error) {
      console.error(`Error ${action}ing user:`, error)
      alert(`Error ${action}ing user`)
    }
  }

  const exportUsers = async () => {
    try {
      const params = new URLSearchParams()
      if (filters.subscription_type) params.append('subscription_type', filters.subscription_type)
      if (filters.is_active) params.append('is_active', filters.is_active)

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001'
      const response = await fetch(`${apiUrl}/api/admin/users/export_csv/?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `users_export_${new Date().toISOString().split('T')[0]}.csv`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      } else {
        alert('Failed to export users')
      }
    } catch (error) {
      console.error('Error exporting users:', error)
      alert('Error exporting users')
    }
  }

  const getStatusBadge = (user: User) => {
    if (!user.is_active) {
      return <Badge variant="destructive">Suspended</Badge>
    }
    if (user.is_staff) {
      return <Badge variant="default">Admin</Badge>
    }
    return <Badge variant="secondary">Active</Badge>
  }

  const getSubscriptionBadge = (type: string) => {
    const colors = {
      free: 'bg-gray-100 text-gray-800',
      premium: 'bg-blue-100 text-blue-800',
      institutional: 'bg-purple-100 text-purple-800'
    }
    return (
      <Badge className={colors[type as keyof typeof colors] || colors.free}>
        {type.charAt(0).toUpperCase() + type.slice(1)}
      </Badge>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600">Manage user accounts, roles, and permissions</p>
        </div>
        <div className="flex space-x-3">
          <Button onClick={exportUsers} variant="outline">
            Export CSV
          </Button>
          <Button onClick={() => setShowCreateModal(true)}>
            <UserPlusIcon className="w-4 h-4 mr-2" />
            Add User
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by name or email..."
                  value={filters.search}
                  onChange={(e) => setFilters({...filters, search: e.target.value})}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Subscription</label>
              <select
                value={filters.subscription_type}
                onChange={(e) => setFilters({...filters, subscription_type: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Subscriptions</option>
                <option value="free">Free</option>
                <option value="premium">Premium</option>
                <option value="institutional">Institutional</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={filters.is_active}
                onChange={(e) => setFilters({...filters, is_active: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Status</option>
                <option value="true">Active</option>
                <option value="false">Suspended</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
              <select
                value={filters.is_staff}
                onChange={(e) => setFilters({...filters, is_staff: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Roles</option>
                <option value="true">Admin</option>
                <option value="false">User</option>
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
                  {selectedUsers.length} user(s) selected
                </span>
              </div>
              <div className="flex space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleBulkAction('activate')}
                  disabled={bulkActionLoading}
                >
                  Activate
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleBulkAction('suspend')}
                  disabled={bulkActionLoading}
                >
                  Suspend
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleBulkAction('delete')}
                  disabled={bulkActionLoading}
                >
                  Delete
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <UsersIcon className="h-5 w-5 mr-2" />
            Users ({users.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-8">
              <UsersIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No users found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <input
                        type="checkbox"
                        checked={selectedUsers.length === users.length}
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
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Subscription
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Joined
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Last Login
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user) => (
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
                            <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                              <span className="text-sm font-medium text-gray-700">
                                {user.first_name.charAt(0)}{user.last_name.charAt(0)}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {user.first_name} {user.last_name}
                            </div>
                            <div className="text-sm text-gray-500">{user.email}</div>
                            {user.institution && (
                              <div className="text-xs text-gray-400">{user.institution}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getSubscriptionBadge(user.subscription_type)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(user)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(user.date_joined).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.last_login ? new Date(user.last_login).toLocaleDateString() : 'Never'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {/* View user details */}}
                          >
                            <EyeIcon className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {/* Edit user */}}
                          >
                            <PencilIcon className="h-4 w-4" />
                          </Button>
                          {user.is_active ? (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleUserAction(user.id, 'suspend')}
                            >
                              Suspend
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleUserAction(user.id, 'activate')}
                            >
                              Activate
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}