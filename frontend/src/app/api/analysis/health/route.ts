import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { DataHealthService } from '@/services/data-health.service';
import Papa from 'papaparse';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await request.json();
    const { projectId } = body;

    if (!projectId) {
      return NextResponse.json(
        { error: 'Project ID is required' },
        { status: 400 }
      );
    }

    // Load project from database
    const { data: project, error: projectError } = await supabase
      .from('analysis_projects')
      .select('*')
      .eq('id', projectId)
      .single();

    if (projectError || !project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    // Load CSV file from storage or inline data
    let fileContent: string;
    const csvFilePath = (project as any).csv_file_path;
    
    if (csvFilePath.startsWith('inline:')) {
      // CSV stored inline in database
      fileContent = csvFilePath.substring(7); // Remove 'inline:' prefix
      console.log('[Health] Loading CSV from inline storage');
    } else {
      // CSV stored in Supabase Storage
      const { data: fileData, error: downloadError } = await supabase.storage
        .from('analysis-csv-files')
        .download(csvFilePath);

      if (downloadError || !fileData) {
        return NextResponse.json(
          { error: 'Failed to load CSV file from storage' },
          { status: 500 }
        );
      }

      fileContent = await fileData.text();
      console.log('[Health] Loading CSV from Supabase Storage');
    }
    const parsed = Papa.parse(fileContent, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
    });

    if (parsed.errors.length > 0) {
      return NextResponse.json(
        { error: 'CSV parsing failed' },
        { status: 500 }
      );
    }

    // Perform health check
    const healthReport = DataHealthService.performHealthCheck([
      Object.keys(parsed.data[0] || {}),
      ...parsed.data.map((row: any) => Object.values(row))
    ]);

    // Load variables
    const { data: variables } = await supabase
      .from('analysis_variables')
      .select('*')
      .eq('analysis_project_id', projectId);

    return NextResponse.json({
      success: true,
      healthReport,
      variables: variables || [],
    });

  } catch (error) {
    console.error('Health check error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Health check failed' },
      { status: 500 }
    );
  }
}
