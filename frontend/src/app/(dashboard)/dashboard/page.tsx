'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ProjectCard } from '@/components/dashboard/project-card'
import { useAuthStore } from '@/store/auth'
import { dashboardService, type DashboardStats, type RecentActivity, type RecentProject } from '@/services/dashboard'
import type { ProjectSummary } from '@/types'
import {
  PlusIcon,
  BeakerIcon,
  DocumentTextIcon,
  BookOpenIcon,
  ClockIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline'

// Mock data for demonstration
const mockDashboardData: DashboardData = {
  projects: [
    {
      id: '1',
      title: 'Machine Learning Applications in Healthcare',
      phase: 'writing',
      progress: 75,
      lastActivity: new Date('2024-01-15'),
      collaboratorCount: 3,
    },
    {
      id: '2',
      title: 'Sustainable Energy Systems Research',
      phase: 'execution',
      progress: 45,
      lastActivity: new Date('2024-01-14'),
      collaboratorCount: 2,
    },
    {
      id: '3',
      title: 'Quantum Computing Algorithms',
      phase: 'planning',
      progress: 20,
      lastActivity: new Date('2024-01-13'),
      collaboratorCount: 1,
    },
  ],
  recentActivity: [
    {
      id: '1',
      type: 'document_edit',
      description: 'Updated methodology section',
      timestamp: new Date('2024-01-15T10:30:00'),
      projectId: '1',
    },
    {
      id: '2',
      type: 'reference_added',
      description: 'Added 5 new references to literature review',
      timestamp: new Date('2024-01-15T09:15:00'),
      projectId: '2',
    },
  ],
  upcomingDeadlines: [
    {
      id: '1',
      title: 'Submit to Nature Medicine',
      date: new Date('2024-02-01'),
      type: 'submission',
      priority: 'high',
      projectId: '1',
    },
    {
      id: '2',
      title: 'Complete data analysis',
      date: new Date('2024-01-25'),
      type: 'milestone',
      priority: 'medium',
      projectId: '2',
    },
  ],
  productivity: {
    wordsWritten: 2450,
    referencesAdded: 12,
    milestonesCompleted: 3,
    collaborationHours: 8,
    period: 'week',
  },
}

export default function DashboardPage() {
  const router = useRouter()
  const { user } = useAuthStore()
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
    activeProjects: 0,
    totalWords: 0,
    totalReferences: 0,
    completedProjects: 0,
    recentActivityCount: 0
  })
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([])
  const [recentProjects, setRecentProjects] = useState<RecentProject[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        // Use demo user ID for now - in production, get from auth
        const userId = 'demo-user-123'
        
        const [stats, activities, projects] = await Promise.all([
          dashboardService.getDashboardStats(userId),
          dashboardService.getRecentActivities(userId, 5),
          dashboardService.getRecentProjects(userId, 3)
        ])

        setDashboardStats(stats)
        setRecentActivities(activities)
        setRecentProjects(projects)
      } catch (error) {
        console.error('Failed to load dashboard data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadDashboardData()
  }, [])

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {user?.profile.firstName}!
        </h1>
        <p className="text-gray-600 mt-1">
          Here's what's happening with your research projects today.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
            <BeakerIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? '...' : dashboardStats.activeProjects}
            </div>
            <p className="text-xs text-muted-foreground">
              Currently in progress
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Words Written</CardTitle>
            <DocumentTextIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? '...' : dashboardStats.totalWords.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Total across all projects
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">References Added</CardTitle>
            <BookOpenIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? '...' : dashboardStats.totalReferences}
            </div>
            <p className="text-xs text-muted-foreground">
              Total references collected
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Projects</CardTitle>
            <ChartBarIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? '...' : dashboardStats.completedProjects}
            </div>
            <p className="text-xs text-muted-foreground">
              Successfully finished
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
            <ClockIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? '...' : dashboardStats.recentActivityCount}
            </div>
            <p className="text-xs text-muted-foreground">
              Last 7 days
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Projects */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Recent Projects</h2>
          <Button onClick={() => router.push('/projects/new')}>
            <PlusIcon className="w-4 h-4 mr-2" />
            New Project
          </Button>
        </div>
        
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="pt-6">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded mb-4"></div>
                  <div className="h-2 bg-gray-200 rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : recentProjects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentProjects.map((project) => (
              <Card key={project.id} className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="pt-6">
                  <div className="space-y-2">
                    <h3 className="font-medium text-gray-900 line-clamp-2">{project.title}</h3>
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <span className="capitalize">{project.status.replace('_', ' ')}</span>
                      <span>{project.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${project.progress}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>{project.word_count} words</span>
                      <span>{project.reference_count} refs</span>
                    </div>
                    <p className="text-xs text-gray-500">
                      Updated {new Date(project.last_activity).toLocaleDateString()}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <BeakerIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No projects yet</h3>
                <p className="text-gray-600 mb-4">Get started by creating your first research project.</p>
                <Button onClick={() => router.push('/projects/new')}>
                  <PlusIcon className="w-4 h-4 mr-2" />
                  Create Project
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Recent Activity & Project Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse flex items-start space-x-3">
                    <div className="w-2 h-2 bg-gray-200 rounded-full mt-2"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded mb-1"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : recentActivities.length > 0 ? (
              recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3">
                  <div className={`w-2 h-2 rounded-full mt-2 ${
                    activity.activity_type === 'project_created' ? 'bg-green-500' :
                    activity.activity_type === 'document_updated' ? 'bg-blue-500' :
                    activity.activity_type === 'reference_added' ? 'bg-purple-500' :
                    activity.activity_type === 'outline_generated' ? 'bg-yellow-500' :
                    'bg-gray-500'
                  }`}></div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">{activity.description}</p>
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-gray-500">{activity.project_title}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(activity.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <ClockIcon className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                <p className="text-sm text-gray-500">No recent activity</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Project Overview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {isLoading ? '...' : dashboardStats.activeProjects}
                </div>
                <div className="text-sm text-blue-600">Active</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {isLoading ? '...' : dashboardStats.completedProjects}
                </div>
                <div className="text-sm text-green-600">Completed</div>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total Words</span>
                <span className="font-medium">
                  {isLoading ? '...' : dashboardStats.totalWords.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total References</span>
                <span className="font-medium">
                  {isLoading ? '...' : dashboardStats.totalReferences}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">This Week's Activity</span>
                <span className="font-medium">
                  {isLoading ? '...' : dashboardStats.recentActivityCount}
                </span>
              </div>
            </div>

            <div className="pt-4 border-t">
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => router.push('/projects')}
              >
                View All Projects
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}