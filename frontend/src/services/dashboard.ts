import { supabase } from '@/lib/supabase'

export interface DashboardStats {
  activeProjects: number
  totalWords: number
  totalReferences: number
  completedProjects: number
  recentActivityCount: number
}

export interface RecentActivity {
  id: number
  activity_type: string
  description: string
  project_title: string
  created_at: string
  metadata?: any
}

export interface RecentProject {
  id: string
  title: string
  status: string
  progress: number
  last_activity: string
  word_count: number
  reference_count: number
}

export const dashboardService = {
  // Get dashboard statistics
  async getDashboardStats(userId: string): Promise<DashboardStats> {
    try {
      // Try RPC function first, fallback to manual queries
      try {
        const { data, error } = await supabase
          .rpc('get_user_dashboard_stats', { p_user_id: userId })

        if (!error && data && data.length > 0) {
          const stats = data[0]
          return {
            activeProjects: stats.active_projects,
            totalWords: stats.total_words,
            totalReferences: stats.total_references,
            completedProjects: stats.completed_projects,
            recentActivityCount: stats.recent_activity_count
          }
        }
      } catch (rpcError) {
        console.log('RPC function not available, using fallback queries')
      }

      // Fallback to manual queries
      const [projectsData, activitiesData] = await Promise.all([
        supabase
          .from('projects')
          .select('status, word_count, reference_count, is_active')
          .eq('owner_id', userId),
        supabase
          .from('activities')
          .select('id')
          .eq('user_id', userId)
          .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
      ])

      const projects = projectsData.data || []
      const activities = activitiesData.data || []

      return {
        activeProjects: projects.filter(p => p.is_active !== false).length,
        totalWords: projects.reduce((sum, p) => sum + (p.word_count || 0), 0),
        totalReferences: projects.reduce((sum, p) => sum + (p.reference_count || 0), 0),
        completedProjects: projects.filter(p => p.status === 'completed').length,
        recentActivityCount: activities.length
      }
    } catch (error) {
      console.error('Get dashboard stats error:', error)
      // Return default stats on error
      return {
        activeProjects: 0,
        totalWords: 0,
        totalReferences: 0,
        completedProjects: 0,
        recentActivityCount: 0
      }
    }
  },

  // Get recent activities
  async getRecentActivities(userId: string, limit: number = 10): Promise<RecentActivity[]> {
    try {
      // Try RPC function first, fallback to manual query
      try {
        const { data, error } = await supabase
          .rpc('get_recent_activities', { 
            p_user_id: userId, 
            p_limit: limit 
          })

        if (!error && data) {
          return data
        }
      } catch (rpcError) {
        console.log('RPC function not available, using fallback query')
      }

      // Fallback to manual query
      const { data, error } = await supabase
        .from('activities')
        .select(`
          id,
          activity_type,
          description,
          created_at,
          metadata,
          projects(title)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) throw error

      return (data || []).map(activity => ({
        id: activity.id,
        activity_type: activity.activity_type,
        description: activity.description,
        project_title: activity.projects?.title || 'Unknown Project',
        created_at: activity.created_at,
        metadata: activity.metadata
      }))
    } catch (error) {
      console.error('Get recent activities error:', error)
      return []
    }
  },

  // Get recent projects
  async getRecentProjects(userId: string, limit: number = 5): Promise<RecentProject[]> {
    try {
      // Try RPC function first, fallback to manual query
      try {
        const { data, error } = await supabase
          .rpc('get_recent_projects', { 
            p_user_id: userId, 
            p_limit: limit 
          })

        if (!error && data) {
          return data
        }
      } catch (rpcError) {
        console.log('RPC function not available, using fallback query')
      }

      // Fallback to manual query
      const { data, error } = await supabase
        .from('projects')
        .select('id, title, status, progress, updated_at, word_count, reference_count')
        .eq('owner_id', userId)
        .order('updated_at', { ascending: false })
        .limit(limit)

      if (error) throw error

      return (data || []).map(project => ({
        id: project.id,
        title: project.title,
        status: project.status,
        progress: project.progress || 0,
        last_activity: project.updated_at,
        word_count: project.word_count || 0,
        reference_count: project.reference_count || 0
      }))
    } catch (error) {
      console.error('Get recent projects error:', error)
      return []
    }
  },

  // Add activity
  async addActivity(
    userId: string, 
    projectId: string | null, 
    activityType: string, 
    description: string,
    metadata?: any
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('activities')
        .insert({
          user_id: userId,
          project_id: projectId,
          activity_type: activityType,
          description,
          metadata: metadata || null
        })

      if (error) throw error
    } catch (error) {
      console.error('Add activity error:', error)
      throw error
    }
  },

  // Get project statistics by status
  async getProjectStatsByStatus(userId: string) {
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
        in_progress: data.filter(p => p.status === 'in_progress').length,
      }

      return stats
    } catch (error) {
      console.error('Get project stats by status error:', error)
      return {
        total: 0,
        planning: 0,
        execution: 0,
        writing: 0,
        submission: 0,
        completed: 0,
        in_progress: 0,
      }
    }
  },

  // Get writing progress over time
  async getWritingProgress(userId: string, days: number = 30) {
    try {
      const { data, error } = await supabase
        .from('activities')
        .select('created_at, metadata')
        .eq('user_id', userId)
        .eq('activity_type', 'document_updated')
        .gte('created_at', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: true })

      if (error) throw error

      // Group by date and sum words added
      const progressByDate = data.reduce((acc: any, activity) => {
        const date = activity.created_at.split('T')[0]
        const wordsAdded = activity.metadata?.words_added || 0
        
        if (!acc[date]) {
          acc[date] = 0
        }
        acc[date] += wordsAdded
        
        return acc
      }, {})

      return Object.entries(progressByDate).map(([date, words]) => ({
        date,
        words
      }))
    } catch (error) {
      console.error('Get writing progress error:', error)
      return []
    }
  },

  // Get user productivity metrics
  async getProductivityMetrics(userId: string) {
    try {
      const [stats, activities] = await Promise.all([
        this.getDashboardStats(userId),
        supabase
          .from('activities')
          .select('activity_type, created_at')
          .eq('user_id', userId)
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
        activeProjects: 0,
        totalWords: 0,
        totalReferences: 0,
        completedProjects: 0,
        recentActivityCount: 0,
        dailyActivities: 0,
        activityDistribution: {},
        totalActivities: 0
      }
    }
  }
}