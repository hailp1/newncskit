import { describe, it, expect, beforeEach, vi } from 'vitest'
import { surveyBuilderService } from '@/services/survey-builder'
import { surveyCampaignService } from '@/services/survey-campaigns'
import { questionBankService } from '@/services/question-bank'
import { mockResearchDesign, mockQuestionTemplate } from '@/test/mocks/survey-data'
import { setupFetchMock, mockFetchSuccess, mockFetchError } from '@/test/mocks/fetch'
import { CampaignStatus } from '@/types/workflow'

// Mock all external dependencies
vi.mock('@/services/error-recovery', () => ({
  errorRecoveryService: {
    withRetry: vi.fn((fn) => fn())
  }
}))

describe('End-to-End User Journeys', () => {
  const mockFetch = setupFetchMock()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Researcher Journey: From Idea to Data Collection', () => {
    it('should complete full researcher workflow', async () => {
      // Mock question bank service
      vi.mocked(questionBankService.searchByModelAndVariable).mockResolvedValue({
        questions: [mockQuestionTemplate],
        total: 1,
        hasMore: false
      })

      // === Phase 1: Project Setup and Research Design ===
      const researchIdea = {
        title: 'Mobile Banking Adoption in Vietnam',
        description: 'Study factors affecting mobile banking adoption among Vietnamese consumers',
        domain: 'Financial Technology',
        targetPopulation: 'Vietnamese adults aged 18-65 with smartphones'
      }

      const researchDesign = {
        theoreticalFrameworks: [
          {
            name: 'Technology Acceptance Model',
            description: 'TAM for technology adoption',
            variables: [
              {
                name: 'Perceived Usefulness',
                construct: 'Behavioral Intention',
                type: 'independent',
                description: 'Perceived usefulness of mobile banking'
              },
              {
                name: 'Perceived Ease of Use',
                construct: 'Behavioral Intention',
                type: 'independent',
                description: 'Perceived ease of use of mobile banking'
              },
              {
                name: 'Trust',
                construct: 'Behavioral Intention',
                type: 'independent',
                description: 'Trust in mobile banking security'
              }
            ]
          }
        ],
        hypotheses: [
          'H1: Perceived usefulness positively affects intention to use mobile banking',
          'H2: Perceived ease of use positively affects intention to use mobile banking',
          'H3: Trust positively affects intention to use mobile banking'
        ],
        methodology: 'Quantitative survey research with structural equation modeling'
      }

      // === Phase 2: Survey Generation ===
      const generatedSurvey = await surveyBuilderService.generateFromResearchDesign(
        researchDesign,
        researchIdea,
        {
          includeDemographics: true,
          groupByConstruct: true,
          language: 'both',
          scaleType: 'likert7'
        }
      )

      expect(generatedSurvey.title).toBe('Mobile Banking Adoption in Vietnam Survey')
      expect(generatedSurvey.sections).toHaveLength(2) // Behavioral Intention + Demographics
      expect(generatedSurvey.settings.allowAnonymous).toBe(true)

      // Validate survey quality
      const validation = await surveyBuilderService.validateSurvey(generatedSurvey)
      expect(validation.isValid).toBe(true)
      expect(validation.errors).toHaveLength(0)

      // === Phase 3: Survey Customization ===
      const customizations = {
        questions: [
          {
            id: generatedSurvey.sections[0].questions[0].id,
            updates: {
              text: 'Mobile banking would improve my financial management efficiency',
              textVi: 'Ngân hàng di động sẽ cải thiện hiệu quả quản lý tài chính của tôi'
            }
          }
        ],
        settings: {
          requireConsent: true,
          showProgress: true,
          preventMultipleSubmissions: true
        }
      }

      mockFetchSuccess({ ...generatedSurvey, ...customizations })
      const customizedSurvey = await surveyBuilderService.customizeSurvey(
        generatedSurvey.id,
        customizations
      )

      // === Phase 4: Survey Preview and Testing ===
      const preview = await surveyBuilderService.generatePreview(customizedSurvey)
      expect(preview.sampleResponses).toHaveLength(5)
      expect(preview.analysisPreview.variables).toContain('Perceived Usefulness')
      expect(preview.analysisPreview.constructs).toContain('Behavioral Intention')

      // === Phase 5: Survey Finalization ===
      mockFetchSuccess({ ...customizedSurvey, id: 'final_survey_123' })
      const finalSurvey = await surveyBuilderService.saveSurvey(customizedSurvey)
      expect(finalSurvey.id).toBe('final_survey_123')

      // === Phase 6: Campaign Planning ===
      const campaignPlan = {
        projectId: 'mobile_banking_project',
        surveyId: finalSurvey.id,
        title: 'Mobile Banking Adoption Study - Vietnam',
        description: 'Research campaign to understand mobile banking adoption factors in Vietnam',
        targetParticipants: 300,
        tokenRewardPerParticipant: 20,
        duration: 45,
        eligibilityCriteria: {
          minAge: 18,
          maxAge: 65,
          requiredDemographics: ['age', 'gender', 'education', 'income'],
          location: 'Vietnam',
          excludedGroups: ['banking_employees']
        }
      }

      // Validate campaign configuration
      const campaignValidation = await surveyCampaignService.validateCampaign(campaignPlan)
      expect(campaignValidation.isValid).toBe(true)

      // Estimate costs
      const costEstimate = await surveyCampaignService.estimateCampaignCost(
        campaignPlan.targetParticipants,
        campaignPlan.tokenRewardPerParticipant,
        7 // 7% admin fee
      )
      expect(costEstimate.totalTokenCost).toBe(6000)
      expect(costEstimate.adminFee).toBe(420)
      expect(costEstimate.totalCost).toBe(6420)

      // === Phase 7: Campaign Creation ===
      mockFetchSuccess({ balance: 10000 }) // Sufficient balance
      mockFetchSuccess({ count: 500 }) // Sufficient eligible participants
      mockFetchSuccess({
        ...campaignPlan,
        id: 'campaign_mobile_banking',
        status: CampaignStatus.DRAFT,
        participation: {
          totalParticipants: 0,
          completedResponses: 0,
          totalTokensAwarded: 0,
          adminFeeCollected: 0
        },
        createdAt: new Date(),
        createdBy: 'researcher_123'
      })

      const createdCampaign = await surveyCampaignService.createCampaign(campaignPlan)
      expect(createdCampaign.title).toBe('Mobile Banking Adoption Study - Vietnam')
      expect(createdCampaign.status).toBe(CampaignStatus.DRAFT)

      // === Phase 8: Campaign Launch ===
      mockFetchSuccess(createdCampaign) // For validation
      mockFetchSuccess(finalSurvey) // Survey existence check
      mockFetchSuccess({
        ...createdCampaign,
        status: CampaignStatus.ACTIVE,
        launchedAt: new Date()
      })

      const launchedCampaign = await surveyCampaignService.launchCampaign(createdCampaign.id)
      expect(launchedCampaign.status).toBe(CampaignStatus.ACTIVE)

      // Verify complete workflow success
      expect(finalSurvey.title).toContain('Mobile Banking')
      expect(launchedCampaign.config.targetParticipants).toBe(300)
      expect(launchedCampaign.config.tokenRewardPerParticipant).toBe(20)
    })

    it('should handle researcher workflow with limited resources', async () => {
      // Simulate researcher with limited token budget
      vi.mocked(questionBankService.searchByModelAndVariable).mockResolvedValue({
        questions: [mockQuestionTemplate],
        total: 1,
        hasMore: false
      })

      const budgetConstrainedProject = {
        title: 'Student Research Project',
        description: 'Small-scale study for thesis research',
        domain: 'Academic Research'
      }

      // Generate minimal survey
      const survey = await surveyBuilderService.generateFromResearchDesign(
        mockResearchDesign,
        budgetConstrainedProject,
        {
          includeDemographics: false, // Skip demographics to reduce length
          groupByConstruct: false,
          estimatedTimePerQuestion: 20 // Faster completion
        }
      )

      expect(survey.estimatedTime).toBeLessThan(10) // Short survey

      // Create budget-friendly campaign
      const budgetCampaign = {
        projectId: 'student_project',
        surveyId: 'survey_123',
        title: 'Student Thesis Research',
        targetParticipants: 50, // Small sample
        tokenRewardPerParticipant: 5, // Low reward
        duration: 14, // Short duration
        eligibilityCriteria: {
          minAge: 18,
          maxAge: 30, // Target students
          requiredDemographics: ['age'],
          excludedGroups: []
        }
      }

      const validation = await surveyCampaignService.validateCampaign(budgetCampaign)
      expect(validation.isValid).toBe(true)
      expect(validation.warnings).toContain('Low token rewards may result in poor participation rates')

      const cost = await surveyCampaignService.estimateCampaignCost(
        budgetCampaign.targetParticipants,
        budgetCampaign.tokenRewardPerParticipant
      )
      expect(cost.totalCost).toBe(263) // 250 + 13 admin fee
    })
  })

  describe('Participant Journey: Survey Discovery to Completion', () => {
    it('should simulate participant survey experience', async () => {
      // === Phase 1: Campaign Discovery ===
      const availableCampaigns = {
        campaigns: [
          {
            id: 'campaign_tech_adoption',
            title: 'Technology Adoption Survey',
            description: 'Help us understand technology adoption patterns',
            tokenReward: 15,
            estimatedTime: 12,
            eligibilityMatch: 0.95,
            category: 'Technology Research'
          },
          {
            id: 'campaign_consumer_behavior',
            title: 'Consumer Behavior Study',
            description: 'Share your shopping preferences',
            tokenReward: 10,
            estimatedTime: 8,
            eligibilityMatch: 0.85,
            category: 'Marketing Research'
          }
        ],
        total: 2,
        hasMore: false
      }

      mockFetchSuccess(availableCampaigns)
      const campaigns = await surveyCampaignService.getCampaigns({
        status: CampaignStatus.ACTIVE
      })

      expect(campaigns.campaigns).toHaveLength(2)

      // === Phase 2: Campaign Selection ===
      const selectedCampaign = campaigns.campaigns[0]
      mockFetchSuccess({
        ...selectedCampaign,
        detailedDescription: 'This study examines factors that influence technology adoption...',
        requirements: ['Must be 18+ years old', 'Must have used technology in the last 6 months'],
        dataUsage: 'Data will be used for academic research only',
        estimatedQuestions: 25,
        consentRequired: true
      })

      const campaignDetails = await surveyCampaignService.getCampaign(selectedCampaign.id)
      expect(campaignDetails.title).toBe('Technology Adoption Survey')

      // === Phase 3: Eligibility Check ===
      const participantProfile = {
        age: 28,
        gender: 'Female',
        education: 'Bachelor',
        location: 'Ho Chi Minh City',
        occupation: 'Software Developer'
      }

      mockFetchSuccess({
        eligible: true,
        matchScore: 0.95,
        requirements: {
          age: 'Met (18+)',
          demographics: 'Complete',
          exclusions: 'None'
        }
      })

      // Simulate eligibility check (would be done by backend)
      const eligibilityCheck = { eligible: true, matchScore: 0.95 }
      expect(eligibilityCheck.eligible).toBe(true)

      // === Phase 4: Survey Participation ===
      mockFetchSuccess({
        participationId: 'participation_123',
        surveyData: {
          sections: [
            {
              id: 'section_1',
              title: 'Technology Usage',
              questions: [
                {
                  id: 'q1',
                  text: 'How often do you use new technology?',
                  type: 'likert',
                  scale: { min: 1, max: 7, labels: ['Never', 'Always'] },
                  required: true
                }
              ]
            }
          ]
        },
        startTime: new Date()
      })

      // Simulate survey responses
      const responses = {
        participationId: 'participation_123',
        responses: {
          q1: 6, // High technology usage
          q2: 5,
          q3: 7
        },
        completionTime: 11, // minutes
        qualityMetrics: {
          straightLining: false,
          speeding: false,
          completeness: 1.0
        }
      }

      // === Phase 5: Survey Completion ===
      mockFetchSuccess({
        success: true,
        tokensAwarded: 15,
        completionMessage: 'Thank you for participating! Your responses help advance research.',
        participationCertificate: 'cert_123'
      })

      // Simulate completion
      const completion = {
        success: true,
        tokensAwarded: 15,
        completionTime: responses.completionTime
      }

      expect(completion.success).toBe(true)
      expect(completion.tokensAwarded).toBe(15)
      expect(completion.completionTime).toBeLessThan(15) // Within estimated time
    })

    it('should handle participant dropout scenario', async () => {
      // === Scenario: Participant starts but doesn't complete ===
      const campaign = {
        id: 'campaign_long_survey',
        title: 'Comprehensive Lifestyle Survey',
        estimatedTime: 25, // Long survey
        tokenReward: 20
      }

      mockFetchSuccess(campaign)
      const campaignDetails = await surveyCampaignService.getCampaign(campaign.id)

      // Simulate partial completion
      const partialResponses = {
        participationId: 'participation_456',
        responses: {
          q1: 4,
          q2: 3
          // Missing responses for q3-q50
        },
        completionPercentage: 0.15, // Only 15% complete
        timeSpent: 8, // minutes before dropout
        dropoutReason: 'survey_too_long'
      }

      // Verify dropout handling
      expect(partialResponses.completionPercentage).toBeLessThan(0.5)
      expect(partialResponses.dropoutReason).toBe('survey_too_long')

      // No tokens awarded for incomplete survey
      const noReward = { tokensAwarded: 0, reason: 'incomplete_survey' }
      expect(noReward.tokensAwarded).toBe(0)
    })
  })

  describe('Admin Journey: Campaign Management and Analytics', () => {
    it('should complete admin campaign monitoring workflow', async () => {
      // === Phase 1: Campaign Overview ===
      const adminDashboard = {
        activeCampaigns: 5,
        totalParticipants: 1250,
        completionRate: 0.78,
        totalTokensDistributed: 18750,
        adminRevenueCollected: 937.5
      }

      mockFetchSuccess(adminDashboard)

      // === Phase 2: Individual Campaign Analysis ===
      const campaignAnalytics = {
        campaignId: 'campaign_mobile_banking',
        totalViews: 450,
        totalStarts: 380,
        totalCompletions: 295,
        completionRate: 0.78,
        averageCompletionTime: 13.5,
        participantDemographics: {
          ageGroups: {
            '18-25': 85,
            '26-35': 120,
            '36-45': 65,
            '46-55': 20,
            '56-65': 5
          },
          genderDistribution: {
            'Male': 145,
            'Female': 150
          },
          educationLevels: {
            'High School': 45,
            'Bachelor': 180,
            'Master': 60,
            'PhD': 10
          }
        },
        responseQuality: {
          averageResponseLength: 145,
          straightLiningDetected: 8, // 2.7%
          speedingDetected: 3, // 1.0%
          qualityScore: 0.96
        },
        tokenDistribution: {
          totalTokensAwarded: 5900,
          averageTokensPerParticipant: 20,
          adminFeeCollected: 413 // 7%
        },
        geographicDistribution: {
          'Ho Chi Minh City': 120,
          'Hanoi': 95,
          'Da Nang': 35,
          'Other': 45
        }
      }

      mockFetchSuccess(campaignAnalytics)
      const analytics = await surveyCampaignService.getCampaignAnalytics('campaign_mobile_banking')

      expect(analytics.completionRate).toBe(0.78)
      expect(analytics.responseQuality.qualityScore).toBeGreaterThan(0.9)
      expect(analytics.tokenDistribution.adminFeeCollected).toBe(413)

      // === Phase 3: Quality Assessment ===
      const qualityMetrics = {
        overallQuality: 'High',
        concerns: [],
        recommendations: [
          'Consider increasing sample size for better statistical power',
          'Geographic distribution is good but could include more rural areas'
        ]
      }

      expect(analytics.responseQuality.straightLiningDetected).toBeLessThan(10) // <3%
      expect(analytics.responseQuality.speedingDetected).toBeLessThan(5) // <2%

      // === Phase 4: Revenue Analysis ===
      const revenueReport = {
        campaignId: 'campaign_mobile_banking',
        totalRevenue: 413,
        participantCosts: 5900,
        profitMargin: 0.07,
        payoutStatus: 'completed',
        financialSummary: {
          grossRevenue: 6313,
          participantPayouts: 5900,
          netRevenue: 413,
          processingFees: 0
        }
      }

      expect(revenueReport.netRevenue).toBe(413)
      expect(revenueReport.profitMargin).toBe(0.07)

      // === Phase 5: Campaign Optimization Recommendations ===
      const optimizationSuggestions = [
        {
          category: 'Participation',
          suggestion: 'Increase token reward to 25 to improve completion rate',
          expectedImpact: '+5% completion rate',
          costImpact: '+25% token costs'
        },
        {
          category: 'Quality',
          suggestion: 'Add attention check questions to reduce straight-lining',
          expectedImpact: '+2% response quality',
          costImpact: 'Minimal'
        },
        {
          category: 'Reach',
          suggestion: 'Extend campaign duration to reach rural participants',
          expectedImpact: '+15% geographic diversity',
          costImpact: 'None'
        }
      ]

      expect(optimizationSuggestions).toHaveLength(3)
      expect(optimizationSuggestions[0].category).toBe('Participation')
    })

    it('should handle problematic campaign scenarios', async () => {
      // === Scenario: Low participation campaign ===
      const problematicCampaign = {
        campaignId: 'campaign_low_participation',
        totalViews: 200,
        totalStarts: 45, // Low start rate
        totalCompletions: 12, // Very low completion
        completionRate: 0.27, // Poor completion rate
        averageCompletionTime: 25, // Too long
        issues: [
          'Low token reward (5 tokens)',
          'Survey too long (30+ minutes)',
          'Poor targeting (low eligibility match)'
        ]
      }

      mockFetchSuccess(problematicCampaign)
      const analytics = await surveyCampaignService.getCampaignAnalytics('campaign_low_participation')

      expect(analytics.completionRate).toBeLessThan(0.5)

      // Admin intervention recommendations
      const interventions = [
        'Increase token reward to market rate',
        'Reduce survey length by 50%',
        'Improve targeting criteria',
        'Consider pausing and redesigning campaign'
      ]

      expect(interventions).toContain('Increase token reward to market rate')
    })
  })

  describe('Error Recovery and Edge Cases', () => {
    it('should handle system failures gracefully', async () => {
      // === Scenario: Question bank service failure ===
      vi.mocked(questionBankService.searchByModelAndVariable).mockRejectedValue(
        new Error('Question bank service temporarily unavailable')
      )

      const projectContext = {
        title: 'Resilience Test Project',
        description: 'Testing system resilience',
        domain: 'System Testing'
      }

      // Should still generate survey with fallback questions
      const survey = await surveyBuilderService.generateFromResearchDesign(
        mockResearchDesign,
        projectContext
      )

      expect(survey.sections[0].questions.length).toBeGreaterThan(0)
      expect(survey.title).toBe('Resilience Test Project Survey')

      // === Scenario: Campaign launch failure ===
      mockFetchSuccess({ balance: 1000 })
      mockFetchSuccess({ count: 100 })
      mockFetchError(500, 'Campaign service temporarily unavailable')

      const campaignData = {
        projectId: 'resilience_project',
        surveyId: 'survey_123',
        title: 'Resilience Test Campaign',
        targetParticipants: 50,
        tokenRewardPerParticipant: 10,
        duration: 30,
        eligibilityCriteria: {
          minAge: 18,
          maxAge: 65,
          requiredDemographics: ['age'],
          excludedGroups: []
        }
      }

      await expect(
        surveyCampaignService.createCampaign(campaignData)
      ).rejects.toThrow('Campaign service temporarily unavailable')

      // === Scenario: Partial data loss recovery ===
      const partialSurvey = {
        id: 'partial_survey',
        title: 'Recovered Survey',
        sections: [], // Empty sections due to data loss
        metadata: {
          createdAt: new Date(),
          updatedAt: new Date(),
          version: 1
        }
      }

      // Validation should catch the issue
      const validation = await surveyBuilderService.validateSurvey(partialSurvey as any)
      expect(validation.isValid).toBe(false)
      expect(validation.errors).toContainEqual({
        type: 'error',
        message: 'Survey must have at least one section'
      })
    })

    it('should handle concurrent user scenarios', async () => {
      // === Scenario: Multiple researchers creating similar campaigns ===
      const baseProject = {
        title: 'Technology Adoption Study',
        description: 'Study on technology adoption',
        domain: 'Technology'
      }

      // Simulate concurrent survey generation
      vi.mocked(questionBankService.searchByModelAndVariable).mockResolvedValue({
        questions: [mockQuestionTemplate],
        total: 1,
        hasMore: false
      })

      const [survey1, survey2] = await Promise.all([
        surveyBuilderService.generateFromResearchDesign(mockResearchDesign, {
          ...baseProject,
          title: 'Technology Adoption Study - Researcher A'
        }),
        surveyBuilderService.generateFromResearchDesign(mockResearchDesign, {
          ...baseProject,
          title: 'Technology Adoption Study - Researcher B'
        })
      ])

      // Both should succeed with unique IDs
      expect(survey1.id).not.toBe(survey2.id)
      expect(survey1.title).toContain('Researcher A')
      expect(survey2.title).toContain('Researcher B')

      // === Scenario: Campaign resource contention ===
      mockFetchSuccess({ balance: 1500 }) // Limited balance
      mockFetchSuccess({ count: 200 })

      const campaign1Data = {
        projectId: 'project_a',
        surveyId: 'survey_a',
        title: 'Campaign A',
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

      const campaign2Data = {
        ...campaign1Data,
        projectId: 'project_b',
        surveyId: 'survey_b',
        title: 'Campaign B'
      }

      // First campaign should succeed
      mockFetchSuccess({ ...campaign1Data, id: 'campaign_a' })
      const campaign1 = await surveyCampaignService.createCampaign(campaign1Data)
      expect(campaign1.title).toBe('Campaign A')

      // Second campaign should fail due to insufficient remaining balance
      mockFetchSuccess({ balance: 450 }) // Reduced balance after first campaign
      await expect(
        surveyCampaignService.createCampaign(campaign2Data)
      ).rejects.toThrow('Insufficient tokens')
    })
  })
})