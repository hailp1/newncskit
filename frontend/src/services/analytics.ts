/**
 * Analytics Service for Advanced Data Analysis System
 * Handles analysis projects, execution, and results management
 */

import { apiClient } from './api-client';

export interface AnalysisProject {
  id: string;
  title: string;
  description: string;
  researchProjectId?: string;
  theoreticalFramework: any;
  researchQuestions: string[];
  hypotheses: string[];
  dataSource: 'survey_campaign' | 'external_file' | 'database_query';
  dataConfiguration: any;
  analysisPipeline: any[];
  statisticalMethods: string[];
  status: 'draft' | 'active' | 'completed' | 'archived';
  version: number;
  collaborators: any[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface AnalysisResult {
  id: string;
  projectId: string;
  analysisType: string;
  analysisName: string;
  statisticalOutput: any;
  fitIndices: any;
  parameterEstimates: any;
  statisticalInterpretation: string;
  practicalSignificance: string;
  limitations: string;
  rCode: string;
  status: 'running' | 'completed' | 'failed' | 'cancelled';
  executedAt: string;
  completedAt?: string;
  executionTime?: string;
}

export interface ProjectConfiguration {
  title: string;
  description: string;
  researchProjectId?: string;
  theoreticalFramework?: any;
  researchQuestions?: string[];
  hypotheses?: string[];
  dataSource: string;
  collaborators?: string[];
  templateId?: string;
}

class AnalyticsService {
  private baseUrl = '/api/analytics';

  /**
   * Create new analysis project
   */
  async createProject(config: ProjectConfiguration): Promise<AnalysisProject> {
    const response = await apiClient.post(`${this.baseUrl}/projects/`, config);
    return response.data;
  }

  /**
   * Get user's analysis projects
   */
  async getUserProjects(includeCollaborations: boolean = true): Promise<AnalysisProject[]> {
    const response = await apiClient.get(`${this.baseUrl}/projects/`, {
      params: { include_collaborations: includeCollaborations }
    });
    return response.data;
  }

  /**
   * Get specific analysis project
   */
  async getProject(projectId: string): Promise<AnalysisProject> {
    const response = await apiClient.get(`${this.baseUrl}/projects/${projectId}/`);
    return response.data;
  }

  /**
   * Update analysis project
   */
  async updateProject(projectId: string, updates: Partial<AnalysisProject>): Promise<AnalysisProject> {
    const response = await apiClient.patch(`${this.baseUrl}/projects/${projectId}/`, updates);
    return response.data;
  }

  /**
   * Delete analysis project
   */
  async deleteProject(projectId: string): Promise<void> {
    await apiClient.delete(`${this.baseUrl}/projects/${projectId}/`);
  }

  /**
   * Execute analysis
   */
  async executeAnalysis(
    projectId: string,
    analysisConfig: {
      analysisType: string;
      analysisName: string;
      parameters: any;
      variables: any;
    }
  ): Promise<AnalysisResult> {
    const response = await apiClient.post(
      `${this.baseUrl}/projects/${projectId}/execute/`,
      analysisConfig
    );
    return response.data;
  }

  /**
   * Get analysis results
   */
  async getAnalysisResults(projectId: string): Promise<AnalysisResult[]> {
    const response = await apiClient.get(`${this.baseUrl}/projects/${projectId}/results/`);
    return response.data;
  }

  /**
   * Get specific analysis result
   */
  async getAnalysisResult(projectId: string, resultId: string): Promise<AnalysisResult> {
    const response = await apiClient.get(`${this.baseUrl}/projects/${projectId}/results/${resultId}/`);
    return response.data;
  }

  /**
   * Generate report
   */
  async generateReport(
    projectId: string,
    reportConfig: {
      format: 'pdf' | 'docx' | 'html' | 'latex';
      style: 'apa' | 'mla' | 'chicago' | 'ieee';
      includeMethodology: boolean;
      includeResults: boolean;
      includeDiscussion: boolean;
      includeTables: boolean;
      includeFigures: boolean;
      includeReferences: boolean;
    }
  ): Promise<Blob> {
    const response = await apiClient.post(
      `${this.baseUrl}/projects/${projectId}/generate-report/`,
      reportConfig,
      { responseType: 'blob' }
    );
    return response.data;
  }

  /**
   * Export reproducibility package
   */
  async exportReproducibilityPackage(
    projectId: string,
    includeData: boolean = false
  ): Promise<Blob> {
    const response = await apiClient.post(
      `${this.baseUrl}/projects/${projectId}/export-reproducibility/`,
      { include_data: includeData },
      { responseType: 'blob' }
    );
    return response.data;
  }

  /**
   * Get available analysis templates
   */
  async getAnalysisTemplates(): Promise<any[]> {
    const response = await apiClient.get(`${this.baseUrl}/templates/`);
    return response.data;
  }

  /**
   * Apply template to project
   */
  async applyTemplate(projectId: string, templateId: string): Promise<AnalysisProject> {
    const response = await apiClient.post(
      `${this.baseUrl}/projects/${projectId}/apply-template/`,
      { template_id: templateId }
    );
    return response.data;
  }

  /**
   * Invite collaborator
   */
  async inviteCollaborator(
    projectId: string,
    invitation: {
      userEmail: string;
      role: string;
      permissions: any;
      message?: string;
    }
  ): Promise<any> {
    const response = await apiClient.post(
      `${this.baseUrl}/projects/${projectId}/invite/`,
      invitation
    );
    return response.data;
  }

  /**
   * Get project collaborators
   */
  async getProjectCollaborators(projectId: string): Promise<any[]> {
    const response = await apiClient.get(`${this.baseUrl}/projects/${projectId}/collaborators/`);
    return response.data;
  }

  /**
   * Accept collaboration invitation
   */
  async acceptInvitation(invitationId: string): Promise<any> {
    const response = await apiClient.post(`${this.baseUrl}/invitations/${invitationId}/accept/`);
    return response.data;
  }

  /**
   * Decline collaboration invitation
   */
  async declineInvitation(invitationId: string): Promise<any> {
    const response = await apiClient.post(`${this.baseUrl}/invitations/${invitationId}/decline/`);
    return response.data;
  }

  /**
   * Get project statistics
   */
  async getProjectStatistics(projectId: string): Promise<any> {
    const response = await apiClient.get(`${this.baseUrl}/projects/${projectId}/statistics/`);
    return response.data;
  }

  /**
   * Remove collaborator from project
   */
  async removeCollaborator(projectId: string, collaboratorId: string): Promise<void> {
    await apiClient.delete(`${this.baseUrl}/projects/${projectId}/collaborators/${collaboratorId}/`);
  }

  /**
   * Update collaborator role
   */
  async updateCollaboratorRole(
    projectId: string, 
    collaboratorId: string, 
    role: string
  ): Promise<any> {
    const response = await apiClient.patch(
      `${this.baseUrl}/projects/${projectId}/collaborators/${collaboratorId}/`,
      { role }
    );
    return response.data;
  }

  /**
   * Resend collaboration invitation
   */
  async resendInvitation(invitationId: string): Promise<any> {
    const response = await apiClient.post(`${this.baseUrl}/invitations/${invitationId}/resend/`);
    return response.data;
  }

  /**
   * Cancel collaboration invitation
   */
  async cancelInvitation(invitationId: string): Promise<any> {
    const response = await apiClient.delete(`${this.baseUrl}/invitations/${invitationId}/`);
    return response.data;
  }

  /**
   * Compare project versions
   */
  async compareVersions(
    projectId: string, 
    version1Id: string, 
    version2Id: string
  ): Promise<any> {
    const response = await apiClient.post(
      `${this.baseUrl}/projects/${projectId}/compare-versions/`,
      { version1_id: version1Id, version2_id: version2Id }
    );
    return response.data;
  }

  /**
   * Create project version
   */
  async createProjectVersion(projectId: string, description: string): Promise<AnalysisProject> {
    const response = await apiClient.post(
      `${this.baseUrl}/projects/${projectId}/create-version/`,
      { description }
    );
    return response.data;
  }

  /**
   * Get version history
   */
  async getVersionHistory(projectId: string): Promise<any[]> {
    const response = await apiClient.get(`${this.baseUrl}/projects/${projectId}/versions/`);
    return response.data;
  }

  /**
   * Rollback to version
   */
  async rollbackToVersion(projectId: string, targetVersion: number): Promise<AnalysisProject> {
    const response = await apiClient.post(
      `${this.baseUrl}/projects/${projectId}/rollback/`,
      { target_version: targetVersion }
    );
    return response.data;
  }
}

export const analyticsService = new AnalyticsService();