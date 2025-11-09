import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { projectId, groups, demographics } = body;

    if (!projectId) {
      return NextResponse.json(
        { error: 'Project ID is required' },
        { status: 400 }
      );
    }

    // Mock save response
    return NextResponse.json({
      success: true,
      message: 'Groups saved successfully',
      groupCount: groups?.length || 0,
      demographicCount: demographics?.length || 0
    });

  } catch (error) {
    console.error('Save groups error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Save failed' },
      { status: 500 }
    );
  }
}
