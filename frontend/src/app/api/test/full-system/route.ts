import { NextResponse } from 'next/server';
import { query, testConnection } from '@/lib/postgres-server';
import { adminService } from '@/services/admin';
import { apiResponse, apiError, handleApiError, ErrorCodes } from '@/lib/api-response';

export async function GET() {
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
      const businessDomains = await marketingProjectsService.getBusinessDomains();
      const marketingModels = await marketingProjectsService.getMarketingModels();
      
      results.projects = {
        status: 'success',
        businessDomains: businessDomains.length,
        marketingModels: marketingModels.length,
        sampleDomains: businessDomains.slice(0, 3).map(d => ({ id: d.id, name: d.name })),
        sampleModels: marketingModels.slice(0, 3).map(m => ({ id: m.id, name: m.name, abbreviation: m.abbreviation }))
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