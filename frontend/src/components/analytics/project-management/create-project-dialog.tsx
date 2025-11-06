'use client';

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Minus, 
  FileText, 
  Database, 
  Upload, 
  Users,
  Lightbulb,
  Target,
  BookOpen
} from 'lucide-react';
import { analyticsService, AnalysisProject, ProjectConfiguration } from '@/services/analytics';

interface CreateProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onProjectCreated: (project: AnalysisProject) => void;
}

interface ProjectTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  researchQuestions: string[];
  hypotheses: string[];
  suggestedMethods: string[];
  theoreticalFramework: any;
}

const PROJECT_TEMPLATES: ProjectTemplate[] = [
  {
    id: 'customer-satisfaction',
    name: 'Customer Satisfaction Study',
    description: 'Comprehensive analysis of customer satisfaction factors and their relationships',
    category: 'Marketing Research',
    researchQuestions: [
      'What are the key drivers of customer satisfaction?',
      'How do satisfaction factors relate to customer loyalty?'
    ],
    hypotheses: [
      'Service quality positively influences customer satisfaction',
      'Customer satisfaction mediates the relationship between service quality and loyalty'
    ],
    suggestedMethods: ['Descriptive Analysis', 'Reliability Analysis', 'SEM'],
    theoreticalFramework: {
      name: 'Service Quality Model',
      constructs: ['Service Quality', 'Customer Satisfaction', 'Customer Loyalty']
    }
  },
  {
    id: 'employee-engagement',
    name: 'Employee Engagement Analysis',
    description: 'Study of factors affecting employee engagement and organizational outcomes',
    category: 'Organizational Psychology',
    researchQuestions: [
      'What factors contribute to employee engagement?',
      'How does engagement affect performance and retention?'
    ],
    hypotheses: [
      'Leadership support positively affects employee engagement',
      'Employee engagement mediates the relationship between job resources and performance'
    ],
    suggestedMethods: ['Factor Analysis', 'Mediation Analysis', 'Regression'],
    theoreticalFramework: {
      name: 'Job Demands-Resources Model',
      constructs: ['Job Resources', 'Employee Engagement', 'Performance', 'Well-being']
    }
  },
  {
    id: 'technology-acceptance',
    name: 'Technology Acceptance Study',
    description: 'Analysis of factors influencing technology adoption and usage behavior',
    category: 'Information Systems',
    researchQuestions: [
      'What factors influence technology acceptance?',
      'How do individual differences moderate acceptance?'
    ],
    hypotheses: [
      'Perceived usefulness positively influences intention to use',
      'Age moderates the relationship between ease of use and intention'
    ],
    suggestedMethods: ['CFA', 'SEM', 'Moderation Analysis'],
    theoreticalFramework: {
      name: 'Technology Acceptance Model',
      constructs: ['Perceived Usefulness', 'Perceived Ease of Use', 'Intention to Use', 'Actual Use']
    }
  }
];

export const CreateProjectDialog: React.FC<CreateProjectDialogProps> = ({
  open,
  onOpenChange,
  onProjectCreated
}) => {
  const [activeTab, setActiveTab] = useState('basic');
  const [loading, setLoading] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<ProjectTemplate | null>(null);
  
  // Form state
  const [formData, setFormData] = useState<ProjectConfiguration>({
    title: '',
    description: '',
    dataSource: 'survey_campaign',
    researchQuestions: [''],
    hypotheses: [''],
    theoreticalFramework: {},
    collaborators: []
  });

  useEffect(() => {
    if (selectedTemplate) {
      setFormData(prev => ({
        ...prev,
        title: selectedTemplate.name,
        description: selectedTemplate.description,
        researchQuestions: [...selectedTemplate.researchQuestions],
        hypotheses: [...selectedTemplate.hypotheses],
        theoreticalFramework: selectedTemplate.theoreticalFramework
      }));
    }
  }, [selectedTemplate]);

  const handleInputChange = (field: keyof ProjectConfiguration, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleArrayChange = (field: 'researchQuestions' | 'hypotheses', index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field]!.map((item, i) => i === index ? value : item)
    }));
  };

  const addArrayItem = (field: 'researchQuestions' | 'hypotheses') => {
    setFormData(prev => ({
      ...prev,
      [field]: [...(prev[field] || []), '']
    }));
  };

  const removeArrayItem = (field: 'researchQuestions' | 'hypotheses', index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field]!.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      
      // Validate required fields
      if (!formData.title.trim()) {
        alert('Please enter a project title');
        return;
      }
      
      if (!formData.description.trim()) {
        alert('Please enter a project description');
        return;
      }

      // Filter out empty research questions and hypotheses
      const cleanedData = {
        ...formData,
        researchQuestions: formData.researchQuestions?.filter(q => q.trim()) || [],
        hypotheses: formData.hypotheses?.filter(h => h.trim()) || []
      };

      const newProject = await analyticsService.createProject(cleanedData);
      onProjectCreated(newProject);
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        dataSource: 'survey_campaign',
        researchQuestions: [''],
        hypotheses: [''],
        theoreticalFramework: {},
        collaborators: []
      });
      setSelectedTemplate(null);
      setActiveTab('basic');
      
    } catch (error) {
      console.error('Failed to create project:', error);
      alert('Failed to create project. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = formData.title.trim() && formData.description.trim();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Analysis Project</DialogTitle>
          <DialogDescription>
            Set up a new research analysis project with your data and research framework
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="template">Template</TabsTrigger>
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="research">Research</TabsTrigger>
            <TabsTrigger value="data">Data Source</TabsTrigger>
          </TabsList>

          <TabsContent value="template" className="space-y-4">
            <div>
              <h3 className="text-lg font-medium mb-2">Choose a Template</h3>
              <p className="text-sm text-gray-600 mb-4">
                Start with a pre-configured template or create from scratch
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card 
                className={`cursor-pointer transition-all ${!selectedTemplate ? 'ring-2 ring-blue-500' : 'hover:shadow-md'}`}
                onClick={() => setSelectedTemplate(null)}
              >
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Blank Project
                  </CardTitle>
                  <CardDescription>
                    Start with an empty project and configure everything yourself
                  </CardDescription>
                </CardHeader>
              </Card>
              
              {PROJECT_TEMPLATES.map(template => (
                <Card 
                  key={template.id}
                  className={`cursor-pointer transition-all ${
                    selectedTemplate?.id === template.id ? 'ring-2 ring-blue-500' : 'hover:shadow-md'
                  }`}
                  onClick={() => setSelectedTemplate(template)}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-base">{template.name}</CardTitle>
                      <Badge variant="outline" className="text-xs">
                        {template.category}
                      </Badge>
                    </div>
                    <CardDescription className="text-sm">
                      {template.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-2">
                      <div className="flex flex-wrap gap-1">
                        {template.suggestedMethods.map(method => (
                          <Badge key={method} variant="secondary" className="text-xs">
                            {method}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="basic" className="space-y-4">
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Project Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Enter project title"
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Describe your research project and objectives"
                  rows={4}
                  className="mt-1"
                />
              </div>

              {selectedTemplate && (
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">Template: {selectedTemplate.name}</h4>
                  <p className="text-sm text-blue-700 mb-2">{selectedTemplate.description}</p>
                  <div className="flex flex-wrap gap-1">
                    {selectedTemplate.suggestedMethods.map(method => (
                      <Badge key={method} variant="secondary" className="text-xs">
                        {method}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="research" className="space-y-4">
            <div className="space-y-6">
              {/* Research Questions */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Target className="h-4 w-4 text-blue-600" />
                  <Label className="text-base font-medium">Research Questions</Label>
                </div>
                <div className="space-y-2">
                  {formData.researchQuestions?.map((question, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={question}
                        onChange={(e) => handleArrayChange('researchQuestions', index, e.target.value)}
                        placeholder={`Research question ${index + 1}`}
                        className="flex-1"
                      />
                      {formData.researchQuestions!.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeArrayItem('researchQuestions', index)}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addArrayItem('researchQuestions')}
                    className="flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Add Research Question
                  </Button>
                </div>
              </div>

              {/* Hypotheses */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Lightbulb className="h-4 w-4 text-yellow-600" />
                  <Label className="text-base font-medium">Hypotheses</Label>
                </div>
                <div className="space-y-2">
                  {formData.hypotheses?.map((hypothesis, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={hypothesis}
                        onChange={(e) => handleArrayChange('hypotheses', index, e.target.value)}
                        placeholder={`Hypothesis ${index + 1}`}
                        className="flex-1"
                      />
                      {formData.hypotheses!.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeArrayItem('hypotheses', index)}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addArrayItem('hypotheses')}
                    className="flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Add Hypothesis
                  </Button>
                </div>
              </div>

              {/* Theoretical Framework */}
              {selectedTemplate?.theoreticalFramework && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <BookOpen className="h-4 w-4 text-green-600" />
                    <Label className="text-base font-medium">Theoretical Framework</Label>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg">
                    <h4 className="font-medium text-green-900 mb-2">
                      {selectedTemplate.theoreticalFramework.name}
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedTemplate.theoreticalFramework.constructs?.map((construct: string) => (
                        <Badge key={construct} variant="outline" className="text-green-700 border-green-300">
                          {construct}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="data" className="space-y-4">
            <div>
              <Label className="text-base font-medium">Data Source</Label>
              <p className="text-sm text-gray-600 mb-4">
                Choose where your analysis data will come from
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card 
                  className={`cursor-pointer transition-all ${
                    formData.dataSource === 'survey_campaign' ? 'ring-2 ring-blue-500' : 'hover:shadow-md'
                  }`}
                  onClick={() => handleInputChange('dataSource', 'survey_campaign')}
                >
                  <CardContent className="p-4 text-center">
                    <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                    <h3 className="font-medium mb-1">Survey Campaign</h3>
                    <p className="text-sm text-gray-600">Use data from existing survey campaigns</p>
                  </CardContent>
                </Card>
                
                <Card 
                  className={`cursor-pointer transition-all ${
                    formData.dataSource === 'external_file' ? 'ring-2 ring-blue-500' : 'hover:shadow-md'
                  }`}
                  onClick={() => handleInputChange('dataSource', 'external_file')}
                >
                  <CardContent className="p-4 text-center">
                    <Upload className="h-8 w-8 text-green-600 mx-auto mb-2" />
                    <h3 className="font-medium mb-1">External File</h3>
                    <p className="text-sm text-gray-600">Upload CSV, Excel, or SPSS files</p>
                  </CardContent>
                </Card>
                
                <Card 
                  className={`cursor-pointer transition-all ${
                    formData.dataSource === 'database_query' ? 'ring-2 ring-blue-500' : 'hover:shadow-md'
                  }`}
                  onClick={() => handleInputChange('dataSource', 'database_query')}
                >
                  <CardContent className="p-4 text-center">
                    <Database className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                    <h3 className="font-medium mb-1">Database Query</h3>
                    <p className="text-sm text-gray-600">Connect to external databases</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-between pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <div className="flex gap-2">
            {activeTab !== 'template' && (
              <Button
                variant="outline"
                onClick={() => {
                  const tabs = ['template', 'basic', 'research', 'data'];
                  const currentIndex = tabs.indexOf(activeTab);
                  if (currentIndex > 0) {
                    setActiveTab(tabs[currentIndex - 1]);
                  }
                }}
              >
                Previous
              </Button>
            )}
            {activeTab !== 'data' ? (
              <Button
                onClick={() => {
                  const tabs = ['template', 'basic', 'research', 'data'];
                  const currentIndex = tabs.indexOf(activeTab);
                  if (currentIndex < tabs.length - 1) {
                    setActiveTab(tabs[currentIndex + 1]);
                  }
                }}
              >
                Next
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={!isFormValid || loading}
              >
                {loading ? 'Creating...' : 'Create Project'}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};