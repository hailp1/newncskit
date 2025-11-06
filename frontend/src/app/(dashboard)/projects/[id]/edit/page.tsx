'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuthStore } from '@/store/auth'
// Use PostgreSQL database instead of Supabase

interface Project {
  id: number
  title: string
  description: string
  user_id: number
  status: string
  selected_models?: string[]
  business_domain?: string
  research_objectives?: string
  target_audience?: string
  methodology?: string
  timeline?: string
  budget?: string
  expected_outcomes?: string
  created_at: string
  updated_at: string
}

export default function EditProjectPage() {
  const router = useRouter()
  const params = useParams()
  const { user } = useAuthStore()
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'draft',
    business_domain: '',
    research_objectives: '',
    target_audience: '',
    methodology: '',
    timeline: '',
    budget: '',
    expected_outcomes: ''
  })

  useEffect(() => {
    if (params.id && user) {
      loadProject()
    }
  }, [params.id, user])

  const loadProject = async () => {
    try {
      setLoading(true)
      // Mock data for now - replace with actual API call
      const mockProject = {
        id: parseInt(params.id as string),
        title: 'Sample Project',
        description: 'Sample description',
        status: 'draft',
        user_id: parseInt(user?.id || '1'),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      if (!mockProject) {
        console.error('Project not found')
        router.push('/projects')
        return
      }

      if (mockProject) {
        setProject(mockProject)
        const projectData = mockProject as any;
        setFormData({
          title: projectData.title || '',
          description: projectData.description || '',
          status: projectData.status || 'draft',
          business_domain: projectData.business_domain || '',
          research_objectives: projectData.research_objectives || '',
          target_audience: projectData.target_audience || '',
          methodology: projectData.methodology || '',
          timeline: projectData.timeline || '',
          budget: projectData.budget || '',
          expected_outcomes: projectData.expected_outcomes || ''
        })
      }
    } catch (error) {
      console.error('Error loading project:', error)
      router.push('/projects')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!project) return

    try {
      setSaving(true)
      // Mock update - replace with actual API call
      console.log('Updating project:', formData);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      router.push(`/projects/${project.id}`)
    } catch (error) {
      console.error('Error updating project:', error)
      alert('Failed to update project')
    } finally {
      setSaving(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!project) {
    return (
      <Card className="p-8 text-center">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Project Not Found</h1>
        <p className="text-gray-600 mb-4">The project you're looking for doesn't exist or you don't have permission to edit it.</p>
        <Button onClick={() => router.push('/projects')}>Back to Projects</Button>
      </Card>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Edit Project</h1>
          <p className="text-gray-600">Update your research project details</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" onClick={() => router.push(`/projects/${project.id}`)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      <Card className="p-6">
        <div className="space-y-6">
          {/* Basic Information */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Project Title *
                </label>
                <Input
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Enter project title"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Describe your research project"
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="draft">Draft</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="on_hold">On Hold</option>
                </select>
              </div>
            </div>
          </div>

          {/* Research Details */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Research Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Business Domain
                </label>
                <Input
                  value={formData.business_domain}
                  onChange={(e) => handleInputChange('business_domain', e.target.value)}
                  placeholder="e.g., Healthcare, Technology, Finance"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Target Audience
                </label>
                <Input
                  value={formData.target_audience}
                  onChange={(e) => handleInputChange('target_audience', e.target.value)}
                  placeholder="e.g., Young adults, Professionals, Students"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Research Objectives
                </label>
                <textarea
                  value={formData.research_objectives}
                  onChange={(e) => handleInputChange('research_objectives', e.target.value)}
                  placeholder="What are the main objectives of this research?"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Methodology
                </label>
                <textarea
                  value={formData.methodology}
                  onChange={(e) => handleInputChange('methodology', e.target.value)}
                  placeholder="Describe your research methodology"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Project Management */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Project Management</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Timeline
                </label>
                <Input
                  value={formData.timeline}
                  onChange={(e) => handleInputChange('timeline', e.target.value)}
                  placeholder="e.g., 6 months, Q1 2024"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Budget
                </label>
                <Input
                  value={formData.budget}
                  onChange={(e) => handleInputChange('budget', e.target.value)}
                  placeholder="e.g., $10,000, 50,000 VND"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Expected Outcomes
                </label>
                <textarea
                  value={formData.expected_outcomes}
                  onChange={(e) => handleInputChange('expected_outcomes', e.target.value)}
                  placeholder="What outcomes do you expect from this research?"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Project Metadata */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Project Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
          <div>
            <span className="font-medium">Created:</span> {new Date(project.created_at).toLocaleString()}
          </div>
          <div>
            <span className="font-medium">Last Updated:</span> {new Date(project.updated_at).toLocaleString()}
          </div>
          <div>
            <span className="font-medium">Project ID:</span> {project.id}
          </div>
        </div>
      </Card>
    </div>
  )
}