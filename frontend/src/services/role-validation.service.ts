/**
 * Role Validation Service
 * 
 * Validates variable role assignments for different analysis types:
 * - Regression: Requires 1 DV and at least 1 IV
 * - SEM: Requires at least 2 latent variables with 3+ indicators each
 * - Mediation: Requires IV, DV, and Mediator
 */

import { 
  VariableRoleTag, 
  VariableGroup, 
  AnalysisModelValidation,
  AnalysisType 
} from '@/types/analysis';

export class RoleValidationService {
  /**
   * Validate role assignments for regression analysis
   * Requirements: 11.1, 11.2
   */
  static validateForRegression(roleTags: VariableRoleTag[]): AnalysisModelValidation {
    const dvs = roleTags.filter(t => t.role === 'dependent');
    const ivs = roleTags.filter(t => t.role === 'independent');
    const controls = roleTags.filter(t => t.role === 'control');
    
    const errors: string[] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];

    // Must have exactly 1 DV
    if (dvs.length === 0) {
      errors.push('Regression requires exactly one Dependent Variable (DV)');
    } else if (dvs.length > 1) {
      errors.push(`Multiple DVs selected (${dvs.length}). Regression requires exactly one DV`);
    }

    // Must have at least 1 IV
    if (ivs.length === 0) {
      errors.push('Regression requires at least one Independent Variable (IV)');
    }

    // Warnings for best practices
    if (ivs.length > 10) {
      warnings.push(`${ivs.length} IVs may cause multicollinearity. Consider reducing.`);
    }

    // Suggest control variables if missing
    if (controls.length === 0 && errors.length === 0) {
      suggestions.push('Consider adding control variables to improve model validity');
    }

    return {
      isValid: errors.length === 0,
      analysisTypes: errors.length === 0 ? ['regression'] : [],
      errors,
      warnings,
      suggestions
    };
  }

  /**
   * Validate role assignments for SEM (Structural Equation Modeling) analysis
   * Requirements: 11.3, 11.4
   */
  static validateForSEM(
    roleTags: VariableRoleTag[], 
    groups: VariableGroup[]
  ): AnalysisModelValidation {
    const latents = roleTags.filter(t => t.role === 'latent');
    const dvs = roleTags.filter(t => t.role === 'dependent');
    
    const errors: string[] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];

    // Must have at least 2 latent variables
    if (latents.length < 2) {
      errors.push('SEM requires at least 2 latent variables');
    }

    // Each latent must have at least 3 indicators
    latents.forEach(latent => {
      const group = groups.find(g => g.id === latent.variableId);
      if (group && group.variables) {
        if (group.variables.length < 3) {
          errors.push(
            `Latent variable "${latent.columnName}" has only ${group.variables.length} indicators. Minimum 3 required.`
          );
        }
      } else {
        // Latent variable not associated with a group
        errors.push(
          `Latent variable "${latent.columnName}" must be associated with a group of at least 3 indicator variables`
        );
      }
    });

    // Check for dependent variables (paths)
    if (dvs.length === 0 && latents.length >= 2) {
      warnings.push('No dependent variable specified. SEM model may be incomplete.');
    }

    return {
      isValid: errors.length === 0,
      analysisTypes: errors.length === 0 ? ['sem', 'cfa'] : [],
      errors,
      warnings,
      suggestions
    };
  }

  /**
   * Validate role assignments for mediation analysis
   * Requirements: 11.1, 11.2
   */
  static validateForMediation(roleTags: VariableRoleTag[]): AnalysisModelValidation {
    const ivs = roleTags.filter(t => t.role === 'independent');
    const dvs = roleTags.filter(t => t.role === 'dependent');
    const mediators = roleTags.filter(t => t.role === 'mediator');
    
    const errors: string[] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];

    // Must have at least one of each: IV, DV, Mediator
    if (ivs.length === 0) {
      errors.push('Mediation requires at least one IV');
    }
    if (dvs.length === 0) {
      errors.push('Mediation requires at least one DV');
    }
    if (mediators.length === 0) {
      errors.push('Mediation requires at least one Mediator');
    }

    // Warn about multiple mediators
    if (mediators.length > 3) {
      warnings.push('Multiple mediators detected. Consider testing them separately.');
    }

    return {
      isValid: errors.length === 0,
      analysisTypes: errors.length === 0 ? ['regression'] : [], // Mediation uses regression
      errors,
      warnings,
      suggestions
    };
  }

  /**
   * Validate all role assignments and return combined results
   * Requirements: 11.4, 11.5
   */
  static validateAll(
    roleTags: VariableRoleTag[], 
    groups: VariableGroup[]
  ): AnalysisModelValidation {
    // Run all validation methods
    const regression = this.validateForRegression(roleTags);
    const sem = this.validateForSEM(roleTags, groups);
    const mediation = this.validateForMediation(roleTags);

    // Combine all valid analysis types (remove duplicates)
    const allAnalysisTypes = Array.from(new Set([
      ...regression.analysisTypes,
      ...sem.analysisTypes,
      ...mediation.analysisTypes
    ])) as AnalysisType[];

    // Combine all errors, warnings, and suggestions
    const allErrors = [
      ...regression.errors,
      ...sem.errors,
      ...mediation.errors
    ];

    const allWarnings = [
      ...regression.warnings,
      ...sem.warnings,
      ...mediation.warnings
    ];

    const allSuggestions = [
      ...regression.suggestions,
      ...sem.suggestions,
      ...mediation.suggestions
    ];

    return {
      isValid: allAnalysisTypes.length > 0,
      analysisTypes: allAnalysisTypes,
      errors: allErrors,
      warnings: allWarnings,
      suggestions: allSuggestions
    };
  }
}
