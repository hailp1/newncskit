import { describe, it, expect } from 'vitest'

describe('Simple Test Suite', () => {
  it('should verify test setup is working', () => {
    expect(1 + 1).toBe(2)
  })

  it('should verify async operations work', async () => {
    const result = await Promise.resolve('test')
    expect(result).toBe('test')
  })

  it('should verify mock functions work', () => {
    const mockFn = vi.fn()
    mockFn('test')
    expect(mockFn).toHaveBeenCalledWith('test')
  })
})