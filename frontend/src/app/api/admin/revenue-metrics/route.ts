import { NextResponse } from 'next/server';
import { query } from '@/lib/postgres-server';

interface RevenueMetrics {
  totalRevenue: number;
  monthlyRevenue: number;
  totalCampaigns: number;
  activeCampaigns: number;
  averageFeePerCampaign: number;
  topCampaignsByRevenue: Array<{
    id: string;
    title: string;
    revenue: number;
    participants: number;
  }>;
}

// GET - Retrieve revenue metrics and reporting data
export async function GET() {
  try {
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

    // Get total revenue (sum of all admin fees collected)
    const totalRevenueResult = await query(`
      SELECT COALESCE(SUM(admin_fee_collected), 0) as total_revenue
      FROM survey_campaigns
      WHERE status IN ('completed', 'active')
    `);

    // Get monthly revenue (current month)
    const monthlyRevenueResult = await query(`
      SELECT COALESCE(SUM(admin_fee_collected), 0) as monthly_revenue
      FROM survey_campaigns
      WHERE status IN ('completed', 'active')
        AND DATE_TRUNC('month', created_at) = DATE_TRUNC('month', NOW())
    `);

    // Get total campaigns count
    const totalCampaignsResult = await query(`
      SELECT COUNT(*) as total_campaigns
      FROM survey_campaigns
    `);

    // Get active campaigns count
    const activeCampaignsResult = await query(`
      SELECT COUNT(*) as active_campaigns
      FROM survey_campaigns
      WHERE status = 'active'
    `);

    // Get average fee per campaign
    const avgFeeResult = await query(`
      SELECT COALESCE(AVG(admin_fee_collected), 0) as avg_fee
      FROM survey_campaigns
      WHERE status IN ('completed', 'active')
        AND admin_fee_collected > 0
    `);

    // Get top campaigns by revenue
    const topCampaignsResult = await query(`
      SELECT 
        id,
        title,
        admin_fee_collected as revenue,
        total_participants as participants
      FROM survey_campaigns
      WHERE status IN ('completed', 'active')
        AND admin_fee_collected > 0
      ORDER BY admin_fee_collected DESC
      LIMIT 10
    `);

    const metrics: RevenueMetrics = {
      totalRevenue: parseInt(totalRevenueResult.rows[0]?.total_revenue || '0'),
      monthlyRevenue: parseInt(monthlyRevenueResult.rows[0]?.monthly_revenue || '0'),
      totalCampaigns: parseInt(totalCampaignsResult.rows[0]?.total_campaigns || '0'),
      activeCampaigns: parseInt(activeCampaignsResult.rows[0]?.active_campaigns || '0'),
      averageFeePerCampaign: parseFloat(avgFeeResult.rows[0]?.avg_fee || '0'),
      topCampaignsByRevenue: topCampaignsResult.rows.map((row: any) => ({
        id: row.id,
        title: row.title,
        revenue: parseInt(row.revenue),
        participants: parseInt(row.participants)
      }))
    };

    return NextResponse.json(metrics);
  } catch (error) {
    console.error('Error fetching revenue metrics:', error);
    
    // Return default metrics on error
    const defaultMetrics: RevenueMetrics = {
      totalRevenue: 0,
      monthlyRevenue: 0,
      totalCampaigns: 0,
      activeCampaigns: 0,
      averageFeePerCampaign: 0,
      topCampaignsByRevenue: []
    };

    return NextResponse.json(defaultMetrics);
  }
}