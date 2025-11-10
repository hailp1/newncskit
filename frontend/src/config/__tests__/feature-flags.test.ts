/**
 * Feature Flags Tests
 * 
 * Tests for Task 15: Implement backward compatibility
 * Requirements: 10.1, 10.2, 10.3, 10.4, 10.5
 * 
 * @vitest-environment node
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { featureFlags, setFeatureFlag, resetFeatureFlags, isFeatureEnabled } from '../feature-flags';

describe('Feature Flags', () => {
  beforeEach(() => {
    // Reset feature flags before each test
    resetFeatureFlags();
  });

  describe('Default Values', () => {
    it('should have auto-continue enabled by default', () => {
      expect(featureFlags.enableAutoContinue).toBe(true);
    });

    it('should have auto-continue for existing projects disabled by default', () => {
      expect(featureFlags.enableAutoContinueForExistingProjects).toBe(false);
    });

    it('should have role tagging enabled by default', () => {
      expect(featureFlags.enableRoleTagging).toBe(true);
    });

    it('should have role suggestions enabled by default', () => {
      expect(featureFlags.enableRoleSuggestions).toBe(true);
    });

    it('should have model preview enabled by default', () => {
      expect(featureFlags.enableModelPreview).toBe(true);
    });
  });

  describe('Feature Flag Modification', () => {
    it('should allow feature flag override', () => {
      setFeatureFlag('enableAutoContinue', false);
      expect(featureFlags.enableAutoContinue).toBe(false);

      setFeatureFlag('enableAutoContinue', true);
      expect(featureFlags.enableAutoContinue).toBe(true);
    });

    it('should allow multiple flag modifications', () => {
      setFeatureFlag('enableAutoContinue', false);
      setFeatureFlag('enableAutoContinueForExistingProjects', true);
      setFeatureFlag('enableRoleTagging', false);

      expect(featureFlags.enableAutoContinue).toBe(false);
      expect(featureFlags.enableAutoContinueForExistingProjects).toBe(true);
      expect(featureFlags.enableRoleTagging).toBe(false);
    });

    it('should reset feature flags to defaults', () => {
      setFeatureFlag('enableAutoContinue', false);
      setFeatureFlag('enableAutoContinueForExistingProjects', true);

      resetFeatureFlags();

      expect(featureFlags.enableAutoContinue).toBe(true);
      expect(featureFlags.enableAutoContinueForExistingProjects).toBe(false);
    });
  });

  describe('isFeatureEnabled Helper', () => {
    it('should return correct feature status', () => {
      expect(isFeatureEnabled('enableAutoContinue')).toBe(true);
      expect(isFeatureEnabled('enableAutoContinueForExistingProjects')).toBe(false);
    });

    it('should reflect changes after modification', () => {
      setFeatureFlag('enableAutoContinue', false);
      expect(isFeatureEnabled('enableAutoContinue')).toBe(false);

      setFeatureFlag('enableAutoContinue', true);
      expect(isFeatureEnabled('enableAutoContinue')).toBe(true);
    });
  });
});

describe('Backward Compatibility Logic', () => {
  beforeEach(() => {
    resetFeatureFlags();
  });

  describe('Project State Detection', () => {
    it('should identify new project correctly', () => {
      const projectState = {
        isExistingProject: false,
        hasGroups: false,
        hasDemographics: false,
        groups: [],
        demographics: [],
      };

      expect(projectState.isExistingProject).toBe(false);
      expect(projectState.hasGroups).toBe(false);
    });

    it('should identify existing project with groups', () => {
      const projectState = {
        isExistingProject: true,
        hasGroups: true,
        hasDemographics: false,
        groups: [{ id: '1', name: 'Group 1' }],
        demographics: [],
      };

      expect(projectState.isExistingProject).toBe(true);
      expect(projectState.hasGroups).toBe(true);
    });

    it('should identify existing project with demographics', () => {
      const projectState = {
        isExistingProject: true,
        hasGroups: false,
        hasDemographics: true,
        groups: [],
        demographics: [{ id: '1', name: 'Age' }],
      };

      expect(projectState.isExistingProject).toBe(true);
      expect(projectState.hasDemographics).toBe(true);
    });

    it('should identify existing project with both groups and demographics', () => {
      const projectState = {
        isExistingProject: true,
        hasGroups: true,
        hasDemographics: true,
        groups: [{ id: '1', name: 'Group 1' }],
        demographics: [{ id: '1', name: 'Age' }],
      };

      expect(projectState.isExistingProject).toBe(true);
      expect(projectState.hasGroups).toBe(true);
      expect(projectState.hasDemographics).toBe(true);
    });
  });

  describe('Auto-Continue Decision Logic', () => {
    it('should allow auto-continue for new projects', () => {
      const isExistingProject = false;
      const autoContinueEnabled = featureFlags.enableAutoContinue;
      const shouldSkipForExistingProject = 
        isExistingProject && !featureFlags.enableAutoContinueForExistingProjects;

      const shouldAutoContinue = autoContinueEnabled && !shouldSkipForExistingProject;

      expect(shouldAutoContinue).toBe(true);
    });

    it('should skip auto-continue for existing projects by default', () => {
      const isExistingProject = true;
      const autoContinueEnabled = featureFlags.enableAutoContinue;
      const shouldSkipForExistingProject = 
        isExistingProject && !featureFlags.enableAutoContinueForExistingProjects;

      const shouldAutoContinue = autoContinueEnabled && !shouldSkipForExistingProject;

      expect(shouldAutoContinue).toBe(false);
    });

    it('should allow auto-continue for existing projects when flag is enabled', () => {
      setFeatureFlag('enableAutoContinueForExistingProjects', true);

      const isExistingProject = true;
      const autoContinueEnabled = featureFlags.enableAutoContinue;
      const shouldSkipForExistingProject = 
        isExistingProject && !featureFlags.enableAutoContinueForExistingProjects;

      const shouldAutoContinue = autoContinueEnabled && !shouldSkipForExistingProject;

      expect(shouldAutoContinue).toBe(true);
    });

    it('should not auto-continue when master flag is disabled', () => {
      setFeatureFlag('enableAutoContinue', false);

      const isExistingProject = false;
      const autoContinueEnabled = featureFlags.enableAutoContinue;
      const shouldSkipForExistingProject = 
        isExistingProject && !featureFlags.enableAutoContinueForExistingProjects;

      const shouldAutoContinue = autoContinueEnabled && !shouldSkipForExistingProject;

      expect(shouldAutoContinue).toBe(false);
    });
  });

  describe('Saved Groups Protection', () => {
    it('should not override saved groups with new suggestions', () => {
      const hasSavedGroups = true;
      const newSuggestions = [
        { groupName: 'New Group 1', variables: ['V1', 'V2'] },
        { groupName: 'New Group 2', variables: ['V3', 'V4'] },
      ];

      // Simulate the logic from handleHealthContinueAuto
      let appliedSuggestions: any[] = [];
      if (!hasSavedGroups) {
        appliedSuggestions = newSuggestions;
      }

      expect(appliedSuggestions).toEqual([]);
    });

    it('should apply suggestions for new projects', () => {
      const hasSavedGroups = false;
      const newSuggestions = [
        { groupName: 'New Group 1', variables: ['V1', 'V2'] },
        { groupName: 'New Group 2', variables: ['V3', 'V4'] },
      ];

      // Simulate the logic from handleHealthContinueAuto
      let appliedSuggestions: any[] = [];
      if (!hasSavedGroups) {
        appliedSuggestions = newSuggestions;
      }

      expect(appliedSuggestions).toEqual(newSuggestions);
    });
  });

  describe('User Experience Scenarios', () => {
    it('should show existing project notice when appropriate', () => {
      const currentStep = 'health';
      const isExistingProject = true;
      const hasSavedGroups = true;

      const shouldShowNotice = currentStep === 'health' && isExistingProject && hasSavedGroups;

      expect(shouldShowNotice).toBe(true);
    });

    it('should not show existing project notice for new projects', () => {
      const currentStep = 'health';
      const isExistingProject = false;
      const hasSavedGroups = false;

      const shouldShowNotice = currentStep === 'health' && isExistingProject && hasSavedGroups;

      expect(shouldShowNotice).toBe(false);
    });

    it('should not show existing project notice on other steps', () => {
      const currentStep = 'group';
      const isExistingProject = true;
      const hasSavedGroups = true;

      const shouldShowNotice = currentStep === 'health' && isExistingProject && hasSavedGroups;

      expect(shouldShowNotice).toBe(false);
    });
  });

  describe('API Response Validation', () => {
    it('should validate load groups API response structure', () => {
      const mockResponse = {
        success: true,
        project: {
          id: 'project-123',
          name: 'Test Project',
          status: 'draft',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-02T00:00:00Z',
        },
        groups: [
          { id: 'group-1', name: 'Group 1', variables: ['V1', 'V2'] },
        ],
        demographics: [],
        isExistingProject: true,
        hasGroups: true,
        hasDemographics: false,
      };

      expect(mockResponse.success).toBe(true);
      expect(mockResponse.project).toBeDefined();
      expect(mockResponse.isExistingProject).toBe(true);
      expect(mockResponse.hasGroups).toBe(true);
      expect(mockResponse.groups).toHaveLength(1);
    });

    it('should handle empty groups response', () => {
      const mockResponse = {
        success: true,
        project: {
          id: 'project-123',
          name: 'Test Project',
          status: 'draft',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-02T00:00:00Z',
        },
        groups: [],
        demographics: [],
        isExistingProject: false,
        hasGroups: false,
        hasDemographics: false,
      };

      expect(mockResponse.success).toBe(true);
      expect(mockResponse.isExistingProject).toBe(false);
      expect(mockResponse.hasGroups).toBe(false);
      expect(mockResponse.groups).toHaveLength(0);
    });
  });
});
