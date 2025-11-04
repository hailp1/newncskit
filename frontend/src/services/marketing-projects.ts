import { supabase } from '@/lib/supabase'

export interface MarketingProject {
  id: string
  title: string
  description: string
  business_domain_id: number
  business_domain_name?: string
  selected_models: number[]
  selected_model_names?: string[]
  research_outline: any
  status: string
  progress: number
  owner_id: string
  created_at: string
  updated_at: string
  tags?: string[]
  word_count?: number
  reference_count?: number
}

export interface MarketingProjectCreation {
  title: string
  description: string
  business_domain_id: number
  selected_models: number[]
  research_outline: any
  status?: string
  progress?: number
}

export const marketingProjectsService = {
  // Create new marketing project
  async createProject(userId: string, projectData: MarketingProjectCreation): Promise<MarketingProject> {
    try {
      // Get business domain name
      const { data: domainData } = await supabase
        .from('business_domains')
        .select('name')
        .eq('id', projectData.business_domain_id)
        .single()

      // Get selected model names
      const { data: modelsData } = await supabase
        .from('marketing_models')
        .select('name, category')
        .in('id', projectData.selected_models)

      const { data, error } = await supabase
        .from('projects')
        .insert({
          title: projectData.title,
          description: projectData.description,
          business_domain_id: projectData.business_domain_id,
          selected_models: projectData.selected_models,
          research_outline: JSON.stringify(projectData.research_outline),
          status: projectData.status || 'outline_generated',
          progress: projectData.progress || 60,
          owner_id: userId,
          phase: 'planning', // Default phase for new projects
        })
        .select()
        .single()

      if (error) throw error

      // Add activity log
      await supabase
        .from('activities')
        .insert({
          user_id: userId,
          project_id: data.id,
          activity_type: 'project_created',
          description: `Created marketing project: ${projectData.title}`,
        })

      return {
        ...data,
        business_domain_name: domainData?.name,
        selected_model_names: modelsData?.map(m => m.name) || [],
        research_outline: projectData.research_outline,
        tags: modelsData?.map(m => m.category) || [],
      }
    } catch (error) {
      console.error('Create marketing project error:', error)
      throw error
    }
  },

  // Get all marketing projects for a user
  async getUserProjects(userId: string): Promise<MarketingProject[]> {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select(`
          *,
          business_domains(name)
        `)
        .eq('owner_id', userId)
        .order('updated_at', { ascending: false })

      if (error) throw error

      // Get model names for each project
      const projectsWithModels = await Promise.all(
        data.map(async (project) => {
          if (project.selected_models && project.selected_models.length > 0) {
            const { data: modelsData } = await supabase
              .from('marketing_models')
              .select('name, category')
              .in('id', project.selected_models)

            return {
              ...project,
              business_domain_name: project.business_domains?.name,
              selected_model_names: modelsData?.map(m => m.name) || [],
              research_outline: project.research_outline ? JSON.parse(project.research_outline) : null,
              tags: modelsData?.map(m => m.category) || [],
            }
          }
          return {
            ...project,
            business_domain_name: project.business_domains?.name,
            selected_model_names: [],
            research_outline: project.research_outline ? JSON.parse(project.research_outline) : null,
            tags: [],
          }
        })
      )

      return projectsWithModels
    } catch (error) {
      console.error('Get user marketing projects error:', error)
      throw error
    }
  },

  // Get project by ID
  async getProject(projectId: string): Promise<MarketingProject | null> {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select(`
          *,
          business_domains(name)
        `)
        .eq('id', projectId)
        .single()

      if (error) throw error
      if (!data) return null

      // Get model names
      let selectedModelNames: string[] = []
      let tags: string[] = []
      
      if (data.selected_models && data.selected_models.length > 0) {
        const { data: modelsData } = await supabase
          .from('marketing_models')
          .select('name, category')
          .in('id', data.selected_models)

        selectedModelNames = modelsData?.map(m => m.name) || []
        tags = modelsData?.map(m => m.category) || []
      }

      return {
        ...data,
        business_domain_name: data.business_domains?.name,
        selected_model_names: selectedModelNames,
        research_outline: data.research_outline ? JSON.parse(data.research_outline) : null,
        tags,
      }
    } catch (error) {
      console.error('Get marketing project error:', error)
      throw error
    }
  },

  // Update project
  async updateProject(projectId: string, updates: Partial<MarketingProjectCreation>): Promise<MarketingProject> {
    try {
      const updateData: any = {
        updated_at: new Date().toISOString(),
      }

      if (updates.title) updateData.title = updates.title
      if (updates.description) updateData.description = updates.description
      if (updates.business_domain_id) updateData.business_domain_id = updates.business_domain_id
      if (updates.selected_models) updateData.selected_models = updates.selected_models
      if (updates.research_outline) updateData.research_outline = JSON.stringify(updates.research_outline)
      if (updates.status) updateData.status = updates.status
      if (updates.progress !== undefined) updateData.progress = updates.progress

      const { data, error } = await supabase
        .from('projects')
        .update(updateData)
        .eq('id', projectId)
        .select(`
          *,
          business_domains(name)
        `)
        .single()

      if (error) throw error

      // Get model names
      let selectedModelNames: string[] = []
      let tags: string[] = []
      
      if (data.selected_models && data.selected_models.length > 0) {
        const { data: modelsData } = await supabase
          .from('marketing_models')
          .select('name, category')
          .in('id', data.selected_models)

        selectedModelNames = modelsData?.map(m => m.name) || []
        tags = modelsData?.map(m => m.category) || []
      }

      return {
        ...data,
        business_domain_name: data.business_domains?.name,
        selected_model_names: selectedModelNames,
        research_outline: data.research_outline ? JSON.parse(data.research_outline) : null,
        tags,
      }
    } catch (error) {
      console.error('Update marketing project error:', error)
      throw error
    }
  },

  // Delete project
  async deleteProject(projectId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectId)

      if (error) throw error
    } catch (error) {
      console.error('Delete marketing project error:', error)
      throw error
    }
  },

  // Get business domains
  async getBusinessDomains() {
    try {
      const { data, error } = await supabase
        .from('business_domains')
        .select('*')
        .order('name')

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Get business domains error:', error)
      throw error
    }
  },

  // Get marketing models
  async getMarketingModels() {
    try {
      const { data, error } = await supabase
        .from('marketing_models')
        .select('*')
        .order('name')

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Get marketing models error:', error)
      throw error
    }
  },

  // Get marketing models by domain
  async getModelsByDomain(domainId: number) {
    try {
      const { data, error } = await supabase
        .from('marketing_models')
        .eq('domain_id', domainId)
        .select('*')
        .order('name')

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Get models by domain error:', error)
      throw error
    }
  },

  // Get research variables by model
  async getVariablesByModel(modelId: number) {
    try {
      const { data, error } = await supabase
        .from('research_variables')
        .select('*')
        .eq('model_id', modelId)
        .order('name')

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Get variables by model error:', error)
      throw error
    }
  },

  // Get survey questions by variable
  async getQuestionsByVariable(variableId: number) {
    try {
      const { data, error } = await supabase
        .from('survey_question_templates')
        .select('*')
        .eq('variable_id', variableId)
        .order('id')

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Get questions by variable error:', error)
      throw error
    }
  },

  // Get project statistics
  async getProjectStats(userId: string) {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('status, phase')
        .eq('owner_id', userId)

      if (error) throw error

      const stats = {
        total: data.length,
        planning: data.filter(p => p.phase === 'planning').length,
        execution: data.filter(p => p.phase === 'execution').length,
        writing: data.filter(p => p.phase === 'writing').length,
        submission: data.filter(p => p.phase === 'submission').length,
        completed: data.filter(p => p.status === 'completed').length,
      }

      return stats
    } catch (error) {
      console.error('Get project stats error:', error)
      throw error
    }
  },
}