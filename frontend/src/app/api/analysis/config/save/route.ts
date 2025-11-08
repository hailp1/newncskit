import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { AnalysisType } from '@/types/analysis';

interface AnalysisConfig {
  type: AnalysisType;
  config: any;
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

    const { projectId, analyses } = await request.json();

    if (!projectId) {
      return NextResponse.json(
        { error: 'Project ID is required' },
        { status: 400 }
      );
    }

    if (!analyses || !Array.isArray(analyses)) {
      return NextResponse.json(
        { error: 'Analyses array is required' },
        { status: 400 }
      );
    }

    // Verify project ownership
    const { data: project, error: projectError } = await supabase
      .from('analysis_projects')
      .select('id')
      .eq('id', projectId)
      .eq('user_id', session.user.id)
      .single();

    if (projectError || !project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    // Delete existing configurations
    await (supabase
      .from('analysis_configurations') as any)
      .delete()
      .eq('project_id', projectId);

    // Insert new configurations
    const configurationsToInsert = (analyses as AnalysisConfig[]).map((analysis) => ({
      project_id: projectId,
      analysis_type: analysis.type,
      configuration: analysis.config || {},
      is_enabled: true,
    }));

    const { error: insertError } = await (supabase
      .from('analysis_configurations') as any)
      .insert(configurationsToInsert);

    if (insertError) {
      return NextResponse.json(
        { error: 'Failed to save configurations: ' + insertError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Analysis configurations saved successfully',
      configCount: analyses.length,
    });

  } catch (error) {
    console.error('Save config error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}
