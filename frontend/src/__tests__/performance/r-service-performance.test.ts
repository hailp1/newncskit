import { describe, it, expect, vi, beforeEach } from 'vitest'
import { rService } from '@/lib/r-service'

describe('R Service Performance Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Timeout Handling', () => {
    it('should timeout after 60 seconds', async () => {
      // Mock a slow R service response
      global.fetch = vi.fn(
        () =>
          new Promise((resolve) => {
            setTimeout(
              () =>
                resolve({
                  ok: true,
                  json: () => Promise.resolve({ success: true }),
                }),
              65000
            ) // 65 seconds
          })
      ) as any

      const startTime = performance.now()

      const result = await rService.runAnalysis({
        type: 'sentiment',
        data: [],
      })

      const endTime = performance.now()
      const executionTime = endTime - startTime

      expect(result.success).toBe(false)
      expect(result.error).toContain('timeout')
      expect(executionTime).toBeLessThan(61000) // Should timeout before 61 seconds
      expect(executionTime).toBeGreaterThan(59000) // Should wait at least 59 seconds
    }, 65000) // Test timeout of 65 seconds

    it('should handle fast responses efficiently', async () => {
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              success: true,
              data: { sentiment_scores: [0.5] },
            }),
        })
      ) as any

      const startTime = performance.now()

      const result = await rService.runAnalysis({
        type: 'sentiment',
        data: [{ text: 'Test' }],
      })

      const endTime = performance.now()
      const executionTime = endTime - startTime

      expect(result.success).toBe(true)
      expect(executionTime).toBeLessThan(100) // Fast response should complete in less than 100ms
    })
  })

  describe('Large Dataset Handling', () => {
    it('should handle small datasets quickly', async () => {
      const smallDataset = Array.from({ length: 10 }, (_, i) => ({
        text: `Sample text ${i}`,
      }))

      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              success: true,
              data: { sentiment_scores: new Array(10).fill(0.5) },
            }),
        })
      ) as any

      const startTime = performance.now()

      const result = await rService.runAnalysis({
        type: 'sentiment',
        data: smallDataset,
      })

      const endTime = performance.now()
      const executionTime = endTime - startTime

      expect(result.success).toBe(true)
      expect(executionTime).toBeLessThan(200) // Small dataset should process quickly
    })

    it('should handle medium datasets within timeout', async () => {
      const mediumDataset = Array.from({ length: 100 }, (_, i) => ({
        text: `Sample text ${i}`,
      }))

      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              success: true,
              data: { sentiment_scores: new Array(100).fill(0.5) },
            }),
        })
      ) as any

      const startTime = performance.now()

      const result = await rService.runAnalysis({
        type: 'sentiment',
        data: mediumDataset,
      })

      const endTime = performance.now()
      const executionTime = endTime - startTime

      expect(result.success).toBe(true)
      expect(executionTime).toBeLessThan(1000) // Medium dataset should complete in less than 1 second
    })

    it('should handle large datasets within timeout', async () => {
      const largeDataset = Array.from({ length: 1000 }, (_, i) => ({
        text: `Sample text ${i}`,
      }))

      // Simulate realistic processing time for large dataset
      global.fetch = vi.fn(
        () =>
          new Promise((resolve) => {
            setTimeout(
              () =>
                resolve({
                  ok: true,
                  json: () =>
                    Promise.resolve({
                      success: true,
                      data: { sentiment_scores: new Array(1000).fill(0.5) },
                    }),
                }),
              5000
            ) // 5 seconds processing time
          })
      ) as any

      const startTime = performance.now()

      const result = await rService.runAnalysis({
        type: 'sentiment',
        data: largeDataset,
      })

      const endTime = performance.now()
      const executionTime = endTime - startTime

      expect(result.success).toBe(true)
      expect(executionTime).toBeLessThan(60000) // Should complete within 60 second timeout
      expect(executionTime).toBeGreaterThan(4900) // Should take at least 4.9 seconds
    }, 10000) // Test timeout of 10 seconds
  })

  describe('Health Check Performance', () => {
    it('should check health quickly', async () => {
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ status: 'healthy' }),
        })
      ) as any

      const startTime = performance.now()

      const isHealthy = await rService.checkHealth()

      const endTime = performance.now()
      const executionTime = endTime - startTime

      expect(isHealthy).toBe(true)
      expect(executionTime).toBeLessThan(100) // Health check should be very fast
    })

    it('should timeout health check after 5 seconds', async () => {
      global.fetch = vi.fn(
        () =>
          new Promise((resolve) => {
            setTimeout(() => resolve({ ok: true }), 6000) // 6 seconds
          })
      ) as any

      const startTime = performance.now()

      const isHealthy = await rService.checkHealth()

      const endTime = performance.now()
      const executionTime = endTime - startTime

      expect(isHealthy).toBe(false)
      expect(executionTime).toBeLessThan(5500) // Should timeout before 5.5 seconds
    }, 7000) // Test timeout of 7 seconds
  })

  describe('Concurrent Request Handling', () => {
    it('should handle multiple concurrent requests', async () => {
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              success: true,
              data: { sentiment_scores: [0.5] },
            }),
        })
      ) as any

      const startTime = performance.now()

      // Execute 5 concurrent analysis requests
      const results = await Promise.all(
        Array.from({ length: 5 }, () =>
          rService.runAnalysis({
            type: 'sentiment',
            data: [{ text: 'Test' }],
          })
        )
      )

      const endTime = performance.now()
      const totalTime = endTime - startTime

      expect(results.length).toBe(5)
      expect(results.every((r) => r.success)).toBe(true)
      expect(totalTime).toBeLessThan(1000) // 5 concurrent requests should complete in less than 1 second
    })
  })
})
