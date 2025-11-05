// NCSKIT R Analysis Service
// Interface with R backend for statistical analysis

import { ErrorHandler } from './error-handler';
import { errorRecoveryService, ErrorRecoveryContext } from './error-recovery';

const R_API_BASE_URL = process.env.NEXT_PUBLIC_R_API_URL || 'http://localhost:8000';

export interface DataHealthCheck {
  status: string;
  summary: {
    rows: number;
    columns: number;
    missing_data: Array<{
      variable: string;
      missing_count: number;
      missing_percent: number;
    }>;
    column_types: Record<string, string>;
    numeric_stats: Array<{
      variable: string;
      mean: number;
      sd: number;
      min: number;
      max: number;
      unique: number;
    }>;
    outliers: Array<{
      variable: string;
      outlier_count: number;
    }>;
  };
  recommendations: string[];
}

export interface DescriptiveResults {
  descriptive: any;
  normality: Record<string, number>;
  frequencies: Record<string, any>;
  correlation: {
    matrix: number[][];
    significance: number[][];
  };
}

export interface ReliabilityResults {
  [scaleName: string]: {
    cronbach_alpha: number;
    standardized_alpha: number;
    items: any;
    if_item_deleted: any;
    n_items: number;
    n_cases: number;
  };
}

export interface EFAResults {
  kmo: number;
  bartlett_chi2: number;
  bartlett_p: number;
  n_factors: number;
  eigenvalues: number[];
  variance_explained: any;
  factor_loadings: number[][];
  communalities: number[];
  fit_indices: {
    rms: number;
    tli: number;
    rmsea: number;
  };
}

export interface CFAResults {
  fit_indices: Record<string, number>;
  parameter_estimates: any[];
  reliability: any;
  modification_indices: any[];
}

export interface SEMResults {
  fit_indices: Record<string, number>;
  parameter_estimates: any[];
  r_squared: Record<string, number>;
  modification_indices: any[];
}

export interface VIFResults {
  vif: Record<string, number>;
  tolerance: Record<string, number>;
  interpretation: Record<string, string>;
}

export interface ANOVAResults {
  anova_table: any;
  effect_sizes: any;
  posthoc: any;
  assumptions: {
    normality: number;
    homogeneity: number;
  };
}

export interface TTestResults {
  t_statistic: number;
  df: number;
  p_value: number;
  confidence_interval: [number, number];
  mean_difference: number;
  cohens_d: number;
  assumptions: {
    normality_group1: number;
    normality_group2: number;
    equal_variances: number;
  };
}

class RAnalysisService {
  private async makeRequest(endpoint: string, data: any): Promise<any> {
    const context: ErrorRecoveryContext = {
      operation: 'makeRequest',
      component: 'r-analysis',
      data: { endpoint, dataSize: JSON.stringify(data).length },
      timestamp: new Date()
    };

    return errorRecoveryService.withRetry(async () => {
      try {
        // Check if R server is available first
        await this.checkServerAvailability();

        const response = await fetch(`${R_API_BASE_URL}${endpoint}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
          signal: AbortSignal.timeout(30000), // 30 second timeout
        });

        if (!response.ok) {
          const errorText = await response.text().catch(() => 'Unknown error');
          throw new Error(`R Analysis API Error (${response.status}): ${errorText}`);
        }

        const result = await response.json();
        
        if (result.status === 'error') {
          throw new Error(`R Analysis Error: ${result.message || 'Unknown analysis error'}`);
        }

        return result;
      } catch (error: any) {
        console.error(`R Analysis API Error (${endpoint}):`, error);
        
        // Transform error to user-friendly message
        const userError = ErrorHandler.handleDataIntegrationError(error);
        const enhancedError = new Error(userError.message);
        (enhancedError as any).userMessage = userError;
        (enhancedError as any).originalError = error;
        
        throw enhancedError;
      }
    }, context, {
      maxAttempts: 3,
      delay: 2000,
      retryCondition: (error) => {
        const errorMessage = error?.message?.toLowerCase() || '';
        return errorMessage.includes('network') || 
               errorMessage.includes('timeout') ||
               errorMessage.includes('fetch') ||
               errorMessage.includes('connection') ||
               errorMessage.includes('503') ||
               errorMessage.includes('502');
      }
    });
  }

  private async checkServerAvailability(): Promise<void> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

      const response = await fetch(`${R_API_BASE_URL}/health`, {
        method: 'GET',
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`R server health check failed: ${response.status}`);
      }
    } catch (error: any) {
      if (error.name === 'AbortError') {
        throw new Error('R analysis server is not responding (timeout)');
      }
      throw new Error('R analysis server is not available');
    }
  }

  // Health check for R server
  async healthCheck(): Promise<any> {
    const context: ErrorRecoveryContext = {
      operation: 'healthCheck',
      component: 'r-analysis',
      timestamp: new Date()
    };

    return errorRecoveryService.withRetry(async () => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);

        const response = await fetch(`${R_API_BASE_URL}/health`, {
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`R server health check failed: ${response.status}`);
        }

        const result = await response.json();
        return result;
      } catch (error: any) {
        console.error('R server health check failed:', error);
        
        if (error.name === 'AbortError') {
          throw new Error('R analysis server is not responding (timeout)');
        }
        
        const userError = ErrorHandler.handleDataIntegrationError(error);
        const enhancedError = new Error(userError.message);
        (enhancedError as any).userMessage = userError;
        
        throw enhancedError;
      }
    }, context, {
      maxAttempts: 2,
      delay: 1000
    });
  }

  // Data health check and preprocessing
  async checkDataHealth(data: any[][]): Promise<DataHealthCheck> {
    try {
      // Validate input data
      if (!data || !Array.isArray(data) || data.length === 0) {
        throw new Error('Invalid data: Data must be a non-empty array');
      }

      if (data.length < 2) {
        throw new Error('Invalid data: Data must contain at least a header row and one data row');
      }

      // Check data size (limit to prevent server overload)
      const dataSize = JSON.stringify(data).length;
      if (dataSize > 10 * 1024 * 1024) { // 10MB limit
        throw new Error('Data too large: Please reduce the dataset size to under 10MB');
      }

      const result = await this.makeRequest('/data/health-check', { data });
      return result;
    } catch (error: any) {
      console.error('Data health check failed:', error);
      
      // If it's already a user-friendly error, re-throw it
      if (error.userMessage) {
        throw error;
      }
      
      // Transform to user-friendly error
      const userError = ErrorHandler.handleDataIntegrationError(error);
      const enhancedError = new Error(userError.message);
      (enhancedError as any).userMessage = userError;
      
      throw enhancedError;
    }
  }

  // Descriptive statistics
  async descriptiveAnalysis(data: any[][], variables: {
    numeric: string[];
    categorical: string[];
  }): Promise<DescriptiveResults> {
    const result = await this.makeRequest('/analysis/descriptive', {
      data,
      variables
    });
    return result.results;
  }

  // Reliability analysis (Cronbach's Alpha)
  async reliabilityAnalysis(data: any[][], scales: Record<string, string[]>): Promise<ReliabilityResults> {
    const result = await this.makeRequest('/analysis/reliability', {
      data,
      scales
    });
    return result.results;
  }

  // Exploratory Factor Analysis
  async exploratoryFactorAnalysis(
    data: any[][], 
    variables: string[], 
    nFactors?: number
  ): Promise<EFAResults> {
    const result = await this.makeRequest('/analysis/efa', {
      data,
      variables,
      n_factors: nFactors
    });
    return result.results;
  }

  // Confirmatory Factor Analysis
  async confirmatoryFactorAnalysis(
    data: any[][], 
    modelSyntax: string
  ): Promise<CFAResults> {
    const result = await this.makeRequest('/analysis/cfa', {
      data,
      model_syntax: modelSyntax
    });
    return result.results;
  }

  // Structural Equation Modeling
  async structuralEquationModeling(
    data: any[][], 
    modelSyntax: string
  ): Promise<SEMResults> {
    const result = await this.makeRequest('/analysis/sem', {
      data,
      model_syntax: modelSyntax
    });
    return result.results;
  }

  // Variance Inflation Factor analysis
  async vifAnalysis(
    data: any[][], 
    dependent: string, 
    independent: string[]
  ): Promise<VIFResults> {
    const result = await this.makeRequest('/analysis/vif', {
      data,
      dependent,
      independent
    });
    return result.results;
  }

  // ANOVA analysis
  async anovaAnalysis(
    data: any[][], 
    dependent: string, 
    independent: string[]
  ): Promise<ANOVAResults> {
    const result = await this.makeRequest('/analysis/anova', {
      data,
      dependent,
      independent
    });
    return result.results;
  }

  // T-test analysis
  async ttestAnalysis(
    data: any[][], 
    dependent: string, 
    independent: string,
    testType: 'independent' | 'paired' | 'one-sample' = 'independent'
  ): Promise<TTestResults> {
    const result = await this.makeRequest('/analysis/ttest', {
      data,
      dependent,
      independent,
      test_type: testType
    });
    return result.results;
  }

  // Generate lavaan syntax for CFA/SEM
  generateLavaanSyntax(model: {
    latentVariables: Record<string, string[]>;
    regressions?: Array<{ dependent: string; independent: string[] }>;
    covariances?: Array<{ var1: string; var2: string }>;
  }): string {
    let syntax = '';

    // Measurement model
    for (const [latent, indicators] of Object.entries(model.latentVariables)) {
      syntax += `${latent} =~ ${indicators.join(' + ')}\n`;
    }

    // Structural model (regressions)
    if (model.regressions) {
      for (const regression of model.regressions) {
        syntax += `${regression.dependent} ~ ${regression.independent.join(' + ')}\n`;
      }
    }

    // Covariances
    if (model.covariances) {
      for (const cov of model.covariances) {
        syntax += `${cov.var1} ~~ ${cov.var2}\n`;
      }
    }

    return syntax;
  }

  // Interpret statistical results
  interpretResults(analysisType: string, results: any): string {
    switch (analysisType) {
      case 'reliability':
        return this.interpretReliability(results);
      case 'efa':
        return this.interpretEFA(results);
      case 'cfa':
        return this.interpretCFA(results);
      case 'sem':
        return this.interpretSEM(results);
      case 'vif':
        return this.interpretVIF(results);
      case 'anova':
        return this.interpretANOVA(results);
      case 'ttest':
        return this.interpretTTest(results);
      default:
        return 'Analysis completed successfully.';
    }
  }

  private interpretReliability(results: ReliabilityResults): string {
    let interpretation = 'Reliability Analysis Results:\n\n';
    
    for (const [scale, result] of Object.entries(results)) {
      const alpha = result.cronbach_alpha;
      let reliability_level = '';
      
      if (alpha >= 0.9) reliability_level = 'Excellent';
      else if (alpha >= 0.8) reliability_level = 'Good';
      else if (alpha >= 0.7) reliability_level = 'Acceptable';
      else if (alpha >= 0.6) reliability_level = 'Questionable';
      else reliability_level = 'Poor';
      
      interpretation += `${scale}: α = ${alpha.toFixed(3)} (${reliability_level})\n`;
    }
    
    return interpretation;
  }

  private interpretEFA(results: EFAResults): string {
    let interpretation = 'Exploratory Factor Analysis Results:\n\n';
    
    interpretation += `KMO Measure: ${results.kmo.toFixed(3)} `;
    if (results.kmo >= 0.8) interpretation += '(Excellent)\n';
    else if (results.kmo >= 0.7) interpretation += '(Good)\n';
    else if (results.kmo >= 0.6) interpretation += '(Adequate)\n';
    else interpretation += '(Inadequate)\n';
    
    interpretation += `Bartlett's Test: χ² = ${results.bartlett_chi2.toFixed(2)}, p ${results.bartlett_p < 0.001 ? '< 0.001' : '= ' + results.bartlett_p.toFixed(3)}\n`;
    interpretation += `Number of factors extracted: ${results.n_factors}\n`;
    
    return interpretation;
  }

  private interpretCFA(results: CFAResults): string {
    let interpretation = 'Confirmatory Factor Analysis Results:\n\n';
    
    const cfi = results.fit_indices.cfi;
    const tli = results.fit_indices.tli;
    const rmsea = results.fit_indices.rmsea;
    const srmr = results.fit_indices.srmr;
    
    interpretation += `Model Fit Indices:\n`;
    interpretation += `CFI = ${cfi?.toFixed(3)} ${cfi >= 0.95 ? '(Excellent)' : cfi >= 0.90 ? '(Acceptable)' : '(Poor)'}\n`;
    interpretation += `TLI = ${tli?.toFixed(3)} ${tli >= 0.95 ? '(Excellent)' : tli >= 0.90 ? '(Acceptable)' : '(Poor)'}\n`;
    interpretation += `RMSEA = ${rmsea?.toFixed(3)} ${rmsea <= 0.05 ? '(Excellent)' : rmsea <= 0.08 ? '(Acceptable)' : '(Poor)'}\n`;
    interpretation += `SRMR = ${srmr?.toFixed(3)} ${srmr <= 0.05 ? '(Excellent)' : srmr <= 0.08 ? '(Acceptable)' : '(Poor)'}\n`;
    
    return interpretation;
  }

  private interpretSEM(results: SEMResults): string {
    let interpretation = 'Structural Equation Modeling (SEM) Results:\n\n';
    
    // Model fit interpretation
    const fit = results.fit_indices;
    
    interpretation += 'Model Fit Indices:\n';
    interpretation += `Chi-square = ${fit.chisq?.toFixed(3)}, df = ${fit.df}, p = ${fit.pvalue?.toFixed(3)}\n`;
    interpretation += `CFI = ${fit.cfi?.toFixed(3)} ${fit.cfi >= 0.95 ? '(Excellent)' : fit.cfi >= 0.90 ? '(Acceptable)' : '(Poor)'}\n`;
    interpretation += `TLI = ${fit.tli?.toFixed(3)} ${fit.tli >= 0.95 ? '(Excellent)' : fit.tli >= 0.90 ? '(Acceptable)' : '(Poor)'}\n`;
    interpretation += `RMSEA = ${fit.rmsea?.toFixed(3)} ${fit.rmsea <= 0.05 ? '(Excellent)' : fit.rmsea <= 0.08 ? '(Acceptable)' : '(Poor)'}\n`;
    interpretation += `SRMR = ${fit.srmr?.toFixed(3)} ${fit.srmr <= 0.05 ? '(Excellent)' : fit.srmr <= 0.08 ? '(Acceptable)' : '(Poor)'}\n\n`;
    
    // Parameter estimates
    if (results.parameter_estimates && results.parameter_estimates.length > 0) {
      interpretation += 'Parameter Estimates:\n';
      results.parameter_estimates.forEach((param: any) => {
        const significance = param.pvalue < 0.001 ? '***' : param.pvalue < 0.01 ? '**' : param.pvalue < 0.05 ? '*' : '';
        interpretation += `${param.lhs} ${param.op} ${param.rhs}: Est = ${param.est?.toFixed(3)}, p = ${param.pvalue?.toFixed(3)} ${significance}\n`;
      });
    }
    
    return interpretation;
  }

  private interpretVIF(results: VIFResults): string {
    let interpretation = 'Multicollinearity Analysis (VIF):\n\n';
    
    for (const [variable, vif] of Object.entries(results.vif)) {
      interpretation += `${variable}: VIF = ${vif.toFixed(3)} (${results.interpretation[variable]})\n`;
    }
    
    return interpretation;
  }

  private interpretANOVA(results: ANOVAResults): string {
    let interpretation = 'ANOVA Results:\n\n';
    
    // Add specific ANOVA interpretation based on results
    interpretation += 'Analysis of variance completed. Check the detailed results table for significance tests.\n';
    
    return interpretation;
  }

  private interpretTTest(results: TTestResults): string {
    let interpretation = 'T-Test Results:\n\n';
    
    interpretation += `t(${results.df}) = ${results.t_statistic.toFixed(3)}, p ${results.p_value < 0.001 ? '< 0.001' : '= ' + results.p_value.toFixed(3)}\n`;
    interpretation += `Cohen's d = ${results.cohens_d.toFixed(3)} `;
    
    const d = Math.abs(results.cohens_d);
    if (d >= 0.8) interpretation += '(Large effect)\n';
    else if (d >= 0.5) interpretation += '(Medium effect)\n';
    else if (d >= 0.2) interpretation += '(Small effect)\n';
    else interpretation += '(Negligible effect)\n';
    
    return interpretation;
  }

  // Server status and error recovery methods
  async getServerStatus(): Promise<{
    available: boolean;
    version?: string;
    capabilities?: string[];
    lastCheck: Date;
  }> {
    try {
      const health = await this.healthCheck();
      return {
        available: true,
        version: health.version,
        capabilities: health.capabilities || [],
        lastCheck: new Date()
      };
    } catch (error) {
      return {
        available: false,
        lastCheck: new Date()
      };
    }
  }

  // Fallback analysis methods for when R server is unavailable
  async fallbackDescriptiveAnalysis(data: any[][]): Promise<Partial<DescriptiveResults>> {
    try {
      // Basic client-side descriptive statistics
      const headers = data[0];
      const rows = data.slice(1);
      
      const numericColumns = headers.map((header, index) => {
        const values = rows.map(row => row[index]).filter(val => val !== null && val !== undefined && val !== '');
        const numericValues = values.map(val => Number(val)).filter(val => !isNaN(val));
        
        if (numericValues.length > values.length * 0.8) { // 80% numeric threshold
          const mean = numericValues.reduce((a, b) => a + b, 0) / numericValues.length;
          const variance = numericValues.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / numericValues.length;
          const std = Math.sqrt(variance);
          
          return {
            variable: header,
            mean: Number(mean.toFixed(3)),
            std: Number(std.toFixed(3)),
            min: Math.min(...numericValues),
            max: Math.max(...numericValues),
            count: numericValues.length
          };
        }
        return null;
      }).filter(Boolean);

      return {
        descriptive: {
          numeric: numericColumns,
          note: 'Basic statistics computed client-side. For advanced analysis, please ensure R server is running.'
        },
        normality: {},
        frequencies: {},
        correlation: {
          matrix: [],
          significance: []
        }
      };
    } catch (error) {
      console.error('Fallback analysis failed:', error);
      throw new Error('Unable to perform analysis. Please check your data format.');
    }
  }

  // Error recovery suggestions
  getRecoverySuggestions(error: any): string[] {
    const suggestions: string[] = [];
    const errorMessage = error?.message?.toLowerCase() || '';

    if (errorMessage.includes('server') || errorMessage.includes('connection') || errorMessage.includes('fetch')) {
      suggestions.push('Check if the R analysis server is running');
      suggestions.push('Verify the server URL configuration');
      suggestions.push('Try refreshing the page');
    }

    if (errorMessage.includes('timeout')) {
      suggestions.push('The analysis is taking longer than expected');
      suggestions.push('Try with a smaller dataset');
      suggestions.push('Check your internet connection');
    }

    if (errorMessage.includes('data') || errorMessage.includes('format')) {
      suggestions.push('Verify your data format is correct');
      suggestions.push('Ensure data contains numeric values for statistical analysis');
      suggestions.push('Check for missing or invalid data');
    }

    if (errorMessage.includes('memory') || errorMessage.includes('size')) {
      suggestions.push('Your dataset may be too large');
      suggestions.push('Try reducing the number of rows or columns');
      suggestions.push('Consider sampling your data');
    }

    if (suggestions.length === 0) {
      suggestions.push('Try the analysis again');
      suggestions.push('Check the console for detailed error information');
      suggestions.push('Contact support if the problem persists');
    }

    return suggestions;
  }

  // Validate analysis parameters
  validateAnalysisParams(analysisType: string, params: any): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    switch (analysisType) {
      case 'reliability':
        if (!params.scales || Object.keys(params.scales).length === 0) {
          errors.push('At least one scale must be defined for reliability analysis');
        }
        break;

      case 'efa':
        if (!params.variables || params.variables.length < 3) {
          errors.push('EFA requires at least 3 variables');
        }
        break;

      case 'cfa':
      case 'sem':
        if (!params.modelSyntax || params.modelSyntax.trim().length === 0) {
          errors.push('Model syntax is required for CFA/SEM analysis');
        }
        break;

      case 'regression':
        if (!params.dependent) {
          errors.push('Dependent variable is required for regression analysis');
        }
        if (!params.independent || params.independent.length === 0) {
          errors.push('At least one independent variable is required');
        }
        break;
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

export const rAnalysisService = new RAnalysisService();