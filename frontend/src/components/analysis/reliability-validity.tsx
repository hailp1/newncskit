'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCircle, XCircle, AlertTriangle, BarChart3, Target, Shield } from 'lucide-react';

interface ReliabilityValidityProps {
  project: any;
  onUpdate: (project: any) => void;
  onNext: () => void;
  onPrevious: () => void;
}

interface ReliabilityTest {
  construct: string;
  items: string[];
  cronbachAlpha: number;
  compositeReliability: number;
  averageVarianceExtracted: number;
  status: 'excellent' | 'good' | 'acceptable' | 'poor';
  itemLoadings: Array<{
    item: string;
    loading: number;
    tValue: number;
    pValue: number;
  }>;
}

interface ValidityTest {
  type: 'convergent' | 'discriminant' | 'nomological';
  constructs: string[];
  results: any;
  status: 'passed' | 'failed' | 'marginal';
}

export default function ReliabilityValidity({ project, onUpdate, onNext, onPrevious }: ReliabilityValidityProps) {
  const [reliabilityTests, setReliabilityTests] = useState<ReliabilityTest[]>([]);
  const [validityTests, setValidityTests] = useState<ValidityTest[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedConstruct, setSelectedConstruct] = useState<string>('');

  useEffect(() => {
    if (project?.researchDesign?.model?.constructs) {
      runReliabilityAnalysis();
    }
  }, [project]);

  const runReliabilityAnalysis = async () => {
    setIsAnalyzing(true);
    
    // Simulate reliability analysis
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const constructs = project.researchDesign.model.constructs;
    const mockReliabilityTests: ReliabilityTest[] = constructs.map((construct: string, index: number) => {
      const cronbach = 0.7 + Math.random() * 0.25; // 0.7 - 0.95
      const cr = cronbach + 0.05 + Math.random() * 0.1; // Slightly higher than Cronbach's
      const ave = 0.5 + Math.random() * 0.3; // 0.5 - 0.8
      
      return {
        construct,
        items: [`${construct}_1`, `${construct}_2`, `${construct}_3`, `${construct}_4`],
        cronbachAlpha: cronbach,
        compositeReliability: cr,
        averageVarianceExtracted: ave,
        status: cronbach >= 0.9 ? 'excellent' : 
                cronbach >= 0.8 ? 'good' : 
                cronbach >= 0.7 ? 'acceptable' : 'poor',
        itemLoadings: [
          { item: `${construct}_1`, loading: 0.7 + Math.random() * 0.25, tValue: 8 + Math.random() * 5, pValue: 0.001 },
          { item: `${construct}_2`, loading: 0.7 + Math.random() * 0.25, tValue: 8 + Math.random() * 5, pValue: 0.001 },
          { item: `${construct}_3`, loading: 0.7 + Math.random() * 0.25, tValue: 8 + Math.random() * 5, pValue: 0.001 },
          { item: `${construct}_4`, loading: 0.7 + Math.random() * 0.25, tValue: 8 + Math.random() * 5, pValue: 0.001 }
        ]
      };
    });

    setReliabilityTests(mockReliabilityTests);

    // Mock validity tests
    const mockValidityTests: ValidityTest[] = [
      {
        type: 'convergent',
        constructs: constructs,
        results: {
          averageVarianceExtracted: mockReliabilityTests.map(t => ({ construct: t.construct, ave: t.averageVarianceExtracted })),
          threshold: 0.5
        },
        status: mockReliabilityTests.every(t => t.averageVarianceExtracted >= 0.5) ? 'passed' : 'failed'
      },
      {
        type: 'discriminant',
        constructs: constructs,
        results: {
          fornellLarcker: generateFornellLarckerMatrix(constructs, mockReliabilityTests),
          htmt: generateHTMTMatrix(constructs)
        },
        status: 'passed'
      }
    ];

    setValidityTests(mockValidityTests);
    setIsAnalyzing(false);
  };

  const generateFornellLarckerMatrix = (constructs: string[], reliabilityTests: ReliabilityTest[]) => {
    const matrix: any = {};
    constructs.forEach((construct1, i) => {
      matrix[construct1] = {};
      constructs.forEach((construct2, j) => {
        if (i === j) {
          // Diagonal: square root of AVE
          const test = reliabilityTests.find(t => t.construct === construct1);
          matrix[construct1][construct2] = Math.sqrt(test?.averageVarianceExtracted || 0.6);
        } else if (i > j) {
          // Lower triangle: correlations
          matrix[construct1][construct2] = 0.3 + Math.random() * 0.4; // 0.3 - 0.7
        }
      });
    });
    return matrix;
  };

  const generateHTMTMatrix = (constructs: string[]) => {
    const matrix: any = {};
    constructs.forEach((construct1, i) => {
      matrix[construct1] = {};
      constructs.forEach((construct2, j) => {
        if (i !== j && i > j) {
          matrix[construct1][construct2] = 0.2 + Math.random() * 0.6; // 0.2 - 0.8
        }
      });
    });
    return matrix;
  };

  const getReliabilityColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'text-green-600 bg-green-50 border-green-200';
      case 'good': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'acceptable': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'poor': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getValidityIcon = (status: string) => {
    switch (status) {
      case 'passed': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'failed': return <XCircle className="h-4 w-4 text-red-600" />;
      case 'marginal': return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      default: return <AlertTriangle className="h-4 w-4 text-gray-600" />;
    }
  };

  const saveResults = () => {
    const updatedProject = {
      ...project,
      reliabilityValidity: {
        reliability: reliabilityTests,
        validity: validityTests,
        completedAt: new Date().toISOString()
      }
    };
    onUpdate(updatedProject);
    onNext();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="h-5 w-5 mr-2" />
            Reliability & Validity Assessment
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            Assess the reliability and validity of your measurement model before hypothesis testing.
            This step is crucial for ensuring the quality of your research findings.
          </p>
        </CardContent>
      </Card>

      {isAnalyzing ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <h3 className="text-lg font-medium mb-2">Running Reliability & Validity Tests</h3>
              <p className="text-gray-600">This may take a few moments...</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue="reliability" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="reliability">Reliability Analysis</TabsTrigger>
            <TabsTrigger value="validity">Validity Assessment</TabsTrigger>
          </TabsList>

          <TabsContent value="reliability" className="space-y-6">
            {/* Reliability Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2" />
                  Reliability Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 gap-4 mb-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {reliabilityTests.filter(t => t.status === 'excellent' || t.status === 'good').length}
                    </div>
                    <div className="text-sm text-gray-600">Reliable Constructs</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {(reliabilityTests.reduce((sum, t) => sum + t.cronbachAlpha, 0) / reliabilityTests.length).toFixed(3)}
                    </div>
                    <div className="text-sm text-gray-600">Avg. Cronbach's α</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {(reliabilityTests.reduce((sum, t) => sum + t.compositeReliability, 0) / reliabilityTests.length).toFixed(3)}
                    </div>
                    <div className="text-sm text-gray-600">Avg. Composite Reliability</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">
                      {(reliabilityTests.reduce((sum, t) => sum + t.averageVarianceExtracted, 0) / reliabilityTests.length).toFixed(3)}
                    </div>
                    <div className="text-sm text-gray-600">Avg. AVE</div>
                  </div>
                </div>

                {/* Detailed Results */}
                <div className="space-y-4">
                  {reliabilityTests.map((test, index) => (
                    <div key={index} className={`p-4 rounded-lg border ${getReliabilityColor(test.status)}`}>
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium text-lg">{test.construct}</h4>
                        <Badge variant={test.status === 'excellent' || test.status === 'good' ? 'default' : 'destructive'}>
                          {test.status}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-3 gap-4 mb-4">
                        <div>
                          <div className="text-sm text-gray-600">Cronbach's Alpha</div>
                          <div className="text-lg font-medium">{test.cronbachAlpha.toFixed(3)}</div>
                          <Progress value={test.cronbachAlpha * 100} className="mt-1" />
                        </div>
                        <div>
                          <div className="text-sm text-gray-600">Composite Reliability</div>
                          <div className="text-lg font-medium">{test.compositeReliability.toFixed(3)}</div>
                          <Progress value={test.compositeReliability * 100} className="mt-1" />
                        </div>
                        <div>
                          <div className="text-sm text-gray-600">AVE</div>
                          <div className="text-lg font-medium">{test.averageVarianceExtracted.toFixed(3)}</div>
                          <Progress value={test.averageVarianceExtracted * 100} className="mt-1" />
                        </div>
                      </div>

                      {/* Item Loadings */}
                      <div>
                        <h5 className="font-medium mb-2">Item Loadings</h5>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          {test.itemLoadings.map((item, itemIndex) => (
                            <div key={itemIndex} className="flex justify-between items-center p-2 bg-white rounded">
                              <span>{item.item}</span>
                              <div className="text-right">
                                <div className="font-medium">{item.loading.toFixed(3)}</div>
                                <div className="text-xs text-gray-500">t = {item.tValue.toFixed(2)}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="validity" className="space-y-6">
            {/* Validity Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Target className="h-5 w-5 mr-2" />
                  Validity Assessment
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {validityTests.map((test, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-medium text-lg capitalize">{test.type} Validity</h4>
                        <div className="flex items-center space-x-2">
                          {getValidityIcon(test.status)}
                          <Badge variant={test.status === 'passed' ? 'default' : 'destructive'}>
                            {test.status}
                          </Badge>
                        </div>
                      </div>

                      {test.type === 'convergent' && (
                        <div>
                          <p className="text-sm text-gray-600 mb-3">
                            Convergent validity is established when AVE ≥ 0.5 for all constructs.
                          </p>
                          <div className="grid grid-cols-2 gap-4">
                            {test.results.averageVarianceExtracted.map((item: any, itemIndex: number) => (
                              <div key={itemIndex} className="flex justify-between items-center p-2 border rounded">
                                <span className="font-medium">{item.construct}</span>
                                <div className="flex items-center space-x-2">
                                  <span className={item.ave >= 0.5 ? 'text-green-600' : 'text-red-600'}>
                                    {item.ave.toFixed(3)}
                                  </span>
                                  {item.ave >= 0.5 ? 
                                    <CheckCircle className="h-4 w-4 text-green-600" /> : 
                                    <XCircle className="h-4 w-4 text-red-600" />
                                  }
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {test.type === 'discriminant' && (
                        <div className="space-y-4">
                          <div>
                            <h5 className="font-medium mb-2">Fornell-Larcker Criterion</h5>
                            <p className="text-sm text-gray-600 mb-3">
                              Square root of AVE (diagonal) should be greater than correlations (off-diagonal).
                            </p>
                            <div className="overflow-x-auto">
                              <table className="w-full text-sm border">
                                <thead>
                                  <tr className="bg-gray-50">
                                    <th className="p-2 border text-left">Construct</th>
                                    {test.constructs.map((construct: string) => (
                                      <th key={construct} className="p-2 border text-center">{construct}</th>
                                    ))}
                                  </tr>
                                </thead>
                                <tbody>
                                  {test.constructs.map((construct1: string) => (
                                    <tr key={construct1}>
                                      <td className="p-2 border font-medium">{construct1}</td>
                                      {test.constructs.map((construct2: string) => (
                                        <td key={construct2} className="p-2 border text-center">
                                          {test.results.fornellLarcker[construct1]?.[construct2]?.toFixed(3) || '-'}
                                        </td>
                                      ))}
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>

                          <div>
                            <h5 className="font-medium mb-2">HTMT Ratio</h5>
                            <p className="text-sm text-gray-600 mb-3">
                              HTMT values should be below 0.85 (conservative) or 0.90 (liberal).
                            </p>
                            <div className="overflow-x-auto">
                              <table className="w-full text-sm border">
                                <thead>
                                  <tr className="bg-gray-50">
                                    <th className="p-2 border text-left">Construct</th>
                                    {test.constructs.map((construct: string) => (
                                      <th key={construct} className="p-2 border text-center">{construct}</th>
                                    ))}
                                  </tr>
                                </thead>
                                <tbody>
                                  {test.constructs.map((construct1: string) => (
                                    <tr key={construct1}>
                                      <td className="p-2 border font-medium">{construct1}</td>
                                      {test.constructs.map((construct2: string) => (
                                        <td key={construct2} className="p-2 border text-center">
                                          {test.results.htmt[construct1]?.[construct2] ? (
                                            <span className={test.results.htmt[construct1][construct2] > 0.85 ? 'text-red-600' : 'text-green-600'}>
                                              {test.results.htmt[construct1][construct2].toFixed(3)}
                                            </span>
                                          ) : '-'}
                                        </td>
                                      ))}
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}

      {/* Navigation */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={onPrevious}>
          Previous: Descriptive Analysis
        </Button>
        <Button 
          onClick={saveResults}
          disabled={isAnalyzing || reliabilityTests.length === 0}
        >
          Continue to Hypothesis Testing
        </Button>
      </div>
    </div>
  );
}