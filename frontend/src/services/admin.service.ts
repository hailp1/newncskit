/**
 * Admin Service
 * Manages admin operations: users, roles, dashboard stats, logs
 */

import { createClient } from '@/lib/supabase/client'
import { Permission, UserRole } from '@/lib/permissions/constants'
import { permissionService } from './permission.service'

interface GetUsersParams {
  page: number
  limit: number
  search?: string
  role?: UserRole
  status?: string
}

interface DashboardStats {
  users: {
    total: number
    active: number
    byRole: Record<string, number>
  }
  posts: {
    total: number
    published: number
    draft: number
  }
  activities: any[]
  recentUsers: any[]
}

export class AdminService {
  /**
   * Get all users with pagination and filtering
   */
  async getUsers(params: GetUsersParams) {
    const supabase = createClient()
    const { page, limit, search, role, status } = params

    let query = supabase
      .from('profiles')
      .select('*', { count: 'exact' })
      .range(page * limit, (page + 1) * limit - 1)
      .order('created_at', { ascending: false })

    // Apply filters
    if (search) {
      query = query.or(
        `email.ilike.%${search}%,full_name.ilike.%${search}%,first_name.ilike.%${search}%,last_name.ilike.%${search}%`
      )
    }

    if (role) {
      query = query.eq('role', role)
    }

    if (status) {
      query = query.eq('status', status)
    }

    const { data, count, error } = await query

    if (error) {
      throw new Error(`Failed to get users: ${error.message}`)
    }

    return {
      users: data || [],
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit),
    }
  }

  /**
   * Get user by ID
   */
  async getUserById(userId: string) {
    const supabase = createClient()

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) {
      throw new Error(`Failed to get user: ${error.message}`)
    }

    // Get user's explicit permissions
    const permissions = await permissionService.getExplicitPermissions(userId)

    return {
      ...(data as any),
      explicit_permissions: permissions,
    }
  }

  /**
   * Update user profile
   */
  async updateUser(userId: string, data: any, adminId: string): Promise<void> {
    // Check admin has permission
    const hasPermission = await permissionService.hasPermission(
      adminId,
      Permission.EDIT_USERS
    )

    if (!hasPermission) {
      throw new Error('Insufficient permissions to edit users')
    }

    const supabase = createClient()

    const { error } = await (supabase as any)
      .from('profiles')
      .update({
        ...data,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)

    if (error) {
      throw new Error(`Failed to update user: ${error.message}`)
    }

    // Log action
    await this.logAction(adminId, 'update_user', 'user', userId, {
      updated_fields: Object.keys(data),
    })
  }

  /**
   * Update user role
   */
  async updateUserRole(
    userId: string,
    newRole: UserRole,
    adminId: string
  ): Promise<void> {
    // Check admin has permission
    const hasPermission = await permissionService.hasPermission(
      adminId,
      Permission.MANAGE_ROLES
    )

    if (!hasPermission) {
      throw new Error('Insufficient permissions to manage roles')
    }

    const supabase = createClient()

    // Get current role
    const { data: user } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single()

    const oldRole = (user as any)?.role

    // Update role
    const { error } = await (supabase as any)
      .from('profiles')
      .update({
        role: newRole,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)

    if (error) {
      throw new Error(`Failed to update role: ${error.message}`)
    }

    // Invalidate permission cache
    permissionService.invalidateCache(userId)

    // Log action
    await this.logAction(adminId, 'update_role', 'user', userId, {
      old_role: oldRole,
      new_role: newRole,
    })
  }

  /**
   * Update user status (suspend/activate)
   */
  async updateUserStatus(
    userId: string,
    status: string,
    adminId: string
  ): Promise<void> {
    // Check admin has permission
    const hasPermission = await permissionService.hasPermission(
      adminId,
      Permission.SUSPEND_USERS
    )

    if (!hasPermission) {
      throw new Error('Insufficient permissions to suspend users')
    }

    const supabase = createClient()

    const { error } = await (supabase as any)
      .from('profiles')
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)

    if (error) {
      throw new Error(`Failed to update status: ${error.message}`)
    }

    // Log action
    await this.logAction(adminId, 'update_status', 'user', userId, {
      new_status: status,
    })
  }

  /**
   * Get dashboard statistics
   */
  async getDashboardStats(): Promise<DashboardStats> {
    const supabase = createClient()

    // Get user stats
    const { count: totalUsers } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })

    const { count: activeUsers } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active')

    // Get users by role
    const { data: roleData } = await supabase
      .from('profiles')
      .select('role')

    const byRole = (roleData || []).reduce((acc: any, user: any) => {
      acc[user.role] = (acc[user.role] || 0) + 1
      return acc
    }, {})

    // Get post stats
    const { count: totalPosts } = await supabase
      .from('posts')
      .select('*', { count: 'exact', head: true })

    const { count: publishedPosts } = await supabase
      .from('posts')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'published')

    const { count: draftPosts } = await supabase
      .from('posts')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'draft')

    // Get recent activities
    const { data: activities } = await supabase
      .from('admin_logs')
      .select('*, admin:profiles!admin_logs_admin_id_fkey(full_name, email)')
      .order('created_at', { ascending: false })
      .limit(10)

    // Get recent users
    const { data: recentUsers } = await supabase
      .from('profiles')
      .select('id, full_name, email, role, created_at')
      .order('created_at', { ascending: false })
      .limit(5)

    return {
      users: {
        total: totalUsers || 0,
        active: activeUsers || 0,
        byRole,
      },
      posts: {
        total: totalPosts || 0,
        published: publishedPosts || 0,
        draft: draftPosts || 0,
      },
      activities: activities || [],
      recentUsers: recentUsers || [],
    }
  }

  /**
   * Get admin logs with pagination and filtering
   */
  async getAdminLogs(params: {
    page: number
    limit: number
    adminId?: string
    action?: string
    startDate?: string
    endDate?: string
  }) {
    const supabase = createClient()
    const { page, limit, adminId, action, startDate, endDate } = params

    let query = supabase
      .from('admin_logs')
      .select('*, admin:profiles!admin_logs_admin_id_fkey(full_name, email)', {
        count: 'exact',
      })
      .range(page * limit, (page + 1) * limit - 1)
      .order('created_at', { ascending: false })

    // Apply filters
    if (adminId) {
      query = query.eq('admin_id', adminId)
    }

    if (action) {
      query = query.eq('action', action)
    }

    if (startDate) {
      query = query.gte('created_at', startDate)
    }

    if (endDate) {
      query = query.lte('created_at', endDate)
    }

    const { data, count, error } = await query

    if (error) {
      throw new Error(`Failed to get logs: ${error.message}`)
    }

    return {
      logs: data || [],
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit),
    }
  }

  /**
   * Log admin action
   */
  async logAction(
    adminId: string,
    action: string,
    targetType: string,
    targetId: string | number,
    details: any
  ): Promise<void> {
    const supabase = createClient()

    await supabase.from('admin_logs').insert({
      admin_id: adminId,
      action,
      target_type: targetType,
      target_id: typeof targetId === 'string' ? 0 : targetId,
      details,
    } as any)
  }

  /**
   * Count users (helper)
   */
  private async countUsers(filters?: any): Promise<number> {
    const supabase = createClient()
    let query = supabase.from('profiles').select('*', { count: 'exact', head: true })

    if (filters?.status) {
      query = query.eq('status', filters.status)
    }

    const { count } = await query
    return count || 0
  }

  /**
   * Count posts (helper)
   */
  private async countPosts(filters?: any): Promise<number> {
    const supabase = createClient()
    let query = supabase.from('posts').select('*', { count: 'exact', head: true })

    if (filters?.status) {
      query = query.eq('status', filters.status)
    }

    const { count } = await query
    return count || 0
  }
}

// Export singleton instance
export const adminService = new AdminService()
