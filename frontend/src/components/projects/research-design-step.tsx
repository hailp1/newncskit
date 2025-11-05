'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Plus, X, BookOpen, Target, Lightbulb, Users, BarChart, Beaker, ArrowRight } from 'lucide-react';
import { 
  ResearchDesign, 
  TheoreticalFramework, 
  ResearchVariable, 
  Hypothesis, 
  FrameworkRelationship 
} from '@/types/workflow';

interface ResearchDesignStepProps {
  projectData: any;
  onComplete: (researchDesign: ResearchDesign) => void;
  onBack: () => void;
}

export function ResearchDesignStep({ projectData, onComplete, onBack }: ResearchDesignStepProps) {
  // State for theoretical frameworks
  const [theoreticalFrameworks, setTheoreticalFrameworks] = useState<TheoreticalFramework[]>([]);
  const [selectedFramework, setSelectedFramework] = useState<string>('');
  
  // State for research variables
  const [researchVariables, setResearchVariables] = useState<ResearchVariable[]>([]);
  const [newVariable, setNewVariable] = useState<Partial<ResearchVariable>>({
    name: '',
    type: 'independent',
    description: '',
    construct: '',
    measurementItems: ['']
  });
  
  // State for hypotheses
  const [hypotheses, setHypotheses] = useState<Hypothesis[]>([]);
  const [newHypothesis, setNewHypothesis] = useState<Partial<Hypothesis>>({
    statement: '',
    type: 'main',
    variables: [],
    expectedDirection: 'positive'
  });
  
  // State for methodology
  const [methodology, setMethodology] = useState('');
  
  // Available theoretical frameworks (could be fetched from API)
  const availableFrameworks = [
    {
      id: 'tam',
      name: 'Technology Acceptance Model (TAM)',
      description: 'Model explaining user acceptance of technology',
      variables: [
        { name: 'Perceived Usefulness', type: 'independent', construct: 'Usefulness' },
        { name: 'Perceived Ease of Use', type: 'independent', construct: 'Ease of Use' },
        { name: 'Behavioral Intention', type: 'dependent', construct: 'Intention' },
        { name: 'Actual Use', type: 'dependent', construct: 'Usage' }
      ]
    },
    {
      id: 'tpb',
      name: 'Theory of Planned Behavior (TPB)',
      description: 'Theory explaining human behavior prediction',
      variables: [
        { name: 'Attitude', type: 'independent', construct: 'Attitude' },
        { name: 'Subjective Norm', type: 'independent', construct: 'Social Influence' },
        { name: 'Perceived Behavioral Control', type: 'independent', construct: 'Control' },
        { name: 'Behavioral Intention', type: 'dependent', construct: 'Intention' }
      ]
    },
    {
      id: 'servqual',
      name: 'Service Quality Model (SERVQUAL)',
      description: 'Model for measuring service quality',
      variables: [
        { name: 'Tangibles', type: 'independent', construct: 'Physical Facilities' },
        { name: 'Reliability', type: 'independent', construct: 'Dependability' },
        { name: 'Responsiveness', type: 'independent', construct: 'Willingness to Help' },
        { name: 'Assurance', type: 'independent', construct: 'Competence' },
        { name: 'Empathy', type: 'independent', construct: 'Caring' },
        { name: 'Service Quality', type: 'dependent', construct: 'Overall Quality' }
      ]
    }
  ];

  // Initialize with project data if available
  useEffect(() => {
    if (projectData?.research_design) {
      const rd = projectData.research_design;
      setTheoreticalFrameworks(rd.theoreticalFrameworks || []);
      setResearchVariables(rd.researchVariables || []);
      setHypotheses(rd.hypotheses || []);
      setMethodology(rd.methodology || '');
    }
  }, [projectData]);

  // Handle framework selection
  const handleFrameworkSelection = (frameworkId: string) => {
    const framework = availableFrameworks.find(f => f.id === frameworkId);
    if (framework) {
      const newFramework: TheoreticalFramework = {
        id: frameworkId,
        name: framework.name,
        description: framework.description,
        variables: framework.variables.map((v, index) => ({
          id: `${frameworkId}_var_${index}`,
          name: v.name,
          type: v.type as any,
          description: '',
          construct: v.construct,
          measurementItems: []
        })),
        relationships: []
      };
      
      setTheoreticalFrameworks([...theoreticalFrameworks, newFramework]);
      setSelectedFramework('');
      
      // Add variables to research variables
      const newVariables = framework.variables.map((v, index) => ({
        id: `${frameworkId}_var_${index}`,
        name: v.name,
        type: v.type as any,
        description: '',
        construct: v.construct,
        measurementItems: ['']
      }));
      setResearchVariables([...researchVariables, ...newVariables]);
    }
  };

  // Handle variable management
  const addVariable = () => {
    if (newVariable.name && newVariable.construct) {
      const variable: ResearchVariable = {
        id: Date.now().toString(),
        name: newVariable.name!,
        type: newVariable.type!,
        description: newVariable.description!,
        construct: newVariable.construct!,
        measurementItems: newVariable.measurementItems!.filter(item => item.trim())
      };
      
      setResearchVariables([...researchVariables, variable]);
      setNewVariable({
        name: '',
        type: 'independent',
        description: '',
        construct: '',
        measurementItems: ['']
      });
    }
  };

  const removeVariable = (id: string) => {
    setResearchVariables(researchVariables.filter(v => v.id !== id));
  };

  const addMeasurementItem = () => {
    setNewVariable({
      ...newVariable,
      measurementItems: [...(newVariable.measurementItems || []), '']
    });
  };

  const updateMeasurementItem = (index: number, value: string) => {
    const items = [...(newVariable.measurementItems || [])];
    items[index] = value;
    setNewVariable({ ...newVariable, measurementItems: items });
  };

  const removeMeasurementItem = (index: number) => {
    const items = (newVariable.measurementItems || []).filter((_, i) => i !== index);
    setNewVariable({ ...newVariable, measurementItems: items });
  };

  // Handle hypothesis management
  const addHypothesis = () => {
    if (newHypothesis.statement) {
      const hypothesis: Hypothesis = {
        id: Date.now().toString(),
        statement: newHypothesis.statement!,
        type: newHypothesis.type!,
        variables: newHypothesis.variables!,
        expectedDirection: newHypothesis.expectedDirection!
      };
      
      setHypotheses([...hypotheses, hypothesis]);
      setNewHypothesis({
        statement: '',
        type: 'main',
        variables: [],
        expectedDirection: 'positive'
      });
    }
  };

  const removeHypothesis = (id: string) => {
    setHypotheses(hypotheses.filter(h => h.id !== id));
  };

  // Handle completion
  const handleComplete = () => {
    const researchDesign: ResearchDesign = {
      theoreticalFrameworks,
      researchVariables,
      hypotheses,
      methodology
    };
    
    onComplete(researchDesign);
  };

  const isValid = () => {
    return theoreticalFrameworks.length > 0 && 
           researchVariables.length > 0 && 
           hypotheses.length > 0 && 
           methodology.trim().length > 0;
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Research Design</h2>
        <p className="text-gray-600">Define your theoretical framework, research variables, and hypotheses</p>
      </div>

      {/* Theoretical Framework Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Beaker className="h-5 w-5 mr-2" />
            Theoretical Framework Selection
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Select a theoretical framework</label>
            <select
              value={selectedFramework}
              onChange={(e) => setSelectedFramework(e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
            >
              <option value="">Choose a framework...</option>
              {availableFrameworks.map(framework => (
                <option key={framework.id} value={framework.id}>
                  {framework.name}
                </option>
              ))}
            </select>
            {selectedFramework && (
              <div className="mt-2 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  {availableFrameworks.find(f => f.id === selectedFramework)?.description}
                </p>
                <Button 
                  onClick={() => handleFrameworkSelection(selectedFramework)}
                  size="sm"
                  className="mt-2"
                >
                  Add Framework
                </Button>
              </div>
            )}
          </div>

          {/* Selected Frameworks */}
          {theoreticalFrameworks.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-medium">Selected Frameworks:</h4>
              {theoreticalFrameworks.map(framework => (
                <div key={framework.id} className="border rounded-lg p-4 bg-green-50">
                  <div className="flex items-start justify-between">
                    <div>
                      <h5 className="font-medium text-green-800">{framework.name}</h5>
                      <p className="text-sm text-green-600 mt-1">{framework.description}</p>
                      <div className="mt-2">
                        <span className="text-xs text-green-600">Variables: </span>
                        {framework.variables.map(v => (
                          <Badge key={v.id} variant="outline" className="mr-1 text-xs">
                            {v.name}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <Button
                      onClick={() => setTheoreticalFrameworks(frameworks => 
                        frameworks.filter(f => f.id !== framework.id)
                      )}
                      variant="ghost"
                      size="sm"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Research Variables */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Target className="h-5 w-5 mr-2" />
            Research Variables
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Existing Variables */}
          {researchVariables.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-medium">Defined Variables:</h4>
              {researchVariables.map(variable => (
                <div key={variable.id} className="border rounded-lg p-4 bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <Badge variant={variable.type === 'independent' ? 'default' : 
                                      variable.type === 'dependent' ? 'destructive' : 'secondary'}>
                          {variable.type === 'independent' ? 'IV' : 
                           variable.type === 'dependent' ? 'DV' : 
                           variable.type === 'mediator' ? 'MED' : 'MOD'}
                        </Badge>
                        <span className="font-medium">{variable.name}</span>
                      </div>
                      <p className="text-sm text-gray-600 mb-1">
                        <strong>Construct:</strong> {variable.construct}
                      </p>
                      {variable.description && (
                        <p className="text-sm text-gray-600 mb-2">{variable.description}</p>
                      )}
                      {variable.measurementItems.length > 0 && (
                        <div className="text-xs text-gray-500">
                          <strong>Items:</strong> {variable.measurementItems.join(', ')}
                        </div>
                      )}
                    </div>
                    <Button
                      onClick={() => removeVariable(variable.id)}
                      variant="ghost"
                      size="sm"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Add New Variable */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
            <h4 className="font-medium mb-3">Add New Variable</h4>
            
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label className="block text-xs font-medium mb-1">Variable Name</label>
                <Input
                  value={newVariable.name || ''}
                  onChange={(e) => setNewVariable({...newVariable, name: e.target.value})}
                  placeholder="e.g., Perceived Usefulness"
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">Type</label>
                <select
                  value={newVariable.type || 'independent'}
                  onChange={(e) => setNewVariable({...newVariable, type: e.target.value as any})}
                  className="w-full px-3 py-2 border rounded-md text-sm"
                >
                  <option value="independent">Independent Variable</option>
                  <option value="dependent">Dependent Variable</option>
                  <option value="mediator">Mediator</option>
                  <option value="moderator">Moderator</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label className="block text-xs font-medium mb-1">Construct</label>
                <Input
                  value={newVariable.construct || ''}
                  onChange={(e) => setNewVariable({...newVariable, construct: e.target.value})}
                  placeholder="e.g., Technology Acceptance"
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">Description</label>
                <Input
                  value={newVariable.description || ''}
                  onChange={(e) => setNewVariable({...newVariable, description: e.target.value})}
                  placeholder="Brief description"
                />
              </div>
            </div>

            <div className="mb-3">
              <label className="block text-xs font-medium mb-1">Measurement Items</label>
              {(newVariable.measurementItems || ['']).map((item, index) => (
                <div key={index} className="flex items-center space-x-2 mb-2">
                  <Input
                    value={item}
                    onChange={(e) => updateMeasurementItem(index, e.target.value)}
                    placeholder={`Item ${index + 1}`}
                    className="flex-1"
                  />
                  {(newVariable.measurementItems || []).length > 1 && (
                    <Button
                      onClick={() => removeMeasurementItem(index)}
                      variant="ghost"
                      size="sm"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button onClick={addMeasurementItem} variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-1" />
                Add Item
              </Button>
            </div>

            <Button onClick={addVariable} size="sm">
              <Plus className="h-4 w-4 mr-1" />
              Add Variable
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Hypotheses */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Lightbulb className="h-5 w-5 mr-2" />
            Research Hypotheses
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Existing Hypotheses */}
          {hypotheses.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-medium">Defined Hypotheses:</h4>
              {hypotheses.map((hypothesis) => (
                <div key={hypothesis.id} className="border rounded-lg p-4 bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <Badge variant={hypothesis.type === 'main' ? 'default' : 'secondary'}>
                          {hypothesis.type === 'main' ? 'Main' : 
                           hypothesis.type === 'alternative' ? 'Alternative' : 'Null'}
                        </Badge>
                        <Badge variant="outline">
                          {hypothesis.expectedDirection === 'positive' ? '+' : 
                           hypothesis.expectedDirection === 'negative' ? '-' : '~'}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-700 mb-2">{hypothesis.statement}</p>
                      <div className="text-xs text-gray-500">
                        <span className="font-medium">Variables:</span> {hypothesis.variables.join(', ')}
                      </div>
                    </div>
                    <Button
                      onClick={() => removeHypothesis(hypothesis.id)}
                      variant="ghost"
                      size="sm"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Add New Hypothesis */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
            <h4 className="font-medium mb-3">Add New Hypothesis</h4>
            
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label className="block text-xs font-medium mb-1">Type</label>
                <select
                  value={newHypothesis.type || 'main'}
                  onChange={(e) => setNewHypothesis({...newHypothesis, type: e.target.value as any})}
                  className="w-full px-3 py-2 border rounded-md text-sm"
                >
                  <option value="main">Main Hypothesis</option>
                  <option value="alternative">Alternative Hypothesis</option>
                  <option value="null">Null Hypothesis</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">Expected Direction</label>
                <select
                  value={newHypothesis.expectedDirection || 'positive'}
                  onChange={(e) => setNewHypothesis({...newHypothesis, expectedDirection: e.target.value as any})}
                  className="w-full px-3 py-2 border rounded-md text-sm"
                >
                  <option value="positive">Positive</option>
                  <option value="negative">Negative</option>
                  <option value="neutral">Neutral</option>
                </select>
              </div>
            </div>

            <div className="mb-3">
              <label className="block text-xs font-medium mb-1">Hypothesis Statement</label>
              <Textarea
                value={newHypothesis.statement || ''}
                onChange={(e) => setNewHypothesis({...newHypothesis, statement: e.target.value})}
                placeholder="State your hypothesis clearly..."
                rows={2}
              />
            </div>

            <div className="mb-3">
              <label className="block text-xs font-medium mb-1">Related Variables</label>
              <div className="flex flex-wrap gap-2">
                {researchVariables.map(variable => (
                  <Badge
                    key={variable.id}
                    variant={(newHypothesis.variables || []).includes(variable.id) ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => {
                      const variables = newHypothesis.variables || [];
                      const isSelected = variables.includes(variable.id);
                      setNewHypothesis({
                        ...newHypothesis,
                        variables: isSelected 
                          ? variables.filter(v => v !== variable.id)
                          : [...variables, variable.id]
                      });
                    }}
                  >
                    {variable.name}
                  </Badge>
                ))}
              </div>
            </div>

            <Button onClick={addHypothesis} size="sm">
              <Plus className="h-4 w-4 mr-1" />
              Add Hypothesis
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Methodology */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <BookOpen className="h-5 w-5 mr-2" />
            Research Methodology
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div>
            <label className="block text-sm font-medium mb-2">Methodology Description</label>
            <Textarea
              value={methodology}
              onChange={(e) => setMethodology(e.target.value)}
              placeholder="Describe your research methodology, data collection approach, and analysis methods..."
              rows={4}
            />
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between pt-6">
        <Button onClick={onBack} variant="outline">
          <ArrowRight className="h-4 w-4 mr-2 rotate-180" />
          Back to Basic Info
        </Button>
        <div className="space-x-2">
          <Button 
            onClick={handleComplete}
            disabled={!isValid()}
            className="min-w-[120px]"
          >
            Continue to Data Collection
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </div>

      {/* Validation Summary */}
      {!isValid() && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="pt-4">
            <h4 className="font-medium text-orange-800 mb-2">Complete the following to continue:</h4>
            <ul className="text-sm text-orange-700 space-y-1">
              {theoreticalFrameworks.length === 0 && <li>• Select at least one theoretical framework</li>}
              {researchVariables.length === 0 && <li>• Define at least one research variable</li>}
              {hypotheses.length === 0 && <li>• Add at least one hypothesis</li>}
              {!methodology.trim() && <li>• Provide methodology description</li>}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}