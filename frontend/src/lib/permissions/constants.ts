/**
 * Permission System Constants
 * Defines all available permissions and role-based access control
 */

// Permission enum - all available permissions in the system
export enum Permission {
  // User Management
  VIEW_USERS = 'view_users',
  EDIT_USERS = 'edit_users',
  DELETE_USERS = 'delete_users',
  MANAGE_ROLES = 'manage_roles',
  SUSPEND_USERS = 'suspend_users',
  
  // Blog Management
  CREATE_POST = 'create_post',
  EDIT_OWN_POST = 'edit_own_post',
  EDIT_ANY_POST = 'edit_any_post',
  DELETE_OWN_POST = 'delete_own_post',
  DELETE_ANY_POST = 'delete_any_post',
  PUBLISH_POST = 'publish_post',
  SCHEDULE_POST = 'schedule_post',
  
  // Admin
  VIEW_ADMIN_LOGS = 'view_admin_logs',
  MANAGE_PERMISSIONS = 'manage_permissions',
  VIEW_ANALYTICS = 'view_analytics',
  MANAGE_CATEGORIES = 'manage_categories',
  MANAGE_TAGS = 'manage_tags',
  
  // Comments (optional)
  MODERATE_COMMENTS = 'moderate_comments',
  DELETE_COMMENTS = 'delete_comments',
}

// User roles
export type UserRole = 'user' | 'moderator' | 'admin' | 'super_admin'

// Role-based permissions mapping
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  user: [
    Permission.CREATE_POST,
    Permission.EDIT_OWN_POST,
    Permission.DELETE_OWN_POST,
  ],
  
  moderator: [
    Permission.CREATE_POST,
    Permission.EDIT_OWN_POST,
    Permission.EDIT_ANY_POST,
    Permission.DELETE_OWN_POST,
    Permission.PUBLISH_POST,
    Permission.SCHEDULE_POST,
    Permission.MODERATE_COMMENTS,
    Permission.DELETE_COMMENTS,
  ],
  
  admin: [
    Permission.VIEW_USERS,
    Permission.EDIT_USERS,
    Permission.SUSPEND_USERS,
    Permission.MANAGE_ROLES,
    Permission.CREATE_POST,
    Permission.EDIT_OWN_POST,
    Permission.EDIT_ANY_POST,
    Permission.DELETE_OWN_POST,
    Permission.DELETE_ANY_POST,
    Permission.PUBLISH_POST,
    Permission.SCHEDULE_POST,
    Permission.VIEW_ADMIN_LOGS,
    Permission.VIEW_ANALYTICS,
    Permission.MANAGE_CATEGORIES,
    Permission.MANAGE_TAGS,
    Permission.MODERATE_COMMENTS,
    Permission.DELETE_COMMENTS,
  ],
  
  super_admin: Object.values(Permission), // All permissions
}

// Permission categories for UI grouping
export const PERMISSION_CATEGORIES = {
  'User Management': [
    Permission.VIEW_USERS,
    Permission.EDIT_USERS,
    Permission.DELETE_USERS,
    Permission.MANAGE_ROLES,
    Permission.SUSPEND_USERS,
  ],
  'Blog Management': [
    Permission.CREATE_POST,
    Permission.EDIT_OWN_POST,
    Permission.EDIT_ANY_POST,
    Permission.DELETE_OWN_POST,
    Permission.DELETE_ANY_POST,
    Permission.PUBLISH_POST,
    Permission.SCHEDULE_POST,
  ],
  'Administration': [
    Permission.VIEW_ADMIN_LOGS,
    Permission.MANAGE_PERMISSIONS,
    Permission.VIEW_ANALYTICS,
    Permission.MANAGE_CATEGORIES,
    Permission.MANAGE_TAGS,
  ],
  'Moderation': [
    Permission.MODERATE_COMMENTS,
    Permission.DELETE_COMMENTS,
  ],
}

// Permission labels for UI display
export const PERMISSION_LABELS: Record<Permission, string> = {
  [Permission.VIEW_USERS]: 'View Users',
  [Permission.EDIT_USERS]: 'Edit Users',
  [Permission.DELETE_USERS]: 'Delete Users',
  [Permission.MANAGE_ROLES]: 'Manage Roles',
  [Permission.SUSPEND_USERS]: 'Suspend Users',
  [Permission.CREATE_POST]: 'Create Post',
  [Permission.EDIT_OWN_POST]: 'Edit Own Post',
  [Permission.EDIT_ANY_POST]: 'Edit Any Post',
  [Permission.DELETE_OWN_POST]: 'Delete Own Post',
  [Permission.DELETE_ANY_POST]: 'Delete Any Post',
  [Permission.PUBLISH_POST]: 'Publish Post',
  [Permission.SCHEDULE_POST]: 'Schedule Post',
  [Permission.VIEW_ADMIN_LOGS]: 'View Admin Logs',
  [Permission.MANAGE_PERMISSIONS]: 'Manage Permissions',
  [Permission.VIEW_ANALYTICS]: 'View Analytics',
  [Permission.MANAGE_CATEGORIES]: 'Manage Categories',
  [Permission.MANAGE_TAGS]: 'Manage Tags',
  [Permission.MODERATE_COMMENTS]: 'Moderate Comments',
  [Permission.DELETE_COMMENTS]: 'Delete Comments',
}

// Permission descriptions
export const PERMISSION_DESCRIPTIONS: Record<Permission, string> = {
  [Permission.VIEW_USERS]: 'View all users in the system',
  [Permission.EDIT_USERS]: 'Edit user profiles and settings',
  [Permission.DELETE_USERS]: 'Delete user accounts',
  [Permission.MANAGE_ROLES]: 'Assign and modify user roles',
  [Permission.SUSPEND_USERS]: 'Suspend or activate user accounts',
  [Permission.CREATE_POST]: 'Create new blog posts',
  [Permission.EDIT_OWN_POST]: 'Edit your own blog posts',
  [Permission.EDIT_ANY_POST]: 'Edit any blog post',
  [Permission.DELETE_OWN_POST]: 'Delete your own blog posts',
  [Permission.DELETE_ANY_POST]: 'Delete any blog post',
  [Permission.PUBLISH_POST]: 'Publish blog posts',
  [Permission.SCHEDULE_POST]: 'Schedule blog posts for future publication',
  [Permission.VIEW_ADMIN_LOGS]: 'View admin activity logs',
  [Permission.MANAGE_PERMISSIONS]: 'Grant and revoke user permissions',
  [Permission.VIEW_ANALYTICS]: 'View system analytics and statistics',
  [Permission.MANAGE_CATEGORIES]: 'Create and manage blog categories',
  [Permission.MANAGE_TAGS]: 'Create and manage blog tags',
  [Permission.MODERATE_COMMENTS]: 'Approve and moderate comments',
  [Permission.DELETE_COMMENTS]: 'Delete comments',
}

// Helper function to check if a role has a permission
export function roleHasPermission(role: UserRole, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false
}

// Helper function to get all permissions for a role
export function getRolePermissions(role: UserRole): Permission[] {
  return ROLE_PERMISSIONS[role] ?? []
}
