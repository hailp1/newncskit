// Mock permissions service for build compatibility
export interface Permission {
  id: string;
  name: string;
  codename: string;
  description: string;
  category: string;
}

export interface UserPermissions {
  permissions: Permission[];
  roles: string[];
}

export class PermissionsService {
  async getUserPermissions(userId: string): Promise<UserPermissions> {
    // Mock implementation
    return {
      permissions: [],
      roles: []
    };
  }

  async hasPermission(userId: string, permission: string): Promise<boolean> {
    // Mock implementation - allow all for now
    return true;
  }

  async checkPermissions(userId: string, permissions: string[]): Promise<{ [key: string]: boolean }> {
    // Mock implementation - allow all for now
    const result: { [key: string]: boolean } = {};
    permissions.forEach(permission => {
      result[permission] = true;
    });
    return result;
  }

  async getAllPermissions(): Promise<Permission[]> {
    // Mock implementation
    return [];
  }

  async getPermissionsByCategory(category: string): Promise<Permission[]> {
    // Mock implementation
    return [];
  }
}

export const permissionsService = new PermissionsService();