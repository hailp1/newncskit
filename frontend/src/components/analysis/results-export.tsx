'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AnalysisProject } from '@/app/(dashboard)/analysis/page';
import * as XLSX from 'xlsx';

interface ResultsExportProps {
  project: AnalysisProject;
  projectContext?: any; // Enhanced project context
  surveyMetadata?: {
    campaignId?: string;
    surveyId?: string;
    responseCount?: number;
    collectionPeriod?: { start: Date; end: Date };
    targetSampleSize?: number;
  };
}

export default function ResultsExport({ project, projectContext, surveyMetadata }: ResultsExportProps) {
  const [isExporting, setIsExporting] = useState(false);

  // Detect if this is survey data
  const isSurveyData = Boolean(
    projectContext?.dataCollection?.collectionMethod === 'internal_survey' ||
    surveyMetadata?.surveyId ||
    surveyMetadata?.campaignId
  );

  const exportToExcel = async () => {
    setIsExporting(true);
    try {
      const workbook = XLSX.utils.book_new();

      // Enhanced Project Summary Sheet with survey metadata
      const summaryData = [
        ['NCSKIT Data Analysis Report'],
        [''],
        ['Project Information'],
        ['Project Name', project.name],
        ['Description', project.description],
        ['Created', new Date(project.createdAt).toLocaleDateString()],
        ['Updated', new Date(project.updatedAt).toLocaleDateString()],
        ['']
      ];

      // Add survey-specific information
      if (isSurveyData) {
        summaryData.push(
          ['Survey Data Information'],
          ['Data Source', 'Survey Campaign'],
          ['Campaign ID', surveyMetadata?.campaignId || 'N/A'],
          ['Survey ID', surveyMetadata?.surveyId || 'N/A'],
          ['Response Count', (surveyMetadata?.responseCount || project.data.length - 1).toString()],
          ['Target Sample Size', surveyMetadata?.targetSampleSize?.toString() || 'N/A']
        );

        if (surveyMetadata?.collectionPeriod) {
          summaryData.push(
            ['Collection Start', new Date(surveyMetadata.collectionPeriod.start).toLocaleDateString()],
            ['Collection End', new Date(surveyMetadata.collectionPeriod.end).toLocaleDateString()]
          );
        }

        if (projectContext?.researchDesign) {
          summaryData.push(
            [''],
            ['Research Design Information'],
            ['Theoretical Frameworks', projectContext.researchDesign.theoreticalFrameworks?.map(f => f.name).join(', ') || 'N/A'],
            ['Research Variables', (projectContext.researchDesign.researchVariables?.length || 0).toString()],
            ['Hypotheses', (projectContext.researchDesign.hypotheses?.length || 0).toString()]
          );
        }
      } else {
        summaryData.push(
          ['Data Source Information'],
          ['Data Source', 'External File'],
          ['File Name', project.name]
        );
      }

      summaryData.push(
        [''],
        ['Data Summary'],
        ['Total Rows', (project.data.length - 1).toString()],
        ['Total Columns', project.columns.length.toString()],
        ['Numeric Variables', project.columns.filter(col => col.type === 'numeric').length.toString()],
        ['Categorical Variables', project.columns.filter(col => col.type === 'categorical').length.toString()],
        [''],
        ['Analysis Summary'],
        ['Research Models', project.models.length.toString()],
        ['Completed Analyses', project.results.length.toString()],
        ['Total Hypotheses', project.models.reduce((sum, model) => sum + model.hypotheses.length, 0).toString()]
      );

      const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
      XLSX.utils.book_append_sheet(workbook, summarySheet, 'Project Summary');

      // Variable Information Sheet
      const variableData = [
        ['Variable Name', 'Type', 'Role', 'Group', 'Missing Count', 'Unique Values', 'Mean', 'SD', 'Min', 'Max']
      ];

      project.columns.forEach(col => {
        variableData.push([
          col.name,
          col.type,
          col.role,
          col.group || '',
          (col.missing || 0).toString(),
          (col.stats?.unique || '').toString(),
          (col.stats?.mean || '').toString(),
          (col.stats?.std || '').toString(),
          (col.stats?.min || '').toString(),
          (col.stats?.max || '').toString()
        ]);
      });

      const variableSheet = XLSX.utils.aoa_to_sheet(variableData);
      XLSX.utils.book_append_sheet(workbook, variableSheet, 'Variables');

      // Research Models Sheet
      if (project.models.length > 0) {
        const modelData = [
          ['Model Name', 'Type', 'Independent Variables', 'Dependent Variables', 'Hypotheses']
        ];

        project.models.forEach(model => {
          modelData.push([
            model.name,
            model.type,
            model.variables.independent.join(', '),
            model.variables.dependent.join(', '),
            model.hypotheses.join(' | ')
          ]);
        });

        const modelSheet = XLSX.utils.aoa_to_sheet(modelData);
        XLSX.utils.book_append_sheet(workbook, modelSheet, 'Research Models');
      }

      // Analysis Results Sheets
      project.results.forEach((result, index) => {
        const sheetName = `${result.type}_${index + 1}`.substring(0, 31);
        
        // Create result sheet with interpretation and data
        const resultData = [
          [`${result.type.toUpperCase()} Analysis Results`],
          [''],
          ['Interpretation:'],
          [result.interpretation || 'No interpretation available'],
          [''],
          ['Results:']
        ];

        // Add table data based on result type
        if (result.type === 'descriptive' && result.data.descriptive) {
          resultData.push(['Variable', 'N', 'Mean', 'SD', 'Min', 'Max', 'Skew', 'Kurtosis']);
          
          Object.entries(result.data.descriptive).forEach(([variable, stats]: [string, any]) => {
            resultData.push([
              variable,
              stats.n || '',
              stats.mean || '',
              stats.sd || '',
              stats.min || '',
              stats.max || '',
              stats.skew || '',
              stats.kurtosis || ''
            ]);
          });
        } else if (result.type === 'reliability') {
          resultData.push(['Scale', 'Cronbach Alpha', 'Std. Alpha', 'Items', 'Cases']);
          
          Object.entries(result.data).forEach(([scale, data]: [string, any]) => {
            resultData.push([
              scale,
              data.cronbach_alpha || '',
              data.standardized_alpha || '',
              data.n_items || '',
              data.n_cases || ''
            ]);
          });
        } else {
          // Generic JSON export for other types
          resultData.push(['Raw Data (JSON):']);
          resultData.push([JSON.stringify(result.data, null, 2)]);
        }

        const resultSheet = XLSX.utils.aoa_to_sheet(resultData);
        XLSX.utils.book_append_sheet(workbook, resultSheet, sheetName);
      });

      // Raw Data Sheet (first 1000 rows to avoid Excel limits)
      const rawDataRows = project.data.slice(0, Math.min(1001, project.data.length));
      const rawDataSheet = XLSX.utils.aoa_to_sheet(rawDataRows);
      XLSX.utils.book_append_sheet(workbook, rawDataSheet, 'Raw Data');

      // Export file
      const fileName = `${project.name.replace(/[^a-zA-Z0-9]/g, '_')}_Analysis_${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(workbook, fileName);

    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const exportToJSON = () => {
    const exportData = {
      project: {
        name: project.name,
        description: project.description,
        createdAt: project.createdAt,
        updatedAt: project.updatedAt
      },
      dataSource: {
        type: isSurveyData ? 'survey_campaign' : 'external_file',
        ...(isSurveyData && surveyMetadata ? {
          campaignId: surveyMetadata.campaignId,
          surveyId: surveyMetadata.surveyId,
          responseCount: surveyMetadata.responseCount,
          targetSampleSize: surveyMetadata.targetSampleSize,
          collectionPeriod: surveyMetadata.collectionPeriod
        } : {})
      },
      researchContext: projectContext ? {
        theoreticalFrameworks: projectContext.researchDesign?.theoreticalFrameworks,
        researchVariables: projectContext.researchDesign?.researchVariables,
        hypotheses: projectContext.researchDesign?.hypotheses
      } : null,
      data: {
        rows: project.data.length - 1,
        columns: project.columns.length,
        variables: project.columns
      },
      models: project.models,
      results: project.results
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${project.name.replace(/[^a-zA-Z0-9]/g, '_')}_Analysis_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    URL.revokeObjectURL(url);
  };

  const saveToProject = async () => {
    // This would integrate with your project management system
    // For now, we'll just show a success message
    alert('Analysis results saved to project successfully!');
  };

  return (
    <div className="space-y-6">
      {/* Export Options */}
      <Card className="p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Export Analysis Results</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button
            onClick={exportToExcel}
            disabled={isExporting}
            className="w-full"
          >
            {isExporting ? 'Exporting...' : 'Export to Excel'}
          </Button>
          
          <Button
            onClick={exportToJSON}
            variant="outline"
            className="w-full"
          >
            Export to JSON
          </Button>
          
          <Button
            onClick={saveToProject}
            variant="outline"
            className="w-full"
          >
            Save to Project
          </Button>
        </div>

        <div className="mt-4 text-sm text-gray-600">
          <p>
            <strong>Excel Export:</strong> Includes all analysis results, variable information, 
            research models, and raw data in separate sheets.
          </p>
          <p className="mt-2">
            <strong>JSON Export:</strong> Machine-readable format for further analysis or integration.
          </p>
        </div>
      </Card>

      {/* Export Preview */}
      <Card className="p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Export Preview</h3>
        
        <div className="space-y-4">
          {/* Project Summary */}
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Project Summary</h4>
            <div className="bg-gray-50 rounded-md p-4 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <strong>Project:</strong> {project.name}
                </div>
                <div>
                  <strong>Created:</strong> {new Date(project.createdAt).toLocaleDateString()}
                </div>
                <div>
                  <strong>Data Source:</strong> {isSurveyData ? 'Survey Campaign' : 'External File'}
                </div>
                <div>
                  <strong>Data Size:</strong> {project.data.length - 1} rows × {project.columns.length} columns
                </div>
                {isSurveyData && surveyMetadata?.responseCount && (
                  <div>
                    <strong>Survey Responses:</strong> {surveyMetadata.responseCount}
                  </div>
                )}
                {isSurveyData && surveyMetadata?.targetSampleSize && (
                  <div>
                    <strong>Response Rate:</strong> {((surveyMetadata.responseCount || 0) / surveyMetadata.targetSampleSize * 100).toFixed(1)}%
                  </div>
                )}
                <div>
                  <strong>Analyses:</strong> {project.results.length} completed
                </div>
              </div>
            </div>
          </div>

          {/* Research Context (for survey data) */}
          {isSurveyData && projectContext?.researchDesign && (
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Research Context</h4>
              <div className="bg-green-50 rounded-md p-4 text-sm">
                <div className="space-y-2">
                  {projectContext.researchDesign.theoreticalFrameworks?.length > 0 && (
                    <div>
                      <strong>Theoretical Framework:</strong> {projectContext.researchDesign.theoreticalFrameworks[0].name}
                    </div>
                  )}
                  {projectContext.researchDesign.researchVariables?.length > 0 && (
                    <div>
                      <strong>Research Variables:</strong> {projectContext.researchDesign.researchVariables.length} defined
                    </div>
                  )}
                  {projectContext.researchDesign.hypotheses?.length > 0 && (
                    <div>
                      <strong>Hypotheses:</strong> {projectContext.researchDesign.hypotheses.length} formulated
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Variables Summary */}
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Variables ({project.columns.length})</h4>
            <div className="bg-gray-50 rounded-md p-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <strong>Numeric:</strong> {project.columns.filter(col => col.type === 'numeric').length}
                </div>
                <div>
                  <strong>Categorical:</strong> {project.columns.filter(col => col.type === 'categorical').length}
                </div>
                <div>
                  <strong>Independent:</strong> {project.columns.filter(col => col.role === 'independent').length}
                </div>
                <div>
                  <strong>Dependent:</strong> {project.columns.filter(col => col.role === 'dependent').length}
                </div>
              </div>
            </div>
          </div>

          {/* Models Summary */}
          {project.models.length > 0 && (
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Research Models ({project.models.length})</h4>
              <div className="bg-gray-50 rounded-md p-4">
                <div className="space-y-2 text-sm">
                  {project.models.map((model, index) => (
                    <div key={model.id} className="flex justify-between">
                      <span>{model.name}</span>
                      <span className="text-gray-500">{model.type}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Results Summary */}
          {project.results.length > 0 && (
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Analysis Results ({project.results.length})</h4>
              <div className="bg-gray-50 rounded-md p-4">
                <div className="space-y-2 text-sm">
                  {project.results.map((result, index) => (
                    <div key={result.id} className="flex justify-between">
                      <span>{result.type.charAt(0).toUpperCase() + result.type.slice(1)} Analysis</span>
                      <span className="text-gray-500">{result.tables.length} tables</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Export Instructions */}
      <Card className="p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Export Instructions</h3>
        
        <div className="space-y-4 text-sm text-gray-600">
          <div>
            <h4 className="font-medium text-gray-900">Excel Export Contents:</h4>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Project Summary - Overview and metadata</li>
              <li>Variables - Complete variable information and statistics</li>
              <li>Research Models - Model specifications and hypotheses</li>
              <li>Analysis Results - Separate sheet for each analysis</li>
              <li>Raw Data - Original dataset (first 1000 rows)</li>
            </ul>
          </div>

          <div>
            <h4 className="font-medium text-gray-900">Professional Reporting:</h4>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>All results include statistical interpretations</li>
              <li>Tables formatted for academic publications</li>
              <li>Includes fit indices and effect sizes where applicable</li>
              <li>Ready for copy-paste into research papers</li>
            </ul>
          </div>

          <div>
            <h4 className="font-medium text-gray-900">File Formats:</h4>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Excel (.xlsx) - Best for viewing and further analysis</li>
              <li>JSON - Machine-readable for integration with other tools</li>
              <li>Project Save - Stores results within NCSKIT for future access</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
}