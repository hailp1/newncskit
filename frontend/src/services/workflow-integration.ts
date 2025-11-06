import { 
  EnhancedProject, 
  ResearchDesign, 
  DataCollectionConfig, 
  SurveyCampaign,
  Milestone,
  ProjectStage 
} from '@/types/workflow';
import { surveyBuilderService } from './survey-builder';
import { surveyCampaignService } from './survey-campaigns';
import { questionBankService } from './question-bank';
import { progressTrackingService } from './progress-tracking';

export interface WorkflowState {
  currentStep: 'basic' | 'research' | 'data' | 'analysis' | 'results';
  completedSteps: string[];
  project?: EnhancedProject;
  survey?: any;
  campaign?: SurveyCampaign;
  milestones?: Milestone[];
}

export interface WorkflowTransition {
  from: string;
  to: string;
  requirements: string[];
  actions: (() => Promise<void>)[];
}

class WorkflowIntegrationService {
  private baseUrl = '/api/workflow';

  /**
   * Create complete project with integrated workflow
   */
  async createProjectWithWorkflow(
    basicInfo: any,
    researchDesign: ResearchDesign,
    dataCollection: DataCollectionConfig
  ): Promise<{
    project: EnhancedProject;
    survey?: any;
    campaign?: SurveyCampaign;
    milestones: Milestone[];
  }> {
    try {
      // Step 1: Create the project
      const project = await this.createEnhancedProject(basicInfo, researchDesign, dataCollection);

      // Step 2: Generate survey if using internal survey method
      let survey = null;
      let campaign = null;

      if (dataCollection.collectionMethod === 'internal_survey') {
        survey = await this.generateSurveyFromResearchDesign(project.id, researchDesign, basicInfo);
        
        if (dataCollection.campaignId) {
          campaign = await this.createSurveyCampaign(project.id, survey.id, dataCollection);
        }
      }

      // Step 3: Create default milestones
      const milestones = await this.createDefaultMilestones(project.id);

      // Step 4: Initialize progress tracking
      await this.initializeProgressTracking(project.id, milestones);

      return {
        project,
        survey,
        campaign,
        milestones
      };
    } catch (error) {
      console.error('Error creating project with workflow:', error);
      throw error;
    }
  }

  /**
   * Create enhanced project
   */
  private async createEnhancedProject(
    basicInfo: any,
    researchDesign: ResearchDesign,
    dataCollection: DataCollectionConfig
  ): Promise<EnhancedProject> {
    const response = await fetch(`${this.baseUrl}/projects`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...basicInfo,
        research_design: researchDesign,
        data_collection: dataCollection,
        progress_tracking: {
          currentStage: ProjectStage.IDEA_COMPLETE,
          completedMilestones: [],
          timeline: []
        }
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to create project: ${response.statusText}`);
    }

    return await response.json();
  }

  /**
   * Generate survey from research design
   */
  private async generateSurveyFromResearchDesign(
    projectId: string,
    researchDesign: ResearchDesign,
    projectContext: any
  ) {
    try {
      const survey = await surveyBuilderService.generateFromResearchDesign(
        researchDesign,
        {
          title: projectContext.title,
          description: projectContext.description,
          domain: projectContext.domain
        },
        {
          includeInstructions: true,
          includeDemographics: true,
          groupByConstruct: true,
          language: 'en'
        }
      );

      // Associate survey with project
      survey.metadata.projectId = projectId;
      
      return await surveyBuilderService.saveSurvey(survey);
    } catch (error) {
      console.error('Error generating survey:', error);
      throw error;
    }
  }

  /**
   * Create survey campaign
   */
  private async createSurveyCampaign(
    projectId: string,
    surveyId: string,
    dataCollection: DataCollectionConfig
  ): Promise<SurveyCampaign> {
    try {
      return await surveyCampaignService.createCampaign({
        projectId,
        surveyId,
        title: `Data Collection Campaign`,
        description: 'Automated campaign created from project workflow',
        targetParticipants: dataCollection.targetSampleSize,
        tokenRewardPerParticipant: 10, // Default reward
        duration: 30, // Default duration
        eligibilityCriteria: {
          minAge: 18,
          demographics: [],
          experience: []
        }
      });
    } catch (error) {
      console.error('Error creating survey campaign:', error);
      throw error;
    }
  }

  /**
   * Create default milestones for project
   */
  private async createDefaultMilestones(projectId: string): Promise<Milestone[]> {
    try {
      return await progressTrackingService.createMilestonesFromTemplate(
        projectId,
        'research'
      );
    } catch (error) {
      console.error('Error creating default milestones:', error);
      throw error;
    }
  }

  /**
   * Initialize progress tracking
   */
  private async initializeProgressTracking(projectId: string, milestones: Milestone[]): Promise<void> {
    try {
      // Add initial timeline event
      await progressTrackingService.addTimelineEvent(projectId, {
        eventType: 'project_created',
        description: 'Project created with integrated workflow',
        metadata: {},
        data: {
          milestonesCreated: milestones.length,
          workflowType: 'integrated'
        }
      });
    } catch (error) {
      console.error('Error initializing progress tracking:', error);
      throw error;
    }
  }

  /**
   * Connect project creation to survey generation
   */
  async connectProjectToSurvey(
    projectId: string,
    researchDesign: ResearchDesign
  ): Promise<{
    survey: any;
    questions: number;
    constructs: string[];
  }> {
    try {
      // Generate questions from research design
      const questions = await questionBankService.generateForResearchDesign({
        theoreticalFrameworks: researchDesign.theoreticalFrameworks.map(f => ({
          name: f.name,
          variables: f.variables.map(v => ({
            name: v.name,
            construct: v.construct
          }))
        }))
      });

      // Create survey
      const survey = await surveyBuilderService.generateFromResearchDesign(
        researchDesign,
        { title: 'Generated Survey', description: 'Auto-generated from research design', domain: 'Research' }
      );

      const constructs = [...new Set(questions.map(q => q.construct))];

      return {
        survey,
        questions: questions.length,
        constructs
      };
    } catch (error) {
      console.error('Error connecting project to survey:', error);
      throw error;
    }
  }

  /**
   * Link survey campaigns to data collection
   */
  async linkCampaignToDataCollection(
    campaignId: string,
    projectId: string
  ): Promise<{
    campaign: SurveyCampaign;
    dataCollectionStatus: string;
    estimatedCompletion: Date;
  }> {
    try {
      const campaign = await surveyCampaignService.getCampaign(campaignId);
      
      // Update project data collection status
      await this.updateProjectDataCollection(projectId, {
        campaignId,
        status: 'active' as any
      });

      // Estimate completion based on campaign settings
      const estimatedCompletion = new Date();
      estimatedCompletion.setDate(estimatedCompletion.getDate() + campaign.config.duration);

      return {
        campaign,
        dataCollectionStatus: 'active',
        estimatedCompletion
      };
    } catch (error) {
      console.error('Error linking campaign to data collection:', error);
      throw error;
    }
  }

  /**
   * Integrate survey data with analysis pipeline
   */
  async integrateSurveyDataWithAnalysis(
    projectId: string,
    campaignId: string
  ): Promise<{
    dataReady: boolean;
    recordCount: number;
    analysisReady: boolean;
  }> {
    try {
      // Get campaign data
      const campaign = await surveyCampaignService.getCampaign(campaignId);
      const participants = await surveyCampaignService.getCampaignParticipants(campaignId, {
        status: 'completed'
      });

      // Check if we have enough data for analysis
      const dataReady = participants.total >= 30; // Minimum sample size
      const analysisReady = dataReady && campaign.status === 'completed';

      if (analysisReady) {
        // Update project stage
        await this.updateProjectStage(projectId, ProjectStage.DATA_COLLECTION_COMPLETE);
      }

      return {
        dataReady,
        recordCount: participants.total,
        analysisReady
      };
    } catch (error) {
      console.error('Error integrating survey data with analysis:', error);
      throw error;
    }
  }

  /**
   * Test complete workflow from project to publication
   */
  async testCompleteWorkflow(
    basicInfo: any,
    researchDesign: ResearchDesign,
    dataCollection: DataCollectionConfig
  ): Promise<{
    success: boolean;
    steps: Array<{
      step: string;
      status: 'success' | 'error';
      message: string;
      duration: number;
    }>;
    totalDuration: number;
  }> {
    const startTime = Date.now();
    const steps: Array<{
      step: string;
      status: 'success' | 'error';
      message: string;
      duration: number;
    }> = [];

    try {
      // Step 1: Create project
      const stepStart = Date.now();
      const result = await this.createProjectWithWorkflow(basicInfo, researchDesign, dataCollection);
      steps.push({
        step: 'Create Project',
        status: 'success',
        message: `Project created with ID: ${result.project.id}`,
        duration: Date.now() - stepStart
      });

      // Step 2: Validate survey generation
      if (result.survey) {
        const stepStart2 = Date.now();
        const validation = await surveyBuilderService.validateSurvey(result.survey);
        steps.push({
          step: 'Survey Generation',
          status: validation.isValid ? 'success' : 'error',
          message: validation.isValid ? 
            `Survey generated with ${result.survey.sections.length} sections` :
            `Survey validation failed: ${validation.errors.join(', ')}`,
          duration: Date.now() - stepStart2
        });
      }

      // Step 3: Test campaign creation
      if (result.campaign) {
        const stepStart3 = Date.now();
        const campaignValidation = await surveyCampaignService.validateCampaign({
          title: result.campaign.title,
          targetParticipants: result.campaign.config.targetParticipants,
          tokenRewardPerParticipant: result.campaign.config.tokenRewardPerParticipant,
          duration: result.campaign.config.duration
        });
        steps.push({
          step: 'Campaign Creation',
          status: campaignValidation.isValid ? 'success' : 'error',
          message: campaignValidation.isValid ?
            `Campaign created for ${result.campaign.config.targetParticipants} participants` :
            `Campaign validation failed: ${campaignValidation.errors.join(', ')}`,
          duration: Date.now() - stepStart3
        });
      }

      // Step 4: Test milestone creation
      const stepStart4 = Date.now();
      const milestoneValidation = result.milestones.length > 0;
      steps.push({
        step: 'Milestone Creation',
        status: milestoneValidation ? 'success' : 'error',
        message: milestoneValidation ?
          `${result.milestones.length} milestones created` :
          'No milestones were created',
        duration: Date.now() - stepStart4
      });

      // Step 5: Test progress tracking
      const stepStart5 = Date.now();
      const progressMetrics = await progressTrackingService.getProgressMetrics(result.project.id);
      steps.push({
        step: 'Progress Tracking',
        status: 'success',
        message: `Progress tracking initialized with ${progressMetrics.totalMilestones} milestones`,
        duration: Date.now() - stepStart5
      });

      const totalDuration = Date.now() - startTime;
      const success = steps.every(step => step.status === 'success');

      return {
        success,
        steps,
        totalDuration
      };
    } catch (error) {
      steps.push({
        step: 'Workflow Test',
        status: 'error',
        message: `Workflow test failed: ${error}`,
        duration: Date.now() - startTime
      });

      return {
        success: false,
        steps,
        totalDuration: Date.now() - startTime
      };
    }
  }

  /**
   * Get workflow status for a project
   */
  async getWorkflowStatus(projectId: string): Promise<{
    currentStage: ProjectStage;
    completedSteps: string[];
    nextSteps: string[];
    blockers: string[];
    recommendations: string[];
  }> {
    try {
      const response = await fetch(`${this.baseUrl}/projects/${projectId}/status`);
      if (!response.ok) {
        throw new Error(`Failed to get workflow status: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting workflow status:', error);
      throw error;
    }
  }

  /**
   * Update project data collection settings
   */
  private async updateProjectDataCollection(
    projectId: string,
    updates: Partial<DataCollectionConfig>
  ): Promise<void> {
    const response = await fetch(`${this.baseUrl}/projects/${projectId}/data-collection`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      throw new Error(`Failed to update data collection: ${response.statusText}`);
    }
  }

  /**
   * Update project stage
   */
  private async updateProjectStage(projectId: string, stage: ProjectStage): Promise<void> {
    const response = await fetch(`${this.baseUrl}/projects/${projectId}/stage`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ stage }),
    });

    if (!response.ok) {
      throw new Error(`Failed to update project stage: ${response.statusText}`);
    }
  }

  /**
   * Get workflow analytics
   */
  async getWorkflowAnalytics(): Promise<{
    totalProjects: number;
    projectsByStage: { [stage: string]: number };
    averageCompletionTime: number;
    successRate: number;
    commonBottlenecks: Array<{
      stage: string;
      averageStuckTime: number;
      frequency: number;
    }>;
  }> {
    try {
      const response = await fetch(`${this.baseUrl}/analytics`);
      if (!response.ok) {
        throw new Error(`Failed to get workflow analytics: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting workflow analytics:', error);
      throw error;
    }
  }

  /**
   * Validate workflow transition
   */
  async validateTransition(
    projectId: string,
    fromStage: ProjectStage,
    toStage: ProjectStage
  ): Promise<{
    canTransition: boolean;
    requirements: string[];
    missingRequirements: string[];
    warnings: string[];
  }> {
    try {
      const response = await fetch(`${this.baseUrl}/projects/${projectId}/validate-transition`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ fromStage, toStage }),
      });

      if (!response.ok) {
        throw new Error(`Failed to validate transition: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error validating transition:', error);
      throw error;
    }
  }
}

// Create and export a singleton instance
export const workflowIntegrationService = new WorkflowIntegrationService();
export default workflowIntegrationService;