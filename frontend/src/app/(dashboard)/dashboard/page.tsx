'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ProjectCard } from '@/components/dashboard/project-card'
import { useAuthStore } from '@/store/auth'
import { useProjectStore } from '@/store/projects'
import type { DashboardData, ProjectSummary } from '@/types'
import {
  PlusIcon,
  BeakerIcon,
  DocumentTextIcon,
  BookOpenIcon,
  ClockIcon,
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
  const { user } = useAuthStore()
  const { projects, fetchProjects } = useProjectStore()
  const [dashboardData, setDashboardData] = useState<DashboardData>(mockDashboardData)

  useEffect(() => {
    // In a real app, this would fetch actual dashboard data
    setDashboardData(mockDashboardData)
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
            <BeakerIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.projects.length}</div>
            <p className="text-xs text-muted-foreground">
              +2 from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Words Written</CardTitle>
            <DocumentTextIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.productivity.wordsWritten.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              This {dashboardData.productivity.period}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">References Added</CardTitle>
            <BookOpenIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.productivity.referencesAdded}</div>
            <p className="text-xs text-muted-foreground">
              This {dashboardData.productivity.period}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Deadlines</CardTitle>
            <ClockIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.upcomingDeadlines.length}</div>
            <p className="text-xs text-muted-foreground">
              Next 30 days
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Projects */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Recent Projects</h2>
          <Button onClick={() => window.location.href = '/projects/new'}>
            <PlusIcon className="w-4 h-4 mr-2" />
            New Project
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {dashboardData.projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      </div>

      {/* Recent Activity & Upcoming Deadlines */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {dashboardData.recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900">{activity.description}</p>
                  <p className="text-xs text-gray-500">
                    {activity.timestamp.toLocaleDateString()} at {activity.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Upcoming Deadlines</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {dashboardData.upcomingDeadlines.map((deadline) => (
              <div key={deadline.id} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">{deadline.title}</p>
                  <p className="text-xs text-gray-500">
                    {deadline.date.toLocaleDateString()}
                  </p>
                </div>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  deadline.priority === 'high' 
                    ? 'bg-red-100 text-red-800'
                    : deadline.priority === 'medium'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-green-100 text-green-800'
                }`}>
                  {deadline.priority}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}