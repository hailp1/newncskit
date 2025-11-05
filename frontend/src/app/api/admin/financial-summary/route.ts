import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/postgres-server';

interface FinancialSummary {
  totalTokensDistributed: number;
  totalFeesCollected: number;
  averageParticipationRate: number;
  revenueGrowthRate: number;
  topPerformingCampaigns: number;
}

// GET - Retrieve financial summary and analytics
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get('timeRange') || '30d';

    // Calculate date filter based on time range
    let dateFilter = '';
    let previousPeriodFilter = '';
    
    switch (timeRange) {
      case '7d':
        dateFilter = "AND created_at >= NOW() - INTERVAL '7 days'";
        previousPeriodFilter = "AND created_at >= NOW() - INTERVAL '14 days' AND created_at < NOW() - INTERVAL '7 days'";
        break;
      case '30d':
        dateFilter = "AND created_at >= NOW() - INTERVAL '30 days'";
        previousPeriodFilter = "AND created_at >= NOW() - INTERVAL '60 days' AND created_at < NOW() - INTERVAL '30 days'";
        break;
      case '90d':
        dateFilter = "AND created_at >= NOW() - INTERVAL '90 days'";
        previousPeriodFilter = "AND created_at >= NOW() - INTERVAL '180 days' AND created_at < NOW() - INTERVAL '90 days'";
        break;
      case '1y':
        dateFilter = "AND created_at >= NOW() - INTERVAL '1 year'";
        previousPeriodFilter = "AND created_at >= NOW() - INTERVAL '2 years' AND created_at < NOW() - INTERVAL '1 year'";
        break;
      default:
        dateFilter = "AND created_at >= NOW() - INTERVAL '30 days'";
        previousPeriodFilter = "AND created_at >= NOW() - INTERVAL '60 days' AND created_at < NOW() - INTERVAL '30 days'";
    }

    // Create survey_campaigns table if it doesn't exist (for development)
    await query(`
      CREATE TABLE IF NOT EXISTS survey_campaigns (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        project_id UUID NOT NULL,
        survey_id UUID,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        target_participants INTEGER NOT NULL DEFAULT 0,
        token_reward_per_participant INTEGER NOT NULL DEFAULT 0,
        duration INTEGER NOT NULL DEFAULT 30,
        status VARCHAR(50) NOT NULL DEFAULT 'draft',
        total_participants INTEGER NOT NULL DEFAULT 0,
        completed_responses INTEGER NOT NULL DEFAULT 0,
        total_tokens_awarded INTEGER NOT NULL DEFAULT 0,
        admin_fee_collected INTEGER NOT NULL DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        launched_at TIMESTAMP WITH TIME ZONE,
        completed_at TIMESTAMP WITH TIME ZONE
      )
    `);

    // Get total tokens distributed in current period
    const tokensResult = await query(`
      SELECT COALESCE(SUM(total_tokens_awarded), 0) as total_tokens
      FROM survey_campaigns
      WHERE status IN ('completed', 'active') ${dateFilter}
    `);

    // Get total fees collected in current period
    const feesResult = await query(`
      SELECT COALESCE(SUM(admin_fee_collected), 0) as total_fees
      FROM survey_campaigns
      WHERE status IN ('completed', 'active') ${dateFilter}
    `);

    // Get average participation rate
    const participationResult = await query(`
      SELECT 
        AVG(
          CASE 
            WHEN target_participants > 0 
            THEN (completed_responses::float / target_participants::float * 100)
            ELSE 0 
          END
        ) as avg_participation
      FROM survey_campaigns
      WHERE status IN ('completed', 'active') ${dateFilter}
        AND target_participants > 0
    `);

    // Get revenue from previous period for growth calculation
    const previousRevenueResult = await query(`
      SELECT COALESCE(SUM(admin_fee_collected), 0) as previous_revenue
      FROM survey_campaigns
      WHERE status IN ('completed', 'active') ${previousPeriodFilter}
    `);

    // Get count of top performing campaigns (campaigns with above-average revenue)
    const avgRevenueResult = await query(`
      SELECT AVG(admin_fee_collected) as avg_revenue
      FROM survey_campaigns
      WHERE status IN ('completed', 'active') ${dateFilter}
        AND admin_fee_collected > 0
    `);

    const topCampaignsResult = await query(`
      SELECT COUNT(*) as top_campaigns
      FROM survey_campaigns
      WHERE status IN ('completed', 'active') ${dateFilter}
        AND admin_fee_collected > $1
    `, [avgRevenueResult.rows[0]?.avg_revenue || 0]);

    // Calculate revenue growth rate
    const currentRevenue = parseInt(feesResult.rows[0]?.total_fees || '0');
    const previousRevenue = parseInt(previousRevenueResult.rows[0]?.previous_revenue || '0');
    const revenueGrowthRate = previousRevenue > 0 
      ? ((currentRevenue - previousRevenue) / previousRevenue * 100)
      : currentRevenue > 0 ? 100 : 0;

    const financialSummary: FinancialSummary = {
      totalTokensDistributed: parseInt(tokensResult.rows[0]?.total_tokens || '0'),
      totalFeesCollected: currentRevenue,
      averageParticipationRate: parseFloat(participationResult.rows[0]?.avg_participation || '0'),
      revenueGrowthRate: revenueGrowthRate,
      topPerformingCampaigns: parseInt(topCampaignsResult.rows[0]?.top_campaigns || '0')
    };

    return NextResponse.json(financialSummary);
  } catch (error) {
    console.error('Error fetching financial summary:', error);
    
    // Return default summary on error
    const defaultSummary: FinancialSummary = {
      totalTokensDistributed: 0,
      totalFeesCollected: 0,
      averageParticipationRate: 0,
      revenueGrowthRate: 0,
      topPerformingCampaigns: 0
    };

    return NextResponse.json(defaultSummary);
  }
}