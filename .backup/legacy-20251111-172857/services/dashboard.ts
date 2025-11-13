// Mock dashboard service for build compatibility
export interface DashboardStats {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  totalOutlines: number;
  recentActivityCount: number;
  weeklyProgress: Array<{ day: string; value: number }>;
  modelUsage: Array<{ model: string; count: number }>;
}

export interface RecentActivity {
  id: string;
  type: string;
  title: string;
  timestamp: string;
  status: string;
}

export class DashboardService {
  async getCurrentUser(): Promise<any> {
    // Mock implementation - replace with actual auth
    return null;
  }

  getEmptyStats(): DashboardStats {
    return {
      totalProjects: 0,
      activeProjects: 0,
      completedProjects: 0,
      totalOutlines: 0,
      recentActivityCount: 0,
      weeklyProgress: [],
      modelUsage: []
    };
  }

  async getDashboardStats(): Promise<DashboardStats> {
    // Mock implementation
    return this.getEmptyStats();
  }

  async getRecentActivity(limit: number = 10): Promise<RecentActivity[]> {
    // Mock implementation
    return [];
  }

  async getProjectProgress(projectId: string): Promise<number> {
    // Mock implementation
    return 0;
  }

  async addActivity(type: string, data: any): Promise<void> {
    // Mock implementation
    console.log('Mock activity added:', { type, data });
  }
}

export const dashboardService = new DashboardService();