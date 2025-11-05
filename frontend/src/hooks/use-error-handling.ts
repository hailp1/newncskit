'use client';

import { useState, useCallback, useEffect } from 'react';
import { ErrorHandler, ErrorMessage } from '@/services/error-handler';
import { errorRecoveryService, ErrorRecoveryContext, RecoveryAction } from '@/services/error-recovery';

interface UseErrorHandlingOptions {
  component: string;
  onError?: (error: Error, context: ErrorRecoveryContext) => void;
  onRecovery?: (action: RecoveryAction, success: boolean) => void;
  autoRetry?: boolean;
  maxRetries?: number;
}

interface ErrorState {
  error: ErrorMessage | null;
  isRecovering: boolean;
  recoveryActions: RecoveryAction[];
  retryCount: number;
}

export function useErrorHandling(options: UseErrorHandlingOptions) {
  const [errorState, setErrorState] = useState<ErrorState>({
    error: null,
    isRecovering: false,
    recoveryActions: [],
    retryCount: 0
  });

  const { component, onError, onRecovery, autoRetry = false, maxRetries = 3 } = options;

  // Handle error with automatic recovery options
  const handleError = useCallback(async (
    error: Error,
    operation: string,
    data?: any
  ) => {
    const context: ErrorRecoveryContext = {
      operation,
      component,
      data,
      timestamp: new Date()
    };

    console.error(`Error in ${component}.${operation}:`, error);

    // Call custom error handler if provided
    if (onError) {
      onError(error, context);
    }

    // Generate user-friendly error message
    let errorMessage: ErrorMessage;
    switch (component) {
      case 'survey-builder':
        errorMessage = ErrorHandler.handleSurveyBuilderError(error);
        break;
      case 'campaign-manager':
        errorMessage = ErrorHandler.handleCampaignError(error);
        break;
      case 'data-upload':
        errorMessage = ErrorHandler.handleDataIntegrationError(error);
        break;
      case 'progress-tracker':
        errorMessage = ErrorHandler.handleProgressTrackingError(error);
        break;
      case 'question-bank':
        errorMessage = ErrorHandler.handleQuestionBankError(error);
        break;
      default:
        errorMessage = ErrorHandler.handleGenericError(error);
    }

    // Get recovery actions
    const recoveryActions = errorRecoveryService.getRecoveryActions(error, context);

    setErrorState(prev => ({
      ...prev,
      error: errorMessage,
      recoveryActions,
      retryCount: prev.retryCount + 1
    }));

    // Auto-retry for certain errors if enabled
    if (autoRetry && errorState.retryCount < maxRetries) {
      const shouldAutoRetry = recoveryActions.some(action => 
        action.type === 'retry' && action.priority === 'high'
      );

      if (shouldAutoRetry) {
        setTimeout(() => {
          executeRecovery(recoveryActions.find(a => a.type === 'retry')!);
        }, 1000 * Math.pow(2, errorState.retryCount)); // Exponential backoff
      }
    }
  }, [component, onError, autoRetry, maxRetries, errorState.retryCount]);

  // Execute recovery action
  const executeRecovery = useCallback(async (action: RecoveryAction) => {
    setErrorState(prev => ({ ...prev, isRecovering: true }));

    try {
      const context: ErrorRecoveryContext = {
        operation: 'recovery',
        component,
        timestamp: new Date()
      };

      const success = await errorRecoveryService.executeRecovery(
        action,
        context,
        errorState.error
      );

      if (success) {
        setErrorState({
          error: null,
          isRecovering: false,
          recoveryActions: [],
          retryCount: 0
        });
      } else {
        setErrorState(prev => ({ ...prev, isRecovering: false }));
      }

      if (onRecovery) {
        onRecovery(action, success);
      }

      return success;
    } catch (recoveryError) {
      console.error('Recovery action failed:', recoveryError);
      setErrorState(prev => ({ ...prev, isRecovering: false }));
      
      if (onRecovery) {
        onRecovery(action, false);
      }
      
      return false;
    }
  }, [component, errorState.error, onRecovery]);

  // Clear error state
  const clearError = useCallback(() => {
    setErrorState({
      error: null,
      isRecovering: false,
      recoveryActions: [],
      retryCount: 0
    });
  }, []);

  // Retry with exponential backoff
  const retryWithBackoff = useCallback(async (
    operation: () => Promise<any>,
    operationName: string,
    maxAttempts: number = 3
  ) => {
    let lastError: Error;
    
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        const result = await operation();
        
        // Clear error on success
        if (errorState.error) {
          clearError();
        }
        
        return result;
      } catch (error) {
        lastError = error as Error;
        
        if (attempt === maxAttempts) {
          await handleError(lastError, operationName);
          throw lastError;
        }
        
        // Wait before retry with exponential backoff
        const delay = 1000 * Math.pow(2, attempt - 1);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }, [errorState.error, handleError, clearError]);

  // Wrap async operations with error handling
  const withErrorHandling = useCallback(<T>(
    operation: () => Promise<T>,
    operationName: string,
    options?: {
      showError?: boolean;
      retries?: number;
    }
  ) => {
    const { showError = true, retries = 1 } = options || {};
    
    return async (): Promise<T | null> => {
      try {
        if (retries > 1) {
          return await retryWithBackoff(operation, operationName, retries);
        } else {
          const result = await operation();
          
          // Clear error on success
          if (errorState.error) {
            clearError();
          }
          
          return result;
        }
      } catch (error) {
        if (showError) {
          await handleError(error as Error, operationName);
        }
        return null;
      }
    };
  }, [handleError, clearError, retryWithBackoff, errorState.error]);

  // Set up error recovery event listeners
  useEffect(() => {
    const handleRetryOperation = () => {
      const retryAction = errorState.recoveryActions.find(a => a.type === 'retry');
      if (retryAction) {
        executeRecovery(retryAction);
      }
    };

    const handleClearError = () => {
      clearError();
    };

    // Component-specific event listeners
    const retryEventName = `${component}:retry-operation`;
    const clearEventName = `${component}:clear-error`;

    window.addEventListener('error-recovery:retry-operation', handleRetryOperation);
    window.addEventListener(retryEventName, handleRetryOperation);
    window.addEventListener(clearEventName, handleClearError);

    return () => {
      window.removeEventListener('error-recovery:retry-operation', handleRetryOperation);
      window.removeEventListener(retryEventName, handleRetryOperation);
      window.removeEventListener(clearEventName, handleClearError);
    };
  }, [component, errorState.recoveryActions, executeRecovery, clearError]);

  return {
    // Error state
    error: errorState.error,
    isRecovering: errorState.isRecovering,
    recoveryActions: errorState.recoveryActions,
    retryCount: errorState.retryCount,
    hasError: !!errorState.error,
    
    // Error handling functions
    handleError,
    executeRecovery,
    clearError,
    withErrorHandling,
    retryWithBackoff,
    
    // Utility functions
    canRetry: errorState.retryCount < maxRetries,
    shouldShowRecovery: errorState.recoveryActions.length > 0,
  };
}

// Specialized hooks for different components
export function useSurveyBuilderErrorHandling(options?: Omit<UseErrorHandlingOptions, 'component'>) {
  return useErrorHandling({ ...options, component: 'survey-builder' });
}

export function useCampaignManagerErrorHandling(options?: Omit<UseErrorHandlingOptions, 'component'>) {
  return useErrorHandling({ ...options, component: 'campaign-manager' });
}

export function useDataUploadErrorHandling(options?: Omit<UseErrorHandlingOptions, 'component'>) {
  return useErrorHandling({ ...options, component: 'data-upload' });
}

export function useProgressTrackerErrorHandling(options?: Omit<UseErrorHandlingOptions, 'component'>) {
  return useErrorHandling({ ...options, component: 'progress-tracker' });
}

export function useQuestionBankErrorHandling(options?: Omit<UseErrorHandlingOptions, 'component'>) {
  return useErrorHandling({ ...options, component: 'question-bank' });
}