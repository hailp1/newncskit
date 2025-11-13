// Token Reward Service
// Manages token rewards, admin fees, and revenue tracking for survey campaigns

export interface TokenTransaction {
  id: string;
  userId: string;
  campaignId?: string;
  type: 'reward' | 'purchase' | 'admin_fee' | 'refund';
  amount: number;
  description: string;
  status: 'pending' | 'completed' | 'failed';
  createdAt: Date;
  completedAt?: Date;
  metadata?: {
    surveyResponseId?: string;
    adminFeePercentage?: number;
    originalAmount?: number;
  };
}

export interface TokenBalance {
  userId: string;
  totalBalance: number;
  availableBalance: number;
  pendingBalance: number;
  lifetimeEarned: number;
  lifetimeSpent: number;
  lastUpdated: Date;
}

export interface RewardCalculation {
  baseReward: number;
  bonusReward: number;
  totalReward: number;
  adminFee: number;
  adminFeePercentage: number;
  netCost: number; // Cost to campaign creator
  participantReceives: number; // What participant gets
}

export interface AdminRevenue {
  totalRevenue: number;
  revenueThisMonth: number;
  revenueThisWeek: number;
  totalCampaigns: number;
  totalParticipants: number;
  averageFeePerCampaign: number;
  topCampaignsByRevenue: Array<{
    campaignId: string;
    campaignTitle: string;
    revenue: number;
    participants: number;
  }>;
}

class TokenRewardService {
  private baseUrl = '/api/tokens';

  /**
   * Get user's token balance
   */
  async getBalance(userId: string): Promise<TokenBalance> {
    try {
      const response = await fetch(`${this.baseUrl}/balance/${userId}`);
      if (!response.ok) {
        throw new Error(`Failed to get balance: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error getting token balance:', error);
      throw error;
    }
  }

  /**
   * Calculate reward for survey completion
   */
  calculateReward(
    baseReward: number,
    completionTime: number, // in minutes
    qualityScore: number, // 0-1
    adminFeePercentage: number = 5
  ): RewardCalculation {
    // Base reward calculation
    let totalReward = baseReward;

    // Time bonus (faster completion gets small bonus)
    const timeBonus = completionTime < 10 ? baseReward * 0.1 : 0;

    // Quality bonus (high quality responses get bonus)
    const qualityBonus = qualityScore > 0.8 ? baseReward * 0.2 : 0;

    const bonusReward = timeBonus + qualityBonus;
    totalReward += bonusReward;

    // Admin fee calculation
    const adminFee = Math.ceil(totalReward * (adminFeePercentage / 100));
    const netCost = totalReward + adminFee;

    return {
      baseReward,
      bonusReward,
      totalReward,
      adminFee,
      adminFeePercentage,
      netCost,
      participantReceives: totalReward
    };
  }

  /**
   * Process reward for survey completion
   */
  async processReward(
    userId: string,
    campaignId: string,
    surveyResponseId: string,
    rewardCalculation: RewardCalculation
  ): Promise<TokenTransaction> {
    try {
      const response = await fetch(`${this.baseUrl}/process-reward`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          campaignId,
          surveyResponseId,
          amount: rewardCalculation.participantReceives,
          adminFee: rewardCalculation.adminFee,
          metadata: {
            surveyResponseId,
            adminFeePercentage: rewardCalculation.adminFeePercentage,
            originalAmount: rewardCalculation.totalReward
          }
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to process reward: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error processing reward:', error);
      throw error;
    }
  }

  /**
   * Deduct tokens for campaign creation
   */
  async deductCampaignCost(
    userId: string,
    campaignId: string,
    totalCost: number,
    description: string
  ): Promise<TokenTransaction> {
    try {
      const response = await fetch(`${this.baseUrl}/deduct`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          campaignId,
          amount: -totalCost, // Negative for deduction
          description,
          type: 'campaign_cost'
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to deduct tokens: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error deducting tokens:', error);
      throw error;
    }
  }

  /**
   * Get transaction history
   */
  async getTransactionHistory(
    userId: string,
    options?: {
      limit?: number;
      offset?: number;
      type?: TokenTransaction['type'];
      campaignId?: string;
    }
  ): Promise<{
    transactions: TokenTransaction[];
    total: number;
    hasMore: boolean;
  }> {
    try {
      const params = new URLSearchParams();
      if (options?.limit) params.append('limit', options.limit.toString());
      if (options?.offset) params.append('offset', options.offset.toString());
      if (options?.type) params.append('type', options.type);
      if (options?.campaignId) params.append('campaign_id', options.campaignId);

      const response = await fetch(`${this.baseUrl}/transactions/${userId}?${params}`);
      if (!response.ok) {
        throw new Error(`Failed to get transactions: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting transaction history:', error);
      throw error;
    }
  }

  /**
   * Purchase tokens
   */
  async purchaseTokens(
    userId: string,
    amount: number,
    paymentMethod: string
  ): Promise<{
    transaction: TokenTransaction;
    paymentUrl?: string;
  }> {
    try {
      const response = await fetch(`${this.baseUrl}/purchase`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          amount,
          paymentMethod
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to purchase tokens: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error purchasing tokens:', error);
      throw error;
    }
  }

  /**
   * Get admin revenue analytics
   */
  async getAdminRevenue(
    dateRange?: {
      start: Date;
      end: Date;
    }
  ): Promise<AdminRevenue> {
    try {
      const params = new URLSearchParams();
      if (dateRange) {
        params.append('start_date', dateRange.start.toISOString());
        params.append('end_date', dateRange.end.toISOString());
      }

      const response = await fetch(`${this.baseUrl}/admin/revenue?${params}`);
      if (!response.ok) {
        throw new Error(`Failed to get admin revenue: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting admin revenue:', error);
      throw error;
    }
  }

  /**
   * Get admin fee configuration
   */
  async getAdminFeeConfig(): Promise<{
    defaultFeePercentage: number;
    minimumFee: number;
    maximumFee: number;
    feeByCategory: Record<string, number>;
  }> {
    try {
      const response = await fetch(`${this.baseUrl}/admin/fee-config`);
      if (!response.ok) {
        throw new Error(`Failed to get fee config: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting admin fee config:', error);
      throw error;
    }
  }

  /**
   * Update admin fee configuration
   */
  async updateAdminFeeConfig(config: {
    defaultFeePercentage?: number;
    minimumFee?: number;
    maximumFee?: number;
    feeByCategory?: Record<string, number>;
  }): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/admin/fee-config`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(config),
      });

      if (!response.ok) {
        throw new Error(`Failed to update fee config: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error updating admin fee config:', error);
      throw error;
    }
  }

  /**
   * Validate sufficient balance for campaign
   */
  async validateCampaignBalance(
    userId: string,
    estimatedCost: number
  ): Promise<{
    hasSufficientBalance: boolean;
    currentBalance: number;
    requiredAmount: number;
    shortfall: number;
  }> {
    try {
      const balance = await this.getBalance(userId);
      const hasSufficientBalance = balance.availableBalance >= estimatedCost;
      const shortfall = hasSufficientBalance ? 0 : estimatedCost - balance.availableBalance;

      return {
        hasSufficientBalance,
        currentBalance: balance.availableBalance,
        requiredAmount: estimatedCost,
        shortfall
      };
    } catch (error) {
      console.error('Error validating campaign balance:', error);
      throw error;
    }
  }

  /**
   * Create audit trail for token operations
   */
  async createAuditLog(
    operation: string,
    userId: string,
    details: Record<string, any>
  ): Promise<void> {
    try {
      await fetch(`${this.baseUrl}/audit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          operation,
          userId,
          details,
          timestamp: new Date().toISOString()
        }),
      });
    } catch (error) {
      console.error('Error creating audit log:', error);
      // Don't throw error for audit logging failures
    }
  }

  // Client-side utility methods

  /**
   * Format token amount for display
   */
  formatTokenAmount(amount: number): string {
    return new Intl.NumberFormat('vi-VN').format(amount) + ' tokens';
  }

  /**
   * Calculate campaign total cost including admin fee
   */
  calculateCampaignCost(
    participantCount: number,
    rewardPerParticipant: number,
    adminFeePercentage: number = 5
  ): {
    totalRewards: number;
    adminFee: number;
    totalCost: number;
  } {
    const totalRewards = participantCount * rewardPerParticipant;
    const adminFee = Math.ceil(totalRewards * (adminFeePercentage / 100));
    const totalCost = totalRewards + adminFee;

    return {
      totalRewards,
      adminFee,
      totalCost
    };
  }

  /**
   * Get token transaction status color
   */
  getTransactionStatusColor(status: TokenTransaction['status']): string {
    const colors = {
      pending: 'yellow',
      completed: 'green',
      failed: 'red'
    };
    return colors[status] || 'gray';
  }

  /**
   * Get transaction type display name
   */
  getTransactionTypeDisplay(type: TokenTransaction['type']): string {
    const displays = {
      reward: 'Phần thưởng khảo sát',
      purchase: 'Mua token',
      admin_fee: 'Phí quản trị',
      refund: 'Hoàn tiền'
    };
    return displays[type] || type;
  }
}

// Create and export singleton instance
export const tokenRewardService = new TokenRewardService();
export default tokenRewardService;