import { AnalysisType } from '@/types/analysis';

export class AnalysisService {
  private static R_ANALYTICS_URL = process.env.NEXT_PUBLIC_R_ANALYTICS_URL || 'http://localhost:8000';

  /**
   * Prepare data for R Analytics
   */
  static prepareDataForR(
    csvData: any[],
    variables: any[],
    demographics: any[]
  ): any {
    // Convert CSV data to R-compatible format
    const data: Record<string, any[]> = {};

    // Extract each variable's values
    variables.forEach(variable => {
      data[variable.column_name] = csvData.map(row => row[variable.column_name]);
    });

    // Apply demographic ranks/categories
    demographics.forEach(demo => {
      if (demo.ranks && demo.ranks.length > 0) {
        // Categorize continuous data into ranks
        const values = data[demo.column_name];
        data[`${demo.semantic_name}_rank`] = values.map((value: number) => {
          return this.categorizeValue(value, demo.ranks);
        });
      }
    });

    return data;
  }

  /**
   * Categorize a value into a rank
   */
  private static categorizeValue(value: number, ranks: any[]): string {
    for (const rank of ranks) {
      const min = rank.is_open_ended_min ? -Infinity : rank.min_value;
      const max = rank.is_open_ended_max ? Infinity : rank.max_value;

      if (value >= min && value <= max) {
        return rank.label;
      }
    }
    return 'Uncategorized';
  }

  /**
   * Execute descriptive statistics analysis
   */
  static async executeDescriptive(
    data: any,
    config: any
  ): Promise<any> {
    try {
      const response = await fetch(`${this.R_ANALYTICS_URL}/analysis/descriptive`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          data,
          groupBy: config.groupByDemographics ? config.demographicVariable : null,
          confidenceLevel: parseFloat(config.confidenceLevel) / 100,
        }),
      });

      if (!response.ok) {
        throw new Error('Descriptive analysis failed');
      }

      return await response.json();
    } catch (error) {
      console.error('Descriptive analysis error:', error);
      throw error;
    }
  }

  /**
   * Execute reliability analysis (Cronbach's Alpha)
   */
  static async executeReliability(
    data: any,
    groups: any[],
    config: any
  ): Promise<any> {
    try {
      const results = [];

      for (const group of groups) {
        const groupData: Record<string, any[]> = {};
        group.variables.forEach((v: any) => {
          groupData[v.column_name] = data[v.column_name];
        });

        const response = await fetch(`${this.R_ANALYTICS_URL}/analysis/reliability`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            data: groupData,
            showAlphaIfDeleted: config.showAlphaIfDeleted,
          }),
        });

        if (!response.ok) {
          throw new Error(`Reliability analysis failed for group ${group.name}`);
        }

        const result = await response.json();
        results.push({
          group: group.name,
          ...result,
        });
      }

      return { groups: results };
    } catch (error) {
      console.error('Reliability analysis error:', error);
      throw error;
    }
  }

  /**
   * Execute Exploratory Factor Analysis
   */
  static async executeEFA(
    data: any,
    variables: any[],
    config: any
  ): Promise<any> {
    try {
      const efaData: Record<string, any[]> = {};
      variables.forEach(v => {
        if (v.data_type === 'numeric') {
          efaData[v.column_name] = data[v.column_name];
        }
      });

      const response = await fetch(`${this.R_ANALYTICS_URL}/analysis/efa`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          data: efaData,
          rotation: config.rotation || 'varimax',
          nFactors: config.nFactors === 'auto' ? null : parseInt(config.nFactors),
          loadingThreshold: config.loadingThreshold || 0.4,
        }),
      });

      if (!response.ok) {
        throw new Error('EFA analysis failed');
      }

      return await response.json();
    } catch (error) {
      console.error('EFA analysis error:', error);
      throw error;
    }
  }

  /**
   * Execute Confirmatory Factor Analysis
   */
  static async executeCFA(
    data: any,
    groups: any[],
    config: any
  ): Promise<any> {
    try {
      // Build CFA model specification
      const model = this.buildCFAModel(groups);

      const cfaData: Record<string, any[]> = {};
      groups.forEach(group => {
        group.variables.forEach((v: any) => {
          cfaData[v.column_name] = data[v.column_name];
        });
      });

      const response = await fetch(`${this.R_ANALYTICS_URL}/analysis/cfa`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          data: cfaData,
          model,
          estimator: config.estimator || 'ML',
        }),
      });

      if (!response.ok) {
        throw new Error('CFA analysis failed');
      }

      return await response.json();
    } catch (error) {
      console.error('CFA analysis error:', error);
      throw error;
    }
  }

  /**
   * Build CFA model specification from variable groups
   */
  private static buildCFAModel(groups: any[]): string {
    const modelLines = groups.map(group => {
      const items = group.variables.map((v: any) => v.column_name).join(' + ');
      return `${group.name} =~ ${items}`;
    });

    return modelLines.join('\n');
  }

  /**
   * Execute correlation analysis
   */
  static async executeCorrelation(
    data: any,
    variables: any[],
    config: any
  ): Promise<any> {
    try {
      const corrData: Record<string, any[]> = {};
      variables.forEach(v => {
        if (v.data_type === 'numeric') {
          corrData[v.column_name] = data[v.column_name];
        }
      });

      const response = await fetch(`${this.R_ANALYTICS_URL}/analysis/correlation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          data: corrData,
          method: config.method || 'pearson',
          showSignificance: config.showSignificance !== false,
        }),
      });

      if (!response.ok) {
        throw new Error('Correlation analysis failed');
      }

      return await response.json();
    } catch (error) {
      console.error('Correlation analysis error:', error);
      throw error;
    }
  }

  /**
   * Execute ANOVA analysis
   */
  static async executeANOVA(
    data: any,
    dependentVars: any[],
    demographicVar: any,
    config: any
  ): Promise<any> {
    try {
      const results = [];

      for (const depVar of dependentVars) {
        const response = await fetch(`${this.R_ANALYTICS_URL}/analysis/anova`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            data: {
              dependent: data[depVar.column_name],
              factor: data[demographicVar.column_name],
            },
            postHoc: config.postHoc || 'tukey',
          }),
        });

        if (!response.ok) {
          throw new Error(`ANOVA failed for ${depVar.column_name}`);
        }

        const result = await response.json();
        results.push({
          dependent: depVar.column_name,
          factor: demographicVar.column_name,
          ...result,
        });
      }

      return { analyses: results };
    } catch (error) {
      console.error('ANOVA analysis error:', error);
      throw error;
    }
  }

  /**
   * Execute regression analysis
   */
  static async executeRegression(
    data: any,
    dependentVar: any,
    independentVars: any[],
    config: any
  ): Promise<any> {
    try {
      const regressionData: Record<string, any[]> = {
        dependent: data[dependentVar.column_name],
      };

      independentVars.forEach((v, index) => {
        regressionData[`independent_${index + 1}`] = data[v.column_name];
      });

      const response = await fetch(`${this.R_ANALYTICS_URL}/analysis/regression`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          data: regressionData,
          includeDiagnostics: config.includeDiagnostics !== false,
        }),
      });

      if (!response.ok) {
        throw new Error('Regression analysis failed');
      }

      return await response.json();
    } catch (error) {
      console.error('Regression analysis error:', error);
      throw error;
    }
  }

  /**
   * Execute SEM analysis
   */
  static async executeSEM(
    data: any,
    groups: any[],
    config: any
  ): Promise<any> {
    try {
      // Build SEM model specification
      const model = this.buildSEMModel(groups);

      const semData: Record<string, any[]> = {};
      groups.forEach(group => {
        group.variables.forEach((v: any) => {
          semData[v.column_name] = data[v.column_name];
        });
      });

      const response = await fetch(`${this.R_ANALYTICS_URL}/analysis/sem`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          data: semData,
          model,
          estimator: config.estimator || 'ML',
        }),
      });

      if (!response.ok) {
        throw new Error('SEM analysis failed');
      }

      return await response.json();
    } catch (error) {
      console.error('SEM analysis error:', error);
      throw error;
    }
  }

  /**
   * Build SEM model specification from variable groups
   */
  private static buildSEMModel(groups: any[]): string {
    // Measurement model
    const measurementModel = groups.map(group => {
      const items = group.variables.map((v: any) => v.column_name).join(' + ');
      return `${group.name} =~ ${items}`;
    });

    // Structural model (simple: all factors correlate)
    const structuralModel: string[] = [];
    for (let i = 0; i < groups.length - 1; i++) {
      for (let j = i + 1; j < groups.length; j++) {
        structuralModel.push(`${groups[i].name} ~~ ${groups[j].name}`);
      }
    }

    return [...measurementModel, ...structuralModel].join('\n');
  }

  /**
   * Execute analysis based on type
   */
  static async executeAnalysis(
    type: AnalysisType,
    data: any,
    variables: any[],
    groups: any[],
    demographics: any[],
    config: any
  ): Promise<any> {
    switch (type) {
      case 'descriptive':
        return this.executeDescriptive(data, config);

      case 'reliability':
        return this.executeReliability(data, groups, config);

      case 'efa':
        return this.executeEFA(data, variables, config);

      case 'cfa':
        return this.executeCFA(data, groups, config);

      case 'correlation':
        return this.executeCorrelation(data, variables, config);

      case 'anova':
        const demographicVar = demographics[0]; // Use first demographic
        const numericVars = variables.filter(v => v.data_type === 'numeric');
        return this.executeANOVA(data, numericVars, demographicVar, config);

      case 'regression':
        const depVar = variables.find(v => v.data_type === 'numeric');
        const indepVars = variables.filter(v => v.data_type === 'numeric' && v.id !== depVar?.id);
        return this.executeRegression(data, depVar, indepVars, config);

      case 'sem':
        return this.executeSEM(data, groups, config);

      default:
        throw new Error(`Unknown analysis type: ${type}`);
    }
  }

  /**
   * Check R server availability with detailed status
   * Only call this before executing analysis, not during upload/configuration
   */
  static async checkRServerAvailability(): Promise<RServerStatus> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
      
      const response = await fetch(`${this.R_ANALYTICS_URL}/health`, {
        method: 'GET',
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        const data = await response.json();
        return {
          available: true,
          status: data.status || 'healthy',
          version: data.version,
          uptime: data.uptime
        };
      }
      
      return {
        available: false,
        error: `Server returned status ${response.status}`
      };
    } catch (error: any) {
      const errorMessage = error.name === 'AbortError' 
        ? 'Connection timeout after 5 seconds'
        : error.message;
      
      return {
        available: false,
        error: errorMessage,
        instructions: [
          '🔴 R Analytics Server is not available',
          '',
          '📍 Expected URL: http://localhost:8000',
          '',
          '🚀 To start the R server:',
          '',
          'Option 1 - Using PowerShell script:',
          '  cd r-analytics',
          '  .\\start.ps1',
          '',
          'Option 2 - Using Docker Compose:',
          '  cd r-analytics',
          '  docker-compose up -d',
          '',
          'Option 3 - Check if already running:',
          '  docker ps | findstr ncskit-r-analytics',
          '',
          '✅ Once started, click "Retry Connection" below'
        ]
      };
    }
  }

  /**
   * Execute analysis with R server availability check
   * This is the ONLY place where R server should be checked
   */
  static async executeAnalysisWithCheck(
    type: AnalysisType,
    data: any,
    variables: any[],
    groups: any[],
    demographics: any[],
    config: any
  ): Promise<any> {
    // Check R server availability first
    const serverStatus = await this.checkRServerAvailability();
    
    if (!serverStatus.available) {
      throw new RServerUnavailableError(
        'R Analytics Server is not available',
        serverStatus.instructions || [],
        serverStatus.error
      );
    }
    
    // Proceed with analysis execution
    return this.executeAnalysis(type, data, variables, groups, demographics, config);
  }

  /**
   * @deprecated Use checkRServerAvailability() instead
   * Kept for backward compatibility
   */
  static async checkRServiceHealth(): Promise<boolean> {
    const status = await this.checkRServerAvailability();
    return status.available;
  }

  /**
   * Save variable groups and demographics to database
   * Task 12.1: Create save API endpoint
   * Requirements: 7.2
   */
  static async saveGroupsAndDemographics(
    projectId: string,
    groups: any[],
    demographics: any[]
  ): Promise<{ success: boolean; message: string; groupCount: number; demographicCount: number }> {
    try {
      const response = await fetch('/api/analysis/groups/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId,
          groups,
          demographics,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save configuration');
      }

      return await response.json();
    } catch (error) {
      console.error('Save groups and demographics error:', error);
      throw error;
    }
  }
}

// ============================================================================
// Types
// ============================================================================

export interface RServerStatus {
  available: boolean;
  status?: string;
  version?: string;
  uptime?: number;
  error?: string;
  instructions?: string[];
}

export class RServerUnavailableError extends Error {
  constructor(
    message: string,
    public instructions: string[],
    public serverError?: string
  ) {
    super(message);
    this.name = 'RServerUnavailableError';
  }
}
