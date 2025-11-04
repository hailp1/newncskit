'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { MarketingProjectForm } from '@/components/projects/marketing-project-form-supabase'
import { Card, CardContent } from '@/components/ui/card'
import { CheckCircleIcon, ArrowLeftIcon } from '@heroicons/react/24/outline'
import { Button } from '@/components/ui/button'

export default function NewProjectPage() {
  const router = useRouter()
  const [showSuccess, setShowSuccess] = useState(false)
  const [createdProject, setCreatedProject] = useState<any>(null)

  const handleSuccess = (project: any) => {
    setCreatedProject(project)
    setShowSuccess(true)
    
    // Auto redirect to projects list after 3 seconds
    setTimeout(() => {
      router.push('/projects')
    }, 3000)
  }

  const handleCancel = () => {
    router.push('/projects')
  }

  if (showSuccess && createdProject) {
    return (
      <div className="space-y-6">
        <div className="flex items-center">
          <Button variant="ghost" onClick={() => router.push('/projects')}>
            <ArrowLeftIcon className="w-4 h-4 mr-2" />
            Back to Projects
          </Button>
        </div>

        <Card className="bg-green-50 border-green-200 max-w-2xl mx-auto">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircleIcon className="w-8 h-8 text-green-600" />
              </div>
              
              <div>
                <h2 className="text-xl font-bold text-green-800 mb-2">
                  Project Created Successfully!
                </h2>
                <p className="text-green-700">
                  Your research project "{createdProject.title}" has been created and is ready for collaboration.
                </p>
              </div>

              <div className="bg-white rounded-lg p-4 text-left">
                <h3 className="font-medium text-gray-900 mb-2">Project Details:</h3>
                <div className="space-y-1 text-sm text-gray-600">
                  <div><strong>Title:</strong> {createdProject.title}</div>
                  <div><strong>Domain:</strong> {createdProject.research_domain}</div>
                  <div><strong>Status:</strong> {createdProject.status}</div>
                  <div><strong>Created:</strong> {new Date(createdProject.created_at).toLocaleDateString()}</div>
                </div>
              </div>

              <div className="flex gap-3 justify-center">
                <Button onClick={() => router.push(`/projects/${createdProject.id}`)}>
                  View Project
                </Button>
                <Button variant="outline" onClick={() => router.push('/projects')}>
                  All Projects
                </Button>
              </div>

              <p className="text-sm text-green-600">
                Redirecting to projects list in 3 seconds...
              </p>
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
      </div>

      <div>
        <h1 className="text-2xl font-bold text-gray-900">Create New Project</h1>
        <p className="text-gray-600">
          Start a new research project and invite collaborators to join your work.
        </p>
      </div>

      {/* Form */}
      <div className="flex justify-center">
        <MarketingProjectForm
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      </div>
    </div>
  )
}