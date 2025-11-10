/**
 * Auth utility functions
 * Centralized logic for checking user permissions
 */

import { User } from '@/store/auth';

/**
 * Check if user has admin privileges
 * Supports: super_admin, admin, moderator roles
 */
export function isAdmin(user: User | null | undefined): boolean {
  if (!user) return false;
  
  // Check role from database (public.users table)
  if (user.role && ['super_admin', 'admin', 'moderator'].includes(user.role)) {
    return true;
  }
  
  // Fallback: check specific admin emails
  if (user.email === 'admin@ncskit.org' || user.email === 'admin@ncskit.com') {
    return true;
  }
  
  return false;
}

/**
 * Check if user is super admin
 */
export function isSuperAdmin(user: User | null | undefined): boolean {
  if (!user) return false;
  return user.role === 'super_admin';
}

/**
 * Check if user is moderator or higher
 */
export function isModerator(user: User | null | undefined): boolean {
  if (!user) return false;
  return user.role && ['super_admin', 'admin', 'moderator'].includes(user.role);
}

/**
 * Check if user has specific role
 */
export function hasRole(user: User | null | undefined, role: string): boolean {
  if (!user) return false;
  return user.role === role;
}

/**
 * Get user display name
 */
export function getUserDisplayName(user: User | null | undefined): string {
  if (!user) return 'Guest';
  return user.full_name || user.email?.split('@')[0] || 'User';
}

/**
 * Get user initials for avatar
 */
export function getUserInitials(user: User | null | undefined): string {
  if (!user) return '?';
  
  const name = user.full_name || user.email?.split('@')[0] || 'User';
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}
