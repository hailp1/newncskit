import { QuestionTemplate, QuestionType } from '@/types/workflow';

export interface QuestionSearchFilters {
  theoreticalModel?: string;
  researchVariable?: string;
  construct?: string;
  type?: QuestionType;
  category?: string;
  tags?: string[];
  reliability?: { min?: number; max?: number };
  isActive?: boolean;
}

export interface QuestionSearchOptions {
  limit?: number;
  offset?: number;
  sortBy?: 'relevance' | 'reliability' | 'created_at' | 'name';
  sortOrder?: 'asc' | 'desc';
}

export interface QuestionSearchResult {
  questions: QuestionTemplate[];
  total: number;
  hasMore: boolean;
}

class QuestionBankService {
  private baseUrl = '/api/question-bank';

  /**
   * Search questions by model and variable
   */
  async searchByModelAndVariable(
    theoreticalModel: string,
    researchVariable: string,
    options?: QuestionSearchOptions
  ): Promise<QuestionSearchResult> {
    try {
      const params = new URLSearchParams({
        theoretical_model: theoreticalModel,
        research_variable: researchVariable,
        ...this.buildQueryParams(options)
      });

      const response = await fetch(`${this.baseUrl}/search?${params}`);
      if (!response.ok) {
        throw new Error(`Failed to search questions: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error searching questions by model and variable:', error);
      throw error;
    }
  }

  /**
   * Get questions by theoretical model
   */
  async getByTheoreticalModel(
    theoreticalModel: string,
    options?: QuestionSearchOptions
  ): Promise<QuestionSearchResult> {
    try {
      const params = new URLSearchParams({
        theoretical_model: theoreticalModel,
        ...this.buildQueryParams(options)
      });

      const response = await fetch(`${this.baseUrl}/by-model?${params}`);
      if (!response.ok) {
        throw new Error(`Failed to get questions by model: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting questions by theoretical model:', error);
      throw error;
    }
  }

  /**
   * Get questions by construct
   */
  async getByConstruct(
    construct: string,
    options?: QuestionSearchOptions
  ): Promise<QuestionSearchResult> {
    try {
      const params = new URLSearchParams({
        construct: construct,
        ...this.buildQueryParams(options)
      });

      const response = await fetch(`${this.baseUrl}/by-construct?${params}`);
      if (!response.ok) {
        throw new Error(`Failed to get questions by construct: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting questions by construct:', error);
      throw error;
    }
  }

  /**
   * Advanced search with multiple filters
   */
  async search(
    filters: QuestionSearchFilters,
    options?: QuestionSearchOptions
  ): Promise<QuestionSearchResult> {
    try {
      const params = new URLSearchParams({
        ...this.buildFilterParams(filters),
        ...this.buildQueryParams(options)
      });

      const response = await fetch(`${this.baseUrl}/search?${params}`);
      if (!response.ok) {
        throw new Error(`Failed to search questions: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error searching questions:', error);
      throw error;
    }
  }

  /**
   * Get question by ID
   */
  async getById(id: string): Promise<QuestionTemplate> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}`);
      if (!response.ok) {
        throw new Error(`Failed to get question: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting question by ID:', error);
      throw error;
    }
  }

  /**
   * Get all available theoretical models
   */
  async getTheoreticalModels(): Promise<string[]> {
    try {
      const response = await fetch(`${this.baseUrl}/models`);
      if (!response.ok) {
        throw new Error(`Failed to get theoretical models: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting theoretical models:', error);
      throw error;
    }
  }

  /**
   * Get research variables for a specific model
   */
  async getResearchVariables(theoreticalModel: string): Promise<string[]> {
    try {
      const response = await fetch(`${this.baseUrl}/models/${encodeURIComponent(theoreticalModel)}/variables`);
      if (!response.ok) {
        throw new Error(`Failed to get research variables: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting research variables:', error);
      throw error;
    }
  }

  /**
   * Get constructs for a specific model and variable
   */
  async getConstructs(theoreticalModel: string, researchVariable?: string): Promise<string[]> {
    try {
      const params = new URLSearchParams({ theoretical_model: theoreticalModel });
      if (researchVariable) {
        params.append('research_variable', researchVariable);
      }

      const response = await fetch(`${this.baseUrl}/constructs?${params}`);
      if (!response.ok) {
        throw new Error(`Failed to get constructs: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting constructs:', error);
      throw error;
    }
  }

  /**
   * Get question categories
   */
  async getCategories(): Promise<string[]> {
    try {
      const response = await fetch(`${this.baseUrl}/categories`);
      if (!response.ok) {
        throw new Error(`Failed to get categories: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting categories:', error);
      throw error;
    }
  }

  /**
   * Get popular tags
   */
  async getTags(limit: number = 50): Promise<string[]> {
    try {
      const response = await fetch(`${this.baseUrl}/tags?limit=${limit}`);
      if (!response.ok) {
        throw new Error(`Failed to get tags: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting tags:', error);
      throw error;
    }
  }

  /**
   * Create a new question template
   */
  async create(question: Omit<QuestionTemplate, 'id' | 'version' | 'isActive'>): Promise<QuestionTemplate> {
    try {
      const response = await fetch(`${this.baseUrl}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(question),
      });

      if (!response.ok) {
        throw new Error(`Failed to create question: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating question:', error);
      throw error;
    }
  }

  /**
   * Update an existing question template
   */
  async update(id: string, updates: Partial<QuestionTemplate>): Promise<QuestionTemplate> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error(`Failed to update question: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating question:', error);
      throw error;
    }
  }

  /**
   * Delete a question template
   */
  async delete(id: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`Failed to delete question: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error deleting question:', error);
      throw error;
    }
  }

  /**
   * Get question statistics
   */
  async getStatistics(): Promise<{
    totalQuestions: number;
    questionsByModel: { [model: string]: number };
    questionsByType: { [type: string]: number };
    averageReliability: number;
  }> {
    try {
      const response = await fetch(`${this.baseUrl}/statistics`);
      if (!response.ok) {
        throw new Error(`Failed to get statistics: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting statistics:', error);
      throw error;
    }
  }

  /**
   * Generate questions for a research design
   */
  async generateForResearchDesign(researchDesign: {
    theoreticalFrameworks: Array<{ name: string; variables: Array<{ name: string; construct: string }> }>;
    projectContext?: string;
  }): Promise<QuestionTemplate[]> {
    try {
      const response = await fetch(`${this.baseUrl}/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(researchDesign),
      });

      if (!response.ok) {
        throw new Error(`Failed to generate questions: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error generating questions:', error);
      throw error;
    }
  }

  /**
   * Validate question template
   */
  async validate(question: Partial<QuestionTemplate>): Promise<{
    isValid: boolean;
    errors: string[];
    warnings: string[];
  }> {
    try {
      const response = await fetch(`${this.baseUrl}/validate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(question),
      });

      if (!response.ok) {
        throw new Error(`Failed to validate question: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error validating question:', error);
      throw error;
    }
  }

  /**
   * Get similar questions
   */
  async getSimilar(questionId: string, limit: number = 5): Promise<QuestionTemplate[]> {
    try {
      const response = await fetch(`${this.baseUrl}/${questionId}/similar?limit=${limit}`);
      if (!response.ok) {
        throw new Error(`Failed to get similar questions: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting similar questions:', error);
      throw error;
    }
  }

  // Private helper methods
  private buildFilterParams(filters: QuestionSearchFilters): Record<string, string> {
    const params: Record<string, string> = {};

    if (filters.theoreticalModel) params.theoretical_model = filters.theoreticalModel;
    if (filters.researchVariable) params.research_variable = filters.researchVariable;
    if (filters.construct) params.construct = filters.construct;
    if (filters.type) params.type = filters.type;
    if (filters.category) params.category = filters.category;
    if (filters.tags && filters.tags.length > 0) params.tags = filters.tags.join(',');
    if (filters.reliability?.min !== undefined) params.reliability_min = filters.reliability.min.toString();
    if (filters.reliability?.max !== undefined) params.reliability_max = filters.reliability.max.toString();
    if (filters.isActive !== undefined) params.is_active = filters.isActive.toString();

    return params;
  }

  private buildQueryParams(options?: QuestionSearchOptions): Record<string, string> {
    const params: Record<string, string> = {};

    if (options?.limit) params.limit = options.limit.toString();
    if (options?.offset) params.offset = options.offset.toString();
    if (options?.sortBy) params.sort_by = options.sortBy;
    if (options?.sortOrder) params.sort_order = options.sortOrder;

    return params;
  }
}

// Create and export a singleton instance
export const questionBankService = new QuestionBankService();
export default questionBankService;