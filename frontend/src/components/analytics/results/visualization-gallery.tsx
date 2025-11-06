'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  BarChart3, 
  PieChart, 
  TrendingUp, 
  Download, 
  Maximize2, 
  Settings, 
  Image,
  FileImage,
  Palette,
  Grid3X3
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface VisualizationGalleryProps {
  result: {
    id: string;
    analysisType: string;
    analysisName: string;
    statisticalOutput: any;
  };
}

interface ChartConfig {
  id: string;
  title: string;
  type: string;
  category: string;
  description: string;
  publicationReady: boolean;
  interactive: boolean;
}

const CHART_CONFIGS: Record<string, ChartConfig[]> = {
  reliability: [
    {
      id: 'cronbach_alpha_plot',
      title: "Cronbach's Alpha by Scale",
      type: 'bar',
      category: 'reliability',
      description: 'Internal consistency reliability for each scale',
      publicationReady: true,
      interactive: false
    },
    {
      id: 'item_total_correlation',
      title: 'Item-Total Correlations',
      type: 'scatter',
      category: 'reliability',
      description: 'Correlation between each item and total scale score',
      publicationReady: true,
      interactive: true
    }
  ],
  efa: [
    {
      id: 'scree_plot',
      title: 'Scree Plot',
      type: 'line',
      category: 'factor_analysis',
      description: 'Eigenvalues for factor extraction decision',
      publicationReady: true,
      interactive: false
    },
    {
      id: 'factor_loadings',
      title: 'Factor Loading Matrix',
      type: 'heatmap',
      category: 'factor_analysis',
      description: 'Pattern of item loadings on extracted factors',
      publicationReady: true,
      interactive: true
    },
    {
      id: 'parallel_analysis',
      title: 'Parallel Analysis',
      type: 'line',
      category: 'factor_analysis',
      description: 'Comparison of actual vs. random eigenvalues',
      publicationReady: true,
      interactive: false
    }
  ],
  cfa: [
    {
      id: 'path_diagram',
      title: 'Path Diagram',
      type: 'network',
      category: 'structural',
      description: 'Visual representation of the measurement model',
      publicationReady: true,
      interactive: true
    },
    {
      id: 'fit_indices',
      title: 'Model Fit Indices',
      type: 'radar',
      category: 'structural',
      description: 'Comprehensive model fit assessment',
      publicationReady: true,
      interactive: false
    },
    {
      id: 'residual_plot',
      title: 'Standardized Residuals',
      type: 'scatter',
      category: 'diagnostics',
      description: 'Model residuals for diagnostic purposes',
      publicationReady: false,
      interactive: true
    }
  ],
  sem: [
    {
      id: 'structural_model',
      title: 'Structural Model',
      type: 'network',
      category: 'structural',
      description: 'Complete structural equation model with path coefficients',
      publicationReady: true,
      interactive: true
    },
    {
      id: 'modification_indices',
      title: 'Modification Indices',
      type: 'bar',
      category: 'diagnostics',
      description: 'Potential model improvements',
      publicationReady: false,
      interactive: false
    }
  ],
  regression: [
    {
      id: 'coefficient_plot',
      title: 'Regression Coefficients',
      type: 'forest',
      category: 'regression',
      description: 'Standardized coefficients with confidence intervals',
      publicationReady: true,
      interactive: false
    },
    {
      id: 'residual_vs_fitted',
      title: 'Residuals vs Fitted',
      type: 'scatter',
      category: 'diagnostics',
      description: 'Diagnostic plot for homoscedasticity',
      publicationReady: false,
      interactive: true
    },
    {
      id: 'qq_plot',
      title: 'Q-Q Plot',
      type: 'scatter',
      category: 'diagnostics',
      description: 'Normal probability plot of residuals',
      publicationReady: false,
      interactive: false
    }
  ]
};

export const VisualizationGallery: React.FC<VisualizationGalleryProps> = ({
  result
}) => {
  const [selectedChart, setSelectedChart] = useState<ChartConfig | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [showFullscreen, setShowFullscreen] = useState(false);

  const availableCharts = CHART_CONFIGS[result.analysisType] || [];
  
  const filteredCharts = availableCharts.filter(chart => 
    filterCategory === 'all' || chart.category === filterCategory
  );

  const categories = Array.from(new Set(availableCharts.map(chart => chart.category)));

  const handleChartSelect = (chart: ChartConfig) => {
    setSelectedChart(chart);
  };

  const handleDownload = (chart: ChartConfig, format: 'png' | 'svg' | 'pdf') => {
    // In real implementation, this would trigger chart export
    console.log(`Downloading ${chart.title} as ${format}`);
  };

  const getChartIcon = (type: string) => {
    switch (type) {
      case 'bar': return <BarChart3 className="h-4 w-4" />;
      case 'pie': return <PieChart className="h-4 w-4" />;
      case 'line': return <TrendingUp className="h-4 w-4" />;
      case 'scatter': return <Grid3X3 className="h-4 w-4" />;
      case 'heatmap': return <Palette className="h-4 w-4" />;
      default: return <BarChart3 className="h-4 w-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'reliability': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'factor_analysis': return 'bg-green-100 text-green-800 border-green-200';
      case 'structural': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'regression': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'diagnostics': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Image className="h-5 w-5 text-purple-600" />
                Visualization Gallery
              </CardTitle>
              <CardDescription>
                Publication-ready charts and interactive visualizations for {result.analysisName}
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>
                      {category.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Charts Grid/List */}
      {filteredCharts.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Image className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No visualizations available</h3>
            <p className="text-gray-600">
              No charts are available for {result.analysisType} analysis or the selected category
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-4'}>
          {filteredCharts.map(chart => (
            <Card 
              key={chart.id}
              className={`cursor-pointer transition-all hover:shadow-lg ${
                selectedChart?.id === chart.id ? 'ring-2 ring-purple-500 bg-purple-50' : ''
              }`}
              onClick={() => handleChartSelect(chart)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    {getChartIcon(chart.type)}
                    <CardTitle className="text-base">{chart.title}</CardTitle>
                  </div>
                  <div className="flex gap-1">
                    {chart.publicationReady && (
                      <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                        Publication
                      </Badge>
                    )}
                    {chart.interactive && (
                      <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                        Interactive
                      </Badge>
                    )}
                  </div>
                </div>
                <CardDescription className="text-sm">
                  {chart.description}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="pt-0">
                {/* Mock Chart Preview */}
                <div className="h-32 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center mb-3">
                  {getChartIcon(chart.type)}
                  <span className="ml-2 text-sm text-gray-600">Chart Preview</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <Badge className={getCategoryColor(chart.category)}>
                    {chart.category.replace('_', ' ')}
                  </Badge>
                  
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedChart(chart);
                        setShowFullscreen(true);
                      }}
                    >
                      <Maximize2 className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownload(chart, 'png');
                      }}
                    >
                      <Download className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Selected Chart Details */}
      {selectedChart && (
        <Card className="border-purple-200 bg-purple-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {getChartIcon(selectedChart.type)}
              {selectedChart.title}
            </CardTitle>
            <CardDescription>
              {selectedChart.description}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Large Chart Display */}
            <div className="h-64 bg-white rounded-lg border-2 border-dashed border-purple-300 flex items-center justify-center">
              <div className="text-center">
                {getChartIcon(selectedChart.type)}
                <p className="text-sm text-gray-600 mt-2">
                  {selectedChart.title} would be displayed here
                </p>
              </div>
            </div>
            
            {/* Chart Controls */}
            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                <Badge className={getCategoryColor(selectedChart.category)}>
                  {selectedChart.category.replace('_', ' ')}
                </Badge>
                {selectedChart.publicationReady && (
                  <Badge className="bg-green-100 text-green-800 border-green-200">
                    Publication Ready
                  </Badge>
                )}
                {selectedChart.interactive && (
                  <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                    Interactive
                  </Badge>
                )}
              </div>
              
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Settings className="h-4 w-4 mr-2" />
                  Customize
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleDownload(selectedChart, 'png')}>
                  <Download className="h-4 w-4 mr-2" />
                  Download PNG
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleDownload(selectedChart, 'svg')}>
                  <FileImage className="h-4 w-4 mr-2" />
                  Download SVG
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Fullscreen Dialog */}
      <Dialog open={showFullscreen} onOpenChange={setShowFullscreen}>
        <DialogContent className="max-w-6xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedChart && getChartIcon(selectedChart.type)}
              {selectedChart?.title}
            </DialogTitle>
          </DialogHeader>
          <div className="h-96 bg-gray-100 rounded-lg flex items-center justify-center">
            <div className="text-center">
              {selectedChart && getChartIcon(selectedChart.type)}
              <p className="text-gray-600 mt-2">
                Fullscreen {selectedChart?.title} would be displayed here
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};