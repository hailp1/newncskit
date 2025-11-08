import { 
  AnalysisVariable, 
  RankDefinition, 
  RankPreview,
  DemographicType 
} from '@/types/analysis';

export class DemographicService {
  /**
   * Suggest potential demographic variables based on common names
   */
  static suggestDemographics(variables: AnalysisVariable[]): string[] {
    const demographicKeywords = [
      // English
      'age', 'gender', 'sex', 'income', 'salary', 'education', 'degree',
      'occupation', 'job', 'marital', 'married', 'location', 'region',
      'city', 'province', 'country', 'ethnicity', 'race', 'religion',
      
      // Vietnamese
      'tuoi', 'gioi', 'tinh', 'thu', 'nhap', 'luong', 'hoc', 'van',
      'nghe', 'nghiep', 'hon', 'nhan', 'dia', 'chi', 'khu', 'vuc',
      'thanh', 'pho', 'tinh', 'dan', 'toc', 'ton', 'giao'
    ];

    return variables
      .filter(v => {
        const nameLower = v.columnName.toLowerCase();
        return demographicKeywords.some(keyword => nameLower.includes(keyword));
      })
      .map(v => v.columnName);
  }

  /**
   * Validate rank definitions
   */
  static validateRanks(ranks: RankDefinition[]): {
    valid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (ranks.length === 0) {
      errors.push('At least one rank is required');
      return { valid: false, errors };
    }

    // Check for overlapping ranges
    for (let i = 0; i < ranks.length; i++) {
      const rank1 = ranks[i];
      
      // Skip validation for open-ended ranks
      if (rank1.isOpenEndedMin && rank1.isOpenEndedMax) {
        errors.push(`Rank "${rank1.label}" cannot be both open-ended min and max`);
        continue;
      }

      for (let j = i + 1; j < ranks.length; j++) {
        const rank2 = ranks[j];

        // Check for overlap
        if (this.ranksOverlap(rank1, rank2)) {
          errors.push(
            `Ranks "${rank1.label}" and "${rank2.label}" have overlapping ranges`
          );
        }
      }
    }

    // Check for gaps in coverage (optional warning)
    const sortedRanks = [...ranks].sort((a, b) => {
      if (a.isOpenEndedMin) return -1;
      if (b.isOpenEndedMin) return 1;
      return (a.minValue || 0) - (b.minValue || 0);
    });

    for (let i = 0; i < sortedRanks.length - 1; i++) {
      const current = sortedRanks[i];
      const next = sortedRanks[i + 1];

      if (!current.isOpenEndedMax && !next.isOpenEndedMin) {
        if (current.maxValue !== undefined && next.minValue !== undefined) {
          if (current.maxValue < next.minValue - 1) {
            // There's a gap
            console.warn(
              `Gap detected between "${current.label}" and "${next.label}"`
            );
          }
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Check if two ranks overlap
   */
  private static ranksOverlap(rank1: RankDefinition, rank2: RankDefinition): boolean {
    // If either is fully open-ended, they might overlap
    if (rank1.isOpenEndedMin && rank1.isOpenEndedMax) return false;
    if (rank2.isOpenEndedMin && rank2.isOpenEndedMax) return false;

    const min1 = rank1.isOpenEndedMin ? -Infinity : (rank1.minValue || 0);
    const max1 = rank1.isOpenEndedMax ? Infinity : (rank1.maxValue || 0);
    const min2 = rank2.isOpenEndedMin ? -Infinity : (rank2.minValue || 0);
    const max2 = rank2.isOpenEndedMax ? Infinity : (rank2.maxValue || 0);

    // Check if ranges overlap
    return !(max1 < min2 || max2 < min1);
  }

  /**
   * Categorize data values into ranks
   */
  static categorizeIntoRanks(
    values: number[],
    ranks: RankDefinition[]
  ): Map<string, number[]> {
    const categorized = new Map<string, number[]>();

    // Initialize map
    ranks.forEach(rank => {
      categorized.set(rank.label, []);
    });

    // Categorize each value
    values.forEach(value => {
      if (value === null || value === undefined || isNaN(value)) {
        return; // Skip missing values
      }

      for (const rank of ranks) {
        if (this.valueInRank(value, rank)) {
          categorized.get(rank.label)?.push(value);
          break; // Value can only be in one rank
        }
      }
    });

    return categorized;
  }

  /**
   * Check if a value falls within a rank
   */
  private static valueInRank(value: number, rank: RankDefinition): boolean {
    const min = rank.isOpenEndedMin ? -Infinity : (rank.minValue || 0);
    const max = rank.isOpenEndedMax ? Infinity : (rank.maxValue || 0);

    return value >= min && value <= max;
  }

  /**
   * Generate preview of rank distribution
   */
  static previewRankDistribution(
    values: number[],
    ranks: RankDefinition[]
  ): RankPreview[] {
    const categorized = this.categorizeIntoRanks(values, ranks);
    const totalValues = values.filter(v => v !== null && v !== undefined && !isNaN(v)).length;

    return ranks.map(rank => {
      const rankValues = categorized.get(rank.label) || [];
      const count = rankValues.length;
      const percentage = totalValues > 0 ? (count / totalValues) * 100 : 0;

      return {
        rank,
        count,
        percentage,
        values: rankValues,
      };
    });
  }

  /**
   * Suggest rank definitions based on data distribution
   */
  static suggestRanks(
    values: number[],
    numRanks: number = 5
  ): RankDefinition[] {
    const validValues = values.filter(v => v !== null && v !== undefined && !isNaN(v));
    
    if (validValues.length === 0) {
      return [];
    }

    const min = Math.min(...validValues);
    const max = Math.max(...validValues);
    const range = max - min;
    const step = range / numRanks;

    const ranks: RankDefinition[] = [];

    for (let i = 0; i < numRanks; i++) {
      const rangeMin = min + (i * step);
      const rangeMax = min + ((i + 1) * step);

      ranks.push({
        label: `Range ${i + 1}`,
        minValue: Math.round(rangeMin * 100) / 100,
        maxValue: Math.round(rangeMax * 100) / 100,
        isOpenEndedMin: i === 0,
        isOpenEndedMax: i === numRanks - 1,
      });
    }

    return ranks;
  }

  /**
   * Detect appropriate demographic type based on data
   */
  static detectDemographicType(variable: AnalysisVariable): DemographicType {
    // If numeric with reasonable range, suggest continuous
    if (variable.dataType === 'numeric') {
      const uniqueCount = variable.uniqueCount || 0;
      
      // If few unique values, might be ordinal
      if (uniqueCount <= 10) {
        return 'ordinal';
      }
      
      return 'continuous';
    }

    // If categorical with few values, suggest categorical
    if (variable.dataType === 'categorical') {
      const uniqueCount = variable.uniqueCount || 0;
      
      // If many unique values, might need to be ordinal
      if (uniqueCount > 10) {
        return 'ordinal';
      }
      
      return 'categorical';
    }

    // Default to categorical
    return 'categorical';
  }

  /**
   * Suggest semantic name based on variable name
   */
  static suggestSemanticName(columnName: string): string {
    const nameLower = columnName.toLowerCase();

    // Age variations
    if (nameLower.includes('age') || nameLower.includes('tuoi')) {
      return 'age';
    }

    // Gender variations
    if (nameLower.includes('gender') || nameLower.includes('sex') || 
        nameLower.includes('gioi') || nameLower.includes('tinh')) {
      return 'gender';
    }

    // Income variations
    if (nameLower.includes('income') || nameLower.includes('salary') || 
        nameLower.includes('thu') || nameLower.includes('nhap') || 
        nameLower.includes('luong')) {
      return 'income';
    }

    // Education variations
    if (nameLower.includes('education') || nameLower.includes('degree') || 
        nameLower.includes('hoc') || nameLower.includes('van')) {
      return 'education';
    }

    // Occupation variations
    if (nameLower.includes('occupation') || nameLower.includes('job') || 
        nameLower.includes('nghe') || nameLower.includes('nghiep')) {
      return 'occupation';
    }

    // Location variations
    if (nameLower.includes('location') || nameLower.includes('region') || 
        nameLower.includes('city') || nameLower.includes('province') ||
        nameLower.includes('dia') || nameLower.includes('chi') ||
        nameLower.includes('thanh') || nameLower.includes('pho')) {
      return 'location';
    }

    // Marital status
    if (nameLower.includes('marital') || nameLower.includes('married') || 
        nameLower.includes('hon') || nameLower.includes('nhan')) {
      return 'marital_status';
    }

    // Default: use cleaned column name
    return columnName
      .replace(/[_\-\.]/g, ' ')
      .toLowerCase()
      .trim();
  }

  /**
   * Format rank label for display
   */
  static formatRankLabel(rank: RankDefinition): string {
    if (rank.isOpenEndedMin && rank.maxValue !== undefined) {
      return `< ${rank.maxValue}`;
    }

    if (rank.isOpenEndedMax && rank.minValue !== undefined) {
      return `> ${rank.minValue}`;
    }

    if (rank.minValue !== undefined && rank.maxValue !== undefined) {
      return `${rank.minValue} - ${rank.maxValue}`;
    }

    return rank.label;
  }

  /**
   * Validate ordinal category order
   */
  static validateOrdinalCategories(categories: string[]): {
    valid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (categories.length === 0) {
      errors.push('At least one category is required');
    }

    // Check for duplicates
    const uniqueCategories = new Set(categories);
    if (uniqueCategories.size !== categories.length) {
      errors.push('Duplicate categories found');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}
