import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/postgres-server';

interface CampaignRevenueDetail {
  id: string;
  title: string;
  status: string;
  totalParticipants: number;
  completedResponses: number;
  tokenRewardPerParticipant: number;
  totalTokensAwarded: number;
  adminFeeCollected: number;
  createdAt: string;
  launchedAt?: string;
  completedAt?: string;
}

// GET - Retrieve detailed campaign revenue information
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get('timeRange') || '30d';

    // Calculate date filter based on time range
    let dateFilter = '';
    switch (timeRange) {
      case '7d':
        dateFilter = "AND created_at >= NOW() - INTERVAL '7 days'";
        break;
      case '30d':
        dateFilter = "AND created_at >= NOW() - INTERVAL '30 days'";
        break;
      case '90d':
        dateFilter = "AND created_at >= NOW() - INTERVAL '90 days'";
        break;
      case '1y':
        dateFilter = "AND created_at >= NOW() - INTERVAL '1 year'";
        break;
      default:
        dateFilter = "AND created_at >= NOW() - INTERVAL '30 days'";
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

    // Get detailed campaign information
    const result = await query(`
      SELECT 
        id,
        title,
        status,
        target_participants,
        completed_responses,
        token_reward_per_participant,
        total_tokens_awarded,
        admin_fee_collected,
        created_at,
        launched_at,
        completed_at
      FROM survey_campaigns
      WHERE 1=1 ${dateFilter}
      ORDER BY created_at DESC
    `);

    const campaignDetails: CampaignRevenueDetail[] = result.rows.map((row: any) => ({
      id: row.id,
      title: row.title,
      status: row.status,
      totalParticipants: parseInt(row.target_participants),
      completedResponses: parseInt(row.completed_responses),
      tokenRewardPerParticipant: parseInt(row.token_reward_per_participant),
      totalTokensAwarded: parseInt(row.total_tokens_awarded),
      adminFeeCollected: parseInt(row.admin_fee_collected),
      createdAt: row.created_at,
      launchedAt: row.launched_at,
      completedAt: row.completed_at
    }));

    return NextResponse.json(campaignDetails);
  } catch (error) {
    console.error('Error fetching campaign revenue details:', error);
    return NextResponse.json(
      { error: 'Failed to fetch campaign revenue details' },
      { status: 500 }
    );
  }
}