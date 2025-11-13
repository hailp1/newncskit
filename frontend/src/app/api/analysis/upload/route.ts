import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import {
  generateCorrelationId,
  createErrorResponse,
  createSuccessResponse,
  validateMethod,
  logRequest,
  getCorsHeaders,
} from '@/lib/api-middleware';
import { DataHealthService } from '@/services/data-health.service';
import { parseCsvContent } from '../lib/parser';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

// Handle OPTIONS for CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: getCorsHeaders(),
  });
}

export async function POST(request: NextRequest) {
  const correlationId = generateCorrelationId();

  try {
    logRequest(request, correlationId);

    // Check authentication with NextAuth
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return createErrorResponse('Unauthorized', 401, correlationId);
    }

    // Validate content type
    const contentType = request.headers.get('content-type');
    if (!contentType || !contentType.includes('multipart/form-data')) {
      return createErrorResponse(
        'Invalid content type. Expected multipart/form-data',
        400,
        correlationId
      );
    }

    // Parse form data
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const name = formData.get('name') as string;

    if (!file) {
      return createErrorResponse('No file provided', 400, correlationId);
    }

    console.log(`[Upload] ${correlationId}: Processing file ${file.name} (${file.size} bytes)`);

    // Read and validate file content
    const fileContent = await file.text();
    const { headers: csvHeaders, allRows, previewRows } = parseCsvContent(fileContent, correlationId);

    console.log(`[Upload] ${correlationId}: Parsed ${csvHeaders.length} headers`);

    // Perform health check
    let healthReport;
    try {
      healthReport = DataHealthService.performHealthCheck(allRows);
      console.log(`[Upload] ${correlationId}: Health check completed`);
    } catch (healthError) {
      console.error(`[Upload] ${correlationId}: Health check failed:`, healthError);
      // Continue without health report if it fails
      healthReport = null;
    }

    // Save CSV file to local storage
    const uploadsDir = join(process.cwd(), 'uploads', 'csv');
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true });
    }
    
    const fileName = `${Date.now()}-${file.name}`;
    const filePath = join(uploadsDir, fileName);
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(filePath, buffer);
    
    const relativePath = `uploads/csv/${fileName}`;
    console.log(`[Upload] ${correlationId}: File saved to ${relativePath}`);

    // Create project in database with Prisma
    const project = await prisma.analysisProject.create({
      data: {
        userId: session.user.id,
        name: name || file.name.replace('.csv', ''),
        description: `Uploaded on ${new Date().toLocaleDateString()}`,
        csvFilePath: relativePath,
        csvFileSize: file.size,
        rowCount: allRows.length - 1,
        columnCount: csvHeaders.length,
        status: 'draft',
      }
    });

    console.log(`[Upload] ${correlationId}: Project created: ${project.id}`);

    console.log(`[Upload] ${correlationId}: Project created: ${project.id}`);

    // Create variables in database with Prisma
    console.log(`[Upload] ${correlationId}: Inserting ${csvHeaders.length} variables`);
    
    try {
      const variables = await prisma.analysisVariable.createMany({
        data: csvHeaders.map((header) => ({
          projectId: project.id,
          columnName: header,
          displayName: header,
          dataType: 'numeric',
          isDemographic: false,
          missingCount: 0,
          uniqueCount: 0,
        }))
      });

      console.log(`[Upload] ${correlationId}: Created ${variables.count} variables successfully`);
    } catch (variablesError) {
      // This is critical - without variables, the project is unusable
      // Try to delete the project and fail the upload
      console.error(`[Upload] ${correlationId}: Failed to create variables:`, variablesError);
      await prisma.analysisProject.delete({ where: { id: project.id } });

      const errorMessage = variablesError instanceof Error ? variablesError.message : 'Unknown error';
      throw new Error(`Failed to create variables: ${errorMessage}`);
    }

    const responseData = {
      project: {
        id: project.id,
        name: project.name,
        rowCount: allRows.length,
        columnCount: csvHeaders.length,
      },
      preview: previewRows,
      headers: csvHeaders,
      healthReport,
    };

    console.log(`[Upload] ${correlationId}: Success - Project ${project.id} created`);

    return createSuccessResponse(responseData, correlationId);

  } catch (error) {
    console.error(`[Upload] ${correlationId}: Error:`, error);
    const errorMessage = error instanceof Error ? error.message : 'Upload failed';
    return createErrorResponse(errorMessage, 500, correlationId);
  }
}

// Handle GET - return method not allowed
export async function GET(request: NextRequest) {
  const correlationId = generateCorrelationId();
  logRequest(request, correlationId);

  return validateMethod(request, ['POST', 'OPTIONS'], correlationId)!;
}

// Handle HEAD - return method not allowed
export async function HEAD(request: NextRequest) {
  const correlationId = generateCorrelationId();
  logRequest(request, correlationId);

  return validateMethod(request, ['POST', 'OPTIONS'], correlationId)!;
}
