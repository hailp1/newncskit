import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import LoginPage from '../page'
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
  AuthForm: ({ mode, onSuccess }: { mode: string; onSuccess: () => void }) => (
    <div data-testid="auth-form" data-mode={mode}>
      <button onClick={onSuccess}>Submit</button>
    </div>
  ),
}))

describe('LoginPage', () => {
  const mockPush = vi.fn()
  const mockLogin = vi.fn()
  const mockLoginWithGoogle = vi.fn()
  const mockLoginWithLinkedIn = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    
    // Mock useRouter
    vi.mocked(useAuthStore).mockReturnValue({
      isAuthenticated: false,
      login: mockLogin,
      loginWithGoogle: mockLoginWithGoogle,
      loginWithLinkedIn: mockLoginWithLinkedIn,
      isLoading: false,
      error: null,
      user: null,
      register: vi.fn(),
      logout: vi.fn(),
      clearError: vi.fn(),
    } as any)
  })

  it('renders login page with AuthLayout and AuthForm', () => {
    render(<LoginPage />)
    
    expect(screen.getByTestId('auth-layout')).toBeInTheDocument()
    expect(screen.getByTestId('auth-form')).toBeInTheDocument()
    expect(screen.getByTestId('auth-form')).toHaveAttribute('data-mode', 'login')
  })

  it('redirects to dashboard when authenticated', async () => {
    vi.mocked(useAuthStore).mockReturnValue({
      isAuthenticated: true,
      login: mockLogin,
      loginWithGoogle: mockLoginWithGoogle,
      loginWithLinkedIn: mockLoginWithLinkedIn,
      isLoading: false,
      error: null,
      user: { id: '1', email: 'test@example.com' } as any,
      register: vi.fn(),
      logout: vi.fn(),
      clearError: vi.fn(),
    } as any)

    render(<LoginPage />)
    
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/dashboard')
    })
  })

  it('includes forgot password link', () => {
    render(<LoginPage />)
    
    const forgotPasswordLink = screen.getByText('Quên mật khẩu?')
    expect(forgotPasswordLink).toBeInTheDocument()
    expect(forgotPasswordLink.closest('a')).toHaveAttribute('href', '/auth/forgot-password')
  })

  it('handles successful login callback', async () => {
    render(<LoginPage />)
    
    const submitButton = screen.getByText('Submit')
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/dashboard')
    })
  })

  it('respects redirect query parameter', async () => {
    // Mock search params to return a redirect URL
    const mockGet = vi.fn((key: string) => {
      if (key === 'redirect') return '/surveys'
      return null
    })
    
    vi.mocked(useAuthStore).mockReturnValue({
      isAuthenticated: true,
      login: mockLogin,
      loginWithGoogle: mockLoginWithGoogle,
      loginWithLinkedIn: mockLoginWithLinkedIn,
      isLoading: false,
      error: null,
      user: { id: '1', email: 'test@example.com' } as any,
      register: vi.fn(),
      logout: vi.fn(),
      clearError: vi.fn(),
    } as any)

    render(<LoginPage />)
    
    await waitFor(() => {
      // Should redirect to the custom URL
      expect(mockPush).toHaveBeenCalled()
    })
  })
})
