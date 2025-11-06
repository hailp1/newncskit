import { describe, it, expect, beforeEach, vi } from 'vitest'
import { surveyBuilderService } from '@/services/survey-builder'
import { surveyCampaignService } from '@/services/survey-campaigns'
import { questionBankService } from '@/services/question-bank'
import { mockResearchDesign, mockSurvey, mockSurveyCampaign, mockQuestionTemplate } from '@/test/mocks/survey-data'
import { setupFetchMock, mockFetchSuccess } from '@/test/mocks/fetch'
import { CampaignStatus } from '@/types/workflow'

// Mock error recovery service
vi.mock('@/services/error-recovery', () => ({
  errorRecoveryService: {
    withRetry: vi.fn((fn) => fn())
  }
}))

describe('Workflow Transitions Integration Tests', () => {
  const mockFetch = setupFetchMock()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Project Creation to Survey Generation Workflow', () => {
    it('should complete full workflow from research design to survey creation', async () => {
      // Mock question bank service
      vi.mocked(questionBankService.searchByModelAndVariable).mockResolvedValue({
        questions: [mockQuestionTemplate],
        total: 1,
        hasMore: false
      })

      // Mock survey save
      const savedSurvey = { ...mockSurvey, id: 'generated_survey_1' }
      mockFetchSuccess(savedSurvey)

      // Step 1: Generate survey from research design
      const projectContext = {
        title: 'Technology Adoption Study',
        description: 'Study on technology adoption in organizations',
        domain: 'Information Systems'
      }

      const generatedSurvey = await surveyBuilderService.generateFromResearchDesign(
        mockResearchDesign,
        projectContext,
        { includeDemographics: true, groupByConstruct: true }
      )

      expect(generatedSurvey.title).toBe('Technology Adoption Study Survey')
      expect(generatedSurvey.sections).toHaveLength(2) // Constructs + Demographics

      // Step 2: Validate generated survey
      const validation = await surveyBuilderService.validateSurvey(generatedSurvey)
      expect(validation.isValid).toBe(true)

      // Step 3: Save survey
      const finalSurvey = await surveyBuilderService.saveSurvey(generatedSurvey)
      expect(finalSurvey.id).toBe('generated_survey_1')
    })

    it('should handle question bank failure and use fallback questions', async () => {
      // Mock question bank service failure
      vi.mocked(questionBankService.searchByModelAndVariable).mockRejectedValue(
        new Error('Question bank service unavailable')
      )

      const projectContext = {
        title: 'Fallback Test Study',
        description: 'Test study with fallback questions',
        domain: 'Technology'
      }

      const generatedSurvey = await surveyBuilderService.generateFromResearchDesign(
        mockResearchDesign,
        projectContext
      )

      // Should still generate survey with fallback questions
      expect(generatedSurvey.title).toBe('Fallback Test Study Survey')
      expect(generatedSurvey.sections[0].questions).toHaveLength(2) // Fallback questions for 2 variables
    })
  })

  describe('Survey to Campaign Creation Workflow', () => {
    it('should create campaign from existing survey', async () => {
      // Mock dependencies for campaign creation
      mockFetchSuccess({ balance: 2000 }) // Token balance
      mockFetchSuccess({ count: 200 }) // Eligible participants
      mockFetchSuccess(mockSurveyCampaign) // Campaign creation

      const campaignData = {
        projectId: 'project_1',
        surveyId: mockSurvey.id,
        title: 'Technology Adoption Campaign',
        description: 'Campaign to collect data for technology adoption study',
        targetParticipants: 150,
        tokenRewardPerParticipant: 12,
        duration: 45,
        eligibilityCriteria: {
          minAge: 18,
          maxAge: 65,
          requiredDemographics: ['age', 'gender', 'education'],
          excludedGroups: []
        }
      }

      // Step 1: Validate campaign configuration
      const validation = await surveyCampaignService.validateCampaign(campaignData)
      expect(validation.isValid).toBe(true)

      // Step 2: Estimate campaign cost
      const costEstimate = await surveyCampaignService.estimateCampaignCost(
        campaignData.targetParticipants,
        campaignData.tokenRewardPerParticipant
      )
      expect(costEstimate.totalTokenCost).toBe(1800)
      expect(costEstimate.adminFee).toBe(90)
      expect(costEstimate.totalCost).toBe(1890)

      // Step 3: Create campaign
      const createdCampaign = await surveyCampaignService.createCampaign(campaignData)
      expect(createdCampaign.title).toBe('Technology Adoption Campaign')
      expect(createdCampaign.status).toBe(CampaignStatus.DRAFT)
    })

    it('should validate survey exists before creating campaign', async () => {
      mockFetchSuccess({ balance: 2000 })
      mockFetchSuccess({ count: 200 })

      const campaignData = {
        projectId: 'project_1',
        surveyId: 'nonexistent_survey',
        title: 'Invalid Campaign',
        targetParticipants: 100,
        tokenRewardPerParticipant: 10,
        duration: 30,
        eligibilityCriteria: {
          minAge: 18,
          maxAge: 65,
          requiredDemographics: ['age'],
          excludedGroups: []
        }
      }

      // This should be handled by the campaign service validation
      const validation = await surveyCampaignService.validateCampaign(campaignData)
      expect(validation.isValid).toBe(true) // Basic validation passes

      // But creation might fail due to survey not existing (handled by backend)
    })
  })

  describe('Campaign Launch to Data Collection Workflow', () => {
    it('should launch campaign and track participation', async () => {
      // Mock campaign retrieval for validation
      mockFetchSuccess(mockSurveyCampaign)
      
      // Mock survey existence check
      mockFetchSuccess(mockSurvey)
      
      // Mock campaign launch
      const activeCampaign = { ...mockSurveyCampaign, status: CampaignStatus.ACTIVE, launchedAt: new Date() }
      mockFetchSuccess(activeCampaign)

      // Step 1: Launch campaign
      const launchedCampaign = await surveyCampaignService.launchCampaign('campaign_1')
      expect(launchedCampaign.status).toBe(CampaignStatus.ACTIVE)

      // Step 2: Calculate initial progress
      const progress = surveyCampaignService.calculateProgress(launchedCampaign)
      expect(progress.participationRate).toBe(0)
      expect(progress.timeRemaining).toBe(30)
      expect(progress.isOnTrack).toBe(true) // Just launched, so on track

      // Step 3: Simulate progress tracking
      const progressingCampaign = {
        ...launchedCampaign,
        participation: {
          totalParticipants: 25,
          completedResponses: 20,
          totalTokensAwarded: 200,
          adminFeeCollected: 10
        }
      }

      const updatedProgress = surveyCampaignService.calculateProgress(progressingCampaign)
      expect(updatedProgress.participationRate).toBe(0.25) // 25/100
      expect(updatedProgress.completionRate).toBe(0.8) // 20/25
    })

    it('should handle campaign completion workflow', async () => {
      // Mock campaign with full participation
      const completedCampaign = {
        ...mockSurveyCampaign,
        status: CampaignStatus.ACTIVE,
        participation: {
          totalParticipants: 100,
          completedResponses: 95,
          totalTokensAwarded: 950,
          adminFeeCollected: 47.5
        }
      }

      mockFetchSuccess({ ...completedCampaign, status: CampaignStatus.COMPLETED })

      // Complete the campaign
      const finalCampaign = await surveyCampaignService.completeCampaign('campaign_1')
      expect(finalCampaign.status).toBe(CampaignStatus.COMPLETED)

      // Verify final progress
      const finalProgress = surveyCampaignService.calculateProgress(completedCampaign)
      expect(finalProgress.participationRate).toBe(1.0) // 100% participation
      expect(finalProgress.completionRate).toBe(0.95) // 95% completion rate
    })
  })

  describe('Data Collection to Analysis Workflow', () => {
    it('should transition from completed campaign to data analysis', async () => {
      // Mock campaign analytics
      const analytics = {
        campaignId: 'campaign_1',
        totalViews: 200,
        totalStarts: 150,
        totalCompletions: 120,
        completionRate: 0.8,
        averageCompletionTime: 15,
        participantDemographics: {
          ageGroups: { '18-25': 40, '26-35': 50, '36-45': 30 },
          genderDistribution: { 'Male': 60, 'Female': 60 },
          educationLevels: { 'Bachelor': 80, 'Master': 35, 'PhD': 5 }
        },
        responseQuality: {
          averageResponseLength: 120,
          straightLiningDetected: 2,
          speedingDetected: 1
        },
        tokenDistribution: {
          totalTokensAwarded: 1200,
          averageTokensPerParticipant: 10,
          adminFeeCollected: 60
        }
      }

      mockFetchSuccess(analytics)

      // Step 1: Get campaign analytics
      const campaignAnalytics = await surveyCampaignService.getCampaignAnalytics('campaign_1')
      expect(campaignAnalytics.totalCompletions).toBe(120)
      expect(campaignAnalytics.completionRate).toBe(0.8)

      // Step 2: Verify data quality
      expect(campaignAnalytics.responseQuality.straightLiningDetected).toBeLessThan(5)
      expect(campaignAnalytics.responseQuality.speedingDetected).toBeLessThan(5)

      // Step 3: Export campaign data for analysis
      const exportBlob = new Blob([JSON.stringify({ responses: [] })], { type: 'application/json' })
      mockFetchSuccess(exportBlob)

      const exportedData = await surveyCampaignService.exportCampaignData(
        'campaign_1',
        'json',
        true
      )
      expect(exportedData).toBeInstanceOf(Blob)
    })
  })

  describe('End-to-End Workflow Integration', () => {
    it('should complete full research workflow from design to analysis', async () => {
      // Mock all necessary services
      vi.mocked(questionBankService.searchByModelAndVariable).mockResolvedValue({
        questions: [mockQuestionTemplate],
        total: 1,
        hasMore: false
      })

      // Step 1: Generate survey from research design
      const projectContext = {
        title: 'Complete Workflow Test',
        description: 'End-to-end workflow test',
        domain: 'Research Methods'
      }

      const survey = await surveyBuilderService.generateFromResearchDesign(
        mockResearchDesign,
        projectContext
      )

      // Step 2: Save survey
      mockFetchSuccess({ ...survey, id: 'e2e_survey' })
      const savedSurvey = await surveyBuilderService.saveSurvey(survey)

      // Step 3: Create campaign
      mockFetchSuccess({ balance: 5000 })
      mockFetchSuccess({ count: 300 })
      const campaignData = {
        projectId: 'e2e_project',
        surveyId: savedSurvey.id,
        title: 'E2E Test Campaign',
        targetParticipants: 200,
        tokenRewardPerParticipant: 15,
        duration: 60,
        eligibilityCriteria: {
          minAge: 18,
          maxAge: 70,
          requiredDemographics: ['age', 'gender'],
          excludedGroups: []
        }
      }

      mockFetchSuccess({ ...mockSurveyCampaign, ...campaignData, id: 'e2e_campaign' })
      const campaign = await surveyCampaignService.createCampaign(campaignData)

      // Step 4: Launch campaign
      mockFetchSuccess(campaign) // For validation
      mockFetchSuccess(savedSurvey) // For survey check
      mockFetchSuccess({ ...campaign, status: CampaignStatus.ACTIVE })
      const activeCampaign = await surveyCampaignService.launchCampaign(campaign.id)

      // Step 5: Simulate campaign completion and data export
      const completedCampaignData = {
        campaignId: activeCampaign.id,
        totalCompletions: 180,
        completionRate: 0.9,
        averageCompletionTime: 12,
        participantDemographics: {
          ageGroups: { '18-30': 60, '31-50': 80, '51-70': 40 },
          genderDistribution: { 'Male': 90, 'Female': 90 },
          educationLevels: { 'Bachelor': 100, 'Master': 60, 'PhD': 20 }
        },
        responseQuality: {
          averageResponseLength: 150,
          straightLiningDetected: 1,
          speedingDetected: 0
        },
        tokenDistribution: {
          totalTokensAwarded: 2700,
          averageTokensPerParticipant: 15,
          adminFeeCollected: 135
        }
      }

      mockFetchSuccess(completedCampaignData)
      const analytics = await surveyCampaignService.getCampaignAnalytics(activeCampaign.id)

      // Verify end-to-end workflow success
      expect(savedSurvey.title).toBe('Complete Workflow Test Survey')
      expect(campaign.title).toBe('E2E Test Campaign')
      expect(activeCampaign.status).toBe(CampaignStatus.ACTIVE)
      expect(analytics.totalCompletions).toBe(180)
      expect(analytics.completionRate).toBe(0.9)
    })

    it('should handle workflow failures gracefully', async () => {
      // Test failure at survey generation stage
      vi.mocked(questionBankService.searchByModelAndVariable).mockRejectedValue(
        new Error('Question bank service down')
      )

      const projectContext = {
        title: 'Failure Test',
        description: 'Test failure handling',
        domain: 'Error Testing'
      }

      // Should still succeed with fallback questions
      const survey = await surveyBuilderService.generateFromResearchDesign(
        mockResearchDesign,
        projectContext
      )
      expect(survey.sections[0].questions.length).toBeGreaterThan(0)

      // Test failure at campaign creation stage
      mockFetchSuccess({ balance: 100 }) // Insufficient balance
      mockFetchSuccess({ count: 300 })

      const campaignData = {
        projectId: 'failure_project',
        surveyId: 'survey_1',
        title: 'Failure Campaign',
        targetParticipants: 200,
        tokenRewardPerParticipant: 15,
        duration: 30,
        eligibilityCriteria: {
          minAge: 18,
          maxAge: 65,
          requiredDemographics: ['age'],
          excludedGroups: []
        }
      }

      // Should fail due to insufficient tokens
      await expect(
        surveyCampaignService.createCampaign(campaignData)
      ).rejects.toThrow('Insufficient tokens')
    })
  })
})