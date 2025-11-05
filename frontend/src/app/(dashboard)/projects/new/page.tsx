'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { MarketingProjectForm } from '@/components/projects/marketing-project-form-supabase'
import { ResearchDesignStep } from '@/components/projects/research-design-step'
import { DataCollectionStep } from '@/components/projects/data-collection-step'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { CheckCircleIcon, ArrowLeftIcon, ClipboardDocumentListIcon, BeakerIcon, ChartBarIcon } from '@heroicons/react/24/outline'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { EnhancedProject, ResearchDesign, DataCollectionConfig } from '@/types/workflow'

interface ProjectFormData {
  basicInfo?: any
  researchDesign?: ResearchDesign
  dataCollection?: DataCollectionConfig
}

export default function NewProjectPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState<'basic' | 'research' | 'data'>('basic')
  const [showSuccess, setShowSuccess] = useState(false)
  const [createdProject, setCreatedProject] = useState<any>(null)
  const [formData, setFormData] = useState<ProjectFormData>({})

  // Calculate progress based on completed steps
  const getProgress = () => {
    let progress = 0
    if (formData.basicInfo) progress += 33
    if (formData.researchDesign) progress += 33
    if (formData.dataCollection) progress += 34
    return progress
  }

  const getStepStatus = (step: string) => {
    switch (step) {
      case 'basic':
        return formData.basicInfo ? 'completed' : currentStep === 'basic' ? 'current' : 'pending'
      case 'research':
        return formData.researchDesign ? 'completed' : currentStep === 'research' ? 'current' : 'pending'
      case 'data':
        return formData.dataCollection ? 'completed' : currentStep === 'data' ? 'current' : 'pending'
      default:
        return 'pending'
    }
  }

  const handleBasicInfoSuccess = (project: any) => {
    setFormData(prev => ({ ...prev, basicInfo: project }))
    setCurrentStep('research')
  }

  const handleResearchDesignComplete = (researchDesign: ResearchDesign) => {
    setFormData(prev => ({ ...prev, researchDesign }))
    setCurrentStep('data')
  }

  const handleDataCollectionComplete = (dataCollection: DataCollectionConfig) => {
    setFormData(prev => ({ ...prev, dataCollection }))
    
    // Create the complete project
    const completeProject = {
      ...formData.basicInfo,
      research_design: formData.researchDesign,
      data_collection: dataCollection,
      progress_tracking: {
        currentStage: 'idea_complete',
        completedMilestones: [],
        timeline: []
      }
    }
    
    setCreatedProject(completeProject)
    setShowSuccess(true)
    
    // Auto redirect to projects list after 3 seconds
    setTimeout(() => {
      router.push('/projects')
    }, 3000)
  }

  const handleCancel = () => {
    router.push('/projects')
  }

  const handleStepClick = (step: 'basic' | 'research' | 'data') => {
    // Only allow navigation to completed steps or the next step
    if (step === 'basic' || 
        (step === 'research' && formData.basicInfo) ||
        (step === 'data' && formData.basicInfo && formData.researchDesign)) {
      setCurrentStep(step)
    }
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
                  Your research project "{createdProject.title}" has been created with complete research design and data collection plan.
                </p>
              </div>

              <div className="bg-white rounded-lg p-4 text-left">
                <h3 className="font-medium text-gray-900 mb-2">Project Details:</h3>
                <div className="space-y-1 text-sm text-gray-600">
                  <div><strong>Title:</strong> {createdProject.title}</div>
                  <div><strong>Domain:</strong> {createdProject.research_domain}</div>
                  <div><strong>Status:</strong> {createdProject.status}</div>
                  <div><strong>Research Variables:</strong> {createdProject.research_design?.researchVariables?.length || 0}</div>
                  <div><strong>Data Collection:</strong> {createdProject.data_collection?.collectionMethod || 'Not specified'}</div>
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
          Follow our 3-step process to create a comprehensive research project with integrated survey capabilities.
        </p>
      </div>

      {/* Progress Indicator */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Project Creation Progress</CardTitle>
            <Badge variant="outline">{Math.round(getProgress())}% Complete</Badge>
          </div>
          <Progress value={getProgress()} className="w-full" />
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center">
            <div 
              className={`flex items-center space-x-2 cursor-pointer p-2 rounded-lg transition-colors ${
                getStepStatus('basic') === 'current' ? 'bg-blue-50 text-blue-700' :
                getStepStatus('basic') === 'completed' ? 'bg-green-50 text-green-700' :
                'text-gray-500'
              }`}
              onClick={() => handleStepClick('basic')}
            >
              <ClipboardDocumentListIcon className="w-5 h-5" />
              <span className="font-medium">Basic Info</span>
              {getStepStatus('basic') === 'completed' && <CheckCircleIcon className="w-4 h-4" />}
            </div>
            
            <div className="flex-1 h-px bg-gray-200 mx-4" />
            
            <div 
              className={`flex items-center space-x-2 cursor-pointer p-2 rounded-lg transition-colors ${
                getStepStatus('research') === 'current' ? 'bg-blue-50 text-blue-700' :
                getStepStatus('research') === 'completed' ? 'bg-green-50 text-green-700' :
                'text-gray-500'
              } ${!formData.basicInfo ? 'cursor-not-allowed opacity-50' : ''}`}
              onClick={() => handleStepClick('research')}
            >
              <BeakerIcon className="w-5 h-5" />
              <span className="font-medium">Research Design</span>
              {getStepStatus('research') === 'completed' && <CheckCircleIcon className="w-4 h-4" />}
            </div>
            
            <div className="flex-1 h-px bg-gray-200 mx-4" />
            
            <div 
              className={`flex items-center space-x-2 cursor-pointer p-2 rounded-lg transition-colors ${
                getStepStatus('data') === 'current' ? 'bg-blue-50 text-blue-700' :
                getStepStatus('data') === 'completed' ? 'bg-green-50 text-green-700' :
                'text-gray-500'
              } ${!formData.basicInfo || !formData.researchDesign ? 'cursor-not-allowed opacity-50' : ''}`}
              onClick={() => handleStepClick('data')}
            >
              <ChartBarIcon className="w-5 h-5" />
              <span className="font-medium">Data Collection</span>
              {getStepStatus('data') === 'completed' && <CheckCircleIcon className="w-4 h-4" />}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Step Content */}
      <Tabs value={currentStep} onValueChange={(value) => handleStepClick(value as any)}>
        <TabsList className="hidden" />
        
        <TabsContent value="basic" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <ClipboardDocumentListIcon className="w-5 h-5" />
                <span>Step 1: Basic Project Information</span>
              </CardTitle>
              <p className="text-gray-600">
                Provide the fundamental details about your research project including title, description, and research domain.
              </p>
            </CardHeader>
            <CardContent>
              <MarketingProjectForm
                onSuccess={handleBasicInfoSuccess}
                onCancel={handleCancel}
                hideNavigation={true}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="research" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BeakerIcon className="w-5 h-5" />
                <span>Step 2: Research Design</span>
              </CardTitle>
              <p className="text-gray-600">
                Define your theoretical framework, research variables, and hypotheses to create a solid foundation for your study.
              </p>
            </CardHeader>
            <CardContent>
              <ResearchDesignStep
                projectData={formData.basicInfo}
                onComplete={handleResearchDesignComplete}
                onBack={() => setCurrentStep('basic')}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="data" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <ChartBarIcon className="w-5 h-5" />
                <span>Step 3: Data Collection Setup</span>
              </CardTitle>
              <p className="text-gray-600">
                Configure your data collection method, create surveys, and set up campaigns to gather research data.
              </p>
            </CardHeader>
            <CardContent>
              <DataCollectionStep
                projectData={formData.basicInfo}
                researchDesign={formData.researchDesign}
                onComplete={handleDataCollectionComplete}
                onBack={() => setCurrentStep('research')}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}