import { NextResponse } from 'next/server';
import { query } from '@/lib/postgres-server';

export async function GET() {
  try {
    const countResult = await query('SELECT COUNT(*) FROM projects');
    const sampleResult = await query('SELECT id, title, status, phase, created_at FROM projects LIMIT 5');
    
    return NextResponse.json({
      success: true,
      message: `Projects table exists with ${countResult.rows[0].count} records`,
      data: {
        count: parseInt(countResult.rows[0].count),
        sample: sampleResult.rows
      }
    });
  } catch (error) {
    console.error('Projects table error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}