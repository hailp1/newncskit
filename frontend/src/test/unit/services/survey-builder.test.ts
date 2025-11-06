import { describe, it, expect, beforeEach, vi } from 'vitest'
import { surveyBuilderService } from '@/services/survey-builder'
import { mockResearchDesign, mockSurvey, mockQuestionTemplate } from '@/test/mocks/survey-data'
import { setupFetchMock, mockFetchSuccess, mockFetchError } from '@/test/mocks/fetch'

// Mock the question bank service
vi.mock('@/services/question-bank', () => ({
  questionBankService: {
    searchByModelAndVariable: vi.fn()
  }
}))

// Mock error recovery service
vi.mock('@/services/error-recovery', () => ({
  errorRecoveryService: {
    withRetry: vi.fn((fn) => fn())
  }
}))

describe('SurveyBuilderService', () => {
  const mockFetch = setupFetchMock()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('generateFromResearchDesign', () => {
    it('should generate survey from research design successfully', async () => {
      const { questionBankService } = await import('@/services/question-bank')
      vi.mocked(questionBankService.searchByModelAndVariable).mockResolvedValue({
        questions: [mockQuestionTemplate],
        total: 1,
        hasMore: false
      })

      const projectContext = {
        title: 'Test Project',
        description: 'Test Description',
        domain: 'Technology'
      }

      const result = await surveyBuilderService.generateFromResearchDesign(
        mockResearchDesign,
        projectContext
      )

      expect(result).toBeDefined()
      expect(result.title).toBe('Test Project Survey')
      expect(result.sections).toHaveLength(2) // One for questions + demographics
      expect(result.sections[0].questions).toHaveLength(2) // Two variables in mock design
      expect(result.estimatedTime).toBeGreaterThan(0)
    })

    it('should handle question bank service failure gracefully', async () => {
      const { questionBankService } = await import('@/services/question-bank')
      vi.mocked(questionBankService.searchByModelAndVariable).mockRejectedValue(
        new Error('Question bank unavailable')
      )

      const projectContext = {
        title: 'Test Project',
        description: 'Test Description', 
        domain: 'Technology'
      }

      const result = await surveyBuilderService.generateFromResearchDesign(
        mockResearchDesign,
        projectContext
      )

      expect(result).toBeDefined()
      expect(result.sections[0].questions).toHaveLength(2) // Fallback questions
    })

    it('should throw error for invalid research design', async () => {
      const invalidDesign = {
        theoreticalFrameworks: [],
        hypotheses: [],
        methodology: ''
      }

      const projectContext = {
        title: 'Test Project',
        description: 'Test Description',
        domain: 'Technology'
      }

      await expect(
        surveyBuilderService.generateFromResearchDesign(invalidDesign, projectContext)
      ).rejects.toThrow('At least one theoretical framework is required')
    })

    it('should include demographics section when requested', async () => {
      const { questionBankService } = await import('@/services/question-bank')
      vi.mocked(questionBankService.searchByModelAndVariable).mockResolvedValue({
        questions: [mockQuestionTemplate],
        total: 1,
        hasMore: false
      })

      const projectContext = {
        title: 'Test Project',
        description: 'Test Description',
        domain: 'Technology'
      }

      const result = await surveyBuilderService.generateFromResearchDesign(
        mockResearchDesign,
        projectContext,
        { includeDemographics: true }
      )

      const demographicsSection = result.sections.find(s => s.title === 'Demographics')
      expect(demographicsSection).toBeDefined()
      expect(demographicsSection?.questions).toHaveLength(4) // Age, Gender, Education, Occupation
    })

    it('should group questions by construct when requested', async () => {
      const { questionBankService } = await import('@/services/question-bank')
      vi.mocked(questionBankService.searchByModelAndVariable).mockResolvedValue({
        questions: [mockQuestionTemplate],
        total: 1,
        hasMore: false
      })

      const projectContext = {
        title: 'Test Project',
        description: 'Test Description',
        domain: 'Technology'
      }

      const result = await surveyBuilderService.generateFromResearchDesign(
        mockResearchDesign,
        projectContext,
        { groupByConstruct: true }
      )

      expect(result.sections).toHaveLength(2) // Behavioral Intention + Demographics
      expect(result.sections[0].title).toBe('Behavioral Intention')
    })
  })

  describe('validateSurvey', () => {
    it('should validate a correct survey successfully', async () => {
      const result = await surveyBuilderService.validateSurvey(mockSurvey)

      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should detect missing title error', async () => {
      const invalidSurvey = { ...mockSurvey, title: '' }

      const result = await surveyBuilderService.validateSurvey(invalidSurvey)

      expect(result.isValid).toBe(false)
      expect(result.errors).toContainEqual({
        type: 'error',
        message: 'Survey title is required'
      })
    })

    it('should detect missing questions in section', async () => {
      const invalidSurvey = {
        ...mockSurvey,
        sections: [{
          ...mockSurvey.sections[0],
          questions: []
        }]
      }

      const result = await surveyBuilderService.validateSurvey(invalidSurvey)

      expect(result.errors).toContainEqual({
        type: 'warning',
        message: 'Section has no questions',
        sectionId: mockSurvey.sections[0].id
      })
    })

    it('should suggest optimization for long surveys', async () => {
      const longSurvey = { ...mockSurvey, estimatedTime: 25 }

      const result = await surveyBuilderService.validateSurvey(longSurvey)

      expect(result.suggestions).toContainEqual({
        type: 'optimization',
        message: 'Survey is quite long (>20 minutes). Consider reducing questions to improve completion rates.'
      })
    })
  })

  describe('customizeSurvey', () => {
    it('should customize survey successfully', async () => {
      const updatedSurvey = { ...mockSurvey, title: 'Updated Survey' }
      mockFetchSuccess(updatedSurvey)

      const customizations = {
        questions: [{
          id: 'q1',
          updates: { text: 'Updated question text' }
        }]
      }

      const result = await surveyBuilderService.customizeSurvey('survey_1', customizations)

      expect(mockFetch).toHaveBeenCalledWith('/api/surveys/survey_1/customize', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(customizations)
      })
      expect(result.title).toBe('Updated Survey')
    })

    it('should handle customization API error', async () => {
      mockFetchError(400, 'Invalid customization')

      const customizations = {
        questions: [{
          id: 'q1',
          updates: { text: 'Updated question text' }
        }]
      }

      await expect(
        surveyBuilderService.customizeSurvey('survey_1', customizations)
      ).rejects.toThrow('Invalid customization')
    })

    it('should validate customizations before sending', async () => {
      const invalidCustomizations = {
        questions: [{
          id: '', // Missing ID
          updates: { text: 'Updated question text' }
        }]
      }

      await expect(
        surveyBuilderService.customizeSurvey('survey_1', invalidCustomizations)
      ).rejects.toThrow('Question ID is required for updates')
    })
  })

  describe('saveSurvey', () => {
    it('should save valid survey successfully', async () => {
      const savedSurvey = { ...mockSurvey, id: 'new_survey_id' }
      mockFetchSuccess(savedSurvey)

      const result = await surveyBuilderService.saveSurvey(mockSurvey)

      expect(mockFetch).toHaveBeenCalledWith('/api/surveys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(expect.objectContaining({
          title: mockSurvey.title,
          description: mockSurvey.description
        }))
      })
      expect(result.id).toBe('new_survey_id')
    })

    it('should reject saving invalid survey', async () => {
      const invalidSurvey = { ...mockSurvey, title: '' }

      await expect(
        surveyBuilderService.saveSurvey(invalidSurvey)
      ).rejects.toThrow('Cannot save invalid survey')
    })

    it('should handle save API error', async () => {
      mockFetchError(500, 'Database error')

      await expect(
        surveyBuilderService.saveSurvey(mockSurvey)
      ).rejects.toThrow('Database error')
    })
  })

  describe('loadSurvey', () => {
    it('should load survey successfully', async () => {
      mockFetchSuccess(mockSurvey)

      const result = await surveyBuilderService.loadSurvey('survey_1')

      expect(mockFetch).toHaveBeenCalledWith('/api/surveys/survey_1')
      expect(result).toEqual(mockSurvey)
    })

    it('should handle load error', async () => {
      mockFetchError(404, 'Survey not found')

      await expect(
        surveyBuilderService.loadSurvey('nonexistent')
      ).rejects.toThrow('Failed to load survey')
    })
  })

  describe('generatePreview', () => {
    it('should generate survey preview with sample data', async () => {
      const result = await surveyBuilderService.generatePreview(mockSurvey)

      expect(result.survey).toEqual(mockSurvey)
      expect(result.sampleResponses).toHaveLength(5)
      expect(result.analysisPreview.variables).toContain('Perceived Usefulness')
      expect(result.analysisPreview.constructs).toContain('Behavioral Intention')
    })

    it('should generate realistic sample responses', async () => {
      const result = await surveyBuilderService.generatePreview(mockSurvey)

      const firstResponse = result.sampleResponses[0]
      expect(firstResponse).toHaveProperty('q1')
      
      // Likert scale response should be within range
      const likertResponse = firstResponse['q1']
      expect(likertResponse).toBeGreaterThanOrEqual(1)
      expect(likertResponse).toBeLessThanOrEqual(7)
    })
  })

  describe('cloneSurvey', () => {
    it('should clone survey with new title', async () => {
      mockFetchSuccess(mockSurvey) // For loadSurvey
      const clonedSurvey = { ...mockSurvey, id: 'cloned_survey', title: 'Cloned Survey' }
      mockFetchSuccess(clonedSurvey) // For saveSurvey

      const result = await surveyBuilderService.cloneSurvey('survey_1', 'Cloned Survey')

      expect(result.title).toBe('Cloned Survey')
      expect(result.id).not.toBe(mockSurvey.id)
      expect(result.metadata.version).toBe(1)
    })

    it('should clone survey with default title', async () => {
      mockFetchSuccess(mockSurvey)
      const clonedSurvey = { ...mockSurvey, id: 'cloned_survey', title: 'Technology Acceptance Survey (Copy)' }
      mockFetchSuccess(clonedSurvey)

      const result = await surveyBuilderService.cloneSurvey('survey_1')

      expect(result.title).toBe('Technology Acceptance Survey (Copy)')
    })
  })
})