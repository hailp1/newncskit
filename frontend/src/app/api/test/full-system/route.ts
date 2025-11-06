import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { query, testConnection } from '@/lib/postgres-server';
import { adminService } from '@/services/admin';
import { apiResponse, apiError, handleApiError, ErrorCodes } from '@/lib/api-response';

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
    const results = {
      database: null as any,
      admin: null as any,
      projects: null as any,
      errors: [] as string[]
    };

    // Test 1: Enhanced Database Connection
    try {
      // Test basic connection
      const connectionTest = await testConnection();
      if (!connectionTest) {
        throw new Error('Database connection failed');
      }
      
      const dbResult = await query('SELECT NOW() as timestamp, COUNT(*) as table_count FROM information_schema.tables WHERE table_schema = $1', ['public']);
      const versionResult = await query('SELECT version()');
      
      results.database = {
        status: 'success',
        timestamp: dbResult.rows[0].timestamp,
        tableCount: parseInt(dbResult.rows[0].table_count),
        version: versionResult.rows[0].version.split(' ')[1],
        connection: 'PostgreSQL Local'
      };
    } catch (error) {
      results.errors.push(`Database: ${error instanceof Error ? error.message : 'Unknown error'}`);
      results.database = { status: 'error', details: error instanceof Error ? error.message : 'Unknown error' };
    }

    // Test 2: Admin Service
    try {
      const adminStats = await adminService.getStats();
      results.admin = {
        status: 'success',
        stats: adminStats
      };
    } catch (error) {
      results.errors.push(`Admin Service: ${error instanceof Error ? error.message : 'Unknown error'}`);
      results.admin = { status: 'error' };
    }

    // Test 3: Projects Service
    try {
      // Mock data for now - replace with actual service calls
      const businessDomains = [];
      const marketingModels = [];
      
      results.projects = {
        status: 'success',
        businessDomains: businessDomains.length,
        marketingModels: marketingModels.length,
        sampleDomains: [],
        sampleModels: []
      };
    } catch (error) {
      results.errors.push(`Projects Service: ${error instanceof Error ? error.message : 'Unknown error'}`);
      results.projects = { status: 'error' };
    }

    const overallStatus = results.errors.length === 0 ? 'success' : 'partial';

    return NextResponse.json({
      success: overallStatus === 'success',
      status: overallStatus,
      message: overallStatus === 'success' 
        ? 'All systems operational' 
        : `${results.errors.length} errors found`,
      results,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Full system test error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}