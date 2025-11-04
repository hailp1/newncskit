import { supabase } from '@/lib/supabase'

export interface BusinessDomain {
  id: number
  name: string
  name_vi: string
  description?: string
  description_vi?: string
  icon?: string
  color?: string
  is_active: boolean
}

export interface MarketingModel {
  id: number
  name: string
  name_vi: string
  abbreviation?: string
  description?: string
  description_vi?: string
  category?: string
  complexity_level?: number
  citation?: string
  year_developed?: number
  key_authors?: string[]
  is_active: boolean
  variables?: ResearchVariable[]
}

export interface ResearchVariable {
  id: number
  model_id: number
  name: string
  name_vi: string
  type: 'independent' | 'dependent' | 'mediating' | 'moderating' | 'control'
  description?: string
  description_vi?: string
  measurement_scale?: string
  sample_questions?: string[]
  is_required: boolean
  order_index?: number
}

export interface MarketingProject {
  id: string
  user_id: string
  title: string
  description?: string
  business_domain_id?: number
  business_domain?: BusinessDomain
  status: 'draft' | 'in_progress' | 'completed' | 'published' | 'archived'
  progress: number
  research_type?: 'quantitative' | 'qualitative' | 'mixed_methods'
  target_population?: string
  sample_size?: number
  data_collection_method?: string
  timeline_start?: string
  timeline_end?: string
  budget?: number
  keywords?: string[]
  tags?: string[]
  is_public: boolean
  collaboration_enabled: boolean
  ai_generated: boolean
  outline_generated_at?: string
  created_at: string
  updated_at: string
  selected_models?: MarketingModel[]
  research_outline?: any
  hypotheses?: ResearchHypothesis[]
}

export interface ResearchHypothesis {
  id: string
  project_id: string
  hypothesis_number: string
  statement: string
  statement_vi?: string
  type: 'main' | 'sub' | 'null' | 'alternative'
  from_variable_id?: number
  to_variable_id?: number
  expected_direction?: 'positive' | 'negative' | 'neutral'
  rationale?: string
  is_supported?: boolean
  test_result?: any
}

export interface ProjectCreationData {
  title: string
  description?: string
  business_domain_id?: number
  selected_model_ids: number[]
  research_type?: 'quantitative' | 'qualitative' | 'mixed_methods'
  target_population?: string
  sample_size?: number
  keywords?: string[]
  tags?: string[]
}

export const marketingProjectsService = {
  // Get all business domains
  async getBusinessDomains(): Promise<BusinessDomain[]> {
    try {
      const { data, error } = await supabase
        .from('business_domains')
        .select('*')
        .eq('is_active', true)
        .order('name')

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Get business domains error:', error)
      return []
    }
  },

  // Get all marketing models
  async getMarketingModels(): Promise<MarketingModel[]> {
    try {
      const { data, error } = await supabase
        .from('marketing_models')
        .select(`
          *,
          research_variables(*)
        `)
        .eq('is_active', true)
        .order('name')

      if (error) throw error
      
      return (data || []).map(model => ({
        ...model,
        variables: model.research_variables || []
      }))
    } catch (error) {
      console.error('Get marketing models error:', error)
      return []
    }
  },

  // Get marketing model by ID with variables
  async getMarketingModel(modelId: number): Promise<MarketingModel | null> {
    try {
      const { data, error } = await supabase
        .from('marketing_models')
        .select(`
          *,
          research_variables(*)
        `)
        .eq('id', modelId)
        .eq('is_active', true)
        .single()

      if (error) throw error
      if (!data) return null

      return {
        ...data,
        variables: data.research_variables || []
      }
    } catch (error) {
      console.error('Get marketing model error:', error)
      return null
    }
  },

  // Get research variables by model ID
  async getVariablesByModel(modelId: number): Promise<ResearchVariable[]> {
    try {
      const { data, error } = await supabase
        .from('research_variables')
        .select('*')
        .eq('model_id', modelId)
        .order('order_index', { ascending: true })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Get variables by model error:', error)
      return []
    }
  },

  // Create new marketing project
  async createProject(projectData: ProjectCreationData): Promise<MarketingProject> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      // Create the project
      const { data: project, error: projectError } = await supabase
        .from('projects')
        .insert({
          user_id: user.id,
          title: projectData.title,
          description: projectData.description,
          business_domain_id: projectData.business_domain_id,
          status: 'draft',
          progress: 10,
          research_type: projectData.research_type || 'quantitative',
          target_population: projectData.target_population,
          sample_size: projectData.sample_size,
          keywords: projectData.keywords,
          tags: projectData.tags,
          is_public: false,
          collaboration_enabled: false,
          ai_generated: false
        })
        .select()
        .single()

      if (projectError) throw projectError

      // Add selected models to project_models table
      if (projectData.selected_model_ids.length > 0) {
        const projectModels = projectData.selected_model_ids.map((modelId, index) => ({
          project_id: project.id,
          model_id: modelId,
          is_primary: index === 0 // First model is primary
        }))

        const { error: modelsError } = await supabase
          .from('project_models')
          .insert(projectModels)

        if (modelsError) throw modelsError
      }

      // Log activity
      await supabase
        .from('user_activities')
        .insert({
          user_id: user.id,
          activity_type: 'project_created',
          details: {
            title: project.title,
            description: `Created new research project: ${project.title}`
          },
          resource_id: project.id
        })

      // Return project with related data
      return await this.getProject(project.id) || project
    } catch (error) {
      console.error('Create project error:', error)
      throw error
    }
  },

  // Get project by ID
  async getProject(projectId: string): Promise<MarketingProject | null> {
    try {
      const { data: project, error: projectError } = await supabase
        .from('projects')
        .select(`
          *,
          business_domains(*),
          project_models(
            is_primary,
            marketing_models(*)
          ),
          research_hypotheses(*),
          research_outlines(*)
        `)
        .eq('id', projectId)
        .single()

      if (projectError) throw projectError
      if (!project) return null

      // Get selected models
      const selectedModels = project.project_models?.map((pm: any) => ({
        ...pm.marketing_models,
        is_primary: pm.is_primary
      })) || []

      // Get latest research outline
      const latestOutline = project.research_outlines?.[0]

      return {
        ...project,
        business_domain: project.business_domains,
        selected_models: selectedModels,
        research_outline: latestOutline?.content || null,
        hypotheses: project.research_hypotheses || []
      }
    } catch (error) {
      console.error('Get project error:', error)
      return null
    }
  },

  // Get all projects for current user
  async getUserProjects(): Promise<MarketingProject[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const { data: projects, error } = await supabase
        .from('projects')
        .select(`
          *,
          business_domains(*),
          project_models(
            is_primary,
            marketing_models(name, name_vi, abbreviation)
          )
        `)
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false })

      if (error) throw error

      return (projects || []).map(project => ({
        ...project,
        business_domain: project.business_domains,
        selected_models: project.project_models?.map((pm: any) => ({
          ...pm.marketing_models,
          is_primary: pm.is_primary
        })) || []
      }))
    } catch (error) {
      console.error('Get user projects error:', error)
      return []
    }
  },

  // Update project
  async updateProject(projectId: string, updates: Partial<ProjectCreationData & { status?: string; progress?: number }>): Promise<MarketingProject | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      // Update project
      const { data: project, error: projectError } = await supabase
        .from('projects')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', projectId)
        .eq('user_id', user.id)
        .select()
        .single()

      if (projectError) throw projectError

      // Update project models if selected_model_ids provided
      if (updates.selected_model_ids) {
        // Delete existing models
        await supabase
          .from('project_models')
          .delete()
          .eq('project_id', projectId)

        // Add new models
        if (updates.selected_model_ids.length > 0) {
          const projectModels = updates.selected_model_ids.map((modelId, index) => ({
            project_id: projectId,
            model_id: modelId,
            is_primary: index === 0
          }))

          await supabase
            .from('project_models')
            .insert(projectModels)
        }
      }

      // Log activity
      await supabase
        .from('user_activities')
        .insert({
          user_id: user.id,
          activity_type: 'project_updated',
          details: {
            title: project.title,
            description: `Updated project: ${project.title}`
          },
          resource_id: projectId
        })

      return await this.getProject(projectId)
    } catch (error) {
      console.error('Update project error:', error)
      throw error
    }
  },

  // Delete project
  async deleteProject(projectId: string): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectId)
        .eq('user_id', user.id)

      if (error) throw error

      // Log activity
      await supabase
        .from('user_activities')
        .insert({
          user_id: user.id,
          activity_type: 'project_deleted',
          details: {
            description: `Deleted project: ${projectId}`
          },
          resource_id: projectId
        })
    } catch (error) {
      console.error('Delete project error:', error)
      throw error
    }
  },

  // Generate research outline using AI
  async generateResearchOutline(projectId: string, templateId?: number): Promise<any> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      // Get project with models
      const project = await this.getProject(projectId)
      if (!project) throw new Error('Project not found')

      // This would integrate with your AI service (Gemini)
      // For now, return a placeholder structure
      const outlineContent = {
        title: project.title,
        abstract: "Research abstract will be generated here...",
        chapters: [
          {
            title: "Introduction",
            title_vi: "Giới thiệu",
            sections: ["Background", "Problem Statement", "Objectives", "Significance"]
          },
          {
            title: "Literature Review",
            title_vi: "Tổng quan tài liệu",
            sections: ["Theoretical Foundation", "Previous Studies", "Research Gap"]
          },
          {
            title: "Methodology",
            title_vi: "Phương pháp nghiên cứu",
            sections: ["Research Design", "Sample", "Data Collection", "Analysis"]
          }
        ],
        models_used: project.selected_models?.map(m => m.name) || [],
        variables: [],
        hypotheses: []
      }

      // Save outline to database
      const { data: outline, error: outlineError } = await supabase
        .from('research_outlines')
        .insert({
          project_id: projectId,
          template_id: templateId,
          title: project.title,
          content: outlineContent,
          generated_by: 'ai',
          generation_prompt: `Generate research outline for: ${project.title}`,
          tokens_used: 1000, // Placeholder
          generation_time_ms: 2000, // Placeholder
          quality_score: 4.5,
          version: 1,
          is_current: true
        })
        .select()
        .single()

      if (outlineError) throw outlineError

      // Update project status
      await supabase
        .from('projects')
        .update({
          status: 'in_progress',
          progress: 60,
          outline_generated_at: new Date().toISOString(),
          ai_generated: true
        })
        .eq('id', projectId)

      // Log activity
      await supabase
        .from('user_activities')
        .insert({
          user_id: user.id,
          activity_type: 'outline_generated',
          details: {
            title: project.title,
            description: `Generated AI research outline for: ${project.title}`
          },
          resource_id: projectId
        })

      return outline.content
    } catch (error) {
      console.error('Generate research outline error:', error)
      throw error
    }
  },

  // Get research outline templates
  async getResearchTemplates(modelId?: number, businessDomainId?: number): Promise<any[]> {
    try {
      let query = supabase
        .from('research_outline_templates')
        .select('*')
        .eq('is_active', true)

      if (modelId) {
        query = query.eq('model_id', modelId)
      }

      if (businessDomainId) {
        query = query.eq('business_domain_id', businessDomainId)
      }

      const { data, error } = await query.order('usage_count', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Get research templates error:', error)
      return []
    }
  },

  // Get project statistics
  async getProjectStats(): Promise<any> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const { data: projects, error } = await supabase
        .from('projects')
        .select('status, progress, created_at')
        .eq('user_id', user.id)

      if (error) throw error

      const stats = {
        total: projects.length,
        draft: projects.filter(p => p.status === 'draft').length,
        in_progress: projects.filter(p => p.status === 'in_progress').length,
        completed: projects.filter(p => p.status === 'completed').length,
        published: projects.filter(p => p.status === 'published').length,
        avg_progress: projects.reduce((sum, p) => sum + (p.progress || 0), 0) / projects.length || 0
      }

      return stats
    } catch (error) {
      console.error('Get project stats error:', error)
      return {
        total: 0,
        draft: 0,
        in_progress: 0,
        completed: 0,
        published: 0,
        avg_progress: 0
      }
    }
  }
}