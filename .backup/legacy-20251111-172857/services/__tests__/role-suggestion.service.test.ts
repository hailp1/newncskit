/**
 * Role Suggestion Service Tests
 * 
 * Tests for smart role suggestions based on variable names
 * Requirements: 12.1, 12.2, 12.3
 */

import { describe, it, expect } from 'vitest';
import { RoleSuggestionService } from '../role-suggestion.service';
import { AnalysisVariable, VariableGroup } from '@/types/analysis';

describe('RoleSuggestionService', () => {
  describe('suggestRoles', () => {
    describe('DV Detection', () => {
      it('should suggest DV role for outcome keywords', () => {
        const variables: AnalysisVariable[] = [
          {
            id: 'var-1',
            projectId: 'proj-1',
            columnName: 'customer_satisfaction',
            dataType: 'numeric',
            isDemographic: false,
            missingCount: 0,
            uniqueCount: 5,
            createdAt: new Date().toISOString(),
          },
        ];

        const suggestions = RoleSuggestionService.suggestRoles(variables);

        expect(suggestions).toHaveLength(1);
        expect(suggestions[0].suggestedRole).toBe('dependent');
        expect(suggestions[0].confidence).toBe(0.8);
        expect(suggestions[0].reasons[0]).toContain('satisfaction');
      });

      it('should detect DV keywords: outcome, result, performance', () => {
        const testCases = ['outcome', 'result', 'performance', 'success'];
        
        testCases.forEach(keyword => {
          const variables: AnalysisVariable[] = [
            {
              id: `var-${keyword}`,
              projectId: 'proj-1',
              columnName: keyword,
              dataType: 'numeric',
              isDemographic: false,
              missingCount: 0,
              uniqueCount: 5,
              createdAt: new Date().toISOString(),
            },
          ];

          const suggestions = RoleSuggestionService.suggestRoles(variables);
          expect(suggestions[0].suggestedRole).toBe('dependent');
          expect(suggestions[0].reasons[0]).toContain(keyword);
        });
      });

      it('should detect DV in displayName', () => {
        const variables: AnalysisVariable[] = [
          {
            id: 'var-1',
            projectId: 'proj-1',
            columnName: 'Q1',
            displayName: 'Overall Satisfaction',
            dataType: 'numeric',
            isDemographic: false,
            missingCount: 0,
            uniqueCount: 5,
            createdAt: new Date().toISOString(),
          },
        ];

        const suggestions = RoleSuggestionService.suggestRoles(variables);
        expect(suggestions[0].suggestedRole).toBe('dependent');
      });
    });

    describe('Control Variable Detection', () => {
      it('should suggest control role for demographic keywords', () => {
        const variables: AnalysisVariable[] = [
          {
            id: 'var-1',
            projectId: 'proj-1',
            columnName: 'age',
            dataType: 'numeric',
            isDemographic: false,
            missingCount: 0,
            uniqueCount: 50,
            createdAt: new Date().toISOString(),
          },
        ];

        const suggestions = RoleSuggestionService.suggestRoles(variables);

        expect(suggestions).toHaveLength(1);
        expect(suggestions[0].suggestedRole).toBe('control');
        expect(suggestions[0].confidence).toBe(0.9);
        expect(suggestions[0].reasons[0]).toContain('age');
      });

      it('should detect control keywords: gender, income, education', () => {
        const testCases = ['gender', 'income', 'education', 'experience'];
        
        testCases.forEach(keyword => {
          const variables: AnalysisVariable[] = [
            {
              id: `var-${keyword}`,
              projectId: 'proj-1',
              columnName: keyword,
              dataType: 'categorical',
              isDemographic: false,
              missingCount: 0,
              uniqueCount: 3,
              createdAt: new Date().toISOString(),
            },
          ];

          const suggestions = RoleSuggestionService.suggestRoles(variables);
          expect(suggestions[0].suggestedRole).toBe('control');
          expect(suggestions[0].reasons[0]).toContain(keyword);
        });
      });
    });

    describe('Mediator Detection', () => {
      it('should suggest mediator role for perception keywords', () => {
        const variables: AnalysisVariable[] = [
          {
            id: 'var-1',
            projectId: 'proj-1',
            columnName: 'customer_perception',
            dataType: 'numeric',
            isDemographic: false,
            missingCount: 0,
            uniqueCount: 5,
            createdAt: new Date().toISOString(),
          },
        ];

        const suggestions = RoleSuggestionService.suggestRoles(variables);

        expect(suggestions).toHaveLength(1);
        expect(suggestions[0].suggestedRole).toBe('mediator');
        expect(suggestions[0].confidence).toBe(0.7);
        expect(suggestions[0].reasons[0]).toContain('perception');
      });

      it('should detect mediator keywords: attitude, belief, motivation', () => {
        const testCases = ['attitude', 'belief', 'motivation', 'value'];
        
        testCases.forEach(keyword => {
          const variables: AnalysisVariable[] = [
            {
              id: `var-${keyword}`,
              projectId: 'proj-1',
              columnName: keyword,
              dataType: 'numeric',
              isDemographic: false,
              missingCount: 0,
              uniqueCount: 5,
              createdAt: new Date().toISOString(),
            },
          ];

          const suggestions = RoleSuggestionService.suggestRoles(variables);
          expect(suggestions[0].suggestedRole).toBe('mediator');
        });
      });
    });

    describe('Priority and Confidence', () => {
      it('should prioritize DV over control when both match', () => {
        // "age" is a control keyword, but if combined with outcome keyword, DV should win
        const variables: AnalysisVariable[] = [
          {
            id: 'var-1',
            projectId: 'proj-1',
            columnName: 'satisfaction_age',
            dataType: 'numeric',
            isDemographic: false,
            missingCount: 0,
            uniqueCount: 5,
            createdAt: new Date().toISOString(),
          },
        ];

        const suggestions = RoleSuggestionService.suggestRoles(variables);
        // DV keywords are checked first, so satisfaction should match
        expect(suggestions[0].suggestedRole).toBe('dependent');
      });

      it('should return none for variables with no matching keywords', () => {
        const variables: AnalysisVariable[] = [
          {
            id: 'var-1',
            projectId: 'proj-1',
            columnName: 'Q1_response',
            dataType: 'numeric',
            isDemographic: false,
            missingCount: 0,
            uniqueCount: 5,
            createdAt: new Date().toISOString(),
          },
        ];

        const suggestions = RoleSuggestionService.suggestRoles(variables);

        expect(suggestions).toHaveLength(1);
        expect(suggestions[0].suggestedRole).toBe('none');
        expect(suggestions[0].confidence).toBe(0);
        expect(suggestions[0].reasons).toEqual([]);
      });
    });

    describe('Edge Cases', () => {
      it('should handle empty variable array', () => {
        const suggestions = RoleSuggestionService.suggestRoles([]);
        expect(suggestions).toEqual([]);
      });

      it('should handle variables with special characters', () => {
        const variables: AnalysisVariable[] = [
          {
            id: 'var-1',
            projectId: 'proj-1',
            columnName: 'customer_satisfaction_2024!',
            dataType: 'numeric',
            isDemographic: false,
            missingCount: 0,
            uniqueCount: 5,
            createdAt: new Date().toISOString(),
          },
        ];

        const suggestions = RoleSuggestionService.suggestRoles(variables);
        expect(suggestions[0].suggestedRole).toBe('dependent');
      });

      it('should handle variables with uppercase names', () => {
        const variables: AnalysisVariable[] = [
          {
            id: 'var-1',
            projectId: 'proj-1',
            columnName: 'CUSTOMER_SATISFACTION',
            dataType: 'numeric',
            isDemographic: false,
            missingCount: 0,
            uniqueCount: 5,
            createdAt: new Date().toISOString(),
          },
        ];

        const suggestions = RoleSuggestionService.suggestRoles(variables);
        expect(suggestions[0].suggestedRole).toBe('dependent');
      });

      it('should handle variables without displayName', () => {
        const variables: AnalysisVariable[] = [
          {
            id: 'var-1',
            projectId: 'proj-1',
            columnName: 'age',
            displayName: undefined,
            dataType: 'numeric',
            isDemographic: false,
            missingCount: 0,
            uniqueCount: 50,
            createdAt: new Date().toISOString(),
          },
        ];

        const suggestions = RoleSuggestionService.suggestRoles(variables);
        expect(suggestions[0].suggestedRole).toBe('control');
      });
    });
  });

  describe('suggestLatentVariables', () => {
    it('should suggest latent role for groups with 3+ variables', () => {
      const groups: VariableGroup[] = [
        {
          id: 'group-1',
          name: 'Trust',
          variables: ['TR1', 'TR2', 'TR3'],
          createdAt: new Date(),
          updatedAt: new Date(),
          isCustom: false,
        },
      ];

      const suggestions = RoleSuggestionService.suggestLatentVariables(groups);

      expect(suggestions).toHaveLength(1);
      expect(suggestions[0].suggestedRole).toBe('latent');
      expect(suggestions[0].confidence).toBe(0.85);
      expect(suggestions[0].reasons).toContain('Group has 3 indicators');
      expect(suggestions[0].reasons).toContain('Suitable for latent variable modeling (CFA/SEM)');
    });

    it('should not suggest latent for groups with less than 3 variables', () => {
      const groups: VariableGroup[] = [
        {
          id: 'group-1',
          name: 'Small Group',
          variables: ['V1', 'V2'],
          createdAt: new Date(),
          updatedAt: new Date(),
          isCustom: false,
        },
      ];

      const suggestions = RoleSuggestionService.suggestLatentVariables(groups);
      expect(suggestions).toEqual([]);
    });

    it('should handle multiple groups', () => {
      const groups: VariableGroup[] = [
        {
          id: 'group-1',
          name: 'Trust',
          variables: ['TR1', 'TR2', 'TR3'],
          createdAt: new Date(),
          updatedAt: new Date(),
          isCustom: false,
        },
        {
          id: 'group-2',
          name: 'Quality',
          variables: ['Q1', 'Q2', 'Q3', 'Q4'],
          createdAt: new Date(),
          updatedAt: new Date(),
          isCustom: false,
        },
        {
          id: 'group-3',
          name: 'Small',
          variables: ['S1', 'S2'],
          createdAt: new Date(),
          updatedAt: new Date(),
          isCustom: false,
        },
      ];

      const suggestions = RoleSuggestionService.suggestLatentVariables(groups);

      expect(suggestions).toHaveLength(2);
      expect(suggestions[0].columnName).toBe('Trust');
      expect(suggestions[1].columnName).toBe('Quality');
      expect(suggestions[1].reasons[0]).toContain('4 indicators');
    });

    it('should handle empty groups array', () => {
      const suggestions = RoleSuggestionService.suggestLatentVariables([]);
      expect(suggestions).toEqual([]);
    });

    it('should handle groups without variables array', () => {
      const groups: VariableGroup[] = [
        {
          id: 'group-1',
          name: 'Empty Group',
          variables: [],
          createdAt: new Date(),
          updatedAt: new Date(),
          isCustom: false,
        },
      ];

      const suggestions = RoleSuggestionService.suggestLatentVariables(groups);
      expect(suggestions).toEqual([]);
    });
  });
});
