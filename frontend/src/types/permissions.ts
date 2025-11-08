/**
 * Permission System Types
 * Defines all permissions and role-based access control mappings
 */

/**
 * All available permissions in the system
 */
export enum Permission {
  // User management
  VIEW_USERS = 'view_users',
  EDIT_USERS = 'edit_users',
  DELETE_USERS = 'delete_users',
  MANAGE_ROLES = 'manage_roles',
  
  // Blog management
  CREATE_POST = 'create_post',
  EDIT_OWN_POST = 'edit_own_post',
  EDIT_ANY_POST = 'edit_any_post',
  DELETE_OWN_POST = 'delete_own_post',
  DELETE_ANY_POST = 'delete_any_post',
  PUBLISH_POST = 'publish_post',
  
  // Admin
  VIEW_ADMIN_LOGS = 'view_admin_logs',
  MANAGE_PERMISSIONS = 'manage_permissions',
  VIEW_ANALYTICS = 'view_analytics',
}

/**
 * User roles in the system
 */
export type Role = 'user' | 'moderator' | 'admin' | 'super_admin';

/**
 * Mapping of roles to their default permissions
 */
export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
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
  ],
  admin: [
    Permission.VIEW_USERS,
    Permission.EDIT_USERS,
    Permission.MANAGE_ROLES,
    Permission.CREATE_POST,
    Permission.EDIT_OWN_POST,
    Permission.EDIT_ANY_POST,
    Permission.DELETE_OWN_POST,
    Permission.DELETE_ANY_POST,
    Permission.PUBLISH_POST,
    Permission.VIEW_ADMIN_LOGS,
    Permission.VIEW_ANALYTICS,
  ],
  super_admin: Object.values(Permission), // All permissions
};

/**
 * User permission record from database
 */
export interface UserPermission {
  id: number;
  user_id: string;
  permission: Permission;
  granted_by: string;
  granted_at: string;
  expires_at: string | null;
}

/**
 * Permission grant request
 */
export interface GrantPermissionInput {
  user_id: string;
  permission: Permission;
  expires_at?: Date;
}

/**
 * Permission revoke request
 */
export interface RevokePermissionInput {
  user_id: string;
  permission: Permission;
}
