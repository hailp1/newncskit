import { apiClient } from './api-client'

export interface Campaign {
  id: string
  title: string
  description: string
  status: string
  category?: string
  startDate: string
  endDate: string
  targetResponses: number
  currentResponses: number
  completionRate: number
  createdAt: string
  updatedAt: string
  rewards?: {
    amount: number
  }
}

export interface CampaignStats {
  total: number
  active: number
  completed: number
  draft: number
  totalResponses: number
  totalRevenue: number
}

export class CampaignService {
  async getCampaigns(): Promise<Campaign[]> {
    try {
      const response = await apiClient.get('/api/surveys/campaigns/')
      return response.data.results || response.data || []
    } catch (error) {
      console.error('Error fetching campaigns:', error)
      return []
    }
  }

  async getCampaignStats(): Promise<CampaignStats> {
    try {
      const response = await apiClient.get('/api/surveys/stats/overview/')
      return response.data
    } catch (error) {
      console.error('Error fetching campaign stats:', error)
      return {
        total: 0,
        active: 0,
        completed: 0,
        draft: 0,
        totalResponses: 0,
        totalRevenue: 0
      }
    }
  }

  async launchCampaign(id: string): Promise<Campaign> {
    const response = await apiClient.post(`/api/surveys/campaigns/${id}/launch/`)
    return response.data
  }

  async pauseCampaign(id: string): Promise<Campaign> {
    const response = await apiClient.post(`/api/surveys/campaigns/${id}/pause/`)
    return response.data
  }

  async completeCampaign(id: string): Promise<Campaign> {
    const response = await apiClient.post(`/api/surveys/campaigns/${id}/complete/`)
    return response.data
  }
}

export const campaignService = new CampaignService()