import { AnalysisType } from '@/types/analysis';

export class ExportService {
  /**
   * Format results for Excel export (SPSS-style)
   */
  static formatForExcel(results: any[], project: any): any {
    const sheets: Record<string, any[]> = {};

    // Sheet 1: Project Overview
    sheets['Overview'] = [
      ['Project Name', project.name],
      ['Description', project.description || 'N/A'],
      ['Sample Size', project.rowCount],
      ['Variables', project.columnCount],
      ['Status', project.status],
      ['Created', new Date(project.createdAt).toLocaleString()],
      [''],
      ['Analysis Summary'],
      ['Total Analyses', results.length],
      ['Successful', results.filter(r => !r.results?.error).length],
      ['Failed', results.filter(r => r.results?.error).length],
      ['Total Execution Time', `${(results.reduce((sum, r) => sum + (r.execution_time_ms || 0), 0) / 1000).toFixed(2)}s`],
    ];

    // Create sheets for each analysis type
    results.forEach((result, index) => {
      const sheetName = this.getSheetName(result.analysis_type, index);
      sheets[sheetName] = this.formatAnalysisForExcel(result);
    });

    return sheets;
  }

  /**
   * Get sheet name for analysis type
   */
  private static getSheetName(type: AnalysisType, index: number): string {
    const names: Record<AnalysisType, string> = {
      descriptive: 'Descriptive Stats',
      reliability: 'Reliability',
      efa: 'EFA',
      cfa: 'CFA',
      correlation: 'Correlation',
      ttest: 'T-Test',
      anova: 'ANOVA',
      regression: 'Regression',
      sem: 'SEM',
    };
    return `${index + 1}. ${names[type]}`;
  }

  /**
   * Format individual analysis for Excel
   */
  private static formatAnalysisForExcel(result: any): any[] {
    const rows: any[] = [];

    // Header
    rows.push([this.getAnalysisName(result.analysis_type)]);
    rows.push(['Executed', new Date(result.executed_at).toLocaleString()]);
    rows.push(['Execution Time', `${(result.execution_time_ms / 1000).toFixed(2)}s`]);
    rows.push([]);

    // Check for error
    if (result.results?.error) {
      rows.push(['ERROR']);
      rows.push([result.results.message]);
      return rows;
    }

    // Format based on analysis type
    switch (result.analysis_type) {
      case 'descriptive':
        rows.push(...this.formatDescriptiveStats(result.results));
        break;
      case 'reliability':
        rows.push(...this.formatReliability(result.results));
        break;
      case 'correlation':
        rows.push(...this.formatCorrelation(result.results));
        break;
      default:
        // Generic JSON format
        rows.push(['Results']);
        rows.push([JSON.stringify(result.results, null, 2)]);
    }

    return rows;
  }

  /**
   * Format descriptive statistics
   */
  private static formatDescriptiveStats(results: any): any[] {
    const rows: any[] = [];
    
    if (results.variables && Array.isArray(results.variables)) {
      rows.push(['Variable', 'N', 'Mean', 'SD', 'Min', 'Max', 'Skewness', 'Kurtosis']);
      
      results.variables.forEach((v: any) => {
        rows.push([
          v.name,
          v.n,
          v.mean?.toFixed(3),
          v.sd?.toFixed(3),
          v.min?.toFixed(3),
          v.max?.toFixed(3),
          v.skewness?.toFixed(3),
          v.kurtosis?.toFixed(3),
        ]);
      });
    } else {
      rows.push(['No descriptive statistics available']);
    }

    return rows;
  }

  /**
   * Format reliability analysis
   */
  private static formatReliability(results: any): any[] {
    const rows: any[] = [];
    
    if (results.groups && Array.isArray(results.groups)) {
      results.groups.forEach((group: any) => {
        rows.push([`Group: ${group.group}`]);
        rows.push(['Cronbach\'s Alpha', group.cronbachAlpha?.toFixed(3)]);
        rows.push([]);
        
        if (group.items && Array.isArray(group.items)) {
          rows.push(['Item', 'Item-Total Correlation', 'Alpha if Deleted']);
          group.items.forEach((item: any) => {
            rows.push([
              item.item,
              item.itemTotalCorrelation?.toFixed(3),
              item.alphaIfDeleted?.toFixed(3),
            ]);
          });
        }
        rows.push([]);
      });
    } else {
      rows.push(['No reliability data available']);
    }

    return rows;
  }

  /**
   * Format correlation matrix
   */
  private static formatCorrelation(results: any): any[] {
    const rows: any[] = [];
    
    if (results.matrix && Array.isArray(results.matrix)) {
      rows.push(['Correlation Matrix']);
      rows.push(['Variable 1', 'Variable 2', 'Correlation', 'P-Value', 'Significant']);
      
      results.matrix.forEach((corr: any) => {
        rows.push([
          corr.var1,
          corr.var2,
          corr.correlation?.toFixed(3),
          corr.pvalue?.toFixed(4),
          corr.significant ? 'Yes' : 'No',
        ]);
      });
    } else {
      rows.push(['No correlation data available']);
    }

    return rows;
  }

  /**
   * Get analysis name
   */
  private static getAnalysisName(type: AnalysisType): string {
    const names: Record<AnalysisType, string> = {
      descriptive: 'Descriptive Statistics',
      reliability: 'Reliability Analysis (Cronbach\'s Alpha)',
      efa: 'Exploratory Factor Analysis',
      cfa: 'Confirmatory Factor Analysis',
      correlation: 'Correlation Analysis',
      ttest: 'Independent T-Test',
      anova: 'Analysis of Variance (ANOVA)',
      regression: 'Linear Regression',
      sem: 'Structural Equation Modeling',
    };
    return names[type];
  }

  /**
   * Format results for PDF export
   */
  static formatForPDF(results: any[], project: any): any {
    return {
      title: project.name,
      subtitle: 'Statistical Analysis Report',
      date: new Date().toLocaleDateString(),
      sections: [
        {
          title: 'Project Overview',
          content: [
            { label: 'Project Name', value: project.name },
            { label: 'Description', value: project.description || 'N/A' },
            { label: 'Sample Size', value: project.rowCount },
            { label: 'Variables', value: project.columnCount },
            { label: 'Status', value: project.status },
            { label: 'Created', value: new Date(project.createdAt).toLocaleString() },
          ],
        },
        {
          title: 'Analysis Summary',
          content: [
            { label: 'Total Analyses', value: results.length },
            { label: 'Successful', value: results.filter(r => !r.results?.error).length },
            { label: 'Failed', value: results.filter(r => r.results?.error).length },
            { 
              label: 'Total Execution Time', 
              value: `${(results.reduce((sum, r) => sum + (r.execution_time_ms || 0), 0) / 1000).toFixed(2)}s` 
            },
          ],
        },
        ...results.map(result => ({
          title: this.getAnalysisName(result.analysis_type),
          executedAt: new Date(result.executed_at).toLocaleString(),
          executionTime: `${(result.execution_time_ms / 1000).toFixed(2)}s`,
          content: result.results?.error 
            ? [{ label: 'Error', value: result.results.message }]
            : [{ label: 'Results', value: JSON.stringify(result.results, null, 2) }],
        })),
      ],
    };
  }

  /**
   * Generate filename for export
   */
  static generateFilename(projectName: string, format: 'xlsx' | 'pdf'): string {
    const sanitized = projectName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const timestamp = new Date().toISOString().split('T')[0];
    return `${sanitized}_${timestamp}.${format}`;
  }
}
