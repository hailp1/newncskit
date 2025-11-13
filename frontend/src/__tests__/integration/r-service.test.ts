import { describe, it, expect, vi, beforeEach } from 'vitest'
import { rService } from '@/lib/r-service'

describe('R Analytics Service Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Health Check', () => {
    it('should check R service health successfully', async () => {
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ status: 'healthy' }),
        })
      ) as any

      const isHealthy = await rService.checkHealth()
      expect(isHealthy).toBe(true)
    })

    it('should handle R service unavailable', async () => {
      global.fetch = vi.fn(() =>
        Promise.reject(new Error('Connection refused'))
      ) as any

      const isHealthy = await rService.checkHealth()
      expect(isHealthy).toBe(false)
    })
  })

  describe('Analysis Execution', () => {
    it('should run sentiment analysis successfully', async () => {
      const mockResponse = {
        success: true,
        data: {
          sentiment_scores: [0.8, 0.6, -0.2],
          average_sentiment: 0.4,
        },
      }

      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockResponse),
        })
      ) as any

      const result = await rService.runAnalysis({
        type: 'sentiment',
        data: [
          { text: 'Great product!' },
          { text: 'Good service' },
          { text: 'Not bad' },
        ],
      })

      expect(result.success).toBe(true)
      expect(result.data).toBeDefined()
      expect(result.data.sentiment_scores).toHaveLength(3)
    })

    it('should handle R service timeout', async () => {
      global.fetch = vi.fn(
        () =>
          new Promise((resolve) => {
            setTimeout(() => resolve({ ok: true }), 70000)
          })
      ) as any

      const result = await rService.runAnalysis({
        type: 'sentiment',
        data: [],
      })

      expect(result.success).toBe(false)
      expect(result.error).toContain('timeout')
    })

    it('should handle R service error response', async () => {
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: false,
          statusText: 'Internal Server Error',
        })
      ) as any

      const result = await rService.runAnalysis({
        type: 'sentiment',
        data: [],
      })

      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()
    })

    it('should run clustering analysis', async () => {
      const mockResponse = {
        success: true,
        data: {
          clusters: [1, 1, 2, 2, 3],
          cluster_centers: 3,
        },
      }

      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockResponse),
        })
      ) as any

      const result = await rService.runAnalysis({
        type: 'cluster',
        data: [
          { text: 'Product A' },
          { text: 'Product B' },
          { text: 'Service X' },
          { text: 'Service Y' },
          { text: 'Feature Z' },
        ],
        parameters: { n_clusters: 3 },
      })

      expect(result.success).toBe(true)
      expect(result.data.clusters).toHaveLength(5)
    })

    it('should run topic modeling analysis', async () => {
      const mockResponse = {
        success: true,
        data: {
          topics: [
            { id: 1, words: ['product', 'quality', 'good'] },
            { id: 2, words: ['service', 'support', 'help'] },
          ],
        },
      }

      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockResponse),
        })
      ) as any

      const result = await rService.runAnalysis({
        type: 'topics',
        data: [{ text: 'Sample text' }],
        parameters: { n_topics: 2 },
      })

      expect(result.success).toBe(true)
      expect(result.data.topics).toHaveLength(2)
    })
  })

  describe('Error Handling', () => {
    it('should handle network errors gracefully', async () => {
      global.fetch = vi.fn(() =>
        Promise.reject(new Error('Network error'))
      ) as any

      const result = await rService.runAnalysis({
        type: 'sentiment',
        data: [],
      })

      expect(result.success).toBe(false)
      expect(result.error).toContain('Failed to connect')
    })

    it('should handle invalid response format', async () => {
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.reject(new Error('Invalid JSON')),
        })
      ) as any

      const result = await rService.runAnalysis({
        type: 'sentiment',
        data: [],
      })

      expect(result.success).toBe(false)
    })
  })
})
