// Mock projects service for build compatibility
export interface ServiceProject {
  id: string;
  title: string;
  description: string;
  status: string;
  phase?: any;
  progress: number;
  user_id: number;
  created_at: string;
  updated_at: string;
}

export interface ProjectSummary {
  id: string;
  title: string;
  phase: any;
  progress: number;
  lastActivity: Date;
  collaboratorCount: number;
}

export class ProjectsService {
  async getUserProjects(userId: string): Promise<ProjectSummary[]> {
    // Mock implementation
    return [];
  }

  async getProject(projectId: string): Promise<ServiceProject | null> {
    // Mock implementation
    return null;
  }

  async createProject(userId: string, projectData: Partial<ServiceProject>): Promise<ServiceProject> {
    // Mock implementation
    return {
      id: '1',
      title: projectData.title || 'Mock Project',
      description: projectData.description || '',
      status: 'draft',
      phase: 'planning',
      progress: 0,
      user_id: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  }

  async updateProject(projectId: string, updates: Partial<ServiceProject>): Promise<ServiceProject> {
    // Mock implementation
    return {
      id: projectId,
      title: updates.title || 'Mock Project',
      description: updates.description || '',
      status: updates.status || 'draft',
      phase: updates.phase || 'planning',
      progress: updates.progress || 0,
      user_id: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  }

  async deleteProject(projectId: string): Promise<void> {
    // Mock implementation
    console.log('Mock delete project:', projectId);
  }

  async getProjectStats(projectId: string): Promise<any> {
    // Mock implementation
    return {
      totalTasks: 0,
      completedTasks: 0,
      progress: 0
    };
  }

  async addActivity(userId: string, projectId: string, type: string, description: string): Promise<void> {
    // Mock implementation
    console.log('Mock activity added:', { userId, projectId, type, description });
  }
}

export const projectsService = new ProjectsService();