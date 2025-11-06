'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  Upload, 
  FileText, 
  Users, 
  Calendar, 
  MapPin, 
  Settings, 
  Wand2, 
  Eye, 
  ArrowRight,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { 
  DataCollectionConfig, 
  DataCollectionMethod, 
  DataCollectionStatus,
  ResearchDesign,
  QuestionTemplate,
  QuestionType
} from '@/types/workflow';

interface DataCollectionStepProps {
  projectData: any;
  researchDesign?: ResearchDesign;
  onComplete: (dataCollection: DataCollectionConfig) => void;
  onBack: () => void;
}

interface SurveyQuestion {
  id: string;
  text: string;
  type: 'likert' | 'multiple_choice' | 'text' | 'numeric';
  variable: string;
  construct: string;
  options?: string[];
  scale?: { min: number; max: number; labels: string[] };
  required: boolean;
}

interface GeneratedSurvey {
  title: string;
  description: string;
  questions: SurveyQuestion[];
  estimatedTime: number;
}

export function DataCollectionStep({ projectData, researchDesign, onComplete, onBack }: DataCollectionStepProps) {
  // State for data collection configuration
  const [collectionMethod, setCollectionMethod] = useState<DataCollectionMethod>(DataCollectionMethod.INTERNAL_SURVEY);
  const [targetSampleSize, setTargetSampleSize] = useState<number>(100);
  const [status, setStatus] = useState<DataCollectionStatus>(DataCollectionStatus.NOT_STARTED);
  
  // State for survey generation
  const [generatedSurvey, setGeneratedSurvey] = useState<GeneratedSurvey | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [surveyCustomizations, setSurveyCustomizations] = useState<{ [key: string]: any }>({});
  
  // State for campaign configuration
  const [campaignConfig, setCampaignConfig] = useState({
    title: '',
    description: '',
    tokenRewardPerParticipant: 10,
    duration: 30,
    eligibilityCriteria: {
      minAge: 18,
      demographics: [] as string[],
      experience: [] as string[]
    }
  });

  // Initialize with project data
  useEffect(() => {
    if (projectData?.data_collection) {
      const dc = projectData.data_collection;
      setCollectionMethod(dc.collectionMethod || DataCollectionMethod.INTERNAL_SURVEY);
      setTargetSampleSize(dc.targetSampleSize || 100);
      setStatus(dc.status || DataCollectionStatus.NOT_STARTED);
    }
    
    // Auto-generate campaign title from project
    if (projectData?.title && !campaignConfig.title) {
      setCampaignConfig(prev => ({
        ...prev,
        title: `${projectData.title} - Data Collection Campaign`
      }));
    }
  }, [projectData]);

  // Sample question templates based on common theoretical models
  const getQuestionTemplates = (): QuestionTemplate[] => {
    const templates: QuestionTemplate[] = [];
    
    if (researchDesign?.theoreticalFrameworks) {
      researchDesign.theoreticalFrameworks.forEach(framework => {
        framework.variables.forEach(variable => {
          // Generate questions based on variable type and construct
          if (variable.construct.toLowerCase().includes('usefulness')) {
            templates.push({
              id: `q_${variable.id}_1`,
              text: `I find ${projectData?.title || 'this system'} useful in my work`,
              textVi: `Tôi thấy ${projectData?.title || 'hệ thống này'} hữu ích trong công việc`,
              type: QuestionType.LIKERT,
              theoreticalModel: framework.name,
              researchVariable: variable.name,
              construct: variable.construct,
              scale: {
                min: 1,
                max: 7,
                labels: ['Strongly Disagree', 'Disagree', 'Somewhat Disagree', 'Neutral', 'Somewhat Agree', 'Agree', 'Strongly Agree']
              },
              source: 'Davis, F. D. (1989). Perceived usefulness, perceived ease of use, and user acceptance of information technology',
              tags: ['technology', 'usefulness'],
              isActive: true,
              version: 1
            });
          }
          
          if (variable.construct.toLowerCase().includes('ease')) {
            templates.push({
              id: `q_${variable.id}_2`,
              text: `I find ${projectData?.title || 'this system'} easy to use`,
              textVi: `Tôi thấy ${projectData?.title || 'hệ thống này'} dễ sử dụng`,
              type: QuestionType.LIKERT,
              theoreticalModel: framework.name,
              researchVariable: variable.name,
              construct: variable.construct,
              scale: {
                min: 1,
                max: 7,
                labels: ['Strongly Disagree', 'Disagree', 'Somewhat Disagree', 'Neutral', 'Somewhat Agree', 'Agree', 'Strongly Agree']
              },
              source: 'Davis, F. D. (1989). Perceived usefulness, perceived ease of use, and user acceptance of information technology',
              tags: ['technology', 'ease-of-use'],
              isActive: true,
              version: 1
            });
          }
          
          if (variable.construct.toLowerCase().includes('intention')) {
            templates.push({
              id: `q_${variable.id}_3`,
              text: `I intend to use ${projectData?.title || 'this system'} in the future`,
              textVi: `Tôi có ý định sử dụng ${projectData?.title || 'hệ thống này'} trong tương lai`,
              type: QuestionType.LIKERT,
              theoreticalModel: framework.name,
              researchVariable: variable.name,
              construct: variable.construct,
              scale: {
                min: 1,
                max: 7,
                labels: ['Strongly Disagree', 'Disagree', 'Somewhat Disagree', 'Neutral', 'Somewhat Agree', 'Agree', 'Strongly Agree']
              },
              source: 'Ajzen, I. (1991). The theory of planned behavior',
              tags: ['behavior', 'intention'],
              isActive: true,
              version: 1
            });
          }
        });
      });
    }
    
    return templates;
  };

  // Generate survey based on research design
  const generateSurvey = async () => {
    setIsGenerating(true);
    
    try {
      const templates = getQuestionTemplates();
      
      // Group questions by construct
      const questionsByConstruct: { [key: string]: SurveyQuestion[] } = {};
      
      templates.forEach(template => {
        if (!questionsByConstruct[template.construct]) {
          questionsByConstruct[template.construct] = [];
        }
        
        questionsByConstruct[template.construct].push({
          id: template.id,
          text: template.text,
          type: template.type as any,
          variable: template.researchVariable,
          construct: template.construct,
          scale: template.scale,
          required: true
        });
      });
      
      // Flatten questions and add demographics
      const allQuestions: SurveyQuestion[] = [];
      Object.values(questionsByConstruct).forEach(questions => {
        allQuestions.push(...questions);
      });
      
      // Add demographic questions
      allQuestions.push(
        {
          id: 'demo_age',
          text: 'What is your age?',
          type: 'numeric',
          variable: 'Age',
          construct: 'Demographics',
          required: true
        },
        {
          id: 'demo_gender',
          text: 'What is your gender?',
          type: 'multiple_choice',
          variable: 'Gender',
          construct: 'Demographics',
          options: ['Male', 'Female', 'Other', 'Prefer not to say'],
          required: true
        },
        {
          id: 'demo_education',
          text: 'What is your highest level of education?',
          type: 'multiple_choice',
          variable: 'Education',
          construct: 'Demographics',
          options: ['High School', 'Bachelor\'s Degree', 'Master\'s Degree', 'PhD', 'Other'],
          required: true
        }
      );
      
      const survey: GeneratedSurvey = {
        title: campaignConfig.title || `${projectData?.title} Survey`,
        description: campaignConfig.description || `This survey is part of a research study on ${projectData?.title}. Your participation is voluntary and all responses will be kept confidential.`,
        questions: allQuestions,
        estimatedTime: Math.ceil(allQuestions.length * 0.5) // Estimate 30 seconds per question
      };
      
      setGeneratedSurvey(survey);
    } catch (error) {
      console.error('Error generating survey:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  // Handle survey customization
  const updateQuestion = (questionId: string, updates: Partial<SurveyQuestion>) => {
    if (!generatedSurvey) return;
    
    const updatedQuestions = generatedSurvey.questions.map(q =>
      q.id === questionId ? { ...q, ...updates } : q
    );
    
    setGeneratedSurvey({
      ...generatedSurvey,
      questions: updatedQuestions
    });
  };

  const removeQuestion = (questionId: string) => {
    if (!generatedSurvey) return;
    
    const updatedQuestions = generatedSurvey.questions.filter(q => q.id !== questionId);
    setGeneratedSurvey({
      ...generatedSurvey,
      questions: updatedQuestions
    });
  };

  // Handle completion
  const handleComplete = () => {
    const dataCollection: DataCollectionConfig = {
      surveyId: generatedSurvey ? 'generated_survey_' + Date.now() : undefined,
      campaignId: collectionMethod === DataCollectionMethod.INTERNAL_SURVEY ? 'campaign_' + Date.now() : undefined,
      targetSampleSize,
      collectionMethod,
      status
    };
    
    onComplete(dataCollection);
  };

  const isValid = () => {
    if (collectionMethod === DataCollectionMethod.INTERNAL_SURVEY) {
      return generatedSurvey && campaignConfig.title && targetSampleSize > 0;
    }
    return targetSampleSize > 0;
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Data Collection Setup</h2>
        <p className="text-gray-600">Configure your data collection method and create surveys with intelligent question generation</p>
      </div>

      {/* Data Collection Method Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Settings className="h-5 w-5 mr-2" />
            Data Collection Method
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div 
              className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${
                collectionMethod === DataCollectionMethod.INTERNAL_SURVEY 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => setCollectionMethod(DataCollectionMethod.INTERNAL_SURVEY)}
            >
              <div className="flex items-center space-x-3">
                <div className={`w-4 h-4 rounded-full border-2 ${
                  collectionMethod === DataCollectionMethod.INTERNAL_SURVEY 
                    ? 'border-blue-500 bg-blue-500' 
                    : 'border-gray-300'
                }`} />
                <div>
                  <h3 className="font-medium">Internal Survey</h3>
                  <p className="text-sm text-gray-600">Create and distribute surveys through our platform with token rewards</p>
                </div>
              </div>
            </div>
            
            <div 
              className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${
                collectionMethod === DataCollectionMethod.EXTERNAL_DATA 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => setCollectionMethod(DataCollectionMethod.EXTERNAL_DATA)}
            >
              <div className="flex items-center space-x-3">
                <div className={`w-4 h-4 rounded-full border-2 ${
                  collectionMethod === DataCollectionMethod.EXTERNAL_DATA 
                    ? 'border-blue-500 bg-blue-500' 
                    : 'border-gray-300'
                }`} />
                <div>
                  <h3 className="font-medium">External Data</h3>
                  <p className="text-sm text-gray-600">Upload data collected through external surveys or other methods</p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Target Sample Size</label>
            <Input
              type="number"
              value={targetSampleSize}
              onChange={(e) => setTargetSampleSize(parseInt(e.target.value) || 0)}
              placeholder="Enter target sample size..."
              className="max-w-xs"
            />
          </div>
        </CardContent>
      </Card>

      {/* Survey Builder - Only show for internal survey */}
      {collectionMethod === DataCollectionMethod.INTERNAL_SURVEY && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center">
                <Wand2 className="h-5 w-5 mr-2" />
                Intelligent Survey Builder
              </div>
              {!generatedSurvey && (
                <Button 
                  onClick={generateSurvey} 
                  disabled={isGenerating || !researchDesign?.theoreticalFrameworks?.length}
                >
                  {isGenerating ? 'Generating...' : 'Generate Survey'}
                  <Wand2 className="h-4 w-4 ml-2" />
                </Button>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {!researchDesign?.theoreticalFrameworks?.length ? (
              <div className="text-center py-8 text-gray-500">
                <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Complete the research design step first to enable intelligent survey generation</p>
              </div>
            ) : !generatedSurvey ? (
              <div className="text-center py-8 text-gray-500">
                <Wand2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Click "Generate Survey" to automatically create questions based on your research design</p>
                <p className="text-sm mt-2">
                  We'll generate questions for {researchDesign.theoreticalFrameworks.length} framework(s) and {researchDesign.researchVariables.length} variable(s)
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Survey Overview */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-green-800">Survey Generated Successfully!</h4>
                      <p className="text-sm text-green-600 mt-1">
                        Generated {generatedSurvey.questions.length} questions • Estimated time: {generatedSurvey.estimatedTime} minutes
                      </p>
                    </div>
                  </div>
                </div>

                {/* Survey Details */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Survey Title</label>
                    <Input
                      value={generatedSurvey.title}
                      onChange={(e) => setGeneratedSurvey({...generatedSurvey, title: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Estimated Time (minutes)</label>
                    <Input
                      type="number"
                      value={generatedSurvey.estimatedTime}
                      onChange={(e) => setGeneratedSurvey({...generatedSurvey, estimatedTime: parseInt(e.target.value)})}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Survey Description</label>
                  <Textarea
                    value={generatedSurvey.description}
                    onChange={(e) => setGeneratedSurvey({...generatedSurvey, description: e.target.value})}
                    rows={3}
                  />
                </div>

                {/* Questions Preview */}
                <div>
                  <h4 className="font-medium mb-3">Generated Questions ({generatedSurvey.questions.length})</h4>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {generatedSurvey.questions.map((question, index) => (
                      <div key={question.id} className="border rounded-lg p-3 bg-gray-50">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <Badge variant="outline">Q{index + 1}</Badge>
                              <Badge variant={question.type === 'likert' ? 'default' : 'secondary'}>
                                {question.type}
                              </Badge>
                              <Badge variant="outline">{question.construct}</Badge>
                              {question.required && <Badge variant="destructive" className="text-xs">Required</Badge>}
                            </div>
                            <p className="text-sm font-medium mb-1">{question.text}</p>
                            <p className="text-xs text-gray-500">Variable: {question.variable}</p>
                            {question.scale && (
                              <p className="text-xs text-gray-500">
                                Scale: {question.scale.min}-{question.scale.max} ({question.scale.labels[0]} to {question.scale.labels[question.scale.labels.length - 1]})
                              </p>
                            )}
                            {question.options && (
                              <p className="text-xs text-gray-500">
                                Options: {question.options.join(', ')}
                              </p>
                            )}
                          </div>
                          <Button
                            onClick={() => removeQuestion(question.id)}
                            variant="ghost"
                            size="sm"
                          >
                            ×
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Survey Actions */}
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4 mr-2" />
                    Preview Survey
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setGeneratedSurvey(null)}
                  >
                    Regenerate
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Campaign Configuration - Only show for internal survey */}
      {collectionMethod === DataCollectionMethod.INTERNAL_SURVEY && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="h-5 w-5 mr-2" />
              Survey Campaign Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Campaign Title</label>
                <Input
                  value={campaignConfig.title}
                  onChange={(e) => setCampaignConfig({...campaignConfig, title: e.target.value})}
                  placeholder="Enter campaign title..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Duration (days)</label>
                <Input
                  type="number"
                  value={campaignConfig.duration}
                  onChange={(e) => setCampaignConfig({...campaignConfig, duration: parseInt(e.target.value)})}
                  placeholder="30"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Campaign Description</label>
              <Textarea
                value={campaignConfig.description}
                onChange={(e) => setCampaignConfig({...campaignConfig, description: e.target.value})}
                placeholder="Describe the purpose and goals of this survey campaign..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Token Reward per Participant</label>
                <Input
                  type="number"
                  value={campaignConfig.tokenRewardPerParticipant}
                  onChange={(e) => setCampaignConfig({...campaignConfig, tokenRewardPerParticipant: parseInt(e.target.value)})}
                  placeholder="10"
                />
                <p className="text-xs text-gray-500 mt-1">Participants will receive this amount for completing the survey</p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Minimum Age</label>
                <Input
                  type="number"
                  value={campaignConfig.eligibilityCriteria.minAge}
                  onChange={(e) => setCampaignConfig({
                    ...campaignConfig, 
                    eligibilityCriteria: {
                      ...campaignConfig.eligibilityCriteria,
                      minAge: parseInt(e.target.value)
                    }
                  })}
                  placeholder="18"
                />
              </div>
            </div>

            {/* Cost Estimation */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-800 mb-2">Campaign Cost Estimation</h4>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-blue-600">Target Participants:</span>
                  <div className="font-medium">{targetSampleSize}</div>
                </div>
                <div>
                  <span className="text-blue-600">Total Token Cost:</span>
                  <div className="font-medium">{targetSampleSize * campaignConfig.tokenRewardPerParticipant} tokens</div>
                </div>
                <div>
                  <span className="text-blue-600">Admin Fee (5%):</span>
                  <div className="font-medium">{Math.ceil(targetSampleSize * campaignConfig.tokenRewardPerParticipant * 0.05)} tokens</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* External Data Instructions */}
      {collectionMethod === DataCollectionMethod.EXTERNAL_DATA && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Upload className="h-5 w-5 mr-2" />
              External Data Collection
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <Upload className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <h3 className="font-medium mb-2">Ready for External Data</h3>
              <p className="text-gray-600 mb-4">
                You've chosen to collect data externally. After completing project creation, 
                you'll be able to upload your data files in the analysis section.
              </p>
              <div className="text-sm text-gray-500">
                <p>Supported formats: CSV, Excel, SPSS, JSON</p>
                <p>Maximum file size: 100MB</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Navigation */}
      <div className="flex justify-between pt-6">
        <Button onClick={onBack} variant="outline">
          <ArrowRight className="h-4 w-4 mr-2 rotate-180" />
          Back to Research Design
        </Button>
        <div className="space-x-2">
          <Button 
            onClick={handleComplete}
            disabled={!isValid()}
            className="min-w-[120px]"
          >
            Complete Project Setup
            <CheckCircle className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </div>

      {/* Validation Summary */}
      {!isValid() && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="pt-4">
            <h4 className="font-medium text-orange-800 mb-2">Complete the following to finish:</h4>
            <ul className="text-sm text-orange-700 space-y-1">
              {targetSampleSize <= 0 && <li>• Set a target sample size greater than 0</li>}
              {collectionMethod === DataCollectionMethod.INTERNAL_SURVEY && !generatedSurvey && (
                <li>• Generate a survey using the intelligent survey builder</li>
              )}
              {collectionMethod === DataCollectionMethod.INTERNAL_SURVEY && !campaignConfig.title && (
                <li>• Provide a campaign title</li>
              )}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}