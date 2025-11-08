'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  ArrowUpTrayIcon as UploadIcon, 
  EyeIcon, 
  ChartBarIcon as BarChartIcon, 
  ArrowDownTrayIcon as DownloadIcon,
  FolderIcon,
  CheckCircleIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';
import DataUpload from '@/components/analysis/data-upload';
import DataScreening from '@/components/analysis/data-screening';
import DataPreview from '@/components/analysis/data-preview';
import ReliabilityValidity from '@/components/analysis/reliability-validity';
import VariableMapping from '@/components/analysis/variable-mapping';
import ModelBuilder from '@/components/analysis/model-builder';
import StatisticalAnalysis from '@/components/analysis/statistical-analysis';
import ResultsExport from '@/components/analysis/results-export';
import { HelpText, QuickTips } from '@/components/ui/help-text';
import { ProgressBreadcrumb } from '@/components/ui/breadcrumb';

export interface DataColumn {
  name: string;
  type: 'numeric' | 'categorical' | 'ordinal' | 'text';
  role: 'independent' | 'dependent' | 'demographic' | 'control' | 'none';
  group?: string;
  description?: string;
  values?: any[];
  missing?: number;
  stats?: {
    mean?: number;
    std?: number;
    min?: number;
    max?: number;
    unique?: number;
  };
}

export interface AnalysisProject {
  id: string;
  name: string;
  description: string;
  data: any[][];
  columns: DataColumn[];
  models: ResearchModel[];
  results: AnalysisResult[];
  createdAt: string;
  updatedAt: string;
}

export interface ResearchModel {
  id: string;
  name: string;
  type: 'regression' | 'sem' | 'anova' | 'ttest' | 'correlation';
  variables: {
    independent: string[];
    dependent: string[];
    mediator?: string[];
    moderator?: string[];
  };
  hypotheses: string[];
}

export interface AnalysisResult {
  id: string;
  modelId: string;
  type: string;
  data: any;
  tables: any[];
  charts: any[];
  interpretation: string;
}

export default function DataAnalysisPage() {
  const [currentStep, setCurrentStep] = useState<'upload' | 'preview' | 'analysis' | 'results'>('upload');
  const [project, setProject] = useState<AnalysisProject | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [recentProjects, setRecentProjects] = useState<AnalysisProject[]>([]);
  
  // Enhanced project context for survey data integration
  const [projectContext, setProjectContext] = useState<any>(null);
  const [surveyMetadata, setSurveyMetadata] = useState<{
    campaignId?: string;
    surveyId?: string;
    responseCount?: number;
    collectionPeriod?: { start: Date; end: Date };
    targetSampleSize?: number;
  } | null>(null);

  // Simplified 4-step workflow: Upload → Preview → Analysis → Results
  const steps = [
    { 
      key: 'upload', 
      label: 'Upload Data', 
      description: 'Upload your data files or load from survey campaigns',
      icon: UploadIcon,
      completed: false,
      current: false
    },
    { 
      key: 'preview', 
      label: 'Preview & Validate', 
      description: 'Review data structure and validate quality',
      icon: EyeIcon,
      completed: false,
      current: false
    },
    { 
      key: 'analysis', 
      label: 'Statistical Analysis', 
      description: 'Run statistical tests and build models',
      icon: BarChartIcon,
      completed: false,
      current: false
    },
    { 
      key: 'results', 
      label: 'Results & Export', 
      description: 'View results and export reports',
      icon: DownloadIcon,
      completed: false,
      current: false
    }
  ];

  // Update step status based on current step and project state
  const getStepStatus = () => {
    return steps.map(step => ({
      ...step,
      completed: 
        (step.key === 'upload' && Boolean(project?.data)) ||
        (step.key === 'preview' && Boolean(project?.data && project?.columns)) ||
        (step.key === 'analysis' && Boolean(project?.results && project.results.length > 0)) ||
        (step.key === 'results' && Boolean(project?.results && project.results.length > 0)),
      current: step.key === currentStep
    }));
  };

  // Load recent projects on component mount
  useEffect(() => {
    const loadRecentProjects = async () => {
      try {
        const response = await fetch('/api/analysis/recent');
        if (response.ok) {
          const data = await response.json();
          setRecentProjects(data.projects || []);
        }
      } catch (error) {
        console.error('Failed to load recent projects:', error);
        setRecentProjects([]);
      }
    };

    loadRecentProjects();
  }, []);

  const handleDataUploaded = (data: any[][], columns: DataColumn[], metadata?: any) => {
    const updatedProject = {
      ...project,
      id: project?.id || Date.now().toString(),
      name: project?.name || `Analysis Project ${new Date().toLocaleDateString()}`,
      description: project?.description || 'New data analysis project',
      data,
      columns,
      models: project?.models || [],
      results: project?.results || [],
      createdAt: project?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setProject(updatedProject);
    
    // Set project context and survey metadata if provided
    if (metadata) {
      if (metadata.projectContext) {
        setProjectContext(metadata.projectContext);
      }
      if (metadata.surveyMetadata) {
        setSurveyMetadata(metadata.surveyMetadata);
      }
    }
    
    setCurrentStep('preview'); // Go to preview step
  };

  const handleStepChange = (step: 'upload' | 'preview' | 'analysis' | 'results') => {
    // Only allow navigation to completed steps or the next logical step
    const stepOrder = ['upload', 'preview', 'analysis', 'results'];
    const currentIndex = stepOrder.indexOf(currentStep);
    const targetIndex = stepOrder.indexOf(step);
    
    if (targetIndex <= currentIndex + 1 || (project && targetIndex <= stepOrder.length)) {
      setCurrentStep(step);
    }
  };

  const canProceedToStep = (step: 'upload' | 'preview' | 'analysis' | 'results'): boolean => {
    switch (step) {
      case 'upload':
        return true;
      case 'preview':
        return project?.data != null;
      case 'analysis':
        return project?.data != null && project?.columns != null;
      case 'results':
        return project?.results != null && project.results.length > 0;
      default:
        return false;
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Data Analysis</h1>
          <p className="text-gray-600">Upload data and perform statistical analysis with our integrated R engine</p>
        </div>
        
        {project && (
          <div className="text-right">
            <h3 className="font-medium">{project.name}</h3>
            <p className="text-sm text-gray-500">
              {project.data?.length || 0} rows × {project.columns?.length || 0} columns
            </p>
            <Badge variant="outline" className="mt-1">
              {currentStep.charAt(0).toUpperCase() + currentStep.slice(1)}
            </Badge>
          </div>
        )}
      </div>

      {/* Progress Steps */}
      <ProgressBreadcrumb steps={getStepStatus()} />

      {/* Help Text */}
      {currentStep === 'upload' && (
        <HelpText
          title="Getting Started with Data Analysis"
          type="info"
          content={
            <div className="space-y-2">
              <p>Our streamlined analysis workflow helps you go from raw data to insights quickly:</p>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li><strong>Upload:</strong> Load data from survey campaigns or external files</li>
                <li><strong>Preview:</strong> Validate data quality and structure</li>
                <li><strong>Analysis:</strong> Run statistical tests with our R engine</li>
                <li><strong>Results:</strong> Export professional reports and visualizations</li>
              </ul>
            </div>
          }
          dismissible
        />
      )}

      {/* Recent Projects */}
      {currentStep === 'upload' && !project && recentProjects.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FolderIcon className="h-5 w-5 mr-2" />
              Recent Analysis Projects
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recentProjects.map((recentProject) => (
                <Card key={recentProject.id} className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <h4 className="font-medium mb-1">{recentProject.name}</h4>
                    <p className="text-sm text-gray-600 mb-2">{recentProject.description}</p>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{recentProject.data?.length || 0} rows</span>
                      <span>{new Date(recentProject.updatedAt).toLocaleDateString()}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Tips */}
      {currentStep === 'upload' && (
        <QuickTips
          tips={[
            'Supported formats: CSV, Excel (.xlsx), SPSS (.sav), JSON',
            'Maximum file size: 100MB',
            'Survey data from campaigns loads automatically with proper variable mapping',
            'External data should have column headers in the first row'
          ]}
        />
      )}

      {/* Main Content */}
      <div className="space-y-6">
        {/* Upload Step */}
        {currentStep === 'upload' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <UploadIcon className="h-5 w-5 mr-2" />
                Upload Your Data
              </CardTitle>
            </CardHeader>
            <CardContent>
              <DataUpload onDataUploaded={handleDataUploaded} />
            </CardContent>
          </Card>
        )}
        
        {/* Preview Step */}
        {currentStep === 'preview' && project && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center">
                    <EyeIcon className="h-5 w-5 mr-2" />
                    Data Preview & Validation
                  </div>
                  <Button 
                    onClick={() => handleStepChange('analysis')}
                    disabled={!canProceedToStep('analysis')}
                  >
                    Proceed to Analysis
                    <ArrowRightIcon className="h-4 w-4 ml-2" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="preview" className="space-y-4">
                  <TabsList>
                    <TabsTrigger value="preview">Data Preview</TabsTrigger>
                    <TabsTrigger value="screening">Data Screening</TabsTrigger>
                    <TabsTrigger value="mapping">Variable Mapping</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="preview">
                    <DataPreview project={project} onUpdate={setProject} />
                  </TabsContent>
                  
                  <TabsContent value="screening">
                    <DataScreening 
                      project={project} 
                      onUpdate={setProject}
                      onNext={() => handleStepChange('analysis')}
                      onPrevious={() => handleStepChange('upload')}
                    />
                  </TabsContent>
                  
                  <TabsContent value="mapping">
                    <VariableMapping project={project} onUpdate={setProject} />
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        )}
        
        {/* Analysis Step */}
        {currentStep === 'analysis' && project && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center">
                    <BarChartIcon className="h-5 w-5 mr-2" />
                    Statistical Analysis
                  </div>
                  <Button 
                    onClick={() => handleStepChange('results')}
                    disabled={!canProceedToStep('results')}
                  >
                    View Results
                    <ArrowRightIcon className="h-4 w-4 ml-2" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="reliability" className="space-y-4">
                  <TabsList>
                    <TabsTrigger value="reliability">Reliability & Validity</TabsTrigger>
                    <TabsTrigger value="models">Model Building</TabsTrigger>
                    <TabsTrigger value="statistical">Statistical Tests</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="reliability">
                    <ReliabilityValidity 
                      project={project} 
                      onUpdate={setProject}
                      onNext={() => handleStepChange('results')}
                      onPrevious={() => handleStepChange('preview')}
                    />
                  </TabsContent>
                  
                  <TabsContent value="models">
                    <ModelBuilder project={project} onUpdate={setProject} />
                  </TabsContent>
                  
                  <TabsContent value="statistical">
                    <StatisticalAnalysis 
                      project={project} 
                      onUpdate={setProject}
                      projectContext={projectContext}
                      surveyMetadata={surveyMetadata}
                    />
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        )}
        
        {/* Results Step */}
        {currentStep === 'results' && project && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <DownloadIcon className="h-5 w-5 mr-2" />
                Results & Export
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResultsExport 
                project={project} 
                projectContext={projectContext}
                surveyMetadata={surveyMetadata}
              />
            </CardContent>
          </Card>
        )}
      </div>

      {/* Navigation Footer */}
      {project && (
        <Card>
          <CardContent className="p-4">
            <div className="flex justify-between items-center">
              <Button
                variant="outline"
                onClick={() => {
                  const stepOrder = ['upload', 'preview', 'analysis', 'results'];
                  const currentIndex = stepOrder.indexOf(currentStep);
                  if (currentIndex > 0) {
                    handleStepChange(stepOrder[currentIndex - 1] as any);
                  }
                }}
                disabled={currentStep === 'upload'}
              >
                Previous Step
              </Button>
              
              <div className="text-center">
                <p className="text-sm text-gray-600">
                  Step {['upload', 'preview', 'analysis', 'results'].indexOf(currentStep) + 1} of 4
                </p>
                <Progress 
                  value={(((['upload', 'preview', 'analysis', 'results'].indexOf(currentStep) + 1) / 4) * 100)} 
                  className="w-32 mt-1"
                />
              </div>
              
              <Button
                onClick={() => {
                  const stepOrder = ['upload', 'preview', 'analysis', 'results'];
                  const currentIndex = stepOrder.indexOf(currentStep);
                  if (currentIndex < stepOrder.length - 1) {
                    const nextStep = stepOrder[currentIndex + 1] as any;
                    if (canProceedToStep(nextStep)) {
                      handleStepChange(nextStep);
                    }
                  }
                }}
                disabled={currentStep === 'results' || !canProceedToStep(
                  ['upload', 'preview', 'analysis', 'results'][
                    ['upload', 'preview', 'analysis', 'results'].indexOf(currentStep) + 1
                  ] as any
                )}
              >
                Next Step
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}