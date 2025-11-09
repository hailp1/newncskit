/**
 * Permission Service
 * Manages user permissions, grants, revokes, and caching
 */

import { createClient } from '@/lib/supabase/client'
import { Permission, UserRole, ROLE_PERMISSIONS } from '@/lib/permissions/constants'
import { getFromCache, setCache, invalidateCache as clearCache } from '@/lib/permissions/cache'

export class PermissionService {
  /**
   * Check if user has a specific permission
   * Uses cache for performance
   */
  async hasPermission(userId: string, permission: Permission): Promise<boolean> {
    // Check cache first
    const cached = getFromCache(userId)
    if (cached) {
      return cached.includes(permission)
    }

    // Get user from database
    const supabase = createClient()
    const { data: user, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single()

    if (error || !user) {
      return false
    }

    // Check role-based permissions
    const rolePermissions = ROLE_PERMISSIONS[(user as any).role as UserRole] || []
    if (rolePermissions.includes(permission)) {
      setCache(userId, rolePermissions)
      return true
    }

    // Check explicit permissions
    const { data: explicitPerms } = await supabase
      .from('permissions')
      .select('permission, expires_at')
      .eq('user_id', userId)

    if (!explicitPerms || explicitPerms.length === 0) {
      setCache(userId, rolePermissions)
      return false
    }

    // Filter out expired permissions
    const validPerms = explicitPerms.filter(
      (p: any) => !p.expires_at || new Date(p.expires_at) > new Date()
    )

    const hasExplicit = validPerms.some((p: any) => p.permission === permission)

    // Cache all permissions (role + explicit)
    const allPerms = [
      ...rolePermissions,
      ...validPerms.map((p: any) => p.permission as Permission),
    ]
    setCache(userId, allPerms)

    return hasExplicit
  }

  /**
   * Grant permission to user
   */
  async grantPermission(
    userId: string,
    permission: Permission,
    grantedBy: string,
    expiresAt?: Date
  ): Promise<void> {
    const supabase = createClient()

    // Insert permission
    const { error } = await supabase.from('permissions').insert({
      user_id: userId,
      permission: permission as string,
      granted_by: grantedBy,
      expires_at: expiresAt?.toISOString() || null,
    } as any)

    if (error) {
      throw new Error(`Failed to grant permission: ${error.message}`)
    }

    // Invalidate cache
    this.invalidateCache(userId)

    // Log action
    await this.logAdminAction(grantedBy, 'grant_permission', {
      user_id: userId,
      permission,
      expires_at: expiresAt?.toISOString(),
    })
  }

  /**
   * Revoke permission from user
   */
  async revokePermission(
    userId: string,
    permission: Permission,
    revokedBy: string
  ): Promise<void> {
    const supabase = createClient()

    // Delete permission
    const { error } = await supabase
      .from('permissions')
      .delete()
      .eq('user_id', userId)
      .eq('permission', permission)

    if (error) {
      throw new Error(`Failed to revoke permission: ${error.message}`)
    }

    // Invalidate cache
    this.invalidateCache(userId)

    // Log action
    await this.logAdminAction(revokedBy, 'revoke_permission', {
      user_id: userId,
      permission,
    })
  }

  /**
   * Get all permissions for a user
   */
  async getUserPermissions(userId: string): Promise<Permission[]> {
    // Check cache first
    const cached = getFromCache(userId)
    if (cached) {
      return cached
    }

    const supabase = createClient()

    // Get user role
    const { data: user } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single()

    if (!user) {
      return []
    }

    // Get role permissions
    const rolePerms = ROLE_PERMISSIONS[(user as any).role as UserRole] || []

    // Get explicit permissions
    const { data: explicitPerms } = await supabase
      .from('permissions')
      .select('permission, expires_at')
      .eq('user_id', userId)

    const validExplicitPerms = (explicitPerms || [])
      .filter((p: any) => !p.expires_at || new Date(p.expires_at) > new Date())
      .map((p: any) => p.permission as Permission)

    // Combine and deduplicate
    const allPerms = Array.from(new Set([...rolePerms, ...validExplicitPerms]))

    // Cache
    setCache(userId, allPerms)

    return allPerms
  }

  /**
   * Get user's explicit permissions (not from role)
   */
  async getExplicitPermissions(userId: string) {
    const supabase = createClient()

    const { data, error } = await supabase
      .from('permissions')
      .select('*, granted_by_user:profiles!permissions_granted_by_fkey(full_name)')
      .eq('user_id', userId)
      .order('granted_at', { ascending: false })

    if (error) {
      throw new Error(`Failed to get permissions: ${error.message}`)
    }

    return data
  }

  /**
   * Get permissions for a specific role
   * Uses cache for performance
   */
  async getRolePermissions(role: UserRole): Promise<Permission[]> {
    // Create cache key for role
    const cacheKey = `role:${role}`
    
    // Check cache first
    const cached = getFromCache(cacheKey)
    if (cached) {
      return cached
    }

    // Get role permissions from constants
    const rolePermissions = ROLE_PERMISSIONS[role]
    
    if (!rolePermissions) {
      throw new Error(`Role not found: ${role}`)
    }

    // Cache the result
    setCache(cacheKey, rolePermissions)

    return rolePermissions
  }

  /**
   * Update permissions for a role
   * Note: This updates the in-memory ROLE_PERMISSIONS mapping
   * For persistent changes, update the constants file
   */
  async updateRolePermissions(
    role: UserRole,
    permissions: Permission[],
    updatedBy: string
  ): Promise<void> {
    // Validate role exists
    if (!ROLE_PERMISSIONS[role]) {
      throw new Error(`Role not found: ${role}`)
    }

    // Validate permissions
    for (const permission of permissions) {
      if (!Object.values(Permission).includes(permission)) {
        throw new Error(`Invalid permission: ${permission}`)
      }
    }

    // Update the role permissions in memory
    ROLE_PERMISSIONS[role] = permissions

    // Invalidate cache for this role
    const cacheKey = `role:${role}`
    clearCache(cacheKey)

    // Invalidate cache for all users with this role
    // This ensures they get updated permissions on next check
    const supabase = createClient()
    const { data: users } = await supabase
      .from('profiles')
      .select('id')
      .eq('role', role)

    if (users) {
      users.forEach((user: any) => {
        this.invalidateCache(user.id)
      })
    }

    // Log the permission change
    await this.logAdminAction(updatedBy, 'update_role_permissions', {
      role,
      permissions,
      permission_count: permissions.length,
    })
  }

  /**
   * Validate permission format and existence
   */
  validatePermission(permission: string): { valid: boolean; error?: string } {
    // Check if permission is empty
    if (!permission || permission.trim() === '') {
      return { valid: false, error: 'Permission cannot be empty' }
    }

    // Check if permission exists in the system
    if (!Object.values(Permission).includes(permission as Permission)) {
      return { valid: false, error: `Permission '${permission}' does not exist in the system` }
    }

    // Check format (should be lowercase with underscores)
    const validFormat = /^[a-z_]+$/.test(permission)
    if (!validFormat) {
      return { valid: false, error: 'Permission must be lowercase with underscores only' }
    }

    return { valid: true }
  }

  /**
   * Check if user already has a permission (prevent duplicates)
   */
  async hasExplicitPermission(userId: string, permission: Permission): Promise<boolean> {
    const supabase = createClient()

    const { data, error } = await supabase
      .from('permissions')
      .select('id')
      .eq('user_id', userId)
      .eq('permission', permission)
      .maybeSingle()

    if (error) {
      throw new Error(`Failed to check permission: ${error.message}`)
    }

    return !!data
  }

  /**
   * Validate and grant permission (with duplicate check)
   */
  async validateAndGrantPermission(
    userId: string,
    permission: Permission,
    grantedBy: string,
    expiresAt?: Date
  ): Promise<{ success: boolean; error?: string }> {
    // Validate permission format
    const validation = this.validatePermission(permission)
    if (!validation.valid) {
      return { success: false, error: validation.error }
    }

    // Check for duplicates
    const hasDuplicate = await this.hasExplicitPermission(userId, permission)
    if (hasDuplicate) {
      return { success: false, error: 'User already has this permission' }
    }

    // Grant the permission
    try {
      await this.grantPermission(userId, permission, grantedBy, expiresAt)
      return { success: true }
    } catch (error) {
      return { success: false, error: (error as Error).message }
    }
  }

  /**
   * Invalidate permission cache for a user
   */
  invalidateCache(userId: string): void {
    clearCache(userId)
  }

  /**
   * Log admin action
   */
  private async logAdminAction(
    adminId: string,
    action: string,
    details: any
  ): Promise<void> {
    const supabase = createClient()

    await supabase.from('admin_logs').insert({
      admin_id: adminId,
      action,
      target_type: 'permission',
      target_id: 0, // Not applicable for permissions
      details,
    } as any)
  }
}

// Export singleton instance
export const permissionService = new PermissionService()
