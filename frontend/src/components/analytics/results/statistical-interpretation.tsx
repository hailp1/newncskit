'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  Info, 
  BookOpen, 
  Target,
  Lightbulb,
  FileText,
  BarChart3
} from 'lucide-react';

interface StatisticalInterpretationProps {
  result: {
    id: string;
    analysisType: string;
    analysisName: string;
    statisticalOutput: any;
    fitIndices: any;
    parameterEstimates: any;
    statisticalInterpretation: string;
    practicalSignificance: string;
    limitations: string;
    validation?: {
      overall: 'valid' | 'warning' | 'invalid';
      details: any;
    };
  };
}

interface EffectSize {
  measure: string;
  value: number;
  interpretation: string;
  magnitude: 'negligible' | 'small' | 'medium' | 'large';
}

interface StatisticalTest {
  name: string;
  statistic: number;
  pValue: number;
  significance: boolean;
  interpretation: string;
}

export const StatisticalInterpretation: React.FC<StatisticalInterpretationProps> = ({
  result
}) => {
  const [activeSection, setActiveSection] = useState('overview');

  // Mock data - in real implementation, this would be parsed from result.statisticalOutput
  const effectSizes: EffectSize[] = [
    {
      measure: "Cohen's d",
      value: 0.65,
      interpretation: "Medium effect size indicating a meaningful difference",
      magnitude: 'medium'
    },
    {
      measure: "Eta squared (η²)",
      value: 0.14,
      interpretation: "14% of variance explained by the factor",
      magnitude: 'medium'
    }
  ];

  const statisticalTests: StatisticalTest[] = [
    {
      name: "Cronbach's Alpha",
      statistic: 0.89,
      pValue: 0.001,
      significance: true,
      interpretation: "Excellent internal consistency reliability"
    },
    {
      name: "Kaiser-Meyer-Olkin (KMO)",
      statistic: 0.87,
      pValue: 0.000,
      significance: true,
      interpretation: "Sampling adequacy is meritorious for factor analysis"
    }
  ];

  const assumptions = [
    {
      name: "Normality",
      status: "met",
      test: "Shapiro-Wilk",
      pValue: 0.12,
      interpretation: "Data follows normal distribution (p > 0.05)"
    },
    {
      name: "Homoscedasticity",
      status: "warning",
      test: "Levene's Test",
      pValue: 0.03,
      interpretation: "Some evidence of unequal variances (p < 0.05)"
    },
    {
      name: "Independence",
      status: "met",
      test: "Durbin-Watson",
      pValue: 1.98,
      interpretation: "No evidence of autocorrelation"
    }
  ];

  const getEffectSizeColor = (magnitude: string) => {
    switch (magnitude) {
      case 'large': return 'bg-green-100 text-green-800 border-green-200';
      case 'medium': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'small': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'negligible': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getAssumptionIcon = (status: string) => {
    switch (status) {
      case 'met': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'violated': return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default: return <Info className="h-4 w-4 text-gray-600" />;
    }
  };

  const getAssumptionColor = (status: string) => {
    switch (status) {
      case 'met': return 'bg-green-100 text-green-800 border-green-200';
      case 'warning': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'violated': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-blue-600" />
                Statistical Interpretation
              </CardTitle>
              <CardDescription>
                Comprehensive analysis of {result.analysisName} results
              </CardDescription>
            </div>
            {result.validation && (
              <Badge className={
                result.validation.overall === 'valid' ? 'bg-green-100 text-green-800' :
                result.validation.overall === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }>
                {result.validation.overall === 'valid' && <CheckCircle className="h-3 w-3 mr-1" />}
                {result.validation.overall === 'warning' && <AlertTriangle className="h-3 w-3 mr-1" />}
                {result.validation.overall === 'invalid' && <AlertTriangle className="h-3 w-3 mr-1" />}
                {result.validation.overall}
              </Badge>
            )}
          </div>
        </CardHeader>
      </Card>

      <Tabs value={activeSection} onValueChange={setActiveSection} className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="statistics">Statistics</TabsTrigger>
          <TabsTrigger value="effects">Effect Sizes</TabsTrigger>
          <TabsTrigger value="assumptions">Assumptions</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                Statistical Interpretation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="prose max-w-none">
                <p className="text-gray-700 leading-relaxed">
                  {result.statisticalInterpretation || 
                    "The analysis reveals significant relationships between the measured constructs. The reliability analysis shows excellent internal consistency (α = 0.89), indicating that the scale items are measuring the same underlying construct consistently."
                  }
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Target className="h-4 w-4" />
                Practical Significance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose max-w-none">
                <p className="text-gray-700 leading-relaxed">
                  {result.practicalSignificance || 
                    "The observed effects are not only statistically significant but also practically meaningful. The medium to large effect sizes suggest that the findings have real-world implications for theory and practice."
                  }
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Limitations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose max-w-none">
                <p className="text-gray-700 leading-relaxed">
                  {result.limitations || 
                    "While the results are robust, several limitations should be considered: (1) Cross-sectional design limits causal inferences, (2) Self-report measures may introduce common method bias, (3) Sample characteristics may limit generalizability."
                  }
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Statistics Tab */}
        <TabsContent value="statistics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Statistical Tests</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {statisticalTests.map((test, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{test.name}</h4>
                      <Badge className={test.significance ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                        {test.significance ? 'Significant' : 'Not Significant'}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Statistic:</span>
                        <span className="ml-2 font-mono">{test.statistic.toFixed(3)}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">p-value:</span>
                        <span className="ml-2 font-mono">{test.pValue.toFixed(3)}</span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-700 mt-2">{test.interpretation}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Effect Sizes Tab */}
        <TabsContent value="effects" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Effect Size Analysis</CardTitle>
              <CardDescription>
                Measures of practical significance and magnitude of effects
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {effectSizes.map((effect, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{effect.measure}</h4>
                      <Badge className={getEffectSizeColor(effect.magnitude)}>
                        {effect.magnitude}
                      </Badge>
                    </div>
                    <div className="text-2xl font-bold text-gray-900 mb-2">
                      {effect.value.toFixed(3)}
                    </div>
                    <p className="text-sm text-gray-700">{effect.interpretation}</p>
                  </div>
                ))}
              </div>

              {/* Effect Size Guidelines */}
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Effect Size Guidelines</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <strong>Cohen's d:</strong>
                    <ul className="mt-1 space-y-1 text-blue-800">
                      <li>• Small: 0.2</li>
                      <li>• Medium: 0.5</li>
                      <li>• Large: 0.8</li>
                    </ul>
                  </div>
                  <div>
                    <strong>Eta squared (η²):</strong>
                    <ul className="mt-1 space-y-1 text-blue-800">
                      <li>• Small: 0.01</li>
                      <li>• Medium: 0.06</li>
                      <li>• Large: 0.14</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Assumptions Tab */}
        <TabsContent value="assumptions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Statistical Assumptions</CardTitle>
              <CardDescription>
                Validation of assumptions required for {result.analysisType}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {assumptions.map((assumption, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {getAssumptionIcon(assumption.status)}
                        <h4 className="font-medium">{assumption.name}</h4>
                      </div>
                      <Badge className={getAssumptionColor(assumption.status)}>
                        {assumption.status}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm mb-2">
                      <div>
                        <span className="text-gray-600">Test:</span>
                        <span className="ml-2">{assumption.test}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Value:</span>
                        <span className="ml-2 font-mono">{assumption.pValue}</span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-700">{assumption.interpretation}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Recommendations Tab */}
        <TabsContent value="recommendations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Lightbulb className="h-4 w-4" />
                Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <h4 className="font-medium text-green-900 mb-2">✓ Strengths</h4>
                  <ul className="text-sm text-green-800 space-y-1">
                    <li>• Excellent reliability (α = 0.89)</li>
                    <li>• Adequate sample size for analysis</li>
                    <li>• Most assumptions are satisfied</li>
                  </ul>
                </div>

                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <h4 className="font-medium text-yellow-900 mb-2">⚠ Areas for Improvement</h4>
                  <ul className="text-sm text-yellow-800 space-y-1">
                    <li>• Consider addressing homoscedasticity violation</li>
                    <li>• Validate findings with confirmatory analysis</li>
                    <li>• Consider additional control variables</li>
                  </ul>
                </div>

                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">📋 Next Steps</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Conduct confirmatory factor analysis</li>
                    <li>• Test structural equation model</li>
                    <li>• Examine mediation/moderation effects</li>
                    <li>• Replicate with independent sample</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Reporting Guidelines
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose max-w-none text-sm">
                <p className="text-gray-700 mb-4">
                  When reporting these results, ensure to include:
                </p>
                <ul className="text-gray-700 space-y-2">
                  <li>• Descriptive statistics (M, SD, range)</li>
                  <li>• Reliability coefficients (α, CR, AVE)</li>
                  <li>• Test statistics and effect sizes</li>
                  <li>• Assumption testing results</li>
                  <li>• Confidence intervals where appropriate</li>
                  <li>• Practical significance discussion</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};