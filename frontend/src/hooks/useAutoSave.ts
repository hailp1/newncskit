import { useEffect, useRef } from 'react';
import { useWorkflowStore } from '@/stores/workflowStore';

interface UseAutoSaveOptions {
  interval?: number; // milliseconds
  onSave?: (data: any) => Promise<void>;
  enabled?: boolean;
}

export function useAutoSave({
  interval = 30000, // 30 seconds
  onSave,
  enabled = true,
}: UseAutoSaveOptions = {}) {
  const { isDirty, markClean, updateLastSaved, projectId, currentStep } = useWorkflowStore();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isSavingRef = useRef(false);

  useEffect(() => {
    if (!enabled || !onSave) return;

    const performSave = async () => {
      if (!isDirty || isSavingRef.current || !projectId) return;

      try {
        isSavingRef.current = true;

        // Collect data to save
        const dataToSave = {
          projectId,
          currentStep,
          timestamp: new Date().toISOString(),
        };

        // Call the save function
        await onSave(dataToSave);

        // Update state
        updateLastSaved();
        markClean();

        // Also save to localStorage as backup
        localStorage.setItem('workflow-backup', JSON.stringify(dataToSave));
      } catch (error) {
        console.error('Auto-save failed:', error);
        // Don't mark as clean if save failed
      } finally {
        isSavingRef.current = false;
      }
    };

    // Set up interval
    intervalRef.current = setInterval(performSave, interval);

    // Cleanup
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isDirty, enabled, onSave, interval, projectId, currentStep, markClean, updateLastSaved]);

  // Manual save function
  const saveNow = async () => {
    if (!onSave || isSavingRef.current || !projectId) return;

    try {
      isSavingRef.current = true;

      const dataToSave = {
        projectId,
        currentStep,
        timestamp: new Date().toISOString(),
      };

      await onSave(dataToSave);
      updateLastSaved();
      markClean();

      localStorage.setItem('workflow-backup', JSON.stringify(dataToSave));
    } catch (error) {
      console.error('Manual save failed:', error);
      throw error;
    } finally {
      isSavingRef.current = false;
    }
  };

  return {
    saveNow,
    isSaving: isSavingRef.current,
  };
}
