import { useEffect, useRef, useCallback, useState } from 'react';
import { VariableGroup, DemographicVariable, VariableRoleTag, AnalysisModelValidation } from '@/types/analysis';
import { retryWithExponentialBackoff, RetryStatus } from '@/lib/utils';

interface AutoSaveData {
  groups: VariableGroup[];
  demographics: DemographicVariable[];
  roleTags?: VariableRoleTag[];
  validationResult?: AnalysisModelValidation;
  projectId: string;
  timestamp: string;
}

interface UseVariableGroupingAutoSaveOptions {
  projectId: string;
  groups: VariableGroup[];
  demographics: DemographicVariable[];
  roleTags?: VariableRoleTag[];
  validationResult?: AnalysisModelValidation;
  interval?: number; // milliseconds
  onSave?: (data: AutoSaveData) => Promise<void>;
  enabled?: boolean;
}

interface UseVariableGroupingAutoSaveReturn {
  saveNow: () => Promise<void>;
  isSaving: boolean;
  lastSaved: Date | null;
  hasUnsavedChanges: boolean;
  clearUnsavedChanges: () => void;
  retryStatus: RetryStatus | null;
  saveError: Error | null;
}

const STORAGE_KEY = 'variable-grouping-backup';

/**
 * Auto-save hook for variable grouping and demographic configuration
 * 
 * Features:
 * - Auto-saves to localStorage every 30 seconds (configurable)
 * - Tracks unsaved changes (dirty state)
 * - Provides manual save function
 * - Restores from localStorage on mount
 * - Clears localStorage after successful database save
 * - Saves roleTags and validationResult (Task 11.1: Requirements 8.1, 8.3)
 * 
 * Requirements: 7.1, 7.3, 6.5, 8.1, 8.3
 */
export function useVariableGroupingAutoSave({
  projectId,
  groups,
  demographics,
  roleTags,
  validationResult,
  interval = 30000, // 30 seconds
  onSave,
  enabled = true,
}: UseVariableGroupingAutoSaveOptions): UseVariableGroupingAutoSaveReturn {
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [retryStatus, setRetryStatus] = useState<RetryStatus | null>(null);
  const [saveError, setSaveError] = useState<Error | null>(null);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const previousDataRef = useRef<string>('');

  /**
   * Save data to localStorage
   */
  const saveToLocalStorage = useCallback((data: AutoSaveData) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save to localStorage:', error);
    }
  }, []);

  /**
   * Load data from localStorage
   */
  const loadFromLocalStorage = useCallback((): AutoSaveData | null => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return null;
      
      const data = JSON.parse(stored) as AutoSaveData;
      
      // Only return if it's for the same project
      if (data.projectId === projectId) {
        return data;
      }
      
      return null;
    } catch (error) {
      console.error('Failed to load from localStorage:', error);
      return null;
    }
  }, [projectId]);

  /**
   * Clear localStorage backup
   */
  const clearLocalStorage = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Failed to clear localStorage:', error);
    }
  }, []);

  /**
   * Check if data has changed
   * Task 11.1: Include roleTags and validationResult in change detection
   */
  const hasDataChanged = useCallback(() => {
    const currentData = JSON.stringify({ groups, demographics, roleTags, validationResult });
    return currentData !== previousDataRef.current;
  }, [groups, demographics, roleTags, validationResult]);

  /**
   * Perform save operation with retry logic
   * Requirements: 7.5
   */
  const performSave = useCallback(async (isManual: boolean = false) => {
    if (isSaving || !projectId) return;

    // Check if data has changed
    if (!isManual && !hasDataChanged()) {
      return;
    }

    setIsSaving(true);
    setSaveError(null);
    setRetryStatus(null);

    const dataToSave: AutoSaveData = {
      projectId,
      groups,
      demographics,
      roleTags,
      validationResult,
      timestamp: new Date().toISOString(),
    };

    try {
      // Save to localStorage first (backup) - Task 11.1: Requirements 8.1, 8.3
      saveToLocalStorage(dataToSave);

      // If onSave callback is provided, save to database with retry logic
      if (onSave) {
        await retryWithExponentialBackoff(
          () => onSave(dataToSave),
          {
            maxAttempts: 3,
            baseDelay: 1000, // 1s, 2s, 4s
            onRetry: (attempt, error) => {
              setRetryStatus({
                attempt,
                maxAttempts: 3,
                isRetrying: true,
                lastError: error,
              });
            },
          }
        );
        
        // Clear localStorage after successful database save
        clearLocalStorage();
        setRetryStatus(null);
      }

      // Update state
      setLastSaved(new Date());
      setHasUnsavedChanges(false);
      setSaveError(null);
      previousDataRef.current = JSON.stringify({ groups, demographics, roleTags, validationResult });
    } catch (error) {
      const err = error as Error;
      console.error('Auto-save failed after all retries:', err);
      setSaveError(err);
      setRetryStatus({
        attempt: 3,
        maxAttempts: 3,
        isRetrying: false,
        lastError: err,
      });
      // Keep data in localStorage if database save fails
      // Don't clear unsaved changes flag
    } finally {
      setIsSaving(false);
    }
  }, [
    isSaving,
    projectId,
    groups,
    demographics,
    roleTags,
    validationResult,
    hasDataChanged,
    saveToLocalStorage,
    clearLocalStorage,
    onSave,
  ]);

  /**
   * Manual save function
   */
  const saveNow = useCallback(async () => {
    await performSave(true);
  }, [performSave]);

  /**
   * Clear unsaved changes flag
   */
  const clearUnsavedChanges = useCallback(() => {
    setHasUnsavedChanges(false);
    previousDataRef.current = JSON.stringify({ groups, demographics, roleTags, validationResult });
  }, [groups, demographics, roleTags, validationResult]);

  /**
   * Track changes to groups, demographics, roleTags, and validationResult
   * Task 11.1: Requirements 8.1, 8.3
   */
  useEffect(() => {
    if (hasDataChanged()) {
      setHasUnsavedChanges(true);
    }
  }, [groups, demographics, roleTags, validationResult, hasDataChanged]);

  /**
   * Restore from localStorage on mount
   */
  useEffect(() => {
    const backup = loadFromLocalStorage();
    // Note: The actual restoration should be handled by the parent component
    // This hook just provides the detection
  }, [loadFromLocalStorage]);

  /**
   * Set up auto-save interval
   */
  useEffect(() => {
    if (!enabled) return;

    // Clear any existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    // Set up new interval
    intervalRef.current = setInterval(() => {
      if (hasUnsavedChanges) {
        performSave(false);
      }
    }, interval);

    // Cleanup
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [enabled, interval, hasUnsavedChanges, performSave]);

  /**
   * Initialize previous data ref
   */
  useEffect(() => {
    if (!previousDataRef.current) {
      previousDataRef.current = JSON.stringify({ groups, demographics, roleTags, validationResult });
    }
  }, []);

  return {
    saveNow,
    isSaving,
    lastSaved,
    hasUnsavedChanges,
    clearUnsavedChanges,
    retryStatus,
    saveError,
  };
}

/**
 * Utility function to restore data from localStorage
 * Can be used by components on mount
 */
export function restoreFromLocalStorage(projectId: string): AutoSaveData | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;
    
    const data = JSON.parse(stored) as AutoSaveData;
    
    // Only return if it's for the same project
    if (data.projectId === projectId) {
      return data;
    }
    
    return null;
  } catch (error) {
    console.error('Failed to restore from localStorage:', error);
    return null;
  }
}

/**
 * Utility function to clear localStorage backup
 */
export function clearLocalStorageBackup(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear localStorage:', error);
  }
}
