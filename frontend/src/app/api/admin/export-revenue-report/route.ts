import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/postgres-server';

// GET - Export revenue report in CSV or Excel format
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || 'csv';
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

    // Get campaign data for export
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

    if (format === 'csv') {
      // Generate CSV content
      const headers = [
        'Campaign ID',
        'Title',
        'Status',
        'Target Participants',
        'Completed Responses',
        'Token Reward Per Participant',
        'Total Tokens Awarded',
        'Admin Fee Collected',
        'Created Date',
        'Launch Date',
        'Completion Date'
      ];

      const csvRows = [
        headers.join(','),
        ...result.rows.map((row: any) => [
          row.id,
          `"${row.title.replace(/"/g, '""')}"`, // Escape quotes in title
          row.status,
          row.target_participants,
          row.completed_responses,
          row.token_reward_per_participant,
          row.total_tokens_awarded,
          row.admin_fee_collected,
          new Date(row.created_at).toISOString().split('T')[0],
          row.launched_at ? new Date(row.launched_at).toISOString().split('T')[0] : '',
          row.completed_at ? new Date(row.completed_at).toISOString().split('T')[0] : ''
        ].join(','))
      ];

      const csvContent = csvRows.join('\n');

      return new NextResponse(csvContent, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="revenue-report-${timeRange}.csv"`
        }
      });
    } else if (format === 'excel') {
      // For Excel format, we'll generate a simple tab-separated format
      // In a real implementation, you might want to use a library like xlsx
      const headers = [
        'Campaign ID',
        'Title',
        'Status',
        'Target Participants',
        'Completed Responses',
        'Token Reward Per Participant',
        'Total Tokens Awarded',
        'Admin Fee Collected',
        'Created Date',
        'Launch Date',
        'Completion Date'
      ];

      const excelRows = [
        headers.join('\t'),
        ...result.rows.map((row: any) => [
          row.id,
          row.title,
          row.status,
          row.target_participants,
          row.completed_responses,
          row.token_reward_per_participant,
          row.total_tokens_awarded,
          row.admin_fee_collected,
          new Date(row.created_at).toISOString().split('T')[0],
          row.launched_at ? new Date(row.launched_at).toISOString().split('T')[0] : '',
          row.completed_at ? new Date(row.completed_at).toISOString().split('T')[0] : ''
        ].join('\t'))
      ];

      const excelContent = excelRows.join('\n');

      return new NextResponse(excelContent, {
        headers: {
          'Content-Type': 'application/vnd.ms-excel',
          'Content-Disposition': `attachment; filename="revenue-report-${timeRange}.xls"`
        }
      });
    } else {
      return NextResponse.json(
        { error: 'Unsupported format. Use csv or excel.' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Error exporting revenue report:', error);
    return NextResponse.json(
      { error: 'Failed to export revenue report' },
      { status: 500 }
    );
  }
}