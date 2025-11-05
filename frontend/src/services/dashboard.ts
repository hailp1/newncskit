// Use PostgreSQL database instead of Supabase
import { authService } from './auth'

export interface DashboardStats {
  totalProjects: number
  activeProjects: number
  completedProjects: number
  totalOutlines: number
  recentActivityCount: number
  weeklyProgress: WeeklyProgress[]
  modelUsage: ModelUsage[]
}

export interface RecentActivity {
  id: string
  activity_type: string
  description: string
  project_title: string
  created_at: string
  resource_id?: string
}

export interface RecentProject {
  id: string
  title: string
  description: string
  status: string
  progress: number
  last_activity: string
  business_domain?: {
    name: string
    name_vi: string
    icon?: string
    color?: string
  }
}

export interface WeeklyProgress {
  date: string
  projects: number
  outlines: number
}

export interface ModelUsage {
  modelName: string
  count: number
  percentage: number
}

export const dashboardService = {
  // Get current user session with proper error handling
  async getCurrentUser() {
    try {
      // Try auth service first (handles both Supabase and Django)
      const sessionData = await authService.getSession()
      if (sessionData?.user) {
        return sessionData
      }

      // Fallback to direct Supabase auth
      const { data: { user }, error } = await supabase.auth.getUser()
      if (error) {
        console.warn('Supabase auth error:', error.message)
        return null
      }

      if (!user) return null

      // Try to get user profile from database
      const { data: profileData, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single()

      if (profileError) {
        console.warn('Profile fetch error:', profileError.message)
        // Return basic user info from auth
        return {
          user: {
            id: user.id,
            email: user.email || '',
            profile: {
              firstName: user.user_metadata?.first_name || 'User',
              lastName: user.user_metadata?.last_name || '',
            }
          },
          session: { access_token: 'supabase', refresh_token: 'supabase' }
        }
      }

      if (profileData) {
        const profile = profileData as any;
        return {
          user: {
            id: profile.id,
            email: profile.email,
            profile: {
              firstName: profile.first_name,
              lastName: profile.last_name,
            }
          },
          session: { access_token: 'supabase', refresh_token: 'supabase' }
        }
      }
      return null;
    } catch (error) {
      console.error('Get current user error:', error)
      return null
    }
  },

  // Return empty stats when user not authenticated or errors occur
  getEmptyStats(): DashboardStats {
    return {
      totalProjects: 0,
      activeProjects: 0,
      completedProjects: 0,
      totalOutlines: 0,
      recentActivityCount: 0,
      weeklyProgress: [],
      modelUsage: []
    }
  },

  // Get dashboard statistics with graceful fallbacks
  async getDashboardStats(): Promise<DashboardStats> {
    try {
      const sessionData = await this.getCurrentUser()
      if (!sessionData?.user) {
        console.warn('User not authenticated, returning empty stats')
        return this.getEmptyStats()
      }
      
      const userId = sessionData.user.id

      // Try to get projects - if table doesn't exist, return empty stats
      const { data: projects, error: projectsError } = await supabase
        .from('projects')
        .select('id, title, status, progress, updated_at, created_at')
        .eq('user_id', userId)

      if (projectsError) {
        console.warn('Projects table not found or error:', projectsError.message)
        return this.getEmptyStats()
      }

      const totalProjects = projects?.length || 0
      const activeProjects = projects?.filter((p: any) => p.status === 'in_progress').length || 0
      const completedProjects = projects?.filter((p: any) => p.status === 'completed').length || 0

      // Try to get outlines - graceful fallback if table doesn't exist
      let totalOutlines = 0
      try {
        const { data: outlines } = await supabase
          .from('research_outlines')
          .select('id, project_id, created_at')
          .in('project_id', projects?.map((p: any) => p.id) || [])
        
        totalOutlines = outlines?.length || 0
      } catch (error) {
        console.warn('Research outlines table not found, using 0')
      }

      // Try to get activities - graceful fallback
      let recentActivityCount = 0
      try {
        const { data: activities } = await supabase
          .from('user_activities')
          .select('id')
          .eq('user_id', userId)
          .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
        
        recentActivityCount = activities?.length || 0
      } catch (error) {
        console.warn('User activities table not found, using 0')
      }

      // Generate weekly progress from available data
      const weeklyProgress: WeeklyProgress[] = []
      for (let i = 6; i >= 0; i--) {
        const date = new Date()
        date.setDate(date.getDate() - i)
        const dateStr = date.toISOString().split('T')[0]
        
        const dayProjects = projects?.filter((p: any) => 
          p.created_at && p.created_at.startsWith(dateStr)
        ).length || 0

        weeklyProgress.push({
          date: dateStr,
          projects: dayProjects,
          outlines: 0 // Will be updated when outlines table exists
        })
      }

      // Try to get model usage - graceful fallback
      const modelUsage: ModelUsage[] = []
      try {
        const { data: projectModels } = await supabase
          .from('project_models')
          .select('marketing_models(name, name_vi)')
          .in('project_id', projects?.map((p: any) => p.id) || [])

        if (projectModels && projectModels.length > 0) {
          const modelCounts: { [key: string]: number } = {}
          projectModels.forEach((pm: any) => {
            const modelName = pm.marketing_models?.name_vi || pm.marketing_models?.name || 'Unknown'
            modelCounts[modelName] = (modelCounts[modelName] || 0) + 1
          })

          const total = Object.values(modelCounts).reduce((sum, count) => sum + count, 0)
          Object.entries(modelCounts).forEach(([name, count]) => {
            modelUsage.push({
              modelName: name,
              count,
              percentage: total > 0 ? (count / total) * 100 : 0
            })
          })
        }
      } catch (error) {
        console.warn('Project models table not found, using empty array')
      }

      return {
        totalProjects,
        activeProjects,
        completedProjects,
        totalOutlines,
        recentActivityCount,
        weeklyProgress,
        modelUsage
      }
    } catch (error) {
      console.error('Get dashboard stats error:', error)
      return this.getEmptyStats()
    }
  },

  // Get recent activities with graceful fallbacks
  async getRecentActivities(limit: number = 10): Promise<RecentActivity[]> {
    try {
      const sessionData = await this.getCurrentUser()
      if (!sessionData?.user) return []
      
      const userId = sessionData.user.id

      const { data: activities, error } = await supabase
        .from('user_activities')
        .select('id, activity_type, details, created_at, resource_id')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) {
        console.warn('Activities table not found:', error.message)
        return []
      }

      // Get project titles for activities that have resource_id
      const projectIds = activities?.filter((a: any) => a.resource_id).map((a: any) => a.resource_id) || []
      let projectTitles: { [key: string]: string } = {}

      if (projectIds.length > 0) {
        try {
          const { data: projects } = await supabase
            .from('projects')
            .select('id, title')
            .in('id', projectIds)

          projects?.forEach((p: any) => {
            projectTitles[p.id] = p.title
          })
        } catch (error) {
          console.warn('Could not fetch project titles')
        }
      }

      return (activities || []).map((activity: any) => ({
        id: activity.id,
        activity_type: activity.activity_type,
        description: activity.details?.description || activity.details?.title || 'Activity',
        project_title: activity.resource_id ? projectTitles[activity.resource_id] || 'Unknown Project' : 'System',
        created_at: activity.created_at,
        resource_id: activity.resource_id
      }))
    } catch (error) {
      console.error('Get recent activities error:', error)
      return []
    }
  },

  // Get recent projects with graceful fallbacks
  async getRecentProjects(limit: number = 5): Promise<RecentProject[]> {
    try {
      const sessionData = await this.getCurrentUser()
      if (!sessionData?.user) return []
      
      const userId = sessionData.user.id

      const { data: projects, error } = await supabase
        .from('projects')
        .select('id, title, description, status, progress, updated_at')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false })
        .limit(limit)

      if (error) {
        console.warn('Projects table not found:', error.message)
        return []
      }

      return (projects || []).map((project: any) => ({
        id: project.id,
        title: project.title,
        description: project.description || '',
        status: project.status,
        progress: project.progress || 0,
        last_activity: project.updated_at,
        business_domain: undefined // Will be populated when business_domains table exists
      }))
    } catch (error) {
      console.error('Get recent projects error:', error)
      return []
    }
  },

  // Add activity with better error handling
  async addActivity(
    activityType: string, 
    details: any,
    resourceId?: string
  ): Promise<void> {
    try {
      const sessionData = await this.getCurrentUser()
      if (!sessionData?.user) {
        console.warn('Cannot add activity: user not authenticated')
        return
      }
      
      const userId = sessionData.user.id

      const { error } = await supabase
        .from('user_activities')
        .insert({
          user_id: userId,
          activity_type: activityType,
          details,
          resource_id: resourceId || null
        })

      if (error) {
        console.warn('Add activity error (table may not exist):', error.message)
      }
    } catch (error) {
      console.error('Add activity error:', error)
      // Don't throw error for activity logging failures
      console.warn('Failed to log activity, continuing...')
    }
  }
}