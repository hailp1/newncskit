import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { projectId, demographics } = body;

    if (!projectId) {
      return NextResponse.json(
        { error: 'Project ID is required' },
        { status: 400 }
      );
    }

    // Mock save response
    return NextResponse.json({
      success: true,
      message: 'Demographics saved successfully',
      count: demographics?.length || 0
    });

  } catch (error) {
    console.error('Save demographics error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Save failed' },
      { status: 500 }
    );
  }
}
