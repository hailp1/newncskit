import { supabase } from '@/lib/supabase'
import type { Project, ProjectCreation, ProjectSummary } from '@/types'
import type { Database } from '@/types/database'

type DbProject = Database['public']['Tables']['projects']['Row']

// Convert database project to app project format
function dbProjectToAppProject(dbProject: DbProject): Project {
  return {
    id: dbProject.id,
    title: dbProject.title,
    description: dbProject.description,
    phase: dbProject.phase,
    status: dbProject.status,
    timeline: {
      startDate: dbProject.start_date ? new Date(dbProject.start_date) : new Date(),
      endDate: dbProject.end_date ? new Date(dbProject.end_date) : undefined,
      milestones: [], // Will be loaded separately
    },
    collaborators: [], // Will be loaded separately
    documents: [], // Will be loaded separately
    references: [], // Will be loaded separately
    createdAt: new Date(dbProject.created_at),
    updatedAt: new Date(dbProject.updated_at),
  }
}

export const projectsService = {
  // Get all projects for a user
  async getUserProjects(userId: string): Promise<ProjectSummary[]> {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select(`
          *,
          project_collaborators!inner(user_id, role)
        `)
        .or(`owner_id.eq.${userId},project_collaborators.user_id.eq.${userId}`)
        .order('updated_at', { ascending: false })

      if (error) throw error

      return data.map(project => ({
        id: project.id,
        title: project.title,
        phase: project.phase,
        progress: project.progress,
        lastActivity: new Date(project.updated_at),
        collaboratorCount: project.project_collaborators?.length || 0,
      }))
    } catch (error) {
      console.error('Get user projects error:', error)
      throw error
    }
  },

  // Get project by ID
  async getProject(projectId: string): Promise<Project | null> {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .single()

      if (error) throw error
      if (!data) return null

      return dbProjectToAppProject(data)
    } catch (error) {
      console.error('Get project error:', error)
      throw error
    }
  },

  // Create new project
  async createProject(userId: string, projectData: ProjectCreation): Promise<Project> {
    try {
      const { data, error } = await supabase
        .from('projects')
        .insert({
          title: projectData.title,
          description: projectData.description,
          phase: projectData.phase,
          owner_id: userId,
          start_date: projectData.timeline?.startDate?.toISOString().split('T')[0],
          end_date: projectData.timeline?.endDate?.toISOString().split('T')[0],
        })
        .select()
        .single()

      if (error) throw error

      // Add owner as collaborator
      await supabase
        .from('project_collaborators')
        .insert({
          project_id: data.id,
          user_id: userId,
          role: 'owner',
          joined_at: new Date().toISOString(),
        })

      return dbProjectToAppProject(data)
    } catch (error) {
      console.error('Create project error:', error)
      throw error
    }
  },

  // Update project
  async updateProject(projectId: string, updates: Partial<Project>): Promise<Project> {
    try {
      const { data, error } = await supabase
        .from('projects')
        .update({
          title: updates.title,
          description: updates.description,
          phase: updates.phase,
          status: updates.status,
          progress: updates.timeline?.milestones ? 
            Math.round((updates.timeline.milestones.filter(m => m.completed).length / updates.timeline.milestones.length) * 100) : 
            undefined,
          start_date: updates.timeline?.startDate?.toISOString().split('T')[0],
          end_date: updates.timeline?.endDate?.toISOString().split('T')[0],
        })
        .eq('id', projectId)
        .select()
        .single()

      if (error) throw error
      return dbProjectToAppProject(data)
    } catch (error) {
      console.error('Update project error:', error)
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
      console.error('Delete project error:', error)
      throw error
    }
  },

  // Add collaborator to project
  async addCollaborator(projectId: string, userId: string, role: 'editor' | 'viewer' = 'viewer'): Promise<void> {
    try {
      const { error } = await supabase
        .from('project_collaborators')
        .insert({
          project_id: projectId,
          user_id: userId,
          role,
          joined_at: new Date().toISOString(),
        })

      if (error) throw error
    } catch (error) {
      console.error('Add collaborator error:', error)
      throw error
    }
  },

  // Get project collaborators
  async getProjectCollaborators(projectId: string) {
    try {
      const { data, error } = await supabase
        .from('project_collaborators')
        .select(`
          *,
          users(id, email, first_name, last_name, avatar_url)
        `)
        .eq('project_id', projectId)

      if (error) throw error
      return data
    } catch (error) {
      console.error('Get project collaborators error:', error)
      throw error
    }
  },

  // Get recent activities for dashboard
  async getRecentActivities(userId: string, limit: number = 10) {
    try {
      const { data, error } = await supabase
        .from('activities')
        .select(`
          *,
          projects(title)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) throw error
      return data
    } catch (error) {
      console.error('Get recent activities error:', error)
      throw error
    }
  },

  // Add activity
  async addActivity(userId: string, projectId: string | null, type: string, description: string) {
    try {
      const { error } = await supabase
        .from('activities')
        .insert({
          user_id: userId,
          project_id: projectId,
          type: type as any,
          description,
        })

      if (error) throw error
    } catch (error) {
      console.error('Add activity error:', error)
      throw error
    }
  },
}