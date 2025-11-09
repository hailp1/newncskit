import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useVariableGroupingAutoSave } from '@/hooks/useVariableGroupingAutoSave';
import { VariableGroup, DemographicVariable } from '@/types/analysis';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('useVariableGroupingAutoSave', () => {
  const mockProjectId = 'test-project-123';
  const mockGroups: VariableGroup[] = [
    {
      id: 'group-1',
      name: 'Test Group',
      variables: ['var1', 'var2'],
      createdAt: new Date(),
      updatedAt: new Date(),
      isCustom: false,
    },
  ];
  const mockDemographics: DemographicVariable[] = [];

  beforeEach(() => {
    vi.useFakeTimers();
    localStorageMock.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('should initialize with correct default values', () => {
    const { result } = renderHook(() =>
      useVariableGroupingAutoSave({
        projectId: mockProjectId,
        groups: mockGroups,
        demographics: mockDemographics,
      })
    );

    expect(result.current.isSaving).toBe(false);
    expect(result.current.lastSaved).toBe(null);
    expect(result.current.hasUnsavedChanges).toBe(false);
  });

  it('should detect changes and set hasUnsavedChanges to true', async () => {
    const { result, rerender } = renderHook(
      ({ groups }) =>
        useVariableGroupingAutoSave({
          projectId: mockProjectId,
          groups,
          demographics: mockDemographics,
        }),
      {
        initialProps: { groups: mockGroups },
      }
    );

    // Initially no changes
    expect(result.current.hasUnsavedChanges).toBe(false);

    // Update groups
    const updatedGroups = [
      ...mockGroups,
      {
        id: 'group-2',
        name: 'New Group',
        variables: ['var3'],
        createdAt: new Date(),
        updatedAt: new Date(),
        isCustom: true,
      },
    ];

    rerender({ groups: updatedGroups });

    // Should detect changes
    await waitFor(() => {
      expect(result.current.hasUnsavedChanges).toBe(true);
    });
  });

  it('should save to localStorage on interval', async () => {
    const { result, rerender } = renderHook(
      ({ groups }) =>
        useVariableGroupingAutoSave({
          projectId: mockProjectId,
          groups,
          demographics: mockDemographics,
          interval: 1000, // 1 second for testing
          enabled: true,
        }),
      {
        initialProps: { groups: mockGroups },
      }
    );

    // Update groups to trigger changes
    const updatedGroups = [
      {
        ...mockGroups[0],
        name: 'Updated Group',
      },
    ];

    rerender({ groups: updatedGroups });

    // Wait for changes to be detected
    await waitFor(() => {
      expect(result.current.hasUnsavedChanges).toBe(true);
    });

    // Fast-forward time to trigger auto-save
    act(() => {
      vi.advanceTimersByTime(1000);
    });

    // Check localStorage
    await waitFor(() => {
      const stored = localStorageMock.getItem('variable-grouping-backup');
      expect(stored).toBeTruthy();
      if (stored) {
        const data = JSON.parse(stored);
        expect(data.projectId).toBe(mockProjectId);
        expect(data.groups).toHaveLength(1);
        expect(data.groups[0].name).toBe('Updated Group');
      }
    });
  });

  it('should call onSave callback when saving', async () => {
    const onSave = vi.fn().mockResolvedValue(undefined);

    const { result, rerender } = renderHook(
      ({ groups }) =>
        useVariableGroupingAutoSave({
          projectId: mockProjectId,
          groups,
          demographics: mockDemographics,
          interval: 1000,
          onSave,
          enabled: true,
        }),
      {
        initialProps: { groups: mockGroups },
      }
    );

    // Update groups
    const updatedGroups = [
      {
        ...mockGroups[0],
        name: 'Updated Group',
      },
    ];

    rerender({ groups: updatedGroups });

    // Wait for changes
    await waitFor(() => {
      expect(result.current.hasUnsavedChanges).toBe(true);
    });

    // Trigger auto-save
    act(() => {
      vi.advanceTimersByTime(1000);
    });

    // Check if onSave was called
    await waitFor(() => {
      expect(onSave).toHaveBeenCalled();
    });
  });

  it('should clear localStorage after successful database save', async () => {
    const onSave = vi.fn().mockResolvedValue(undefined);

    const { result, rerender } = renderHook(
      ({ groups }) =>
        useVariableGroupingAutoSave({
          projectId: mockProjectId,
          groups,
          demographics: mockDemographics,
          interval: 1000,
          onSave,
          enabled: true,
        }),
      {
        initialProps: { groups: mockGroups },
      }
    );

    // Update groups
    const updatedGroups = [
      {
        ...mockGroups[0],
        name: 'Updated Group',
      },
    ];

    rerender({ groups: updatedGroups });

    // Wait for changes
    await waitFor(() => {
      expect(result.current.hasUnsavedChanges).toBe(true);
    });

    // Trigger auto-save
    act(() => {
      vi.advanceTimersByTime(1000);
    });

    // Wait for save to complete
    await waitFor(() => {
      expect(onSave).toHaveBeenCalled();
    });

    // localStorage should be cleared after successful save
    await waitFor(() => {
      const stored = localStorageMock.getItem('variable-grouping-backup');
      expect(stored).toBe(null);
    });
  });

  it('should keep data in localStorage if database save fails', async () => {
    const onSave = vi.fn().mockRejectedValue(new Error('Network error'));

    const { result, rerender } = renderHook(
      ({ groups }) =>
        useVariableGroupingAutoSave({
          projectId: mockProjectId,
          groups,
          demographics: mockDemographics,
          interval: 1000,
          onSave,
          enabled: true,
        }),
      {
        initialProps: { groups: mockGroups },
      }
    );

    // Update groups
    const updatedGroups = [
      {
        ...mockGroups[0],
        name: 'Updated Group',
      },
    ];

    rerender({ groups: updatedGroups });

    // Wait for changes
    await waitFor(() => {
      expect(result.current.hasUnsavedChanges).toBe(true);
    });

    // Trigger auto-save
    act(() => {
      vi.advanceTimersByTime(1000);
    });

    // Wait for save attempt
    await waitFor(() => {
      expect(onSave).toHaveBeenCalled();
    });

    // localStorage should still have data
    await waitFor(() => {
      const stored = localStorageMock.getItem('variable-grouping-backup');
      expect(stored).toBeTruthy();
    });
  });

  it('should support manual save via saveNow', async () => {
    const onSave = vi.fn().mockResolvedValue(undefined);

    const { result, rerender } = renderHook(
      ({ groups }) =>
        useVariableGroupingAutoSave({
          projectId: mockProjectId,
          groups,
          demographics: mockDemographics,
          onSave,
          enabled: true,
        }),
      {
        initialProps: { groups: mockGroups },
      }
    );

    // Update groups
    const updatedGroups = [
      {
        ...mockGroups[0],
        name: 'Updated Group',
      },
    ];

    rerender({ groups: updatedGroups });

    // Wait for changes
    await waitFor(() => {
      expect(result.current.hasUnsavedChanges).toBe(true);
    });

    // Manual save
    await act(async () => {
      await result.current.saveNow();
    });

    // Check if onSave was called
    expect(onSave).toHaveBeenCalled();
  });

  it('should clear unsaved changes flag', async () => {
    const { result, rerender } = renderHook(
      ({ groups }) =>
        useVariableGroupingAutoSave({
          projectId: mockProjectId,
          groups,
          demographics: mockDemographics,
        }),
      {
        initialProps: { groups: mockGroups },
      }
    );

    // Update groups
    const updatedGroups = [
      {
        ...mockGroups[0],
        name: 'Updated Group',
      },
    ];

    rerender({ groups: updatedGroups });

    // Wait for changes
    await waitFor(() => {
      expect(result.current.hasUnsavedChanges).toBe(true);
    });

    // Clear unsaved changes
    act(() => {
      result.current.clearUnsavedChanges();
    });

    // Should be cleared
    expect(result.current.hasUnsavedChanges).toBe(false);
  });
});
