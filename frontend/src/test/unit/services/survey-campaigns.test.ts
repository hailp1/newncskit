import { describe, it, expect, beforeEach, vi } from 'vitest'
import { surveyCampaignService } from '@/services/survey-campaigns'
import { mockSurveyCampaign, mockCampaignAnalytics } from '@/test/mocks/survey-data'
import { setupFetchMock, mockFetchSuccess, mockFetchError } from '@/test/mocks/fetch'
import { CampaignStatus } from '@/types/workflow'

// Mock error recovery service
vi.mock('@/services/error-recovery', () => ({
  errorRecoveryService: {
    withRetry: vi.fn((fn) => fn())
  }
}))

describe('SurveyCampaignService', () => {
  const mockFetch = setupFetchMock()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('createCampaign', () => {
    const campaignData = {
      projectId: 'project_1',
      surveyId: 'survey_1',
      title: 'Test Campaign',
      description: 'Test campaign description',
      targetParticipants: 100,
      tokenRewardPerParticipant: 10,
      duration: 30,
      eligibilityCriteria: {
        minAge: 18,
        maxAge: 65,
        requiredDemographics: ['age', 'gender'],
        excludedGroups: []
      }
    }

    it('should create campaign successfully', async () => {
      // Mock validation dependencies
      mockFetchSuccess({ balance: 2000 }) // Token balance check
      mockFetchSuccess({ count: 150 }) // Eligible participants count
      mockFetchSuccess(mockSurveyCampaign) // Create campaign

      const result = await surveyCampaignService.createCampaign(campaignData)

      expect(result).toEqual(mockSurveyCampaign)
      expect(mockFetch).toHaveBeenCalledWith('/api/survey-campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(campaignData)
      })
    })

    it('should validate campaign data before creation', async () => {
      const invalidData = { ...campaignData, title: '' }

      await expect(
        surveyCampaignService.createCampaign(invalidData)
      ).rejects.toThrow('Campaign validation failed: Campaign title is required')
    })

    it('should check token balance before creation', async () => {
      mockFetchSuccess({ balance: 50 }) // Insufficient balance
      mockFetchSuccess({ count: 150 })

      await expect(
        surveyCampaignService.createCampaign(campaignData)
      ).rejects.toThrow('Insufficient tokens')
    })

    it('should check eligible participants count', async () => {
      mockFetchSuccess({ balance: 2000 })
      mockFetchSuccess({ count: 50 }) // Insufficient participants

      await expect(
        surveyCampaignService.createCampaign(campaignData)
      ).rejects.toThrow('Only 50 eligible participants found, but 100 required')
    })

    it('should handle API errors gracefully', async () => {
      mockFetchSuccess({ balance: 2000 })
      mockFetchSuccess({ count: 150 })
      mockFetchError(400, 'Invalid campaign data')

      await expect(
        surveyCampaignService.createCampaign(campaignData)
      ).rejects.toThrow('Invalid campaign data')
    })
  })

  describe('getCampaign', () => {
    it('should get campaign by ID successfully', async () => {
      mockFetchSuccess(mockSurveyCampaign)

      const result = await surveyCampaignService.getCampaign('campaign_1')

      expect(mockFetch).toHaveBeenCalledWith('/api/survey-campaigns/campaign_1')
      expect(result).toEqual(mockSurveyCampaign)
    })

    it('should handle campaign not found', async () => {
      mockFetchError(404, 'Campaign not found')

      await expect(
        surveyCampaignService.getCampaign('nonexistent')
      ).rejects.toThrow('Failed to get campaign')
    })
  })

  describe('getCampaigns', () => {
    it('should get campaigns with filters and options', async () => {
      const campaignsResponse = {
        campaigns: [mockSurveyCampaign],
        total: 1,
        hasMore: false
      }
      mockFetchSuccess(campaignsResponse)

      const filter = { status: CampaignStatus.ACTIVE }
      const options = { limit: 10, sortBy: 'created_at' as const }

      const result = await surveyCampaignService.getCampaigns(filter, options)

      expect(result).toEqual(campaignsResponse)
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/survey-campaigns?status=active&limit=10&sort_by=created_at')
      )
    })

    it('should handle empty filters and options', async () => {
      const campaignsResponse = {
        campaigns: [],
        total: 0,
        hasMore: false
      }
      mockFetchSuccess(campaignsResponse)

      const result = await surveyCampaignService.getCampaigns()

      expect(result).toEqual(campaignsResponse)
      expect(mockFetch).toHaveBeenCalledWith('/api/survey-campaigns?')
    })
  })

  describe('launchCampaign', () => {
    it('should launch campaign successfully', async () => {
      const activeCampaign = { ...mockSurveyCampaign, status: CampaignStatus.ACTIVE }
      mockFetchSuccess(mockSurveyCampaign) // Get campaign for validation
      mockFetchSuccess(activeCampaign) // Launch campaign

      const result = await surveyCampaignService.launchCampaign('campaign_1')

      expect(mockFetch).toHaveBeenCalledWith('/api/survey-campaigns/campaign_1/launch', {
        method: 'POST'
      })
      expect(result.status).toBe(CampaignStatus.ACTIVE)
    })

    it('should validate campaign before launch', async () => {
      const activeCampaign = { ...mockSurveyCampaign, status: CampaignStatus.ACTIVE }
      mockFetchSuccess(activeCampaign) // Already active campaign

      await expect(
        surveyCampaignService.launchCampaign('campaign_1')
      ).rejects.toThrow('Cannot launch campaign with status: active')
    })

    it('should verify survey exists before launch', async () => {
      mockFetchSuccess(mockSurveyCampaign)
      mockFetchError(404, 'Survey not found') // Survey check fails

      await expect(
        surveyCampaignService.launchCampaign('campaign_1')
      ).rejects.toThrow('Cannot launch campaign: associated survey is not accessible')
    })
  })

  describe('getCampaignAnalytics', () => {
    it('should get campaign analytics successfully', async () => {
      mockFetchSuccess(mockCampaignAnalytics)

      const result = await surveyCampaignService.getCampaignAnalytics('campaign_1')

      expect(mockFetch).toHaveBeenCalledWith('/api/survey-campaigns/campaign_1/analytics')
      expect(result).toEqual(mockCampaignAnalytics)
    })

    it('should handle analytics API error', async () => {
      mockFetchError(500, 'Analytics service unavailable')

      await expect(
        surveyCampaignService.getCampaignAnalytics('campaign_1')
      ).rejects.toThrow('Failed to get campaign analytics')
    })
  })

  describe('validateCampaign', () => {
    it('should validate correct campaign data', async () => {
      const validData = {
        title: 'Valid Campaign',
        targetParticipants: 100,
        tokenRewardPerParticipant: 10,
        duration: 30
      }

      const result = await surveyCampaignService.validateCampaign(validData)

      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should detect validation errors', async () => {
      const invalidData = {
        title: '',
        targetParticipants: 0,
        tokenRewardPerParticipant: -5,
        duration: 0
      }

      const result = await surveyCampaignService.validateCampaign(invalidData)

      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Campaign title is required')
      expect(result.errors).toContain('Target participants must be greater than 0')
      expect(result.errors).toContain('Token reward per participant must be 0 or greater')
      expect(result.errors).toContain('Campaign duration must be greater than 0 days')
    })

    it('should provide warnings for suboptimal settings', async () => {
      const suboptimalData = {
        title: 'Large Campaign',
        targetParticipants: 1500,
        tokenRewardPerParticipant: 2,
        duration: 120
      }

      const result = await surveyCampaignService.validateCampaign(suboptimalData)

      expect(result.warnings).toContain('Large campaigns (>1000 participants) may take longer to complete')
      expect(result.warnings).toContain('Low token rewards may result in poor participation rates')
      expect(result.warnings).toContain('Long campaigns (>90 days) may have lower completion rates')
    })

    it('should provide optimization suggestions', async () => {
      const highRewardData = {
        title: 'High Reward Campaign',
        targetParticipants: 200,
        tokenRewardPerParticipant: 15,
        duration: 30
      }

      const result = await surveyCampaignService.validateCampaign(highRewardData)

      expect(result.suggestions).toContain('Consider adding quality checks for high-reward campaigns')
      expect(result.suggestions).toContain('Consider segmenting large campaigns for better management')
    })
  })

  describe('estimateCampaignCost', () => {
    it('should calculate campaign cost correctly', async () => {
      const result = await surveyCampaignService.estimateCampaignCost(100, 10, 5)

      expect(result.totalTokenCost).toBe(1000)
      expect(result.adminFee).toBe(50)
      expect(result.totalCost).toBe(1050)
      expect(result.estimatedRevenue).toBe(50)
    })

    it('should use default admin fee percentage', async () => {
      const result = await surveyCampaignService.estimateCampaignCost(100, 10)

      expect(result.adminFee).toBe(50) // 5% default
    })

    it('should handle zero participants', async () => {
      const result = await surveyCampaignService.estimateCampaignCost(0, 10)

      expect(result.totalTokenCost).toBe(0)
      expect(result.adminFee).toBe(0)
      expect(result.totalCost).toBe(0)
    })
  })

  describe('calculateProgress', () => {
    it('should calculate campaign progress correctly', () => {
      const campaign = {
        ...mockSurveyCampaign,
        status: CampaignStatus.ACTIVE,
        launchedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // 15 days ago
        participation: {
          totalParticipants: 50,
          completedResponses: 40,
          totalTokensAwarded: 400,
          adminFeeCollected: 20
        }
      }

      const result = surveyCampaignService.calculateProgress(campaign)

      expect(result.participationRate).toBe(0.5) // 50/100
      expect(result.completionRate).toBe(0.8) // 40/50
      expect(result.timeRemaining).toBe(15) // 30 - 15 days
      expect(result.isOnTrack).toBe(true) // 50% participation after 50% time
    })

    it('should handle campaign without launch date', () => {
      const campaign = {
        ...mockSurveyCampaign,
        launchedAt: undefined
      }

      const result = surveyCampaignService.calculateProgress(campaign)

      expect(result.participationRate).toBe(0)
      expect(result.completionRate).toBe(0)
      expect(result.timeRemaining).toBe(30) // Full duration remaining
    })
  })

  describe('getStatusColor', () => {
    it('should return correct colors for each status', () => {
      expect(surveyCampaignService.getStatusColor(CampaignStatus.DRAFT)).toBe('gray')
      expect(surveyCampaignService.getStatusColor(CampaignStatus.ACTIVE)).toBe('green')
      expect(surveyCampaignService.getStatusColor(CampaignStatus.PAUSED)).toBe('yellow')
      expect(surveyCampaignService.getStatusColor(CampaignStatus.COMPLETED)).toBe('blue')
      expect(surveyCampaignService.getStatusColor(CampaignStatus.CANCELLED)).toBe('red')
    })
  })

  describe('formatDuration', () => {
    it('should format durations correctly', () => {
      expect(surveyCampaignService.formatDuration(1)).toBe('1 day')
      expect(surveyCampaignService.formatDuration(5)).toBe('5 days')
      expect(surveyCampaignService.formatDuration(7)).toBe('1 week')
      expect(surveyCampaignService.formatDuration(14)).toBe('2 weeks')
      expect(surveyCampaignService.formatDuration(30)).toBe('1 months')
      expect(surveyCampaignService.formatDuration(365)).toBe('1 years')
    })
  })
})