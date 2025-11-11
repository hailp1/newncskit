import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AuthForm } from '../auth-form'
import { useAuthStore } from '@/store/auth'
import { useNetworkStatus } from '@/hooks/use-network-status'

// Mock dependencies
vi.mock('@/store/auth', () => ({
  useAuthStore: vi.fn(),
}))

vi.mock('@/hooks/use-network-status', () => ({
  useNetworkStatus: vi.fn(),
}))

vi.mock('../oauth-fallback-instructions', () => ({
  OAuthFallbackInstructions: () => <div>OAuth Fallback</div>,
}))

describe('AuthForm Integration Tests', () => {
  const mockLogin = vi.fn()
  const mockRegister = vi.fn()
  const mockLoginWithGoogle = vi.fn()
  const mockLoginWithLinkedIn = vi.fn()
  const mockClearError = vi.fn()
  const mockOnSuccess = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    
    vi.mocked(useAuthStore).mockReturnValue({
      login: mockLogin,
      register: mockRegister,
      loginWithGoogle: mockLoginWithGoogle,
      loginWithLinkedIn: mockLoginWithLinkedIn,
      clearError: mockClearError,
      isLoading: false,
      error: null,
      user: null,
      isAuthenticated: false,
      logout: vi.fn(),
    } as any)

    vi.mocked(useNetworkStatus).mockReturnValue({
      isOffline: false,
      isOnline: true,
    })
  })

  describe('Login Mode', () => {
    it('renders login form with correct fields', () => {
      render(<AuthForm mode="login" />)
      
      expect(screen.getByText('Đăng nhập vào NCSKIT')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('Địa chỉ email')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('Mật khẩu')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /đăng nhập/i })).toBeInTheDocument()
    })

    it('validates email format', async () => {
      const user = userEvent.setup()
      render(<AuthForm mode="login" />)
      
      const emailInput = screen.getByPlaceholderText('Địa chỉ email')
      await user.type(emailInput, 'invalid-email')
      await user.tab()
      
      await waitFor(() => {
        expect(screen.getByText('Email không hợp lệ')).toBeInTheDocument()
      })
    })

    it('validates password length', async () => {
      const user = userEvent.setup()
      render(<AuthForm mode="login" />)
      
      const passwordInput = screen.getByPlaceholderText('Mật khẩu')
      await user.type(passwordInput, '123')
      await user.tab()
      
      await waitFor(() => {
        expect(screen.getByText('Mật khẩu phải có ít nhất 6 ký tự')).toBeInTheDocument()
      })
    })

    it('submits login form with valid credentials', async () => {
      const user = userEvent.setup()
      mockLogin.mockResolvedValue(undefined)
      
      render(<AuthForm mode="login" onSuccess={mockOnSuccess} />)
      
      await user.type(screen.getByPlaceholderText('Địa chỉ email'), 'test@example.com')
      await user.type(screen.getByPlaceholderText('Mật khẩu'), 'password123')
      await user.click(screen.getByRole('button', { name: /đăng nhập/i }))
      
      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalledWith({
          email: 'test@example.com',
          password: 'password123',
        })
      })
    })

    it('displays error message on login failure', async () => {
      const user = userEvent.setup()
      const errorMessage = 'Invalid credentials'
      
      vi.mocked(useAuthStore).mockReturnValue({
        login: mockLogin,
        register: mockRegister,
        loginWithGoogle: mockLoginWithGoogle,
        loginWithLinkedIn: mockLoginWithLinkedIn,
        clearError: mockClearError,
        isLoading: false,
        error: errorMessage,
        user: null,
        isAuthenticated: false,
        logout: vi.fn(),
      } as any)
      
      render(<AuthForm mode="login" />)
      
      expect(screen.getByText(errorMessage)).toBeInTheDocument()
    })

    it('handles Google OAuth login', async () => {
      const user = userEvent.setup()
      mockLoginWithGoogle.mockResolvedValue(undefined)
      
      render(<AuthForm mode="login" onSuccess={mockOnSuccess} />)
      
      const googleButton = screen.getByRole('button', { name: /đăng nhập bằng google/i })
      await user.click(googleButton)
      
      await waitFor(() => {
        expect(mockLoginWithGoogle).toHaveBeenCalled()
      })
    })

    it('handles LinkedIn OAuth login', async () => {
      const user = userEvent.setup()
      mockLoginWithLinkedIn.mockResolvedValue(undefined)
      
      render(<AuthForm mode="login" onSuccess={mockOnSuccess} />)
      
      const linkedInButton = screen.getByRole('button', { name: /đăng nhập bằng linkedin/i })
      await user.click(linkedInButton)
      
      await waitFor(() => {
        expect(mockLoginWithLinkedIn).toHaveBeenCalled()
      })
    })
  })

  describe('Register Mode', () => {
    it('renders register form with all required fields', () => {
      render(<AuthForm mode="register" />)
      
      expect(screen.getByText('Tạo tài khoản NCSKIT')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('Họ và tên')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('Địa chỉ email')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('Mật khẩu (tối thiểu 6 ký tự)')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('Xác nhận mật khẩu')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /đăng ký/i })).toBeInTheDocument()
    })

    it('validates full name is required', async () => {
      const user = userEvent.setup()
      render(<AuthForm mode="register" />)
      
      const nameInput = screen.getByPlaceholderText('Họ và tên')
      await user.click(nameInput)
      await user.tab()
      
      await waitFor(() => {
        expect(screen.getByText('Họ tên là bắt buộc')).toBeInTheDocument()
      })
    })

    it('validates password confirmation matches', async () => {
      const user = userEvent.setup()
      render(<AuthForm mode="register" />)
      
      const passwordInput = screen.getByPlaceholderText('Mật khẩu (tối thiểu 6 ký tự)')
      const confirmInput = screen.getByPlaceholderText('Xác nhận mật khẩu')
      
      await user.type(passwordInput, 'password123')
      await user.type(confirmInput, 'different')
      await user.tab()
      
      await waitFor(() => {
        expect(screen.getByText('Mật khẩu không khớp')).toBeInTheDocument()
      })
    })

    it('submits register form with valid data', async () => {
      const user = userEvent.setup()
      mockRegister.mockResolvedValue(undefined)
      
      render(<AuthForm mode="register" onSuccess={mockOnSuccess} />)
      
      await user.type(screen.getByPlaceholderText('Họ và tên'), 'Test User')
      await user.type(screen.getByPlaceholderText('Địa chỉ email'), 'test@example.com')
      await user.type(screen.getByPlaceholderText('Mật khẩu (tối thiểu 6 ký tự)'), 'password123')
      await user.type(screen.getByPlaceholderText('Xác nhận mật khẩu'), 'password123')
      await user.click(screen.getByRole('button', { name: /đăng ký/i }))
      
      await waitFor(() => {
        expect(mockRegister).toHaveBeenCalledWith({
          email: 'test@example.com',
          password: 'password123',
          fullName: 'Test User',
        })
      })
    })
  })

  describe('Network Status', () => {
    it('shows offline warning when network is unavailable', () => {
      vi.mocked(useNetworkStatus).mockReturnValue({
        isOffline: true,
        isOnline: false,
      })
      
      render(<AuthForm mode="login" />)
      
      expect(screen.getByText('Không có kết nối mạng. Vui lòng kiểm tra kết nối của bạn.')).toBeInTheDocument()
    })

    it('prevents form submission when offline', async () => {
      const user = userEvent.setup()
      vi.mocked(useNetworkStatus).mockReturnValue({
        isOffline: true,
        isOnline: false,
      })
      
      render(<AuthForm mode="login" />)
      
      await user.type(screen.getByPlaceholderText('Địa chỉ email'), 'test@example.com')
      await user.type(screen.getByPlaceholderText('Mật khẩu'), 'password123')
      await user.click(screen.getByRole('button', { name: /đăng nhập/i }))
      
      expect(mockLogin).not.toHaveBeenCalled()
    })
  })

  describe('Mode Switching', () => {
    it('calls onModeChange when switching from login to register', async () => {
      const user = userEvent.setup()
      const mockOnModeChange = vi.fn()
      
      render(<AuthForm mode="login" onModeChange={mockOnModeChange} />)
      
      const switchButton = screen.getByRole('button', { name: /chuyển sang đăng ký/i })
      await user.click(switchButton)
      
      expect(mockOnModeChange).toHaveBeenCalledWith('register')
    })

    it('calls onModeChange when switching from register to login', async () => {
      const user = userEvent.setup()
      const mockOnModeChange = vi.fn()
      
      render(<AuthForm mode="register" onModeChange={mockOnModeChange} />)
      
      const switchButton = screen.getByRole('button', { name: /chuyển sang đăng nhập/i })
      await user.click(switchButton)
      
      expect(mockOnModeChange).toHaveBeenCalledWith('login')
    })
  })

  describe('Loading States', () => {
    it('disables form inputs during submission', async () => {
      const user = userEvent.setup()
      
      vi.mocked(useAuthStore).mockReturnValue({
        login: mockLogin,
        register: mockRegister,
        loginWithGoogle: mockLoginWithGoogle,
        loginWithLinkedIn: mockLoginWithLinkedIn,
        clearError: mockClearError,
        isLoading: true,
        error: null,
        user: null,
        isAuthenticated: false,
        logout: vi.fn(),
      } as any)
      
      render(<AuthForm mode="login" />)
      
      expect(screen.getByPlaceholderText('Địa chỉ email')).toBeDisabled()
      expect(screen.getByPlaceholderText('Mật khẩu')).toBeDisabled()
      expect(screen.getByRole('button', { name: /đăng nhập/i })).toBeDisabled()
    })

    it('shows loading text on submit button', () => {
      vi.mocked(useAuthStore).mockReturnValue({
        login: mockLogin,
        register: mockRegister,
        loginWithGoogle: mockLoginWithGoogle,
        loginWithLinkedIn: mockLoginWithLinkedIn,
        clearError: mockClearError,
        isLoading: true,
        error: null,
        user: null,
        isAuthenticated: false,
        logout: vi.fn(),
      } as any)
      
      render(<AuthForm mode="login" />)
      
      expect(screen.getByText('Đang đăng nhập...')).toBeInTheDocument()
    })
  })

  describe('Responsive Design', () => {
    it('applies modal-specific styling when isModal is true', () => {
      const { container } = render(<AuthForm mode="login" isModal={true} />)
      
      const formContainer = container.firstChild
      expect(formContainer).toHaveClass('max-w-md')
    })

    it('applies full-page styling when isModal is false', () => {
      const { container } = render(<AuthForm mode="login" isModal={false} />)
      
      const formContainer = container.firstChild
      expect(formContainer).toHaveClass('mx-auto')
    })
  })
})
