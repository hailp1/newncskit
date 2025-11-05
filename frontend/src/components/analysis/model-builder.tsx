'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AnalysisProject, ResearchModel } from '@/app/(dashboard)/analysis/page';

interface ModelBuilderProps {
  project: AnalysisProject;
  onUpdate: (project: AnalysisProject) => void;
}

export default function ModelBuilder({ project, onUpdate }: ModelBuilderProps) {
  const [models, setModels] = useState<ResearchModel[]>(project.models);
  const [newModel, setNewModel] = useState<Partial<ResearchModel>>({
    name: '',
    type: 'regression',
    variables: { independent: [], dependent: [] },
    hypotheses: []
  });

  const independentVars = project.columns.filter(col => col.role === 'independent').map(col => col.name);
  const dependentVars = project.columns.filter(col => col.role === 'dependent').map(col => col.name);
  const controlVars = project.columns.filter(col => col.role === 'control').map(col => col.name);

  const addModel = () => {
    if (!newModel.name) return;
    
    const model: ResearchModel = {
      id: Date.now().toString(),
      name: newModel.name,
      type: newModel.type || 'regression',
      variables: newModel.variables || { independent: [], dependent: [] },
      hypotheses: newModel.hypotheses || []
    };

    const updatedModels = [...models, model];
    setModels(updatedModels);
    
    const updatedProject = { ...project, models: updatedModels };
    onUpdate(updatedProject);
    
    // Reset form
    setNewModel({
      name: '',
      type: 'regression',
      variables: { independent: [], dependent: [] },
      hypotheses: []
    });
  };

  const removeModel = (modelId: string) => {
    const updatedModels = models.filter(model => model.id !== modelId);
    setModels(updatedModels);
    
    const updatedProject = { ...project, models: updatedModels };
    onUpdate(updatedProject);
  };

  const updateModelVariable = (modelId: string, varType: 'independent' | 'dependent', variables: string[]) => {
    const updatedModels = models.map(model => {
      if (model.id === modelId) {
        return {
          ...model,
          variables: {
            ...model.variables,
            [varType]: variables
          }
        };
      }
      return model;
    });
    
    setModels(updatedModels);
    const updatedProject = { ...project, models: updatedModels };
    onUpdate(updatedProject);
  };

  const addHypothesis = (modelId: string, hypothesis: string) => {
    if (!hypothesis.trim()) return;
    
    const updatedModels = models.map(model => {
      if (model.id === modelId) {
        return {
          ...model,
          hypotheses: [...model.hypotheses, hypothesis]
        };
      }
      return model;
    });
    
    setModels(updatedModels);
    const updatedProject = { ...project, models: updatedModels };
    onUpdate(updatedProject);
  };

  const removeHypothesis = (modelId: string, hypothesisIndex: number) => {
    const updatedModels = models.map(model => {
      if (model.id === modelId) {
        return {
          ...model,
          hypotheses: model.hypotheses.filter((_, index) => index !== hypothesisIndex)
        };
      }
      return model;
    });
    
    setModels(updatedModels);
    const updatedProject = { ...project, models: updatedModels };
    onUpdate(updatedProject);
  };

  return (
    <div className="space-y-6">
      {/* Add New Model */}
      <Card className="p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Create Research Model</h3>
        
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Model Name
              </label>
              <Input
                value={newModel.name || ''}
                onChange={(e) => setNewModel({ ...newModel, name: e.target.value })}
                placeholder="e.g., Customer Satisfaction Model"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Analysis Type
              </label>
              <select
                value={newModel.type || 'regression'}
                onChange={(e) => setNewModel({ ...newModel, type: e.target.value as ResearchModel['type'] })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="regression">Multiple Regression</option>
                <option value="sem">Structural Equation Model</option>
                <option value="anova">ANOVA</option>
                <option value="ttest">T-Test</option>
                <option value="correlation">Correlation Analysis</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Independent Variables
              </label>
              <div className="space-y-2 max-h-32 overflow-y-auto border rounded-md p-2">
                {independentVars.map(variable => (
                  <label key={variable} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={newModel.variables?.independent.includes(variable) || false}
                      onChange={(e) => {
                        const current = newModel.variables?.independent || [];
                        const updated = e.target.checked
                          ? [...current, variable]
                          : current.filter(v => v !== variable);
                        setNewModel({
                          ...newModel,
                          variables: { ...newModel.variables, independent: updated, dependent: newModel.variables?.dependent || [] }
                        });
                      }}
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm">{variable}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Dependent Variables
              </label>
              <div className="space-y-2 max-h-32 overflow-y-auto border rounded-md p-2">
                {dependentVars.map(variable => (
                  <label key={variable} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={newModel.variables?.dependent.includes(variable) || false}
                      onChange={(e) => {
                        const current = newModel.variables?.dependent || [];
                        const updated = e.target.checked
                          ? [...current, variable]
                          : current.filter(v => v !== variable);
                        setNewModel({
                          ...newModel,
                          variables: { ...newModel.variables, dependent: updated, independent: newModel.variables?.independent || [] }
                        });
                      }}
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm">{variable}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <Button onClick={addModel} disabled={!newModel.name}>
            Add Model
          </Button>
        </div>
      </Card>

      {/* Existing Models */}
      {models.map((model, index) => (
        <Card key={model.id} className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-medium text-gray-900">{model.name}</h3>
              <span className="text-sm text-gray-500 capitalize">{model.type.replace('_', ' ')}</span>
            </div>
            <Button
              variant="outline"
              onClick={() => removeModel(model.id)}
              className="text-red-600 hover:text-red-700"
            >
              Remove
            </Button>
          </div>

          <div className="space-y-4">
            {/* Variables */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Independent Variables</h4>
                <div className="flex flex-wrap gap-2">
                  {model.variables.independent.map(variable => (
                    <span
                      key={variable}
                      className="px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                    >
                      {variable}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-2">Dependent Variables</h4>
                <div className="flex flex-wrap gap-2">
                  {model.variables.dependent.map(variable => (
                    <span
                      key={variable}
                      className="px-2 py-1 bg-green-100 text-green-800 text-sm rounded-full"
                    >
                      {variable}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Hypotheses */}
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Research Hypotheses</h4>
              
              <div className="space-y-2 mb-3">
                {model.hypotheses.map((hypothesis, hypIndex) => (
                  <div key={hypIndex} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                    <span className="text-sm text-gray-700">H{hypIndex + 1}: {hypothesis}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeHypothesis(model.id, hypIndex)}
                      className="text-red-600 hover:text-red-700"
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>

              <div className="flex space-x-2">
                <Input
                  placeholder="Enter research hypothesis..."
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      addHypothesis(model.id, (e.target as HTMLInputElement).value);
                      (e.target as HTMLInputElement).value = '';
                    }
                  }}
                />
                <Button
                  onClick={(e) => {
                    const input = (e.target as HTMLElement).parentElement?.querySelector('input');
                    if (input?.value) {
                      addHypothesis(model.id, input.value);
                      input.value = '';
                    }
                  }}
                >
                  Add
                </Button>
              </div>
            </div>
          </div>
        </Card>
      ))}

      {/* Model Summary */}
      {models.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Model Summary</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{models.length}</div>
              <div className="text-sm text-gray-500">Research Models</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {models.reduce((sum, model) => sum + model.hypotheses.length, 0)}
              </div>
              <div className="text-sm text-gray-500">Total Hypotheses</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {[...new Set(models.map(model => model.type))].length}
              </div>
              <div className="text-sm text-gray-500">Analysis Types</div>
            </div>
          </div>
        </Card>
      )}

      {/* Recommendations */}
      <Card className="p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Model Building Tips</h3>
        
        <div className="space-y-3 text-sm text-gray-600">
          <div className="flex items-start space-x-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
            <p>
              <strong>Multiple Regression:</strong> Use when you have one continuous dependent variable and multiple predictors.
            </p>
          </div>
          
          <div className="flex items-start space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
            <p>
              <strong>SEM:</strong> Use for complex models with latent variables and multiple relationships.
            </p>
          </div>
          
          <div className="flex items-start space-x-2">
            <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
            <p>
              <strong>ANOVA:</strong> Use to compare means across groups or test interaction effects.
            </p>
          </div>
          
          <div className="flex items-start space-x-2">
            <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
            <p>
              <strong>T-Test:</strong> Use to compare means between two groups or test against a value.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}