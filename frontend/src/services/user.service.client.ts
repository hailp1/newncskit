/**
 * User Service (Client-Side)
 * Manages user CRUD operations via API routes
 * Refactored to use fetch API instead of Supabase
 * Implements requirements: 1.1, 1.2, 3.1, 3.2, 6.2, 6.3, 7.1, 8.1, 8.5
 */

import { UserRole } from '@/lib/permissions/constants'

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
 * User Service Class (Client-Side)
 * Handles all user-related operations via API routes
 */
export class UserServiceClient {
  private readonly MAX_RETRIES = 3
  private readonly RETRY_DELAY = 1000 // 1 second
  private readonly API_BASE = '/api/users'

  /**
   * Get users with pagination and filtering
   * Requirements: 1.1, 1.4
   */
  async getUsers(filters: UserFilters = {}): Promise<UserListResponse> {
    return this.withRetry(async () => {
      const params = new URLSearchParams()
      
      if (filters.page !== undefined) params.append('page', filters.page.toString())
      if (filters.limit !== undefined) params.append('limit', filters.limit.toString())
      if (filters.search) params.append('search', filters.search)
      if (filters.role) params.append('role', filters.role)
      if (filters.status) params.append('status', filters.status)
      if (filters.subscriptionType) params.append('subscriptionType', filters.subscriptionType)
      if (filters.sortBy) params.append('sortBy', filters.sortBy)
      if (filters.sortOrder) params.append('sortOrder', filters.sortOrder)

      const response = await fetch(`${this.API_BASE}?${params.toString()}`)
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to fetch users')
      }

      return await response.json()
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
      const response = await fetch(`${this.API_BASE}/${userId}`)
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || `Failed to fetch user: ${userId}`)
      }

      return await response.json()
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
      const response = await fetch(`${this.API_BASE}/${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to update user')
      }

      return await response.json()
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
      const response = await fetch(`${this.API_BASE}/${userId}/role`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role: newRole }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to update role')
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
      const response = await fetch(`${this.API_BASE}/${userId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isActive }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to update status')
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

    return this.withRetry(async () => {
      const response = await fetch(`${this.API_BASE}/bulk`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userIds, action }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to perform bulk action')
      }

      return await response.json()
    })
  }

  /**
   * Retry wrapper for API operations
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
          lastError.message.includes('Not authenticated') ||
          lastError.message.includes('Unauthorized')
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
