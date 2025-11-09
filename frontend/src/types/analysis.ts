/**
 * Type definitions for CSV Analysis Workflow
 * Generated from database schema
 */

// ============================================================================
// Core Entity Types
// ============================================================================

export interface AnalysisProject {
  id: string;
  userId: string;
  name: string;
  description?: string;
  csvFilePath: string;
  csvFileSize: number;
  rowCount: number;
  columnCount: number;
  status: ProjectStatus;
  createdAt: string;
  updatedAt: string;
}

export type ProjectStatus = 'draft' | 'configured' | 'analyzing' | 'completed' | 'error';

export interface AnalysisVariable {
  id: string;
  projectId: string;
  columnName: string;
  displayName?: string;
  dataType: DataType;
  isDemographic: boolean;
  demographicType?: DemographicType;
  semanticName?: string;
  variableGroupId?: string;
  missingCount: number;
  uniqueCount: number;
  minValue?: number;
  maxValue?: number;
  meanValue?: number;
  createdAt: string;
}

export type DataType = 'numeric' | 'categorical' | 'text' | 'date';
export type DemographicType = 'categorical' | 'ordinal' | 'continuous';

export interface VariableGroup {
  id: string;
  projectId: string;
  name: string;
  description?: string;
  groupType: GroupType;
  displayOrder: number;
  createdAt: string;
  variables?: AnalysisVariable[];
}

export type GroupType = 'construct' | 'demographic' | 'control';

export interface DemographicRank {
  id: string;
  variableId: string;
  rankOrder: number;
  label: string;
  minValue?: number;
  maxValue?: number;
  isOpenEndedMin: boolean;
  isOpenEndedMax: boolean;
  count: number;
  createdAt: string;
}

export interface OrdinalCategory {
  id: string;
  variableId: string;
  categoryOrder: number;
  categoryValue: string;
  categoryLabel?: string;
  count: number;
  createdAt: string;
}

export interface AnalysisConfiguration {
  id: string;
  projectId: string;
  analysisType: AnalysisType;
  configuration: Record<string, any>;
  isEnabled: boolean;
  createdAt: string;
}

export type AnalysisType =
  | 'descriptive'
  | 'reliability'
  | 'efa'
  | 'cfa'
  | 'correlation'
  | 'ttest'
  | 'anova'
  | 'regression'
  | 'sem';

export interface AnalysisResult {
  id: string;
  projectId: string;
  analysisType: AnalysisType;
  results: any;
  executionTimeMs?: number;
  executedAt: string;
}

// ============================================================================
// Data Health Types
// ============================================================================

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

export interface QualityMetrics {
  missingDataScore: number;
  outlierScore: number;
  dataTypeScore: number;
  sampleSizeScore: number;
}

export interface DataHealthReport {
  overallScore: number; // 0-100
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
  calculationMethod: 'client-side' | 'r-server';
  analysisTime?: number;
}

// ============================================================================
// Variable Grouping Types
// ============================================================================

export interface VariableGroupSuggestion {
  suggestedName: string;
  variables: string[];
  confidence: number; // 0-1
  reason: string;
}

// ============================================================================
// Rank Creation Types
// ============================================================================

export interface RankDefinition {
  label: string;
  minValue?: number;
  maxValue?: number;
  isOpenEndedMin?: boolean;
  isOpenEndedMax?: boolean;
}

export interface RankPreview {
  rank: RankDefinition;
  count: number;
  percentage: number;
  values: number[];
}

// ============================================================================
// API Request/Response Types
// ============================================================================

// Upload CSV
export interface UploadCSVRequest {
  file: File;
  name: string;
  description?: string;
}

export interface UploadCSVResponse {
  success: boolean;
  project: AnalysisProject;
  preview: Array<Record<string, any>>;
}

// Health Check
export interface HealthCheckRequest {
  projectId: string;
}

export interface HealthCheckResponse {
  success: boolean;
  healthReport: DataHealthReport;
  variables: AnalysisVariable[];
}

// Variable Grouping
export interface GroupVariablesRequest {
  projectId: string;
}

export interface GroupVariablesResponse {
  success: boolean;
  suggestions: VariableGroupSuggestion[];
}

// Save Configuration
export interface SaveConfigurationRequest {
  projectId: string;
  groups: Omit<VariableGroup, 'id' | 'createdAt'>[];
  demographics: Array<{
    variableId: string;
    semanticName: string;
    demographicType: DemographicType;
    ranks?: RankDefinition[];
    categories?: Omit<OrdinalCategory, 'id' | 'createdAt' | 'variableId'>[];
  }>;
  analyses: Omit<AnalysisConfiguration, 'id' | 'createdAt'>[];
}

export interface SaveConfigurationResponse {
  success: boolean;
  message: string;
}

// Execute Analysis
export interface ExecuteAnalysisRequest {
  projectId: string;
  analysisTypes?: AnalysisType[];
}

export interface ExecuteAnalysisResponse {
  success: boolean;
  jobId: string;
  estimatedTime: number; // seconds
}

// Get Results
export interface GetResultsResponse {
  success: boolean;
  project: AnalysisProject;
  results: AnalysisResult[];
}

// Export
export interface ExportRequest {
  projectId: string;
  includeAnalyses: AnalysisType[];
  options: ExportOptions;
}

export interface ExportOptions {
  includeCharts?: boolean;
  significanceLevel?: number;
  decimalPlaces?: number;
  includeInterpretation?: boolean;
  pageSize?: 'A4' | 'Letter';
  orientation?: 'portrait' | 'landscape';
}

export interface ExportResponse {
  success: boolean;
  downloadUrl: string;
  expiresAt: string;
}

// ============================================================================
// Analysis Result Types
// ============================================================================

export interface DescriptiveStatsResult {
  variables: Array<{
    name: string;
    n: number;
    mean: number;
    sd: number;
    min: number;
    max: number;
    skewness: number;
    kurtosis: number;
  }>;
  byGroup?: Record<string, any>;
}

export interface ReliabilityResult {
  construct: string;
  cronbachAlpha: number;
  items: Array<{
    item: string;
    itemTotalCorrelation: number;
    alphaIfDeleted: number;
  }>;
  mean: number;
  sd: number;
}

export interface EFAResult {
  kmo: number;
  bartlett: {
    chisq: number;
    df: number;
    pvalue: number;
  };
  factors: number;
  loadings: Array<{
    item: string;
    [key: `factor${number}`]: number;
    communality: number;
  }>;
  varianceExplained: Array<{
    factor: number;
    eigenvalue: number;
    variance: number;
    cumulative: number;
  }>;
}

export interface CFAResult {
  fitIndices: {
    cfi: number;
    tli: number;
    rmsea: number;
    srmr: number;
    chisq: number;
    df: number;
    pvalue: number;
  };
  loadings: Array<{
    item: string;
    factor: string;
    estimate: number;
    se: number;
    zvalue: number;
    pvalue: number;
  }>;
  reliability: Array<{
    factor: string;
    cronbachAlpha: number;
    compositeReliability: number;
    ave: number;
  }>;
}

export interface CorrelationResult {
  method: 'pearson' | 'spearman' | 'kendall';
  matrix: Array<{
    var1: string;
    var2: string;
    correlation: number;
    pvalue: number;
    significant: boolean;
  }>;
}

export interface ANOVAResult {
  dependent: string;
  factor: string;
  groups: Array<{
    group: string;
    n: number;
    mean: number;
    sd: number;
  }>;
  anova: {
    fvalue: number;
    df1: number;
    df2: number;
    pvalue: number;
    etaSquared: number;
  };
  postHoc?: Array<{
    group1: string;
    group2: string;
    diff: number;
    pvalue: number;
    significant: boolean;
  }>;
}

export interface RegressionResult {
  formula: string;
  coefficients: Array<{
    term: string;
    estimate: number;
    se: number;
    tvalue: number;
    pvalue: number;
  }>;
  modelFit: {
    rsquared: number;
    adjRsquared: number;
    fstatistic: number;
    pvalue: number;
  };
  diagnostics?: {
    vif?: Record<string, number>;
    durbinWatson?: number;
  };
}

export interface SEMResult {
  fitIndices: {
    cfi: number;
    tli: number;
    rmsea: number;
    srmr: number;
    chisq: number;
    df: number;
    pvalue: number;
  };
  paths: Array<{
    from: string;
    to: string;
    estimate: number;
    se: number;
    zvalue: number;
    pvalue: number;
    type: 'direct' | 'indirect' | 'total';
  }>;
  rsquared: Record<string, number>;
}

// ============================================================================
// UI State Types
// ============================================================================

export interface AnalysisWorkflowStep {
  id: number;
  name: string;
  status: 'pending' | 'current' | 'completed' | 'error';
  canNavigate: boolean;
}

export interface AnalysisValidationError {
  field: string;
  message: string;
}

// ============================================================================
// Utility Types
// ============================================================================

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type WithRequired<T, K extends keyof T> = T & { [P in K]-?: T[P] };
