'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Plus, X, BookOpen, Target, Lightbulb } from 'lucide-react';

interface ResearchDesignProps {
  project: any;
  onUpdate: (project: any) => void;
  onNext: () => void;
}

interface Hypothesis {
  id: string;
  code: string;
  statement: string;
  type: 'main' | 'mediation' | 'moderation';
  variables: {
    independent: string;
    dependent: string;
    mediator?: string;
    moderator?: string;
  };
}

interface ResearchModel {
  title: string;
  description: string;
  type: 'conceptual' | 'theoretical';
  constructs: string[];
  relationships: Array<{
    from: string;
    to: string;
    type: 'direct' | 'mediated' | 'moderated';
    hypothesis: string;
  }>;
}

export default function ResearchDesign({ project, onUpdate, onNext }: ResearchDesignProps) {
  const [researchTitle, setResearchTitle] = useState(project?.researchDesign?.title || '');
  const [researchObjective, setResearchObjective] = useState(project?.researchDesign?.objective || '');
  const [researchQuestions, setResearchQuestions] = useState<string[]>(project?.researchDesign?.questions || ['']);
  const [hypotheses, setHypotheses] = useState<Hypothesis[]>(project?.researchDesign?.hypotheses || []);
  const [theoreticalFramework, setTheoreticalFramework] = useState(project?.researchDesign?.framework || '');
  const [researchModel, setResearchModel] = useState<ResearchModel>(project?.researchDesign?.model || {
    title: '',
    description: '',
    type: 'conceptual',
    constructs: [],
    relationships: []
  });

  const [newConstruct, setNewConstruct] = useState('');
  const [newHypothesis, setNewHypothesis] = useState<{
    code: string;
    statement: string;
    type: 'main' | 'mediation' | 'moderation';
    variables: { independent: string; dependent: string; mediator: string; moderator: string };
  }>({
    code: '',
    statement: '',
    type: 'main',
    variables: { independent: '', dependent: '', mediator: '', moderator: '' }
  });

  const addResearchQuestion = () => {
    setResearchQuestions([...researchQuestions, '']);
  };

  const updateResearchQuestion = (index: number, value: string) => {
    const updated = [...researchQuestions];
    updated[index] = value;
    setResearchQuestions(updated);
  };

  const removeResearchQuestion = (index: number) => {
    setResearchQuestions(researchQuestions.filter((_, i) => i !== index));
  };

  const addConstruct = () => {
    if (newConstruct.trim()) {
      setResearchModel({
        ...researchModel,
        constructs: [...researchModel.constructs, newConstruct.trim()]
      });
      setNewConstruct('');
    }
  };

  const removeConstruct = (index: number) => {
    setResearchModel({
      ...researchModel,
      constructs: researchModel.constructs.filter((_, i) => i !== index)
    });
  };

  const addHypothesis = () => {
    if (newHypothesis.code && newHypothesis.statement) {
      const hypothesis: Hypothesis = {
        id: Date.now().toString(),
        ...newHypothesis
      };
      setHypotheses([...hypotheses, hypothesis]);
      setNewHypothesis({
        code: '',
        statement: '',
        type: 'main',
        variables: { independent: '', dependent: '', mediator: '', moderator: '' }
      });
    }
  };

  const removeHypothesis = (id: string) => {
    setHypotheses(hypotheses.filter(h => h.id !== id));
  };

  const saveDesign = () => {
    const updatedProject = {
      ...project,
      researchDesign: {
        title: researchTitle,
        objective: researchObjective,
        questions: researchQuestions.filter(q => q.trim()),
        hypotheses,
        framework: theoreticalFramework,
        model: researchModel
      }
    };
    onUpdate(updatedProject);
    onNext();
  };

  const researchTypes = [
    { id: 'exploratory', name: 'Exploratory Research', desc: 'Khám phá hiện tượng mới' },
    { id: 'descriptive', name: 'Descriptive Research', desc: 'Mô tả đặc điểm hiện tượng' },
    { id: 'explanatory', name: 'Explanatory Research', desc: 'Giải thích mối quan hệ nhân quả' },
    { id: 'predictive', name: 'Predictive Research', desc: 'Dự đoán kết quả tương lai' }
  ];

  return (
    <div className="space-y-6">
      {/* Research Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <BookOpen className="h-5 w-5 mr-2" />
            Research Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Research Title</label>
            <Input
              value={researchTitle}
              onChange={(e) => setResearchTitle(e.target.value)}
              placeholder="Enter your research title..."
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Research Objective</label>
            <Textarea
              value={researchObjective}
              onChange={(e) => setResearchObjective(e.target.value)}
              placeholder="Describe the main objective of your research..."
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Research Type</label>
            <div className="grid grid-cols-2 gap-3">
              {researchTypes.map((type) => (
                <div key={type.id} className="border rounded-lg p-3 hover:bg-gray-50 cursor-pointer">
                  <h4 className="font-medium text-sm">{type.name}</h4>
                  <p className="text-xs text-gray-600">{type.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Research Questions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Target className="h-5 w-5 mr-2" />
            Research Questions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {researchQuestions.map((question, index) => (
            <div key={index} className="flex items-center space-x-2">
              <span className="text-sm font-medium min-w-[30px]">RQ{index + 1}:</span>
              <Input
                value={question}
                onChange={(e) => updateResearchQuestion(index, e.target.value)}
                placeholder="Enter research question..."
                className="flex-1"
              />
              {researchQuestions.length > 1 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeResearchQuestion(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
          
          <Button variant="outline" onClick={addResearchQuestion} className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Add Research Question
          </Button>
        </CardContent>
      </Card>

      {/* Theoretical Framework */}
      <Card>
        <CardHeader>
          <CardTitle>Theoretical Framework</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            value={theoreticalFramework}
            onChange={(e) => setTheoreticalFramework(e.target.value)}
            placeholder="Describe the theoretical foundation of your research..."
            rows={4}
          />

          <div>
            <label className="block text-sm font-medium mb-2">Key Constructs</label>
            <div className="flex items-center space-x-2 mb-3">
              <Input
                value={newConstruct}
                onChange={(e) => setNewConstruct(e.target.value)}
                placeholder="Add construct (e.g., Trust, Satisfaction, Intention)"
                className="flex-1"
                onKeyPress={(e) => e.key === 'Enter' && addConstruct()}
              />
              <Button onClick={addConstruct}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {researchModel.constructs.map((construct, index) => (
                <Badge key={index} variant="secondary" className="flex items-center">
                  {construct}
                  <X 
                    className="h-3 w-3 ml-1 cursor-pointer" 
                    onClick={() => removeConstruct(index)}
                  />
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Research Hypotheses */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Lightbulb className="h-5 w-5 mr-2" />
            Research Hypotheses
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Add New Hypothesis */}
          <div className="border rounded-lg p-4 bg-gray-50">
            <h4 className="font-medium mb-3">Add New Hypothesis</h4>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label className="block text-xs font-medium mb-1">Hypothesis Code</label>
                <Input
                  value={newHypothesis.code}
                  onChange={(e) => setNewHypothesis({...newHypothesis, code: e.target.value})}
                  placeholder="H1, H2a, etc."
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">Type</label>
                <select
                  value={newHypothesis.type}
                  onChange={(e) => setNewHypothesis({...newHypothesis, type: e.target.value as any})}
                  className="w-full px-3 py-2 border rounded-md text-sm"
                >
                  <option value="main">Main Effect</option>
                  <option value="mediation">Mediation</option>
                  <option value="moderation">Moderation</option>
                </select>
              </div>
            </div>

            <div className="mb-3">
              <label className="block text-xs font-medium mb-1">Hypothesis Statement</label>
              <Textarea
                value={newHypothesis.statement}
                onChange={(e) => setNewHypothesis({...newHypothesis, statement: e.target.value})}
                placeholder="State your hypothesis clearly..."
                rows={2}
              />
            </div>

            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label className="block text-xs font-medium mb-1">Independent Variable</label>
                <Input
                  value={newHypothesis.variables.independent}
                  onChange={(e) => setNewHypothesis({
                    ...newHypothesis, 
                    variables: {...newHypothesis.variables, independent: e.target.value}
                  })}
                  placeholder="IV"
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">Dependent Variable</label>
                <Input
                  value={newHypothesis.variables.dependent}
                  onChange={(e) => setNewHypothesis({
                    ...newHypothesis, 
                    variables: {...newHypothesis.variables, dependent: e.target.value}
                  })}
                  placeholder="DV"
                />
              </div>
            </div>

            {newHypothesis.type === 'mediation' && (
              <div className="mb-3">
                <label className="block text-xs font-medium mb-1">Mediator Variable</label>
                <Input
                  value={newHypothesis.variables.mediator || ''}
                  onChange={(e) => setNewHypothesis({
                    ...newHypothesis, 
                    variables: {...newHypothesis.variables, mediator: e.target.value}
                  })}
                  placeholder="Mediator"
                />
              </div>
            )}

            {newHypothesis.type === 'moderation' && (
              <div className="mb-3">
                <label className="block text-xs font-medium mb-1">Moderator Variable</label>
                <Input
                  value={newHypothesis.variables.moderator || ''}
                  onChange={(e) => setNewHypothesis({
                    ...newHypothesis, 
                    variables: {...newHypothesis.variables, moderator: e.target.value}
                  })}
                  placeholder="Moderator"
                />
              </div>
            )}

            <Button onClick={addHypothesis} className="w-full">
              Add Hypothesis
            </Button>
          </div>

          {/* Existing Hypotheses */}
          <div className="space-y-3">
            {hypotheses.map((hypothesis) => (
              <div key={hypothesis.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <Badge variant="outline">{hypothesis.code}</Badge>
                      <Badge variant={
                        hypothesis.type === 'main' ? 'default' : 
                        hypothesis.type === 'mediation' ? 'secondary' : 'destructive'
                      }>
                        {hypothesis.type}
                      </Badge>
                    </div>
                    <p className="text-sm mb-2">{hypothesis.statement}</p>
                    <div className="text-xs text-gray-600">
                      <span className="font-medium">IV:</span> {hypothesis.variables.independent} → 
                      <span className="font-medium"> DV:</span> {hypothesis.variables.dependent}
                      {hypothesis.variables.mediator && (
                        <span> (via <span className="font-medium">M:</span> {hypothesis.variables.mediator})</span>
                      )}
                      {hypothesis.variables.moderator && (
                        <span> (moderated by <span className="font-medium">Mo:</span> {hypothesis.variables.moderator})</span>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeHypothesis(hypothesis.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-between">
        <div></div>
        <Button 
          onClick={saveDesign}
          disabled={!researchTitle || !researchObjective || hypotheses.length === 0}
          className="px-8"
        >
          Continue to Data Collection
        </Button>
      </div>
    </div>
  );
}