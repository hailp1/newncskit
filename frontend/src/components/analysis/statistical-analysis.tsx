'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { AnalysisProject, AnalysisResult } from '@/app/(dashboard)/analysis/page';
import { EnhancedProject } from '@/types/workflow';
import { rAnalysisService } from '@/services/r-analysis';

interface StatisticalAnalysisProps {
  project: AnalysisProject;
  onUpdate: (project: AnalysisProject) => void;
  projectContext?: EnhancedProject; // Add project context for survey data integration
  surveyMetadata?: {
    campaignId?: string;
    surveyId?: string;
    responseCount?: number;
    collectionPeriod?: { start: Date; end: Date };
    targetSampleSize?: number;
  };
}

export default function StatisticalAnalysis({ 
  project, 
  onUpdate, 
  projectContext, 
  surveyMetadata 
}: StatisticalAnalysisProps) {
  const [results, setResults] = useState<AnalysisResult[]>(project.results);
  const [isRunning, setIsRunning] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('descriptive');

  // Detect if this is survey data based on project context or metadata
  const isSurveyData = Boolean(
    projectContext?.dataCollection?.collectionMethod === 'internal_survey' ||
    surveyMetadata?.surveyId ||
    surveyMetadata?.campaignId
  );

  // Get survey-specific variable mappings if available
  const getSurveyVariableMapping = () => {
    if (!projectContext?.researchDesign) return null;
    
    const mapping: Record<string, { construct: string; variable: string; type: string }> = {};
    
    projectContext.researchDesign.researchVariables.forEach(variable => {
      variable.measurementItems.forEach(item => {
        // Try to match measurement items with column names
        const matchingColumn = project.columns.find(col => 
          col.name.toLowerCase().includes(item.toLowerCase()) ||
          col.name.toLowerCase().includes(variable.name.toLowerCase())
        );
        
        if (matchingColumn) {
          mapping[matchingColumn.name] = {
            construct: variable.construct,
            variable: variable.name,
            type: variable.type
          };
        }
      });
    });
    
    return Object.keys(mapping).length > 0 ? mapping : null;
  };

  const surveyVariableMapping = getSurveyVariableMapping();

  // Enhanced interpretation with project context
  const enhanceInterpretationWithContext = (baseInterpretation: string, analysisType: string): string => {
    let enhanced = baseInterpretation;

    if (isSurveyData) {
      const contextInfo = [];
      
      if (surveyMetadata?.responseCount) {
        contextInfo.push(`Survey Responses: ${surveyMetadata.responseCount}`);
      }
      
      if (surveyMetadata?.targetSampleSize) {
        const responseRate = ((surveyMetadata.responseCount || 0) / surveyMetadata.targetSampleSize * 100).toFixed(1);
        contextInfo.push(`Response Rate: ${responseRate}%`);
      }
      
      if (surveyMetadata?.collectionPeriod) {
        const start = new Date(surveyMetadata.collectionPeriod.start).toLocaleDateString();
        const end = new Date(surveyMetadata.collectionPeriod.end).toLocaleDateString();
        contextInfo.push(`Collection Period: ${start} - ${end}`);
      }

      if (projectContext?.researchDesign?.theoreticalFrameworks?.length) {
        const frameworks = projectContext.researchDesign.theoreticalFrameworks.map(f => f.name).join(', ');
        contextInfo.push(`Theoretical Framework(s): ${frameworks}`);
      }

      if (contextInfo.length > 0) {
        enhanced = `SURVEY DATA CONTEXT:\n${contextInfo.join('\n')}\n\nANALYSIS RESULTS:\n${enhanced}`;
      }

      // Add survey-specific interpretation notes
      if (analysisType === 'reliability' && surveyVariableMapping) {
        const constructs = Object.values(surveyVariableMapping).map(m => m.construct);
        const uniqueConstructs = [...new Set(constructs)];
        enhanced += `\n\nSURVEY SCALE ANALYSIS:\nThis analysis examined ${uniqueConstructs.length} theoretical construct(s): ${uniqueConstructs.join(', ')}. `;
        enhanced += `The reliability coefficients indicate the internal consistency of survey items measuring each construct.`;
      }
    } else {
      enhanced = `EXTERNAL DATA ANALYSIS:\nFile: ${project.name}\nRows: ${project.data.length - 1}\nColumns: ${project.columns.length}\n\n${enhanced}`;
    }

    return enhanced;
  };

  const runDescriptiveAnalysis = async () => {
    setIsRunning('descriptive');
    try {
      const numericVars = project.columns.filter(col => col.type === 'numeric').map(col => col.name);
      const categoricalVars = project.columns.filter(col => col.type === 'categorical').map(col => col.name);
      
      const analysisResults = await rAnalysisService.descriptiveAnalysis(project.data, {
        numeric: numericVars,
        categorical: categoricalVars
      });

      // Enhanced result with project context
      const result: AnalysisResult = {
        id: Date.now().toString(),
        modelId: 'descriptive',
        type: 'descriptive',
        data: {
          ...analysisResults,
          // Add survey-specific metadata
          surveyMetadata: isSurveyData ? {
            dataSource: 'survey_campaign',
            campaignId: surveyMetadata?.campaignId,
            surveyId: surveyMetadata?.surveyId,
            responseCount: surveyMetadata?.responseCount || project.data.length - 1,
            collectionPeriod: surveyMetadata?.collectionPeriod,
            targetSampleSize: surveyMetadata?.targetSampleSize,
            variableMapping: surveyVariableMapping
          } : {
            dataSource: 'external_file',
            fileName: project.name
          }
        },
        tables: [
          {
            title: isSurveyData ? 'Survey Response Statistics' : 'Descriptive Statistics',
            data: analysisResults.descriptive
          },
          {
            title: 'Correlation Matrix',
            data: analysisResults.correlation?.matrix
          }
        ],
        charts: [],
        interpretation: enhanceInterpretationWithContext(
          rAnalysisService.interpretResults('descriptive', analysisResults),
          'descriptive'
        )
      };

      const updatedResults = [...results, result];
      setResults(updatedResults);
      
      const updatedProject = { ...project, results: updatedResults };
      onUpdate(updatedProject);
    } catch (error) {
      console.error('Descriptive analysis failed:', error);
      alert('Analysis failed. Please check your data and try again.');
    } finally {
      setIsRunning(null);
    }
  };

  const runReliabilityAnalysis = async () => {
    setIsRunning('reliability');
    try {
      // Enhanced scale detection for survey data
      const scales: Record<string, string[]> = {};
      
      if (isSurveyData && surveyVariableMapping) {
        // Group by construct for survey data
        Object.entries(surveyVariableMapping).forEach(([columnName, mapping]) => {
          const column = project.columns.find(col => col.name === columnName);
          if (column && column.type === 'numeric') {
            if (!scales[mapping.construct]) {
              scales[mapping.construct] = [];
            }
            scales[mapping.construct].push(columnName);
          }
        });
      } else {
        // Fallback to manual grouping
        project.columns.forEach(col => {
          if (col.group && col.type === 'numeric') {
            if (!scales[col.group]) {
              scales[col.group] = [];
            }
            scales[col.group].push(col.name);
          }
        });
      }

      if (Object.keys(scales).length === 0) {
        const message = isSurveyData 
          ? 'No measurement scales detected. Survey variables may need to be properly mapped to constructs.'
          : 'No variable groups found. Please group your variables first.';
        alert(message);
        return;
      }

      const analysisResults = await rAnalysisService.reliabilityAnalysis(project.data, scales);

      const result: AnalysisResult = {
        id: Date.now().toString(),
        modelId: 'reliability',
        type: 'reliability',
        data: {
          ...analysisResults,
          surveyMetadata: isSurveyData ? {
            dataSource: 'survey_campaign',
            scaleMapping: surveyVariableMapping,
            detectedScales: Object.keys(scales)
          } : {
            dataSource: 'external_file'
          }
        },
        tables: [
          {
            title: isSurveyData ? 'Scale Reliability Analysis (Survey Data)' : 'Reliability Analysis (Cronbach\'s Alpha)',
            data: analysisResults
          }
        ],
        charts: [],
        interpretation: enhanceInterpretationWithContext(
          rAnalysisService.interpretResults('reliability', analysisResults),
          'reliability'
        )
      };

      const updatedResults = [...results, result];
      setResults(updatedResults);
      
      const updatedProject = { ...project, results: updatedResults };
      onUpdate(updatedProject);
    } catch (error) {
      console.error('Reliability analysis failed:', error);
      alert('Analysis failed. Please check your data and try again.');
    } finally {
      setIsRunning(null);
    }
  };

  const runModelAnalysis = async (modelId: string) => {
    const model = project.models.find(m => m.id === modelId);
    if (!model) return;

    setIsRunning(modelId);
    try {
      let analysisResults;
      let interpretation = '';

      switch (model.type) {
        case 'regression':
          if (model.variables.dependent.length !== 1) {
            alert('Regression requires exactly one dependent variable.');
            return;
          }
          
          analysisResults = await rAnalysisService.vifAnalysis(
            project.data,
            model.variables.dependent[0],
            model.variables.independent
          );
          interpretation = rAnalysisService.interpretResults('vif', analysisResults);
          break;

        case 'anova':
          if (model.variables.dependent.length !== 1) {
            alert('ANOVA requires exactly one dependent variable.');
            return;
          }
          
          analysisResults = await rAnalysisService.anovaAnalysis(
            project.data,
            model.variables.dependent[0],
            model.variables.independent
          );
          interpretation = rAnalysisService.interpretResults('anova', analysisResults);
          break;

        case 'ttest':
          if (model.variables.dependent.length !== 1 || model.variables.independent.length !== 1) {
            alert('T-test requires exactly one dependent and one independent variable.');
            return;
          }
          
          analysisResults = await rAnalysisService.ttestAnalysis(
            project.data,
            model.variables.dependent[0],
            model.variables.independent[0]
          );
          interpretation = rAnalysisService.interpretResults('ttest', analysisResults);
          break;

        default:
          alert(`Analysis type ${model.type} is not yet implemented.`);
          return;
      }

      const result: AnalysisResult = {
        id: Date.now().toString(),
        modelId: model.id,
        type: model.type,
        data: {
          ...analysisResults,
          surveyMetadata: isSurveyData ? {
            dataSource: 'survey_campaign',
            modelContext: {
              theoreticalModel: model.name,
              hypotheses: model.hypotheses,
              variableMapping: surveyVariableMapping
            }
          } : {
            dataSource: 'external_file'
          }
        },
        tables: [
          {
            title: `${model.name} - ${model.type.toUpperCase()} Results${isSurveyData ? ' (Survey Data)' : ''}`,
            data: analysisResults
          }
        ],
        charts: [],
        interpretation: enhanceInterpretationWithContext(interpretation, model.type)
      };

      const updatedResults = [...results, result];
      setResults(updatedResults);
      
      const updatedProject = { ...project, results: updatedResults };
      onUpdate(updatedProject);
    } catch (error) {
      console.error(`${model.type} analysis failed:`, error);
      alert('Analysis failed. Please check your data and model specification.');
    } finally {
      setIsRunning(null);
    }
  };

  const clearResults = () => {
    setResults([]);
    const updatedProject = { ...project, results: [] };
    onUpdate(updatedProject);
  };

  return (
    <div className="space-y-6">
      {/* Project Context Information */}
      {(projectContext || surveyMetadata) && (
        <Card className="p-4 bg-blue-50 border-blue-200">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              {isSurveyData ? (
                <svg className="h-5 w-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              ) : (
                <svg className="h-5 w-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              )}
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-medium text-blue-900">
                {isSurveyData ? 'Survey Data Analysis' : 'External Data Analysis'}
              </h4>
              <div className="mt-1 text-sm text-blue-700">
                {isSurveyData ? (
                  <div className="space-y-1">
                    {projectContext?.title && (
                      <p><strong>Project:</strong> {projectContext.title}</p>
                    )}
                    {surveyMetadata?.responseCount && (
                      <p><strong>Responses:</strong> {surveyMetadata.responseCount}</p>
                    )}
                    {surveyMetadata?.targetSampleSize && (
                      <p><strong>Target Sample:</strong> {surveyMetadata.targetSampleSize}</p>
                    )}
                    {projectContext?.researchDesign?.theoreticalFrameworks?.length && (
                      <p><strong>Framework:</strong> {projectContext.researchDesign.theoreticalFrameworks[0].name}</p>
                    )}
                  </div>
                ) : (
                  <p>Analyzing external data file: {project.name}</p>
                )}
              </div>
              {surveyVariableMapping && (
                <div className="mt-2">
                  <Badge variant="outline" className="text-xs">
                    {Object.keys(surveyVariableMapping).length} variables mapped to constructs
                  </Badge>
                </div>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* Analysis Controls */}
      <Card className="p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Statistical Analysis</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <Button
            onClick={runDescriptiveAnalysis}
            disabled={isRunning === 'descriptive'}
            className="w-full"
          >
            {isRunning === 'descriptive' ? 'Running...' : 'Descriptive Statistics'}
          </Button>
          
          <Button
            onClick={runReliabilityAnalysis}
            disabled={isRunning === 'reliability'}
            variant="outline"
            className="w-full"
          >
            {isRunning === 'reliability' ? 'Running...' : 'Reliability Analysis'}
          </Button>
          
          <Button
            onClick={clearResults}
            variant="outline"
            className="w-full text-red-600 hover:text-red-700"
          >
            Clear Results
          </Button>
        </div>

        {/* Model Analysis Buttons */}
        {project.models.length > 0 && (
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Research Models:</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              {project.models.map(model => (
                <Button
                  key={model.id}
                  onClick={() => runModelAnalysis(model.id)}
                  disabled={isRunning === model.id}
                  variant="outline"
                  className="w-full"
                >
                  {isRunning === model.id ? 'Running...' : `${model.name} (${model.type})`}
                </Button>
              ))}
            </div>
          </div>
        )}
      </Card>

      {/* Results Display */}
      {results.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Analysis Results</h3>
          
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              {results.map(result => (
                <TabsTrigger key={result.id} value={result.id}>
                  {result.type.charAt(0).toUpperCase() + result.type.slice(1)}
                </TabsTrigger>
              ))}
            </TabsList>

            {results.map(result => (
              <TabsContent key={result.id} value={result.id}>
                <div className="space-y-4">
                  {/* Data Source Information */}
                  {result.data.surveyMetadata && (
                    <div className="p-3 bg-gray-50 border border-gray-200 rounded-md mb-4">
                      <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                        <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Data Source
                      </h4>
                      <div className="text-sm text-gray-700">
                        {result.data.surveyMetadata.dataSource === 'survey_campaign' ? (
                          <div className="space-y-1">
                            <Badge className="bg-green-100 text-green-800">Survey Campaign Data</Badge>
                            {result.data.surveyMetadata.responseCount && (
                              <p>Responses analyzed: {result.data.surveyMetadata.responseCount}</p>
                            )}
                            {result.data.surveyMetadata.detectedScales && (
                              <p>Measurement scales: {result.data.surveyMetadata.detectedScales.join(', ')}</p>
                            )}
                          </div>
                        ) : (
                          <div>
                            <Badge className="bg-blue-100 text-blue-800">External File</Badge>
                            <p>File: {result.data.surveyMetadata.fileName}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Interpretation */}
                  {result.interpretation && (
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
                      <h4 className="font-medium text-blue-900 mb-2">Interpretation:</h4>
                      <pre className="text-sm text-blue-800 whitespace-pre-wrap">
                        {result.interpretation}
                      </pre>
                    </div>
                  )}

                  {/* Tables */}
                  {result.tables.map((table, index) => (
                    <div key={index}>
                      <h4 className="font-medium text-gray-900 mb-2">{table.title}</h4>
                      
                      {/* Display table data based on type */}
                      {result.type === 'descriptive' && table.data && (
                        <div className="overflow-x-auto">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Variable</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">N</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mean</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">SD</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Min</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Max</th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {Object.entries(table.data).map(([variable, stats]: [string, any]) => (
                                <tr key={variable}>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    {variable}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {stats.n || 'N/A'}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {stats.mean?.toFixed(3) || 'N/A'}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {stats.sd?.toFixed(3) || 'N/A'}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {stats.min?.toFixed(3) || 'N/A'}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {stats.max?.toFixed(3) || 'N/A'}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}

                      {/* Reliability Results */}
                      {result.type === 'reliability' && (
                        <div className="space-y-4">
                          {Object.entries(result.data).map(([scale, data]: [string, any]) => (
                            <div key={scale} className="border rounded-lg p-4">
                              <h5 className="font-medium text-gray-900 mb-2">{scale}</h5>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                <div>
                                  <span className="font-medium">Cronbach's α:</span>
                                  <div className={`text-lg font-bold ${
                                    data.cronbach_alpha >= 0.9 ? 'text-green-600' :
                                    data.cronbach_alpha >= 0.8 ? 'text-blue-600' :
                                    data.cronbach_alpha >= 0.7 ? 'text-yellow-600' :
                                    'text-red-600'
                                  }`}>
                                    {data.cronbach_alpha?.toFixed(3)}
                                  </div>
                                </div>
                                <div>
                                  <span className="font-medium">Items:</span>
                                  <div className="text-lg font-bold text-gray-900">
                                    {data.n_items}
                                  </div>
                                </div>
                                <div>
                                  <span className="font-medium">Cases:</span>
                                  <div className="text-lg font-bold text-gray-900">
                                    {data.n_cases}
                                  </div>
                                </div>
                                <div>
                                  <span className="font-medium">Std. α:</span>
                                  <div className="text-lg font-bold text-gray-600">
                                    {data.standardized_alpha?.toFixed(3)}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Generic JSON display for other result types */}
                      {!['descriptive', 'reliability'].includes(result.type) && (
                        <div className="bg-gray-50 rounded-md p-4">
                          <pre className="text-sm text-gray-700 whitespace-pre-wrap overflow-x-auto">
                            {JSON.stringify(table.data, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </Card>
      )}

      {/* Analysis Summary */}
      {results.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Analysis Summary</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{results.length}</div>
              <div className="text-sm text-gray-500">Analyses Completed</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {results.reduce((sum, result) => sum + result.tables.length, 0)}
              </div>
              <div className="text-sm text-gray-500">Result Tables</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {[...new Set(results.map(result => result.type))].length}
              </div>
              <div className="text-sm text-gray-500">Analysis Types</div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}