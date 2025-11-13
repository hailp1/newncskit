import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { ExportService } from '@/services/export.service';
import writeXlsxFile from 'write-excel-file/node';

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

    const sheetEntries = Object.entries(sheets);

    const formatCellValue = (value: any) => {
      if (value === null || value === undefined) {
        return null;
      }
      if (value instanceof Date) {
        return { value, type: Date, format: 'yyyy-mm-dd' };
      }
      if (typeof value === 'number') {
        return { value, type: Number };
      }
      if (typeof value === 'boolean') {
        return { value, type: Boolean };
      }
      return { value: value.toString() };
    };

    const dataSheets = sheetEntries.map(([, sheetData]) =>
      (sheetData as any[][]).map((row) => row.map((cell) => formatCellValue(cell)))
    );

    const columnConfigs = sheetEntries.map(([, sheetData]) => {
      const widths: number[] = [];
      (sheetData as any[][]).forEach((row) => {
        row.forEach((cell, idx) => {
          const length = cell === null || cell === undefined ? 0 : cell.toString().length;
          widths[idx] = Math.min(Math.max(widths[idx] || 10, length + 2), 50);
        });
      });
      return widths.map((width) => ({ width }));
    });

    const excelBuffer = await writeXlsxFile(dataSheets, {
      sheets: sheetEntries.map(([name]) => name),
      columns: columnConfigs,
      buffer: true,
      dateFormat: 'yyyy-mm-dd'
    });

    // Generate filename
    const filename = ExportService.generateFilename(
      (project as any).name,
      'xlsx'
    );

    // Return file as download
    // Convert Buffer to ArrayBuffer for NextResponse compatibility
    let responseBody: BodyInit;
    if (excelBuffer instanceof Buffer) {
      // Create a new ArrayBuffer from the Buffer
      const arrayBuffer = new ArrayBuffer(excelBuffer.length);
      const view = new Uint8Array(arrayBuffer);
      view.set(excelBuffer);
      responseBody = arrayBuffer;
    } else if (excelBuffer instanceof Uint8Array) {
      // Create a new ArrayBuffer from the Uint8Array
      const arrayBuffer = new ArrayBuffer(excelBuffer.length);
      const view = new Uint8Array(arrayBuffer);
      view.set(excelBuffer);
      responseBody = arrayBuffer;
    } else {
      responseBody = excelBuffer;
    }
    
    return new NextResponse(responseBody, {
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
