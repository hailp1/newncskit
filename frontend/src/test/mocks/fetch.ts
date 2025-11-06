import { vi } from 'vitest'

export const createMockResponse = (data: any, status = 200, ok = true) => {
  return Promise.resolve({
    ok,
    status,
    statusText: ok ? 'OK' : 'Error',
    json: () => Promise.resolve(data),
    blob: () => Promise.resolve(new Blob([JSON.stringify(data)])),
    text: () => Promise.resolve(JSON.stringify(data)),
  } as Response)
}

export const mockFetch = vi.fn()

export const setupFetchMock = () => {
  global.fetch = mockFetch
  return mockFetch
}

export const mockFetchSuccess = (data: any) => {
  mockFetch.mockResolvedValueOnce(createMockResponse(data))
}

export const mockFetchError = (status = 500, message = 'Server Error') => {
  mockFetch.mockResolvedValueOnce(createMockResponse({ message }, status, false))
}

export const mockFetchNetworkError = () => {
  mockFetch.mockRejectedValueOnce(new Error('Network Error'))
}