/**
 * User Service
 * Manages user CRUD operations, role management, and bulk actions
 * Implements requirements: 1.1, 1.2, 3.1, 3.2, 6.2, 6.3, 7.1, 8.1, 8.5
 */

import { createClient } from '@/lib/supabase/client'
import { UserRole, Permission } from '@/lib/permissions/constants'
import { permissionService } from './permission.service'

/**
 * User profile interface matching database schema
 */
export interface UserProfile {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  institution: string | null
  orcid_id: string | null
  research_domains: string[] | null
  role: UserRole
  subscription_type: 'free' | 'premium' | 'institutional'
  is_active: boolean
  status: string | null
  created_at: string
  updated_at: string
  last_login_at?: string | null
}

/**
 * User filters for querying
 */
export interface UserFilters {
  page?: number
  limit?: number
  search?: string
  role?: UserRole
  status?: string
  subscription_type?: 'free' | 'premium' | 'institutional'
  is_active?: boolean
  sort_by?: 'created_at' | 'updated_at' | 'email' | 'full_name'
  sort_order?: 'asc' | 'desc'
}

/**
 * Paginated user response
 */
export interface UserListResponse {
  users: UserProfile[]
  total: number
  page: number
  limit: number
  total_pages: number
}

/**
 * Bulk action result
 */
export interface BulkActionResult {
  success_count: number
  failure_count: number
  errors: Array<{ user_id: string; error: string }>
}

/**
 * User Service Class
 * Handles all user-related operations with error handling and retry logic
 */
export class UserService {
  private readonly MAX_RETRIES = 3
  private readonly RETRY_DELAY = 1000 // 1 second

  /**
   * Get users with pagination and filtering
   * Requirements: 1.1, 1.4
   * 
   * @param filters - Query filters including pagination, search, role, status
   * @returns Paginated list of users
   */
  async getUsers(filters: UserFilters = {}): Promise<UserListResponse> {
    const {
      page = 0,
      limit = 20,
      search,
      role,
      status,
      subscription_type,
      is_active,
      sort_by = 'created_at',
      sort_order = 'desc',
    } = filters

    return this.withRetry(async () => {
      const supabase = createClient()

      // Build query with pagination
      let query = supabase
        .from('profiles')
        .select('*', { count: 'exact' })
        .range(page * limit, (page + 1) * limit - 1)
        .order(sort_by, { ascending: sort_order === 'asc' })

      // Apply search filter
      if (search && search.trim()) {
        query = query.or(
          `email.ilike.%${search}%,full_name.ilike.%${search}%,institution.ilike.%${search}%`
        )
      }

      // Apply role filter
      if (role) {
        query = query.eq('role', role)
      }

      // Apply status filter
      if (status) {
        query = query.eq('status', status)
      }

      // Apply subscription type filter
      if (subscription_type) {
        query = query.eq('subscription_type', subscription_type)
      }

      // Apply is_active filter
      if (is_active !== undefined) {
        query = query.eq('is_active', is_active)
      }

      const { data, count, error } = await query

      if (error) {
        throw new Error(`Failed to fetch users: ${error.message}`)
      }

      return {
        users: (data || []) as UserProfile[],
        total: count || 0,
        page,
        limit,
        total_pages: Math.ceil((count || 0) / limit),
      }
    })
  }

  /**
   * Get user by ID with related data
   * Requirements: 1.1
   * 
   * @param userId - User ID to fetch
   * @returns User profile with permissions
   */
  async getUserById(userId: string): Promise<UserProfile & { permissions?: any[] }> {
    if (!userId || !userId.trim()) {
      throw new Error('User ID is required')
    }

    return this.withRetry(async () => {
      const supabase = createClient()

      // Fetch user profile
      const { data: user, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          throw new Error(`User not found: ${userId}`)
        }
        throw new Error(`Failed to fetch user: ${error.message}`)
      }

      if (!user) {
        throw new Error(`User not found: ${userId}`)
      }

      // Fetch user's explicit permissions
      try {
        const permissions = await permissionService.getExplicitPermissions(userId)
        return {
          ...(user as UserProfile),
          permissions,
        }
      } catch (permError) {
        // Return user without permissions if permission fetch fails
        console.error('Failed to fetch user permissions:', permError)
        return user as UserProfile
      }
    })
  }

  /**
   * Update user profile data
   * Requirements: 3.1, 3.2, 7.1
   * 
   * @param userId - User ID to update
   * @param data - Partial user data to update
   * @param adminId - ID of admin performing the update (for logging)
   * @returns Updated user profile
   */
  async updateUser(
    userId: string,
    data: Partial<UserProfile>,
    adminId?: string
  ): Promise<UserProfile> {
    if (!userId || !userId.trim()) {
      throw new Error('User ID is required')
    }

    // Validate input data
    this.validateUserData(data)

    return this.withRetry(async () => {
      const supabase = createClient()

      // Prepare update data (exclude sensitive fields)
      const updateData: any = {
        ...data,
        updated_at: new Date().toISOString(),
      }

      // Remove fields that shouldn't be updated directly
      delete updateData.id
      delete updateData.created_at
      delete updateData.email // Email changes should go through auth

      const { data: updatedUser, error } = await (supabase as any)
        .from('profiles')
        .update(updateData)
        .eq('id', userId)
        .select()
        .single()

      if (error) {
        throw new Error(`Failed to update user: ${error.message}`)
      }

      if (!updatedUser) {
        throw new Error(`User not found: ${userId}`)
      }

      // Log action if admin ID provided
      if (adminId) {
        await this.logAdminAction(adminId, 'update_user', userId, {
          updated_fields: Object.keys(data),
        })
      }

      return updatedUser as UserProfile
    })
  }

  /**
   * Update user role
   * Requirements: 6.2, 6.3
   * 
   * @param userId - User ID to update
   * @param newRole - New role to assign
   * @param adminId - ID of admin performing the update
   */
  async updateUserRole(
    userId: string,
    newRole: UserRole,
    adminId: string
  ): Promise<void> {
    if (!userId || !userId.trim()) {
      throw new Error('User ID is required')
    }

    if (!adminId || !adminId.trim()) {
      throw new Error('Admin ID is required')
    }

    // Validate role
    const validRoles: UserRole[] = ['user', 'moderator', 'admin', 'super_admin']
    if (!validRoles.includes(newRole)) {
      throw new Error(`Invalid role: ${newRole}`)
    }

    // Check admin has permission
    const hasPermission = await permissionService.hasPermission(
      adminId,
      Permission.MANAGE_ROLES
    )

    if (!hasPermission) {
      throw new Error('Insufficient permissions to manage roles')
    }

    return this.withRetry(async () => {
      const supabase = createClient()

      // Get current role for logging
      const { data: currentUser } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single()

      const oldRole = (currentUser as any)?.role || 'user'

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
      await this.logAdminAction(adminId, 'update_role', userId, {
        old_role: oldRole,
        new_role: newRole,
      })
    })
  }

  /**
   * Toggle user active status
   * Requirements: 6.2, 6.3
   * 
   * @param userId - User ID to update
   * @param isActive - New active status
   * @param adminId - ID of admin performing the update
   */
  async toggleUserStatus(
    userId: string,
    isActive: boolean,
    adminId: string
  ): Promise<void> {
    if (!userId || !userId.trim()) {
      throw new Error('User ID is required')
    }

    if (!adminId || !adminId.trim()) {
      throw new Error('Admin ID is required')
    }

    // Check admin has permission
    const hasPermission = await permissionService.hasPermission(
      adminId,
      Permission.SUSPEND_USERS
    )

    if (!hasPermission) {
      throw new Error('Insufficient permissions to suspend users')
    }

    return this.withRetry(async () => {
      const supabase = createClient()

      const { error } = await (supabase as any)
        .from('profiles')
        .update({
          is_active: isActive,
          status: isActive ? 'active' : 'suspended',
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId)

      if (error) {
        throw new Error(`Failed to update status: ${error.message}`)
      }

      // Log action
      await this.logAdminAction(adminId, 'toggle_status', userId, {
        is_active: isActive,
        status: isActive ? 'active' : 'suspended',
      })
    })
  }

  /**
   * Perform bulk actions on multiple users
   * Requirements: 1.1
   * 
   * @param userIds - Array of user IDs
   * @param action - Action to perform: 'activate', 'suspend', 'delete'
   * @param adminId - ID of admin performing the action
   * @returns Result with success/failure counts
   */
  async bulkAction(
    userIds: string[],
    action: 'activate' | 'suspend' | 'delete',
    adminId: string
  ): Promise<BulkActionResult> {
    if (!userIds || userIds.length === 0) {
      throw new Error('User IDs are required')
    }

    if (!adminId || !adminId.trim()) {
      throw new Error('Admin ID is required')
    }

    // Validate action
    const validActions = ['activate', 'suspend', 'delete']
    if (!validActions.includes(action)) {
      throw new Error(`Invalid action: ${action}`)
    }

    // Check admin has appropriate permission
    const requiredPermission =
      action === 'delete' ? Permission.DELETE_USERS : Permission.SUSPEND_USERS

    const hasPermission = await permissionService.hasPermission(
      adminId,
      requiredPermission
    )

    if (!hasPermission) {
      throw new Error(`Insufficient permissions to perform ${action}`)
    }

    const result: BulkActionResult = {
      success_count: 0,
      failure_count: 0,
      errors: [],
    }

    // Process each user
    for (const userId of userIds) {
      try {
        if (action === 'activate') {
          await this.toggleUserStatus(userId, true, adminId)
        } else if (action === 'suspend') {
          await this.toggleUserStatus(userId, false, adminId)
        } else if (action === 'delete') {
          await this.deleteUser(userId, adminId)
        }
        result.success_count++
      } catch (error) {
        result.failure_count++
        result.errors.push({
          user_id: userId,
          error: error instanceof Error ? error.message : 'Unknown error',
        })
      }
    }

    // Log bulk action
    await this.logAdminAction(adminId, `bulk_${action}`, 'multiple', {
      user_count: userIds.length,
      success_count: result.success_count,
      failure_count: result.failure_count,
    })

    return result
  }

  /**
   * Delete user (soft delete by setting is_active to false)
   * 
   * @param userId - User ID to delete
   * @param adminId - ID of admin performing the deletion
   */
  private async deleteUser(userId: string, adminId: string): Promise<void> {
    const supabase = createClient()

    const { error } = await (supabase as any)
      .from('profiles')
      .update({
        is_active: false,
        status: 'deleted',
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)

    if (error) {
      throw new Error(`Failed to delete user: ${error.message}`)
    }

    await this.logAdminAction(adminId, 'delete_user', userId, {})
  }

  /**
   * Validate user data before update
   * Requirements: 7.1, 7.2
   * 
   * @param data - User data to validate
   */
  private validateUserData(data: Partial<UserProfile>): void {
    // Validate email format if provided
    if (data.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(data.email)) {
        throw new Error('Invalid email format')
      }
    }

    // Validate ORCID format if provided
    if (data.orcid_id) {
      const orcidRegex = /^\d{4}-\d{4}-\d{4}-\d{3}[0-9X]$/
      if (!orcidRegex.test(data.orcid_id)) {
        throw new Error('Invalid ORCID format. Expected: 0000-0000-0000-000X')
      }
    }

    // Validate institution length
    if (data.institution && data.institution.length > 255) {
      throw new Error('Institution name too long (max 255 characters)')
    }

    // Validate role if provided
    if (data.role) {
      const validRoles: UserRole[] = ['user', 'moderator', 'admin', 'super_admin']
      if (!validRoles.includes(data.role)) {
        throw new Error(`Invalid role: ${data.role}`)
      }
    }

    // Validate subscription type if provided
    if (data.subscription_type) {
      const validTypes = ['free', 'premium', 'institutional']
      if (!validTypes.includes(data.subscription_type)) {
        throw new Error(`Invalid subscription type: ${data.subscription_type}`)
      }
    }
  }

  /**
   * Log admin action to admin_logs table
   * 
   * @param adminId - ID of admin performing the action
   * @param action - Action performed
   * @param targetId - Target user ID or 'multiple'
   * @param details - Additional details
   */
  private async logAdminAction(
    adminId: string,
    action: string,
    targetId: string,
    details: any
  ): Promise<void> {
    try {
      const supabase = createClient()

      await (supabase as any).from('admin_logs').insert({
        admin_id: adminId,
        action,
        target_type: 'user',
        target_id: 0, // Using 0 as placeholder since target_id is integer
        details: {
          ...details,
          target_user_id: targetId,
        },
      })
    } catch (error) {
      // Log error but don't fail the operation
      console.error('Failed to log admin action:', error)
    }
  }

  /**
   * Retry wrapper for database operations
   * Requirements: 8.5
   * 
   * @param operation - Async operation to retry
   * @returns Result of the operation
   */
  private async withRetry<T>(operation: () => Promise<T>): Promise<T> {
    let lastError: Error | null = null

    for (let attempt = 0; attempt < this.MAX_RETRIES; attempt++) {
      try {
        return await operation()
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error')

        // Don't retry on validation errors or permission errors
        if (
          lastError.message.includes('Invalid') ||
          lastError.message.includes('Insufficient permissions') ||
          lastError.message.includes('not found') ||
          lastError.message.includes('required')
        ) {
          throw lastError
        }

        // Wait before retrying (exponential backoff)
        if (attempt < this.MAX_RETRIES - 1) {
          await this.delay(this.RETRY_DELAY * Math.pow(2, attempt))
        }
      }
    }

    throw lastError || new Error('Operation failed after retries')
  }

  /**
   * Delay helper for retry logic
   * 
   * @param ms - Milliseconds to delay
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }
}

// Export singleton instance
export const userService = new UserService()
