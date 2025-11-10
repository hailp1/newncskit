import { NextRequest, NextResponse } from 'next/server';
import { VariableGroupingService } from '@/services/variable-grouping.service';
import { DemographicService } from '@/services/demographic.service';

// In-memory cache for uploaded data (temporary solution)
// TODO: Replace with proper database storage
const uploadCache = new Map<string, { headers: string[], preview: any[] }>();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { projectId, headers, preview } = body;

    if (!projectId) {
      return NextResponse.json(
        { error: 'Project ID is required' },
        { status: 400 }
      );
    }

    // Store data in cache if provided
    if (headers && preview) {
      uploadCache.set(projectId, { headers, preview });
    }

    // Get data from cache
    const cachedData = uploadCache.get(projectId);
    
    if (!cachedData) {
      return NextResponse.json(
        { error: 'No data found for project. Please upload CSV first.' },
        { status: 404 }
      );
    }

    // Create mock AnalysisVariable objects from headers
    const variables = cachedData.headers.map((header, index) => ({
      id: `var-${index}`,
      projectId,
      columnName: header,
      dataType: 'numeric' as const, // Will be detected properly later
      isDemographic: false,
      missingCount: 0,
      uniqueCount: 0,
      createdAt: new Date().toISOString()
    }));

    // Get grouping suggestions using the service
    const groupingSuggestions = VariableGroupingService.suggestGroupsCaseInsensitive(variables);

    // Get demographic suggestions
    const demographicSuggestions = DemographicService.detectDemographics(variables);

    return NextResponse.json({
      success: true,
      suggestions: groupingSuggestions.map(s => ({
        groupName: s.suggestedName,
        variables: s.variables,
        confidence: s.confidence,
        reasoning: s.reason
      })),
      demographics: demographicSuggestions.map(d => ({
        variable: d.variable,
        confidence: d.confidence,
        reasons: d.reasons,
        suggestedType: d.type
      })),
      totalVariables: variables.length,
      suggestedGroups: groupingSuggestions.length,
      suggestedDemographics: demographicSuggestions.length
    });

  } catch (error) {
    console.error('Grouping error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Grouping failed' },
      { status: 500 }
    );
  }
}
