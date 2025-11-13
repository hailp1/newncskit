import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import {
  createErrorResponse,
  createSuccessResponse,
  generateCorrelationId,
  logRequest,
} from '@/lib/api-middleware';

export async function GET(request: NextRequest) {
  const correlationId = generateCorrelationId();

  try {
    logRequest(request, correlationId);

    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return createErrorResponse('Unauthorized', 401, correlationId);
    }

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');

    if (!projectId) {
      return createErrorResponse('Project ID is required', 400, correlationId);
    }

    // Load variables from database with Prisma
    console.log(`[Variables] ${correlationId}: Loading for project:`, projectId);
    const dbVariables = await prisma.analysisVariable.findMany({
      where: { projectId },
      orderBy: { createdAt: 'asc' }
    });

    console.log(`[Variables] ${correlationId}: Loaded ${dbVariables.length} variables`);

    // Convert database variables to AnalysisVariable format
    const variables = dbVariables.map((v) => ({
      id: v.id,
      projectId: v.projectId,
      columnName: v.columnName,
      displayName: v.displayName,
      semanticName: v.semanticName,
      dataType: v.dataType || 'numeric',
      isDemographic: v.isDemographic || false,
      demographicType: v.demographicType,
      missingCount: v.missingCount || 0,
      uniqueCount: v.uniqueCount || 0,
      createdAt: v.createdAt
    }));

    return createSuccessResponse({ variables }, correlationId);

  } catch (error) {
    console.error(`[Variables] ${correlationId}: Error:`, error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to load variables';
    return createErrorResponse(errorMessage, 500, correlationId);
  }
}
