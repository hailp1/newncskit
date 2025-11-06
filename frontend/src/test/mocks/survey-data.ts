import { ResearchDesign, SurveyCampaign, QuestionTemplate, QuestionType } from '@/types/workflow'
import { CampaignStatus } from '@/types/workflow'

export const mockResearchDesign: ResearchDesign = {
  researchVariables: [],
  theoreticalFrameworks: [
    {
      id: 'framework_1',
      name: 'Technology Acceptance Model',
      description: 'TAM explains user acceptance of technology',
      relationships: [],
      variables: [
        {
          id: 'var_1',
          name: 'Perceived Usefulness',
          construct: 'Behavioral Intention',
          type: 'independent',
          description: 'The degree to which a person believes using technology will enhance performance',
          measurementItems: []
        },
        {
          id: 'var_2',
          name: 'Perceived Ease of Use',
          construct: 'Behavioral Intention', 
          type: 'independent',
          description: 'The degree to which a person believes using technology will be free of effort',
          measurementItems: []
        }
      ]
    }
  ],
  hypotheses: [
    {
      id: 'h1',
      statement: 'H1: Perceived usefulness positively affects intention to use',
      type: 'main',
      variables: ['var_1'],
      expectedDirection: 'positive'
    },
    {
      id: 'h2', 
      statement: 'H2: Perceived ease of use positively affects perceived usefulness',
      type: 'main',
      variables: ['var_2', 'var_1'],
      expectedDirection: 'positive'
    }
  ],
  methodology: 'Quantitative survey research'
}

export const mockQuestionTemplate: QuestionTemplate = {
  id: 'q1',
  text: 'Using this system would improve my job performance',
  textVi: 'Việc sử dụng hệ thống này sẽ cải thiện hiệu suất công việc của tôi',
  type: QuestionType.LIKERT,
  theoreticalModel: 'Technology Acceptance Model',
  researchVariable: 'Perceived Usefulness',
  construct: 'Behavioral Intention',
  scale: {
    min: 1,
    max: 7,
    labels: ['Strongly Disagree', 'Disagree', 'Somewhat Disagree', 'Neutral', 'Somewhat Agree', 'Agree', 'Strongly Agree']
  },
  reliability: 0.85,
  source: 'Davis, F. D. (1989)',
  tags: ['tam', 'usefulness'],
  category: 'Technology Acceptance',
  version: 1,
  isActive: true
}

// Survey mock removed - no Survey interface available

export const mockSurveyCampaign: SurveyCampaign = {
  id: 'campaign_1',
  projectId: 'project_1',
  surveyId: 'survey_1',
  title: 'Technology Acceptance Study',
  description: 'Research campaign for technology acceptance',
  config: {
    targetParticipants: 100,
    tokenRewardPerParticipant: 10,
    duration: 30,
    eligibilityCriteria: {
      minAge: 18,
      maxAge: 65,


    }
  },
  status: CampaignStatus.DRAFT,
  participation: {
    totalParticipants: 0,
    completedResponses: 0,
    totalTokensAwarded: 0,
    adminFeeCollected: 0
  },
  createdAt: new Date('2025-01-01'),

}

export const mockCampaignAnalytics = {
  campaignId: 'campaign_1',
  totalViews: 150,
  totalStarts: 120,
  totalCompletions: 95,
  completionRate: 0.79,
  averageCompletionTime: 12.5,
  participantDemographics: {
    ageGroups: { '18-25': 30, '26-35': 40, '36-45': 25 },
    genderDistribution: { 'Male': 45, 'Female': 50 },
    educationLevels: { 'Bachelor': 60, 'Master': 30, 'PhD': 5 }
  },
  responseQuality: {
    averageResponseLength: 85,
    straightLiningDetected: 3,
    speedingDetected: 2
  },
  tokenDistribution: {
    totalTokensAwarded: 950,
    averageTokensPerParticipant: 10,
    adminFeeCollected: 47.5
  }
}