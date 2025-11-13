// Analytics Cache Layer using in-memory cache
// TODO: Consider using Redis or database-backed cache for production
import crypto from 'crypto'

export interface CacheEntry {
  key: string
  data: any
  created_at: string
  expires_at: string
}

const CACHE_TTL = 3600 // 1 hour in seconds

class AnalyticsCache {
  private cache: Map<string, CacheEntry> = new Map()
  private cleanupInterval: NodeJS.Timeout | null = null

  constructor() {
    // Start cleanup interval (every 5 minutes)
    this.cleanupInterval = setInterval(() => {
      this.clearExpired()
    }, 5 * 60 * 1000)
  }

  /**
   * Generate cache key from request
   */
  private generateKey(endpoint: string, params: any): string {
    const data = JSON.stringify({ endpoint, params })
    return crypto.createHash('sha256').update(data).digest('hex')
  }

  /**
   * Get cached result
   */
  async get(endpoint: string, params: any): Promise<any | null> {
    try {
      const key = this.generateKey(endpoint, params)
      const entry = this.cache.get(key)

      if (!entry) return null

      const now = new Date()
      const expiresAt = new Date(entry.expires_at)

      if (now > expiresAt) {
        this.cache.delete(key)
        return null
      }

      return entry.data
    } catch (error) {
      console.error('Cache get error:', error)
      return null
    }
  }

  /**
   * Set cache entry
   */
  async set(endpoint: string, params: any, result: any, ttl: number = CACHE_TTL): Promise<void> {
    try {
      const key = this.generateKey(endpoint, params)
      const now = new Date()
      const expiresAt = new Date(now.getTime() + ttl * 1000)

      this.cache.set(key, {
        key,
        data: result,
        created_at: now.toISOString(),
        expires_at: expiresAt.toISOString()
      })
    } catch (error) {
      console.error('Cache set error:', error)
      // Don't throw - caching is optional
    }
  }

  /**
   * Clear expired cache entries
   */
  async clearExpired(): Promise<void> {
    try {
      const now = new Date()

      for (const [key, entry] of this.cache.entries()) {
        const expiresAt = new Date(entry.expires_at)
        if (now > expiresAt) {
          this.cache.delete(key)
        }
      }
    } catch (error) {
      console.error('Cache clear error:', error)
    }
  }

  /**
   * Clear all cache for an endpoint
   */
  async clearEndpoint(endpoint: string): Promise<void> {
    try {
      // Since we don't store endpoint in the in-memory cache,
      // we'll need to clear all cache for now
      // TODO: Store endpoint metadata if needed
      this.cache.clear()
    } catch (error) {
      console.error('Cache clear endpoint error:', error)
    }
  }

  /**
   * Clear all cache
   */
  async clearAll(): Promise<void> {
    try {
      this.cache.clear()
    } catch (error) {
      console.error('Cache clear all error:', error)
    }
  }

  /**
   * Get cache stats
   */
  getStats() {
    return {
      size: this.cache.size,
      entries: Array.from(this.cache.values()).map(entry => ({
        created_at: entry.created_at,
        expires_at: entry.expires_at
      }))
    }
  }

  /**
   * Cleanup on shutdown
   */
  destroy() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval)
      this.cleanupInterval = null
    }
    this.cache.clear()
  }
}

export const analyticsCache = new AnalyticsCache()
