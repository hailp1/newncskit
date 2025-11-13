/**
 * Result Storage Service
 * 
 * Handles storage of analysis results with automatic strategy selection
 * based on result size (database vs file system).
 */

import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { prisma } from '@/lib/prisma';

/**
 * Storage strategy threshold in KB
 * Results larger than this will be stored in the file system
 */
const STORAGE_THRESHOLD_KB = 100;

/**
 * Directory for storing large result files
 */
const RESULTS_DIRECTORY = 'uploads/results';

/**
 * Calculate the size of analysis results in KB
 * 
 * @param results - The analysis results object
 * @returns Size in KB
 */
export function calculateResultSize(results: any): number {
  const resultJson = JSON.stringify(results);
  const sizeInBytes = Buffer.byteLength(resultJson, 'utf8');
  const sizeInKB = sizeInBytes / 1024;
  return sizeInKB;
}

/**
 * Determine storage strategy based on result size
 * 
 * @param results - The analysis results object
 * @returns 'database' if results should be stored in DB, 'filesystem' otherwise
 */
export function determineStorageStrategy(results: any): 'database' | 'filesystem' {
  const sizeKB = calculateResultSize(results);
  return sizeKB > STORAGE_THRESHOLD_KB ? 'filesystem' : 'database';
}

/**
 * Store large results in the file system
 * 
 * @param projectId - The project ID
 * @param results - The analysis results to store
 * @returns The relative file path for database storage
 */
export async function storeResultsInFileSystem(
  projectId: string,
  results: any
): Promise<string> {
  // Ensure the results directory exists
  const resultsDir = join(process.cwd(), RESULTS_DIRECTORY);
  await mkdir(resultsDir, { recursive: true });

  // Generate unique filename using projectId and timestamp
  const timestamp = Date.now();
  const fileName = `${projectId}-${timestamp}.json`;
  const filePath = join(resultsDir, fileName);

  // Write results to file
  const resultJson = JSON.stringify(results, null, 2);
  await writeFile(filePath, resultJson, 'utf8');

  // Return relative path for database storage
  return `${RESULTS_DIRECTORY}/${fileName}`;
}

/**
 * Store analysis results in the database
 * 
 * @param params - Storage parameters
 * @returns The created AnalysisResult record
 */
export async function storeAnalysisResult(params: {
  projectId: string;
  analysisType: string;
  config?: Record<string, any>;
  results: any;
  executionTime?: number;
}) {
  const { projectId, analysisType, config, results, executionTime } = params;

  // Determine storage strategy
  const strategy = determineStorageStrategy(results);

  if (strategy === 'filesystem') {
    // Store large results in file system
    const resultsPath = await storeResultsInFileSystem(projectId, results);

    // Create database record with file path
    const analysisResult = await prisma.analysisResult.create({
      data: {
        projectId,
        analysisType,
        config: config || null,
        resultsPath,
        status: 'completed',
        executionTime: executionTime || null,
        executedAt: new Date(),
      },
    });

    return analysisResult;
  } else {
    // Store small results in database
    const analysisResult = await prisma.analysisResult.create({
      data: {
        projectId,
        analysisType,
        config: config || null,
        results,
        status: 'completed',
        executionTime: executionTime || null,
        executedAt: new Date(),
      },
    });

    return analysisResult;
  }
}
