/**
 * Permission Cache Utility
 * Caches user permissions to reduce database queries
 */

import { Permission } from './constants'

interface CacheEntry {
  permissions: Permission[]
  expires: number
}

// Cache TTL: 5 minutes
const CACHE_TTL = 5 * 60 * 1000

// In-memory cache
const cache = new Map<string, CacheEntry>()

/**
 * Get permissions from cache
 */
export function getFromCache(userId: string): Permission[] | null {
  const entry = cache.get(userId)
  
  if (!entry) {
    return null
  }
  
  // Check if expired
  if (Date.now() > entry.expires) {
    cache.delete(userId)
    return null
  }
  
  return entry.permissions
}

/**
 * Set permissions in cache
 */
export function setCache(userId: string, permissions: Permission[]): void {
  cache.set(userId, {
    permissions,
    expires: Date.now() + CACHE_TTL,
  })
}

/**
 * Invalidate cache for a user
 */
export function invalidateCache(userId: string): void {
  cache.delete(userId)
}

/**
 * Clear all cache
 */
export function clearCache(): void {
  cache.clear()
}

/**
 * Get cache stats (for monitoring)
 */
export function getCacheStats() {
  return {
    size: cache.size,
    entries: Array.from(cache.entries()).map(([userId, entry]) => ({
      userId,
      permissionCount: entry.permissions.length,
      expiresIn: Math.max(0, entry.expires - Date.now()),
    })),
  }
}
