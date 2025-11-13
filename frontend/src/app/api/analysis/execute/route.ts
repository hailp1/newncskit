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
import { readCsvFile, prepareDataForR, applyDemographicData } from '@/lib/csv-utils';
import { storeAnalysisResult } from '@/lib/result-storage';
import { rAnalysisService } from '@/services/r-analysis';
import { join } from 'path';

export async function POST(request: NextRequest) {
  const correlationId = generateCorrelationId();

  try {
    logRequest(request, correlationId);

    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return createErrorResponse('Unauthorized', 401, correlationId);
    }

    console.log(`[Execute] ${correlationId}: User authenticated:`, session.user.id);

    // Parse and validate request body
    const body = await request.json();
    const { projectId, analysisType, config } = body;

    if (!projectId) {
      return createErrorResponse('Project ID is required', 400, correlationId);
    }

    console.log(`[Execute] ${correlationId}: Executing ${analysisType || 'descriptive'} analysis for project ${projectId}`);

    // Retrieve project with variables and groups
    const project = await prisma.analysisProject.findUnique({
      where: { id: projectId },
      include: {
        variables: {
          include: {
            group: true
          },
          orderBy: { createdAt: 'asc' }
        },
        groups: {
          include: {
            variables: true
          }
        }
      }
    });

    if (!project) {
      return createErrorResponse('Project not found', 404, correlationId);
    }

    // Validate project ownership
    if (project.userId !== session.user.id) {
      console.warn(`[Execute] ${correlationId}: User ${session.user.id} attempted to access project ${projectId} owned by ${project.userId}`);
      return createErrorResponse('You do not have permission to access this project', 403, correlationId);
    }

    // Validate that variables exist
    if (!project.variables || project.variables.length === 0) {
      return createErrorResponse('No variables found for this project', 404, correlationId);
    }

    console.log(`[Execute] ${correlationId}: Loaded project with ${project.variables.length} variables and ${project.groups.length} groups`);

    // Read CSV file from file system
    const csvFilePath = join(process.cwd(), project.csvFilePath);
    console.log(`[Execute] ${correlationId}: Reading CSV file from ${csvFilePath}`);
    
    let csvData: string[][];
    try {
      csvData = await readCsvFile(csvFilePath);
      console.log(`[Execute] ${correlationId}: CSV file loaded with ${csvData.length} rows`);
    } catch (error) {
      console.error(`[Execute] ${correlationId}: Failed to read CSV file:`, error);
      return createErrorResponse(
        `Failed to read CSV file: ${error instanceof Error ? error.message : 'Unknown error'}`,
        500,
        correlationId
      );
    }

    // Prepare data for R service
    console.log(`[Execute] ${correlationId}: Preparing data for R service`);
    
    // Convert database variables to the format expected by prepareDataForR
    const variables = project.variables.map(v => ({
      columnName: v.columnName,
      displayName: v.displayName,
      dataType: v.dataType,
      isDemographic: v.isDemographic,
      demographicType: v.demographicType,
      group: v.group ? { name: v.group.name } : null
    }));

    // Convert database groups to the format expected by prepareDataForR
    const groups = project.groups.map(g => ({
      name: g.name,
      variables: g.variables.map(v => ({ columnName: v.columnName }))
    }));

    // Transform data to R-compatible format
    let rData = prepareDataForR(csvData, variables, groups);

    // Apply demographic processing if demographic variables exist
    const demographicVars = variables.filter(v => v.isDemographic);
    if (demographicVars.length > 0) {
      console.log(`[Execute] ${correlationId}: Applying demographic processing for ${demographicVars.length} demographic variables`);
      rData = applyDemographicData(rData, variables);
    }

    // Execute analysis using R service
    const startTime = Date.now();
    const effectiveAnalysisType = analysisType || 'descriptive';
    
    console.log(`[Execute] ${correlationId}: Calling R service for ${effectiveAnalysisType} analysis`);
    
    let results: any;
    try {
      switch (effectiveAnalysisType) {
        case 'descriptive':
          results = await rAnalysisService.descriptiveAnalysis(
            csvData,
            rData.variables
          );
          break;
        
        case 'reliability':
          if (Object.keys(rData.groups).length === 0) {
            return createErrorResponse(
              'Reliability analysis requires at least one variable group',
              400,
              correlationId
            );
          }
          results = await rAnalysisService.reliabilityAnalysis(
            csvData,
            rData.groups
          );
          break;
        
        case 'efa':
          const efaVariables = rData.variables.numeric;
          if (efaVariables.length < 3) {
            return createErrorResponse(
              'EFA requires at least 3 numeric variables',
              400,
              correlationId
            );
          }
          results = await rAnalysisService.exploratoryFactorAnalysis(
            csvData,
            efaVariables,
            config?.nFactors
          );
          break;
        
        case 'cfa':
          if (!config?.modelSyntax) {
            return createErrorResponse(
              'CFA requires model syntax in config',
              400,
              correlationId
            );
          }
          results = await rAnalysisService.confirmatoryFactorAnalysis(
            csvData,
            config.modelSyntax
          );
          break;
        
        case 'sem':
          if (!config?.modelSyntax) {
            return createErrorResponse(
              'SEM requires model syntax in config',
              400,
              correlationId
            );
          }
          results = await rAnalysisService.structuralEquationModeling(
            csvData,
            config.modelSyntax
          );
          break;
        
        case 'vif':
          if (!config?.dependent || !config?.independent) {
            return createErrorResponse(
              'VIF analysis requires dependent and independent variables in config',
              400,
              correlationId
            );
          }
          results = await rAnalysisService.vifAnalysis(
            csvData,
            config.dependent,
            config.independent
          );
          break;
        
        case 'anova':
          if (!config?.dependent || !config?.independent) {
            return createErrorResponse(
              'ANOVA requires dependent and independent variables in config',
              400,
              correlationId
            );
          }
          results = await rAnalysisService.anovaAnalysis(
            csvData,
            config.dependent,
            config.independent
          );
          break;
        
        case 'ttest':
          if (!config?.dependent || !config?.independent) {
            return createErrorResponse(
              'T-test requires dependent and independent variables in config',
              400,
              correlationId
            );
          }
          results = await rAnalysisService.ttestAnalysis(
            csvData,
            config.dependent,
            config.independent,
            config.testType || 'independent'
          );
          break;
        
        default:
          return createErrorResponse(
            `Unknown analysis type: ${effectiveAnalysisType}`,
            400,
            correlationId
          );
      }
      
      const executionTime = Date.now() - startTime;
      console.log(`[Execute] ${correlationId}: R service completed in ${executionTime}ms`);
      
    } catch (error: any) {
      console.error(`[Execute] ${correlationId}: R service error:`, error);
      
      // Check for timeout errors
      if (error.name === 'AbortError' || error.message?.includes('timeout')) {
        return createErrorResponse(
          'Analysis execution timed out. Please try with a smaller dataset or simpler analysis.',
          500,
          correlationId
        );
      }
      
      // Return R service error details
      const errorMessage = error.userMessage?.message || error.message || 'R service execution failed';
      return createErrorResponse(
        `Analysis failed: ${errorMessage}`,
        500,
        correlationId
      );
    }

    // Store analysis results
    const executionTime = Date.now() - startTime;
    console.log(`[Execute] ${correlationId}: Storing analysis results`);
    
    let analysisResult;
    try {
      analysisResult = await storeAnalysisResult({
        projectId,
        analysisType: effectiveAnalysisType,
        config: config || undefined,
        results,
        executionTime
      });
      
      console.log(`[Execute] ${correlationId}: Results stored with ID ${analysisResult.id}`);
    } catch (error) {
      console.error(`[Execute] ${correlationId}: Failed to store results:`, error);
      return createErrorResponse(
        'Analysis completed but failed to store results',
        500,
        correlationId
      );
    }

    // Return success response
    const responseData = {
      analysisId: analysisResult.id,
      projectId,
      results,
      executedAt: analysisResult.executedAt.toISOString()
    };

    console.log(`[Execute] ${correlationId}: Analysis execution completed successfully`);
    
    return createSuccessResponse(responseData, correlationId);

  } catch (error) {
    console.error(`[Execute] ${correlationId}: Error:`, error);
    const errorMessage = error instanceof Error ? error.message : 'Analysis execution failed';
    return createErrorResponse(errorMessage, 500, correlationId);
  }
}
