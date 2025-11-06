'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Download, 
  FileText, 
  Image, 
  Database, 
  Code, 
  Share2,
  Settings,
  CheckCircle,
  Package
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface ExportInterfaceProps {
  result?: {
    id: string;
    analysisName: string;
    analysisType: string;
    statisticalOutput: any;
  };
  projectId: string;
  onClose?: () => void;
}

interface ExportConfig {
  format: 'pdf' | 'docx' | 'html' | 'latex' | 'csv' | 'json' | 'r' | 'spss';
  includeCharts: boolean;
  includeData: boolean;
  includeCode: boolean;
  includeInterpretation: boolean;
  chartFormat: 'png' | 'svg' | 'pdf';
  chartDPI: number;
  style: 'apa' | 'mla' | 'chicago' | 'ieee';
  customizations: {
    title: string;
    author: string;
    institution: string;
    includeMethodology: boolean;
    includeResults: boolean;
    includeDiscussion: boolean;
    includeReferences: boolean;
  };
}

const EXPORT_FORMATS = [
  {
    id: 'pdf',
    name: 'PDF Report',
    description: 'Professional report with charts and tables',
    icon: <FileText className="h-4 w-4" />,
    category: 'report',
    features: ['Charts', 'Tables', 'Formatting', 'Citations']
  },
  {
    id: 'docx',
    name: 'Word Document',
    description: 'Editable document for further customization',
    icon: <FileText className="h-4 w-4" />,
    category: 'report',
    features: ['Editable', 'Charts', 'Tables', 'Styles']
  },
  {
    id: 'html',
    name: 'HTML Report',
    description: 'Interactive web-based report',
    icon: <Code className="h-4 w-4" />,
    category: 'report',
    features: ['Interactive', 'Responsive', 'Charts', 'Links']
  },
  {
    id: 'latex',
    name: 'LaTeX Document',
    description: 'Academic manuscript format',
    icon: <Code className="h-4 w-4" />,
    category: 'report',
    features: ['Academic', 'Citations', 'Equations', 'Professional']
  },
  {
    id: 'csv',
    name: 'CSV Data',
    description: 'Raw data and results in CSV format',
    icon: <Database className="h-4 w-4" />,
    category: 'data',
    features: ['Raw Data', 'Results', 'Portable', 'Excel Compatible']
  },
  {
    id: 'json',
    name: 'JSON Data',
    description: 'Structured data for programmatic use',
    icon: <Database className="h-4 w-4" />,
    category: 'data',
    features: ['Structured', 'API Ready', 'Complete', 'Metadata']
  },
  {
    id: 'r',
    name: 'R Script',
    description: 'Reproducible R code and data',
    icon: <Code className="h-4 w-4" />,
    category: 'code',
    features: ['Reproducible', 'Code', 'Data', 'Comments']
  },
  {
    id: 'spss',
    name: 'SPSS Syntax',
    description: 'SPSS syntax file for replication',
    icon: <Code className="h-4 w-4" />,
    category: 'code',
    features: ['SPSS Compatible', 'Syntax', 'Data', 'Replication']
  }
];

export const ExportInterface: React.FC<ExportInterfaceProps> = ({
  result,
  projectId,
  onClose
}) => {
  const [config, setConfig] = useState<ExportConfig>({
    format: 'pdf',
    includeCharts: true,
    includeData: false,
    includeCode: false,
    includeInterpretation: true,
    chartFormat: 'png',
    chartDPI: 300,
    style: 'apa',
    customizations: {
      title: result?.analysisName || 'Analysis Report',
      author: '',
      institution: '',
      includeMethodology: true,
      includeResults: true,
      includeDiscussion: true,
      includeReferences: true
    }
  });

  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);

  const selectedFormat = EXPORT_FORMATS.find(f => f.id === config.format);

  const handleConfigChange = (field: keyof ExportConfig, value: any) => {
    setConfig(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCustomizationChange = (field: string, value: any) => {
    setConfig(prev => ({
      ...prev,
      customizations: {
        ...prev.customizations,
        [field]: value
      }
    }));
  };

  const handleExport = async () => {
    setIsExporting(true);
    setExportProgress(0);

    // Simulate export progress
    const progressInterval = setInterval(() => {
      setExportProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          setIsExporting(false);
          return 100;
        }
        return prev + 10;
      });
    }, 200);

    // In real implementation, this would call the analytics service
    try {
      // await analyticsService.exportResult(result?.id, config);
      console.log('Exporting with config:', config);
    } catch (error) {
      console.error('Export failed:', error);
      setIsExporting(false);
      clearInterval(progressInterval);
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'report': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'data': return 'bg-green-100 text-green-800 border-green-200';
      case 'code': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5 text-green-600" />
            Export Results
          </CardTitle>
          <CardDescription>
            Export analysis results in various formats for reporting and sharing
          </CardDescription>
        </CardHeader>
      </Card>

      <Tabs defaultValue="format" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="format">Format Selection</TabsTrigger>
          <TabsTrigger value="options">Export Options</TabsTrigger>
          <TabsTrigger value="customization">Customization</TabsTrigger>
        </TabsList>

        {/* Format Selection Tab */}
        <TabsContent value="format" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Choose Export Format</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {EXPORT_FORMATS.map(format => (
                  <Card 
                    key={format.id}
                    className={`cursor-pointer transition-all ${
                      config.format === format.id ? 'ring-2 ring-green-500 bg-green-50' : 'hover:shadow-md'
                    }`}
                    onClick={() => handleConfigChange('format', format.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {format.icon}
                          <h4 className="font-medium">{format.name}</h4>
                        </div>
                        <Badge className={getCategoryColor(format.category)}>
                          {format.category}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{format.description}</p>
                      <div className="flex flex-wrap gap-1">
                        {format.features.map(feature => (
                          <Badge key={feature} variant="outline" className="text-xs">
                            {feature}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Export Options Tab */}
        <TabsContent value="options" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Export Options</CardTitle>
              <CardDescription>
                Configure what to include in your export
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Content Options */}
              <div>
                <Label className="text-base font-medium">Content to Include</Label>
                <div className="grid grid-cols-2 gap-4 mt-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="include-charts">Charts and Visualizations</Label>
                    <Switch
                      id="include-charts"
                      checked={config.includeCharts}
                      onCheckedChange={(checked) => handleConfigChange('includeCharts', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="include-data">Raw Data</Label>
                    <Switch
                      id="include-data"
                      checked={config.includeData}
                      onCheckedChange={(checked) => handleConfigChange('includeData', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="include-code">Analysis Code</Label>
                    <Switch
                      id="include-code"
                      checked={config.includeCode}
                      onCheckedChange={(checked) => handleConfigChange('includeCode', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="include-interpretation">Statistical Interpretation</Label>
                    <Switch
                      id="include-interpretation"
                      checked={config.includeInterpretation}
                      onCheckedChange={(checked) => handleConfigChange('includeInterpretation', checked)}
                    />
                  </div>
                </div>
              </div>

              {/* Chart Options */}
              {config.includeCharts && (
                <div>
                  <Label className="text-base font-medium">Chart Options</Label>
                  <div className="grid grid-cols-2 gap-4 mt-3">
                    <div>
                      <Label>Chart Format</Label>
                      <Select 
                        value={config.chartFormat} 
                        onValueChange={(value) => handleConfigChange('chartFormat', value)}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="png">PNG (Raster)</SelectItem>
                          <SelectItem value="svg">SVG (Vector)</SelectItem>
                          <SelectItem value="pdf">PDF (Vector)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Resolution (DPI)</Label>
                      <Select 
                        value={config.chartDPI.toString()} 
                        onValueChange={(value) => handleConfigChange('chartDPI', parseInt(value))}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="150">150 DPI (Web)</SelectItem>
                          <SelectItem value="300">300 DPI (Print)</SelectItem>
                          <SelectItem value="600">600 DPI (High Quality)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              )}

              {/* Style Options */}
              {['pdf', 'docx', 'html', 'latex'].includes(config.format) && (
                <div>
                  <Label className="text-base font-medium">Citation Style</Label>
                  <Select 
                    value={config.style} 
                    onValueChange={(value) => handleConfigChange('style', value)}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="apa">APA Style</SelectItem>
                      <SelectItem value="mla">MLA Style</SelectItem>
                      <SelectItem value="chicago">Chicago Style</SelectItem>
                      <SelectItem value="ieee">IEEE Style</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Customization Tab */}
        <TabsContent value="customization" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Report Customization</CardTitle>
              <CardDescription>
                Customize the report metadata and sections
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Metadata */}
              <div>
                <Label className="text-base font-medium">Report Metadata</Label>
                <div className="grid grid-cols-1 gap-4 mt-3">
                  <div>
                    <Label htmlFor="title">Title</Label>
                    <input
                      id="title"
                      type="text"
                      value={config.customizations.title}
                      onChange={(e) => handleCustomizationChange('title', e.target.value)}
                      className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="author">Author</Label>
                      <input
                        id="author"
                        type="text"
                        value={config.customizations.author}
                        onChange={(e) => handleCustomizationChange('author', e.target.value)}
                        className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <Label htmlFor="institution">Institution</Label>
                      <input
                        id="institution"
                        type="text"
                        value={config.customizations.institution}
                        onChange={(e) => handleCustomizationChange('institution', e.target.value)}
                        className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Sections */}
              {['pdf', 'docx', 'html', 'latex'].includes(config.format) && (
                <div>
                  <Label className="text-base font-medium">Report Sections</Label>
                  <div className="grid grid-cols-2 gap-4 mt-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="include-methodology">Methodology</Label>
                      <Switch
                        id="include-methodology"
                        checked={config.customizations.includeMethodology}
                        onCheckedChange={(checked) => handleCustomizationChange('includeMethodology', checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="include-results">Results</Label>
                      <Switch
                        id="include-results"
                        checked={config.customizations.includeResults}
                        onCheckedChange={(checked) => handleCustomizationChange('includeResults', checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="include-discussion">Discussion</Label>
                      <Switch
                        id="include-discussion"
                        checked={config.customizations.includeDiscussion}
                        onCheckedChange={(checked) => handleCustomizationChange('includeDiscussion', checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="include-references">References</Label>
                      <Switch
                        id="include-references"
                        checked={config.customizations.includeReferences}
                        onCheckedChange={(checked) => handleCustomizationChange('includeReferences', checked)}
                      />
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Export Summary */}
      <Card className="border-green-200 bg-green-50">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Package className="h-4 w-4" />
            Export Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Format:</span>
              <Badge className={getCategoryColor(selectedFormat?.category || 'report')}>
                {selectedFormat?.name}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Includes Charts:</span>
              <span className="text-sm">{config.includeCharts ? 'Yes' : 'No'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Includes Data:</span>
              <span className="text-sm">{config.includeData ? 'Yes' : 'No'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Includes Code:</span>
              <span className="text-sm">{config.includeCode ? 'Yes' : 'No'}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Export Actions */}
      <div className="flex justify-between">
        {onClose && (
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
        )}
        <div className="flex gap-2">
          <Button variant="outline" className="flex items-center gap-2">
            <Share2 className="h-4 w-4" />
            Share Link
          </Button>
          <Button 
            onClick={handleExport}
            disabled={isExporting}
            className="flex items-center gap-2"
          >
            {isExporting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Exporting... {exportProgress}%
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                Export {selectedFormat?.name}
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};