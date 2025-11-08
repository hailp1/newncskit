'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import CSVUploader from '@/components/analysis/CSVUploader';
import DataHealthDashboard from '@/components/analysis/DataHealthDashboard';
import VariableGroupEditor from '@/components/analysis/VariableGroupEditor';
import DemographicConfig from '@/components/analysis/DemographicConfig';
import AnalysisSelector from '@/components/analysis/AnalysisSelector';
import AnalysisProgress from '@/components/analysis/AnalysisProgress';
import ResultsViewer from '@/components/analysis/ResultsViewer';
import { 
  DataHealthReport, 
  AnalysisVariable, 
  VariableGroup, 
  VariableGroupSuggestion,
  AnalysisType
} from '@/types/analysis';
import { CheckCircle, Circle, Loader2 } from 'lucide-react';

type WorkflowStep = 'upload' | 'health' | 'group' | 'demographic' | 'analyze' | 'results';

const steps: { id: WorkflowStep; label: string; description: string }[] = [
  { id: 'upload', label: 'Upload CSV', description: 'Upload your survey data' },
  { id: 'health', label: 'Data Health', description: 'Check data quality' },
  { id: 'group', label: 'Variable Grouping', description: 'Group related variables' },
  { id: 'demographic', label: 'Demographics', description: 'Configure demographics' },
  { id: 'analyze', label: 'Analysis', description: 'Select and run analyses' },
  { id: 'results', label: 'Results', description: 'View and export results' },
];

export default function NewAnalysisPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<WorkflowStep>('upload');
  const [projectId, setProjectId] = useState<string | null>(null);
  const [healthReport, setHealthReport] = useState<DataHealthReport | null>(null);
  const [variables, setVariables] = useState<AnalysisVariable[]>([]);
  const [groupSuggestions, setGroupSuggestions] = useState<VariableGroupSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleUploadComplete = async (uploadedProjectId: string, preview: any[]) => {
    setProjectId(uploadedProjectId);
    setLoading(true);
    setError(null);

    try {
      // Automatically run health check
      const response = await fetch('/api/analysis/health', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId: uploadedProjectId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Health check failed');
      }

      const data = await response.json();
      setHealthReport(data.healthReport);
      setVariables(data.variables || []);
      setCurrentStep('health');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadError = (err: Error) => {
    setError(err.message);
  };

  const handleHealthContinue = async () => {
    if (!projectId) {
      setError('No project ID available. Please upload a file first.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('[Grouping] Fetching suggestions for project:', projectId);
      
      // Get variable grouping suggestions
      const response = await fetch('/api/analysis/group', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId }),
      });

      console.log('[Grouping] Response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('[Grouping] API error:', errorData);
        throw new Error(errorData.error || 'Failed to get grouping suggestions');
      }

      const data = await response.json();
      console.log('[Grouping] Received data:', {
        suggestionsCount: data.suggestions?.length || 0,
        totalVariables: data.totalVariables,
        suggestedGroups: data.suggestedGroups,
      });
      
      setGroupSuggestions(data.suggestions || []);
      
      // Always move to group step, even if no suggestions
      setCurrentStep('group');
      console.log('[Grouping] Moved to group step');
    } catch (err) {
      console.error('[Grouping] Error:', err);
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleGroupsSave = async (groups: VariableGroup[]) => {
    if (!projectId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/analysis/groups/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId, groups }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save groups');
      }

      // Move to next step
      setCurrentStep('demographic');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleDemographicSave = async (demographics: any[]) => {
    if (!projectId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/analysis/demographic/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          projectId, 
          demographics: demographics.map(d => ({
            variableId: d.id,
            columnName: d.columnName,
            semanticName: d.semanticName,
            demographicType: d.demographicType,
            ranks: d.ranks,
            ordinalCategories: d.ordinalCategories,
          }))
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save demographic configuration');
      }

      // Move to next step
      setCurrentStep('analyze');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleAnalysisSelection = async (selectedAnalyses: { type: AnalysisType; config: any }[]) => {
    if (!projectId) return;

    setLoading(true);
    setError(null);

    try {
      // Save analysis configurations
      const response = await fetch('/api/analysis/config/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          projectId, 
          analyses: selectedAnalyses 
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save analysis configuration');
      }

      // Start analysis execution (don't wait for completion)
      setIsAnalyzing(true);
      setLoading(false);

      // Execute analyses in background
      fetch('/api/analysis/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          projectId,
          analysisTypes: selectedAnalyses.map(a => a.type)
        }),
      }).catch(err => {
        console.error('Analysis execution error:', err);
        setError(err.message);
        setIsAnalyzing(false);
      });

    } catch (err) {
      setError((err as Error).message);
      setLoading(false);
    }
  };

  const handleAnalysisComplete = () => {
    setIsAnalyzing(false);
    setCurrentStep('results');
  };

  const handleAnalysisError = (errorMessage: string) => {
    setIsAnalyzing(false);
    setError(errorMessage);
  };

  const getCurrentStepIndex = () => {
    return steps.findIndex(s => s.id === currentStep);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">New Analysis Project</h1>
          <p className="text-gray-600 mt-2">
            Follow the steps below to analyze your survey data
          </p>
        </div>

        {/* Workflow Stepper */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const isCompleted = index < getCurrentStepIndex();
              const isCurrent = step.id === currentStep;
              const isUpcoming = index > getCurrentStepIndex();

              return (
                <div key={step.id} className="flex items-center flex-1">
                  {/* Step Circle */}
                  <div className="flex flex-col items-center">
                    <div
                      className={`
                        w-12 h-12 rounded-full flex items-center justify-center border-2 transition-colors
                        ${isCompleted ? 'bg-green-500 border-green-500' : ''}
                        ${isCurrent ? 'bg-blue-500 border-blue-500' : ''}
                        ${isUpcoming ? 'bg-white border-gray-300' : ''}
                      `}
                    >
                      {isCompleted ? (
                        <CheckCircle className="w-6 h-6 text-white" />
                      ) : isCurrent ? (
                        <Circle className="w-6 h-6 text-white fill-current" />
                      ) : (
                        <Circle className="w-6 h-6 text-gray-400" />
                      )}
                    </div>
                    <div className="mt-2 text-center">
                      <div
                        className={`
                          text-sm font-medium
                          ${isCompleted || isCurrent ? 'text-gray-900' : 'text-gray-400'}
                        `}
                      >
                        {step.label}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {step.description}
                      </div>
                    </div>
                  </div>

                  {/* Connector Line */}
                  {index < steps.length - 1 && (
                    <div
                      className={`
                        flex-1 h-0.5 mx-4 transition-colors
                        ${isCompleted ? 'bg-green-500' : 'bg-gray-300'}
                      `}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12">
            <div className="flex flex-col items-center justify-center">
              <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
              <p className="text-lg font-medium text-gray-900">
                Analyzing your data...
              </p>
              <p className="text-sm text-gray-500 mt-2">
                This may take a few moments
              </p>
            </div>
          </div>
        )}

        {/* Step Content */}
        {!loading && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            {currentStep === 'upload' && (
              <CSVUploader
                onUploadComplete={handleUploadComplete}
                onError={handleUploadError}
              />
            )}

            {currentStep === 'health' && healthReport && (
              <DataHealthDashboard
                healthReport={healthReport}
                onContinue={handleHealthContinue}
              />
            )}

            {currentStep === 'group' && projectId && (
              <VariableGroupEditor
                projectId={projectId}
                variables={variables}
                suggestions={groupSuggestions}
                onSave={handleGroupsSave}
              />
            )}

            {currentStep === 'demographic' && projectId && (
              <DemographicConfig
                projectId={projectId}
                variables={variables}
                onSave={handleDemographicSave}
              />
            )}

            {currentStep === 'analyze' && !isAnalyzing && (
              <AnalysisSelector
                onSave={handleAnalysisSelection}
              />
            )}

            {currentStep === 'analyze' && isAnalyzing && projectId && (
              <AnalysisProgress
                projectId={projectId}
                onComplete={handleAnalysisComplete}
                onError={handleAnalysisError}
              />
            )}

            {currentStep === 'results' && projectId && (
              <ResultsViewer projectId={projectId} />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
