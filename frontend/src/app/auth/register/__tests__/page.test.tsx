import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import RegisterPage from '../page'
import { useAuthStore } from '@/store/auth'

// Mock the auth store
vi.mock('@/store/auth', () => ({
  useAuthStore: vi.fn(),
}))

// Mock the auth components
vi.mock('@/components/auth/auth-layout', () => ({
  AuthLayout: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="auth-layout">{children}</div>
  ),
}))

vi.mock('@/components/auth/auth-form', () => ({
  AuthForm: ({ mode }: { mode: string }) => (
    <div data-testid="auth-form" data-mode={mode}>
      Register Form
    </div>
  ),
}))

describe('RegisterPage', () => {
  const mockPush = vi.fn()
  const mockRegister = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    
    vi.mocked(useAuthStore).mockReturnValue({
      isAuthenticated: false,
      register: mockRegister,
      isLoading: false,
      error: null,
      user: null,
      login: vi.fn(),
      loginWithGoogle: vi.fn(),
      loginWithLinkedIn: vi.fn(),
      logout: vi.fn(),
      clearError: vi.fn(),
    } as any)
  })

  it('renders register page with AuthLayout and AuthForm', () => {
    render(<RegisterPage />)
    
    expect(screen.getByTestId('auth-layout')).toBeInTheDocument()
    expect(screen.getByTestId('auth-form')).toBeInTheDocument()
    expect(screen.getByTestId('auth-form')).toHaveAttribute('data-mode', 'register')
  })

  it('redirects to dashboard when authenticated', async () => {
    vi.mocked(useAuthStore).mockReturnValue({
      isAuthenticated: true,
      register: mockRegister,
      isLoading: false,
      error: null,
      user: { id: '1', email: 'test@example.com' } as any,
      login: vi.fn(),
      loginWithGoogle: vi.fn(),
      loginWithLinkedIn: vi.fn(),
      logout: vi.fn(),
      clearError: vi.fn(),
    } as any)

    render(<RegisterPage />)
    
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/dashboard')
    })
  })
})
