// @ts-nocheck - Supabase generated types are too strict
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { CSVParserService } from '@/services/csv-parser.service';
import { DataHealthService } from '@/services/data-health.service';

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

    // Download CSV file from storage
    const { data: fileData, error: downloadError } = await supabase.storage
      .from('analysis-csv-files')
      .download(project.csv_file_path);

    if (downloadError || !fileData) {
      return NextResponse.json(
        { error: 'Failed to download CSV file' },
        { status: 500 }
      );
    }

    // Convert blob to text
    const fileContent = await fileData.text();

    // Parse CSV
    const parsed = await CSVParserService.parseCSV(fileContent);

    // Validate CSV
    const validation = CSVParserService.validateCSV(parsed);
    if (!validation.valid) {
      return NextResponse.json(
        { error: 'Invalid CSV: ' + validation.errors.join(', ') },
        { status: 400 }
      );
    }

    // Run health analysis
    const healthReport = DataHealthService.analyzeDataQuality(
      parsed.data,
      parsed.headers
    );

    // Update variables with detected types and stats
    const variableUpdates = parsed.headers.map((header) => {
      const values = parsed.data.map(row => row[header]);
      const typeInfo = CSVParserService.detectDataType(values);
      const stats = typeInfo.type === 'numeric' 
        ? CSVParserService.getNumericStats(values)
        : null;

      return {
        analysis_project_id: projectId,
        column_name: header,
        display_name: header,
        data_type: typeInfo.type,
        missing_count: typeInfo.missingCount,
        unique_count: typeInfo.uniqueCount,
        min_value: stats?.min,
        max_value: stats?.max,
        mean_value: stats?.mean,
      };
    });

    // Upsert variables (update if exists, insert if not)
    const { error: variablesError } = await supabase
      .from('analysis_variables')
      .upsert(variableUpdates, {
        onConflict: 'analysis_project_id,column_name',
      });

    if (variablesError) {
      console.error('Variables upsert error:', variablesError);
    }

    // Save health report to database
    const { error: healthError } = await supabase
      .from('data_health_reports')
      .insert({
        project_id: projectId,
        overall_score: healthReport.overallScore,
        total_rows: healthReport.totalRows,
        total_columns: healthReport.totalColumns,
        total_missing: healthReport.missingData.totalMissing,
        percentage_missing: healthReport.missingData.percentageMissing,
        variables_with_missing: healthReport.missingData.variablesWithMissing.map(v => v.variable),
        total_outliers: healthReport.outliers.totalOutliers,
        outlier_details: healthReport.outliers.variablesWithOutliers,
        numeric_count: healthReport.dataTypes.numeric,
        categorical_count: healthReport.dataTypes.categorical,
        text_count: healthReport.dataTypes.text,
        date_count: healthReport.dataTypes.date,
        recommendations: healthReport.recommendations,
        analysis_duration_ms: healthReport.analysisTime,
      });

    if (healthError) {
      console.error('Health report save error:', healthError);
    }

    return NextResponse.json({
      success: true,
      healthReport,
      variables: variableUpdates,
    });

  } catch (error) {
    console.error('Health check error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}
