import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { query } from '@/lib/postgres-server';

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
    const result = await query('SELECT * FROM business_domains ORDER BY name');
    
    return NextResponse.json({
      success: true,
      message: `Found ${result.rows.length} business domains`,
      data: result.rows
    });
  } catch (error) {
    console.error('Business domains error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}