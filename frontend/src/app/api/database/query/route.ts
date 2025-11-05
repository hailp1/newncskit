import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/postgres-server';

export async function POST(request: NextRequest) {
  try {
    const { query: sql, params } = await request.json();
    
    if (!sql) {
      return NextResponse.json({
        success: false,
        error: 'SQL query is required'
      }, { status: 400 });
    }

    const result = await query(sql, params);
    
    return NextResponse.json({
      success: true,
      data: {
        rows: result.rows,
        rowCount: result.rowCount
      }
    });
  } catch (error) {
    console.error('Database query error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}