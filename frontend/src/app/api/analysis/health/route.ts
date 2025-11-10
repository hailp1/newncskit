import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { projectId } = body;

    if (!projectId) {
      return NextResponse.json(
        { error: 'Project ID is required' },
        { status: 400 }
      );
    }

    // Health check is now performed during upload
    // This endpoint should not be called directly
    // Return error to indicate data should come from upload
    return NextResponse.json(
      { 
        error: 'Health check is performed during CSV upload. Please use the upload endpoint.',
        suggestion: 'Upload your CSV file to get health report automatically.'
      },
      { status: 400 }
    );

  } catch (error) {
    console.error('Health check error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Health check failed' },
      { status: 500 }
    );
  }
}
