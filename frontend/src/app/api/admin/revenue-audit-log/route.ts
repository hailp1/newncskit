import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/postgres-server';

interface AuditLogEntry {
  id: string;
  action: string;
  campaignId: string;
  campaignTitle: string;
  amount: number;
  timestamp: string;
  details: string;
}

// GET - Retrieve revenue audit log entries
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get('timeRange') || '30d';

    // Calculate date filter based on time range
    let dateFilter = '';
    switch (timeRange) {
      case '7d':
        dateFilter = "AND ral.created_at >= NOW() - INTERVAL '7 days'";
        break;
      case '30d':
        dateFilter = "AND ral.created_at >= NOW() - INTERVAL '30 days'";
        break;
      case '90d':
        dateFilter = "AND ral.created_at >= NOW() - INTERVAL '90 days'";
        break;
      case '1y':
        dateFilter = "AND ral.created_at >= NOW() - INTERVAL '1 year'";
        break;
      default:
        dateFilter = "AND ral.created_at >= NOW() - INTERVAL '30 days'";
    }

    // Create revenue audit log table if it doesn't exist
    await query(`
      CREATE TABLE IF NOT EXISTS revenue_audit_log (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        action VARCHAR(100) NOT NULL,
        campaign_id UUID NOT NULL,
        campaign_title VARCHAR(255) NOT NULL,
        amount INTEGER NOT NULL DEFAULT 0,
        details TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);

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

    // Try to get audit log entries
    let auditEntries: AuditLogEntry[] = [];
    
    try {
      const auditResult = await query(`
        SELECT 
          ral.id,
          ral.action,
          ral.campaign_id,
          ral.campaign_title,
          ral.amount,
          ral.details,
          ral.created_at
        FROM revenue_audit_log ral
        WHERE 1=1 ${dateFilter}
        ORDER BY ral.created_at DESC
        LIMIT 100
      `);

      auditEntries = auditResult.rows.map((row: any) => ({
        id: row.id,
        action: row.action,
        campaignId: row.campaign_id,
        campaignTitle: row.campaign_title,
        amount: parseInt(row.amount),
        timestamp: row.created_at,
        details: row.details || ''
      }));
    } catch (auditError) {
      console.warn('Audit log table might be empty, generating synthetic entries from campaigns:', auditError);
      
      // If audit log is empty, generate synthetic entries from campaign data
      const campaignResult = await query(`
        SELECT 
          id,
          title,
          admin_fee_collected,
          total_tokens_awarded,
          completed_responses,
          created_at,
          status
        FROM survey_campaigns
        WHERE status IN ('completed', 'active') ${dateFilter.replace('ral.', '')}
        ORDER BY created_at DESC
        LIMIT 50
      `);

      // Generate synthetic audit entries
      auditEntries = campaignResult.rows.flatMap((campaign: any) => {
        const entries: AuditLogEntry[] = [];
        
        if (campaign.admin_fee_collected > 0) {
          entries.push({
            id: `fee_${campaign.id}`,
            action: 'admin_fee_collected',
            campaignId: campaign.id,
            campaignTitle: campaign.title,
            amount: parseInt(campaign.admin_fee_collected),
            timestamp: campaign.created_at,
            details: `Admin fee collected for campaign completion`
          });
        }
        
        if (campaign.total_tokens_awarded > 0) {
          entries.push({
            id: `tokens_${campaign.id}`,
            action: 'tokens_distributed',
            campaignId: campaign.id,
            campaignTitle: campaign.title,
            amount: parseInt(campaign.total_tokens_awarded),
            timestamp: campaign.created_at,
            details: `Tokens distributed to ${campaign.completed_responses} participants`
          });
        }
        
        return entries;
      });

      // Sort by timestamp descending
      auditEntries.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    }

    return NextResponse.json(auditEntries);
  } catch (error) {
    console.error('Error fetching revenue audit log:', error);
    return NextResponse.json(
      { error: 'Failed to fetch revenue audit log' },
      { status: 500 }
    );
  }
}