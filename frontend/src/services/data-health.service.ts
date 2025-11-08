import { DataHealthReport, DataType } from '@/types/analysis';
import { CSVParserService } from './csv-parser.service';

export class DataHealthService {
  /**
   * Analyze data quality and generate health report
   */
  static analyzeDataQuality(data: any[], headers: string[]): DataHealthReport {
    const startTime = Date.now();

    // Detect missing values
    const missingData = this.detectMissingValues(data, headers);

    // Detect outliers for numeric columns
    const outliers = this.detectOutliers(data, headers);

    // Detect data types
    const dataTypes = this.detectDataTypes(data, headers);

    // Calculate overall quality score
    const overallScore = this.calculateQualityScore(missingData, outliers, dataTypes);

    // Generate recommendations
    const recommendations = this.generateRecommendations(missingData, outliers, dataTypes);

    const duration = Date.now() - startTime;

    return {
      overallScore,
      totalRows: data.length,
      totalColumns: headers.length,
      missingData,
      outliers,
      dataTypes,
      recommendations,
      analysisTime: duration,
    };
  }

  /**
   * Detect missing values in dataset
   */
  private static detectMissingValues(data: any[], headers: string[]) {
    let totalMissing = 0;
    const variablesWithMissing: Array<{
      variable: string;
      missingCount: number;
      missingPercentage: number;
    }> = [];

    for (const header of headers) {
      const values = data.map(row => row[header]);
      const missingCount = values.filter(
        v => v === null || v === undefined || v === '' || v === 'NA' || v === 'N/A'
      ).length;

      if (missingCount > 0) {
        totalMissing += missingCount;
        variablesWithMissing.push({
          variable: header,
          missingCount,
          missingPercentage: (missingCount / data.length) * 100,
        });
      }
    }

    const totalCells = data.length * headers.length;
    const percentageMissing = (totalMissing / totalCells) * 100;

    return {
      totalMissing,
      percentageMissing,
      variablesWithMissing: variablesWithMissing.sort(
        (a, b) => b.missingPercentage - a.missingPercentage
      ),
    };
  }

  /**
   * Detect outliers using IQR method
   */
  private static detectOutliers(data: any[], headers: string[]) {
    let totalOutliers = 0;
    const variablesWithOutliers: Array<{
      variable: string;
      outlierCount: number;
      outlierPercentage: number;
      outlierIndices: number[];
    }> = [];

    for (const header of headers) {
      const values = data.map(row => row[header]);
      const numericValues = values
        .map((v, idx) => ({ value: Number(v), index: idx }))
        .filter(v => !isNaN(v.value));

      if (numericValues.length < 4) continue; // Need at least 4 values for IQR

      // Calculate IQR
      const sorted = numericValues.map(v => v.value).sort((a, b) => a - b);
      const q1Index = Math.floor(sorted.length * 0.25);
      const q3Index = Math.floor(sorted.length * 0.75);
      const q1 = sorted[q1Index];
      const q3 = sorted[q3Index];
      const iqr = q3 - q1;

      const lowerBound = q1 - 1.5 * iqr;
      const upperBound = q3 + 1.5 * iqr;

      // Find outliers
      const outlierIndices = numericValues
        .filter(v => v.value < lowerBound || v.value > upperBound)
        .map(v => v.index);

      if (outlierIndices.length > 0) {
        totalOutliers += outlierIndices.length;
        variablesWithOutliers.push({
          variable: header,
          outlierCount: outlierIndices.length,
          outlierPercentage: (outlierIndices.length / data.length) * 100,
          outlierIndices: outlierIndices.slice(0, 10), // Limit to first 10
        });
      }
    }

    return {
      totalOutliers,
      variablesWithOutliers: variablesWithOutliers.sort(
        (a, b) => b.outlierPercentage - a.outlierPercentage
      ),
    };
  }

  /**
   * Detect data types for all columns
   */
  private static detectDataTypes(data: any[], headers: string[]) {
    const typeMap = CSVParserService.detectDataTypes(data);
    
    let numeric = 0;
    let categorical = 0;
    let text = 0;
    let date = 0;

    for (const [_, typeInfo] of typeMap) {
      switch (typeInfo.type) {
        case 'numeric':
          numeric++;
          break;
        case 'categorical':
          categorical++;
          break;
        case 'text':
          text++;
          break;
        case 'date':
          date++;
          break;
      }
    }

    return {
      numeric,
      categorical,
      text,
      date,
      details: Array.from(typeMap.entries()).map(([variable, info]) => ({
        variable,
        type: info.type,
        confidence: info.confidence,
        uniqueCount: info.uniqueCount,
        missingCount: info.missingCount,
      })),
    };
  }

  /**
   * Calculate overall quality score (0-100)
   */
  private static calculateQualityScore(
    missingData: any,
    outliers: any,
    dataTypes: any
  ): number {
    // Missing data score (40% weight)
    const missingScore = Math.max(0, 100 - missingData.percentageMissing * 2);

    // Outlier score (30% weight)
    const totalCells = missingData.totalMissing + outliers.totalOutliers;
    const outlierPercentage = totalCells > 0 ? (outliers.totalOutliers / totalCells) * 100 : 0;
    const outlierScore = Math.max(0, 100 - outlierPercentage * 3);

    // Type consistency score (30% weight)
    const totalColumns = dataTypes.numeric + dataTypes.categorical + dataTypes.text + dataTypes.date;
    const avgConfidence = dataTypes.details.reduce((sum: number, d: any) => sum + d.confidence, 0) / totalColumns;
    const typeScore = avgConfidence * 100;

    // Weighted average
    const overallScore = Math.round(
      missingScore * 0.4 + outlierScore * 0.3 + typeScore * 0.3
    );

    return Math.max(0, Math.min(100, overallScore));
  }

  /**
   * Generate recommendations based on data quality
   */
  private static generateRecommendations(
    missingData: any,
    outliers: any,
    dataTypes: any
  ): string[] {
    const recommendations: string[] = [];

    // Missing data recommendations
    if (missingData.percentageMissing > 10) {
      recommendations.push(
        `High missing data rate (${missingData.percentageMissing.toFixed(1)}%). Consider data imputation or removing variables with >30% missing values.`
      );
    }

    if (missingData.variablesWithMissing.length > 0) {
      const topMissing = missingData.variablesWithMissing[0];
      if (topMissing.missingPercentage > 30) {
        recommendations.push(
          `Variable "${topMissing.variable}" has ${topMissing.missingPercentage.toFixed(1)}% missing values. Consider removing this variable.`
        );
      }
    }

    // Outlier recommendations
    if (outliers.totalOutliers > 0) {
      const outlierPercentage = (outliers.totalOutliers / (missingData.totalMissing + outliers.totalOutliers)) * 100;
      if (outlierPercentage > 5) {
        recommendations.push(
          `${outliers.totalOutliers} outliers detected (${outlierPercentage.toFixed(1)}%). Review outliers before analysis or consider robust statistical methods.`
        );
      }
    }

    // Data type recommendations
    if (dataTypes.text > dataTypes.numeric + dataTypes.categorical) {
      recommendations.push(
        `Many text columns detected. Ensure these are not meant to be categorical or numeric variables.`
      );
    }

    const lowConfidenceVars = dataTypes.details.filter((d: any) => d.confidence < 0.7);
    if (lowConfidenceVars.length > 0) {
      recommendations.push(
        `${lowConfidenceVars.length} variable(s) have ambiguous data types. Review and clean data if needed.`
      );
    }

    // Sample size recommendations
    if (missingData.totalRows < 30) {
      recommendations.push(
        `Small sample size (n=${missingData.totalRows}). Results may not be statistically reliable. Consider collecting more data.`
      );
    }

    // General recommendations
    if (recommendations.length === 0) {
      recommendations.push(
        'Data quality looks good! You can proceed with confidence to the next step.'
      );
    }

    return recommendations;
  }

  /**
   * Get quality score color
   */
  static getScoreColor(score: number): string {
    if (score >= 80) return 'green';
    if (score >= 60) return 'yellow';
    if (score >= 40) return 'orange';
    return 'red';
  }

  /**
   * Get quality score label
   */
  static getScoreLabel(score: number): string {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Poor';
  }
}
