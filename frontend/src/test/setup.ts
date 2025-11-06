import { vi, beforeEach } from 'vitest'

// Mock fetch globally
global.fetch = vi.fn()

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  warn: vi.fn(),
  error: vi.fn(),
}

// Mock window.location
Object.defineProperty(window, 'location', {
  value: {
    href: 'http://localhost:3000',
    origin: 'http://localhost:3000',
    pathname: '/',
    search: '',
    hash: '',
  },
  writable: true,
})

// Reset all mocks before each test
beforeEach(() => {
  vi.clearAllMocks()
})