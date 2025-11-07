// Analytics Cache Layer using Supabase
import { createClient } from '@/lib/supabase/client'
import crypto from 'crypto'

export interface CacheEntry {
  key: string
  data: any
  created_at: string
  expires_at: string
}

const CACHE_TTL = 3600 // 1 hour in seconds

class AnalyticsCache {
  private supabase = createClient()

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
      const now = new Date().toISOString()

      const { data, error } = await this.supabase
        .from('analytics_cache')
        .select('data, expires_at')
        .eq('key', key)
        .gt('expires_at', now)
        .single()

      if (error || !data) return null

      return data.data
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

      await this.supabase
        .from('analytics_cache')
        .upsert({
          key,
          endpoint,
          params,
          data: result,
          created_at: now.toISOString(),
          expires_at: expiresAt.toISOString()
        } as any)
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
      const now = new Date().toISOString()

      await this.supabase
        .from('analytics_cache')
        .delete()
        .lt('expires_at', now)
    } catch (error) {
      console.error('Cache clear error:', error)
    }
  }

  /**
   * Clear all cache for an endpoint
   */
  async clearEndpoint(endpoint: string): Promise<void> {
    try {
      await this.supabase
        .from('analytics_cache')
        .delete()
        .eq('endpoint', endpoint)
    } catch (error) {
      console.error('Cache clear endpoint error:', error)
    }
  }

  /**
   * Clear all cache
   */
  async clearAll(): Promise<void> {
    try {
      await this.supabase
        .from('analytics_cache')
        .delete()
        .neq('key', '')
    } catch (error) {
      console.error('Cache clear all error:', error)
    }
  }
}

export const analyticsCache = new AnalyticsCache()
