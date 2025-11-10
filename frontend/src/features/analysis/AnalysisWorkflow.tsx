'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { AlertCircle } from 'lucide-react';
import CSVUploader from '@/components/analysis/CSVUploader';
import DataHealthDashboard from '@/components/analysis/DataHealthDashboard';
import VariableGroupingPanel from '@/components/analysis/VariableGroupingPanel';
import DemographicSelectionPanel from '@/components/analysis/DemographicSelectionPanel';
import AnalysisSelector from '@/components/analysis/AnalysisSelector';
import AnalysisProgress from '@/components/analysis/AnalysisProgress';
import ResultsViewer from '@/components/analysis/ResultsViewer';
import { WorkflowStepper } from './components/WorkflowStepper';
import { useAnalysisWorkflowStore, WorkflowStep } from './store/workflow-store';
import { getApiUrl } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { AnalysisVariable, VariableGroup, VariableGroupSuggestion } from '@/types/analysis';

const STEP_SEQUENCE: WorkflowStep[] = ['upload', 'health', 'group', 'demographic', 'analyze', 'results'];

export function AnalysisWorkflow() {
  const {
    currentStep,
    setStep,
    setProjectContext,
    projectId,
    healthReport,
    uploadedHeaders,
    uploadedPreview,
    variables,
    setVariables,
    groups,
    setGroups,
    groupSuggestions,
    setGroupSuggestions,
    demographics,
    setDemographics,
    selectedAnalyses,
    setSelectedAnalyses,
  } = useAnalysisWorkflowStore();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showProgress, setShowProgress] = useState(false);

  const resetFeedback = () => {
    setError(null);
  };

  const fetchVariables = useCallback(
    async (targetProjectId: string) => {
      try {
        setLoading(true);
        const response = await fetch(getApiUrl(`api/analysis/variables?projectId=${targetProjectId}`), {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });

        if (!response.ok) {
          const payload = await response.json().catch(() => ({}));
          throw new Error(payload.error || 'Không thể tải danh sách biến từ máy chủ');
        }

        const payload = await response.json();
        const variablesPayload = payload.data?.variables ?? payload.variables ?? [];
        setVariables(variablesPayload);
      } catch (fetchError) {
        console.error('[Workflow] Failed to load variables:', fetchError);
        setError(fetchError instanceof Error ? fetchError.message : 'Không thể tải biến');
      } finally {
        setLoading(false);
      }
    },
    [setVariables]
  );

  const hydrateExistingProjectState = useCallback(
    async (targetProjectId: string) => {
      try {
        const response = await fetch(getApiUrl(`api/analysis/groups/load?projectId=${targetProjectId}`), {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });

        if (!response.ok) {
          // Not critical: continue without blocking workflow
          console.warn('[Workflow] Failed to hydrate project state');
          return;
        }

        const payload = await response.json();
        const data = payload.data ?? payload;
        setGroups(data.groups || []);
        setDemographics(data.demographics || []);
      } catch (hydrateError) {
        console.warn('[Workflow] Error hydrating project state:', hydrateError);
      }
    },
    [setDemographics, setGroups]
  );

  const fetchGroupSuggestions = useCallback(async () => {
    if (!projectId) return;

    try {
      setLoading(true);
      const response = await fetch(getApiUrl('api/analysis/group'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload.error || 'Không thể tạo gợi ý nhóm biến');
      }

      const payload = await response.json();
      const suggestions: VariableGroupSuggestion[] =
        payload.data?.suggestions || payload.suggestions || [];
      setGroupSuggestions(suggestions);
    } catch (suggestionError) {
      console.error('[Workflow] Failed to load grouping suggestions:', suggestionError);
      setError(suggestionError instanceof Error ? suggestionError.message : 'Không thể tải gợi ý nhóm');
    } finally {
      setLoading(false);
    }
  }, [projectId, setGroupSuggestions]);

  const handleUploadComplete = useCallback(
    async (
      uploadedProjectId: string,
      preview: any[],
      uploadHealthReport?: any,
      headers?: string[]
    ) => {
      resetFeedback();

      setProjectContext({
        projectId: uploadedProjectId,
        healthReport: uploadHealthReport || null,
        headers: headers || [],
        preview: preview || [],
      });

      await Promise.all([
        fetchVariables(uploadedProjectId),
        hydrateExistingProjectState(uploadedProjectId),
      ]);

      setStep('health');
    },
    [fetchVariables, hydrateExistingProjectState, setProjectContext, setStep]
  );

  const handleGroupsChange = useCallback(
    (updatedGroups: VariableGroup[]) => {
      setGroups(updatedGroups);
    },
    [setGroups]
  );

  const handleVariablesChange = useCallback(
    (updatedVariables: AnalysisVariable[]) => {
      setVariables(updatedVariables);
    },
    [setVariables]
  );

  const handleDemographicsChange = useCallback(
    (updatedDemographics: any[]) => {
      setDemographics(updatedDemographics);
    },
    [setDemographics]
  );

  const handleGroupSave = useCallback(async () => {
    if (!projectId) return;

    try {
      setLoading(true);
      resetFeedback();
      const response = await fetch(getApiUrl('api/analysis/groups/save'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId,
          groups,
          demographics,
        }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload.error || 'Không thể lưu cấu hình nhóm biến');
      }
    } catch (saveError) {
      console.error('[Workflow] Failed to save groups:', saveError);
      setError(saveError instanceof Error ? saveError.message : 'Không thể lưu nhóm biến');
    } finally {
      setLoading(false);
    }
  }, [demographics, groups, projectId]);

  const handleRunAnalyses = useCallback(
    async (selected: { type: string; config: any }[]) => {
      if (!projectId) return;

      try {
        setLoading(true);
        resetFeedback();
        setSelectedAnalyses(selected as any);

        const response = await fetch(getApiUrl('api/analysis/execute'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            projectId,
            analysisTypes: selected.map((item) => item.type),
          }),
        });

        if (!response.ok) {
          const payload = await response.json().catch(() => ({}));
          throw new Error(payload.error || 'Không thể bắt đầu quá trình phân tích');
        }

        setShowProgress(true);
      } catch (runError) {
        console.error('[Workflow] Failed to start analyses:', runError);
        setError(runError instanceof Error ? runError.message : 'Không thể chạy phân tích');
      } finally {
        setLoading(false);
      }
    },
    [projectId, setSelectedAnalyses]
  );

  const goToNextStep = useCallback(() => {
    const currentIndex = STEP_SEQUENCE.indexOf(currentStep);
    const nextStep = STEP_SEQUENCE[Math.min(currentIndex + 1, STEP_SEQUENCE.length - 1)];
    setStep(nextStep);
  }, [currentStep, setStep]);

  const goToPreviousStep = useCallback(() => {
    const currentIndex = STEP_SEQUENCE.indexOf(currentStep);
    const previousStep = STEP_SEQUENCE[Math.max(currentIndex - 1, 0)];
    setStep(previousStep);
  }, [currentStep, setStep]);

  useEffect(() => {
    if (currentStep === 'group' && projectId && groupSuggestions.length === 0) {
      fetchGroupSuggestions();
    }
  }, [currentStep, projectId, groupSuggestions.length, fetchGroupSuggestions]);

  const canGoBack = useMemo(() => currentStep !== 'upload', [currentStep]);

  const renderStepContent = () => {
    switch (currentStep) {
      case 'upload':
        return (
          <CSVUploader
            onUploadComplete={handleUploadComplete}
            onError={(err) => setError(err.message)}
          />
        );
      case 'health':
        if (!healthReport) {
          return (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-yellow-800">
              Không tìm thấy báo cáo chất lượng dữ liệu. Vui lòng upload lại file CSV.
            </div>
          );
        }

        return (
          <DataHealthDashboard
            healthReport={healthReport}
            onContinue={() => setStep('group')}
          />
        );
      case 'group':
        return (
          <VariableGroupingPanel
            variables={variables}
            initialGroups={groups}
            onGroupsChange={handleGroupsChange}
            onVariablesChange={handleVariablesChange}
            onSave={handleGroupSave}
            externalSuggestions={groupSuggestions}
            showSuggestions
          />
        );
      case 'demographic':
        return (
          <DemographicSelectionPanel
            variables={variables}
            initialDemographics={demographics}
            onDemographicsChange={handleDemographicsChange}
            onSave={handleGroupSave}
          />
        );
      case 'analyze':
        return showProgress && projectId ? (
          <AnalysisProgress
            projectId={projectId}
            onComplete={() => {
              setShowProgress(false);
              setStep('results');
            }}
            onError={(progressError) => {
              setShowProgress(false);
              setError(progressError);
            }}
          />
        ) : (
          <AnalysisSelector
            onSave={(selected) => handleRunAnalyses(selected)}
            onCancel={() => setShowProgress(false)}
          />
        );
      case 'results':
        return projectId ? (
          <ResultsViewer projectId={projectId} />
        ) : null;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-8">
      <WorkflowStepper currentStep={currentStep} />

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 mt-0.5" />
          <div>
            <p className="font-semibold">Đã xảy ra lỗi</p>
            <p className="text-sm">{error}</p>
          </div>
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
        {loading && (
          <p className="text-sm text-gray-500 mb-4">
            Đang xử lý... Vui lòng chờ trong giây lát.
          </p>
        )}
        {renderStepContent()}
      </div>

      <div className="flex items-center justify-between">
        <div>
          {projectId && (
            <p className="text-xs text-gray-500">
              Project ID: <span className="font-mono">{projectId}</span>
            </p>
          )}
        </div>
        <div className="flex gap-2">
          {canGoBack && (
            <Button variant="outline" onClick={goToPreviousStep}>
              Quay lại
            </Button>
          )}
          {currentStep === 'health' && (
            <Button onClick={() => setStep('group')}>
              Tiếp tục
            </Button>
          )}
          {currentStep === 'group' && (
            <Button onClick={() => setStep('demographic')}>
              Tiếp tục
            </Button>
          )}
          {currentStep === 'demographic' && (
            <Button onClick={() => setStep('analyze')}>
              Chọn phân tích
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

