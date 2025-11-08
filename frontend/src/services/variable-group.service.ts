import { AnalysisVariable, VariableGroupSuggestion } from '@/types/analysis';

export class VariableGroupService {
  /**
   * Suggest variable groups based on naming patterns and correlations
   */
  static suggestGroups(variables: AnalysisVariable[]): VariableGroupSuggestion[] {
    const suggestions: VariableGroupSuggestion[] = [];

    // 1. Group by common prefixes (e.g., Q1_, Q2_, Trust_, Quality_)
    const prefixGroups = this.groupByPrefix(variables);
    suggestions.push(...prefixGroups);

    // 2. Group by numbering patterns (e.g., Item1, Item2, Item3)
    const numberGroups = this.groupByNumbering(variables);
    suggestions.push(...numberGroups);

    // 3. Group by semantic similarity (e.g., trust, trustworthy, trusted)
    const semanticGroups = this.groupBySemantic(variables);
    suggestions.push(...semanticGroups);

    // Remove duplicates and merge overlapping groups
    return this.mergeSuggestions(suggestions);
  }

  /**
   * Group variables by common prefix
   */
  private static groupByPrefix(variables: AnalysisVariable[]): VariableGroupSuggestion[] {
    const prefixMap = new Map<string, AnalysisVariable[]>();

    for (const variable of variables) {
      const name = variable.columnName;
      
      // Try different separators
      const separators = ['_', '.', '-', ' '];
      let foundPrefix = false;

      for (const sep of separators) {
        if (name.includes(sep)) {
          const parts = name.split(sep);
          if (parts.length >= 2) {
            const prefix = parts[0];
            
            // Only consider meaningful prefixes (length > 1)
            if (prefix.length > 1) {
              if (!prefixMap.has(prefix)) {
                prefixMap.set(prefix, []);
              }
              prefixMap.get(prefix)!.push(variable);
              foundPrefix = true;
              break;
            }
          }
        }
      }
    }

    const suggestions: VariableGroupSuggestion[] = [];

    for (const [prefix, vars] of prefixMap) {
      // Only suggest groups with 2+ variables
      if (vars.length >= 2) {
        suggestions.push({
          suggestedName: this.formatGroupName(prefix),
          variables: vars.map(v => v.columnName),
          confidence: this.calculatePrefixConfidence(vars),
          reason: `Variables share common prefix "${prefix}"`,
        });
      }
    }

    return suggestions;
  }

  /**
   * Group variables by numbering pattern
   */
  private static groupByNumbering(variables: AnalysisVariable[]): VariableGroupSuggestion[] {
    const numberPattern = /^([a-zA-Z]+)(\d+)$/;
    const baseMap = new Map<string, AnalysisVariable[]>();

    for (const variable of variables) {
      const name = variable.columnName;
      const match = name.match(numberPattern);

      if (match) {
        const base = match[1];
        if (!baseMap.has(base)) {
          baseMap.set(base, []);
        }
        baseMap.get(base)!.push(variable);
      }
    }

    const suggestions: VariableGroupSuggestion[] = [];

    for (const [base, vars] of baseMap) {
      if (vars.length >= 3) { // Need at least 3 for a sequence
        // Check if numbers are sequential
        const numbers = vars.map(v => {
          const match = v.columnName.match(numberPattern);
          return match ? parseInt(match[2]) : 0;
        }).sort((a, b) => a - b);

        const isSequential = numbers.every((num, idx) => 
          idx === 0 || num === numbers[idx - 1] + 1
        );

        if (isSequential) {
          suggestions.push({
            suggestedName: this.formatGroupName(base),
            variables: vars.map(v => v.columnName).sort(),
            confidence: 0.9,
            reason: `Variables follow sequential numbering pattern (${base}1, ${base}2, ...)`,
          });
        }
      }
    }

    return suggestions;
  }

  /**
   * Group variables by semantic similarity
   */
  private static groupBySemantic(variables: AnalysisVariable[]): VariableGroupSuggestion[] {
    const suggestions: VariableGroupSuggestion[] = [];

    // Common semantic groups in surveys
    const semanticPatterns = [
      {
        keywords: ['trust', 'tin', 'tuong'],
        name: 'Trust',
        nameVi: 'Lòng tin',
      },
      {
        keywords: ['quality', 'chat', 'luong'],
        name: 'Quality',
        nameVi: 'Chất lượng',
      },
      {
        keywords: ['satisfaction', 'hai', 'long'],
        name: 'Satisfaction',
        nameVi: 'Hài lòng',
      },
      {
        keywords: ['loyalty', 'trung', 'thanh'],
        name: 'Loyalty',
        nameVi: 'Trung thành',
      },
      {
        keywords: ['intention', 'dinh', 'mua'],
        name: 'Purchase Intention',
        nameVi: 'Ý định mua',
      },
      {
        keywords: ['service', 'dich', 'vu'],
        name: 'Service',
        nameVi: 'Dịch vụ',
      },
      {
        keywords: ['price', 'gia', 'tien'],
        name: 'Price',
        nameVi: 'Giá cả',
      },
      {
        keywords: ['value', 'gia', 'tri'],
        name: 'Value',
        nameVi: 'Giá trị',
      },
    ];

    for (const pattern of semanticPatterns) {
      const matchingVars = variables.filter(v => {
        const nameLower = v.columnName.toLowerCase();
        return pattern.keywords.some(keyword => nameLower.includes(keyword));
      });

      if (matchingVars.length >= 2) {
        suggestions.push({
          suggestedName: pattern.name,
          variables: matchingVars.map(v => v.columnName),
          confidence: 0.7,
          reason: `Variables contain keywords related to "${pattern.name}"`,
        });
      }
    }

    return suggestions;
  }

  /**
   * Calculate confidence score for prefix-based grouping
   */
  private static calculatePrefixConfidence(variables: AnalysisVariable[]): number {
    // Higher confidence for more variables
    const sizeScore = Math.min(variables.length / 10, 1) * 0.3;

    // Higher confidence if all variables are same type
    const types = new Set(variables.map(v => v.dataType));
    const typeScore = types.size === 1 ? 0.4 : 0.2;

    // Higher confidence if variables have similar names
    const names = variables.map(v => v.columnName);
    const avgLength = names.reduce((sum, n) => sum + n.length, 0) / names.length;
    const lengthVariance = names.reduce((sum, n) => sum + Math.pow(n.length - avgLength, 2), 0) / names.length;
    const similarityScore = lengthVariance < 10 ? 0.3 : 0.1;

    return Math.min(sizeScore + typeScore + similarityScore, 1);
  }

  /**
   * Format group name to be more readable
   */
  private static formatGroupName(name: string): string {
    // Remove common prefixes/suffixes
    name = name.replace(/^(Q|Item|Var|Variable|Question)/i, '');
    
    // Convert snake_case or camelCase to Title Case
    name = name
      .replace(/_/g, ' ')
      .replace(/([A-Z])/g, ' $1')
      .trim();

    // Capitalize first letter of each word
    name = name
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');

    return name || 'Unnamed Group';
  }

  /**
   * Merge overlapping suggestions
   */
  private static mergeSuggestions(suggestions: VariableGroupSuggestion[]): VariableGroupSuggestion[] {
    const merged: VariableGroupSuggestion[] = [];
    const processed = new Set<string>();

    // Sort by confidence (highest first)
    suggestions.sort((a, b) => b.confidence - a.confidence);

    for (const suggestion of suggestions) {
      const variableSet = new Set(suggestion.variables);
      
      // Check if any variable is already in a processed group
      const hasOverlap = suggestion.variables.some(v => processed.has(v));

      if (!hasOverlap) {
        // Add all variables to processed set
        suggestion.variables.forEach(v => processed.add(v));
        merged.push(suggestion);
      } else {
        // Check overlap percentage
        const overlapCount = suggestion.variables.filter(v => processed.has(v)).length;
        const overlapPercentage = overlapCount / suggestion.variables.length;

        // Only add if overlap is small
        if (overlapPercentage < 0.3) {
          const newVariables = suggestion.variables.filter(v => !processed.has(v));
          if (newVariables.length >= 2) {
            newVariables.forEach(v => processed.add(v));
            merged.push({
              ...suggestion,
              variables: newVariables,
              confidence: suggestion.confidence * (1 - overlapPercentage),
            });
          }
        }
      }
    }

    return merged;
  }

  /**
   * Analyze naming patterns in variable names
   */
  static analyzeNamingPatterns(names: string[]): {
    hasPrefix: boolean;
    hasNumbering: boolean;
    hasSeparator: boolean;
    commonSeparator?: string;
    commonPrefix?: string;
  } {
    const separators = ['_', '.', '-', ' '];
    let commonSeparator: string | undefined;
    let maxSeparatorCount = 0;

    for (const sep of separators) {
      const count = names.filter(n => n.includes(sep)).length;
      if (count > maxSeparatorCount) {
        maxSeparatorCount = count;
        commonSeparator = sep;
      }
    }

    const hasSeparator = maxSeparatorCount > names.length * 0.5;

    // Check for common prefix
    let commonPrefix: string | undefined;
    if (hasSeparator && commonSeparator) {
      const prefixes = names
        .filter(n => n.includes(commonSeparator!))
        .map(n => n.split(commonSeparator!)[0]);
      
      const prefixCounts = new Map<string, number>();
      for (const prefix of prefixes) {
        prefixCounts.set(prefix, (prefixCounts.get(prefix) || 0) + 1);
      }

      const maxCount = Math.max(...prefixCounts.values());
      if (maxCount > names.length * 0.3) {
        commonPrefix = Array.from(prefixCounts.entries())
          .find(([_, count]) => count === maxCount)?.[0];
      }
    }

    // Check for numbering
    const numberPattern = /\d+/;
    const hasNumbering = names.filter(n => numberPattern.test(n)).length > names.length * 0.5;

    return {
      hasPrefix: !!commonPrefix,
      hasNumbering,
      hasSeparator,
      commonSeparator: hasSeparator ? commonSeparator : undefined,
      commonPrefix,
    };
  }
}
