import { NextResponse } from 'next/server';
import { query } from '@/lib/postgres-server';

export async function GET() {
  try {
    const result = await query('SELECT NOW() as current_time, version() as postgres_version');
    
    return NextResponse.json({
      success: true,
      message: 'Database connection successful',
      data: {
        timestamp: result.rows[0].current_time,
        version: result.rows[0].postgres_version
      }
    });
  } catch (error) {
    console.error('Database connection error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}