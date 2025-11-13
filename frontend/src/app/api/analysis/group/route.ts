import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { VariableGroupingService } from '@/services/variable-grouping.service';
import { DemographicService } from '@/services/demographic.service';
import { RoleSuggestionService } from '@/services/role-suggestion.service';
import {
  createErrorResponse,
  createSuccessResponse,
  generateCorrelationId,
  logRequest,
} from '@/lib/api-middleware';

export async function POST(request: NextRequest) {
  const correlationId = generateCorrelationId();

  try {
    logRequest(request, correlationId);

    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return createErrorResponse('Unauthorized', 401, correlationId);
    }

    const body = await request.json();
    const { projectId } = body;

    if (!projectId) {
      return createErrorResponse('Project ID is required', 400, correlationId);
    }

    // Load project from database with Prisma
    const project = await prisma.analysisProject.findUnique({
      where: { id: projectId }
    });

    if (!project) {
      return createErrorResponse('Project not found', 404, correlationId);
    }

    // Load variables from database with Prisma
    console.log(`[Group] ${correlationId}: Loading variables for project:`, projectId);
    const dbVariables = await prisma.analysisVariable.findMany({
      where: { projectId },
      orderBy: { createdAt: 'asc' }
    });

    console.log(`[Group] ${correlationId}: Loaded ${dbVariables.length} variables`);

    // Convert database variables to AnalysisVariable format
    const variables = dbVariables.map((v) => ({
      id: v.id,
      projectId: v.projectId,
      columnName: v.columnName,
      displayName: v.displayName,
      dataType: (v.dataType || 'numeric') as 'numeric' | 'categorical' | 'text' | 'date',
      isDemographic: v.isDemographic || false,
      missingCount: v.missingCount || 0,
      uniqueCount: v.uniqueCount || 0,
      createdAt: v.createdAt.toISOString()
    }));

    if (variables.length === 0) {
      return createErrorResponse('No variables found for project', 404, correlationId);
    }

    // Get grouping suggestions using the service
    const groupingSuggestions = VariableGroupingService.suggestGroupsCaseInsensitive(variables);

    // Get demographic suggestions
    const demographicSuggestions = DemographicService.detectDemographics(variables);

    // Generate role suggestions for variables
    const roleSuggestions = RoleSuggestionService.suggestRoles(variables);

    // Generate latent variable suggestions for groups
    const groupsForLatent = groupingSuggestions.map(s => ({
      id: `group-${s.suggestedName}`,
      name: s.suggestedName,
      variables: s.variables,
      projectId,
      createdAt: new Date(),
      updatedAt: new Date(),
      isCustom: false
    }));
    const latentSuggestions = RoleSuggestionService.suggestLatentVariables(groupsForLatent);

    return createSuccessResponse(
      {
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
        roleSuggestions: roleSuggestions.filter(r => r.suggestedRole !== 'none'),
        latentSuggestions,
        totalVariables: variables.length,
        suggestedGroups: groupingSuggestions.length,
        suggestedDemographics: demographicSuggestions.length
      },
      correlationId
    );

  } catch (error) {
    console.error(`[Group] ${correlationId}: Error:`, error);
    const errorMessage = error instanceof Error ? error.message : 'Grouping failed';
    return createErrorResponse(errorMessage, 500, correlationId);
  }
}
