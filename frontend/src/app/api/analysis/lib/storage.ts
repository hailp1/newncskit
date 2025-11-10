import { ApiError } from './errors';
import type { AnalysisSupabaseClient } from './supabase';

const CSV_BUCKET = 'analysis-csv-files';

export interface UploadCsvResult {
  path: string;
  fromStorage: boolean;
}

/**
 * Upload CSV file to Supabase Storage with fallback to inline storage.
 */
export async function uploadCsvFile(
  client: AnalysisSupabaseClient,
  params: {
    userId: string;
    file: File;
    fileContent: string;
    correlationId: string;
  }
): Promise<UploadCsvResult> {
  const { userId, file, fileContent, correlationId } = params;
  const storagePath = `${userId}/${Date.now()}-${file.name}`;

  try {
    const { error } = await client.storage
      .from(CSV_BUCKET)
      .upload(storagePath, file, {
        contentType: 'text/csv',
        upsert: false,
      });

    if (error) {
      console.warn('[Storage] Upload failed, falling back to inline storage', {
        correlationId,
        error,
      });
      return {
        path: `inline:${fileContent.substring(0, 1_000_000)}`,
        fromStorage: false,
      };
    }

    return { path: storagePath, fromStorage: true };
  } catch (error) {
    console.warn('[Storage] Unexpected error during upload, using inline fallback', {
      correlationId,
      error,
    });
    return {
      path: `inline:${fileContent.substring(0, 1_000_000)}`,
      fromStorage: false,
    };
  }
}

/**
 * Download previously uploaded CSV file.
 */
export async function downloadCsvFile(
  client: AnalysisSupabaseClient,
  params: { path: string; correlationId: string }
): Promise<string> {
  const { path, correlationId } = params;

  if (path.startsWith('inline:')) {
    return path.substring(7);
  }

  const { data, error } = await client.storage.from(CSV_BUCKET).download(path);

  if (error || !data) {
    throw new ApiError('Failed to load CSV file from storage', {
      status: 500,
      details: { correlationId, path },
      cause: error,
    });
  }

  return await data.text();
}

