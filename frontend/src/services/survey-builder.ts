import { ResearchDesign, QuestionTemplate } from '@/types/workflow';
import { questionBankService } from './question-bank';
import { ErrorHandler } from './error-handler';
import { errorRecoveryService, ErrorRecoveryContext } from './error-recovery';

export interface SurveyQuestion {
  id: string;
  text: string;
  textVi?: string;
  type: 'likert' | 'multiple_choice' | 'text' | 'numeric' | 'boolean' | 'rating';
  variable: string;
  construct: string;
  options?: string[];
  scale?: { min: number; max: number; labels: string[] };
  validation?: ValidationRule[];
  required: boolean;
  order: number;
  section?: string;
  helpText?: string;
  templateId?: string; // Reference to original question template
}

export interface ValidationRule {
  type: 'required' | 'minLength' | 'maxLength' | 'pattern' | 'range' | 'custom';
  value?: any;
  message: string;
}

export interface SurveySection {
  id: string;
  title: string;
  description?: string;
  order: number;
  questions: SurveyQuestion[];
}

export interface Survey {
  id: string;
  title: string;
  description: string;
  instructions?: string;
  sections: SurveySection[];
  estimatedTime: number; // in minutes
  metadata: {
    projectId?: string;
    researchDesign?: ResearchDesign;
    createdAt: Date;
    updatedAt: Date;
    version: number;
  };
  settings: {
    allowAnonymous: boolean;
    requireConsent: boolean;
    showProgress: boolean;
    randomizeQuestions: boolean;
    randomizeSections: boolean;
    preventMultipleSubmissions: boolean;
    savePartialResponses: boolean;
  };
}

export interface SurveyGenerationOptions {
  includeInstructions: boolean;
  includeDemographics: boolean;
  randomizeOrder: boolean;
  groupByConstruct: boolean;
  estimatedTimePerQuestion: number; // seconds
  language: 'en' | 'vi' | 'both';
  scaleType: 'likert7' | 'likert5' | 'semantic' | 'mixed';
}

export interface SurveyValidationResult {
  isValid: boolean;
  errors: Array<{
    type: 'error' | 'warning';
    message: string;
    questionId?: string;
    sectionId?: string;
  }>;
  suggestions: Array<{
    type: 'improvement' | 'optimization';
    message: string;
    questionId?: string;
    sectionId?: string;
  }>;
}

export interface SurveyPreview {
  survey: Survey;
  sampleResponses: Array<{ [questionId: string]: any }>;
  analysisPreview: {
    variables: string[];
    constructs: string[];
    reliabilityEstimates: { [construct: string]: number };
  };
}

class SurveyBuilderService {
  private baseUrl = '/api/surveys';

  /**
   * Auto-generate survey from research design
   */
  async generateFromResearchDesign(
    researchDesign: ResearchDesign,
    projectContext: {
      title: string;
      description: string;
      domain: string;
    },
    options: Partial<SurveyGenerationOptions> = {}
  ): Promise<Survey> {
    const context: ErrorRecoveryContext = {
      operation: 'generateFromResearchDesign',
      component: 'survey-builder',
      data: { researchDesign, projectContext, options },
      timestamp: new Date()
    };

    return errorRecoveryService.withRetry(async () => {
      try {
        // Validate research design first
        this.validateResearchDesign(researchDesign);

        const defaultOptions: SurveyGenerationOptions = {
          includeInstructions: true,
          includeDemographics: true,
          randomizeOrder: false,
          groupByConstruct: true,
          estimatedTimePerQuestion: 30,
          language: 'en',
          scaleType: 'likert7'
        };

        const finalOptions = { ...defaultOptions, ...options };

        // Get questions from question bank based on research design
        let questions: SurveyQuestion[] = [];
        try {
          questions = await this.getQuestionsForResearchDesign(researchDesign, finalOptions);
        } catch (questionError) {
          console.warn('Failed to get questions from question bank, using fallback:', questionError);
          // Fallback to basic questions if question bank fails
          questions = this.createFallbackQuestions(researchDesign);
        }

        // Ensure we have at least some questions
        if (questions.length === 0) {
          throw new Error('No questions could be generated for this research design');
        }

        // Group questions by construct if requested
        const sections = finalOptions.groupByConstruct 
          ? this.groupQuestionsByConstruct(questions)
          : [this.createSingleSection('Survey Questions', questions)];

        // Add demographics section if requested
        if (finalOptions.includeDemographics) {
          const demographicsSection = this.createDemographicsSection();
          sections.push(demographicsSection);
        }

        // Create survey object
        const survey: Survey = {
          id: this.generateId(),
          title: `${projectContext.title} Survey`,
          description: `This survey is part of a research study on ${projectContext.title}. ${projectContext.description}`,
          instructions: finalOptions.includeInstructions ? this.generateInstructions(finalOptions) : undefined,
          sections: sections,
          estimatedTime: this.calculateEstimatedTime(sections, finalOptions.estimatedTimePerQuestion),
          metadata: {
            projectId: undefined, // Will be set when associated with project
            researchDesign: researchDesign,
            createdAt: new Date(),
            updatedAt: new Date(),
            version: 1
          },
          settings: {
            allowAnonymous: true,
            requireConsent: true,
            showProgress: true,
            randomizeQuestions: finalOptions.randomizeOrder,
            randomizeSections: false,
            preventMultipleSubmissions: true,
            savePartialResponses: true
          }
        };

        // Validate the generated survey
        const validation = await this.validateSurvey(survey);
        if (!validation.isValid) {
          const criticalErrors = validation.errors.filter(e => e.type === 'error');
          if (criticalErrors.length > 0) {
            throw new Error(`Survey validation failed: ${criticalErrors[0].message}`);
          }
        }

        return survey;
      } catch (error) {
        console.error('Error generating survey from research design:', error);
        
        // Transform error to user-friendly message
        const userError = ErrorHandler.handleSurveyBuilderError(error);
        const enhancedError = new Error(userError.message);
        (enhancedError as any).userMessage = userError;
        
        throw enhancedError;
      }
    }, context, {
      maxAttempts: 2,
      delay: 1000,
      retryCondition: (error) => {
        const errorMessage = error?.message?.toLowerCase() || '';
        return errorMessage.includes('network') || 
               errorMessage.includes('timeout') ||
               errorMessage.includes('question bank');
      }
    });
  }

  /**
   * Customize survey questions
   */
  async customizeSurvey(
    surveyId: string,
    customizations: {
      questions?: Array<{
        id: string;
        updates: Partial<SurveyQuestion>;
      }>;
      sections?: Array<{
        id: string;
        updates: Partial<SurveySection>;
      }>;
      settings?: Partial<Survey['settings']>;
      metadata?: Partial<Survey['metadata']>;
    }
  ): Promise<Survey> {
    const context: ErrorRecoveryContext = {
      operation: 'customizeSurvey',
      component: 'survey-builder',
      data: { surveyId, customizations },
      timestamp: new Date()
    };

    return errorRecoveryService.withRetry(async () => {
      try {
        // Validate customizations before sending
        this.validateCustomizations(customizations);

        const response = await fetch(`${this.baseUrl}/${surveyId}/customize`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(customizations),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || `Failed to customize survey: ${response.statusText}`);
        }

        const updatedSurvey = await response.json();
        
        // Validate the updated survey
        const validation = await this.validateSurvey(updatedSurvey);
        if (!validation.isValid) {
          console.warn('Survey customization resulted in validation issues:', validation.errors);
        }

        return updatedSurvey;
      } catch (error) {
        console.error('Error customizing survey:', error);
        
        const userError = ErrorHandler.handleSurveyBuilderError(error);
        const enhancedError = new Error(userError.message);
        (enhancedError as any).userMessage = userError;
        
        throw enhancedError;
      }
    }, context);
  }

  /**
   * Validate survey structure and content
   */
  async validateSurvey(survey: Survey): Promise<SurveyValidationResult> {
    try {
      const errors: SurveyValidationResult['errors'] = [];
      const suggestions: SurveyValidationResult['suggestions'] = [];

      // Basic validation
      if (!survey.title.trim()) {
        errors.push({ type: 'error', message: 'Survey title is required' });
      }

      if (!survey.description.trim()) {
        errors.push({ type: 'error', message: 'Survey description is required' });
      }

      if (survey.sections.length === 0) {
        errors.push({ type: 'error', message: 'Survey must have at least one section' });
      }

      // Section validation
      survey.sections.forEach(section => {
        if (!section.title.trim()) {
          errors.push({ 
            type: 'error', 
            message: 'Section title is required',
            sectionId: section.id 
          });
        }

        if (section.questions.length === 0) {
          errors.push({ 
            type: 'warning', 
            message: 'Section has no questions',
            sectionId: section.id 
          });
        }

        // Question validation
        section.questions.forEach(question => {
          if (!question.text.trim()) {
            errors.push({ 
              type: 'error', 
              message: 'Question text is required',
              questionId: question.id,
              sectionId: section.id 
            });
          }

          if (question.type === 'multiple_choice' && (!question.options || question.options.length < 2)) {
            errors.push({ 
              type: 'error', 
              message: 'Multiple choice questions must have at least 2 options',
              questionId: question.id,
              sectionId: section.id 
            });
          }

          if (question.type === 'likert' && !question.scale) {
            errors.push({ 
              type: 'error', 
              message: 'Likert questions must have a scale defined',
              questionId: question.id,
              sectionId: section.id 
            });
          }
        });
      });

      // Suggestions for improvement
      if (survey.estimatedTime > 20) {
        suggestions.push({
          type: 'optimization',
          message: 'Survey is quite long (>20 minutes). Consider reducing questions to improve completion rates.'
        });
      }

      const totalQuestions = survey.sections.reduce((sum, section) => sum + section.questions.length, 0);
      if (totalQuestions > 50) {
        suggestions.push({
          type: 'optimization',
          message: 'Survey has many questions (>50). Consider breaking into multiple shorter surveys.'
        });
      }

      return {
        isValid: errors.filter(e => e.type === 'error').length === 0,
        errors,
        suggestions
      };
    } catch (error) {
      console.error('Error validating survey:', error);
      throw error;
    }
  }

  /**
   * Generate survey preview with sample data
   */
  async generatePreview(survey: Survey): Promise<SurveyPreview> {
    try {
      // Generate sample responses
      const sampleResponses = this.generateSampleResponses(survey, 5);

      // Analyze survey structure
      const variables = this.extractVariables(survey);
      const constructs = this.extractConstructs(survey);
      const reliabilityEstimates = this.estimateReliability(survey);

      return {
        survey,
        sampleResponses,
        analysisPreview: {
          variables,
          constructs,
          reliabilityEstimates
        }
      };
    } catch (error) {
      console.error('Error generating survey preview:', error);
      throw error;
    }
  }

  /**
   * Save survey
   */
  async saveSurvey(survey: Survey): Promise<Survey> {
    const context: ErrorRecoveryContext = {
      operation: 'saveSurvey',
      component: 'survey-builder',
      data: { surveyId: survey.id },
      timestamp: new Date()
    };

    return errorRecoveryService.withRetry(async () => {
      try {
        // Validate survey before saving
        const validation = await this.validateSurvey(survey);
        if (!validation.isValid) {
          const criticalErrors = validation.errors.filter(e => e.type === 'error');
          if (criticalErrors.length > 0) {
            throw new Error(`Cannot save invalid survey: ${criticalErrors[0].message}`);
          }
        }

        // Update metadata
        survey.metadata.updatedAt = new Date();

        const response = await fetch(`${this.baseUrl}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(survey),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || `Failed to save survey: ${response.statusText}`);
        }

        return await response.json();
      } catch (error) {
        console.error('Error saving survey:', error);
        
        const userError = ErrorHandler.handleSurveyBuilderError(error);
        const enhancedError = new Error(userError.message);
        (enhancedError as any).userMessage = userError;
        
        throw enhancedError;
      }
    }, context);
  }

  /**
   * Load survey by ID
   */
  async loadSurvey(surveyId: string): Promise<Survey> {
    try {
      const response = await fetch(`${this.baseUrl}/${surveyId}`);
      if (!response.ok) {
        throw new Error(`Failed to load survey: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error loading survey:', error);
      throw error;
    }
  }

  /**
   * Clone survey
   */
  async cloneSurvey(surveyId: string, newTitle?: string): Promise<Survey> {
    try {
      const originalSurvey = await this.loadSurvey(surveyId);
      
      const clonedSurvey: Survey = {
        ...originalSurvey,
        id: this.generateId(),
        title: newTitle || `${originalSurvey.title} (Copy)`,
        metadata: {
          ...originalSurvey.metadata,
          createdAt: new Date(),
          updatedAt: new Date(),
          version: 1
        }
      };

      return await this.saveSurvey(clonedSurvey);
    } catch (error) {
      console.error('Error cloning survey:', error);
      throw error;
    }
  }

  // Private helper methods
  private async getQuestionsForResearchDesign(
    researchDesign: ResearchDesign,
    options: SurveyGenerationOptions
  ): Promise<SurveyQuestion[]> {
    const questions: SurveyQuestion[] = [];
    let order = 1;

    for (const framework of researchDesign.theoreticalFrameworks) {
      for (const variable of framework.variables) {
        try {
          // Get questions from question bank
          const templates = await questionBankService.searchByModelAndVariable(
            framework.name,
            variable.name,
            { limit: 5, sortBy: 'reliability', sortOrder: 'desc' }
          );

          // Convert templates to survey questions
          for (const template of templates.questions) {
            const question: SurveyQuestion = {
              id: this.generateId(),
              text: template.text,
              textVi: template.textVi,
              type: template.type as any,
              variable: variable.name,
              construct: variable.construct,
              options: template.options as string[],
              scale: typeof template.scale === 'object' ? template.scale : undefined,
              required: true,
              order: order++,
              section: variable.construct,
              templateId: template.id
            };

            questions.push(question);
          }
        } catch (error) {
          console.warn(`Could not get questions for ${framework.name} - ${variable.name}:`, error);
        }
      }
    }

    return questions;
  }

  private groupQuestionsByConstruct(questions: SurveyQuestion[]): SurveySection[] {
    const constructGroups: { [construct: string]: SurveyQuestion[] } = {};

    questions.forEach(question => {
      const construct = question.construct || 'General';
      if (!constructGroups[construct]) {
        constructGroups[construct] = [];
      }
      constructGroups[construct].push(question);
    });

    return Object.entries(constructGroups).map(([construct, questions], index) => ({
      id: this.generateId(),
      title: construct,
      description: `Questions measuring ${construct}`,
      order: index + 1,
      questions: questions.sort((a, b) => a.order - b.order)
    }));
  }

  private createSingleSection(title: string, questions: SurveyQuestion[]): SurveySection {
    return {
      id: this.generateId(),
      title,
      description: 'Survey questions',
      order: 1,
      questions: questions.sort((a, b) => a.order - b.order)
    };
  }

  private createDemographicsSection(): SurveySection {
    const demographicQuestions: SurveyQuestion[] = [
      {
        id: this.generateId(),
        text: 'What is your age?',
        type: 'numeric',
        variable: 'Age',
        construct: 'Demographics',
        required: true,
        order: 1,
        validation: [
          { type: 'range', value: { min: 18, max: 100 }, message: 'Age must be between 18 and 100' }
        ]
      },
      {
        id: this.generateId(),
        text: 'What is your gender?',
        type: 'multiple_choice',
        variable: 'Gender',
        construct: 'Demographics',
        options: ['Male', 'Female', 'Other', 'Prefer not to say'],
        required: true,
        order: 2
      },
      {
        id: this.generateId(),
        text: 'What is your highest level of education?',
        type: 'multiple_choice',
        variable: 'Education',
        construct: 'Demographics',
        options: [
          'High School',
          'Bachelor\'s Degree',
          'Master\'s Degree',
          'PhD',
          'Other'
        ],
        required: true,
        order: 3
      },
      {
        id: this.generateId(),
        text: 'What is your current occupation?',
        type: 'text',
        variable: 'Occupation',
        construct: 'Demographics',
        required: false,
        order: 4,
        validation: [
          { type: 'maxLength', value: 100, message: 'Occupation must be less than 100 characters' }
        ]
      }
    ];

    return {
      id: this.generateId(),
      title: 'Demographics',
      description: 'Please provide some basic information about yourself',
      order: 999, // Put demographics at the end
      questions: demographicQuestions
    };
  }

  private generateInstructions(options: SurveyGenerationOptions): string {
    return `
Thank you for participating in this research study. Please read the following instructions carefully:

1. This survey will take approximately ${Math.ceil(options.estimatedTimePerQuestion / 60)} minutes to complete.
2. Please answer all questions honestly and to the best of your ability.
3. There are no right or wrong answers - we are interested in your personal opinions and experiences.
4. Your responses will be kept completely confidential and used only for research purposes.
5. You may skip questions you are not comfortable answering, though we encourage you to answer as many as possible.
6. Please complete the survey in one sitting if possible.

If you have any questions about this research, please contact the research team.

Click "Next" to begin the survey.
    `.trim();
  }

  private calculateEstimatedTime(sections: SurveySection[], timePerQuestion: number): number {
    const totalQuestions = sections.reduce((sum, section) => sum + section.questions.length, 0);
    return Math.ceil((totalQuestions * timePerQuestion) / 60); // Convert to minutes
  }

  private generateSampleResponses(survey: Survey, count: number): Array<{ [questionId: string]: any }> {
    const responses: Array<{ [questionId: string]: any }> = [];

    for (let i = 0; i < count; i++) {
      const response: { [questionId: string]: any } = {};

      survey.sections.forEach(section => {
        section.questions.forEach(question => {
          response[question.id] = this.generateSampleAnswer(question);
        });
      });

      responses.push(response);
    }

    return responses;
  }

  private generateSampleAnswer(question: SurveyQuestion): any {
    switch (question.type) {
      case 'likert':
      case 'rating':
        const scale = question.scale || { min: 1, max: 7 };
        return Math.floor(Math.random() * (scale.max - scale.min + 1)) + scale.min;
      
      case 'multiple_choice':
        const options = question.options || ['Option 1', 'Option 2'];
        return options[Math.floor(Math.random() * options.length)];
      
      case 'boolean':
        return Math.random() > 0.5;
      
      case 'numeric':
        if (question.variable === 'Age') {
          return Math.floor(Math.random() * 50) + 20; // Age between 20-70
        }
        return Math.floor(Math.random() * 100);
      
      case 'text':
        return `Sample response for ${question.variable}`;
      
      default:
        return null;
    }
  }

  private extractVariables(survey: Survey): string[] {
    const variables = new Set<string>();
    survey.sections.forEach(section => {
      section.questions.forEach(question => {
        variables.add(question.variable);
      });
    });
    return Array.from(variables);
  }

  private extractConstructs(survey: Survey): string[] {
    const constructs = new Set<string>();
    survey.sections.forEach(section => {
      section.questions.forEach(question => {
        constructs.add(question.construct);
      });
    });
    return Array.from(constructs);
  }

  private estimateReliability(survey: Survey): { [construct: string]: number } {
    const reliability: { [construct: string]: number } = {};
    
    survey.sections.forEach(section => {
      const constructQuestions = section.questions.filter(q => q.construct === section.title);
      if (constructQuestions.length >= 3) {
        // Estimate Cronbach's alpha based on number of items (simplified)
        const itemCount = constructQuestions.length;
        const estimatedAlpha = (itemCount * 0.3) / (1 + (itemCount - 1) * 0.3);
        reliability[section.title] = Math.min(0.95, Math.max(0.6, estimatedAlpha));
      }
    });

    return reliability;
  }

  private generateId(): string {
    return 'survey_' + Date.now() + '_' + Math.random().toString(36).substring(2, 11);
  }

  // Validation methods
  private validateResearchDesign(researchDesign: ResearchDesign): void {
    if (!researchDesign) {
      throw new Error('Research design is required');
    }

    if (!researchDesign.theoreticalFrameworks || researchDesign.theoreticalFrameworks.length === 0) {
      throw new Error('At least one theoretical framework is required');
    }

    for (const framework of researchDesign.theoreticalFrameworks) {
      if (!framework.name || !framework.variables || framework.variables.length === 0) {
        throw new Error(`Theoretical framework "${framework.name}" must have at least one variable`);
      }
    }
  }

  private validateCustomizations(customizations: any): void {
    if (!customizations) {
      throw new Error('Customizations object is required');
    }

    // Validate question updates
    if (customizations.questions) {
      for (const questionUpdate of customizations.questions) {
        if (!questionUpdate.id) {
          throw new Error('Question ID is required for updates');
        }
        
        if (questionUpdate.updates.type === 'multiple_choice' && 
            questionUpdate.updates.options && 
            questionUpdate.updates.options.length < 2) {
          throw new Error('Multiple choice questions must have at least 2 options');
        }
      }
    }
  }

  // Fallback methods
  private createFallbackQuestions(researchDesign: ResearchDesign): SurveyQuestion[] {
    const questions: SurveyQuestion[] = [];
    let order = 1;

    for (const framework of researchDesign.theoreticalFrameworks) {
      for (const variable of framework.variables) {
        // Create basic Likert scale question for each variable
        const question: SurveyQuestion = {
          id: this.generateId(),
          text: `Please rate your level of agreement with statements about ${variable.name}`,
          type: 'likert',
          variable: variable.name,
          construct: variable.construct,
          scale: { min: 1, max: 7, labels: ['Strongly Disagree', 'Disagree', 'Somewhat Disagree', 'Neutral', 'Somewhat Agree', 'Agree', 'Strongly Agree'] },
          required: true,
          order: order++,
          section: variable.construct,
          helpText: `This question measures ${variable.name} as part of ${variable.construct}`
        };

        questions.push(question);
      }
    }

    return questions;
  }
}

// Create and export a singleton instance
export const surveyBuilderService = new SurveyBuilderService();
export default surveyBuilderService;