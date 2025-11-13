/**
 * Role Validation Service Tests
 * 
 * Tests for validation of variable role assignments
 * Requirements: 11.1, 11.2, 11.3, 11.4
 */

import { describe, it, expect } from 'vitest';
import { RoleValidationService } from '../role-validation.service';
import { VariableRoleTag, VariableGroup } from '@/types/analysis';

describe('RoleValidationService', () => {
  describe('validateForRegression', () => {
    it('should validate valid regression configuration', () => {
      const roleTags: VariableRoleTag[] = [
        {
          variableId: 'var-1',
          columnName: 'satisfaction',
          role: 'dependent',
          isUserAssigned: true,
        },
        {
          variableId: 'var-2',
          columnName: 'quality',
          role: 'independent',
          isUserAssigned: true,
        },
        {
          variableId: 'var-3',
          columnName: 'price',
          role: 'independent',
          isUserAssigned: true,
        },
      ];

      const result = RoleValidationService.validateForRegression(roleTags);

      expect(result.isValid).toBe(true);
      expect(result.analysisTypes).toContain('regression');
      expect(result.errors).toHaveLength(0);
    });

    it('should error when no DV is assigned', () => {
      const roleTags: VariableRoleTag[] = [
        {
          variableId: 'var-1',
          columnName: 'quality',
          role: 'independent',
          isUserAssigned: true,
        },
      ];

      const result = RoleValidationService.validateForRegression(roleTags);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Regression requires exactly one Dependent Variable (DV)');
    });

    it('should error when multiple DVs are assigned', () => {
      const roleTags: VariableRoleTag[] = [
        {
          variableId: 'var-1',
          columnName: 'satisfaction',
          role: 'dependent',
          isUserAssigned: true,
        },
        {
          variableId: 'var-2',
          columnName: 'loyalty',
          role: 'dependent',
          isUserAssigned: true,
        },
        {
          variableId: 'var-3',
          columnName: 'quality',
          role: 'independent',
          isUserAssigned: true,
        },
      ];

      const result = RoleValidationService.validateForRegression(roleTags);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Multiple DVs selected (2). Regression requires exactly one DV');
    });

    it('should error when no IV is assigned', () => {
      const roleTags: VariableRoleTag[] = [
        {
          variableId: 'var-1',
          columnName: 'satisfaction',
          role: 'dependent',
          isUserAssigned: true,
        },
      ];

      const result = RoleValidationService.validateForRegression(roleTags);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Regression requires at least one Independent Variable (IV)');
    });

    it('should warn when more than 10 IVs are assigned', () => {
      const roleTags: VariableRoleTag[] = [
        {
          variableId: 'var-dv',
          columnName: 'satisfaction',
          role: 'dependent',
          isUserAssigned: true,
        },
        ...Array.from({ length: 12 }, (_, i) => ({
          variableId: `var-iv-${i}`,
          columnName: `iv${i}`,
          role: 'independent' as const,
          isUserAssigned: true,
        })),
      ];

      const result = RoleValidationService.validateForRegression(roleTags);

      expect(result.isValid).toBe(true);
      expect(result.warnings).toContain('12 IVs may cause multicollinearity. Consider reducing.');
    });

    it('should suggest control variables when missing', () => {
      const roleTags: VariableRoleTag[] = [
        {
          variableId: 'var-1',
          columnName: 'satisfaction',
          role: 'dependent',
          isUserAssigned: true,
        },
        {
          variableId: 'var-2',
          columnName: 'quality',
          role: 'independent',
          isUserAssigned: true,
        },
      ];

      const result = RoleValidationService.validateForRegression(roleTags);

      expect(result.isValid).toBe(true);
      expect(result.suggestions).toContain('Consider adding control variables to improve model validity');
    });

    it('should not suggest control variables when errors exist', () => {
      const roleTags: VariableRoleTag[] = [
        {
          variableId: 'var-1',
          columnName: 'quality',
          role: 'independent',
          isUserAssigned: true,
        },
      ];

      const result = RoleValidationService.validateForRegression(roleTags);

      expect(result.isValid).toBe(false);
      expect(result.suggestions).toHaveLength(0);
    });
  });

  describe('validateForSEM', () => {
    const createGroup = (id: string, name: string, varCount: number): VariableGroup => ({
      id,
      name,
      variables: Array.from({ length: varCount }, (_, i) => `${name}${i + 1}`),
      createdAt: new Date(),
      updatedAt: new Date(),
      isCustom: false,
    });

    it('should validate valid SEM configuration', () => {
      const roleTags: VariableRoleTag[] = [
        {
          variableId: 'group-1',
          columnName: 'Trust',
          role: 'latent',
          isUserAssigned: true,
        },
        {
          variableId: 'group-2',
          columnName: 'Quality',
          role: 'latent',
          isUserAssigned: true,
        },
      ];

      const groups: VariableGroup[] = [
        createGroup('group-1', 'Trust', 3),
        createGroup('group-2', 'Quality', 4),
      ];

      const result = RoleValidationService.validateForSEM(roleTags, groups);

      expect(result.isValid).toBe(true);
      expect(result.analysisTypes).toContain('sem');
      expect(result.analysisTypes).toContain('cfa');
      expect(result.errors).toHaveLength(0);
    });

    it('should error when less than 2 latent variables', () => {
      const roleTags: VariableRoleTag[] = [
        {
          variableId: 'group-1',
          columnName: 'Trust',
          role: 'latent',
          isUserAssigned: true,
        },
      ];

      const groups: VariableGroup[] = [
        createGroup('group-1', 'Trust', 3),
      ];

      const result = RoleValidationService.validateForSEM(roleTags, groups);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('SEM requires at least 2 latent variables');
    });

    it('should error when latent variable has less than 3 indicators', () => {
      const roleTags: VariableRoleTag[] = [
        {
          variableId: 'group-1',
          columnName: 'Trust',
          role: 'latent',
          isUserAssigned: true,
        },
        {
          variableId: 'group-2',
          columnName: 'Quality',
          role: 'latent',
          isUserAssigned: true,
        },
      ];

      const groups: VariableGroup[] = [
        createGroup('group-1', 'Trust', 2),
        createGroup('group-2', 'Quality', 3),
      ];

      const result = RoleValidationService.validateForSEM(roleTags, groups);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Latent variable "Trust" has only 2 indicators. Minimum 3 required.');
    });

    it('should error when latent variable is not associated with a group', () => {
      const roleTags: VariableRoleTag[] = [
        {
          variableId: 'group-1',
          columnName: 'Trust',
          role: 'latent',
          isUserAssigned: true,
        },
        {
          variableId: 'group-2',
          columnName: 'Quality',
          role: 'latent',
          isUserAssigned: true,
        },
      ];

      const groups: VariableGroup[] = [
        createGroup('group-1', 'Trust', 3),
        // group-2 is missing
      ];

      const result = RoleValidationService.validateForSEM(roleTags, groups);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(
        'Latent variable "Quality" must be associated with a group of at least 3 indicator variables'
      );
    });

    it('should warn when no DV is specified', () => {
      const roleTags: VariableRoleTag[] = [
        {
          variableId: 'group-1',
          columnName: 'Trust',
          role: 'latent',
          isUserAssigned: true,
        },
        {
          variableId: 'group-2',
          columnName: 'Quality',
          role: 'latent',
          isUserAssigned: true,
        },
      ];

      const groups: VariableGroup[] = [
        createGroup('group-1', 'Trust', 3),
        createGroup('group-2', 'Quality', 3),
      ];

      const result = RoleValidationService.validateForSEM(roleTags, groups);

      expect(result.isValid).toBe(true);
      expect(result.warnings).toContain('No dependent variable specified. SEM model may be incomplete.');
    });

    it('should not warn about missing DV when less than 2 latents', () => {
      const roleTags: VariableRoleTag[] = [
        {
          variableId: 'group-1',
          columnName: 'Trust',
          role: 'latent',
          isUserAssigned: true,
        },
      ];

      const groups: VariableGroup[] = [
        createGroup('group-1', 'Trust', 3),
      ];

      const result = RoleValidationService.validateForSEM(roleTags, groups);

      expect(result.warnings).toHaveLength(0);
    });
  });

  describe('validateForMediation', () => {
    it('should validate valid mediation configuration', () => {
      const roleTags: VariableRoleTag[] = [
        {
          variableId: 'var-1',
          columnName: 'quality',
          role: 'independent',
          isUserAssigned: true,
        },
        {
          variableId: 'var-2',
          columnName: 'trust',
          role: 'mediator',
          isUserAssigned: true,
        },
        {
          variableId: 'var-3',
          columnName: 'satisfaction',
          role: 'dependent',
          isUserAssigned: true,
        },
      ];

      const result = RoleValidationService.validateForMediation(roleTags);

      expect(result.isValid).toBe(true);
      expect(result.analysisTypes).toContain('regression');
      expect(result.errors).toHaveLength(0);
    });

    it('should error when no IV is assigned', () => {
      const roleTags: VariableRoleTag[] = [
        {
          variableId: 'var-1',
          columnName: 'trust',
          role: 'mediator',
          isUserAssigned: true,
        },
        {
          variableId: 'var-2',
          columnName: 'satisfaction',
          role: 'dependent',
          isUserAssigned: true,
        },
      ];

      const result = RoleValidationService.validateForMediation(roleTags);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Mediation requires at least one IV');
    });

    it('should error when no DV is assigned', () => {
      const roleTags: VariableRoleTag[] = [
        {
          variableId: 'var-1',
          columnName: 'quality',
          role: 'independent',
          isUserAssigned: true,
        },
        {
          variableId: 'var-2',
          columnName: 'trust',
          role: 'mediator',
          isUserAssigned: true,
        },
      ];

      const result = RoleValidationService.validateForMediation(roleTags);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Mediation requires at least one DV');
    });

    it('should error when no Mediator is assigned', () => {
      const roleTags: VariableRoleTag[] = [
        {
          variableId: 'var-1',
          columnName: 'quality',
          role: 'independent',
          isUserAssigned: true,
        },
        {
          variableId: 'var-2',
          columnName: 'satisfaction',
          role: 'dependent',
          isUserAssigned: true,
        },
      ];

      const result = RoleValidationService.validateForMediation(roleTags);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Mediation requires at least one Mediator');
    });

    it('should warn when more than 3 mediators', () => {
      const roleTags: VariableRoleTag[] = [
        {
          variableId: 'var-1',
          columnName: 'quality',
          role: 'independent',
          isUserAssigned: true,
        },
        {
          variableId: 'var-2',
          columnName: 'satisfaction',
          role: 'dependent',
          isUserAssigned: true,
        },
        ...Array.from({ length: 4 }, (_, i) => ({
          variableId: `var-m-${i}`,
          columnName: `mediator${i}`,
          role: 'mediator' as const,
          isUserAssigned: true,
        })),
      ];

      const result = RoleValidationService.validateForMediation(roleTags);

      expect(result.isValid).toBe(true);
      expect(result.warnings).toContain('Multiple mediators detected. Consider testing them separately.');
    });
  });

  describe('validateAll', () => {
    const createGroup = (id: string, name: string, varCount: number): VariableGroup => ({
      id,
      name,
      variables: Array.from({ length: varCount }, (_, i) => `${name}${i + 1}`),
      createdAt: new Date(),
      updatedAt: new Date(),
      isCustom: false,
    });

    it('should combine results from all validation methods', () => {
      const roleTags: VariableRoleTag[] = [
        {
          variableId: 'var-1',
          columnName: 'satisfaction',
          role: 'dependent',
          isUserAssigned: true,
        },
        {
          variableId: 'var-2',
          columnName: 'quality',
          role: 'independent',
          isUserAssigned: true,
        },
      ];

      const groups: VariableGroup[] = [];

      const result = RoleValidationService.validateAll(roleTags, groups);

      expect(result.isValid).toBe(true);
      expect(result.analysisTypes).toContain('regression');
    });

    it('should return multiple valid analysis types', () => {
      const roleTags: VariableRoleTag[] = [
        {
          variableId: 'var-1',
          columnName: 'quality',
          role: 'independent',
          isUserAssigned: true,
        },
        {
          variableId: 'var-2',
          columnName: 'trust',
          role: 'mediator',
          isUserAssigned: true,
        },
        {
          variableId: 'var-3',
          columnName: 'satisfaction',
          role: 'dependent',
          isUserAssigned: true,
        },
      ];

      const groups: VariableGroup[] = [];

      const result = RoleValidationService.validateAll(roleTags, groups);

      expect(result.isValid).toBe(true);
      // Should be valid for both regression and mediation
      expect(result.analysisTypes).toContain('regression');
    });

    it('should combine all errors from different validations', () => {
      const roleTags: VariableRoleTag[] = [
        {
          variableId: 'var-1',
          columnName: 'quality',
          role: 'independent',
          isUserAssigned: true,
        },
      ];

      const groups: VariableGroup[] = [];

      const result = RoleValidationService.validateAll(roleTags, groups);

      expect(result.isValid).toBe(false);
      // Should have errors from regression, SEM, and mediation validations
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors).toContain('Regression requires exactly one Dependent Variable (DV)');
      expect(result.errors).toContain('SEM requires at least 2 latent variables');
      expect(result.errors).toContain('Mediation requires at least one DV');
    });

    it('should remove duplicate analysis types', () => {
      const roleTags: VariableRoleTag[] = [
        {
          variableId: 'var-1',
          columnName: 'satisfaction',
          role: 'dependent',
          isUserAssigned: true,
        },
        {
          variableId: 'var-2',
          columnName: 'quality',
          role: 'independent',
          isUserAssigned: true,
        },
        {
          variableId: 'var-3',
          columnName: 'trust',
          role: 'mediator',
          isUserAssigned: true,
        },
      ];

      const groups: VariableGroup[] = [];

      const result = RoleValidationService.validateAll(roleTags, groups);

      // Both regression and mediation return 'regression' as analysis type
      // Should only appear once
      const regressionCount = result.analysisTypes.filter(t => t === 'regression').length;
      expect(regressionCount).toBe(1);
    });

    it('should handle complex configuration with SEM', () => {
      const roleTags: VariableRoleTag[] = [
        {
          variableId: 'group-1',
          columnName: 'Trust',
          role: 'latent',
          isUserAssigned: true,
        },
        {
          variableId: 'group-2',
          columnName: 'Quality',
          role: 'latent',
          isUserAssigned: true,
        },
        {
          variableId: 'var-1',
          columnName: 'satisfaction',
          role: 'dependent',
          isUserAssigned: true,
        },
      ];

      const groups: VariableGroup[] = [
        createGroup('group-1', 'Trust', 3),
        createGroup('group-2', 'Quality', 4),
      ];

      const result = RoleValidationService.validateAll(roleTags, groups);

      expect(result.isValid).toBe(true);
      expect(result.analysisTypes).toContain('sem');
      expect(result.analysisTypes).toContain('cfa');
    });
  });
});
