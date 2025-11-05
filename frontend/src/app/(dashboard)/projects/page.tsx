'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ErrorMessageComponent } from '@/components/ui/error-message'
import { ProjectCard } from '@/components/dashboard/project-card'
import type { ProjectSummary } from '@/types'
import { useErrorHandling } from '@/hooks/use-error-handling'
import {
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline'

// Mock projects data
const mockProjects: ProjectSummary[] = [
  {
    id: '1',
    title: 'Machine Learning Applications in Healthcare Diagnostics',
    phase: 'writing',
    progress: 75,
    lastActivity: new Date('2024-01-15'),
    collaboratorCount: 3,
  },
  {
    id: '2',
    title: 'Sustainable Energy Systems and Grid Optimization',
    phase: 'execution',
    progress: 45,
    lastActivity: new Date('2024-01-14'),
    collaboratorCount: 2,
  },
  {
    id: '3',
    title: 'Quantum Computing Algorithms for Cryptography',
    phase: 'planning',
    progress: 20,
    lastActivity: new Date('2024-01-13'),
    collaboratorCount: 1,
  },
  {
    id: '4',
    title: 'Climate Change Impact on Marine Ecosystems',
    phase: 'submission',
    progress: 90,
    lastActivity: new Date('2024-01-12'),
    collaboratorCount: 4,
  },
  {
    id: '5',
    title: 'Neural Networks for Natural Language Processing',
    phase: 'management',
    progress: 100,
    lastActivity: new Date('2024-01-10'),
    collaboratorCount: 2,
  },
]

export default function ProjectsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [projects, setProjects] = useState<ProjectSummary[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedPhase, setSelectedPhase] = useState<string>('all')
  const [showSuccess, setShowSuccess] = useState(false)
  const [newProjectId, setNewProjectId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const {
    error,
    isRecovering,
    recoveryActions,
    handleError,
    executeRecovery,
    clearError,
    withErrorHandling
  } = useErrorHandling({
    component: 'projects-page',
    onError: (error, context) => {
      console.error('Projects page error:', error, context);
    }
  })

  // Load projects from Supabase with error handling
  const loadProjects = withErrorHandling(async () => {
    setIsLoading(true);
    
    try {
      // Get user ID from auth store or use fallback for testing
      let userId = 'demo-user-id' // Default fallback
      
      try {
        const { useAuthStore } = await import('@/store/auth')
        const authStore = useAuthStore.getState()
        if (authStore.user?.id) {
          userId = authStore.user.id
        } else {
          // Use researcher ID for testing
          userId = 'e875be23-309c-4e04-a899-3f88a605f704' // researcher@ncskit.com
        }
      } catch (authError) {
        console.warn('Auth store not available, using fallback user ID')
        // Use researcher ID as fallback
        userId = 'e875be23-309c-4e04-a899-3f88a605f704'
      }
      
      console.log('Loading projects for user:', userId.substring(0, 8) + '...')
      
      // Load projects from Supabase
      const { marketingProjectsService } = await import('@/services/marketing-projects-no-auth')
      const marketingProjects = await marketingProjectsService.getUserProjects(userId)
      
      console.log('Marketing projects loaded:', marketingProjects?.length || 0)
      
      // Convert to ProjectSummary format
      const projectSummaries: ProjectSummary[] = marketingProjects.map((project: any) => ({
        id: project.id,
        title: project.title,
        phase: project.status === 'draft' ? 'planning' : 
               project.status === 'outline_generated' ? 'planning' : 'execution',
        progress: project.progress || 25,
        lastActivity: new Date(project.updated_at || project.created_at),
        collaboratorCount: 1, // Default for now
      }))
      
      console.log('Project summaries created:', projectSummaries.length)
      
      // Use real projects if available, otherwise show mock projects for demo
      if (projectSummaries.length > 0) {
        setProjects([...projectSummaries, ...mockProjects])
      } else {
        setProjects(mockProjects)
      }
    } catch (error: any) {
      console.error('Failed to load projects:', error)
      
      // Always show mock projects as fallback
      setProjects(mockProjects)
      
      // Handle the error through our error handling system
      await handleError(error, 'loadProjects', { userId: 'masked' });
    } finally {
      setIsLoading(false);
    }
  }, 'loadProjects', { retries: 2 });

  useEffect(() => {

    loadProjects();

    // Check for success message
    const created = searchParams.get('created')
    const projectId = searchParams.get('id')
    
    if (created === 'true') {
      setShowSuccess(true)
      setNewProjectId(projectId)
      
      // Auto hide success message after 5 seconds
      setTimeout(() => {
        setShowSuccess(false)
        // Clean up URL
        router.replace('/projects')
      }, 5000)
    }
  }, [searchParams, router])

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.title.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesPhase = selectedPhase === 'all' || project.phase === selectedPhase
    return matchesSearch && matchesPhase
  })

  const phases = ['all', 'planning', 'execution', 'writing', 'submission', 'management']

  return (
    <div className="space-y-6">
      {/* Error Display */}
      {error && (
        <ErrorMessageComponent 
          error={error} 
          onDismiss={clearError}
        />
      )}

      {/* Recovery Actions */}
      {recoveryActions.length > 0 && (
        <Card className="p-4 bg-blue-50 border-blue-200">
          <h4 className="text-sm font-medium text-blue-800 mb-2">
            Suggested Actions:
          </h4>
          <div className="space-y-2">
            {recoveryActions.map((action, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => executeRecovery(action)}
                disabled={isRecovering}
                className="mr-2 border-blue-300 text-blue-700 hover:bg-blue-100"
              >
                {isRecovering ? 'Processing...' : action.label}
              </Button>
            ))}
          </div>
        </Card>
      )}

      {/* Success Message */}
      {showSuccess && (
        <Card className="bg-green-50 border-green-200">
          <CardContent className="pt-6">
            <div className="flex items-center">
              <CheckCircleIcon className="w-6 h-6 text-green-600 mr-3" />
              <div>
                <h3 className="text-green-800 font-medium">Dự án đã được tạo thành công!</h3>
                <p className="text-green-700 text-sm">
                  Đề cương nghiên cứu đã được tạo bằng AI và dự án đã được lưu vào danh sách.
                  {newProjectId && ` ID: ${newProjectId}`}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Research Projects</h1>
          <p className="text-gray-600">
            Manage and track your research projects
            {isLoading && <span className="text-blue-600"> (Loading...)</span>}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          {error && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => loadProjects()}
              disabled={isLoading}
            >
              Retry
            </Button>
          )}
          <Button onClick={() => router.push('/projects/new')}>
            <PlusIcon className="w-4 h-4 mr-2" />
            New Project
          </Button>
        </div>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search projects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-2">
              <FunnelIcon className="w-4 h-4 text-gray-400" />
              <div className="flex gap-2">
                {phases.map((phase) => (
                  <Button
                    key={phase}
                    variant={selectedPhase === phase ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedPhase(phase)}
                    className="capitalize"
                  >
                    {phase}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Project Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {phases.slice(1).map((phase) => {
          const count = projects.filter(p => p.phase === phase).length
          return (
            <Card key={phase}>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-2xl font-bold">{count}</div>
                  <div className="text-sm text-gray-600 capitalize">{phase}</div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Projects Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">
            {filteredProjects.length} Project{filteredProjects.length !== 1 ? 's' : ''}
            {selectedPhase !== 'all' && (
              <Badge variant="secondary" className="ml-2 capitalize">
                {selectedPhase}
              </Badge>
            )}
          </h2>
        </div>

        {filteredProjects.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No projects found</h3>
                <p className="text-gray-600 mb-4">
                  {searchTerm || selectedPhase !== 'all' 
                    ? 'Try adjusting your search or filter criteria.'
                    : 'Get started by creating your first research project.'
                  }
                </p>
                <Button>
                  <PlusIcon className="w-4 h-4 mr-2" />
                  Create Project
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}