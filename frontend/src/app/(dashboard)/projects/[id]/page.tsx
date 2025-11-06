'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ProgressTracker } from '@/components/projects/progress-tracker'
import { 
  ArrowLeftIcon, 
  PencilIcon, 
  DocumentTextIcon,
  BookOpenIcon,
  ChartBarIcon,
  CalendarIcon,
  CheckIcon,
  XMarkIcon,
  ClockIcon,
  TrophyIcon,
  PlayIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'
import { marketingProjectsService, type MarketingProject } from '@/services/marketing-projects'
import { dashboardService } from '@/services/dashboard'
import { progressTrackingService } from '@/services/progress-tracking'
import { 
  Milestone, 
  TimelineEvent, 
  MilestoneStatus, 
  MilestoneType,
  ProjectStage 
} from '@/types/workflow'

export default function ProjectDetailPage() {
  const router = useRouter()
  const params = useParams()
  const projectId = params.id as string

  const [project, setProject] = useState<MarketingProject | null>(null)
  const [milestones, setMilestones] = useState<Milestone[]>([])
  const [timeline, setTimeline] = useState<TimelineEvent[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [showProgressTracker, setShowProgressTracker] = useState(false)
  const [editData, setEditData] = useState({
    title: '',
    description: '',
    status: '',
    progress: 0
  })
  const [error, setError] = useState<string | null>(null)
  const [recommendations, setRecommendations] = useState<any[]>([])
  const [upcomingDeadlines, setUpcomingDeadlines] = useState<any[]>([])
  const [currentStage, setCurrentStage] = useState<ProjectStage | null>(null)

  useEffect(() => {
    const loadProject = async () => {
      try {
        const projectData = await marketingProjectsService.getProject(projectId)
        if (projectData) {
          setProject(projectData)
          setEditData({
            title: projectData.title,
            description: projectData.description,
            status: projectData.status,
            progress: projectData.progress
          })
        } else {
          setError('Project not found')
        }
      } catch (err) {
        console.error('Failed to load project:', err)
        setError('Failed to load project')
      } finally {
        setIsLoading(false)
      }
    }

    const loadProgressData = async () => {
      try {
        // Load milestones
        const milestonesData = await progressTrackingService.getProjectMilestones(projectId)
        setMilestones(milestonesData)

        // Load timeline
        const timelineData = await progressTrackingService.getProjectTimeline(projectId, 20)
        setTimeline(timelineData)

        // Load recommendations
        const recommendationsData = await progressTrackingService.getMilestoneRecommendations(projectId)
        setRecommendations(recommendationsData)

        // Load upcoming deadlines
        const deadlinesData = await progressTrackingService.getUpcomingDeadlines(projectId, 14)
        setUpcomingDeadlines(deadlinesData)

        // Update project stage
        const stageData = await progressTrackingService.updateProjectStage(projectId)
        setCurrentStage(stageData.currentStage)
      } catch (err) {
        console.error('Failed to load progress data:', err)
        // Don't set error here as progress data is optional
      }
    }

    if (projectId) {
      loadProject()
      loadProgressData()
    }
  }, [projectId])

  const handleSaveEdit = async () => {
    if (!project) return

    try {
      setIsLoading(true)
      const updatedProject = await marketingProjectsService.updateProject(project.id, {
        title: editData.title,
        description: editData.description,
        status: editData.status,
        progress: editData.progress
      })

      setProject(updatedProject)
      setIsEditing(false)

      // Add activity
      await dashboardService.addActivity(
        'project_updated',
        {
          title: editData.title,
          description: `Updated project: ${editData.title}`,
          updated_fields: ['title', 'description', 'status', 'progress'],
          project_id: project.id
        }
      )
    } catch (err) {
      console.error('Failed to update project:', err)
      setError('Failed to update project')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancelEdit = () => {
    if (project) {
      setEditData({
        title: project.title,
        description: project.description,
        status: project.status,
        progress: project.progress
      })
    }
    setIsEditing(false)
  }

  // Progress tracking handlers
  const handleMilestoneUpdate = async (updatedMilestone: Milestone) => {
    setMilestones(prev => 
      prev.map(m => m.id === updatedMilestone.id ? updatedMilestone : m)
    )
    
    // Add timeline event
    await progressTrackingService.addTimelineEvent(projectId, {
      eventType: 'milestone_updated',
      description: `Milestone "${updatedMilestone.name}" updated to ${updatedMilestone.status}`,
      data: { milestoneId: updatedMilestone.id, status: updatedMilestone.status },
      metadata: {}
    })

    // Refresh timeline
    const timelineData = await progressTrackingService.getProjectTimeline(projectId, 20)
    setTimeline(timelineData)
  }

  const handleMilestoneCreate = async (milestoneData: Omit<Milestone, 'id' | 'projectId'>) => {
    try {
      const newMilestone = await progressTrackingService.createMilestone(projectId, {
        ...milestoneData,
        orderIndex: milestones.length
      })
      setMilestones(prev => [...prev, newMilestone])

      // Add timeline event
      await progressTrackingService.addTimelineEvent(projectId, {
        eventType: 'milestone_created',
        description: `New milestone "${newMilestone.name}" created`,
        data: { milestoneId: newMilestone.id },
        metadata: {}
      })

      // Refresh timeline
      const timelineData = await progressTrackingService.getProjectTimeline(projectId, 20)
      setTimeline(timelineData)
    } catch (error) {
      console.error('Failed to create milestone:', error)
      setError('Failed to create milestone')
    }
  }

  const handleMilestoneDelete = async (milestoneId: string) => {
    try {
      const milestone = milestones.find(m => m.id === milestoneId)
      if (!milestone) return

      await progressTrackingService.deleteMilestone(milestoneId)
      setMilestones(prev => prev.filter(m => m.id !== milestoneId))

      // Add timeline event
      await progressTrackingService.addTimelineEvent(projectId, {
        eventType: 'milestone_deleted',
        description: `Milestone "${milestone.name}" deleted`,
        data: { milestoneId },
        metadata: {}
      })

      // Refresh timeline
      const timelineData = await progressTrackingService.getProjectTimeline(projectId, 20)
      setTimeline(timelineData)
    } catch (error) {
      console.error('Failed to delete milestone:', error)
      setError('Failed to delete milestone')
    }
  }

  const handleCreateMilestonesFromTemplate = async () => {
    try {
      const templateMilestones = await progressTrackingService.createMilestonesFromTemplate(
        projectId, 
        'research'
      )
      setMilestones(prev => [...prev, ...templateMilestones])

      // Add timeline event
      await progressTrackingService.addTimelineEvent(projectId, {
        eventType: 'milestones_created_from_template',
        description: `${templateMilestones.length} milestones created from research template`,
        data: { templateType: 'research', count: templateMilestones.length },
        metadata: {}
      })

      // Refresh timeline
      const timelineData = await progressTrackingService.getProjectTimeline(projectId, 20)
      setTimeline(timelineData)
    } catch (error) {
      console.error('Failed to create milestones from template:', error)
      setError('Failed to create milestones from template')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800'
      case 'in_progress': return 'bg-blue-100 text-blue-800'
      case 'outline_generated': return 'bg-yellow-100 text-yellow-800'
      case 'planning': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getStageColor = (stage: ProjectStage) => {
    const stageColors = {
      [ProjectStage.IDEA_COMPLETE]: 'bg-gray-100 text-gray-800',
      [ProjectStage.THEORETICAL_FRAMEWORK_COMPLETE]: 'bg-blue-100 text-blue-800',
      [ProjectStage.SURVEY_COMPLETE]: 'bg-indigo-100 text-indigo-800',
      [ProjectStage.DATA_COLLECTION_COMPLETE]: 'bg-green-100 text-green-800',
      [ProjectStage.ANALYSIS_COMPLETE]: 'bg-yellow-100 text-yellow-800',
      [ProjectStage.DRAFT_COMPLETE]: 'bg-orange-100 text-orange-800',
      [ProjectStage.CITATION_COMPLETE]: 'bg-pink-100 text-pink-800',
      [ProjectStage.FORMAT_COMPLETE]: 'bg-purple-100 text-purple-800',
      [ProjectStage.PLAGIARISM_CHECK_COMPLETE]: 'bg-red-100 text-red-800',
      [ProjectStage.SUBMITTED]: 'bg-emerald-100 text-emerald-800',
      [ProjectStage.PUBLISHED]: 'bg-green-200 text-green-900'
    }
    return stageColors[stage] || 'bg-gray-100 text-gray-800'
  }

  const getStageDisplayName = (stage: ProjectStage) => {
    const stageNames = {
      [ProjectStage.IDEA_COMPLETE]: 'Idea Complete',
      [ProjectStage.THEORETICAL_FRAMEWORK_COMPLETE]: 'Framework Complete',
      [ProjectStage.SURVEY_COMPLETE]: 'Survey Complete',
      [ProjectStage.DATA_COLLECTION_COMPLETE]: 'Data Collection Complete',
      [ProjectStage.ANALYSIS_COMPLETE]: 'Analysis Complete',
      [ProjectStage.DRAFT_COMPLETE]: 'Draft Complete',
      [ProjectStage.CITATION_COMPLETE]: 'Citations Complete',
      [ProjectStage.FORMAT_COMPLETE]: 'Format Complete',
      [ProjectStage.PLAGIARISM_CHECK_COMPLETE]: 'Plagiarism Check Complete',
      [ProjectStage.SUBMITTED]: 'Submitted',
      [ProjectStage.PUBLISHED]: 'Published'
    }
    return stageNames[stage] || stage.replace('_', ' ')
  }

  const getRecommendationIcon = (type: string) => {
    switch (type) {
      case 'add_milestone':
        return <PlayIcon className="h-4 w-4" />
      case 'update_deadline':
        return <ClockIcon className="h-4 w-4" />
      case 'resolve_dependency':
        return <ExclamationTriangleIcon className="h-4 w-4" />
      default:
        return <CheckIcon className="h-4 w-4" />
    }
  }

  const getRecommendationColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'low':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-4"></div>
          <div className="h-4 bg-gray-200 rounded mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        </div>
      </div>
    )
  }

  if (error || !project) {
    return (
      <div className="space-y-6">
        <div className="flex items-center">
          <Button variant="ghost" onClick={() => router.push('/projects')}>
            <ArrowLeftIcon className="w-4 h-4 mr-2" />
            Back to Projects
          </Button>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {error || 'Project not found'}
              </h3>
              <Button onClick={() => router.push('/projects')}>
                Return to Projects
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Button variant="ghost" onClick={() => router.push('/projects')}>
            <ArrowLeftIcon className="w-4 h-4 mr-2" />
            Back to Projects
          </Button>
        </div>
        <div className="flex gap-2">
          {isEditing ? (
            <>
              <Button variant="outline" onClick={handleCancelEdit}>
                <XMarkIcon className="w-4 h-4 mr-2" />
                Cancel
              </Button>
              <Button onClick={handleSaveEdit}>
                <CheckIcon className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
            </>
          ) : (
            <>
              <Button 
                variant="outline" 
                onClick={() => setShowProgressTracker(!showProgressTracker)}
              >
                <TrophyIcon className="w-4 h-4 mr-2" />
                {showProgressTracker ? 'Hide Progress' : 'Show Progress'}
              </Button>
              <Button onClick={() => setIsEditing(true)}>
                <PencilIcon className="w-4 h-4 mr-2" />
                Edit Project
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Project Header */}
      <Card>
        <CardContent className="pt-6">
          {isEditing ? (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Project Title</label>
                <Input
                  value={editData.title}
                  onChange={(e) => setEditData(prev => ({ ...prev, title: e.target.value }))}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Description</label>
                <textarea
                  value={editData.description}
                  onChange={(e) => setEditData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Status</label>
                  <select
                    value={editData.status}
                    onChange={(e) => setEditData(prev => ({ ...prev, status: e.target.value }))}
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="planning">Planning</option>
                    <option value="outline_generated">Outline Generated</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium">Progress (%)</label>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={editData.progress}
                    onChange={(e) => setEditData(prev => ({ ...prev, progress: parseInt(e.target.value) || 0 }))}
                    className="mt-1"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">{project.title}</h1>
                  <p className="text-gray-600 mb-4">{project.description}</p>
                  <div className="flex items-center gap-4">
                    <Badge className={getStatusColor(project.status)}>
                      {project.status.replace('_', ' ').toUpperCase()}
                    </Badge>
                    <span className="text-sm text-gray-500">
                      {project.business_domain_name}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-blue-600">{project.progress}%</div>
                  <div className="text-sm text-gray-500">Complete</div>
                </div>
              </div>
              
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                  style={{ width: `${project.progress}%` }}
                ></div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Progress Overview */}
      {currentStage && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Project Stage & Progress</span>
              <Badge className={getStageColor(currentStage)}>
                {getStageDisplayName(currentStage)}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {milestones.filter(m => m.status === MilestoneStatus.COMPLETED).length}
                </div>
                <div className="text-sm text-gray-600">Completed Milestones</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {milestones.filter(m => m.status === MilestoneStatus.IN_PROGRESS).length}
                </div>
                <div className="text-sm text-gray-600">In Progress</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {milestones.filter(m => m.status === MilestoneStatus.BLOCKED).length}
                </div>
                <div className="text-sm text-gray-600">Blocked</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recommendations & Deadlines */}
      {(recommendations.length > 0 || upcomingDeadlines.length > 0) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recommendations */}
          {recommendations.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Recommendations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recommendations.slice(0, 3).map((rec, index) => (
                    <div key={index} className={`p-3 rounded-lg border ${getRecommendationColor(rec.priority)}`}>
                      <div className="flex items-start space-x-2">
                        {getRecommendationIcon(rec.type)}
                        <div className="flex-1">
                          <h4 className="font-medium text-sm">{rec.title}</h4>
                          <p className="text-xs text-gray-600 mt-1">{rec.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Upcoming Deadlines */}
          {upcomingDeadlines.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Deadlines</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {upcomingDeadlines.slice(0, 3).map((deadline, index) => (
                    <div key={index} className={`p-3 rounded-lg border ${
                      deadline.isOverdue ? 'bg-red-50 border-red-200' : 
                      deadline.daysUntilDeadline <= 3 ? 'bg-yellow-50 border-yellow-200' : 
                      'bg-blue-50 border-blue-200'
                    }`}>
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-sm">{deadline.milestone.name}</h4>
                          <p className="text-xs text-gray-600">
                            {deadline.isOverdue ? 'Overdue' : `${deadline.daysUntilDeadline} days remaining`}
                          </p>
                        </div>
                        <Badge variant="outline" className={
                          deadline.priority === 'critical' ? 'border-red-500 text-red-700' :
                          deadline.priority === 'high' ? 'border-orange-500 text-orange-700' :
                          'border-blue-500 text-blue-700'
                        }>
                          {deadline.priority}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Progress Tracker */}
      {showProgressTracker && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Progress Tracking</h2>
            <div className="flex gap-2">
              {milestones.length === 0 && (
                <Button onClick={handleCreateMilestonesFromTemplate} variant="outline">
                  <PlayIcon className="w-4 h-4 mr-2" />
                  Create Research Milestones
                </Button>
              )}
            </div>
          </div>
          
          <ProgressTracker
            projectId={projectId}
            milestones={milestones}
            timeline={timeline}
            onMilestoneUpdate={handleMilestoneUpdate}
            onMilestoneCreate={handleMilestoneCreate}
            onMilestoneDelete={handleMilestoneDelete}
          />
        </div>
      )}

      {/* Project Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <DocumentTextIcon className="h-8 w-8 text-blue-500 mr-3" />
              <div>
                <div className="text-2xl font-bold">{project.word_count || 0}</div>
                <div className="text-sm text-gray-500">Words Written</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <BookOpenIcon className="h-8 w-8 text-green-500 mr-3" />
              <div>
                <div className="text-2xl font-bold">{project.reference_count || 0}</div>
                <div className="text-sm text-gray-500">References</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <ChartBarIcon className="h-8 w-8 text-purple-500 mr-3" />
              <div>
                <div className="text-2xl font-bold">{project.selected_models?.length || 0}</div>
                <div className="text-sm text-gray-500">Models Used</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <CalendarIcon className="h-8 w-8 text-orange-500 mr-3" />
              <div>
                <div className="text-sm font-bold">
                  {formatDate(project.created_at)}
                </div>
                <div className="text-sm text-gray-500">Created</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress-Based Navigation */}
      {!showProgressTracker && milestones.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Next Steps</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {(() => {
                const availableMilestones = progressTrackingService.getAvailableMilestones(milestones)
                const inProgressMilestones = milestones.filter(m => m.status === MilestoneStatus.IN_PROGRESS)
                const blockedMilestones = milestones.filter(m => m.status === MilestoneStatus.BLOCKED)

                if (blockedMilestones.length > 0) {
                  return (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex items-center space-x-2 mb-2">
                        <ExclamationTriangleIcon className="h-5 w-5 text-red-600" />
                        <h4 className="font-medium text-red-800">Resolve Blocked Milestones</h4>
                      </div>
                      <p className="text-sm text-red-700 mb-3">
                        You have {blockedMilestones.length} blocked milestone(s) that need attention.
                      </p>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => setShowProgressTracker(true)}
                        className="border-red-300 text-red-700 hover:bg-red-100"
                      >
                        View Progress Tracker
                      </Button>
                    </div>
                  )
                }

                if (inProgressMilestones.length > 0) {
                  const milestone = inProgressMilestones[0]
                  return (
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-center space-x-2 mb-2">
                        <PlayIcon className="h-5 w-5 text-blue-600" />
                        <h4 className="font-medium text-blue-800">Continue Working</h4>
                      </div>
                      <p className="text-sm text-blue-700 mb-3">
                        Continue working on: <strong>{milestone.name}</strong> ({milestone.progressPercentage}% complete)
                      </p>
                      <div className="flex space-x-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => setShowProgressTracker(true)}
                          className="border-blue-300 text-blue-700 hover:bg-blue-100"
                        >
                          Update Progress
                        </Button>
                        {milestone.type === MilestoneType.DATA_COLLECTION && (
                          <Button 
                            size="sm"
                            onClick={() => router.push('/analysis')}
                            className="bg-blue-600 text-white hover:bg-blue-700"
                          >
                            Go to Analysis
                          </Button>
                        )}
                      </div>
                    </div>
                  )
                }

                if (availableMilestones.length > 0) {
                  const milestone = availableMilestones[0]
                  return (
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center space-x-2 mb-2">
                        <CheckIcon className="h-5 w-5 text-green-600" />
                        <h4 className="font-medium text-green-800">Ready to Start</h4>
                      </div>
                      <p className="text-sm text-green-700 mb-3">
                        Ready to start: <strong>{milestone.name}</strong>
                      </p>
                      <Button 
                        size="sm"
                        onClick={() => setShowProgressTracker(true)}
                        className="bg-green-600 text-white hover:bg-green-700"
                      >
                        Start Milestone
                      </Button>
                    </div>
                  )
                }

                // All milestones completed
                const completedCount = milestones.filter(m => m.status === MilestoneStatus.COMPLETED).length
                if (completedCount === milestones.length && milestones.length > 0) {
                  return (
                    <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
                      <div className="flex items-center space-x-2 mb-2">
                        <TrophyIcon className="h-5 w-5 text-emerald-600" />
                        <h4 className="font-medium text-emerald-800">Project Complete!</h4>
                      </div>
                      <p className="text-sm text-emerald-700 mb-3">
                        Congratulations! All milestones have been completed.
                      </p>
                      <div className="flex space-x-2">
                        <Button 
                          size="sm"
                          onClick={() => router.push('/projects')}
                          className="bg-emerald-600 text-white hover:bg-emerald-700"
                        >
                          View All Projects
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => setShowProgressTracker(true)}
                          className="border-emerald-300 text-emerald-700 hover:bg-emerald-100"
                        >
                          View Summary
                        </Button>
                      </div>
                    </div>
                  )
                }

                // No milestones yet
                return (
                  <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <ClockIcon className="h-5 w-5 text-gray-600" />
                      <h4 className="font-medium text-gray-800">Set Up Progress Tracking</h4>
                    </div>
                    <p className="text-sm text-gray-700 mb-3">
                      Create milestones to track your research progress and get personalized recommendations.
                    </p>
                    <div className="flex space-x-2">
                      <Button 
                        size="sm"
                        onClick={handleCreateMilestonesFromTemplate}
                        className="bg-blue-600 text-white hover:bg-blue-700"
                      >
                        Create Research Milestones
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => setShowProgressTracker(true)}
                      >
                        Manual Setup
                      </Button>
                    </div>
                  </div>
                )
              })()}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Project Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Marketing Models */}
        <Card>
          <CardHeader>
            <CardTitle>Marketing Models</CardTitle>
          </CardHeader>
          <CardContent>
            {project.selected_model_names && project.selected_model_names.length > 0 ? (
              <div className="space-y-2">
                {project.selected_model_names.map((modelName, index) => (
                  <div key={index} className="flex items-center p-3 bg-gray-50 rounded-lg">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                    <span className="font-medium">{modelName}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No models selected</p>
            )}
          </CardContent>
        </Card>

        {/* Research Outline */}
        <Card>
          <CardHeader>
            <CardTitle>Research Outline</CardTitle>
          </CardHeader>
          <CardContent>
            {project.research_outline ? (
              <div className="space-y-3">
                <div>
                  <h4 className="font-medium text-gray-900">Title:</h4>
                  <p className="text-sm text-gray-600">{project.research_outline.title}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Abstract:</h4>
                  <p className="text-sm text-gray-600">
                    {project.research_outline.abstract?.substring(0, 200)}...
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Hypotheses:</h4>
                  <div className="text-sm text-gray-600">
                    {project.research_outline.hypotheses?.length || 0} hypotheses generated
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Variables:</h4>
                  <div className="text-sm text-gray-600">
                    {project.research_outline.suggestedVariables?.length || 0} variables suggested
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-gray-500">No research outline generated yet</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Project Metadata */}
      <Card>
        <CardHeader>
          <CardTitle>Project Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div>
                <h4 className="font-medium text-gray-900">Created</h4>
                <p className="text-sm text-gray-600">{formatDate(project.created_at)}</p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Last Updated</h4>
                <p className="text-sm text-gray-600">{formatDate(project.updated_at)}</p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Business Domain</h4>
                <p className="text-sm text-gray-600">{project.business_domain_name}</p>
              </div>
            </div>
            <div className="space-y-3">
              <div>
                <h4 className="font-medium text-gray-900">Project ID</h4>
                <p className="text-sm text-gray-600 font-mono">{project.id}</p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Tags</h4>
                <div className="flex flex-wrap gap-1">
                  {project.tags && project.tags.length > 0 ? (
                    project.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-sm text-gray-500">No tags</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}