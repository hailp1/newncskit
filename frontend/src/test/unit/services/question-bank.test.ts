import { describe, it, expect, beforeEach } from 'vitest'
import { questionBankService } from '@/services/question-bank'
import { mockQuestionTemplate } from '@/test/mocks/survey-data'
import { setupFetchMock, mockFetchSuccess, mockFetchError } from '@/test/mocks/fetch'

describe('QuestionBankService', () => {
  const mockFetch = setupFetchMock()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('searchByModelAndVariable', () => {
    it('should search questions by model and variable successfully', async () => {
      const searchResult = {
        questions: [mockQuestionTemplate],
        total: 1,
        hasMore: false
      }
      mockFetchSuccess(searchResult)

      const result = await questionBankService.searchByModelAndVariable(
        'Technology Acceptance Model',
        'Perceived Usefulness',
        { limit: 10, sortBy: 'reliability' }
      )

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/question-bank/search?theoretical_model=Technology%20Acceptance%20Model&research_variable=Perceived%20Usefulness&limit=10&sort_by=reliability')
      )
      expect(result).toEqual(searchResult)
    })

    it('should handle search API error', async () => {
      mockFetchError(500, 'Search service unavailable')

      await expect(
        questionBankService.searchByModelAndVariable('TAM', 'Usefulness')
      ).rejects.toThrow('Failed to search questions')
    })
  })

  describe('getByTheoreticalModel', () => {
    it('should get questions by theoretical model', async () => {
      const searchResult = {
        questions: [mockQuestionTemplate],
        total: 1,
        hasMore: false
      }
      mockFetchSuccess(searchResult)

      const result = await questionBankService.getByTheoreticalModel('TAM')

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/question-bank/by-model?theoretical_model=TAM')
      )
      expect(result).toEqual(searchResult)
    })
  })

  describe('getByConstruct', () => {
    it('should get questions by construct', async () => {
      const searchResult = {
        questions: [mockQuestionTemplate],
        total: 1,
        hasMore: false
      }
      mockFetchSuccess(searchResult)

      const result = await questionBankService.getByConstruct('Behavioral Intention')

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/question-bank/by-construct?construct=Behavioral%20Intention')
      )
      expect(result).toEqual(searchResult)
    })
  })

  describe('search', () => {
    it('should perform advanced search with filters', async () => {
      const searchResult = {
        questions: [mockQuestionTemplate],
        total: 1,
        hasMore: false
      }
      mockFetchSuccess(searchResult)

      const filters = {
        theoreticalModel: 'TAM',
        type: 'likert' as const,
        reliability: { min: 0.7, max: 1.0 },
        tags: ['usefulness', 'performance']
      }

      const options = {
        limit: 20,
        sortBy: 'reliability' as const,
        sortOrder: 'desc' as const
      }

      const result = await questionBankService.search(filters, options)

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/question-bank/search?theoretical_model=TAM&type=likert&tags=usefulness%2Cperformance&reliability_min=0.7&reliability_max=1&limit=20&sort_by=reliability&sort_order=desc')
      )
      expect(result).toEqual(searchResult)
    })

    it('should handle empty filters', async () => {
      const searchResult = {
        questions: [],
        total: 0,
        hasMore: false
      }
      mockFetchSuccess(searchResult)

      const result = await questionBankService.search({})

      expect(result).toEqual(searchResult)
    })
  })

  describe('getById', () => {
    it('should get question by ID successfully', async () => {
      mockFetchSuccess(mockQuestionTemplate)

      const result = await questionBankService.getById('q1')

      expect(mockFetch).toHaveBeenCalledWith('/api/question-bank/q1')
      expect(result).toEqual(mockQuestionTemplate)
    })

    it('should handle question not found', async () => {
      mockFetchError(404, 'Question not found')

      await expect(
        questionBankService.getById('nonexistent')
      ).rejects.toThrow('Failed to get question')
    })
  })

  describe('getTheoreticalModels', () => {
    it('should get all theoretical models', async () => {
      const models = ['Technology Acceptance Model', 'UTAUT', 'Theory of Planned Behavior']
      mockFetchSuccess(models)

      const result = await questionBankService.getTheoreticalModels()

      expect(mockFetch).toHaveBeenCalledWith('/api/question-bank/models')
      expect(result).toEqual(models)
    })
  })

  describe('getResearchVariables', () => {
    it('should get research variables for a model', async () => {
      const variables = ['Perceived Usefulness', 'Perceived Ease of Use', 'Attitude']
      mockFetchSuccess(variables)

      const result = await questionBankService.getResearchVariables('TAM')

      expect(mockFetch).toHaveBeenCalledWith('/api/question-bank/models/TAM/variables')
      expect(result).toEqual(variables)
    })

    it('should handle URL encoding for model names', async () => {
      const variables = ['Social Influence', 'Facilitating Conditions']
      mockFetchSuccess(variables)

      await questionBankService.getResearchVariables('Technology Acceptance Model')

      expect(mockFetch).toHaveBeenCalledWith('/api/question-bank/models/Technology%20Acceptance%20Model/variables')
    })
  })

  describe('getConstructs', () => {
    it('should get constructs for model and variable', async () => {
      const constructs = ['Behavioral Intention', 'Actual Use']
      mockFetchSuccess(constructs)

      const result = await questionBankService.getConstructs('TAM', 'Perceived Usefulness')

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/question-bank/constructs?theoretical_model=TAM&research_variable=Perceived%20Usefulness')
      )
      expect(result).toEqual(constructs)
    })

    it('should get constructs for model only', async () => {
      const constructs = ['Behavioral Intention', 'Attitude', 'Actual Use']
      mockFetchSuccess(constructs)

      const result = await questionBankService.getConstructs('TAM')

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/question-bank/constructs?theoretical_model=TAM')
      )
      expect(result).toEqual(constructs)
    })
  })

  describe('create', () => {
    it('should create new question template', async () => {
      const newQuestion = {
        text: 'New question text',
        type: 'likert' as const,
        theoreticalModel: 'TAM',
        researchVariable: 'Usefulness',
        construct: 'Intention',
        scale: { min: 1, max: 7, labels: ['Disagree', 'Agree'] },
        reliability: 0.8,
        source: 'Test Source',
        tags: ['test'],
        category: 'Technology'
      }

      const createdQuestion = { ...newQuestion, id: 'new_q1', version: 1, isActive: true }
      mockFetchSuccess(createdQuestion)

      const result = await questionBankService.create(newQuestion)

      expect(mockFetch).toHaveBeenCalledWith('/api/question-bank', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newQuestion)
      })
      expect(result).toEqual(createdQuestion)
    })

    it('should handle creation error', async () => {
      mockFetchError(400, 'Invalid question data')

      const newQuestion = {
        text: '',
        type: 'likert' as const,
        theoreticalModel: 'TAM',
        researchVariable: 'Usefulness',
        construct: 'Intention',
        reliability: 0.8,
        source: 'Test Source',
        tags: ['test'],
        category: 'Technology'
      }

      await expect(
        questionBankService.create(newQuestion)
      ).rejects.toThrow('Failed to create question')
    })
  })

  describe('update', () => {
    it('should update question template', async () => {
      const updates = { text: 'Updated question text', reliability: 0.9 }
      const updatedQuestion = { ...mockQuestionTemplate, ...updates }
      mockFetchSuccess(updatedQuestion)

      const result = await questionBankService.update('q1', updates)

      expect(mockFetch).toHaveBeenCalledWith('/api/question-bank/q1', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      })
      expect(result).toEqual(updatedQuestion)
    })
  })

  describe('delete', () => {
    it('should delete question template', async () => {
      mockFetchSuccess({})

      await questionBankService.delete('q1')

      expect(mockFetch).toHaveBeenCalledWith('/api/question-bank/q1', {
        method: 'DELETE'
      })
    })

    it('should handle deletion error', async () => {
      mockFetchError(404, 'Question not found')

      await expect(
        questionBankService.delete('nonexistent')
      ).rejects.toThrow('Failed to delete question')
    })
  })

  describe('getStatistics', () => {
    it('should get question bank statistics', async () => {
      const stats = {
        totalQuestions: 150,
        questionsByModel: { 'TAM': 50, 'UTAUT': 75, 'TPB': 25 },
        questionsByType: { 'likert': 100, 'multiple_choice': 30, 'text': 20 },
        averageReliability: 0.82
      }
      mockFetchSuccess(stats)

      const result = await questionBankService.getStatistics()

      expect(mockFetch).toHaveBeenCalledWith('/api/question-bank/statistics')
      expect(result).toEqual(stats)
    })
  })

  describe('generateForResearchDesign', () => {
    it('should generate questions for research design', async () => {
      const researchDesign = {
        theoreticalFrameworks: [
          {
            name: 'TAM',
            variables: [
              { name: 'Perceived Usefulness', construct: 'Behavioral Intention' },
              { name: 'Perceived Ease of Use', construct: 'Behavioral Intention' }
            ]
          }
        ],
        projectContext: 'E-commerce platform adoption'
      }

      const generatedQuestions = [mockQuestionTemplate]
      mockFetchSuccess(generatedQuestions)

      const result = await questionBankService.generateForResearchDesign(researchDesign)

      expect(mockFetch).toHaveBeenCalledWith('/api/question-bank/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(researchDesign)
      })
      expect(result).toEqual(generatedQuestions)
    })
  })

  describe('validate', () => {
    it('should validate question template successfully', async () => {
      const validation = {
        isValid: true,
        errors: [],
        warnings: []
      }
      mockFetchSuccess(validation)

      const result = await questionBankService.validate(mockQuestionTemplate)

      expect(mockFetch).toHaveBeenCalledWith('/api/question-bank/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mockQuestionTemplate)
      })
      expect(result).toEqual(validation)
    })

    it('should return validation errors for invalid question', async () => {
      const validation = {
        isValid: false,
        errors: ['Question text is required', 'Scale is required for likert questions'],
        warnings: ['Consider adding Vietnamese translation']
      }
      mockFetchSuccess(validation)

      const invalidQuestion = { ...mockQuestionTemplate, text: '', scale: undefined }

      const result = await questionBankService.validate(invalidQuestion)

      expect(result.isValid).toBe(false)
      expect(result.errors).toHaveLength(2)
      expect(result.warnings).toHaveLength(1)
    })
  })

  describe('getSimilar', () => {
    it('should get similar questions', async () => {
      const similarQuestions = [
        { ...mockQuestionTemplate, id: 'q2', text: 'Similar question 1' },
        { ...mockQuestionTemplate, id: 'q3', text: 'Similar question 2' }
      ]
      mockFetchSuccess(similarQuestions)

      const result = await questionBankService.getSimilar('q1', 3)

      expect(mockFetch).toHaveBeenCalledWith('/api/question-bank/q1/similar?limit=3')
      expect(result).toEqual(similarQuestions)
    })

    it('should use default limit when not specified', async () => {
      mockFetchSuccess([])

      await questionBankService.getSimilar('q1')

      expect(mockFetch).toHaveBeenCalledWith('/api/question-bank/q1/similar?limit=5')
    })
  })

  describe('getCategories', () => {
    it('should get all question categories', async () => {
      const categories = ['Technology Acceptance', 'Consumer Behavior', 'Organizational Behavior']
      mockFetchSuccess(categories)

      const result = await questionBankService.getCategories()

      expect(mockFetch).toHaveBeenCalledWith('/api/question-bank/categories')
      expect(result).toEqual(categories)
    })
  })

  describe('getTags', () => {
    it('should get popular tags with default limit', async () => {
      const tags = ['usefulness', 'ease-of-use', 'intention', 'attitude', 'behavior']
      mockFetchSuccess(tags)

      const result = await questionBankService.getTags()

      expect(mockFetch).toHaveBeenCalledWith('/api/question-bank/tags?limit=50')
      expect(result).toEqual(tags)
    })

    it('should get tags with custom limit', async () => {
      const tags = ['usefulness', 'ease-of-use', 'intention']
      mockFetchSuccess(tags)

      const result = await questionBankService.getTags(10)

      expect(mockFetch).toHaveBeenCalledWith('/api/question-bank/tags?limit=10')
      expect(result).toEqual(tags)
    })
  })
})