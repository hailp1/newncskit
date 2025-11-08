import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { ExportService } from '@/services/export.service';
import * as XLSX from 'xlsx';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check authentication
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { projectId } = await request.json();

    if (!projectId) {
      return NextResponse.json(
        { error: 'Project ID is required' },
        { status: 400 }
      );
    }

    // Get project details
    const { data: project, error: projectError } = await supabase
      .from('analysis_projects')
      .select('*')
      .eq('id', projectId)
      .eq('user_id', session.user.id)
      .single();

    if (projectError || !project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    // Get all analysis results
    const { data: results, error: resultsError } = await supabase
      .from('analysis_results')
      .select('*')
      .eq('project_id', projectId)
      .order('executed_at', { ascending: false });

    if (resultsError) {
      return NextResponse.json(
        { error: 'Failed to load results: ' + resultsError.message },
        { status: 500 }
      );
    }

    if (!results || results.length === 0) {
      return NextResponse.json(
        { error: 'No results available for export' },
        { status: 404 }
      );
    }

    // Format data for Excel
    const sheets = ExportService.formatForExcel(results, project);

    // Create workbook
    const workbook = XLSX.utils.book_new();

    // Add each sheet
    Object.entries(sheets).forEach(([sheetName, sheetData]) => {
      const data = sheetData as any[][];
      const worksheet = XLSX.utils.aoa_to_sheet(data);
      
      // Set column widths
      const maxWidths = (data as any[][]).reduce((widths: number[], row: any[]) => {
        row.forEach((cell, i) => {
          const cellLength = String(cell || '').length;
          widths[i] = Math.max(widths[i] || 10, cellLength + 2);
        });
        return widths;
      }, []);

      worksheet['!cols'] = maxWidths.map(w => ({ wch: Math.min(w, 50) }));

      XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    });

    // Generate Excel file
    const excelBuffer = XLSX.write(workbook, { 
      type: 'buffer', 
      bookType: 'xlsx' 
    });

    // Generate filename
    const filename = ExportService.generateFilename(
      (project as any).name,
      'xlsx'
    );

    // Return file as download
    return new NextResponse(excelBuffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });

  } catch (error) {
    console.error('Excel export error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}
