'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  ArrowLeftIcon, 
  PencilIcon, 
  DocumentTextIcon,
  BookOpenIcon,
  ChartBarIcon,
  CalendarIcon,
  UserIcon,
  CheckIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'
import { marketingProjectsService, type MarketingProject } from '@/services/marketing-projects'
import { dashboardService } from '@/services/dashboard'

export default function ProjectDetailPage() {
  const router = useRouter()
  const params = useParams()
  const projectId = params.id as string

  const [project, setProject] = useState<MarketingProject | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState({
    title: '',
    description: '',
    status: '',
    progress: 0
  })
  const [error, setError] = useState<string | null>(null)

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

    if (projectId) {
      loadProject()
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
          updated_fields: ['title', 'description', 'status', 'progress']
        },
        project.id
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
            <Button onClick={() => setIsEditing(true)}>
              <PencilIcon className="w-4 h-4 mr-2" />
              Edit Project
            </Button>
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