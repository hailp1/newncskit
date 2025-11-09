import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const name = formData.get('name') as string;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Read file content
    const text = await file.text();
    const lines = text.split('\n').filter(line => line.trim());
    
    if (lines.length < 2) {
      return NextResponse.json(
        { error: 'File must contain at least a header row and one data row' },
        { status: 400 }
      );
    }

    // Parse CSV header
    const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
    
    // Parse first few rows for preview
    const previewRows = lines.slice(1, Math.min(6, lines.length)).map(line => {
      const values = line.split(',').map(v => v.trim().replace(/^"|"$/g, ''));
      const row: Record<string, string> = {};
      headers.forEach((header, index) => {
        row[header] = values[index] || '';
      });
      return row;
    });

    // Generate project ID
    const projectId = `project-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Store in localStorage (temporary solution)
    const projectData = {
      id: projectId,
      name: name || file.name.replace('.csv', ''),
      fileName: file.name,
      fileSize: file.size,
      rowCount: lines.length - 1,
      columnCount: headers.length,
      headers,
      data: text,
      uploadedAt: new Date().toISOString()
    };

    return NextResponse.json({
      success: true,
      project: {
        id: projectId,
        name: projectData.name,
        rowCount: projectData.rowCount,
        columnCount: projectData.columnCount
      },
      preview: previewRows,
      headers
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Upload failed' },
      { status: 500 }
    );
  }
}
