'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { 
  Settings, 
  Target, 
  Database, 
  BarChart3, 
  CheckCircle, 
  AlertTriangle, 
  Info,
  Plus,
  Minus,
  ArrowRight,
  Lightbulb,
  Zap
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface AdvancedConfigPanelProps {
  projectId: string;
  onConfigurationChange: (config: AnalysisConfiguration) => void;
}

interface AnalysisConfiguration {
  statisticalParameters: {
    significanceLevel: number;
    confidenceLevel: number;
    bootstrapSamples: number;
    missingDataHandling: 'listwise' | 'pairwise' | 'imputation';
    imputationMethod?: 'mean' | 'median' | 'mode' | 'regression' | 'multiple';
    assumptionTesting: {
      normality: boolean;
      homoscedasticity: boolean;
      independence: boolean;
      linearity: boolean;
    };
  };
  measurementModel: {
    constructs: Array<{
      id: string;
      name: string;
      description: string;
      items: Array<{
        id: string;
        name: string;
        type: 'observed' | 'latent';
        scale: 'nominal' | 'ordinal' | 'interval' | 'ratio';
      }>;
    }>;
    relationships: Array<{
      from: string;
      to: string;
      type: 'correlation' | 'regression' | 'mediation' | 'moderation';
    }>;
  };
  analysisMethod: {
    primary: string;
    alternatives: string[];
    automaticSelection: boolean;
    customParameters: Record<string, any>;
  };
  dataQuality: {
    outlierDetection: boolean;
    outlierMethod: 'zscore' | 'iqr' | 'mahalanobis';
    outlierThreshold: number;
    responseQualityChecks: boolean;
    minimumResponseTime: number;
    maximumResponseTime: number;
  };
}

const ANALYSIS_METHODS = [
  {
    id: 'descriptive',
    name: 'Descriptive Statistics',
    description: 'Basic statistical summaries and distributions',
    category: 'Exploratory',
    requirements: ['continuous_data'],
    assumptions: []
  },
  {
    id: 'reliability',
    name: 'Reliability Analysis',
    description: 'Cronbach\'s Alpha, Composite Reliability, AVE',
    category: 'Measurement',
    requirements: ['likert_scale', 'multiple_items'],
    assumptions: ['unidimensionality']
  },
  {
    id: 'efa',
    name: 'Exploratory Factor Analysis',
    description: 'Discover underlying factor structure',
    category: 'Measurement',
    requirements: ['continuous_data', 'sample_size_100'],
    assumptions: ['normality', 'linearity', 'factorability']
  },
  {
    id: 'cfa',
    name: 'Confirmatory Factor Analysis',
    description: 'Test hypothesized factor structure',
    category: 'Measurement',
    requirements: ['continuous_data', 'sample_size_200'],
    assumptions: ['normality', 'linearity', 'independence']
  },
  {
    id: 'sem',
    name: 'Structural Equation Modeling',
    description: 'Test complex theoretical models',
    category: 'Advanced',
    requirements: ['continuous_data', 'sample_size_300'],
    assumptions: ['normality', 'linearity', 'independence', 'model_identification']
  },
  {
    id: 'regression',
    name: 'Multiple Regression',
    description: 'Predict outcomes from multiple predictors',
    category: 'Predictive',
    requirements: ['continuous_outcome'],
    assumptions: ['normality', 'homoscedasticity', 'independence', 'linearity']
  },
  {
    id: 'mediation',
    name: 'Mediation Analysis',
    description: 'Test indirect effects through mediators',
    category: 'Advanced',
    requirements: ['continuous_data', 'sample_size_200'],
    assumptions: ['normality', 'linearity', 'no_confounders']
  },
  {
    id: 'moderation',
    name: 'Moderation Analysis',
    description: 'Test interaction effects',
    category: 'Advanced',
    requirements: ['continuous_data'],
    assumptions: ['normality', 'homoscedasticity', 'independence']
  }
];

export const AdvancedConfigPanel: React.FC<AdvancedConfigPanelProps> = ({
  projectId,
  onConfigurationChange
}) => {
  const [config, setConfig] = useState<AnalysisConfiguration>({
    statisticalParameters: {
      significanceLevel: 0.05,
      confidenceLevel: 0.95,
      bootstrapSamples: 1000,
      missingDataHandling: 'listwise',
      assumptionTesting: {
        normality: true,
        homoscedasticity: true,
        independence: true,
        linearity: true
      }
    },
    measurementModel: {
      constructs: [],
      relationships: []
    },
    analysisMethod: {
      primary: '',
      alternatives: [],
      automaticSelection: true,
      customParameters: {}
    },
    dataQuality: {
      outlierDetection: true,
      outlierMethod: 'zscore',
      outlierThreshold: 3.0,
      responseQualityChecks: true,
      minimumResponseTime: 30,
      maximumResponseTime: 3600
    }
  });

  const [recommendedMethods, setRecommendedMethods] = useState<string[]>([]);
  const [validationResults, setValidationResults] = useState<any>({});

  useEffect(() => {
    onConfigurationChange(config);
    updateRecommendations();
  }, [config]);

  const updateRecommendations = () => {
    // Simple recommendation logic based on data characteristics
    const recommendations = [];
    
    if (config.measurementModel.constructs.length > 0) {
      recommendations.push('reliability');
      if (config.measurementModel.constructs.length > 2) {
        recommendations.push('efa', 'cfa');
      }
    }
    
    if (config.measurementModel.relationships.length > 0) {
      recommendations.push('sem');
      const hasMediation = config.measurementModel.relationships.some(r => r.type === 'mediation');
      const hasModeration = config.measurementModel.relationships.some(r => r.type === 'moderation');
      
      if (hasMediation) recommendations.push('mediation');
      if (hasModeration) recommendations.push('moderation');
    }
    
    setRecommendedMethods(recommendations);
  };

  const handleParameterChange = (section: keyof AnalysisConfiguration, field: string, value: any) => {
    setConfig(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleNestedParameterChange = (section: keyof AnalysisConfiguration, subsection: string, field: string, value: any) => {
    setConfig(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [subsection]: {
          ...prev[section][subsection],
          [field]: value
        }
      }
    }));
  };

  const addConstruct = () => {
    const newConstruct = {
      id: `construct_${Date.now()}`,
      name: '',
      description: '',
      items: []
    };
    
    setConfig(prev => ({
      ...prev,
      measurementModel: {
        ...prev.measurementModel,
        constructs: [...prev.measurementModel.constructs, newConstruct]
      }
    }));
  };

  const removeConstruct = (constructId: string) => {
    setConfig(prev => ({
      ...prev,
      measurementModel: {
        ...prev.measurementModel,
        constructs: prev.measurementModel.constructs.filter(c => c.id !== constructId),
        relationships: prev.measurementModel.relationships.filter(
          r => r.from !== constructId && r.to !== constructId
        )
      }
    }));
  };

  const addItem = (constructId: string) => {
    const newItem = {
      id: `item_${Date.now()}`,
      name: '',
      type: 'observed' as const,
      scale: 'interval' as const
    };
    
    setConfig(prev => ({
      ...prev,
      measurementModel: {
        ...prev.measurementModel,
        constructs: prev.measurementModel.constructs.map(c =>
          c.id === constructId
            ? { ...c, items: [...c.items, newItem] }
            : c
        )
      }
    }));
  };

  const removeItem = (constructId: string, itemId: string) => {
    setConfig(prev => ({
      ...prev,
      measurementModel: {
        ...prev.measurementModel,
        constructs: prev.measurementModel.constructs.map(c =>
          c.id === constructId
            ? { ...c, items: c.items.filter(i => i.id !== itemId) }
            : c
        )
      }
    }));
  };

  const addRelationship = () => {
    if (config.measurementModel.constructs.length < 2) return;
    
    const newRelationship = {
      from: config.measurementModel.constructs[0].id,
      to: config.measurementModel.constructs[1].id,
      type: 'correlation' as const
    };
    
    setConfig(prev => ({
      ...prev,
      measurementModel: {
        ...prev.measurementModel,
        relationships: [...prev.measurementModel.relationships, newRelationship]
      }
    }));
  };

  const getMethodRecommendationLevel = (methodId: string) => {
    if (recommendedMethods.includes(methodId)) return 'high';
    
    const method = ANALYSIS_METHODS.find(m => m.id === methodId);
    if (!method) return 'low';
    
    // Check if requirements are met
    const hasRequiredData = true; // This would be determined by actual data analysis
    return hasRequiredData ? 'medium' : 'low';
  };

  const getRecommendationColor = (level: string) => {
    switch (level) {
      case 'high': return 'bg-green-100 text-green-800 border-green-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Settings className="h-6 w-6 text-blue-600" />
        <div>
          <h2 className="text-xl font-semibold">Advanced Analysis Configuration</h2>
          <p className="text-sm text-gray-600">
            Configure statistical parameters, measurement models, and analysis methods
          </p>
        </div>
      </div>

      <Tabs defaultValue="parameters" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="parameters">Statistical Parameters</TabsTrigger>
          <TabsTrigger value="measurement">Measurement Model</TabsTrigger>
          <TabsTrigger value="methods">Analysis Methods</TabsTrigger>
          <TabsTrigger value="quality">Data Quality</TabsTrigger>
        </TabsList>

        {/* Statistical Parameters Tab */}
        <TabsContent value="parameters" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Statistical Parameters
              </CardTitle>
              <CardDescription>
                Configure significance levels, confidence intervals, and assumption testing
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Basic Parameters */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="significance-level">Significance Level (α)</Label>
                  <Select 
                    value={config.statisticalParameters.significanceLevel.toString()}
                    onValueChange={(value) => handleParameterChange('statisticalParameters', 'significanceLevel', parseFloat(value))}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0.01">0.01 (Very Conservative)</SelectItem>
                      <SelectItem value="0.05">0.05 (Standard)</SelectItem>
                      <SelectItem value="0.10">0.10 (Liberal)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="confidence-level">Confidence Level</Label>
                  <Select 
                    value={config.statisticalParameters.confidenceLevel.toString()}
                    onValueChange={(value) => handleParameterChange('statisticalParameters', 'confidenceLevel', parseFloat(value))}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0.90">90%</SelectItem>
                      <SelectItem value="0.95">95%</SelectItem>
                      <SelectItem value="0.99">99%</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Bootstrap Samples */}
              <div>
                <Label htmlFor="bootstrap-samples">Bootstrap Samples: {config.statisticalParameters.bootstrapSamples}</Label>
                <Slider
                  value={[config.statisticalParameters.bootstrapSamples]}
                  onValueChange={(value) => handleParameterChange('statisticalParameters', 'bootstrapSamples', value[0])}
                  max={5000}
                  min={100}
                  step={100}
                  className="mt-2"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>100 (Fast)</span>
                  <span>5000 (Accurate)</span>
                </div>
              </div>

              {/* Missing Data Handling */}
              <div>
                <Label>Missing Data Handling</Label>
                <Select 
                  value={config.statisticalParameters.missingDataHandling}
                  onValueChange={(value) => handleParameterChange('statisticalParameters', 'missingDataHandling', value)}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="listwise">Listwise Deletion</SelectItem>
                    <SelectItem value="pairwise">Pairwise Deletion</SelectItem>
                    <SelectItem value="imputation">Multiple Imputation</SelectItem>
                  </SelectContent>
                </Select>
                
                {config.statisticalParameters.missingDataHandling === 'imputation' && (
                  <div className="mt-3">
                    <Label>Imputation Method</Label>
                    <Select 
                      value={config.statisticalParameters.imputationMethod || 'multiple'}
                      onValueChange={(value) => handleParameterChange('statisticalParameters', 'imputationMethod', value)}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mean">Mean Imputation</SelectItem>
                        <SelectItem value="median">Median Imputation</SelectItem>
                        <SelectItem value="mode">Mode Imputation</SelectItem>
                        <SelectItem value="regression">Regression Imputation</SelectItem>
                        <SelectItem value="multiple">Multiple Imputation (Recommended)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

              {/* Assumption Testing */}
              <div>
                <Label className="text-base font-medium">Assumption Testing</Label>
                <div className="grid grid-cols-2 gap-4 mt-3">
                  {Object.entries(config.statisticalParameters.assumptionTesting).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between">
                      <Label htmlFor={key} className="capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </Label>
                      <Switch
                        id={key}
                        checked={value}
                        onCheckedChange={(checked) => 
                          handleNestedParameterChange('statisticalParameters', 'assumptionTesting', key, checked)
                        }
                      />
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Measurement Model Tab */}
        <TabsContent value="measurement" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Measurement Model Builder
              </CardTitle>
              <CardDescription>
                Define constructs, items, and relationships for your theoretical model
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Constructs */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <Label className="text-base font-medium">Constructs</Label>
                  <Button onClick={addConstruct} size="sm" className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Add Construct
                  </Button>
                </div>
                
                {config.measurementModel.constructs.length === 0 ? (
                  <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                    <Database className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No constructs defined</h3>
                    <p className="text-gray-600 mb-4">Add constructs to build your measurement model</p>
                    <Button onClick={addConstruct}>Add First Construct</Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {config.measurementModel.constructs.map((construct, index) => (
                      <Card key={construct.id} className="border-l-4 border-l-blue-500">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1 space-y-3">
                              <Input
                                placeholder="Construct name"
                                value={construct.name}
                                onChange={(e) => {
                                  const updatedConstructs = [...config.measurementModel.constructs];
                                  updatedConstructs[index] = { ...construct, name: e.target.value };
                                  setConfig(prev => ({
                                    ...prev,
                                    measurementModel: {
                                      ...prev.measurementModel,
                                      constructs: updatedConstructs
                                    }
                                  }));
                                }}
                              />
                              <Textarea
                                placeholder="Construct description"
                                value={construct.description}
                                onChange={(e) => {
                                  const updatedConstructs = [...config.measurementModel.constructs];
                                  updatedConstructs[index] = { ...construct, description: e.target.value };
                                  setConfig(prev => ({
                                    ...prev,
                                    measurementModel: {
                                      ...prev.measurementModel,
                                      constructs: updatedConstructs
                                    }
                                  }));
                                }}
                                rows={2}
                              />
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeConstruct(construct.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                          </div>
                          
                          {/* Items */}
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <Label className="text-sm font-medium">Items</Label>
                              <Button
                                onClick={() => addItem(construct.id)}
                                size="sm"
                                variant="outline"
                                className="h-7 text-xs"
                              >
                                <Plus className="h-3 w-3 mr-1" />
                                Add Item
                              </Button>
                            </div>
                            
                            {construct.items.length === 0 ? (
                              <p className="text-sm text-gray-500 italic">No items added yet</p>
                            ) : (
                              <div className="space-y-2">
                                {construct.items.map((item, itemIndex) => (
                                  <div key={item.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                                    <Input
                                      placeholder="Item name"
                                      value={item.name}
                                      onChange={(e) => {
                                        const updatedConstructs = [...config.measurementModel.constructs];
                                        updatedConstructs[index].items[itemIndex] = { ...item, name: e.target.value };
                                        setConfig(prev => ({
                                          ...prev,
                                          measurementModel: {
                                            ...prev.measurementModel,
                                            constructs: updatedConstructs
                                          }
                                        }));
                                      }}
                                      className="flex-1"
                                    />
                                    <Select
                                      value={item.scale}
                                      onValueChange={(value) => {
                                        const updatedConstructs = [...config.measurementModel.constructs];
                                        updatedConstructs[index].items[itemIndex] = { ...item, scale: value as any };
                                        setConfig(prev => ({
                                          ...prev,
                                          measurementModel: {
                                            ...prev.measurementModel,
                                            constructs: updatedConstructs
                                          }
                                        }));
                                      }}
                                    >
                                      <SelectTrigger className="w-32">
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="nominal">Nominal</SelectItem>
                                        <SelectItem value="ordinal">Ordinal</SelectItem>
                                        <SelectItem value="interval">Interval</SelectItem>
                                        <SelectItem value="ratio">Ratio</SelectItem>
                                      </SelectContent>
                                    </Select>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => removeItem(construct.id, item.id)}
                                      className="text-red-600 hover:text-red-700"
                                    >
                                      <Minus className="h-3 w-3" />
                                    </Button>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>

              {/* Relationships */}
              {config.measurementModel.constructs.length >= 2 && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <Label className="text-base font-medium">Relationships</Label>
                    <Button onClick={addRelationship} size="sm" className="flex items-center gap-2">
                      <Plus className="h-4 w-4" />
                      Add Relationship
                    </Button>
                  </div>
                  
                  {config.measurementModel.relationships.length === 0 ? (
                    <div className="text-center py-6 border border-dashed border-gray-300 rounded-lg">
                      <ArrowRight className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">No relationships defined</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {config.measurementModel.relationships.map((relationship, index) => (
                        <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                          <Select
                            value={relationship.from}
                            onValueChange={(value) => {
                              const updatedRelationships = [...config.measurementModel.relationships];
                              updatedRelationships[index] = { ...relationship, from: value };
                              setConfig(prev => ({
                                ...prev,
                                measurementModel: {
                                  ...prev.measurementModel,
                                  relationships: updatedRelationships
                                }
                              }));
                            }}
                          >
                            <SelectTrigger className="flex-1">
                              <SelectValue placeholder="From construct" />
                            </SelectTrigger>
                            <SelectContent>
                              {config.measurementModel.constructs.map(construct => (
                                <SelectItem key={construct.id} value={construct.id}>
                                  {construct.name || 'Unnamed Construct'}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          
                          <ArrowRight className="h-4 w-4 text-gray-400" />
                          
                          <Select
                            value={relationship.to}
                            onValueChange={(value) => {
                              const updatedRelationships = [...config.measurementModel.relationships];
                              updatedRelationships[index] = { ...relationship, to: value };
                              setConfig(prev => ({
                                ...prev,
                                measurementModel: {
                                  ...prev.measurementModel,
                                  relationships: updatedRelationships
                                }
                              }));
                            }}
                          >
                            <SelectTrigger className="flex-1">
                              <SelectValue placeholder="To construct" />
                            </SelectTrigger>
                            <SelectContent>
                              {config.measurementModel.constructs.map(construct => (
                                <SelectItem key={construct.id} value={construct.id}>
                                  {construct.name || 'Unnamed Construct'}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          
                          <Select
                            value={relationship.type}
                            onValueChange={(value) => {
                              const updatedRelationships = [...config.measurementModel.relationships];
                              updatedRelationships[index] = { ...relationship, type: value as any };
                              setConfig(prev => ({
                                ...prev,
                                measurementModel: {
                                  ...prev.measurementModel,
                                  relationships: updatedRelationships
                                }
                              }));
                            }}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="correlation">Correlation</SelectItem>
                              <SelectItem value="regression">Regression</SelectItem>
                              <SelectItem value="mediation">Mediation</SelectItem>
                              <SelectItem value="moderation">Moderation</SelectItem>
                            </SelectContent>
                          </Select>
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              const updatedRelationships = config.measurementModel.relationships.filter((_, i) => i !== index);
                              setConfig(prev => ({
                                ...prev,
                                measurementModel: {
                                  ...prev.measurementModel,
                                  relationships: updatedRelationships
                                }
                              }));
                            }}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analysis Methods Tab */}
        <TabsContent value="methods" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Analysis Method Selection
              </CardTitle>
              <CardDescription>
                Choose analysis methods with automatic recommendations based on your data and model
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Automatic Selection Toggle */}
              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Zap className="h-5 w-5 text-blue-600" />
                  <div>
                    <Label className="font-medium">Automatic Method Selection</Label>
                    <p className="text-sm text-gray-600">Let the system recommend optimal analysis methods</p>
                  </div>
                </div>
                <Switch
                  checked={config.analysisMethod.automaticSelection}
                  onCheckedChange={(checked) => handleParameterChange('analysisMethod', 'automaticSelection', checked)}
                />
              </div>

              {/* Recommended Methods */}
              {recommendedMethods.length > 0 && (
                <Alert>
                  <Lightbulb className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Recommended methods based on your model:</strong> {recommendedMethods.join(', ')}
                  </AlertDescription>
                </Alert>
              )}

              {/* Method Selection Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {ANALYSIS_METHODS.map(method => {
                  const recommendationLevel = getMethodRecommendationLevel(method.id);
                  const isSelected = config.analysisMethod.primary === method.id;
                  
                  return (
                    <Card 
                      key={method.id}
                      className={`cursor-pointer transition-all ${
                        isSelected ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:shadow-md'
                      }`}
                      onClick={() => handleParameterChange('analysisMethod', 'primary', method.id)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-medium">{method.name}</h4>
                          <Badge className={getRecommendationColor(recommendationLevel)}>
                            {recommendationLevel === 'high' && <CheckCircle className="h-3 w-3 mr-1" />}
                            {recommendationLevel === 'medium' && <Info className="h-3 w-3 mr-1" />}
                            {recommendationLevel === 'low' && <AlertTriangle className="h-3 w-3 mr-1" />}
                            {recommendationLevel}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">{method.description}</p>
                        <div className="space-y-2">
                          <div>
                            <span className="text-xs font-medium text-gray-500">Category:</span>
                            <Badge variant="outline" className="ml-2 text-xs">{method.category}</Badge>
                          </div>
                          {method.assumptions.length > 0 && (
                            <div>
                              <span className="text-xs font-medium text-gray-500">Key Assumptions:</span>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {method.assumptions.slice(0, 2).map(assumption => (
                                  <Badge key={assumption} variant="secondary" className="text-xs">
                                    {assumption}
                                  </Badge>
                                ))}
                                {method.assumptions.length > 2 && (
                                  <Badge variant="secondary" className="text-xs">
                                    +{method.assumptions.length - 2} more
                                  </Badge>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Data Quality Tab */}
        <TabsContent value="quality" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                Data Quality Controls
              </CardTitle>
              <CardDescription>
                Configure outlier detection and response quality checks
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Outlier Detection */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <Label className="text-base font-medium">Outlier Detection</Label>
                  <Switch
                    checked={config.dataQuality.outlierDetection}
                    onCheckedChange={(checked) => handleParameterChange('dataQuality', 'outlierDetection', checked)}
                  />
                </div>
                
                {config.dataQuality.outlierDetection && (
                  <div className="space-y-4 pl-4 border-l-2 border-blue-200">
                    <div>
                      <Label>Detection Method</Label>
                      <Select 
                        value={config.dataQuality.outlierMethod}
                        onValueChange={(value) => handleParameterChange('dataQuality', 'outlierMethod', value)}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="zscore">Z-Score (Standard)</SelectItem>
                          <SelectItem value="iqr">Interquartile Range</SelectItem>
                          <SelectItem value="mahalanobis">Mahalanobis Distance</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label>Threshold: {config.dataQuality.outlierThreshold}</Label>
                      <Slider
                        value={[config.dataQuality.outlierThreshold]}
                        onValueChange={(value) => handleParameterChange('dataQuality', 'outlierThreshold', value[0])}
                        max={5}
                        min={1}
                        step={0.1}
                        className="mt-2"
                      />
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>1.0 (Strict)</span>
                        <span>5.0 (Lenient)</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Response Quality Checks */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <Label className="text-base font-medium">Response Quality Checks</Label>
                  <Switch
                    checked={config.dataQuality.responseQualityChecks}
                    onCheckedChange={(checked) => handleParameterChange('dataQuality', 'responseQualityChecks', checked)}
                  />
                </div>
                
                {config.dataQuality.responseQualityChecks && (
                  <div className="space-y-4 pl-4 border-l-2 border-green-200">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Minimum Response Time (seconds)</Label>
                        <Input
                          type="number"
                          value={config.dataQuality.minimumResponseTime}
                          onChange={(e) => handleParameterChange('dataQuality', 'minimumResponseTime', parseInt(e.target.value))}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label>Maximum Response Time (seconds)</Label>
                        <Input
                          type="number"
                          value={config.dataQuality.maximumResponseTime}
                          onChange={(e) => handleParameterChange('dataQuality', 'maximumResponseTime', parseInt(e.target.value))}
                          className="mt-1"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};