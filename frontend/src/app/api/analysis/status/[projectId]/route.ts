import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
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

    const { projectId } = await params;

    // Get project status
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

    // Get analysis results
    const { data: results, error: resultsError } = await supabase
      .from('analysis_results')
      .select('*')
      .eq('project_id', projectId)
      .order('executed_at', { ascending: false });

    if (resultsError) {
      console.error('Error loading results:', resultsError);
    }

    // Get analysis configurations
    const { data: configs, error: configsError } = await supabase
      .from('analysis_configurations')
      .select('*')
      .eq('project_id', projectId)
      .eq('is_enabled', true);

    if (configsError) {
      console.error('Error loading configs:', configsError);
    }

    const totalAnalyses = configs?.length || 0;
    const completedAnalyses = results?.length || 0;
    const progress = totalAnalyses > 0 ? (completedAnalyses / totalAnalyses) * 100 : 0;

    return NextResponse.json({
      success: true,
      project: {
        id: (project as any).id,
        name: (project as any).name,
        status: (project as any).status,
        updatedAt: (project as any).updated_at,
      },
      progress: {
        total: totalAnalyses,
        completed: completedAnalyses,
        percentage: Math.round(progress),
      },
      results: results || [],
    });

  } catch (error) {
    console.error('Status check error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}
