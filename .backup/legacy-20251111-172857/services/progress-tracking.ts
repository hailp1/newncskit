import { 
  Milestone, 
  MilestoneStatus, 
  MilestoneType, 
  TimelineEvent, 
  ProgressReport,
  ProjectStage 
} from '@/types/workflow';

export interface MilestoneUpdate {
  status?: MilestoneStatus;
  progressPercentage?: number;
  actualHours?: number;
  actualStartDate?: Date;
  actualCompletionDate?: Date;
  notes?: string;
  attachments?: Array<{
    name: string;
    url: string;
    type: string;
    size: number;
  }>;
}

export interface ProgressMetrics {
  overallProgress: number;
  completedMilestones: number;
  totalMilestones: number;
  onTrackMilestones: number;
  delayedMilestones: number;
  blockedMilestones: number;
  estimatedCompletion?: Date;
  timeSpent: number; // in hours
  timeRemaining: number; // in hours
}

export interface MilestoneTemplate {
  name: string;
  description: string;
  type: MilestoneType;
  estimatedHours: number;
  orderIndex: number;
  dependsOn?: string[];
}

class ProgressTrackingService {
  private baseUrl = '/api/progress-tracking';

  /**
   * Get all milestones for a project
   */
  async getProjectMilestones(projectId: string): Promise<Milestone[]> {
    try {
      const response = await fetch(`${this.baseUrl}/projects/${projectId}/milestones`);
      if (!response.ok) {
        throw new Error(`Failed to get milestones: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting project milestones:', error);
      throw error;
    }
  }

  /**
   * Get milestone by ID
   */
  async getMilestone(milestoneId: string): Promise<Milestone> {
    try {
      const response = await fetch(`${this.baseUrl}/milestones/${milestoneId}`);
      if (!response.ok) {
        throw new Error(`Failed to get milestone: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting milestone:', error);
      throw error;
    }
  }

  /**
   * Create a new milestone
   */
  async createMilestone(projectId: string, milestone: Omit<Milestone, 'id' | 'projectId'>): Promise<Milestone> {
    try {
      const response = await fetch(`${this.baseUrl}/projects/${projectId}/milestones`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(milestone),
      });

      if (!response.ok) {
        throw new Error(`Failed to create milestone: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating milestone:', error);
      throw error;
    }
  }

  /**
   * Update milestone
   */
  async updateMilestone(milestoneId: string, updates: MilestoneUpdate): Promise<Milestone> {
    try {
      const response = await fetch(`${this.baseUrl}/milestones/${milestoneId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error(`Failed to update milestone: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating milestone:', error);
      throw error;
    }
  }

  /**
   * Delete milestone
   */
  async deleteMilestone(milestoneId: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/milestones/${milestoneId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`Failed to delete milestone: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error deleting milestone:', error);
      throw error;
    }
  }

  /**
   * Mark milestone as started
   */
  async startMilestone(milestoneId: string, startDate?: Date): Promise<Milestone> {
    const updates: MilestoneUpdate = {
      status: MilestoneStatus.IN_PROGRESS,
      actualStartDate: startDate || new Date(),
      progressPercentage: 0
    };

    return this.updateMilestone(milestoneId, updates);
  }

  /**
   * Mark milestone as completed
   */
  async completeMilestone(
    milestoneId: string, 
    completionData: {
      completionDate?: Date;
      actualHours?: number;
      notes?: string;
      attachments?: Array<{ name: string; url: string; type: string; size: number }>;
    } = {}
  ): Promise<Milestone> {
    const updates: MilestoneUpdate = {
      status: MilestoneStatus.COMPLETED,
      progressPercentage: 100,
      actualCompletionDate: completionData.completionDate || new Date(),
      actualHours: completionData.actualHours,
      notes: completionData.notes,
      attachments: completionData.attachments
    };

    return this.updateMilestone(milestoneId, updates);
  }

  /**
   * Block milestone with reason
   */
  async blockMilestone(milestoneId: string, reason: string): Promise<Milestone> {
    const updates: MilestoneUpdate = {
      status: MilestoneStatus.BLOCKED,
      notes: reason
    };

    return this.updateMilestone(milestoneId, updates);
  }

  /**
   * Update milestone progress
   */
  async updateProgress(
    milestoneId: string, 
    progressPercentage: number, 
    notes?: string,
    hoursWorked?: number
  ): Promise<Milestone> {
    const updates: MilestoneUpdate = {
      progressPercentage: Math.max(0, Math.min(100, progressPercentage)),
      notes,
      actualHours: hoursWorked
    };

    // Auto-complete if progress reaches 100%
    if (progressPercentage >= 100) {
      updates.status = MilestoneStatus.COMPLETED;
      updates.actualCompletionDate = new Date();
    }

    return this.updateMilestone(milestoneId, updates);
  }

  /**
   * Get project timeline events
   */
  async getProjectTimeline(projectId: string, limit?: number): Promise<TimelineEvent[]> {
    try {
      const params = new URLSearchParams();
      if (limit) params.append('limit', limit.toString());

      const response = await fetch(`${this.baseUrl}/projects/${projectId}/timeline?${params}`);
      if (!response.ok) {
        throw new Error(`Failed to get timeline: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting project timeline:', error);
      throw error;
    }
  }

  /**
   * Add timeline event
   */
  async addTimelineEvent(
    projectId: string,
    event: Omit<TimelineEvent, 'id' | 'projectId' | 'timestamp'>
  ): Promise<TimelineEvent> {
    try {
      const response = await fetch(`${this.baseUrl}/projects/${projectId}/timeline`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...event,
          timestamp: new Date()
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to add timeline event: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error adding timeline event:', error);
      throw error;
    }
  }

  /**
   * Calculate project progress metrics
   */
  async getProgressMetrics(projectId: string): Promise<ProgressMetrics> {
    try {
      const response = await fetch(`${this.baseUrl}/projects/${projectId}/metrics`);
      if (!response.ok) {
        throw new Error(`Failed to get progress metrics: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting progress metrics:', error);
      throw error;
    }
  }

  /**
   * Generate progress report
   */
  async generateProgressReport(projectId: string): Promise<ProgressReport> {
    try {
      const response = await fetch(`${this.baseUrl}/projects/${projectId}/report`);
      if (!response.ok) {
        throw new Error(`Failed to generate progress report: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error generating progress report:', error);
      throw error;
    }
  }

  /**
   * Get milestone dependencies
   */
  async getMilestoneDependencies(milestoneId: string): Promise<{
    dependencies: Milestone[];
    dependents: Milestone[];
  }> {
    try {
      const response = await fetch(`${this.baseUrl}/milestones/${milestoneId}/dependencies`);
      if (!response.ok) {
        throw new Error(`Failed to get dependencies: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting milestone dependencies:', error);
      throw error;
    }
  }

  /**
   * Validate milestone dependencies
   */
  async validateDependencies(projectId: string): Promise<{
    isValid: boolean;
    circularDependencies: string[];
    unresolvedDependencies: string[];
  }> {
    try {
      const response = await fetch(`${this.baseUrl}/projects/${projectId}/validate-dependencies`);
      if (!response.ok) {
        throw new Error(`Failed to validate dependencies: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error validating dependencies:', error);
      throw error;
    }
  }

  /**
   * Get available milestone templates
   */
  async getMilestoneTemplates(): Promise<MilestoneTemplate[]> {
    try {
      const response = await fetch(`${this.baseUrl}/templates`);
      if (!response.ok) {
        throw new Error(`Failed to get milestone templates: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting milestone templates:', error);
      throw error;
    }
  }

  /**
   * Create milestones from template
   */
  async createMilestonesFromTemplate(
    projectId: string,
    templateType: 'research' | 'development' | 'publication' | 'custom',
    customTemplates?: MilestoneTemplate[]
  ): Promise<Milestone[]> {
    try {
      const response = await fetch(`${this.baseUrl}/projects/${projectId}/milestones/from-template`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          templateType,
          customTemplates
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to create milestones from template: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating milestones from template:', error);
      throw error;
    }
  }

  /**
   * Reorder milestones
   */
  async reorderMilestones(
    projectId: string,
    milestoneOrders: Array<{ milestoneId: string; orderIndex: number }>
  ): Promise<Milestone[]> {
    try {
      const response = await fetch(`${this.baseUrl}/projects/${projectId}/milestones/reorder`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ milestoneOrders }),
      });

      if (!response.ok) {
        throw new Error(`Failed to reorder milestones: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error reordering milestones:', error);
      throw error;
    }
  }

  /**
   * Get milestone statistics
   */
  async getMilestoneStatistics(projectId: string): Promise<{
    totalMilestones: number;
    completedMilestones: number;
    inProgressMilestones: number;
    blockedMilestones: number;
    overdueMilestones: number;
    averageCompletionTime: number; // in days
    milestonesByType: { [type: string]: number };
    completionRate: number; // percentage
  }> {
    try {
      const response = await fetch(`${this.baseUrl}/projects/${projectId}/statistics`);
      if (!response.ok) {
        throw new Error(`Failed to get milestone statistics: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting milestone statistics:', error);
      throw error;
    }
  }

  /**
   * Export progress data
   */
  async exportProgressData(
    projectId: string,
    format: 'json' | 'csv' | 'excel' = 'json'
  ): Promise<Blob> {
    try {
      const response = await fetch(`${this.baseUrl}/projects/${projectId}/export?format=${format}`);
      if (!response.ok) {
        throw new Error(`Failed to export progress data: ${response.statusText}`);
      }

      return await response.blob();
    } catch (error) {
      console.error('Error exporting progress data:', error);
      throw error;
    }
  }

  /**
   * Get upcoming deadlines
   */
  async getUpcomingDeadlines(
    projectId: string,
    daysAhead: number = 30
  ): Promise<Array<{
    milestone: Milestone;
    daysUntilDeadline: number;
    isOverdue: boolean;
    priority: 'low' | 'medium' | 'high' | 'critical';
  }>> {
    try {
      const response = await fetch(
        `${this.baseUrl}/projects/${projectId}/deadlines?days_ahead=${daysAhead}`
      );
      if (!response.ok) {
        throw new Error(`Failed to get upcoming deadlines: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting upcoming deadlines:', error);
      throw error;
    }
  }

  /**
   * Update project stage based on milestone completion
   */
  async updateProjectStage(projectId: string): Promise<{
    currentStage: ProjectStage;
    nextStage?: ProjectStage;
    stageProgress: number;
  }> {
    try {
      const response = await fetch(`${this.baseUrl}/projects/${projectId}/update-stage`, {
        method: 'PUT',
      });
      if (!response.ok) {
        throw new Error(`Failed to update project stage: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating project stage:', error);
      throw error;
    }
  }

  /**
   * Get milestone recommendations
   */
  async getMilestoneRecommendations(projectId: string): Promise<Array<{
    type: 'add_milestone' | 'update_deadline' | 'resolve_dependency' | 'allocate_resources';
    priority: 'low' | 'medium' | 'high';
    title: string;
    description: string;
    actionData: any;
  }>> {
    try {
      const response = await fetch(`${this.baseUrl}/projects/${projectId}/recommendations`);
      if (!response.ok) {
        throw new Error(`Failed to get recommendations: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting milestone recommendations:', error);
      throw error;
    }
  }

  // Client-side utility methods
  
  /**
   * Calculate milestone completion percentage for a project
   */
  calculateProjectProgress(milestones: Milestone[]): number {
    if (milestones.length === 0) return 0;
    
    const totalProgress = milestones.reduce((sum, milestone) => {
      return sum + milestone.progressPercentage;
    }, 0);
    
    return Math.round(totalProgress / milestones.length);
  }

  /**
   * Get milestones that can be started (dependencies met)
   */
  getAvailableMilestones(milestones: Milestone[]): Milestone[] {
    return milestones.filter(milestone => {
      if (milestone.status !== MilestoneStatus.NOT_STARTED) return false;
      
      // Check if all dependencies are completed
      if (milestone.dependsOn && milestone.dependsOn.length > 0) {
        const dependencies = milestones.filter(m => milestone.dependsOn.includes(m.id));
        return dependencies.every(dep => dep.status === MilestoneStatus.COMPLETED);
      }
      
      return true;
    });
  }

  /**
   * Get critical path milestones
   */
  getCriticalPath(milestones: Milestone[]): Milestone[] {
    // Simplified critical path calculation
    // In a real implementation, this would use proper CPM algorithm
    const sortedMilestones = [...milestones].sort((a, b) => a.orderIndex - b.orderIndex);
    
    return sortedMilestones.filter(milestone => {
      // Consider milestones with dependencies or that are dependencies of others as critical
      const hasDependencies = milestone.dependsOn && milestone.dependsOn.length > 0;
      const isDependency = milestones.some(m => m.dependsOn?.includes(milestone.id));
      
      return hasDependencies || isDependency || milestone.type === MilestoneType.SUBMISSION;
    });
  }

  /**
   * Estimate project completion date
   */
  estimateCompletionDate(milestones: Milestone[]): Date | null {
    const incompleteMilestones = milestones.filter(m => m.status !== MilestoneStatus.COMPLETED);
    if (incompleteMilestones.length === 0) return new Date();
    
    const totalRemainingHours = incompleteMilestones.reduce((sum, milestone) => {
      const remainingHours = milestone.estimatedHours || 0;
      const completedHours = milestone.actualHours || 0;
      return sum + Math.max(0, remainingHours - completedHours);
    }, 0);
    
    // Assume 8 hours per working day, 5 days per week
    const workingDaysNeeded = Math.ceil(totalRemainingHours / 8);
    const calendarDaysNeeded = Math.ceil(workingDaysNeeded * 7 / 5);
    
    const completionDate = new Date();
    completionDate.setDate(completionDate.getDate() + calendarDaysNeeded);
    
    return completionDate;
  }
}

// Create and export a singleton instance
export const progressTrackingService = new ProgressTrackingService();
export default progressTrackingService;