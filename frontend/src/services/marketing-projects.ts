// Mock marketing projects service for build compatibility
export interface BusinessDomain {
  id: string;
  name: string;
  description: string;
}

export interface MarketingModel {
  id: string;
  name: string;
  abbreviation: string;
  description: string;
  variables: string[];
}

export interface MarketingProject {
  id: string;
  title: string;
  description: string;
  business_domain_id: string;
  business_domain_name?: string;
  marketing_model_id: string;
  marketing_model_name?: string;
  status: string;
  progress: number;
  word_count?: number;
  reference_count?: number;
  selected_models?: string[];
  selected_model_names?: string[];
  research_outline?: any;
  tags?: string[];
  created_at: string;
  updated_at: string;
}

export class MarketingProjectsService {
  async getBusinessDomains(): Promise<BusinessDomain[]> {
    // Mock implementation
    return [];
  }

  async getMarketingModels(): Promise<MarketingModel[]> {
    // Mock implementation
    return [];
  }

  async createProject(projectData: Partial<MarketingProject>): Promise<MarketingProject> {
    // Mock implementation
    return {
      id: '1',
      title: projectData.title || 'Mock Project',
      description: projectData.description || '',
      business_domain_id: projectData.business_domain_id || '1',
      business_domain_name: 'Mock Domain',
      marketing_model_id: projectData.marketing_model_id || '1',
      marketing_model_name: 'Mock Model',
      status: 'draft',
      progress: 0,
      word_count: 0,
      reference_count: 0,
      selected_models: [],
      selected_model_names: [],
      research_outline: null,
      tags: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  }

  async getProject(id: string): Promise<MarketingProject | null> {
    // Mock implementation
    return null;
  }

  async updateProject(id: string, updates: Partial<MarketingProject>): Promise<MarketingProject> {
    // Mock implementation
    return {
      id,
      title: updates.title || 'Mock Project',
      description: updates.description || '',
      business_domain_id: updates.business_domain_id || '1',
      business_domain_name: 'Mock Domain',
      marketing_model_id: updates.marketing_model_id || '1',
      marketing_model_name: 'Mock Model',
      status: updates.status || 'draft',
      progress: updates.progress || 0,
      word_count: updates.word_count || 0,
      reference_count: updates.reference_count || 0,
      selected_models: updates.selected_models || [],
      selected_model_names: updates.selected_model_names || [],
      research_outline: updates.research_outline || null,
      tags: updates.tags || [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  }

  async deleteProject(id: string): Promise<void> {
    // Mock implementation
    console.log('Mock delete project:', id);
  }

  async getUserProjects(userId: string): Promise<MarketingProject[]> {
    // Mock implementation
    return [];
  }
}

export const marketingProjectsService = new MarketingProjectsService();