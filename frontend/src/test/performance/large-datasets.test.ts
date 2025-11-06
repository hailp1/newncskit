import { describe, it, expect, beforeEach, vi } from 'vitest'
import { surveyBuilderService } from '@/services/survey-builder'
import { surveyCampaignService } from '@/services/survey-campaigns'
import { questionBankService } from '@/services/question-bank'
import { mockQuestionTemplate } from '@/test/mocks/survey-data'
import { setupFetchMock, mockFetchSuccess } from '@/test/mocks/fetch'

// Mock error recovery service
vi.mock('@/services/error-recovery', () => ({
  errorRecoveryService: {
    withRetry: vi.fn((fn) => fn())
  }
}))

describe('Performance Tests for Large Datasets', () => {
  const mockFetch = setupFetchMock()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Survey Builder Performance', () => {
    it('should handle large research designs efficiently', async () => {
      const startTime = performance.now()

      // Create large research design with multiple frameworks and variables
      const largeResearchDesign = {
        theoreticalFrameworks: Array.from({ length: 10 }, (_, i) => ({
          name: `Framework ${i + 1}`,
          description: `Description for framework ${i + 1}`,
          variables: Array.from({ length: 15 }, (_, j) => ({
            name: `Variable ${i + 1}_${j + 1}`,
            construct: `Construct ${Math.floor(j / 3) + 1}`,
            type: 'independent' as const,
            description: `Description for variable ${i + 1}_${j + 1}`
          }))
        })),
        hypotheses: Array.from({ length: 50 }, (_, i) => `H${i + 1}: Hypothesis ${i + 1}`),
        methodology: 'Large-scale quantitative survey research'
      }

      // Mock question bank responses for all variables
      vi.mocked(questionBankService.searchByModelAndVariable).mockResolvedValue({
        questions: Array.from({ length: 3 }, (_, i) => ({
          ...mockQuestionTemplate,
          id: `q_${Date.now()}_${i}`,
          text: `Question ${i + 1} text`
        })),
        total: 3,
        hasMore: false
      })

      const projectContext = {
        title: 'Large Scale Research Project',
        description: 'Performance test for large research design',
        domain: 'Performance Testing'
      }

      const survey = await surveyBuilderService.generateFromResearchDesign(
        largeResearchDesign,
        projectContext,
        { groupByConstruct: true, includeDemographics: true }
      )

      const endTime = performance.now()
      const executionTime = endTime - startTime

      // Performance assertions
      expect(executionTime).toBeLessThan(5000) // Should complete within 5 seconds
      expect(survey.sections.length).toBeGreaterThan(10) // Multiple constructs
      expect(survey.sections.reduce((sum, section) => sum + section.questions.length, 0))
        .toBeGreaterThan(400) // 10 frameworks × 15 variables × 3 questions = 450 questions

      console.log(`Large survey generation completed in ${executionTime.toFixed(2)}ms`)
    })

    it('should validate large surveys efficiently', async () => {
      const startTime = performance.now()

      // Create survey with many sections and questions
      const largeSurvey = {
        id: 'large_survey_test',
        title: 'Large Survey Performance Test',
        description: 'Testing validation performance on large surveys',
        sections: Array.from({ length: 20 }, (_, sectionIndex) => ({
          id: `section_${sectionIndex}`,
          title: `Section ${sectionIndex + 1}`,
          description: `Description for section ${sectionIndex + 1}`,
          order: sectionIndex + 1,
          questions: Array.from({ length: 50 }, (_, questionIndex) => ({
            id: `q_${sectionIndex}_${questionIndex}`,
            text: `Question ${sectionIndex + 1}.${questionIndex + 1}`,
            type: 'likert' as const,
            variable: `Variable_${sectionIndex}_${questionIndex}`,
            construct: `Construct_${Math.floor(questionIndex / 10)}`,
            scale: { min: 1, max: 7, labels: ['Strongly Disagree', 'Strongly Agree'] },
            required: true,
            order: questionIndex + 1
          }))
        })),
        estimatedTime: 120, // 2 hours
        metadata: {
          createdAt: new Date(),
          updatedAt: new Date(),
          version: 1
        },
        settings: {
          allowAnonymous: true,
          requireConsent: true,
          showProgress: true,
          randomizeQuestions: false,
          randomizeSections: false,
          preventMultipleSubmissions: true,
          savePartialResponses: true
        }
      }

      const validation = await surveyBuilderService.validateSurvey(largeSurvey as any)

      const endTime = performance.now()
      const executionTime = endTime - startTime

      // Performance assertions
      expect(executionTime).toBeLessThan(2000) // Should validate within 2 seconds
      expect(validation.isValid).toBe(true)
      expect(validation.suggestions).toContain(
        'Survey is quite long (>20 minutes). Consider reducing questions to improve completion rates.'
      )

      console.log(`Large survey validation completed in ${executionTime.toFixed(2)}ms`)
    })

    it('should generate sample responses for large surveys efficiently', async () => {
      const startTime = performance.now()

      // Create survey with moderate size for sample generation
      const moderateSurvey = {
        id: 'moderate_survey',
        title: 'Moderate Survey for Sample Generation',
        description: 'Testing sample generation performance',
        sections: Array.from({ length: 5 }, (_, sectionIndex) => ({
          id: `section_${sectionIndex}`,
          title: `Section ${sectionIndex + 1}`,
          order: sectionIndex + 1,
          questions: Array.from({ length: 20 }, (_, questionIndex) => ({
            id: `q_${sectionIndex}_${questionIndex}`,
            text: `Question ${sectionIndex + 1}.${questionIndex + 1}`,
            type: ['likert', 'multiple_choice', 'numeric', 'text'][questionIndex % 4] as any,
            variable: `Variable_${sectionIndex}_${questionIndex}`,
            construct: `Construct_${sectionIndex}`,
            scale: { min: 1, max: 7, labels: ['Low', 'High'] },
            options: questionIndex % 4 === 1 ? ['Option A', 'Option B', 'Option C', 'Option D'] : undefined,
            required: true,
            order: questionIndex + 1
          }))
        })),
        estimatedTime: 25,
        metadata: {
          createdAt: new Date(),
          updatedAt: new Date(),
          version: 1
        },
        settings: {
          allowAnonymous: true,
          requireConsent: true,
          showProgress: true,
          randomizeQuestions: false,
          randomizeSections: false,
          preventMultipleSubmissions: true,
          savePartialResponses: true
        }
      }

      const preview = await surveyBuilderService.generatePreview(moderateSurvey as any)

      const endTime = performance.now()
      const executionTime = endTime - startTime

      // Performance assertions
      expect(executionTime).toBeLessThan(1000) // Should generate within 1 second
      expect(preview.sampleResponses).toHaveLength(5)
      expect(preview.sampleResponses[0]).toHaveProperty('q_0_0')
      expect(preview.analysisPreview.variables.length).toBe(100) // 5 sections × 20 questions

      console.log(`Sample generation completed in ${executionTime.toFixed(2)}ms`)
    })
  })

  describe('Campaign Management Performance', () => {
    it('should handle large participant lists efficiently', async () => {
      const startTime = performance.now()

      // Mock large participant list
      const largeParticipantList = Array.from({ length: 10000 }, (_, i) => ({
        userId: `user_${i}`,
        email: `user${i}@example.com`,
        demographics: {
          age: 18 + (i % 50),
          gender: i % 2 === 0 ? 'Male' : 'Female',
          education: ['High School', 'Bachelor', 'Master', 'PhD'][i % 4],
          location: ['Ho Chi Minh City', 'Hanoi', 'Da Nang', 'Can Tho'][i % 4]
        },
        matchScore: 0.7 + (i % 30) / 100 // Scores between 0.7 and 0.99
      }))

      mockFetchSuccess(largeParticipantList)

      const eligibilityCriteria = {
        minAge: 18,
        maxAge: 65,
        requiredDemographics: ['age', 'gender', 'education'],
        excludedGroups: []
      }

      const participants = await surveyCampaignService.getEligibleParticipants(
        eligibilityCriteria,
        5000
      )

      const endTime = performance.now()
      const executionTime = endTime - startTime

      // Performance assertions
      expect(executionTime).toBeLessThan(3000) // Should complete within 3 seconds
      expect(participants.length).toBeLessThanOrEqual(5000) // Respects limit
      expect(participants[0]).toHaveProperty('matchScore')

      console.log(`Large participant list processing completed in ${executionTime.toFixed(2)}ms`)
    })

    it('should calculate analytics for high-volume campaigns efficiently', async () => {
      const startTime = performance.now()

      // Mock high-volume campaign analytics
      const highVolumeAnalytics = {
        campaignId: 'high_volume_campaign',
        totalViews: 50000,
        totalStarts: 35000,
        totalCompletions: 28000,
        completionRate: 0.8,
        averageCompletionTime: 15.5,
        participantDemographics: {
          ageGroups: Object.fromEntries(
            Array.from({ length: 10 }, (_, i) => [
              `${18 + i * 5}-${22 + i * 5}`,
              Math.floor(Math.random() * 5000) + 1000
            ])
          ),
          genderDistribution: {
            'Male': 14000,
            'Female': 13500,
            'Other': 500
          },
          educationLevels: {
            'High School': 8000,
            'Bachelor': 15000,
            'Master': 4500,
            'PhD': 500
          }
        },
        responseQuality: {
          averageResponseLength: 125,
          straightLiningDetected: 280, // 1%
          speedingDetected: 140, // 0.5%
          qualityScore: 0.985
        },
        tokenDistribution: {
          totalTokensAwarded: 420000,
          averageTokensPerParticipant: 15,
          adminFeeCollected: 29400 // 7%
        },
        geographicDistribution: Object.fromEntries(
          Array.from({ length: 20 }, (_, i) => [
            `City_${i + 1}`,
            Math.floor(Math.random() * 3000) + 500
          ])
        ),
        timeSeriesData: Array.from({ length: 30 }, (_, day) => ({
          date: new Date(Date.now() - (29 - day) * 24 * 60 * 60 * 1000),
          participants: Math.floor(Math.random() * 1000) + 500,
          completions: Math.floor(Math.random() * 800) + 400
        }))
      }

      mockFetchSuccess(highVolumeAnalytics)

      const analytics = await surveyCampaignService.getCampaignAnalytics('high_volume_campaign')

      const endTime = performance.now()
      const executionTime = endTime - startTime

      // Performance assertions
      expect(executionTime).toBeLessThan(2000) // Should complete within 2 seconds
      expect(analytics.totalCompletions).toBe(28000)
      expect(analytics.participantDemographics.ageGroups).toBeDefined()
      expect(Object.keys(analytics.geographicDistribution).length).toBe(20)

      console.log(`High-volume analytics processing completed in ${executionTime.toFixed(2)}ms`)
    })

    it('should handle bulk campaign operations efficiently', async () => {
      const startTime = performance.now()

      // Simulate bulk campaign creation
      const bulkCampaigns = Array.from({ length: 100 }, (_, i) => ({
        projectId: `project_${i}`,
        surveyId: `survey_${i}`,
        title: `Bulk Campaign ${i + 1}`,
        description: `Description for bulk campaign ${i + 1}`,
        targetParticipants: 50 + (i % 200),
        tokenRewardPerParticipant: 5 + (i % 20),
        duration: 14 + (i % 60),
        eligibilityCriteria: {
          minAge: 18,
          maxAge: 65,
          requiredDemographics: ['age', 'gender'],
          excludedGroups: []
        }
      }))

      // Mock validation for all campaigns
      const validationPromises = bulkCampaigns.map(async (campaign) => {
        return await surveyCampaignService.validateCampaign(campaign)
      })

      const validationResults = await Promise.all(validationPromises)

      const endTime = performance.now()
      const executionTime = endTime - startTime

      // Performance assertions
      expect(executionTime).toBeLessThan(5000) // Should complete within 5 seconds
      expect(validationResults).toHaveLength(100)
      expect(validationResults.every(result => result.isValid)).toBe(true)

      console.log(`Bulk campaign validation completed in ${executionTime.toFixed(2)}ms`)
    })
  })

  describe('Question Bank Performance', () => {
    it('should search large question databases efficiently', async () => {
      const startTime = performance.now()

      // Mock large question bank search results
      const largeSearchResults = {
        questions: Array.from({ length: 1000 }, (_, i) => ({
          ...mockQuestionTemplate,
          id: `q_large_${i}`,
          text: `Large database question ${i + 1}`,
          theoreticalModel: `Model_${i % 20}`,
          researchVariable: `Variable_${i % 50}`,
          construct: `Construct_${i % 15}`,
          reliability: 0.6 + (i % 40) / 100, // Reliability between 0.6 and 0.99
          tags: [`tag_${i % 10}`, `tag_${(i + 1) % 10}`, `tag_${(i + 2) % 10}`]
        })),
        total: 50000, // Large database
        hasMore: true
      }

      mockFetchSuccess(largeSearchResults)

      const searchFilters = {
        theoreticalModel: 'Technology Acceptance Model',
        reliability: { min: 0.7, max: 1.0 },
        tags: ['usefulness', 'performance']
      }

      const searchOptions = {
        limit: 1000,
        sortBy: 'reliability' as const,
        sortOrder: 'desc' as const
      }

      const results = await questionBankService.search(searchFilters, searchOptions)

      const endTime = performance.now()
      const executionTime = endTime - startTime

      // Performance assertions
      expect(executionTime).toBeLessThan(1500) // Should complete within 1.5 seconds
      expect(results.questions).toHaveLength(1000)
      expect(results.total).toBe(50000)
      expect(results.hasMore).toBe(true)

      console.log(`Large question bank search completed in ${executionTime.toFixed(2)}ms`)
    })

    it('should handle concurrent question generation efficiently', async () => {
      const startTime = performance.now()

      // Mock concurrent research designs
      const concurrentDesigns = Array.from({ length: 20 }, (_, i) => ({
        theoreticalFrameworks: [
          {
            name: `Framework_${i}`,
            variables: Array.from({ length: 10 }, (_, j) => ({
              name: `Variable_${i}_${j}`,
              construct: `Construct_${j % 3}`
            }))
          }
        ],
        projectContext: `Project context ${i}`
      }))

      // Mock question generation responses
      vi.mocked(questionBankService.generateForResearchDesign).mockResolvedValue(
        Array.from({ length: 30 }, (_, i) => ({
          ...mockQuestionTemplate,
          id: `generated_q_${i}`,
          text: `Generated question ${i + 1}`
        }))
      )

      const generationPromises = concurrentDesigns.map(design =>
        questionBankService.generateForResearchDesign(design)
      )

      const generationResults = await Promise.all(generationPromises)

      const endTime = performance.now()
      const executionTime = endTime - startTime

      // Performance assertions
      expect(executionTime).toBeLessThan(3000) // Should complete within 3 seconds
      expect(generationResults).toHaveLength(20)
      expect(generationResults[0]).toHaveLength(30)

      console.log(`Concurrent question generation completed in ${executionTime.toFixed(2)}ms`)
    })
  })

  describe('Memory and Resource Management', () => {
    it('should handle large data structures without memory leaks', async () => {
      const initialMemory = (performance as any).memory?.usedJSHeapSize || 0

      // Create and process large data structures
      const largeDataOperations = Array.from({ length: 10 }, async (_, iteration) => {
        // Generate large survey
        const largeSurvey = {
          id: `memory_test_${iteration}`,
          title: `Memory Test Survey ${iteration}`,
          description: 'Testing memory usage',
          sections: Array.from({ length: 10 }, (_, sectionIndex) => ({
            id: `section_${iteration}_${sectionIndex}`,
            title: `Section ${sectionIndex + 1}`,
            order: sectionIndex + 1,
            questions: Array.from({ length: 100 }, (_, questionIndex) => ({
              id: `q_${iteration}_${sectionIndex}_${questionIndex}`,
              text: `Question ${questionIndex + 1}`,
              type: 'likert' as const,
              variable: `Variable_${questionIndex}`,
              construct: `Construct_${sectionIndex}`,
              scale: { min: 1, max: 7, labels: ['Low', 'High'] },
              required: true,
              order: questionIndex + 1
            }))
          })),
          estimatedTime: 60,
          metadata: {
            createdAt: new Date(),
            updatedAt: new Date(),
            version: 1
          },
          settings: {
            allowAnonymous: true,
            requireConsent: true,
            showProgress: true,
            randomizeQuestions: false,
            randomizeSections: false,
            preventMultipleSubmissions: true,
            savePartialResponses: true
          }
        }

        // Validate survey
        await surveyBuilderService.validateSurvey(largeSurvey as any)

        // Generate preview
        await surveyBuilderService.generatePreview(largeSurvey as any)

        return `Iteration ${iteration} completed`
      })

      await Promise.all(largeDataOperations)

      const finalMemory = (performance as any).memory?.usedJSHeapSize || 0
      const memoryIncrease = finalMemory - initialMemory

      // Memory assertions (if memory API is available)
      if ((performance as any).memory) {
        expect(memoryIncrease).toBeLessThan(100 * 1024 * 1024) // Less than 100MB increase
        console.log(`Memory increase: ${(memoryIncrease / 1024 / 1024).toFixed(2)}MB`)
      }

      console.log('Large data structure operations completed without memory issues')
    })

    it('should handle rapid successive operations efficiently', async () => {
      const startTime = performance.now()

      // Simulate rapid successive API calls
      const rapidOperations = Array.from({ length: 100 }, async (_, i) => {
        const campaignData = {
          title: `Rapid Test Campaign ${i}`,
          targetParticipants: 50,
          tokenRewardPerParticipant: 10,
          duration: 30
        }

        return await surveyCampaignService.validateCampaign(campaignData)
      })

      const results = await Promise.all(rapidOperations)

      const endTime = performance.now()
      const executionTime = endTime - startTime

      // Performance assertions
      expect(executionTime).toBeLessThan(2000) // Should complete within 2 seconds
      expect(results).toHaveLength(100)
      expect(results.every(result => result.isValid)).toBe(true)

      console.log(`Rapid successive operations completed in ${executionTime.toFixed(2)}ms`)
    })
  })

  describe('Stress Testing', () => {
    it('should maintain performance under high load', async () => {
      const startTime = performance.now()

      // Simulate high load scenario
      const highLoadOperations = [
        // Multiple large survey generations
        ...Array.from({ length: 5 }, () => 
          surveyBuilderService.generateFromResearchDesign(
            {
              theoreticalFrameworks: Array.from({ length: 5 }, (_, i) => ({
                name: `Stress_Framework_${i}`,
                description: `Stress test framework ${i}`,
                variables: Array.from({ length: 20 }, (_, j) => ({
                  name: `Stress_Variable_${i}_${j}`,
                  construct: `Stress_Construct_${j % 4}`,
                  type: 'independent' as const,
                  description: `Stress test variable ${i}_${j}`
                }))
              })),
              hypotheses: Array.from({ length: 25 }, (_, i) => `Stress H${i + 1}`),
              methodology: 'Stress test methodology'
            },
            {
              title: 'Stress Test Survey',
              description: 'High load stress test',
              domain: 'Stress Testing'
            }
          )
        ),
        // Multiple campaign validations
        ...Array.from({ length: 50 }, (_, i) =>
          surveyCampaignService.validateCampaign({
            title: `Stress Campaign ${i}`,
            targetParticipants: 100 + i,
            tokenRewardPerParticipant: 10 + (i % 20),
            duration: 30 + (i % 60)
          })
        )
      ]

      // Mock question bank for stress test
      vi.mocked(questionBankService.searchByModelAndVariable).mockResolvedValue({
        questions: Array.from({ length: 2 }, (_, i) => ({
          ...mockQuestionTemplate,
          id: `stress_q_${i}`,
          text: `Stress test question ${i + 1}`
        })),
        total: 2,
        hasMore: false
      })

      const results = await Promise.all(highLoadOperations)

      const endTime = performance.now()
      const executionTime = endTime - startTime

      // Performance assertions
      expect(executionTime).toBeLessThan(10000) // Should complete within 10 seconds
      expect(results).toHaveLength(55) // 5 surveys + 50 validations
      
      // Check survey results
      const surveyResults = results.slice(0, 5)
      surveyResults.forEach(survey => {
        expect(survey).toHaveProperty('title')
        expect(survey).toHaveProperty('sections')
      })

      // Check validation results
      const validationResults = results.slice(5)
      validationResults.forEach(validation => {
        expect(validation).toHaveProperty('isValid')
      })

      console.log(`Stress test completed in ${executionTime.toFixed(2)}ms`)
    })
  })
})