/**
 * Permission Check Utilities
 * Helper functions for checking permissions
 */

import { Permission, UserRole, roleHasPermission } from './constants'
import { getFromCache, setCache } from './cache'
import { createClient } from '@/lib/supabase/server'

/**
 * Check if user has a specific permission
 * Uses cache for performance
 */
export async function hasPermission(
  userId: string,
  permission: Permission
): Promise<boolean> {
  // Check cache first
  const cached = getFromCache(userId)
  if (cached) {
    return cached.includes(permission)
  }
  
  // Get user from database
  const supabase = await createClient()
  const { data: user, error } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .single()
  
  if (error || !user) {
    return false
  }
  
  // Check role-based permissions
  const userRole = (user as any).role as UserRole
  const rolePermissions = roleHasPermission(userRole, permission)
  if (rolePermissions) {
    // Cache the role permissions
    const allRolePerms = await getRolePermissions(userRole)
    setCache(userId, allRolePerms)
    return true
  }
  
  // Check explicit permissions
  const { data: explicitPerms } = await supabase
    .from('permissions')
    .select('permission, expires_at')
    .eq('user_id', userId)
  
  if (!explicitPerms) {
    return false
  }
  
  // Filter out expired permissions
  const validPerms = (explicitPerms as any[]).filter((p: any) => 
    !p.expires_at || new Date(p.expires_at) > new Date()
  )
  
  const hasExplicit = validPerms.some((p: any) => p.permission === permission)
  
  // Cache all permissions (role + explicit)
  const allPerms = [
    ...await getRolePermissions(userRole),
    ...validPerms.map((p: any) => p.permission as Permission),
  ]
  setCache(userId, allPerms)
  
  return hasExplicit
}

/**
 * Check if user has any of the specified permissions
 */
export async function hasAnyPermission(
  userId: string,
  permissions: Permission[]
): Promise<boolean> {
  for (const permission of permissions) {
    if (await hasPermission(userId, permission)) {
      return true
    }
  }
  return false
}

/**
 * Check if user has all of the specified permissions
 */
export async function hasAllPermissions(
  userId: string,
  permissions: Permission[]
): Promise<boolean> {
  for (const permission of permissions) {
    if (!(await hasPermission(userId, permission))) {
      return false
    }
  }
  return true
}

/**
 * Get all permissions for a user
 */
export async function getUserPermissions(userId: string): Promise<Permission[]> {
  // Check cache first
  const cached = getFromCache(userId)
  if (cached) {
    return cached
  }
  
  const supabase = await createClient()
  
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
  const userRole = (user as any).role as UserRole
  const rolePerms = await getRolePermissions(userRole)
  
  // Get explicit permissions
  const { data: explicitPerms } = await supabase
    .from('permissions')
    .select('permission, expires_at')
    .eq('user_id', userId)
  
  const validExplicitPerms = ((explicitPerms as any[]) || [])
    .filter((p: any) => !p.expires_at || new Date(p.expires_at) > new Date())
    .map((p: any) => p.permission as Permission)
  
  // Combine and deduplicate
  const allPerms = Array.from(new Set([...rolePerms, ...validExplicitPerms]))
  
  // Cache
  setCache(userId, allPerms)
  
  return allPerms
}

/**
 * Get role permissions (helper)
 */
async function getRolePermissions(role: UserRole): Promise<Permission[]> {
  const { ROLE_PERMISSIONS } = await import('./constants')
  return ROLE_PERMISSIONS[role] ?? []
}

/**
 * Check if user is admin (has admin or super_admin role)
 */
export async function isAdmin(userId: string): Promise<boolean> {
  const supabase = await createClient()
  const { data: user } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .single()
  
  if (!user) return false
  
  const userRole = (user as any).role
  return userRole === 'admin' || userRole === 'super_admin'
}

/**
 * Check if user is super admin
 */
export async function isSuperAdmin(userId: string): Promise<boolean> {
  const supabase = await createClient()
  const { data: user } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .single()
  
  if (!user) return false
  
  const userRole = (user as any).role
  return userRole === 'super_admin'
}
