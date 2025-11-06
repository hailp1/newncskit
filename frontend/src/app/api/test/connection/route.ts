import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/postgres-server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';

export async function GET(request: NextRequest) {
  // Require authentication for test endpoints
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user) {
    return NextResponse.json({
      success: false,
      error: 'Authentication required'
    }, { status: 401 });
  }
  
  // Only allow admin users to access test endpoints
  if (session.user.role !== 'admin') {
    return NextResponse.json({
      success: false,
      error: 'Admin access required'
    }, { status: 403 });
  }
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