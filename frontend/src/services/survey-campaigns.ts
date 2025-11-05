import { SurveyCampaign, CampaignStatus, EligibilityCriteria } from '@/types/workflow';
import { ErrorHandler } from './error-handler';
import { errorRecoveryService, ErrorRecoveryContext } from './error-recovery';

export interface CampaignCreationData {
  projectId: string;
  surveyId: string;
  title: string;
  description?: string;
  targetParticipants: number;
  tokenRewardPerParticipant: number;
  duration: number; // days
  eligibilityCriteria: EligibilityCriteria;
}

export interface CampaignUpdate {
  title?: string;
  description?: string;
  targetParticipants?: number;
  tokenRewardPerParticipant?: number;
  duration?: number;
  eligibilityCriteria?: EligibilityCriteria;
  status?: CampaignStatus;
}

export interface CampaignAnalytics {
  campaignId: string;
  totalViews: number;
  totalStarts: number;
  totalCompletions: number;
  completionRate: number;
  averageCompletionTime: number; // minutes
  participantDemographics: {
    ageGroups: { [range: string]: number };
    genderDistribution: { [gender: string]: number };
    educationLevels: { [level: string]: number };
  };
  responseQuality: {
    averageResponseLength: number;
    straightLiningDetected: number;
    speedingDetected: number;
  };
  tokenDistribution: {
    totalTokensAwarded: number;
    averageTokensPerParticipant: number;
    adminFeeCollected: number;
  };
}

export interface ParticipantNotification {
  type: 'campaign_launch' | 'reminder' | 'completion_thank_you' | 'reward_notification';
  recipients: string[]; // user IDs or email addresses
  subject: string;
  message: string;
  scheduledAt?: Date;
}

export interface CampaignFilter {
  status?: CampaignStatus;
  projectId?: string;
  createdBy?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
  minParticipants?: number;
  maxParticipants?: number;
}

class SurveyCampaignService {
  private baseUrl = '/api/survey-campaigns';

  /**
   * Create a new survey campaign
   */
  async createCampaign(campaignData: CampaignCreationData): Promise<SurveyCampaign> {
    const context: ErrorRecoveryContext = {
      operation: 'createCampaign',
      component: 'campaign-manager',
      data: { campaignData },
      timestamp: new Date()
    };

    return errorRecoveryService.withRetry(async () => {
      try {
        // Validate campaign data
        const validation = await this.validateCampaign(campaignData);
        if (!validation.isValid) {
          throw new Error(`Campaign validation failed: ${validation.errors[0]}`);
        }

        // Check token balance before creating campaign
        await this.checkTokenBalance(campaignData);

        // Check for eligible participants
        const eligibleCount = await this.getEligibleParticipantsCount(campaignData.eligibilityCriteria);
        if (eligibleCount < campaignData.targetParticipants) {
          throw new Error(`Only ${eligibleCount} eligible participants found, but ${campaignData.targetParticipants} required`);
        }

        const response = await fetch(`${this.baseUrl}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(campaignData),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || `Failed to create campaign: ${response.statusText}`);
        }

        return await response.json();
      } catch (error) {
        console.error('Error creating campaign:', error);
        
        const userError = ErrorHandler.handleCampaignError(error);
        const enhancedError = new Error(userError.message);
        (enhancedError as any).userMessage = userError;
        
        throw enhancedError;
      }
    }, context);
  }

  /**
   * Get campaign by ID
   */
  async getCampaign(campaignId: string): Promise<SurveyCampaign> {
    try {
      const response = await fetch(`${this.baseUrl}/${campaignId}`);
      if (!response.ok) {
        throw new Error(`Failed to get campaign: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting campaign:', error);
      throw error;
    }
  }

  /**
   * Get all campaigns with optional filtering
   */
  async getCampaigns(
    filter?: CampaignFilter,
    options?: {
      limit?: number;
      offset?: number;
      sortBy?: 'created_at' | 'title' | 'status' | 'participants';
      sortOrder?: 'asc' | 'desc';
    }
  ): Promise<{
    campaigns: SurveyCampaign[];
    total: number;
    hasMore: boolean;
  }> {
    try {
      const params = new URLSearchParams();
      
      if (filter) {
        if (filter.status) params.append('status', filter.status);
        if (filter.projectId) params.append('project_id', filter.projectId);
        if (filter.createdBy) params.append('created_by', filter.createdBy);
        if (filter.dateRange) {
          params.append('start_date', filter.dateRange.start.toISOString());
          params.append('end_date', filter.dateRange.end.toISOString());
        }
        if (filter.minParticipants) params.append('min_participants', filter.minParticipants.toString());
        if (filter.maxParticipants) params.append('max_participants', filter.maxParticipants.toString());
      }

      if (options) {
        if (options.limit) params.append('limit', options.limit.toString());
        if (options.offset) params.append('offset', options.offset.toString());
        if (options.sortBy) params.append('sort_by', options.sortBy);
        if (options.sortOrder) params.append('sort_order', options.sortOrder);
      }

      const response = await fetch(`${this.baseUrl}?${params}`);
      if (!response.ok) {
        throw new Error(`Failed to get campaigns: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting campaigns:', error);
      throw error;
    }
  }

  /**
   * Update campaign
   */
  async updateCampaign(campaignId: string, updates: CampaignUpdate): Promise<SurveyCampaign> {
    try {
      const response = await fetch(`${this.baseUrl}/${campaignId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error(`Failed to update campaign: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating campaign:', error);
      throw error;
    }
  }

  /**
   * Delete campaign
   */
  async deleteCampaign(campaignId: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/${campaignId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`Failed to delete campaign: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error deleting campaign:', error);
      throw error;
    }
  }

  /**
   * Launch campaign
   */
  async launchCampaign(campaignId: string): Promise<SurveyCampaign> {
    const context: ErrorRecoveryContext = {
      operation: 'launchCampaign',
      component: 'campaign-manager',
      data: { campaignId },
      timestamp: new Date()
    };

    return errorRecoveryService.withRetry(async () => {
      try {
        // Pre-launch validation
        const campaign = await this.getCampaign(campaignId);
        await this.validateCampaignForLaunch(campaign);

        const response = await fetch(`${this.baseUrl}/${campaignId}/launch`, {
          method: 'POST',
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || `Failed to launch campaign: ${response.statusText}`);
        }

        const launchedCampaign = await response.json();

        // Post-launch verification
        if (launchedCampaign.status !== CampaignStatus.ACTIVE) {
          throw new Error('Campaign launch succeeded but status is not active');
        }

        return launchedCampaign;
      } catch (error) {
        console.error('Error launching campaign:', error);
        
        const userError = ErrorHandler.handleCampaignError(error);
        const enhancedError = new Error(userError.message);
        (enhancedError as any).userMessage = userError;
        
        throw enhancedError;
      }
    }, context, {
      maxAttempts: 2,
      delay: 2000
    });
  }

  /**
   * Pause campaign
   */
  async pauseCampaign(campaignId: string): Promise<SurveyCampaign> {
    try {
      const response = await fetch(`${this.baseUrl}/${campaignId}/pause`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error(`Failed to pause campaign: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error pausing campaign:', error);
      throw error;
    }
  }

  /**
   * Resume campaign
   */
  async resumeCampaign(campaignId: string): Promise<SurveyCampaign> {
    try {
      const response = await fetch(`${this.baseUrl}/${campaignId}/resume`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error(`Failed to resume campaign: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error resuming campaign:', error);
      throw error;
    }
  }

  /**
   * Complete campaign
   */
  async completeCampaign(campaignId: string): Promise<SurveyCampaign> {
    try {
      const response = await fetch(`${this.baseUrl}/${campaignId}/complete`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error(`Failed to complete campaign: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error completing campaign:', error);
      throw error;
    }
  }

  /**
   * Get campaign analytics
   */
  async getCampaignAnalytics(campaignId: string): Promise<CampaignAnalytics> {
    try {
      const response = await fetch(`${this.baseUrl}/${campaignId}/analytics`);
      if (!response.ok) {
        throw new Error(`Failed to get campaign analytics: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting campaign analytics:', error);
      throw error;
    }
  }

  /**
   * Get campaign participants
   */
  async getCampaignParticipants(
    campaignId: string,
    options?: {
      status?: 'invited' | 'started' | 'completed' | 'dropped_out';
      limit?: number;
      offset?: number;
    }
  ): Promise<{
    participants: Array<{
      userId: string;
      email: string;
      status: string;
      startedAt?: Date;
      completedAt?: Date;
      tokensAwarded: number;
      responseQuality: number;
    }>;
    total: number;
  }> {
    try {
      const params = new URLSearchParams();
      if (options?.status) params.append('status', options.status);
      if (options?.limit) params.append('limit', options.limit.toString());
      if (options?.offset) params.append('offset', options.offset.toString());

      const response = await fetch(`${this.baseUrl}/${campaignId}/participants?${params}`);
      if (!response.ok) {
        throw new Error(`Failed to get campaign participants: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting campaign participants:', error);
      throw error;
    }
  }

  /**
   * Send participant notifications
   */
  async sendNotification(campaignId: string, notification: ParticipantNotification): Promise<{
    sent: number;
    failed: number;
    errors: string[];
  }> {
    try {
      const response = await fetch(`${this.baseUrl}/${campaignId}/notify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(notification),
      });

      if (!response.ok) {
        throw new Error(`Failed to send notification: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error sending notification:', error);
      throw error;
    }
  }

  /**
   * Get eligible participants for a campaign
   */
  async getEligibleParticipants(
    eligibilityCriteria: EligibilityCriteria,
    limit?: number
  ): Promise<Array<{
    userId: string;
    email: string;
    demographics: {
      age?: number;
      gender?: string;
      education?: string;
      location?: string;
    };
    matchScore: number;
  }>> {
    try {
      const response = await fetch(`${this.baseUrl}/eligible-participants`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          eligibilityCriteria,
          limit: limit || 1000
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to get eligible participants: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting eligible participants:', error);
      throw error;
    }
  }

  /**
   * Estimate campaign cost
   */
  async estimateCampaignCost(
    targetParticipants: number,
    tokenRewardPerParticipant: number,
    adminFeePercentage: number = 5
  ): Promise<{
    totalTokenCost: number;
    adminFee: number;
    totalCost: number;
    estimatedRevenue: number;
  }> {
    const totalTokenCost = targetParticipants * tokenRewardPerParticipant;
    const adminFee = Math.ceil(totalTokenCost * (adminFeePercentage / 100));
    const totalCost = totalTokenCost + adminFee;

    return {
      totalTokenCost,
      adminFee,
      totalCost,
      estimatedRevenue: adminFee
    };
  }

  /**
   * Validate campaign configuration
   */
  async validateCampaign(campaignData: Partial<CampaignCreationData>): Promise<{
    isValid: boolean;
    errors: string[];
    warnings: string[];
    suggestions: string[];
  }> {
    const errors: string[] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];

    // Basic validation
    if (!campaignData.title?.trim()) {
      errors.push('Campaign title is required');
    }

    if (!campaignData.targetParticipants || campaignData.targetParticipants <= 0) {
      errors.push('Target participants must be greater than 0');
    }

    if (!campaignData.tokenRewardPerParticipant || campaignData.tokenRewardPerParticipant < 0) {
      errors.push('Token reward per participant must be 0 or greater');
    }

    if (!campaignData.duration || campaignData.duration <= 0) {
      errors.push('Campaign duration must be greater than 0 days');
    }

    // Warnings
    if (campaignData.targetParticipants && campaignData.targetParticipants > 1000) {
      warnings.push('Large campaigns (>1000 participants) may take longer to complete');
    }

    if (campaignData.tokenRewardPerParticipant && campaignData.tokenRewardPerParticipant < 5) {
      warnings.push('Low token rewards may result in poor participation rates');
    }

    if (campaignData.duration && campaignData.duration > 90) {
      warnings.push('Long campaigns (>90 days) may have lower completion rates');
    }

    // Suggestions
    if (campaignData.tokenRewardPerParticipant && campaignData.tokenRewardPerParticipant >= 10) {
      suggestions.push('Consider adding quality checks for high-reward campaigns');
    }

    if (campaignData.targetParticipants && campaignData.targetParticipants >= 100) {
      suggestions.push('Consider segmenting large campaigns for better management');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      suggestions
    };
  }

  /**
   * Get campaign templates
   */
  async getCampaignTemplates(): Promise<Array<{
    id: string;
    name: string;
    description: string;
    targetParticipants: number;
    tokenRewardPerParticipant: number;
    duration: number;
    eligibilityCriteria: EligibilityCriteria;
    category: string;
  }>> {
    try {
      const response = await fetch(`${this.baseUrl}/templates`);
      if (!response.ok) {
        throw new Error(`Failed to get campaign templates: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting campaign templates:', error);
      throw error;
    }
  }

  /**
   * Clone campaign
   */
  async cloneCampaign(campaignId: string, newTitle?: string): Promise<SurveyCampaign> {
    try {
      const response = await fetch(`${this.baseUrl}/${campaignId}/clone`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title: newTitle }),
      });

      if (!response.ok) {
        throw new Error(`Failed to clone campaign: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error cloning campaign:', error);
      throw error;
    }
  }

  /**
   * Export campaign data
   */
  async exportCampaignData(
    campaignId: string,
    format: 'json' | 'csv' | 'excel' = 'json',
    includeResponses: boolean = true
  ): Promise<Blob> {
    try {
      const params = new URLSearchParams({
        format,
        include_responses: includeResponses.toString()
      });

      const response = await fetch(`${this.baseUrl}/${campaignId}/export?${params}`);
      if (!response.ok) {
        throw new Error(`Failed to export campaign data: ${response.statusText}`);
      }

      return await response.blob();
    } catch (error) {
      console.error('Error exporting campaign data:', error);
      throw error;
    }
  }

  // Client-side utility methods

  /**
   * Calculate campaign progress
   */
  calculateProgress(campaign: SurveyCampaign): {
    participationRate: number;
    completionRate: number;
    timeRemaining: number; // days
    isOnTrack: boolean;
  } {
    const participationRate = campaign.participation.totalParticipants / campaign.config.targetParticipants;
    const completionRate = campaign.participation.totalParticipants > 0 
      ? campaign.participation.completedResponses / campaign.participation.totalParticipants 
      : 0;

    const now = new Date();
    const launchedAt = campaign.launchedAt ? new Date(campaign.launchedAt) : now;
    const endDate = new Date(launchedAt.getTime() + campaign.config.duration * 24 * 60 * 60 * 1000);
    const timeRemaining = Math.max(0, Math.ceil((endDate.getTime() - now.getTime()) / (24 * 60 * 60 * 1000)));

    const expectedProgress = campaign.config.duration > 0 
      ? (campaign.config.duration - timeRemaining) / campaign.config.duration 
      : 1;
    const isOnTrack = participationRate >= expectedProgress * 0.8; // 80% of expected progress

    return {
      participationRate: Math.min(1, participationRate),
      completionRate,
      timeRemaining,
      isOnTrack
    };
  }

  /**
   * Get campaign status color
   */
  getStatusColor(status: CampaignStatus): string {
    const colors = {
      [CampaignStatus.DRAFT]: 'gray',
      [CampaignStatus.ACTIVE]: 'green',
      [CampaignStatus.PAUSED]: 'yellow',
      [CampaignStatus.COMPLETED]: 'blue',
      [CampaignStatus.CANCELLED]: 'red'
    };

    return colors[status] || 'gray';
  }

  /**
   * Format campaign duration
   */
  formatDuration(days: number): string {
    if (days === 1) return '1 day';
    if (days < 7) return `${days} days`;
    if (days === 7) return '1 week';
    if (days < 30) return `${Math.floor(days / 7)} weeks`;
    if (days < 365) return `${Math.floor(days / 30)} months`;
    return `${Math.floor(days / 365)} years`;
  }

  // Private helper methods for error handling

  private async checkTokenBalance(campaignData: CampaignCreationData): Promise<void> {
    try {
      const cost = await this.estimateCampaignCost(
        campaignData.targetParticipants,
        campaignData.tokenRewardPerParticipant
      );

      const response = await fetch('/api/tokens/balance');
      if (!response.ok) {
        throw new Error('Failed to check token balance');
      }

      const { balance } = await response.json();
      if (balance < cost.totalCost) {
        throw new Error(`Insufficient tokens. Required: ${cost.totalCost}, Available: ${balance}`);
      }
    } catch (error) {
      if (error.message.includes('Insufficient tokens')) {
        throw error;
      }
      console.warn('Could not verify token balance:', error);
      // Don't block campaign creation if balance check fails
    }
  }

  private async getEligibleParticipantsCount(criteria: EligibilityCriteria): Promise<number> {
    try {
      const participants = await this.getEligibleParticipants(criteria, 1);
      // This is a simplified check - in reality, you'd get the count without fetching all participants
      const response = await fetch('/api/participants/count', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eligibilityCriteria: criteria })
      });

      if (!response.ok) {
        throw new Error('Failed to get participant count');
      }

      const { count } = await response.json();
      return count;
    } catch (error) {
      console.warn('Could not get eligible participants count:', error);
      return 0; // Conservative estimate
    }
  }

  private async validateCampaignForLaunch(campaign: SurveyCampaign): Promise<void> {
    if (campaign.status !== CampaignStatus.DRAFT) {
      throw new Error(`Cannot launch campaign with status: ${campaign.status}`);
    }

    if (!campaign.surveyId) {
      throw new Error('Campaign must have an associated survey');
    }

    if (campaign.config.targetParticipants <= 0) {
      throw new Error('Target participants must be greater than 0');
    }

    if (campaign.config.tokenRewardPerParticipant < 0) {
      throw new Error('Token reward cannot be negative');
    }

    // Check if survey exists and is valid
    try {
      const response = await fetch(`/api/surveys/${campaign.surveyId}`);
      if (!response.ok) {
        throw new Error('Associated survey not found or invalid');
      }
    } catch (error) {
      throw new Error('Cannot launch campaign: associated survey is not accessible');
    }
  }
}

// Create and export a singleton instance
export const surveyCampaignService = new SurveyCampaignService();
export default surveyCampaignService;