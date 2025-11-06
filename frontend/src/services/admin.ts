// Mock admin service for build compatibility
export interface AdminUserUpdate {
  email?: string;
  first_name?: string;
  last_name?: string;
  is_active?: boolean;
  role?: string;
}

export interface AdminUser {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  is_active: boolean;
  role: string;
  created_at: string;
  updated_at: string;
}

export interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  totalProjects: number;
  totalRevenue: number;
}

export class AdminService {
  async getUsers(page: number = 1, limit: number = 20): Promise<{ users: AdminUser[], total: number }> {
    // Mock implementation
    return {
      users: [],
      total: 0
    };
  }

  async getUser(userId: string): Promise<AdminUser | null> {
    // Mock implementation
    return null;
  }

  async updateUser(userId: string, updates: AdminUserUpdate): Promise<void> {
    // Mock implementation
    console.log('Mock user update:', { userId, updates });
  }

  async deleteUser(userId: string): Promise<void> {
    // Mock implementation
    console.log('Mock user delete:', userId);
  }

  async getStats(): Promise<AdminStats> {
    // Mock implementation
    return {
      totalUsers: 0,
      activeUsers: 0,
      totalProjects: 0,
      totalRevenue: 0
    };
  }

  async logAction(action: string, resourceType: string, resourceId: string, details: any): Promise<void> {
    // Mock implementation
    console.log('Mock admin action log:', { action, resourceType, resourceId, details });
  }
}

export const adminService = new AdminService();