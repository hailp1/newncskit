import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import Papa from 'papaparse';

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const PREVIEW_ROWS = 10;

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

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const name = formData.get('name') as string || file.name.replace('.csv', '');

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!file.name.endsWith('.csv') && file.type !== 'text/csv') {
      return NextResponse.json(
        { error: 'Invalid file type. Only CSV files are allowed' },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `File too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB` },
        { status: 400 }
      );
    }

    // Read file content
    const fileContent = await file.text();

    // Parse CSV to validate and get info
    const parseResult = await new Promise<Papa.ParseResult<any>>((resolve, reject) => {
      Papa.parse(fileContent, {
        header: true,
        skipEmptyLines: true,
        complete: resolve,
        error: reject,
      });
    });

    if (parseResult.errors.length > 0) {
      const criticalErrors = parseResult.errors.filter(e => e.type === 'Quotes' || e.type === 'FieldMismatch');
      if (criticalErrors.length > 0) {
        return NextResponse.json(
          { error: 'Invalid CSV format: ' + criticalErrors[0].message },
          { status: 400 }
        );
      }
    }

    const data = parseResult.data;
    const headers = parseResult.meta.fields || [];

    if (headers.length === 0) {
      return NextResponse.json(
        { error: 'CSV file has no headers' },
        { status: 400 }
      );
    }

    if (data.length === 0) {
      return NextResponse.json(
        { error: 'CSV file has no data rows' },
        { status: 400 }
      );
    }

    // Upload file to Supabase Storage
    const fileName = `${Date.now()}_${file.name}`;
    const filePath = `${session.user.id}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('analysis-csv-files')
      .upload(filePath, file, {
        contentType: 'text/csv',
        upsert: false,
      });

    if (uploadError) {
      console.error('Storage upload error:', uploadError);
      return NextResponse.json(
        { error: 'Failed to upload file: ' + uploadError.message },
        { status: 500 }
      );
    }

    // Create analysis project record
    const { data: project, error: dbError } = await supabase
      .from('analysis_projects')
      .insert({
        user_id: session.user.id,
        name: name,
        csv_file_path: filePath,
        csv_file_size: file.size,
        row_count: data.length,
        column_count: headers.length,
        status: 'draft',
      })
      .select()
      .single();

    if (dbError) {
      // Clean up uploaded file if database insert fails
      await supabase.storage
        .from('analysis-csv-files')
        .remove([filePath]);

      console.error('Database error:', dbError);
      return NextResponse.json(
        { error: 'Failed to create project: ' + dbError.message },
        { status: 500 }
      );
    }

    // Create initial variable records
    const variables = headers.map((header) => ({
      analysis_project_id: project.id,
      column_name: header,
      display_name: header,
    }));

    const { error: variablesError } = await supabase
      .from('analysis_variables')
      .insert(variables);

    if (variablesError) {
      console.error('Variables insert error:', variablesError);
      // Continue anyway, variables can be created later
    }

    // Get preview data (first 10 rows)
    const preview = data.slice(0, PREVIEW_ROWS);

    return NextResponse.json({
      success: true,
      project: {
        id: project.id,
        name: project.name,
        rowCount: data.length,
        columnCount: headers.length,
        status: project.status,
      },
      preview: preview,
      headers: headers,
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}
