'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  DragDropContext, 
  Droppable, 
  Draggable,
  DropResult
} from '@hello-pangea/dnd';
import {
  Eye,
  Settings,
  Plus,
  Trash2,
  GripVertical,
  Edit,
  Copy,
  Save,
  Play,
  AlertCircle,
  CheckCircle,
  Wand2
} from 'lucide-react';
import { Survey, SurveyQuestion, SurveySection } from '@/services/survey-builder';
import { surveyBuilderService } from '@/services/survey-builder';

interface SurveyBuilderProps {
  survey: Survey;
  onSurveyChange: (survey: Survey) => void;
  onSave?: (survey: Survey) => void;
  onPreview?: (survey: Survey) => void;
  readOnly?: boolean;
}

export function SurveyBuilder({ 
  survey, 
  onSurveyChange, 
  onSave, 
  onPreview, 
  readOnly = false 
}: SurveyBuilderProps) {
  const [editingQuestion, setEditingQuestion] = useState<string | null>(null);
  const [validationResult, setValidationResult] = useState<any>(null);
  const [isValidating, setIsValidating] = useState(false);

  // Validate survey when it changes
  useEffect(() => {
    const validateSurvey = async () => {
      setIsValidating(true);
      try {
        const result = await surveyBuilderService.validateSurvey(survey);
        setValidationResult(result);
      } catch (error) {
        console.error('Validation error:', error);
      } finally {
        setIsValidating(false);
      }
    };

    validateSurvey();
  }, [survey]);

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination || readOnly) return;

    const { source, destination, type } = result;

    if (type === 'section') {
      // Reorder sections
      const newSections = Array.from(survey.sections);
      const [reorderedSection] = newSections.splice(source.index, 1);
      newSections.splice(destination.index, 0, reorderedSection);

      // Update order numbers
      const updatedSections = newSections.map((section, index) => ({
        ...section,
        order: index + 1
      }));

      onSurveyChange({
        ...survey,
        sections: updatedSections
      });
    } else if (type === 'question') {
      // Reorder questions within a section
      const sectionId = source.droppableId;
      const section = survey.sections.find(s => s.id === sectionId);
      if (!section) return;

      const newQuestions = Array.from(section.questions);
      const [reorderedQuestion] = newQuestions.splice(source.index, 1);
      newQuestions.splice(destination.index, 0, reorderedQuestion);

      // Update order numbers
      const updatedQuestions = newQuestions.map((question, index) => ({
        ...question,
        order: index + 1
      }));

      const updatedSections = survey.sections.map(s =>
        s.id === sectionId ? { ...s, questions: updatedQuestions } : s
      );

      onSurveyChange({
        ...survey,
        sections: updatedSections
      });
    }
  };

  const updateSurveyBasicInfo = (updates: Partial<Survey>) => {
    onSurveyChange({
      ...survey,
      ...updates,
      metadata: {
        ...survey.metadata,
        updatedAt: new Date()
      }
    });
  };

  const addSection = () => {
    const newSection: SurveySection = {
      id: `section_${Date.now()}`,
      title: 'New Section',
      description: '',
      order: survey.sections.length + 1,
      questions: []
    };

    onSurveyChange({
      ...survey,
      sections: [...survey.sections, newSection]
    });
  };

  const updateSection = (sectionId: string, updates: Partial<SurveySection>) => {
    const updatedSections = survey.sections.map(section =>
      section.id === sectionId ? { ...section, ...updates } : section
    );

    onSurveyChange({
      ...survey,
      sections: updatedSections
    });
  };

  const deleteSection = (sectionId: string) => {
    const updatedSections = survey.sections
      .filter(section => section.id !== sectionId)
      .map((section, index) => ({ ...section, order: index + 1 }));

    onSurveyChange({
      ...survey,
      sections: updatedSections
    });
  };

  const addQuestion = (sectionId: string) => {
    const section = survey.sections.find(s => s.id === sectionId);
    if (!section) return;

    const newQuestion: SurveyQuestion = {
      id: `question_${Date.now()}`,
      text: 'New Question',
      type: 'likert',
      variable: 'NewVariable',
      construct: section.title,
      required: true,
      order: section.questions.length + 1,
      scale: { min: 1, max: 7, labels: ['Strongly Disagree', 'Disagree', 'Somewhat Disagree', 'Neutral', 'Somewhat Agree', 'Agree', 'Strongly Agree'] }
    };

    const updatedSections = survey.sections.map(s =>
      s.id === sectionId 
        ? { ...s, questions: [...s.questions, newQuestion] }
        : s
    );

    onSurveyChange({
      ...survey,
      sections: updatedSections
    });

    setEditingQuestion(newQuestion.id);
  };

  const updateQuestion = (sectionId: string, questionId: string, updates: Partial<SurveyQuestion>) => {
    const updatedSections = survey.sections.map(section =>
      section.id === sectionId
        ? {
            ...section,
            questions: section.questions.map(question =>
              question.id === questionId ? { ...question, ...updates } : question
            )
          }
        : section
    );

    onSurveyChange({
      ...survey,
      sections: updatedSections
    });
  };

  const deleteQuestion = (sectionId: string, questionId: string) => {
    const updatedSections = survey.sections.map(section =>
      section.id === sectionId
        ? {
            ...section,
            questions: section.questions
              .filter(question => question.id !== questionId)
              .map((question, index) => ({ ...question, order: index + 1 }))
          }
        : section
    );

    onSurveyChange({
      ...survey,
      sections: updatedSections
    });
  };

  const duplicateQuestion = (sectionId: string, questionId: string) => {
    const section = survey.sections.find(s => s.id === sectionId);
    const question = section?.questions.find(q => q.id === questionId);
    if (!section || !question) return;

    const duplicatedQuestion: SurveyQuestion = {
      ...question,
      id: `question_${Date.now()}`,
      text: `${question.text} (Copy)`,
      order: section.questions.length + 1
    };

    const updatedSections = survey.sections.map(s =>
      s.id === sectionId 
        ? { ...s, questions: [...s.questions, duplicatedQuestion] }
        : s
    );

    onSurveyChange({
      ...survey,
      sections: updatedSections
    });
  };

  const renderQuestionEditor = (sectionId: string, question: SurveyQuestion) => {
    const isEditing = editingQuestion === question.id;

    if (!isEditing) {
      return (
        <div className="border rounded-lg p-4 bg-white">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <Badge variant="outline">Q{question.order}</Badge>
                <Badge variant={question.type === 'likert' ? 'default' : 'secondary'}>
                  {question.type}
                </Badge>
                <Badge variant="outline">{question.construct}</Badge>
                {question.required && <Badge variant="destructive" className="text-xs">Required</Badge>}
              </div>
              <p className="font-medium mb-1">{question.text}</p>
              <p className="text-sm text-gray-500">Variable: {question.variable}</p>
              {question.scale && (
                <p className="text-xs text-gray-500">
                  Scale: {question.scale.min}-{question.scale.max}
                </p>
              )}
              {question.options && (
                <p className="text-xs text-gray-500">
                  Options: {question.options.join(', ')}
                </p>
              )}
            </div>
            {!readOnly && (
              <div className="flex items-center space-x-1">
                <Button
                  onClick={() => setEditingQuestion(question.id)}
                  variant="ghost"
                  size="sm"
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  onClick={() => duplicateQuestion(sectionId, question.id)}
                  variant="ghost"
                  size="sm"
                >
                  <Copy className="h-4 w-4" />
                </Button>
                <Button
                  onClick={() => deleteQuestion(sectionId, question.id)}
                  variant="ghost"
                  size="sm"
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
                <div className="cursor-grab">
                  <GripVertical className="h-4 w-4 text-gray-400" />
                </div>
              </div>
            )}
          </div>
        </div>
      );
    }

    return (
      <div className="border-2 border-blue-200 rounded-lg p-4 bg-blue-50">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Question Text</label>
              <Textarea
                value={question.text}
                onChange={(e) => updateQuestion(sectionId, question.id, { text: e.target.value })}
                rows={2}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Question Type</label>
              <select
                value={question.type}
                onChange={(e) => updateQuestion(sectionId, question.id, { type: e.target.value as any })}
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="likert">Likert Scale</option>
                <option value="multiple_choice">Multiple Choice</option>
                <option value="text">Text</option>
                <option value="numeric">Numeric</option>
                <option value="boolean">Yes/No</option>
                <option value="rating">Rating</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Variable Name</label>
              <Input
                value={question.variable}
                onChange={(e) => updateQuestion(sectionId, question.id, { variable: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Construct</label>
              <Input
                value={question.construct}
                onChange={(e) => updateQuestion(sectionId, question.id, { construct: e.target.value })}
              />
            </div>
          </div>

          {question.type === 'likert' && (
            <div>
              <label className="block text-sm font-medium mb-1">Scale</label>
              <div className="grid grid-cols-3 gap-2">
                <Input
                  type="number"
                  placeholder="Min"
                  value={question.scale?.min || 1}
                  onChange={(e) => updateQuestion(sectionId, question.id, {
                    scale: { ...question.scale!, min: parseInt(e.target.value) }
                  })}
                />
                <Input
                  type="number"
                  placeholder="Max"
                  value={question.scale?.max || 7}
                  onChange={(e) => updateQuestion(sectionId, question.id, {
                    scale: { ...question.scale!, max: parseInt(e.target.value) }
                  })}
                />
                <div className="text-sm text-gray-500 flex items-center">
                  {question.scale?.labels?.[0]} to {question.scale?.labels?.[question.scale.labels.length - 1]}
                </div>
              </div>
            </div>
          )}

          {question.type === 'multiple_choice' && (
            <div>
              <label className="block text-sm font-medium mb-1">Options</label>
              <div className="space-y-2">
                {(question.options || []).map((option, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <Input
                      value={option}
                      onChange={(e) => {
                        const newOptions = [...(question.options || [])];
                        newOptions[index] = e.target.value;
                        updateQuestion(sectionId, question.id, { options: newOptions });
                      }}
                    />
                    <Button
                      onClick={() => {
                        const newOptions = (question.options || []).filter((_, i) => i !== index);
                        updateQuestion(sectionId, question.id, { options: newOptions });
                      }}
                      variant="ghost"
                      size="sm"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  onClick={() => {
                    const newOptions = [...(question.options || []), 'New Option'];
                    updateQuestion(sectionId, question.id, { options: newOptions });
                  }}
                  variant="outline"
                  size="sm"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Option
                </Button>
              </div>
            </div>
          )}

          <div className="flex items-center space-x-4">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={question.required}
                onChange={(e) => updateQuestion(sectionId, question.id, { required: e.target.checked })}
              />
              <span className="text-sm">Required</span>
            </label>
          </div>

          <div className="flex justify-end space-x-2">
            <Button
              onClick={() => setEditingQuestion(null)}
              variant="outline"
              size="sm"
            >
              Done
            </Button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Survey Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Settings className="h-5 w-5" />
              <span>Survey Builder</span>
            </CardTitle>
            <div className="flex items-center space-x-2">
              {validationResult && (
                <Badge variant={validationResult.isValid ? 'default' : 'destructive'}>
                  {validationResult.isValid ? (
                    <><CheckCircle className="h-3 w-3 mr-1" />Valid</>
                  ) : (
                    <><AlertCircle className="h-3 w-3 mr-1" />Issues</>
                  )}
                </Badge>
              )}
              {onPreview && (
                <Button onClick={() => onPreview(survey)} variant="outline" size="sm">
                  <Eye className="h-4 w-4 mr-2" />
                  Preview
                </Button>
              )}
              {onSave && !readOnly && (
                <Button onClick={() => onSave(survey)} size="sm">
                  <Save className="h-4 w-4 mr-2" />
                  Save
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Survey Title</label>
              <Input
                value={survey.title}
                onChange={(e) => updateSurveyBasicInfo({ title: e.target.value })}
                readOnly={readOnly}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Estimated Time (minutes)</label>
              <Input
                type="number"
                value={survey.estimatedTime}
                onChange={(e) => updateSurveyBasicInfo({ estimatedTime: parseInt(e.target.value) })}
                readOnly={readOnly}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <Textarea
              value={survey.description}
              onChange={(e) => updateSurveyBasicInfo({ description: e.target.value })}
              rows={3}
              readOnly={readOnly}
            />
          </div>
        </CardContent>
      </Card>

      {/* Validation Results */}
      {validationResult && !validationResult.isValid && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-800 flex items-center">
              <AlertCircle className="h-5 w-5 mr-2" />
              Validation Issues
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {validationResult.errors.map((error: any, index: number) => (
                <div key={index} className="text-sm text-red-700">
                  • {error.message}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Survey Sections */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="sections" type="section">
          {(provided) => (
            <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-4">
              {survey.sections.map((section, sectionIndex) => (
                <Draggable
                  key={section.id}
                  draggableId={section.id}
                  index={sectionIndex}
                  isDragDisabled={readOnly}
                >
                  {(provided) => (
                    <Card
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      className="border-2 border-gray-200"
                    >
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            {!readOnly && (
                              <div {...provided.dragHandleProps} className="cursor-grab">
                                <GripVertical className="h-5 w-5 text-gray-400" />
                              </div>
                            )}
                            <div className="flex-1">
                              <Input
                                value={section.title}
                                onChange={(e) => updateSection(section.id, { title: e.target.value })}
                                className="font-medium text-lg border-none p-0 h-auto"
                                readOnly={readOnly}
                              />
                              <Input
                                value={section.description || ''}
                                onChange={(e) => updateSection(section.id, { description: e.target.value })}
                                placeholder="Section description..."
                                className="text-sm text-gray-600 border-none p-0 h-auto mt-1"
                                readOnly={readOnly}
                              />
                            </div>
                          </div>
                          {!readOnly && (
                            <div className="flex items-center space-x-2">
                              <Button
                                onClick={() => addQuestion(section.id)}
                                variant="outline"
                                size="sm"
                              >
                                <Plus className="h-4 w-4 mr-1" />
                                Add Question
                              </Button>
                              <Button
                                onClick={() => deleteSection(section.id)}
                                variant="ghost"
                                size="sm"
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent>
                        <Droppable droppableId={section.id} type="question">
                          {(provided) => (
                            <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-3">
                              {section.questions.map((question, questionIndex) => (
                                <Draggable
                                  key={question.id}
                                  draggableId={question.id}
                                  index={questionIndex}
                                  isDragDisabled={readOnly}
                                >
                                  {(provided) => (
                                    <div
                                      ref={provided.innerRef}
                                      {...provided.draggableProps}
                                      {...provided.dragHandleProps}
                                    >
                                      {renderQuestionEditor(section.id, question)}
                                    </div>
                                  )}
                                </Draggable>
                              ))}
                              {provided.placeholder}
                              {section.questions.length === 0 && (
                                <div className="text-center py-8 text-gray-500">
                                  <div className="text-sm">No questions in this section</div>
                                  {!readOnly && (
                                    <Button
                                      onClick={() => addQuestion(section.id)}
                                      variant="outline"
                                      size="sm"
                                      className="mt-2"
                                    >
                                      <Plus className="h-4 w-4 mr-1" />
                                      Add First Question
                                    </Button>
                                  )}
                                </div>
                              )}
                            </div>
                          )}
                        </Droppable>
                      </CardContent>
                    </Card>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      {/* Add Section Button */}
      {!readOnly && (
        <div className="text-center">
          <Button onClick={addSection} variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            Add Section
          </Button>
        </div>
      )}

      {/* Survey Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>Survey Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">{survey.sections.length}</div>
              <div className="text-sm text-gray-600">Sections</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">
                {survey.sections.reduce((sum, section) => sum + section.questions.length, 0)}
              </div>
              <div className="text-sm text-gray-600">Questions</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">{survey.estimatedTime}</div>
              <div className="text-sm text-gray-600">Minutes</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-600">
                {new Set(survey.sections.flatMap(s => s.questions.map(q => q.construct))).size}
              </div>
              <div className="text-sm text-gray-600">Constructs</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}