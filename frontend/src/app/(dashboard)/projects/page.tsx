'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ProjectCard } from '@/components/dashboard/project-card'
import type { ProjectSummary } from '@/types'
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

  // Load projects from Supabase
  useEffect(() => {
    const loadProjects = async () => {
      try {
        // In real app, get user ID from auth
        const userId = 'demo-user-id' // Replace with actual user ID
        
        // Load projects from Supabase
        const { marketingProjectsService } = await import('@/services/marketing-projects')
        const marketingProjects = await marketingProjectsService.getUserProjects(userId)
        
        // Convert to ProjectSummary format
        const projectSummaries: ProjectSummary[] = marketingProjects.map((project: any) => ({
          id: project.id,
          title: project.title,
          phase: project.status === 'outline_generated' ? 'planning' : 'execution',
          progress: project.progress || 60,
          lastActivity: new Date(project.updated_at),
          collaboratorCount: 1, // Default for now
        }))
        
        // Combine with mock projects for demo
        setProjects([...projectSummaries, ...mockProjects])
      } catch (error) {
        console.error('Failed to load projects from Supabase:', error)
        // Fallback to mock data
        setProjects(mockProjects)
      }
    }

    loadProjects()

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
          <p className="text-gray-600">Manage and track your research projects</p>
        </div>
        <Button onClick={() => router.push('/projects/new')}>
          <PlusIcon className="w-4 h-4 mr-2" />
          New Project
        </Button>
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