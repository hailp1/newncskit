// Admin service - Client-side interface that calls API endpoints

export interface AdminStats {
  totalUsers: number;
  totalProjects: number;
  totalPosts: number;
  activeTokens: number;
  recentActivity: any[];
}

export interface AdminUser {
  id: string;
  email: string;
  full_name: string;
  created_at: string;
  updated_at: string;
  token_balance: number;
  account_status: string;
}

class AdminService {
  async getStats(): Promise<AdminStats> {
    try {
      const response = await fetch('/api/admin/stats');
      if (!response.ok) {
        throw new Error('Failed to fetch admin stats');
      }
      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error fetching admin stats:', error);
      // Return mock data for now
      return {
        totalUsers: 0,
        totalProjects: 0,
        totalPosts: 0,
        activeTokens: 0,
        recentActivity: []
      };
    }
  }

  async getUsers(page = 1, limit = 20): Promise<{ users: AdminUser[]; total: number }> {
    try {
      const response = await fetch(`/api/admin/users?page=${page}&limit=${limit}`);
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }
      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error fetching users:', error);
      return { users: [], total: 0 };
    }
  }

  async updateUser(userId: string, updates: Partial<AdminUser>): Promise<void> {
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update user');
      }
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }

  async deleteUser(userId: string): Promise<void> {
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete user');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }

  async addTokensToUser(userId: string, amount: number, description: string): Promise<void> {
    try {
      const response = await fetch(`/api/admin/users/${userId}/tokens`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ amount, description }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to add tokens');
      }
    } catch (error) {
      console.error('Error adding tokens:', error);
      throw error;
    }
  }

  async getFeeConfig(): Promise<any> {
    try {
      const response = await fetch('/api/admin/fee-config');
      if (!response.ok) {
        throw new Error('Failed to fetch fee configuration');
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching fee config:', error);
      // Return default config
      return {
        surveyCampaignFeePercentage: 5,
        minimumFeeAmount: 1,
        maximumFeeAmount: 1000,
        lastUpdated: new Date().toISOString(),
        updatedBy: 'system'
      };
    }
  }

  async updateFeeConfig(config: {
    surveyCampaignFeePercentage: number;
    minimumFeeAmount: number;
    maximumFeeAmount: number;
  }): Promise<any> {
    try {
      const response = await fetch('/api/admin/fee-config', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(config),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update fee configuration');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error updating fee config:', error);
      throw error;
    }
  }

  async getRevenueMetrics(): Promise<any> {
    try {
      const response = await fetch('/api/admin/revenue-metrics');
      if (!response.ok) {
        throw new Error('Failed to fetch revenue metrics');
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching revenue metrics:', error);
      // Return default metrics
      return {
        totalRevenue: 0,
        monthlyRevenue: 0,
        totalCampaigns: 0,
        activeCampaigns: 0,
        averageFeePerCampaign: 0,
        topCampaignsByRevenue: []
      };
    }
  }

  async calculateCampaignFee(
    targetParticipants: number,
    tokenRewardPerParticipant: number,
    feePercentage?: number
  ): Promise<{
    totalTokenCost: number;
    adminFee: number;
    totalCost: number;
    estimatedRevenue: number;
  }> {
    try {
      const response = await fetch('/api/admin/calculate-fee', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          targetParticipants,
          tokenRewardPerParticipant,
          feePercentage,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to calculate campaign fee');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error calculating campaign fee:', error);
      // Fallback calculation
      const totalTokenCost = targetParticipants * tokenRewardPerParticipant;
      const adminFee = Math.ceil(totalTokenCost * ((feePercentage || 5) / 100));
      return {
        totalTokenCost,
        adminFee,
        totalCost: totalTokenCost + adminFee,
        estimatedRevenue: adminFee
      };
    }
  }

  // Add other methods as needed...
}

export const adminService = new AdminService();