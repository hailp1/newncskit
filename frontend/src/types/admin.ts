/**
 * Admin System Types
 * Defines types for user management, admin logs, and dashboard statistics
 */

import { Role, Permission } from './permissions';

/**
 * User profile with admin fields
 */
export interface User {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  role: Role;
  status: 'active' | 'inactive' | 'suspended' | 'banned';
  created_at: string;
  updated_at: string;
  last_login_at: string | null;
  
  // Optional fields for detailed views
  permissions?: Permission[];
  bio?: string | null;
  location?: string | null;
  website?: string | null;
}

/**
 * Admin action log entry
 */
export interface AdminLog {
  id: number;
  admin_id: string;
  admin: {
    id: string;
    full_name: string | null;
    email: string;
    avatar_url: string | null;
  };
  action: string;
  target_type: string;
  target_id: number | null;
  details: Record<string, any>;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

/**
 * Dashboard statistics
 */
export interface DashboardStats {
  users: {
    total: number;
    active: number;
    inactive: number;
    suspended: number;
    banned: number;
    new_this_month: number;
  };
  posts: {
    total: number;
    published: number;
    draft: number;
    scheduled: number;
    archived: number;
  };
  activities: AdminLog[];
  analytics?: {
    daily_active_users: number;
    monthly_active_users: number;
    total_views: number;
    total_likes: number;
  };
}

/**
 * User list query parameters
 */
export interface GetUsersParams {
  page: number;
  limit: number;
  search?: string;
  role?: Role;
  status?: 'active' | 'inactive' | 'suspended' | 'banned';
  sort_by?: 'created_at' | 'last_login_at' | 'email' | 'full_name';
  sort_order?: 'asc' | 'desc';
}

/**
 * User list response
 */
export interface GetUsersResponse {
  users: User[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

/**
 * Update user input
 */
export interface UpdateUserInput {
  full_name?: string;
  bio?: string;
  location?: string;
  website?: string;
  avatar_url?: string;
}

/**
 * Update user role input
 */
export interface UpdateUserRoleInput {
  role: Role;
}

/**
 * Update user status input
 */
export interface UpdateUserStatusInput {
  status: 'active' | 'inactive' | 'suspended' | 'banned';
  reason?: string;
}

/**
 * Admin logs query parameters
 */
export interface GetAdminLogsParams {
  page: number;
  limit: number;
  admin_id?: string;
  action?: string;
  target_type?: string;
  start_date?: string;
  end_date?: string;
}

/**
 * Admin logs response
 */
export interface GetAdminLogsResponse {
  logs: AdminLog[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

/**
 * Log admin action input
 */
export interface LogAdminActionInput {
  action: string;
  target_type: string;
  target_id?: number;
  details?: Record<string, any>;
}
