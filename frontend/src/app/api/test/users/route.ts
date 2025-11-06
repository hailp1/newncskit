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
    const countResult = await query('SELECT COUNT(*) FROM users');
    const sampleResult = await query('SELECT id, email, full_name, created_at FROM users LIMIT 5');
    
    return NextResponse.json({
      success: true,
      message: `Users table exists with ${countResult.rows[0].count} records`,
      data: {
        count: parseInt(countResult.rows[0].count),
        sample: sampleResult.rows
      }
    });
  } catch (error) {
    console.error('Users table error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}