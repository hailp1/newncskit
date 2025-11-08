import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { ExportService } from '@/services/export.service';

// Helper function to generate HTML
function generateHTML(data: any): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${data.title}</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      margin: 40px;
      color: #333;
    }
    h1 {
      color: #2563eb;
      border-bottom: 3px solid #2563eb;
      padding-bottom: 10px;
    }
    h2 {
      color: #1e40af;
      margin-top: 30px;
      border-bottom: 1px solid #ddd;
      padding-bottom: 5px;
    }
    .header {
      text-align: center;
      margin-bottom: 40px;
    }
    .subtitle {
      color: #666;
      font-size: 18px;
    }
    .date {
      color: #999;
      font-size: 14px;
    }
    .section {
      margin: 30px 0;
      page-break-inside: avoid;
    }
    .content-item {
      margin: 10px 0;
      padding: 10px;
      background: #f9fafb;
      border-left: 3px solid #2563eb;
    }
    .label {
      font-weight: bold;
      color: #1e40af;
    }
    .value {
      margin-left: 10px;
    }
    pre {
      background: #f3f4f6;
      padding: 15px;
      border-radius: 5px;
      overflow-x: auto;
      font-size: 12px;
    }
    @media print {
      body {
        margin: 20px;
      }
      .section {
        page-break-inside: avoid;
      }
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>${data.title}</h1>
    <div class="subtitle">${data.subtitle}</div>
    <div class="date">Generated on ${data.date}</div>
  </div>

  ${data.sections.map((section: any) => `
    <div class="section">
      <h2>${section.title}</h2>
      ${section.executedAt ? `<p><strong>Executed:</strong> ${section.executedAt}</p>` : ''}
      ${section.executionTime ? `<p><strong>Execution Time:</strong> ${section.executionTime}</p>` : ''}
      ${section.content.map((item: any) => `
        <div class="content-item">
          <span class="label">${item.label}:</span>
          <span class="value">${typeof item.value === 'object' ? `<pre>${JSON.stringify(item.value, null, 2)}</pre>` : item.value}</span>
        </div>
      `).join('')}
    </div>
  `).join('')}

  <script>
    // Auto-print on load (optional)
    // window.onload = () => window.print();
  </script>
</body>
</html>
  `.trim();
}

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

    // Format data for PDF
    const pdfData = ExportService.formatForPDF(results, project);

    // Generate HTML for PDF (simplified version)
    const html = generateHTML(pdfData);

    // For now, return HTML that can be printed to PDF
    // In production, you would use a library like puppeteer or jsPDF
    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html',
        'Content-Disposition': `inline; filename="${ExportService.generateFilename((project as any).name, 'pdf')}"`,
      },
    });

  } catch (error) {
    console.error('PDF export error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}
