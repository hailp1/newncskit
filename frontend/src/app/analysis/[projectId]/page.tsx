'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useWorkflowStore } from '@/stores/workflowStore';
import { WorkflowStepper } from '@/components/workflow/WorkflowStepper';
import VariableGroupingPanel from '@/components/analysis/VariableGroupingPanel';
import DemographicSelectionPanel from '@/components/analysis/DemographicSelectionPanel';
import { AnalysisVariable, VariableGroup, DemographicVariable } from '@/types/analysis';
import ErrorBoundary from '@/components/errors/ErrorBoundary';
import { Loader2 } from 'lucide-react';

/**
 * Analysis Workflow Container Page
 * 
 * This page manages the complete analysis workflow and ensures auto-detection
 * triggers correctly when users navigate to grouping and demographic steps.
 * 
 * Key Features:
 * - Subscribes to workflow store for step changes
 * - Conditionally renders appropriate panel based on current step
 * - Forces component remount on step changes using key prop
 * - Fetches and manages project variables
 */
export default function AnalysisWorkflowPage() {
  const params = useParams();
  const projectId = params.projectId as string;
  
  // Subscribe to workflow store
  const { currentStep, completedSteps, navigateToStep, completeCurrentAndNavigate } = useWorkflowStore();
  
  // Local state
  const [variables, setVariables] = useState<AnalysisVariable[]>([]);
  const [groups, setGroups] = useState<VariableGroup[]>([]);
  const [demographics, setDemographics] = useState<DemographicVariable[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch project variables on mount
  useEffect(() => {
    async function loadProjectData() {
      try {
        setIsLoading(true);
        setError(null);
        
        // TODO: Replace with actual API call
        // const response = await fetch(`/api/projects/${projectId}/variables`);
        // const data = await response.json();
        
        // Mock data for now
        const mockVariables: AnalysisVariable[] = [
          {
            id: '1',
            projectId,
            columnName: 'age',
            dataType: 'numeric',
            isDemographic: false,
            missingCount: 0,
            uniqueCount: 50,
            minValue: 18,
            maxValue: 65,
            meanValue: 35.5,
            createdAt: new Date().toISOString()
          },
          {
            id: '2',
            projectId,
            columnName: 'gender',
            dataType: 'categorical',
            isDemographic: false,
            missingCount: 0,
            uniqueCount: 3,
            createdAt: new Date().toISOString()
          },
          {
            id: '3',
            projectId,
            columnName: 'income_level',
            dataType: 'categorical',
            isDemographic: false,
            missingCount: 5,
            uniqueCount: 5,
            createdAt: new Date().toISOString()
          },
          {
            id: '4',
            projectId,
            columnName: 'satisfaction_score',
            dataType: 'numeric',
            isDemographic: false,
            missingCount: 2,
            uniqueCount: 10,
            minValue: 1,
            maxValue: 5,
            meanValue: 3.5,
            createdAt: new Date().toISOString()
          }
        ];
        
        setVariables(mockVariables);
      } catch (err) {
        console.error('Error loading project data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load project data');
      } finally {
        setIsLoading(false);
      }
    }

    if (projectId) {
      loadProjectData();
    }
  }, [projectId]);

  // Handle save for grouping panel
  const handleGroupsSave = async () => {
    try {
      // TODO: Implement actual save to database
      console.log('Saving groups:', groups);
    } catch (error) {
      console.error('Error saving groups:', error);
    }
  };

  // Handle save for demographic panel
  const handleDemographicsSave = async () => {
    try {
      // TODO: Implement actual save to database
      console.log('Saving demographics:', demographics);
    } catch (error) {
      console.error('Error saving demographics:', error);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading project data...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center max-w-md">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-red-900 mb-2">Error Loading Project</h2>
            <p className="text-red-700">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50">
        {/* Header with Workflow Stepper */}
        <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <WorkflowStepper
              currentStep={currentStep}
              completedSteps={completedSteps}
              onStepClick={navigateToStep}
              progress={Math.round((completedSteps.length / 7) * 100)}
            />
          </div>
        </div>

        {/* Main Content Area */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Grouping Step */}
          {currentStep === 'grouping' && (
            <div key={`grouping-${currentStep}`} className="animate-in fade-in duration-300">
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Variable Grouping</h1>
                <p className="text-gray-600 mt-1">
                  Group related variables together for better analysis organization
                </p>
              </div>
              
              <VariableGroupingPanel
                variables={variables}
                initialGroups={groups}
                onGroupsChange={setGroups}
                onSave={handleGroupsSave}
              />
              
              <div className="mt-6 flex justify-between">
                <button
                  onClick={() => navigateToStep('health-check')}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Back
                </button>
                <button
                  onClick={completeCurrentAndNavigate}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Continue to Demographics
                </button>
              </div>
            </div>
          )}

          {/* Demographic Step */}
          {currentStep === 'demographic' && (
            <div key={`demographic-${currentStep}`} className="animate-in fade-in duration-300">
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Demographic Variables</h1>
                <p className="text-gray-600 mt-1">
                  Select and configure demographic variables for your analysis
                </p>
              </div>
              
              <DemographicSelectionPanel
                variables={variables}
                initialDemographics={demographics}
                onDemographicsChange={setDemographics}
                onSave={handleDemographicsSave}
              />
              
              <div className="mt-6 flex justify-between">
                <button
                  onClick={() => navigateToStep('grouping')}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Back
                </button>
                <button
                  onClick={completeCurrentAndNavigate}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Continue to Analysis Selection
                </button>
              </div>
            </div>
          )}

          {/* Other steps - placeholder for now */}
          {!['grouping', 'demographic'].includes(currentStep) && (
            <div className="text-center py-12">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                {currentStep.charAt(0).toUpperCase() + currentStep.slice(1).replace('-', ' ')}
              </h2>
              <p className="text-gray-600">
                This step is under development
              </p>
              <div className="mt-6 space-x-4">
                <button
                  onClick={() => {
                    const steps = ['upload', 'health-check', 'grouping', 'demographic', 'analysis-selection', 'execution', 'results'];
                    const currentIndex = steps.indexOf(currentStep);
                    if (currentIndex > 0) {
                      navigateToStep(steps[currentIndex - 1] as any);
                    }
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Back
                </button>
                <button
                  onClick={completeCurrentAndNavigate}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Continue
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </ErrorBoundary>
  );
}
