/**
 * Analysis Result Caching
 * Simple file-based caching for analysis results
 */

import { writeFile, readFile, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'
import { createHash } from 'crypto'

const CACHE_DIR = path.join(process.cwd(), '.cache', 'analysis')

interface CachedAnalysis {
  datasetId: string
  analysisType: string
  parameters: any
  results: any
  timestamp: string
  expiresAt: string
}

/**
 * Generate cache key from analysis parameters
 */
function generateCacheKey(
  datasetId: string,
  analysisType: string,
  parameters: any
): string {
  const data = JSON.stringify({ datasetId, analysisType, parameters })
  return createHash('md5').update(data).digest('hex')
}

/**
 * Ensure cache directory exists
 */
async function ensureCacheDir() {
  if (!existsSync(CACHE_DIR)) {
    await mkdir(CACHE_DIR, { recursive: true })
  }
}

/**
 * Get cached analysis result
 */
export async function getCachedAnalysis(
  datasetId: string,
  analysisType: string,
  parameters: any = {}
): Promise<any | null> {
  try {
    await ensureCacheDir()

    const cacheKey = generateCacheKey(datasetId, analysisType, parameters)
    const cachePath = path.join(CACHE_DIR, `${cacheKey}.json`)

    if (!existsSync(cachePath)) {
      return null
    }

    const cacheContent = await readFile(cachePath, 'utf-8')
    const cached: CachedAnalysis = JSON.parse(cacheContent)

    // Check if cache is expired
    const now = new Date()
    const expiresAt = new Date(cached.expiresAt)

    if (now > expiresAt) {
      // Cache expired
      return null
    }

    return cached.results
  } catch (error) {
    console.error('Error reading cache:', error)
    return null
  }
}

/**
 * Save analysis result to cache
 */
export async function setCachedAnalysis(
  datasetId: string,
  analysisType: string,
  parameters: any = {},
  results: any,
  ttlHours: number = 24
): Promise<void> {
  try {
    await ensureCacheDir()

    const cacheKey = generateCacheKey(datasetId, analysisType, parameters)
    const cachePath = path.join(CACHE_DIR, `${cacheKey}.json`)

    const now = new Date()
    const expiresAt = new Date(now.getTime() + ttlHours * 60 * 60 * 1000)

    const cached: CachedAnalysis = {
      datasetId,
      analysisType,
      parameters,
      results,
      timestamp: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
    }

    await writeFile(cachePath, JSON.stringify(cached, null, 2), 'utf-8')
  } catch (error) {
    console.error('Error writing cache:', error)
    // Don't throw - caching is optional
  }
}

/**
 * Clear all cached results for a dataset
 */
export async function clearDatasetCache(datasetId: string): Promise<void> {
  // This would require scanning all cache files
  // For now, we'll just let them expire naturally
  console.log(`Cache clear requested for dataset ${datasetId}`)
}
