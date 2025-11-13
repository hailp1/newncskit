/**
 * Variable Grouping Service
 * Auto-group variables based on naming patterns
 */

import { AnalysisVariable, VariableGroupSuggestion } from '@/types/analysis';

interface PrefixPattern {
  prefix: string;
  variables: AnalysisVariable[];
  count: number;
}

interface NumberingPattern {
  base: string;
  variables: AnalysisVariable[];
  count: number;
}

export class VariableGroupingService {
  /**
   * Suggest variable groups based on naming patterns
   */
  static suggestGroups(variables: AnalysisVariable[]): VariableGroupSuggestion[] {
    const suggestions: VariableGroupSuggestion[] = [];
    
    // 1. Group by prefix patterns (e.g., Q1_, Q2_, Q3_)
    const prefixGroups = this.groupByPrefix(variables);
    suggestions.push(...prefixGroups);
    
    // 2. Group by numbering patterns (e.g., Item1, Item2, Item3)
    const numberGroups = this.groupByNumbering(variables);
    suggestions.push(...numberGroups);
    
    // 3. Group by semantic similarity
    const semanticGroups = this.groupBySemantic(variables);
    suggestions.push(...semanticGroups);
    
    // Remove duplicates and sort by confidence
    return this.deduplicateAndSort(suggestions);
  }

  /**
   * Group variables by common prefix (e.g., Q1_, Q2_)
   */
  private static groupByPrefix(variables: AnalysisVariable[]): VariableGroupSuggestion[] {
    const prefixMap = new Map<string, AnalysisVariable[]>();
    
    variables.forEach(variable => {
      // Extract prefix patterns:
      // - Q1_, Q2_, Q3_ -> Q
      // - Sat1_, Sat2_ -> Sat
      // - Trust_1, Trust_2 -> Trust
      const patterns = [
        /^([A-Za-z]+)\d+_/,  // Q1_, Q2_
        /^([A-Za-z]+)_\d+/,  // Trust_1, Trust_2
        /^([A-Za-z]+\d+)_/,  // Q1A_, Q1B_
      ];
      
      for (const pattern of patterns) {
        const match = variable.columnName.match(pattern);
        if (match) {
          const prefix = match[1];
          if (!prefixMap.has(prefix)) {
            prefixMap.set(prefix, []);
          }
          prefixMap.get(prefix)!.push(variable);
          break;
        }
      }
    });
    
    return Array.from(prefixMap.entries())
      .filter(([_, vars]) => vars.length >= 2)
      .map(([prefix, vars]): VariableGroupSuggestion => ({
        suggestedName: this.generateGroupName(prefix, vars),
        variables: vars.map(v => v.columnName),
        confidence: 0.9,
        reason: `Variables share common prefix "${prefix}" (${vars.length} items)`,
        pattern: 'prefix',
        editable: true
      }));
  }

  /**
   * Group variables by numbering pattern (e.g., Item1, Item2)
   */
  private static groupByNumbering(variables: AnalysisVariable[]): VariableGroupSuggestion[] {
    const baseMap = new Map<string, AnalysisVariable[]>();
    
    variables.forEach(variable => {
      // Extract base name patterns:
      // - Item1, Item2 -> Item
      // - Question1, Question2 -> Question
      // - Var_1, Var_2 -> Var
      const patterns = [
        /^([A-Za-z_]+)\d+$/,     // Item1, Item2
        /^([A-Za-z]+)_?\d+$/,    // Var1, Var_1
      ];
      
      for (const pattern of patterns) {
        const match = variable.columnName.match(pattern);
        if (match) {
          const base = match[1].replace(/_$/, ''); // Remove trailing underscore
          if (!baseMap.has(base)) {
            baseMap.set(base, []);
          }
          baseMap.get(base)!.push(variable);
          break;
        }
      }
    });
    
    return Array.from(baseMap.entries())
      .filter(([_, vars]) => vars.length >= 3)
      .map(([base, vars]): VariableGroupSuggestion => ({
        suggestedName: this.generateGroupName(base, vars),
        variables: vars.map(v => v.columnName),
        confidence: 0.85,
        reason: `Variables follow numbering pattern "${base}1, ${base}2, ..." (${vars.length} items)`,
        pattern: 'numbering',
        editable: true
      }));
  }

  /**
   * Group variables by semantic similarity
   */
  private static groupBySemantic(variables: AnalysisVariable[]): VariableGroupSuggestion[] {
    const suggestions: VariableGroupSuggestion[] = [];
    
    // Common semantic groups
    const semanticPatterns = [
      {
        keywords: ['satisfaction', 'sat', 'happy', 'pleased'],
        name: 'Satisfaction',
        confidence: 0.8
      },
      {
        keywords: ['trust', 'reliable', 'depend', 'honest'],
        name: 'Trust',
        confidence: 0.8
      },
      {
        keywords: ['loyalty', 'loyal', 'commitment', 'continue'],
        name: 'Loyalty',
        confidence: 0.8
      },
      {
        keywords: ['quality', 'excellent', 'superior', 'good'],
        name: 'Quality',
        confidence: 0.75
      },
      {
        keywords: ['value', 'worth', 'price', 'cost'],
        name: 'Value',
        confidence: 0.75
      },
      {
        keywords: ['service', 'support', 'help', 'assist'],
        name: 'Service',
        confidence: 0.75
      },
      {
        keywords: ['intention', 'intend', 'plan', 'will'],
        name: 'Intention',
        confidence: 0.75
      },
    ];
    
    semanticPatterns.forEach(pattern => {
      const matchingVars = variables.filter(v => {
        const lowerName = v.columnName.toLowerCase();
        return pattern.keywords.some(keyword => lowerName.includes(keyword));
      });
      
      if (matchingVars.length >= 2) {
        const suggestion: VariableGroupSuggestion = {
          suggestedName: pattern.name,
          variables: matchingVars.map(v => v.columnName),
          confidence: pattern.confidence,
          reason: `Variables contain semantic keywords related to "${pattern.name}" (${matchingVars.length} items)`,
          pattern: 'semantic',
          editable: true
        };
        suggestions.push(suggestion);
      }
    });
    
    return suggestions;
  }

  /**
   * Generate a meaningful group name
   */
  private static generateGroupName(base: string, variables: AnalysisVariable[]): string {
    // Clean up the base name
    let name = base
      .replace(/_/g, ' ')
      .replace(/([A-Z])/g, ' $1')
      .trim();
    
    // Capitalize first letter of each word
    name = name
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
    
    // If name is too short or generic, try to infer from variable names
    if (name.length < 3 || ['Q', 'V', 'X', 'Y'].includes(name)) {
      // Try to find common words in variable names
      const commonWords = this.findCommonWords(variables.map(v => v.columnName));
      if (commonWords.length > 0) {
        name = commonWords[0]
          .split(' ')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
          .join(' ');
      }
    }
    
    return name || 'Variable Group';
  }

  /**
   * Find common words in variable names
   */
  private static findCommonWords(names: string[]): string[] {
    if (names.length === 0) return [];
    
    // Extract words from all names
    const allWords = names.map(name => 
      name
        .replace(/[_\d]/g, ' ')
        .toLowerCase()
        .split(' ')
        .filter(word => word.length > 2)
    );
    
    // Find words that appear in all names
    const firstWords = allWords[0];
    const commonWords = firstWords.filter(word =>
      allWords.every(words => words.includes(word))
    );
    
    return commonWords;
  }

  /**
   * Remove duplicate suggestions and sort by confidence
   */
  private static deduplicateAndSort(suggestions: VariableGroupSuggestion[]): VariableGroupSuggestion[] {
    // Create a map to track unique variable sets
    const uniqueSuggestions = new Map<string, VariableGroupSuggestion>();
    
    suggestions.forEach(suggestion => {
      // Create a key from sorted variable names
      const key = [...suggestion.variables].sort().join('|');
      
      // Keep the suggestion with higher confidence
      const existing = uniqueSuggestions.get(key);
      if (!existing || suggestion.confidence > existing.confidence) {
        uniqueSuggestions.set(key, suggestion);
      }
    });
    
    // Convert back to array and sort by confidence
    return Array.from(uniqueSuggestions.values())
      .sort((a, b) => b.confidence - a.confidence);
  }

  /**
   * Detect common prefixes in variable names
   */
  static detectPrefixPatterns(names: string[]): PrefixPattern[] {
    const prefixMap = new Map<string, string[]>();
    
    names.forEach(name => {
      const match = name.match(/^([A-Za-z]+\d*)_/);
      if (match) {
        const prefix = match[1];
        if (!prefixMap.has(prefix)) {
          prefixMap.set(prefix, []);
        }
        prefixMap.get(prefix)!.push(name);
      }
    });
    
    return Array.from(prefixMap.entries())
      .filter(([_, vars]) => vars.length >= 2)
      .map(([prefix, vars]) => ({
        prefix,
        variables: vars.map(name => ({ columnName: name } as AnalysisVariable)),
        count: vars.length
      }));
  }

  /**
   * Detect numbering patterns in variable names
   */
  static detectNumberingPatterns(names: string[]): NumberingPattern[] {
    const baseMap = new Map<string, string[]>();
    
    names.forEach(name => {
      const match = name.match(/^([A-Za-z_]+)\d+$/);
      if (match) {
        const base = match[1].replace(/_$/, '');
        if (!baseMap.has(base)) {
          baseMap.set(base, []);
        }
        baseMap.get(base)!.push(name);
      }
    });
    
    return Array.from(baseMap.entries())
      .filter(([_, vars]) => vars.length >= 3)
      .map(([base, vars]) => ({
        base,
        variables: vars.map(name => ({ columnName: name } as AnalysisVariable)),
        count: vars.length
      }));
  }

  /**
   * Calculate similarity between two variable names
   */
  static calculateSimilarity(name1: string, name2: string): number {
    // Simple Levenshtein distance-based similarity
    const longer = name1.length > name2.length ? name1 : name2;
    const shorter = name1.length > name2.length ? name2 : name1;
    
    if (longer.length === 0) return 1.0;
    
    const distance = this.levenshteinDistance(longer, shorter);
    return (longer.length - distance) / longer.length;
  }

  /**
   * Calculate Levenshtein distance between two strings
   */
  private static levenshteinDistance(str1: string, str2: string): number {
    const matrix: number[][] = [];
    
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }
    
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }
    
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1, // substitution
            matrix[i][j - 1] + 1,     // insertion
            matrix[i - 1][j] + 1      // deletion
          );
        }
      }
    }
    
    return matrix[str2.length][str1.length];
  }

  /**
   * Normalize variable name for case-insensitive pattern matching
   * Converts to lowercase while preserving original case in results
   * @param name - Variable name to normalize
   * @returns Normalized lowercase name
   */
  static normalizeForMatching(name: string): string {
    return name.toLowerCase().trim();
  }

  /**
   * Determine the most common case variation for a group name
   * Counts case variations (EM, Em, em) and returns the most frequent
   * Handles ties by preferring title case
   * @param names - Array of variable names with same prefix
   * @param prefix - The normalized prefix to extract case from
   * @returns Most common case variation of the prefix
   */
  static getMostCommonCase(names: string[], prefix: string): string {
    const prefixLength = prefix.length;
    const caseVariations = new Map<string, number>();
    
    // Extract and count case variations
    names.forEach(name => {
      const extractedPrefix = name.substring(0, prefixLength);
      const count = caseVariations.get(extractedPrefix) || 0;
      caseVariations.set(extractedPrefix, count + 1);
    });
    
    // Find most common case
    let mostCommon = '';
    let maxCount = 0;
    
    caseVariations.forEach((count, variation) => {
      if (count > maxCount) {
        mostCommon = variation;
        maxCount = count;
      } else if (count === maxCount) {
        // Handle ties by preferring title case (first letter uppercase)
        const isCurrentTitleCase = mostCommon.charAt(0) === mostCommon.charAt(0).toUpperCase();
        const isNewTitleCase = variation.charAt(0) === variation.charAt(0).toUpperCase();
        
        if (isNewTitleCase && !isCurrentTitleCase) {
          mostCommon = variation;
        }
      }
    });
    
    return mostCommon || prefix;
  }

  /**
   * Suggest variable groups with case-insensitive matching
   * Groups variables like EM1, Em2, em3 into one group "Em"
   * @param variables - Array of analysis variables
   * @returns Array of group suggestions with confidence scores
   */
  static suggestGroupsCaseInsensitive(variables: AnalysisVariable[]): VariableGroupSuggestion[] {
    const suggestions: VariableGroupSuggestion[] = [];
    
    // 1. Group by prefix patterns with case-insensitive matching
    const prefixGroups = this.groupByPrefixCaseInsensitive(variables);
    suggestions.push(...prefixGroups);
    
    // 2. Group by numbering patterns with case-insensitive matching
    const numberGroups = this.groupByNumberingCaseInsensitive(variables);
    suggestions.push(...numberGroups);
    
    // 3. Group by semantic similarity (already case-insensitive)
    const semanticGroups = this.groupBySemantic(variables);
    suggestions.push(...semanticGroups);
    
    // Remove duplicates and sort by confidence
    return this.deduplicateAndSort(suggestions);
  }

  /**
   * Group variables by common prefix with case-insensitive matching
   * @param variables - Array of analysis variables
   * @returns Array of group suggestions
   */
  private static groupByPrefixCaseInsensitive(variables: AnalysisVariable[]): VariableGroupSuggestion[] {
    const prefixMap = new Map<string, AnalysisVariable[]>();
    
    variables.forEach(variable => {
      const normalized = this.normalizeForMatching(variable.columnName);
      
      // Extract prefix patterns (case-insensitive):
      // - Q1_, Q2_, Q3_ -> q
      // - Sat1_, Sat2_ -> sat
      // - Trust_1, Trust_2 -> trust
      const patterns = [
        /^([a-z]+)\d+_/,  // q1_, q2_
        /^([a-z]+)_\d+/,  // trust_1, trust_2
        /^([a-z]+\d+)_/,  // q1a_, q1b_
      ];
      
      for (const pattern of patterns) {
        const match = normalized.match(pattern);
        if (match) {
          const prefix = match[1];
          if (!prefixMap.has(prefix)) {
            prefixMap.set(prefix, []);
          }
          prefixMap.get(prefix)!.push(variable);
          break;
        }
      }
    });
    
    return Array.from(prefixMap.entries())
      .filter(([_, vars]) => vars.length >= 2)
      .map(([prefix, vars]) => {
        // Get most common case for group name
        const originalNames = vars.map(v => v.columnName);
        const groupName = this.getMostCommonCase(originalNames, prefix);
        
        const suggestion: VariableGroupSuggestion = {
          suggestedName: this.generateGroupName(groupName, vars),
          variables: originalNames,
          confidence: 0.9,
          reason: `Variables share common prefix "${groupName}" (case-insensitive, ${vars.length} items)`,
          pattern: 'prefix',
          editable: true
        };
        return suggestion;
      });
  }

  /**
   * Group variables by numbering pattern with case-insensitive matching
   * @param variables - Array of analysis variables
   * @returns Array of group suggestions
   */
  private static groupByNumberingCaseInsensitive(variables: AnalysisVariable[]): VariableGroupSuggestion[] {
    const baseMap = new Map<string, AnalysisVariable[]>();
    
    variables.forEach(variable => {
      const normalized = this.normalizeForMatching(variable.columnName);
      
      // Extract base name patterns (case-insensitive):
      // - Item1, Item2 -> item
      // - Question1, Question2 -> question
      // - Var_1, Var_2 -> var
      const patterns = [
        /^([a-z_]+)\d+$/,     // item1, item2
        /^([a-z]+)_?\d+$/,    // var1, var_1
      ];
      
      for (const pattern of patterns) {
        const match = normalized.match(pattern);
        if (match) {
          const base = match[1].replace(/_$/, ''); // Remove trailing underscore
          if (!baseMap.has(base)) {
            baseMap.set(base, []);
          }
          baseMap.get(base)!.push(variable);
          break;
        }
      }
    });
    
    return Array.from(baseMap.entries())
      .filter(([_, vars]) => vars.length >= 3)
      .map(([base, vars]) => {
        // Get most common case for group name
        const originalNames = vars.map(v => v.columnName);
        const groupName = this.getMostCommonCase(originalNames, base);
        
        const suggestion: VariableGroupSuggestion = {
          suggestedName: this.generateGroupName(groupName, vars),
          variables: originalNames,
          confidence: 0.85,
          reason: `Variables follow numbering pattern "${groupName}1, ${groupName}2, ..." (case-insensitive, ${vars.length} items)`,
          pattern: 'numbering',
          editable: true
        };
        return suggestion;
      });
  }

  /**
   * Validate group name for correctness
   * @param name - Group name to validate
   * @param existingNames - Array of existing group names
   * @returns Validation result with error message if invalid
   */
  static validateGroupName(name: string, existingNames: string[]): {
    valid: boolean;
    error?: string;
  } {
    // Check for empty names
    if (!name || name.trim().length === 0) {
      return { valid: false, error: 'Group name cannot be empty' };
    }
    
    // Check for duplicate names (case-insensitive)
    const normalizedName = this.normalizeForMatching(name);
    const isDuplicate = existingNames.some(
      existingName => this.normalizeForMatching(existingName) === normalizedName
    );
    
    if (isDuplicate) {
      return { valid: false, error: 'Group name already exists' };
    }
    
    return { valid: true };
  }
}
