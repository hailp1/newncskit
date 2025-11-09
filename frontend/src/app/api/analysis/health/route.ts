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

    // Mock health report
    const healthReport = {
      projectId,
      totalRows: 500,
      totalColumns: 30,
      missingDataPercentage: 2.5,
      duplicateRows: 3,
      outliers: 5,
      dataQualityScore: 92,
      issues: [
        {
          type: 'missing_data',
          severity: 'low',
          count: 12,
          columns: ['age', 'income'],
          message: '12 missing values detected in 2 columns'
        },
        {
          type: 'duplicates',
          severity: 'medium',
          count: 3,
          message: '3 duplicate rows found'
        }
      ],
      recommendations: [
        'Consider imputing missing values in age and income columns',
        'Review and remove duplicate entries',
        'Check outliers in numeric columns'
      ]
    };

    // Mock variables
    const variables = [
      {
        id: '1',
        projectId,
        columnName: 'age',
        dataType: 'numeric',
        isDemographic: false,
        missingCount: 5,
        uniqueCount: 45,
        minValue: 18,
        maxValue: 65,
        meanValue: 32.5,
        createdAt: new Date().toISOString()
      },
      {
        id: '2',
        projectId,
        columnName: 'gender',
        dataType: 'categorical',
        isDemographic: false,
        missingCount: 0,
        uniqueCount: 3,
        createdAt: new Date().toISOString()
      },
      {
        id: '3',
        projectId,
        columnName: 'satisfaction_score',
        dataType: 'numeric',
        isDemographic: false,
        missingCount: 2,
        uniqueCount: 5,
        minValue: 1,
        maxValue: 5,
        meanValue: 3.8,
        createdAt: new Date().toISOString()
      }
    ];

    return NextResponse.json({
      success: true,
      healthReport,
      variables
    });

  } catch (error) {
    console.error('Health check error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Health check failed' },
      { status: 500 }
    );
  }
}
