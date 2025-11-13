/**
 * Data Health Service
 * Client-side data quality analysis without R server dependency
 */

export interface MissingValueReport {
  variable: string;
  totalCount: number;
  missingCount: number;
  missingPercentage: number;
}

export interface OutlierReport {
  outlierCount: number;
  outlierPercentage: number;
  outlierIndices: number[];
  outlierValues: number[];
  bounds: {
    lower: number;
    upper: number;
  };
  quartiles: {
    q1: number;
    q3: number;
    iqr: number;
  };
}

export interface BasicStats {
  count: number;
  mean: number;
  median: number;
  std: number;
  min: number;
  max: number;
  range: number;
  q1: number;
  q3: number;
}

export interface DataHealthReport {
  overallScore: number;
  totalRows: number;
  totalColumns: number;
  
  missingData: {
    totalMissing: number;
    percentageMissing: number;
    variablesWithMissing: MissingValueReport[];
  };
  
  outliers: {
    totalOutliers: number;
    variablesWithOutliers: Array<{
      variable: string;
      outlierCount: number;
      outlierPercentage: number;
      outlierIndices: number[];
    }>;
  };
  
  dataTypes: {
    numeric: number;
    categorical: number;
    text: number;
    date: number;
  };
  
  basicStats: Record<string, BasicStats | null>;
  recommendations: string[];
  calculatedAt: Date;
  calculationMethod: 'client-side';
}

export type DataType = 'numeric' | 'categorical' | 'text' | 'date';

export class DataHealthService {
  /**
   * Analyze missing values across all columns
   */
  static analyzeMissingValues(data: any[][]): MissingValueReport[] {
    if (data.length < 2) return [];
    
    const headers = data[0];
    const rows = data.slice(1);
    
    return headers.map((header, colIndex) => {
      const columnValues = rows.map(row => row[colIndex]);
      const missingCount = columnValues.filter(v => 
        v === null || 
        v === undefined || 
        v === '' || 
        v === 'NA' ||
        v === 'N/A' ||
        v === 'null'
      ).length;
      
      return {
        variable: header || `Column_${colIndex + 1}`,
        totalCount: columnValues.length,
        missingCount,
        missingPercentage: (missingCount / columnValues.length) * 100
      };
    });
  }

  /**
   * Detect outliers using IQR method
   */
  static detectOutliers(values: number[]): OutlierReport {
    const validValues = values.filter(v => !isNaN(v) && v !== null && v !== undefined);
    
    if (validValues.length === 0) {
      return {
        outlierCount: 0,
        outlierPercentage: 0,
        outlierIndices: [],
        outlierValues: [],
        bounds: { lower: 0, upper: 0 },
        quartiles: { q1: 0, q3: 0, iqr: 0 }
      };
    }
    
    const sorted = [...validValues].sort((a, b) => a - b);
    const n = sorted.length;
    
    // Calculate quartiles
    const q1Index = Math.floor(n * 0.25);
    const q3Index = Math.floor(n * 0.75);
    
    const q1 = sorted[q1Index];
    const q3 = sorted[q3Index];
    const iqr = q3 - q1;
    
    // Calculate bounds
    const lowerBound = q1 - 1.5 * iqr;
    const upperBound = q3 + 1.5 * iqr;
    
    // Find outliers
    const outliers = values
      .map((v, index) => ({ value: v, index }))
      .filter(({ value }) => 
        !isNaN(value) && 
        value !== null && 
        value !== undefined &&
        (value < lowerBound || value > upperBound)
      );
    
    return {
      outlierCount: outliers.length,
      outlierPercentage: (outliers.length / values.length) * 100,
      outlierIndices: outliers.map(o => o.index),
      outlierValues: outliers.map(o => o.value),
      bounds: { lower: lowerBound, upper: upperBound },
      quartiles: { q1, q3, iqr }
    };
  }

  /**
   * Calculate basic statistics for numeric data
   */
  static calculateBasicStats(values: any[]): BasicStats | null {
    const numericValues = values
      .map(v => Number(v))
      .filter(v => !isNaN(v) && v !== null && v !== undefined);
    
    const n = numericValues.length;
    
    if (n === 0) return null;
    
    // Mean
    const sum = numericValues.reduce((a, b) => a + b, 0);
    const mean = sum / n;
    
    // Variance and Standard Deviation
    const variance = numericValues.reduce((sum, v) => 
      sum + Math.pow(v - mean, 2), 0
    ) / n;
    const std = Math.sqrt(variance);
    
    // Sort for median and quartiles
    const sorted = [...numericValues].sort((a, b) => a - b);
    
    // Median
    const median = n % 2 === 0
      ? (sorted[n / 2 - 1] + sorted[n / 2]) / 2
      : sorted[Math.floor(n / 2)];
    
    // Quartiles
    const q1Index = Math.floor(n * 0.25);
    const q3Index = Math.floor(n * 0.75);
    const q1 = sorted[q1Index];
    const q3 = sorted[q3Index];
    
    // Min, Max, Range
    const min = Math.min(...numericValues);
    const max = Math.max(...numericValues);
    const range = max - min;
    
    return {
      count: n,
      mean: Number(mean.toFixed(3)),
      median: Number(median.toFixed(3)),
      std: Number(std.toFixed(3)),
      min,
      max,
      range,
      q1: Number(q1.toFixed(3)),
      q3: Number(q3.toFixed(3))
    };
  }

  /**
   * Detect data type of a column
   */
  static detectDataType(values: any[]): DataType {
    const nonNullValues = values.filter(v => 
      v !== null && 
      v !== undefined && 
      v !== '' &&
      v !== 'NA' &&
      v !== 'N/A'
    );
    
    if (nonNullValues.length === 0) return 'text';
    
    // Check if numeric
    const numericValues = nonNullValues.filter(v => !isNaN(Number(v)));
    const numericRatio = numericValues.length / nonNullValues.length;
    
    if (numericRatio > 0.8) {
      // Check if it's ordinal (limited unique values)
      const uniqueValues = [...new Set(numericValues.map(v => Number(v)))];
      if (uniqueValues.length <= 10 && uniqueValues.length > 1) {
        return 'categorical';
      }
      return 'numeric';
    }
    
    // Check if date
    const dateValues = nonNullValues.filter(v => {
      const date = new Date(v);
      return !isNaN(date.getTime());
    });
    const dateRatio = dateValues.length / nonNullValues.length;
    
    if (dateRatio > 0.8) {
      return 'date';
    }
    
    // Check if categorical
    const uniqueValues = [...new Set(nonNullValues)];
    if (uniqueValues.length <= 20) {
      return 'categorical';
    }
    
    return 'text';
  }

  /**
   * Calculate overall quality score
   */
  static calculateQualityScore(report: Partial<DataHealthReport>): number {
    let score = 100;
    
    // Deduct for missing values (max 30 points)
    if (report.missingData) {
      const missingPenalty = Math.min(
        report.missingData.percentageMissing * 0.5, 
        30
      );
      score -= missingPenalty;
    }
    
    // Deduct for outliers (max 20 points)
    if (report.outliers) {
      const outlierPenalty = Math.min(
        report.outliers.totalOutliers * 0.1, 
        20
      );
      score -= outlierPenalty;
    }
    
    // Deduct for data type issues (max 10 points)
    if (report.dataTypes) {
      const totalColumns = Object.values(report.dataTypes).reduce((a, b) => a + b, 0);
      const textRatio = report.dataTypes.text / totalColumns;
      if (textRatio > 0.5) {
        score -= 10;
      }
    }
    
    return Math.max(0, Math.round(score));
  }

  /**
   * Generate recommendations based on data health
   */
  static generateRecommendations(report: Partial<DataHealthReport>): string[] {
    const recommendations: string[] = [];
    
    // Missing data recommendations
    if (report.missingData && report.missingData.percentageMissing > 5) {
      recommendations.push(
        `${report.missingData.percentageMissing.toFixed(1)}% of data is missing. Consider imputation or removal of incomplete cases.`
      );
      
      const highMissingVars = report.missingData.variablesWithMissing
        .filter(v => v.missingPercentage > 20);
      
      if (highMissingVars.length > 0) {
        recommendations.push(
          `Variables with >20% missing: ${highMissingVars.map(v => v.variable).join(', ')}. Consider removing these variables.`
        );
      }
    }
    
    // Outlier recommendations
    if (report.outliers && report.outliers.totalOutliers > 0) {
      recommendations.push(
        `${report.outliers.totalOutliers} outliers detected. Review these values before analysis.`
      );
      
      const highOutlierVars = report.outliers.variablesWithOutliers
        .filter(v => v.outlierPercentage > 5);
      
      if (highOutlierVars.length > 0) {
        recommendations.push(
          `Variables with >5% outliers: ${highOutlierVars.map(v => v.variable).join(', ')}. Consider transformation or winsorization.`
        );
      }
    }
    
    // Data type recommendations
    if (report.dataTypes) {
      if (report.dataTypes.text > report.dataTypes.numeric + report.dataTypes.categorical) {
        recommendations.push(
          'Most columns are text type. Ensure numeric variables are properly formatted.'
        );
      }
    }
    
    // Sample size recommendations
    if (report.totalRows && report.totalRows < 30) {
      recommendations.push(
        'Sample size is small (<30). Statistical tests may have limited power.'
      );
    }
    
    if (recommendations.length === 0) {
      recommendations.push('Data quality is good. Ready for analysis.');
    }
    
    return recommendations;
  }

  /**
   * Get color for quality score
   */
  static getScoreColor(score: number): string {
    if (score >= 80) return 'green';
    if (score >= 60) return 'yellow';
    if (score >= 40) return 'orange';
    return 'red';
  }

  /**
   * Get label for quality score
   */
  static getScoreLabel(score: number): string {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Poor';
  }

  /**
   * Perform comprehensive data health check
   */
  static performHealthCheck(data: any[][]): DataHealthReport {
    if (data.length < 2) {
      throw new Error('Data must contain at least a header row and one data row');
    }
    
    const headers = data[0];
    const rows = data.slice(1);
    
    // Analyze missing values
    const missingValueReports = this.analyzeMissingValues(data);
    const totalMissing = missingValueReports.reduce((sum, v) => sum + v.missingCount, 0);
    const totalCells = rows.length * headers.length;
    const percentageMissing = (totalMissing / totalCells) * 100;
    
    // Detect data types and calculate statistics
    const dataTypes = { numeric: 0, categorical: 0, text: 0, date: 0 };
    const basicStats: Record<string, BasicStats | null> = {};
    const outlierReports: Array<{
      variable: string;
      outlierCount: number;
      outlierPercentage: number;
      outlierIndices: number[];
    }> = [];
    
    headers.forEach((header, colIndex) => {
      const columnValues = rows.map(row => row[colIndex]);
      const dataType = this.detectDataType(columnValues);
      dataTypes[dataType]++;
      
      // Calculate stats for numeric columns
      if (dataType === 'numeric') {
        const stats = this.calculateBasicStats(columnValues);
        basicStats[header] = stats;
        
        // Detect outliers
        const numericValues = columnValues.map(v => Number(v));
        const outlierReport = this.detectOutliers(numericValues);
        
        if (outlierReport.outlierCount > 0) {
          outlierReports.push({
            variable: header,
            outlierCount: outlierReport.outlierCount,
            outlierPercentage: outlierReport.outlierPercentage,
            outlierIndices: outlierReport.outlierIndices
          });
        }
      } else {
        basicStats[header] = null;
      }
    });
    
    const totalOutliers = outlierReports.reduce((sum, v) => sum + v.outlierCount, 0);
    
    // Build partial report for quality score calculation
    const partialReport = {
      missingData: {
        totalMissing,
        percentageMissing,
        variablesWithMissing: missingValueReports.filter(v => v.missingCount > 0)
      },
      outliers: {
        totalOutliers,
        variablesWithOutliers: outlierReports
      },
      dataTypes,
      totalRows: rows.length
    };
    
    // Calculate quality score
    const overallScore = this.calculateQualityScore(partialReport);
    
    // Generate recommendations
    const recommendations = this.generateRecommendations(partialReport);
    
    // Build complete report
    const report: DataHealthReport = {
      overallScore,
      totalRows: rows.length,
      totalColumns: headers.length,
      missingData: {
        totalMissing,
        percentageMissing,
        variablesWithMissing: missingValueReports.filter(v => v.missingCount > 0)
      },
      outliers: {
        totalOutliers,
        variablesWithOutliers: outlierReports
      },
      dataTypes,
      basicStats,
      recommendations,
      calculatedAt: new Date(),
      calculationMethod: 'client-side'
    };
    
    return report;
  }
}
