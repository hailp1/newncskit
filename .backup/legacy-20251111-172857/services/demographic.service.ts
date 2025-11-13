import { 
  AnalysisVariable, 
  RankDefinition, 
  RankPreview,
  DemographicType,
  DemographicSuggestion
} from '@/types/analysis';

export class DemographicService {
  /**
   * Demographic keyword patterns with weights and types
   */
  private static readonly DEMOGRAPHIC_PATTERNS = [
    // Age patterns
    { keywords: ['age', 'tuoi'], type: 'continuous' as DemographicType, weight: 0.95 },
    
    // Gender patterns
    { keywords: ['gender', 'sex', 'gioi_tinh', 'gioitinh'], type: 'categorical' as DemographicType, weight: 0.95 },
    
    // Income patterns
    { keywords: ['income', 'salary', 'thu_nhap', 'thunhap', 'luong'], type: 'ordinal' as DemographicType, weight: 0.9 },
    
    // Education patterns
    { keywords: ['education', 'degree', 'hoc_van', 'hocvan', 'trinh_do', 'trinhdo'], type: 'ordinal' as DemographicType, weight: 0.9 },
    
    // Location patterns
    { keywords: ['location', 'city', 'province', 'region', 'dia_diem', 'diadiem', 'thanh_pho', 'thanhpho', 'tinh', 'khu_vuc', 'khuvuc'], type: 'categorical' as DemographicType, weight: 0.85 },
    
    // Occupation patterns
    { keywords: ['occupation', 'job', 'nghe_nghiep', 'nghenghiep', 'cong_viec', 'congviec'], type: 'categorical' as DemographicType, weight: 0.85 },
    
    // Marital status patterns
    { keywords: ['marital', 'married', 'hon_nhan', 'honnhan', 'tinh_trang', 'tinhtrang'], type: 'categorical' as DemographicType, weight: 0.8 },
    
    // Ethnicity patterns
    { keywords: ['ethnicity', 'race', 'dan_toc', 'dantoc'], type: 'categorical' as DemographicType, weight: 0.8 },
    
    // Religion patterns
    { keywords: ['religion', 'ton_giao', 'tongiao'], type: 'categorical' as DemographicType, weight: 0.8 },
  ];

  /**
   * Detect demographic variables with confidence scores
   * Analyzes all variables for demographic likelihood
   * Returns suggestions sorted by confidence
   * Filters out low-confidence suggestions (< 0.6)
   */
  static detectDemographics(variables: AnalysisVariable[]): DemographicSuggestion[] {
    return variables
      .map(v => this.analyzeDemographic(v))
      .filter(s => s.confidence >= 0.6)
      .sort((a, b) => b.confidence - a.confidence);
  }

  /**
   * Analyze single variable for demographic likelihood
   * Checks for demographic keywords (age, gender, income, etc.)
   * Calculates confidence score based on keyword matches
   * Detects demographic type (categorical, ordinal, continuous)
   * Generates reasons for suggestion
   */
  private static analyzeDemographic(variable: AnalysisVariable): DemographicSuggestion {
    const name = variable.columnName.toLowerCase();
    let confidence = 0;
    let type: DemographicType | null = null;
    const reasons: string[] = [];

    // Check for demographic keywords
    for (const pattern of this.DEMOGRAPHIC_PATTERNS) {
      const matchedKeyword = pattern.keywords.find(kw => name.includes(kw));
      if (matchedKeyword) {
        confidence = Math.max(confidence, pattern.weight);
        type = pattern.type;
        reasons.push(`Contains demographic keyword: "${matchedKeyword}"`);
        break; // Use first match only
      }
    }

    // Check data characteristics for additional confidence
    if (variable.dataType === 'numeric') {
      const uniqueCount = variable.uniqueCount || 0;
      
      if (uniqueCount < 10) {
        confidence += 0.05;
        reasons.push('Numeric with few unique values (< 10)');
        
        // Adjust type if not already set
        if (!type) {
          type = 'ordinal';
        }
      } else if (uniqueCount < 100) {
        confidence += 0.03;
        reasons.push('Numeric with moderate unique values');
        
        if (!type) {
          type = 'continuous';
        }
      }
    }

    if (variable.dataType === 'categorical') {
      const uniqueCount = variable.uniqueCount || 0;
      
      if (uniqueCount >= 2 && uniqueCount <= 10) {
        confidence += 0.05;
        reasons.push('Categorical with reasonable categories (2-10)');
        
        if (!type) {
          type = 'categorical';
        }
      }
    }

    // Check for common demographic value patterns
    if (name.includes('male') || name.includes('female') || name.includes('nam') || name.includes('nu')) {
      confidence = Math.max(confidence, 0.9);
      type = 'categorical';
      reasons.push('Contains gender-related terms');
    }

    // Ensure we have a type if confidence is high enough
    if (confidence >= 0.6 && !type) {
      type = this.detectDemographicType(variable);
      reasons.push(`Inferred type from data characteristics: ${type}`);
    }

    return {
      variable,
      confidence: Math.min(confidence, 1.0), // Cap at 1.0
      type,
      reasons,
      autoSelected: confidence > 0.8
    };
  }

  /**
   * Generate semantic name from column name
   * Converts column name to human-readable format
   * Handles underscores and camelCase
   * Capitalizes properly
   */
  static generateSemanticName(columnName: string): string {
    // Replace underscores, hyphens, and dots with spaces
    let name = columnName.replace(/[_\-\.]/g, ' ');
    
    // Handle camelCase by inserting spaces before capital letters
    name = name.replace(/([a-z])([A-Z])/g, '$1 $2');
    
    // Trim and convert to lowercase
    name = name.trim().toLowerCase();
    
    // Split into words
    const words = name.split(/\s+/);
    
    // Capitalize first letter of each word
    const capitalized = words.map(word => {
      if (word.length === 0) return word;
      return word.charAt(0).toUpperCase() + word.slice(1);
    });
    
    return capitalized.join(' ');
  }

  /**
   * Suggest potential demographic variables based on common names
   * @deprecated Use detectDemographics() instead for better accuracy
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
   * @deprecated Use generateSemanticName() instead
   */
  static suggestSemanticName(columnName: string): string {
    const nameLower = columnName.toLowerCase();

    // Age variations
    if (nameLower.includes('age') || nameLower.includes('tuoi')) {
      return 'Age';
    }

    // Gender variations
    if (nameLower.includes('gender') || nameLower.includes('sex') || 
        nameLower.includes('gioi') || nameLower.includes('tinh')) {
      return 'Gender';
    }

    // Income variations
    if (nameLower.includes('income') || nameLower.includes('salary') || 
        nameLower.includes('thu') || nameLower.includes('nhap') || 
        nameLower.includes('luong')) {
      return 'Income';
    }

    // Education variations
    if (nameLower.includes('education') || nameLower.includes('degree') || 
        nameLower.includes('hoc') || nameLower.includes('van')) {
      return 'Education';
    }

    // Occupation variations
    if (nameLower.includes('occupation') || nameLower.includes('job') || 
        nameLower.includes('nghe') || nameLower.includes('nghiep')) {
      return 'Occupation';
    }

    // Location variations
    if (nameLower.includes('location') || nameLower.includes('region') || 
        nameLower.includes('city') || nameLower.includes('province') ||
        nameLower.includes('dia') || nameLower.includes('chi') ||
        nameLower.includes('thanh') || nameLower.includes('pho')) {
      return 'Location';
    }

    // Marital status
    if (nameLower.includes('marital') || nameLower.includes('married') || 
        nameLower.includes('hon') || nameLower.includes('nhan')) {
      return 'Marital Status';
    }

    // Default: use generateSemanticName
    return this.generateSemanticName(columnName);
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
