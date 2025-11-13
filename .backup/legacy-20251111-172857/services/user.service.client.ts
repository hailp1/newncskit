/**
 * User Service (Client-Side)
 * Manages user CRUD operations, role management, and bulk actions for client components
 * Implements requirements: 1.1, 1.2, 3.1, 3.2, 6.2, 6.3, 7.1, 8.1, 8.5
 */

import { createClient } from '@/lib/supabase/client'
import { UserRole, Permission } from '@/lib/permissions/constants'

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
 * User Service Class (Client-Side)
 * Handles all user-related operations with error handling and retry logic
 */
export class UserServiceClient {
  private readonly MAX_RETRIES = 3
  private readonly RETRY_DELAY = 1000 // 1 second
  private supabase = createClient()

  /**
   * Get users with pagination and filtering
   * Requirements: 1.1, 1.4
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
      // Build query with pagination
      let query = this.supabase
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
   * Get user by ID
   * Requirements: 1.1
   */
  async getUserById(userId: string): Promise<UserProfile> {
    if (!userId || !userId.trim()) {
      throw new Error('User ID is required')
    }

    return this.withRetry(async () => {
      const { data: user, error } = await this.supabase
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

      return user as UserProfile
    })
  }

  /**
   * Update user profile data
   * Requirements: 3.1, 3.2, 7.1
   */
  async updateUser(
    userId: string,
    data: Partial<UserProfile>
  ): Promise<UserProfile> {
    if (!userId || !userId.trim()) {
      throw new Error('User ID is required')
    }

    return this.withRetry(async () => {
      // Get current user to check permissions
      const { data: { user: currentUser } } = await this.supabase.auth.getUser()
      
      if (!currentUser) {
        throw new Error('Not authenticated')
      }

      // Prepare update data
      const updateData: any = {
        ...data,
        updated_at: new Date().toISOString(),
      }

      // Remove fields that shouldn't be updated directly
      delete updateData.id
      delete updateData.created_at
      delete updateData.email

      const { data: updatedUser, error } = await (this.supabase
        .from('profiles') as any)
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

      return updatedUser as UserProfile
    })
  }

  /**
   * Update user role
   * Requirements: 6.2, 6.3
   */
  async updateUserRole(
    userId: string,
    newRole: UserRole
  ): Promise<void> {
    if (!userId || !userId.trim()) {
      throw new Error('User ID is required')
    }

    // Validate role
    const validRoles: UserRole[] = ['user', 'moderator', 'admin', 'super_admin']
    if (!validRoles.includes(newRole)) {
      throw new Error(`Invalid role: ${newRole}`)
    }

    return this.withRetry(async () => {
      const { error } = await (this.supabase
        .from('profiles') as any)
        .update({
          role: newRole,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId)

      if (error) {
        throw new Error(`Failed to update role: ${error.message}`)
      }
    })
  }

  /**
   * Toggle user active status
   * Requirements: 6.2, 6.3
   */
  async toggleUserStatus(
    userId: string,
    isActive: boolean
  ): Promise<void> {
    if (!userId || !userId.trim()) {
      throw new Error('User ID is required')
    }

    return this.withRetry(async () => {
      const { error } = await (this.supabase
        .from('profiles') as any)
        .update({
          is_active: isActive,
          status: isActive ? 'active' : 'suspended',
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId)

      if (error) {
        throw new Error(`Failed to update status: ${error.message}`)
      }
    })
  }

  /**
   * Perform bulk actions on multiple users
   * Requirements: 1.1
   */
  async bulkAction(
    userIds: string[],
    action: 'activate' | 'suspend' | 'delete'
  ): Promise<BulkActionResult> {
    if (!userIds || userIds.length === 0) {
      throw new Error('User IDs are required')
    }

    // Validate action
    const validActions = ['activate', 'suspend', 'delete']
    if (!validActions.includes(action)) {
      throw new Error(`Invalid action: ${action}`)
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
          await this.toggleUserStatus(userId, true)
        } else if (action === 'suspend') {
          await this.toggleUserStatus(userId, false)
        } else if (action === 'delete') {
          await this.deleteUser(userId)
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

    return result
  }

  /**
   * Delete user (soft delete)
   */
  private async deleteUser(userId: string): Promise<void> {
    const { error } = await (this.supabase
      .from('profiles') as any)
      .update({
        is_active: false,
        status: 'deleted',
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)

    if (error) {
      throw new Error(`Failed to delete user: ${error.message}`)
    }
  }

  /**
   * Retry wrapper for database operations
   * Requirements: 8.5
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
          lastError.message.includes('required') ||
          lastError.message.includes('Not authenticated')
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
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }
}

// Export singleton instance
export const userServiceClient = new UserServiceClient()
