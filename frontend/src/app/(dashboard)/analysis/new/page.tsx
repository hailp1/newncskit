'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import CSVUploader from '@/components/analysis/CSVUploader';
import DataHealthDashboard from '@/components/analysis/DataHealthDashboard';
import VariableGroupingPanel from '@/components/analysis/VariableGroupingPanel';
import DemographicSelectionPanel from '@/components/analysis/DemographicSelectionPanel';
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
import { CheckCircle, Circle, Loader2, AlertCircle } from 'lucide-react';
import { getApiUrl } from '@/lib/api-client';
import { workflowLogger } from '@/services/workflow-logger.service';
import { featureFlags } from '@/config/feature-flags';

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
  const [groups, setGroups] = useState<VariableGroup[]>([]);
  const [demographics, setDemographics] = useState<any[]>([]);
  const [groupSuggestions, setGroupSuggestions] = useState<VariableGroupSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [uploadedHeaders, setUploadedHeaders] = useState<string[]>([]);
  const [uploadedPreview, setUploadedPreview] = useState<any[]>([]);
  
  // Auto-continue state
  const [autoContinueLoading, setAutoContinueLoading] = useState(false);
  const [autoContinueError, setAutoContinueError] = useState<string | null>(null);
  const [showSuccessIndicator, setShowSuccessIndicator] = useState(false);
  const [userInteracted, setUserInteracted] = useState(false);
  const autoContinueTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hasAutoFetchedRef = useRef(false);
  const correlationIdRef = useRef<string>('');
  const previousStepRef = useRef<WorkflowStep>('upload');
  
  // Manual override state (Task 12: Requirements 5.1, 5.2, 5.3, 5.4, 5.5)
  const [hasSkippedAutoGrouping, setHasSkippedAutoGrouping] = useState(false);
  const [isRefreshingSuggestions, setIsRefreshingSuggestions] = useState(false);
  
  // Task 15: Backward compatibility state (Requirements 10.1, 10.2, 10.3, 10.4, 10.5)
  const [isExistingProject, setIsExistingProject] = useState(false);
  const [hasSavedGroups, setHasSavedGroups] = useState(false);
  const [isCheckingProjectState, setIsCheckingProjectState] = useState(false);

  // Task 14: Initialize workflow logging session (Requirement 9.1)
  useEffect(() => {
    const sessionId = workflowLogger.startSession('upload');
    console.log('[Workflow] Session initialized', { sessionId });

    // Cleanup on unmount
    return () => {
      workflowLogger.endSession(true, { reason: 'Component unmounted' });
    };
  }, []);

  const handleUploadComplete = async (uploadedProjectId: string, preview: any[], uploadHealthReport?: DataHealthReport, headers?: string[]) => {
    setProjectId(uploadedProjectId);
    
    // Store headers and preview for grouping
    if (headers) setUploadedHeaders(headers);
    if (preview) setUploadedPreview(preview);
    
    // Task 15: Check if this is an existing project (Requirements 10.1, 10.2)
    await checkProjectState(uploadedProjectId);
    
    // Task 14: Log step transition (Requirement 9.1)
    workflowLogger.logStepTransition('upload', 'health', {
      projectId: uploadedProjectId,
      hasHealthReport: !!uploadHealthReport,
      variableCount: headers?.length || 0,
    });
    
    // If health report is provided from upload, use it directly
    if (uploadHealthReport) {
      setHealthReport(uploadHealthReport);
      setCurrentStep('health');
      return;
    }

    // Otherwise, fetch health report separately
    setLoading(true);
    setError(null);

    // Task 14: Generate correlation ID and log API call start (Requirement 9.2)
    const correlationId = workflowLogger.generateCorrelationId('health-check');
    workflowLogger.logAPICallStart('api/analysis/health', 'POST', correlationId, {
      projectId: uploadedProjectId,
    });

    try {
      // Automatically run health check
      const response = await fetch(getApiUrl('api/analysis/health'), {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-Correlation-ID': correlationId,
        },
        body: JSON.stringify({ projectId: uploadedProjectId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        const error = new Error(errorData.error || 'Health check failed');
        
        // Task 14: Log API call error (Requirement 9.4)
        workflowLogger.logAPICallError('api/analysis/health', 'POST', correlationId, error, {
          status: response.status,
          errorData,
        });
        
        throw error;
      }

      const data = await response.json();
      
      // Task 14: Log API call completion (Requirement 9.2, 9.3)
      workflowLogger.logAPICallComplete('api/analysis/health', 'POST', correlationId, response.status, true, {
        variableCount: data.variables?.length || 0,
        hasHealthReport: !!data.healthReport,
      });
      
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

  // Generate correlation ID for logging
  const generateCorrelationId = () => {
    return `auto-continue-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
  };

  // Task 15: Check if project has saved groups (Requirements 10.1, 10.2)
  const checkProjectState = async (projectId: string) => {
    setIsCheckingProjectState(true);
    
    try {
      console.log('[Backward Compatibility] Checking project state', {
        projectId,
        timestamp: new Date().toISOString()
      });

      const response = await fetch(getApiUrl(`api/analysis/groups/load?projectId=${projectId}`), {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        console.warn('[Backward Compatibility] Failed to check project state, assuming new project');
        setIsExistingProject(false);
        setHasSavedGroups(false);
        return;
      }

      const data = await response.json();
      
      console.log('[Backward Compatibility] Project state checked', {
        projectId,
        isExistingProject: data.isExistingProject,
        hasGroups: data.hasGroups,
        hasDemographics: data.hasDemographics,
        groupCount: data.groups?.length || 0,
        timestamp: new Date().toISOString()
      });

      setIsExistingProject(data.isExistingProject);
      setHasSavedGroups(data.hasGroups);

      // Task 15: Load saved groups for existing projects (Requirement 10.3)
      if (data.hasGroups && data.groups.length > 0) {
        console.log('[Backward Compatibility] Loading saved groups', {
          groupCount: data.groups.length,
          timestamp: new Date().toISOString()
        });
        setGroups(data.groups);
      }

      // Load saved demographics if available
      if (data.hasDemographics && data.demographics.length > 0) {
        console.log('[Backward Compatibility] Loading saved demographics', {
          demographicCount: data.demographics.length,
          timestamp: new Date().toISOString()
        });
        setDemographics(data.demographics);
      }

    } catch (err) {
      console.error('[Backward Compatibility] Error checking project state:', err);
      // On error, assume new project to allow workflow to continue
      setIsExistingProject(false);
      setHasSavedGroups(false);
    } finally {
      setIsCheckingProjectState(false);
    }
  };

  // Task 13: Handle back navigation during auto-continue (Requirement 6.3, 6.4)
  useEffect(() => {
    // Detect backward navigation
    const isBackwardNavigation = 
      previousStepRef.current && 
      steps.findIndex(s => s.id === currentStep) < steps.findIndex(s => s.id === previousStepRef.current);
    
    if (isBackwardNavigation) {
      console.log('[Auto-Continue] Backward navigation detected, cancelling auto-continue', {
        from: previousStepRef.current,
        to: currentStep,
        timestamp: new Date().toISOString()
      });
      
      // Cancel any pending auto-continue
      if (autoContinueTimeoutRef.current) {
        clearTimeout(autoContinueTimeoutRef.current);
        autoContinueTimeoutRef.current = null;
      }
      
      // Reset auto-continue state
      setAutoContinueLoading(false);
      setAutoContinueError(null);
      setShowSuccessIndicator(false);
    }
    
    // Update previous step
    previousStepRef.current = currentStep;
  }, [currentStep]);

  // Task 13: Update URL on step transition (Requirement 6.5)
  // Task 14: Log step transitions (Requirement 9.1, 9.3)
  useEffect(() => {
    // Update URL with current step
    const url = new URL(window.location.href);
    url.searchParams.set('step', currentStep);
    
    // Use router.replace to update URL without adding to history
    router.replace(url.pathname + url.search, { scroll: false });
    
    // Task 14: Log step transition with previous step tracking
    if (previousStepRef.current !== currentStep) {
      workflowLogger.logStepTransition(
        previousStepRef.current === currentStep ? null : previousStepRef.current,
        currentStep,
        {
          url: url.pathname + url.search,
          projectId,
        }
      );
    }
  }, [currentStep, router, projectId]);

  // Auto-continue from health to grouping
  useEffect(() => {
    // Task 15: Check feature flag (Requirement 10.5)
    const autoContinueEnabled = featureFlags.enableAutoContinue;
    
    // Task 15: Check if auto-continue should be skipped for existing projects (Requirements 10.1, 10.2)
    const shouldSkipForExistingProject = isExistingProject && !featureFlags.enableAutoContinueForExistingProjects;
    
    if (shouldSkipForExistingProject) {
      console.log('[Auto-Continue] Skipping auto-continue for existing project', {
        projectId,
        isExistingProject,
        hasSavedGroups,
        timestamp: new Date().toISOString()
      });
    }
    
    // Only auto-continue if:
    // 1. We're on the health step
    // 2. Health report is available
    // 3. We haven't already fetched grouping suggestions
    // 4. User hasn't manually interacted
    // 5. This is a new project (not returning to health step)
    // 6. User hasn't skipped auto-grouping (Task 12: Requirement 5.4)
    // 7. Feature flag is enabled (Task 15: Requirement 10.5)
    // 8. Not an existing project OR existing projects are allowed (Task 15: Requirements 10.1, 10.2)
    if (
      currentStep === 'health' && 
      healthReport && 
      !hasAutoFetchedRef.current &&
      !userInteracted &&
      !hasSkippedAutoGrouping &&
      projectId &&
      autoContinueEnabled &&
      !shouldSkipForExistingProject
    ) {
      // Generate correlation ID for this auto-continue session
      correlationIdRef.current = generateCorrelationId();
      
      console.log('[Auto-Continue] Starting auto-continue workflow', {
        correlationId: correlationIdRef.current,
        timestamp: new Date().toISOString(),
        projectId,
        step: 'health',
        isExistingProject,
        autoContinueEnabled,
      });

      // Task 13: Wait 2 seconds to allow user to review health results (Requirement 6.1)
      autoContinueTimeoutRef.current = setTimeout(() => {
        if (!userInteracted) {
          console.log('[Auto-Continue] Triggering grouping API call', {
            correlationId: correlationIdRef.current,
            timestamp: new Date().toISOString()
          });
          
          hasAutoFetchedRef.current = true;
          handleHealthContinueAuto();
        } else {
          console.log('[Auto-Continue] Cancelled due to user interaction', {
            correlationId: correlationIdRef.current,
            timestamp: new Date().toISOString()
          });
        }
      }, 2000);
    }

    // Cleanup timeout on unmount or step change
    return () => {
      if (autoContinueTimeoutRef.current) {
        clearTimeout(autoContinueTimeoutRef.current);
      }
    };
  }, [currentStep, healthReport, userInteracted, hasSkippedAutoGrouping, projectId, isExistingProject, hasSavedGroups]);

  // Task 13: Detect user interaction with health dashboard (Requirement 6.2)
  useEffect(() => {
    const handleUserInteraction = (event: Event) => {
      // Only track interactions when on health step and auto-continue is pending
      if (currentStep === 'health' && autoContinueTimeoutRef.current) {
        console.log('[Auto-Continue] User interaction detected, cancelling auto-continue', {
          eventType: event.type,
          timestamp: new Date().toISOString(),
          correlationId: correlationIdRef.current
        });
        
        setUserInteracted(true);
        
        // Cancel the pending auto-continue
        if (autoContinueTimeoutRef.current) {
          clearTimeout(autoContinueTimeoutRef.current);
          autoContinueTimeoutRef.current = null;
        }
      }
    };

    // Listen for clicks, scrolls, or key presses
    window.addEventListener('click', handleUserInteraction);
    window.addEventListener('scroll', handleUserInteraction);
    window.addEventListener('keydown', handleUserInteraction);

    return () => {
      window.removeEventListener('click', handleUserInteraction);
      window.removeEventListener('scroll', handleUserInteraction);
      window.removeEventListener('keydown', handleUserInteraction);
    };
  }, [currentStep]);

  // Auto-continue handler (separate from manual continue)
  const handleHealthContinueAuto = async () => {
    if (!projectId) {
      console.error('[Auto-Continue] No project ID available', {
        correlationId: correlationIdRef.current,
        timestamp: new Date().toISOString()
      });
      return;
    }

    setAutoContinueLoading(true);
    setAutoContinueError(null);

    // Task 14: Log API call start (Requirement 9.2)
    workflowLogger.logAPICallStart('api/analysis/group', 'POST', correlationIdRef.current, {
      projectId,
      headerCount: uploadedHeaders.length,
      previewRowCount: uploadedPreview.length,
      trigger: 'auto-continue',
    });

    try {
      console.log('[Auto-Continue] Calling grouping API', {
        correlationId: correlationIdRef.current,
        timestamp: new Date().toISOString(),
        projectId,
        endpoint: 'api/analysis/group'
      });
      
      const response = await fetch(getApiUrl('api/analysis/group'), {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-Correlation-ID': correlationIdRef.current
        },
        body: JSON.stringify({ 
          projectId,
          headers: uploadedHeaders,
          preview: uploadedPreview
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        const error = new Error(errorData.error || 'Failed to fetch grouping suggestions. Please try again.');
        
        // Task 14: Log API call error (Requirement 9.4)
        workflowLogger.logAPICallError('api/analysis/group', 'POST', correlationIdRef.current, error, {
          status: response.status,
          errorData,
          trigger: 'auto-continue',
        });
        
        throw error;
      }

      const data = await response.json();
      
      // Task 14: Log API call completion (Requirement 9.2, 9.3)
      workflowLogger.logAPICallComplete('api/analysis/group', 'POST', correlationIdRef.current, response.status, true, {
        suggestionsCount: data.suggestions?.length || 0,
        totalVariables: data.totalVariables,
        suggestedGroups: data.suggestedGroups,
        trigger: 'auto-continue',
      });
      
      // Task 15: Don't override saved groups with new suggestions (Requirement 10.4)
      if (!hasSavedGroups) {
        console.log('[Auto-Continue] Setting grouping suggestions', {
          suggestionsCount: data.suggestions?.length || 0,
          timestamp: new Date().toISOString()
        });
        setGroupSuggestions(data.suggestions || []);
      } else {
        console.log('[Auto-Continue] Skipping suggestions - project has saved groups', {
          savedGroupCount: groups.length,
          timestamp: new Date().toISOString()
        });
      }
      
      // Show brief success indicator
      setShowSuccessIndicator(true);
      setTimeout(() => {
        setShowSuccessIndicator(false);
        setCurrentStep('group');
        
        // Task 14: Log step transition (Requirement 9.1)
        workflowLogger.logStepTransition('health', 'group', {
          trigger: 'auto-continue',
          suggestionsCount: data.suggestions?.length || 0,
          hasSavedGroups,
        });
      }, 800);
      
    } catch (err) {
      const error = err as Error;
      
      // Task 14: Log error (Requirement 9.4)
      workflowLogger.logError(error, 'Auto-continue grouping', correlationIdRef.current, {
        projectId,
        trigger: 'auto-continue',
      });
      
      setAutoContinueError(error.message);
    } finally {
      setAutoContinueLoading(false);
    }
  };

  // Retry handler for auto-continue errors
  const handleRetryAutoContinue = () => {
    console.log('[Auto-Continue] Retry requested', {
      correlationId: correlationIdRef.current,
      timestamp: new Date().toISOString()
    });
    
    // Generate new correlation ID for retry
    correlationIdRef.current = generateCorrelationId();
    setAutoContinueError(null);
    handleHealthContinueAuto();
  };

  // Skip auto-grouping handler (Task 12: Requirements 5.1, 5.2, 5.3)
  const handleSkipAutoGrouping = () => {
    console.log('[Manual Override] User skipped auto-grouping', {
      timestamp: new Date().toISOString(),
      projectId
    });
    
    // Clear suggestions and mark as skipped
    setGroupSuggestions([]);
    setHasSkippedAutoGrouping(true);
    setAutoContinueError(null);
    
    // Prevent future auto-fetch
    hasAutoFetchedRef.current = true;
  };

  // Refresh suggestions handler (Task 12: Requirements 5.5)
  const handleRefreshSuggestions = async () => {
    if (!projectId) {
      setError('No project ID available. Please upload a file first.');
      return;
    }

    console.log('[Manual Override] User requested refresh suggestions', {
      timestamp: new Date().toISOString(),
      projectId
    });

    setIsRefreshingSuggestions(true);
    setError(null);

    // Task 14: Generate correlation ID and log API call start (Requirement 9.2)
    const correlationId = workflowLogger.generateCorrelationId('refresh-suggestions');
    workflowLogger.logAPICallStart('api/analysis/group', 'POST', correlationId, {
      projectId,
      headerCount: uploadedHeaders.length,
      previewRowCount: uploadedPreview.length,
      trigger: 'refresh',
    });

    try {
      const response = await fetch(getApiUrl('api/analysis/group'), {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-Correlation-ID': correlationId,
        },
        body: JSON.stringify({ 
          projectId,
          headers: uploadedHeaders,
          preview: uploadedPreview
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        const error = new Error(errorData.error || 'Failed to refresh grouping suggestions');
        
        // Task 14: Log API call error (Requirement 9.4)
        workflowLogger.logAPICallError('api/analysis/group', 'POST', correlationId, error, {
          status: response.status,
          errorData,
          trigger: 'refresh',
        });
        
        throw error;
      }

      const data = await response.json();
      
      // Task 14: Log API call completion (Requirement 9.2, 9.3)
      workflowLogger.logAPICallComplete('api/analysis/group', 'POST', correlationId, response.status, true, {
        suggestionsCount: data.suggestions?.length || 0,
        totalVariables: data.totalVariables,
        suggestedGroups: data.suggestedGroups,
        trigger: 'refresh',
      });
      
      console.log('[Manual Override] Refresh successful', {
        timestamp: new Date().toISOString(),
        suggestionsCount: data.suggestions?.length || 0
      });
      
      setGroupSuggestions(data.suggestions || []);
      setHasSkippedAutoGrouping(false); // Reset skip flag
    } catch (err) {
      const error = err as Error;
      
      // Task 14: Log error (Requirement 9.4)
      workflowLogger.logError(error, 'Refresh suggestions', correlationId, {
        projectId,
        trigger: 'refresh',
      });
      
      console.error('[Manual Override] Refresh error:', err);
      setError(error.message);
    } finally {
      setIsRefreshingSuggestions(false);
    }
  };

  const handleHealthContinue = async () => {
    if (!projectId) {
      setError('No project ID available. Please upload a file first.');
      return;
    }

    setLoading(true);
    setError(null);

    // Task 14: Generate correlation ID and log API call start (Requirement 9.2)
    const correlationId = workflowLogger.generateCorrelationId('grouping-manual');
    workflowLogger.logAPICallStart('api/analysis/group', 'POST', correlationId, {
      projectId,
      headerCount: uploadedHeaders.length,
      previewRowCount: uploadedPreview.length,
      trigger: 'manual',
    });

    try {
      console.log('[Grouping] Fetching suggestions for project:', projectId);
      
      // Get variable grouping suggestions with real data
      const response = await fetch(getApiUrl('api/analysis/group'), {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-Correlation-ID': correlationId,
        },
        body: JSON.stringify({ 
          projectId,
          headers: uploadedHeaders,
          preview: uploadedPreview
        }),
      });

      console.log('[Grouping] Response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        const error = new Error(errorData.error || 'Failed to get grouping suggestions');
        
        // Task 14: Log API call error (Requirement 9.4)
        workflowLogger.logAPICallError('api/analysis/group', 'POST', correlationId, error, {
          status: response.status,
          errorData,
          trigger: 'manual',
        });
        
        throw error;
      }

      const data = await response.json();
      
      // Task 14: Log API call completion (Requirement 9.2, 9.3)
      workflowLogger.logAPICallComplete('api/analysis/group', 'POST', correlationId, response.status, true, {
        suggestionsCount: data.suggestions?.length || 0,
        totalVariables: data.totalVariables,
        suggestedGroups: data.suggestedGroups,
        trigger: 'manual',
      });
      
      console.log('[Grouping] Received data:', {
        suggestionsCount: data.suggestions?.length || 0,
        totalVariables: data.totalVariables,
        suggestedGroups: data.suggestedGroups,
      });
      
      setGroupSuggestions(data.suggestions || []);
      
      // Always move to group step, even if no suggestions
      setCurrentStep('group');
      
      // Task 14: Log step transition (Requirement 9.1)
      workflowLogger.logStepTransition('health', 'group', {
        trigger: 'manual',
        suggestionsCount: data.suggestions?.length || 0,
      });
      
      console.log('[Grouping] Moved to group step');
    } catch (err) {
      const error = err as Error;
      
      // Task 14: Log error (Requirement 9.4)
      workflowLogger.logError(error, 'Manual grouping', correlationId, {
        projectId,
        trigger: 'manual',
      });
      
      console.error('[Grouping] Error:', err);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGroupsChange = (updatedGroups: VariableGroup[]) => {
    setGroups(updatedGroups);
  };

  const handleGroupsSave = async () => {
    if (!projectId) return;

    setLoading(true);
    setError(null);

    // Task 14: Generate correlation ID and log API call start (Requirement 9.2)
    const correlationId = workflowLogger.generateCorrelationId('save-groups');
    workflowLogger.logAPICallStart('api/analysis/groups/save', 'POST', correlationId, {
      projectId,
      groupCount: groups.length,
      demographicCount: demographics.length,
    });

    try {
      const response = await fetch(getApiUrl('api/analysis/groups/save'), {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-Correlation-ID': correlationId,
        },
        body: JSON.stringify({ projectId, groups, demographics }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        const error = new Error(errorData.error || 'Failed to save groups');
        
        // Task 14: Log API call error (Requirement 9.4)
        workflowLogger.logAPICallError('api/analysis/groups/save', 'POST', correlationId, error, {
          status: response.status,
          errorData,
        });
        
        throw error;
      }

      // Task 14: Log API call completion (Requirement 9.2, 9.3)
      workflowLogger.logAPICallComplete('api/analysis/groups/save', 'POST', correlationId, response.status, true, {
        groupCount: groups.length,
        demographicCount: demographics.length,
      });

      // Move to next step
      setCurrentStep('demographic');
      
      // Task 14: Log step transition (Requirement 9.1)
      workflowLogger.logStepTransition('group', 'demographic', {
        groupCount: groups.length,
      });
    } catch (err) {
      const error = err as Error;
      
      // Task 14: Log error (Requirement 9.4)
      workflowLogger.logError(error, 'Save groups', correlationId, {
        projectId,
        groupCount: groups.length,
      });
      
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDemographicsChange = (updatedDemographics: any[]) => {
    setDemographics(updatedDemographics);
  };

  const handleDemographicSave = async () => {
    if (!projectId) return;

    setLoading(true);
    setError(null);

    // Task 14: Generate correlation ID and log API call start (Requirement 9.2)
    const correlationId = workflowLogger.generateCorrelationId('save-demographics');
    workflowLogger.logAPICallStart('api/analysis/demographic/save', 'POST', correlationId, {
      projectId,
      demographicCount: demographics.length,
    });

    try {
      const response = await fetch(getApiUrl('api/analysis/demographic/save'), {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-Correlation-ID': correlationId,
        },
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
        const error = new Error(errorData.error || 'Failed to save demographic configuration');
        
        // Task 14: Log API call error (Requirement 9.4)
        workflowLogger.logAPICallError('api/analysis/demographic/save', 'POST', correlationId, error, {
          status: response.status,
          errorData,
        });
        
        throw error;
      }

      // Task 14: Log API call completion (Requirement 9.2, 9.3)
      workflowLogger.logAPICallComplete('api/analysis/demographic/save', 'POST', correlationId, response.status, true, {
        demographicCount: demographics.length,
      });

      // Move to next step
      setCurrentStep('analyze');
      
      // Task 14: Log step transition (Requirement 9.1)
      workflowLogger.logStepTransition('demographic', 'analyze', {
        demographicCount: demographics.length,
      });
    } catch (err) {
      const error = err as Error;
      
      // Task 14: Log error (Requirement 9.4)
      workflowLogger.logError(error, 'Save demographics', correlationId, {
        projectId,
        demographicCount: demographics.length,
      });
      
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAnalysisSelection = async (selectedAnalyses: { type: AnalysisType; config: any }[]) => {
    if (!projectId) return;

    setLoading(true);
    setError(null);

    // Task 14: Generate correlation ID and log API call start (Requirement 9.2)
    const correlationId = workflowLogger.generateCorrelationId('save-analysis-config');
    workflowLogger.logAPICallStart('api/analysis/config/save', 'POST', correlationId, {
      projectId,
      analysisCount: selectedAnalyses.length,
      analysisTypes: selectedAnalyses.map(a => a.type),
    });

    try {
      // Save analysis configurations
      const response = await fetch(getApiUrl('api/analysis/config/save'), {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-Correlation-ID': correlationId,
        },
        body: JSON.stringify({ 
          projectId, 
          analyses: selectedAnalyses 
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        const error = new Error(errorData.error || 'Failed to save analysis configuration');
        
        // Task 14: Log API call error (Requirement 9.4)
        workflowLogger.logAPICallError('api/analysis/config/save', 'POST', correlationId, error, {
          status: response.status,
          errorData,
        });
        
        throw error;
      }

      // Task 14: Log API call completion (Requirement 9.2, 9.3)
      workflowLogger.logAPICallComplete('api/analysis/config/save', 'POST', correlationId, response.status, true, {
        analysisCount: selectedAnalyses.length,
        analysisTypes: selectedAnalyses.map(a => a.type),
      });

      // Start analysis execution (don't wait for completion)
      setIsAnalyzing(true);
      setLoading(false);

      // Task 14: Generate correlation ID for execution and log API call start (Requirement 9.2)
      const executeCorrelationId = workflowLogger.generateCorrelationId('execute-analysis');
      workflowLogger.logAPICallStart('api/analysis/execute', 'POST', executeCorrelationId, {
        projectId,
        analysisTypes: selectedAnalyses.map(a => a.type),
      });

      // Execute analyses in background
      fetch(getApiUrl('api/analysis/execute'), {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-Correlation-ID': executeCorrelationId,
        },
        body: JSON.stringify({ 
          projectId,
          analysisTypes: selectedAnalyses.map(a => a.type)
        }),
      }).catch(err => {
        const error = err as Error;
        
        // Task 14: Log API call error (Requirement 9.4)
        workflowLogger.logAPICallError('api/analysis/execute', 'POST', executeCorrelationId, error);
        
        console.error('Analysis execution error:', err);
        setError(err.message);
        setIsAnalyzing(false);
      });

    } catch (err) {
      const error = err as Error;
      
      // Task 14: Log error (Requirement 9.4)
      workflowLogger.logError(error, 'Save analysis configuration', correlationId, {
        projectId,
        analysisCount: selectedAnalyses.length,
      });
      
      setError(error.message);
      setLoading(false);
    }
  };

  const handleAnalysisComplete = () => {
    setIsAnalyzing(false);
    setCurrentStep('results');
    
    // Task 14: Log step transition (Requirement 9.1)
    workflowLogger.logStepTransition('analyze', 'results', {
      analysisCompleted: true,
    });
    
    // Task 14: Log workflow completion summary (Requirement 9.5)
    workflowLogger.endSession(true, {
      projectId,
      finalStep: 'results',
      completedSuccessfully: true,
    });
  };

  const handleAnalysisError = (errorMessage: string) => {
    setIsAnalyzing(false);
    setError(errorMessage);
    
    // Task 14: Log error (Requirement 9.4)
    workflowLogger.logError(new Error(errorMessage), 'Analysis execution', undefined, {
      projectId,
      step: 'analyze',
    });
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

        {/* Task 15: Existing Project Notice (Requirements 10.1, 10.2) */}
        {currentStep === 'health' && isExistingProject && hasSavedGroups && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 mb-6">
            <div className="flex items-start gap-4">
              <AlertCircle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-amber-900">
                  Existing Project Detected
                </p>
                <p className="text-xs text-amber-700 mt-1">
                  This project has saved variable groups. Auto-continue is disabled to preserve your existing configuration.
                  Click "Continue" to review your saved groups.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Auto-Continue Loading State */}
        {autoContinueLoading && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
            <div className="flex items-center gap-4">
              <Loader2 className="w-6 h-6 text-blue-600 animate-spin flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-blue-900">
                  Analyzing variables for grouping...
                </p>
                <p className="text-xs text-blue-700 mt-1">
                  Preparing intelligent grouping suggestions
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Success Indicator */}
        {showSuccessIndicator && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
            <div className="flex items-center gap-4">
              <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-green-900">
                  Grouping suggestions ready!
                </p>
                <p className="text-xs text-green-700 mt-1">
                  Transitioning to variable grouping...
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Auto-Continue Error */}
        {autoContinueError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
            <div className="flex items-start gap-4">
              <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-red-900">
                  Failed to fetch grouping suggestions
                </p>
                <p className="text-xs text-red-700 mt-1">
                  {autoContinueError}
                </p>
                <button
                  onClick={handleRetryAutoContinue}
                  className="mt-3 px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 transition-colors"
                >
                  Retry
                </button>
              </div>
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
              <>
                {/* Manual Override Controls (Task 12: Requirements 5.1, 5.5) */}
                <div className="mb-6 flex items-center justify-between gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex-1">
                    <h3 className="text-sm font-medium text-gray-900">Grouping Suggestions</h3>
                    <p className="text-xs text-gray-600 mt-1">
                      {groupSuggestions.length > 0 
                        ? `${groupSuggestions.length} suggestion${groupSuggestions.length !== 1 ? 's' : ''} available`
                        : hasSkippedAutoGrouping 
                          ? 'Auto-grouping skipped - create groups manually or refresh suggestions'
                          : 'No suggestions available - create groups manually or refresh'
                      }
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {/* Skip Auto-Grouping Button (Task 12: Requirements 5.1, 5.2) */}
                    {groupSuggestions.length > 0 && !hasSkippedAutoGrouping && (
                      <button
                        onClick={handleSkipAutoGrouping}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                        title="Clear suggestions and proceed with manual grouping"
                      >
                        Skip Auto-Grouping
                      </button>
                    )}
                    
                    {/* Refresh Suggestions Button (Task 12: Requirement 5.5) */}
                    <button
                      onClick={handleRefreshSuggestions}
                      disabled={isRefreshingSuggestions}
                      className={`
                        px-4 py-2 text-sm font-medium rounded-md transition-colors flex items-center gap-2
                        ${isRefreshingSuggestions 
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                        }
                      `}
                      title="Re-fetch grouping suggestions from the API"
                    >
                      {isRefreshingSuggestions ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Refreshing...
                        </>
                      ) : (
                        'Refresh Suggestions'
                      )}
                    </button>
                  </div>
                </div>

                <VariableGroupingPanel
                  variables={variables}
                  initialGroups={groups}
                  onGroupsChange={handleGroupsChange}
                  onSave={handleGroupsSave}
                  externalSuggestions={groupSuggestions}
                  showSuggestions={!hasSkippedAutoGrouping}
                />
              </>
            )}

            {currentStep === 'demographic' && projectId && (
              <DemographicSelectionPanel
                variables={variables}
                initialDemographics={demographics}
                onDemographicsChange={handleDemographicsChange}
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
