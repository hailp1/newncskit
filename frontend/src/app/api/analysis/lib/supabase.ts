import { createClient } from '@/lib/supabase/server';
import { ApiError } from './errors';

// Re-export the client type for convenience
export type AnalysisSupabaseClient = Awaited<ReturnType<typeof createClient>>;

/**
 * Create a Supabase server client with consistent error handling.
 */
export async function getSupabaseClient(correlationId: string): Promise<AnalysisSupabaseClient> {
  try {
    return await createClient();
  } catch (error) {
    throw new ApiError('Failed to initialize Supabase client', {
      status: 500,
      details: { correlationId },
      cause: error,
    });
  }
}

/**
 * Convenience wrapper to safely execute Supabase queries with enriched errors.
 */
export async function safeQuery<T>(
  correlationId: string,
  action: () => Promise<{ data: T | null; error: { message?: string } | null }>
): Promise<T> {
  const { data, error } = await action();

  if (error || !data) {
    throw new ApiError(error?.message ?? 'Database query failed', {
      status: 500,
      details: { correlationId },
    });
  }

  return data;
}

