import { supabase } from '@/lib/supabase'

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
  // Get dashboard statistics
  async getDashboardStats(): Promise<DashboardStats> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      // Get projects stats with business domain info
      const { data: projects, error: projectsError } = await supabase
        .from('projects')
        .select(`
          id, 
          title, 
          status, 
          progress, 
          updated_at, 
          created_at,
          business_domains(name, name_vi)
        `)
        .eq('user_id', user.id)

      if (projectsError) throw projectsError

      const totalProjects = projects?.length || 0
      const activeProjects = projects?.filter(p => p.status === 'in_progress').length || 0
      const completedProjects = projects?.filter(p => p.status === 'completed').length || 0

      // Get outlines count
      const { data: outlines, error: outlinesError } = await supabase
        .from('research_outlines')
        .select('id, project_id, created_at')
        .in('project_id', projects?.map(p => p.id) || [])

      if (outlinesError) throw outlinesError

      const totalOutlines = outlines?.length || 0

      // Get recent activity count (last 7 days)
      const { data: activities, error: activitiesError } = await supabase
        .from('user_activities')
        .select('id')
        .eq('user_id', user.id)
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())

      const recentActivityCount = activities?.length || 0

      // Get weekly progress (last 7 days)
      const weeklyProgress: WeeklyProgress[] = []
      for (let i = 6; i >= 0; i--) {
        const date = new Date()
        date.setDate(date.getDate() - i)
        const dateStr = date.toISOString().split('T')[0]
        
        const dayProjects = projects?.filter(p => 
          p.created_at.startsWith(dateStr)
        ).length || 0
        
        const dayOutlines = outlines?.filter(o => 
          o.created_at.startsWith(dateStr)
        ).length || 0

        weeklyProgress.push({
          date: dateStr,
          projects: dayProjects,
          outlines: dayOutlines
        })
      }

      // Get model usage statistics
      const { data: projectModels, error: modelsError } = await supabase
        .from('project_models')
        .select(`
          marketing_models(name, name_vi)
        `)
        .in('project_id', projects?.map(p => p.id) || [])

      const modelUsage: ModelUsage[] = []
      if (projectModels && projectModels.length > 0) {
        const modelCounts: { [key: string]: number } = {}
        projectModels.forEach(pm => {
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
      return {
        totalProjects: 0,
        activeProjects: 0,
        completedProjects: 0,
        totalOutlines: 0,
        recentActivityCount: 0,
        weeklyProgress: [],
        modelUsage: []
      }
    }
  },

  // Get recent activities
  async getRecentActivities(limit: number = 10): Promise<RecentActivity[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const { data: activities, error } = await supabase
        .from('user_activities')
        .select(`
          id,
          activity_type,
          details,
          created_at,
          resource_id
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) throw error

      // Get project titles for activities that have resource_id
      const projectIds = activities?.filter(a => a.resource_id).map(a => a.resource_id) || []
      let projectTitles: { [key: string]: string } = {}

      if (projectIds.length > 0) {
        const { data: projects } = await supabase
          .from('projects')
          .select('id, title')
          .in('id', projectIds)

        projects?.forEach(p => {
          projectTitles[p.id] = p.title
        })
      }

      return (activities || []).map(activity => ({
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

  // Get recent projects
  async getRecentProjects(limit: number = 5): Promise<RecentProject[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const { data: projects, error } = await supabase
        .from('projects')
        .select(`
          id,
          title,
          description,
          status,
          progress,
          updated_at,
          business_domains(name, name_vi, icon, color)
        `)
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false })
        .limit(limit)

      if (error) throw error

      return (projects || []).map(project => ({
        id: project.id,
        title: project.title,
        description: project.description || '',
        status: project.status,
        progress: project.progress || 0,
        last_activity: project.updated_at,
        business_domain: project.business_domains
      }))
    } catch (error) {
      console.error('Get recent projects error:', error)
      return []
    }
  },

  // Add activity
  async addActivity(
    activityType: string, 
    details: any,
    resourceId?: string
  ): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const { error } = await supabase
        .from('user_activities')
        .insert({
          user_id: user.id,
          activity_type: activityType,
          details,
          resource_id: resourceId || null
        })

      if (error) throw error
    } catch (error) {
      console.error('Add activity error:', error)
      // Don't throw error for activity logging failures
      console.warn('Failed to log activity, continuing...')
    }
  },

  // Get project statistics by status
  async getProjectStatsByStatus() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const { data, error } = await supabase
        .from('projects')
        .select('status')
        .eq('user_id', user.id)

      if (error) throw error

      const stats = {
        total: data.length,
        draft: data.filter(p => p.status === 'draft').length,
        in_progress: data.filter(p => p.status === 'in_progress').length,
        completed: data.filter(p => p.status === 'completed').length,
        published: data.filter(p => p.status === 'published').length,
        archived: data.filter(p => p.status === 'archived').length,
      }

      return stats
    } catch (error) {
      console.error('Get project stats by status error:', error)
      return {
        total: 0,
        draft: 0,
        in_progress: 0,
        completed: 0,
        published: 0,
        archived: 0,
      }
    }
  },

  // Get research progress over time
  async getResearchProgress(days: number = 30) {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const { data, error } = await supabase
        .from('user_activities')
        .select('created_at, details, activity_type')
        .eq('user_id', user.id)
        .in('activity_type', ['project_created', 'outline_generated', 'project_updated'])
        .gte('created_at', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: true })

      if (error) throw error

      // Group by date and count activities
      const progressByDate = data.reduce((acc: any, activity) => {
        const date = activity.created_at.split('T')[0]
        
        if (!acc[date]) {
          acc[date] = { projects: 0, outlines: 0, updates: 0 }
        }
        
        if (activity.activity_type === 'project_created') {
          acc[date].projects += 1
        } else if (activity.activity_type === 'outline_generated') {
          acc[date].outlines += 1
        } else if (activity.activity_type === 'project_updated') {
          acc[date].updates += 1
        }
        
        return acc
      }, {})

      return Object.entries(progressByDate).map(([date, counts]: [string, any]) => ({
        date,
        projects: counts.projects,
        outlines: counts.outlines,
        updates: counts.updates
      }))
    } catch (error) {
      console.error('Get research progress error:', error)
      return []
    }
  },

  // Get user productivity metrics
  async getProductivityMetrics() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const [stats, activities] = await Promise.all([
        this.getDashboardStats(),
        supabase
          .from('user_activities')
          .select('activity_type, created_at')
          .eq('user_id', user.id)
          .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
      ])

      const activitiesData = activities.data || []
      
      // Calculate daily average
      const dailyActivities = activitiesData.length / 30
      
      // Calculate activity distribution
      const activityTypes = activitiesData.reduce((acc: any, activity) => {
        const type = activity.activity_type
        acc[type] = (acc[type] || 0) + 1
        return acc
      }, {})

      return {
        ...stats,
        dailyActivities: Math.round(dailyActivities * 10) / 10,
        activityDistribution: activityTypes,
        totalActivities: activitiesData.length
      }
    } catch (error) {
      console.error('Get productivity metrics error:', error)
      return {
        totalProjects: 0,
        activeProjects: 0,
        completedProjects: 0,
        totalOutlines: 0,
        recentActivityCount: 0,
        weeklyProgress: [],
        modelUsage: [],
        dailyActivities: 0,
        activityDistribution: {},
        totalActivities: 0
      }
    }
  }
}