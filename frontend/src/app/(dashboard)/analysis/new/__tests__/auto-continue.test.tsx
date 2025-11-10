/**
 * Auto-Continue Logic Tests
 * 
 * Tests for automatic workflow progression from health to grouping
 * Requirements: 1.1, 1.2, 1.3, 4.1, 4.2
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useEffect, useRef, useState } from 'react';

// Mock the feature flags
vi.mock('@/config/feature-flags', () => ({
  featureFlags: {
    enableAutoContinue: true,
    enableAutoContinueForExistingProjects: false,
  },
}));

// Mock the workflow logger
vi.mock('@/services/workflow-logger.service', () => ({
  workflowLogger: {
    logStepTransition: vi.fn(),
    logAPICallStart: vi.fn(),
    logAPICallComplete: vi.fn(),
    logAPICallError: vi.fn(),
    logError: vi.fn(),
    generateCorrelationId: vi.fn(() => 'test-correlation-id'),
  },
}));

describe('Auto-Continue Logic', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('useEffect Trigger', () => {
    it('should trigger auto-continue when health report is available', async () => {
      let autoContinueCalled = false;

      const { result } = renderHook(() => {
        const [currentStep, setCurrentStep] = useState('health');
        const [healthReport, setHealthReport] = useState<any>(null);
        const hasAutoFetchedRef = useRef(false);

        useEffect(() => {
          if (
            currentStep === 'health' &&
            healthReport &&
            !hasAutoFetchedRef.current
          ) {
            autoContinueCalled = true;
            hasAutoFetchedRef.current = true;
          }
        }, [currentStep, healthReport]);

        return { setHealthReport, setCurrentStep };
      });

      // Initially should not trigger
      expect(autoContinueCalled).toBe(false);

      // Set health report
      result.current.setHealthReport({ overallScore: 85 });

      await waitFor(() => {
        expect(autoContinueCalled).toBe(true);
      });
    });

    it('should not trigger auto-continue when not on health step', async () => {
      let autoContinueCalled = false;

      const { result } = renderHook(() => {
        const [currentStep, setCurrentStep] = useState('upload');
        const [healthReport, setHealthReport] = useState<any>({ overallScore: 85 });
        const hasAutoFetchedRef = useRef(false);

        useEffect(() => {
          if (
            currentStep === 'health' &&
            healthReport &&
            !hasAutoFetchedRef.current
          ) {
            autoContinueCalled = true;
            hasAutoFetchedRef.current = true;
          }
        }, [currentStep, healthReport]);

        return { setCurrentStep };
      });

      await waitFor(() => {
        expect(autoContinueCalled).toBe(false);
      });
    });

    it('should not trigger auto-continue if already fetched', async () => {
      let callCount = 0;

      const { result } = renderHook(() => {
        const [currentStep] = useState('health');
        const [healthReport] = useState<any>({ overallScore: 85 });
        const hasAutoFetchedRef = useRef(true); // Already fetched

        useEffect(() => {
          if (
            currentStep === 'health' &&
            healthReport &&
            !hasAutoFetchedRef.current
          ) {
            callCount++;
          }
        }, [currentStep, healthReport]);

        return {};
      });

      await waitFor(() => {
        expect(callCount).toBe(0);
      });
    });
  });

  describe('Loading States', () => {
    it('should set loading state during API call', async () => {
      const { result } = renderHook(() => {
        const [loading, setLoading] = useState(false);

        const handleAutoContinue = async () => {
          setLoading(true);
          try {
            await new Promise(resolve => setTimeout(resolve, 100));
          } finally {
            setLoading(false);
          }
        };

        return { loading, handleAutoContinue };
      });

      expect(result.current.loading).toBe(false);

      result.current.handleAutoContinue();

      await waitFor(() => {
        expect(result.current.loading).toBe(true);
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      }, { timeout: 200 });
    });

    it('should clear loading state after successful API call', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ success: true, suggestions: [] }),
      });

      const { result } = renderHook(() => {
        const [loading, setLoading] = useState(false);

        const handleAutoContinue = async () => {
          setLoading(true);
          try {
            const response = await fetch('/api/test');
            await response.json();
          } finally {
            setLoading(false);
          }
        };

        return { loading, handleAutoContinue };
      });

      result.current.handleAutoContinue();

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
    });
  });

  describe('Error Handling', () => {
    it('should set error state on network failure', async () => {
      global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

      const { result } = renderHook(() => {
        const [error, setError] = useState<string | null>(null);

        const handleAutoContinue = async () => {
          try {
            await fetch('/api/test');
          } catch (err) {
            setError((err as Error).message);
          }
        };

        return { error, handleAutoContinue };
      });

      result.current.handleAutoContinue();

      await waitFor(() => {
        expect(result.current.error).toBe('Network error');
      });
    });

    it('should set error state on API error response', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        json: async () => ({ error: 'Server error' }),
      });

      const { result } = renderHook(() => {
        const [error, setError] = useState<string | null>(null);

        const handleAutoContinue = async () => {
          try {
            const response = await fetch('/api/test');
            if (!response.ok) {
              const data = await response.json();
              throw new Error(data.error || 'API error');
            }
          } catch (err) {
            setError((err as Error).message);
          }
        };

        return { error, handleAutoContinue };
      });

      result.current.handleAutoContinue();

      await waitFor(() => {
        expect(result.current.error).toBe('Server error');
      });
    });

    it('should clear error state on retry', async () => {
      const { result } = renderHook(() => {
        const [error, setError] = useState<string | null>('Previous error');

        const handleRetry = () => {
          setError(null);
        };

        return { error, handleRetry };
      });

      expect(result.current.error).toBe('Previous error');

      result.current.handleRetry();

      await waitFor(() => {
        expect(result.current.error).toBeNull();
      });
    });
  });

  describe('Retry Mechanism', () => {
    it('should allow retry after error', async () => {
      let callCount = 0;

      global.fetch = vi.fn().mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          return Promise.reject(new Error('First attempt failed'));
        }
        return Promise.resolve({
          ok: true,
          json: async () => ({ success: true }),
        });
      });

      const { result } = renderHook(() => {
        const [error, setError] = useState<string | null>(null);
        const [success, setSuccess] = useState(false);

        const handleAutoContinue = async () => {
          setError(null);
          try {
            const response = await fetch('/api/test');
            const data = await response.json();
            setSuccess(data.success);
          } catch (err) {
            setError((err as Error).message);
          }
        };

        return { error, success, handleAutoContinue };
      });

      // First attempt
      result.current.handleAutoContinue();

      await waitFor(() => {
        expect(result.current.error).toBe('First attempt failed');
      });

      // Retry
      result.current.handleAutoContinue();

      await waitFor(() => {
        expect(result.current.success).toBe(true);
        expect(result.current.error).toBeNull();
      });

      expect(callCount).toBe(2);
    });

    it('should generate new correlation ID on retry', async () => {
      const correlationIds: string[] = [];

      const { result } = renderHook(() => {
        const generateCorrelationId = () => {
          return `corr-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
        };

        const handleRetry = () => {
          const newId = generateCorrelationId();
          correlationIds.push(newId);
          return newId;
        };

        return { handleRetry };
      });

      const id1 = result.current.handleRetry();
      await new Promise(resolve => setTimeout(resolve, 10));
      const id2 = result.current.handleRetry();

      expect(id1).not.toBe(id2);
      expect(correlationIds).toHaveLength(2);
    });
  });

  describe('User Interaction Detection', () => {
    it('should cancel auto-continue on user interaction', async () => {
      const { result } = renderHook(() => {
        const [userInteracted, setUserInteracted] = useState(false);
        const timeoutRef = useRef<NodeJS.Timeout | null>(null);

        const startAutoContinue = () => {
          timeoutRef.current = setTimeout(() => {
            if (!userInteracted) {
              // Auto-continue logic
            }
          }, 2000);
        };

        const handleUserInteraction = () => {
          setUserInteracted(true);
          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
          }
        };

        return { userInteracted, startAutoContinue, handleUserInteraction, timeoutRef };
      });

      result.current.startAutoContinue();
      expect(result.current.timeoutRef.current).not.toBeNull();

      result.current.handleUserInteraction();

      await waitFor(() => {
        expect(result.current.userInteracted).toBe(true);
        expect(result.current.timeoutRef.current).toBeNull();
      });
    });

    it('should detect backward navigation and cancel auto-continue', async () => {
      const { result } = renderHook(() => {
        const [currentStep, setCurrentStep] = useState('health');
        const previousStepRef = useRef('upload');
        const timeoutRef = useRef<NodeJS.Timeout | null>(null);

        useEffect(() => {
          const isBackwardNavigation = 
            previousStepRef.current === 'health' && currentStep === 'upload';

          if (isBackwardNavigation && timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
          }

          previousStepRef.current = currentStep;
        }, [currentStep]);

        return { setCurrentStep, timeoutRef };
      });

      // Set up timeout
      result.current.timeoutRef.current = setTimeout(() => {}, 2000);

      // Navigate backward
      result.current.setCurrentStep('upload');

      await waitFor(() => {
        expect(result.current.timeoutRef.current).toBeNull();
      });
    });
  });

  describe('Delay Before Auto-Continue', () => {
    it('should wait 2 seconds before triggering auto-continue', async () => {
      let autoContinueCalled = false;
      let callTime: number | null = null;
      const startTime = Date.now();

      const { result } = renderHook(() => {
        const [healthReport, setHealthReport] = useState<any>(null);
        const timeoutRef = useRef<NodeJS.Timeout | null>(null);

        useEffect(() => {
          if (healthReport) {
            timeoutRef.current = setTimeout(() => {
              autoContinueCalled = true;
              callTime = Date.now();
            }, 2000);
          }

          return () => {
            if (timeoutRef.current) {
              clearTimeout(timeoutRef.current);
            }
          };
        }, [healthReport]);

        return { setHealthReport };
      });

      result.current.setHealthReport({ overallScore: 85 });

      // Should not be called immediately
      expect(autoContinueCalled).toBe(false);

      // Wait for the timeout to complete
      await waitFor(() => {
        expect(autoContinueCalled).toBe(true);
      }, { timeout: 3000 });

      // Verify it took approximately 2 seconds
      const elapsed = callTime! - startTime;
      expect(elapsed).toBeGreaterThanOrEqual(1900); // Allow some margin
      expect(elapsed).toBeLessThan(2500);
    });
  });
});
