/**
 * User Service
 * Manages user CRUD operations, role management, and bulk actions
 * Refactored to use Prisma instead of Supabase
 * Implements requirements: 1.1, 1.2, 3.1, 3.2, 6.2, 6.3, 7.1, 8.1, 8.5
 */

import { prisma } from '@/lib/prisma'
import { UserRole, Permission } from '@/lib/permissions/constants'
import { permissionService } from './permission.service'

/**
 * User profile interface matching database schema
 */
export interface UserProfile {
  id: string
  email: string
  fullName: string | null
  avatarUrl: string | null
  institution: string | null
  orcidId: string | null
  researchDomains: string[] | null
  role: UserRole
  subscriptionType: 'free' | 'premium' | 'institutional'
  status: string | null
  createdAt: string
  updatedAt: string
  lastLoginAt?: string | null
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
  subscriptionType?: 'free' | 'premium' | 'institutional'
  sortBy?: 'createdAt' | 'updatedAt' | 'email' | 'fullName'
  sortOrder?: 'asc' | 'desc'
}

/**
 * Paginated user response
 */
export interface UserListResponse {
  users: UserProfile[]
  total: number
  page: number
  limit: number
  totalPages: number
}

/**
 * Bulk action result
 */
export interface BulkActionResult {
  successCount: number
  failureCount: number
  errors: Array<{ userId: string; error: string }>
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
      subscriptionType,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = filters

    return this.withRetry(async () => {
      // Build where clause
      const where: any = {}

      // Apply search filter
      if (search && search.trim()) {
        where.OR = [
          { email: { contains: search, mode: 'insensitive' } },
          { fullName: { contains: search, mode: 'insensitive' } },
          { institution: { contains: search, mode: 'insensitive' } },
        ]
      }

      // Apply role filter
      if (role) {
        where.role = role
      }

      // Apply status filter
      if (status) {
        where.status = status
      }

      // Apply subscription type filter
      if (subscriptionType) {
        where.subscriptionType = subscriptionType
      }

      // Get total count
      const total = await prisma.user.count({ where })

      // Get users with pagination
      const users = await prisma.user.findMany({
        where,
        skip: page * limit,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        select: {
          id: true,
          email: true,
          fullName: true,
          avatarUrl: true,
          institution: true,
          orcidId: true,
          researchDomains: true,
          role: true,
          subscriptionType: true,
          status: true,
          createdAt: true,
          updatedAt: true,
          lastLoginAt: true,
        },
      })

      return {
        users: users.map(u => ({
          ...u,
          createdAt: u.createdAt.toISOString(),
          updatedAt: u.updatedAt.toISOString(),
          lastLoginAt: u.lastLoginAt?.toISOString() || null,
        })) as UserProfile[],
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
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
      // Fetch user profile
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          fullName: true,
          avatarUrl: true,
          institution: true,
          orcidId: true,
          researchDomains: true,
          role: true,
          subscriptionType: true,
          status: true,
          createdAt: true,
          updatedAt: true,
          lastLoginAt: true,
        },
      })

      if (!user) {
        throw new Error(`User not found: ${userId}`)
      }

      // Fetch user's explicit permissions
      try {
        const permissions = await permissionService.getUserPermissions(userId)
        return {
          ...user,
          createdAt: user.createdAt.toISOString(),
          updatedAt: user.updatedAt.toISOString(),
          lastLoginAt: user.lastLoginAt?.toISOString() || null,
          permissions,
        } as UserProfile & { permissions?: any[] }
      } catch (permError) {
        // Return user without permissions if permission fetch fails
        console.error('Failed to fetch user permissions:', permError)
        return {
          ...user,
          createdAt: user.createdAt.toISOString(),
          updatedAt: user.updatedAt.toISOString(),
          lastLoginAt: user.lastLoginAt?.toISOString() || null,
        } as UserProfile
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
      // Prepare update data (exclude sensitive fields)
      const updateData: any = {}

      if (data.fullName !== undefined) updateData.fullName = data.fullName
      if (data.avatarUrl !== undefined) updateData.avatarUrl = data.avatarUrl
      if (data.institution !== undefined) updateData.institution = data.institution
      if (data.orcidId !== undefined) updateData.orcidId = data.orcidId
      if (data.researchDomains !== undefined) updateData.researchDomains = data.researchDomains
      if (data.role !== undefined) updateData.role = data.role
      if (data.subscriptionType !== undefined) updateData.subscriptionType = data.subscriptionType
      if (data.status !== undefined) updateData.status = data.status

      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: updateData,
        select: {
          id: true,
          email: true,
          fullName: true,
          avatarUrl: true,
          institution: true,
          orcidId: true,
          researchDomains: true,
          role: true,
          subscriptionType: true,
          status: true,
          createdAt: true,
          updatedAt: true,
          lastLoginAt: true,
        },
      })

      // Log action if admin ID provided
      if (adminId) {
        await this.logAdminAction(adminId, 'update_user', userId, {
          updatedFields: Object.keys(data),
        })
      }

      return {
        ...updatedUser,
        createdAt: updatedUser.createdAt.toISOString(),
        updatedAt: updatedUser.updatedAt.toISOString(),
        lastLoginAt: updatedUser.lastLoginAt?.toISOString() || null,
      } as UserProfile
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
      // Get current role for logging
      const currentUser = await prisma.user.findUnique({
        where: { id: userId },
        select: { role: true },
      })

      const oldRole = currentUser?.role || 'user'

      // Update role
      await prisma.user.update({
        where: { id: userId },
        data: { role: newRole },
      })

      // Invalidate permission cache
      permissionService.invalidateCache(userId)

      // Log action
      await this.logAdminAction(adminId, 'update_role', userId, {
        oldRole,
        newRole,
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
      await prisma.user.update({
        where: { id: userId },
        data: {
          status: isActive ? 'active' : 'suspended',
        },
      })

      // Log action
      await this.logAdminAction(adminId, 'toggle_status', userId, {
        isActive,
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
      successCount: 0,
      failureCount: 0,
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
        result.successCount++
      } catch (error) {
        result.failureCount++
        result.errors.push({
          userId,
          error: error instanceof Error ? error.message : 'Unknown error',
        })
      }
    }

    // Log bulk action
    await this.logAdminAction(adminId, `bulk_${action}`, 'multiple', {
      userCount: userIds.length,
      successCount: result.successCount,
      failureCount: result.failureCount,
    })

    return result
  }

  /**
   * Delete user (soft delete by setting status to deleted)
   * 
   * @param userId - User ID to delete
   * @param adminId - ID of admin performing the deletion
   */
  private async deleteUser(userId: string, adminId: string): Promise<void> {
    await prisma.user.update({
      where: { id: userId },
      data: {
        status: 'deleted',
      },
    })

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
    if (data.orcidId) {
      const orcidRegex = /^\d{4}-\d{4}-\d{4}-\d{3}[0-9X]$/
      if (!orcidRegex.test(data.orcidId)) {
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
    if (data.subscriptionType) {
      const validTypes = ['free', 'premium', 'institutional']
      if (!validTypes.includes(data.subscriptionType)) {
        throw new Error(`Invalid subscription type: ${data.subscriptionType}`)
      }
    }
  }

  /**
   * Log admin action (placeholder - implement based on your logging system)
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
      // TODO: Implement admin logging
      // This could write to a separate admin_logs table or use a logging service
      console.log('Admin action:', { adminId, action, targetId, details })
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
