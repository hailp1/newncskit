/**
 * Role Suggestion Service
 * 
 * Provides smart suggestions for variable roles based on semantic analysis
 * of variable names and patterns. Supports detection of:
 * - Dependent Variables (DV): Outcome/result variables
 * - Control Variables: Demographics and control factors
 * - Mediator Variables: Variables that explain relationships
 * - Latent Variables: Constructs measured by multiple indicators
 */

import { 
  AnalysisVariable, 
  VariableGroup, 
  RoleSuggestion, 
  VariableRole 
} from '@/types/analysis';

export class RoleSuggestionService {
  /**
   * Keywords commonly found in dependent variable names
   * These indicate outcome or result variables
   */
  private static readonly DV_KEYWORDS = [
    'satisfaction',
    'outcome',
    'result',
    'performance',
    'success',
    'intention',
    'behavior',
    'behaviour',
    'loyalty',
    'trust',
    'quality',
    'effectiveness',
    'efficiency',
    'impact',
    'achievement',
    'attainment',
    'completion',
    'adoption',
    'usage',
    'engagement'
  ];

  /**
   * Keywords commonly found in control variable names
   * These are typically demographic or contextual variables
   */
  private static readonly CONTROL_KEYWORDS = [
    'age',
    'gender',
    'sex',
    'income',
    'education',
    'experience',
    'tenure',
    'size',
    'location',
    'industry',
    'sector',
    'region',
    'country',
    'city',
    'department',
    'position',
    'role',
    'level',
    'grade',
    'year',
    'time'
  ];

  /**
   * Keywords commonly found in mediator variable names
   * These variables typically explain relationships between IV and DV
   */
  private static readonly MEDIATOR_KEYWORDS = [
    'perception',
    'attitude',
    'belief',
    'value',
    'motivation',
    'expectation',
    'understanding',
    'awareness',
    'knowledge',
    'skill',
    'ability',
    'confidence',
    'self-efficacy',
    'commitment',
    'involvement'
  ];

  /**
   * Suggest roles for individual variables based on semantic analysis
   * 
   * @param variables - Array of analysis variables to analyze
   * @returns Array of role suggestions with confidence scores and reasons
   */
  static suggestRoles(variables: AnalysisVariable[]): RoleSuggestion[] {
    return variables.map(variable => {
      const name = variable.columnName.toLowerCase();
      const displayName = (variable.displayName || variable.columnName).toLowerCase();
      const searchText = `${name} ${displayName}`;
      
      // Check for DV patterns
      const dvMatch = this.DV_KEYWORDS.find(kw => searchText.includes(kw));
      if (dvMatch) {
        return {
          variableId: variable.id,
          columnName: variable.columnName,
          suggestedRole: 'dependent',
          confidence: 0.8,
          reasons: [`Contains keyword "${dvMatch}" commonly used for outcomes`]
        };
      }

      // Check for control patterns
      const controlMatch = this.CONTROL_KEYWORDS.find(kw => searchText.includes(kw));
      if (controlMatch) {
        return {
          variableId: variable.id,
          columnName: variable.columnName,
          suggestedRole: 'control',
          confidence: 0.9,
          reasons: [`Demographic variable "${controlMatch}"`]
        };
      }

      // Check for mediator patterns
      const mediatorMatch = this.MEDIATOR_KEYWORDS.find(kw => searchText.includes(kw));
      if (mediatorMatch) {
        return {
          variableId: variable.id,
          columnName: variable.columnName,
          suggestedRole: 'mediator',
          confidence: 0.7,
          reasons: [`Contains "${mediatorMatch}" which often mediates relationships`]
        };
      }

      // Default: no suggestion
      return {
        variableId: variable.id,
        columnName: variable.columnName,
        suggestedRole: 'none',
        confidence: 0,
        reasons: []
      };
    });
  }

  /**
   * Suggest latent variables based on variable groups
   * Groups with 3+ variables are good candidates for latent constructs
   * 
   * @param groups - Array of variable groups to analyze
   * @returns Array of latent variable suggestions
   */
  static suggestLatentVariables(groups: VariableGroup[]): RoleSuggestion[] {
    return groups
      .filter(group => group.variables && group.variables.length >= 3)
      .map(group => ({
        variableId: group.id,
        columnName: group.name,
        suggestedRole: 'latent' as VariableRole,
        confidence: 0.85,
        reasons: [
          `Group has ${group.variables.length} indicators`,
          'Suitable for latent variable modeling (CFA/SEM)'
        ]
      }));
  }
}
