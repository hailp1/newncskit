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
      .map(([prefix, vars]) => ({
        suggestedName: this.generateGroupName(prefix, vars),
        variables: vars.map(v => v.columnName),
        confidence: 0.9,
        reason: `Variables share common prefix "${prefix}" (${vars.length} items)`
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
      .map(([base, vars]) => ({
        suggestedName: this.generateGroupName(base, vars),
        variables: vars.map(v => v.columnName),
        confidence: 0.85,
        reason: `Variables follow numbering pattern "${base}1, ${base}2, ..." (${vars.length} items)`
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
        suggestions.push({
          suggestedName: pattern.name,
          variables: matchingVars.map(v => v.columnName),
          confidence: pattern.confidence,
          reason: `Variables contain semantic keywords related to "${pattern.name}" (${matchingVars.length} items)`
        });
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
}
