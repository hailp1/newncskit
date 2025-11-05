import { NextResponse } from 'next/server';
import { query } from '@/lib/postgres-server';

export async function GET() {
  try {
    const result = await query('SELECT * FROM marketing_models ORDER BY name');
    
    return NextResponse.json({
      success: true,
      message: `Found ${result.rows.length} marketing models`,
      data: result.rows
    });
  } catch (error) {
    console.error('Marketing models error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}