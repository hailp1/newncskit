import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { authService } from '@/services/auth'
import type { User, LoginCredentials, UserRegistration } from '@/types'

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  initialized: boolean
}

interface AuthActions {
  login: (credentials: LoginCredentials) => Promise<void>
  loginWithOAuth: (provider: 'google' | 'linkedin') => Promise<void>
  register: (userData: UserRegistration) => Promise<void>
  logout: () => Promise<void>
  clearError: () => void
  setUser: (user: User | null) => void
  updateUser: (userData: Partial<User>) => Promise<void>
  initialize: () => Promise<void>
}

export const useAuthStore = create<AuthState & AuthActions>()(
  persist(
    (set, get) => ({
      // State
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      initialized: false,

      // Actions
      initialize: async () => {
        if (get().initialized) return
        
        set({ isLoading: true })
        
        try {
          const sessionData = await authService.getSession()
          
          if (sessionData) {
            set({
              user: sessionData.user,
              isAuthenticated: true,
              isLoading: false,
              initialized: true,
            })
          } else {
            set({
              user: null,
              isAuthenticated: false,
              isLoading: false,
              initialized: true,
            })
          }

          // Listen for auth state changes
          authService.onAuthStateChange((user) => {
            set({
              user,
              isAuthenticated: !!user,
            })
          })
        } catch (error) {
          console.error('Initialize auth error:', error)
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            initialized: true,
            error: error instanceof Error ? error.message : 'Failed to initialize auth',
          })
        }
      },

      login: async (credentials: LoginCredentials) => {
        set({ isLoading: true, error: null })
        
        try {
          const { user } = await authService.signIn(credentials)
          
          set({
            user,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          })

          console.log('Login successful, session persisted')

          // Redirect to dashboard after successful login
          if (typeof window !== 'undefined') {
            window.location.href = '/dashboard'
          }
        } catch (error) {
          console.error('Login error:', error)
          
          set({
            error: error instanceof Error ? error.message : 'Đăng nhập thất bại',
            isLoading: false,
          })
          
          // Re-throw error so login form can handle it with ErrorHandler
          throw error
        }
      },

      loginWithOAuth: async (provider: 'google' | 'linkedin') => {
        set({ isLoading: true, error: null })
        
        try {
          await authService.signInWithOAuth(provider)
          // OAuth redirect will handle the rest
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'OAuth login failed',
            isLoading: false,
          })
        }
      },

      register: async (userData: UserRegistration) => {
        set({ isLoading: true, error: null })
        
        try {
          const { user } = await authService.signUp(userData)
          
          set({
            user,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          })

          // Redirect to dashboard after successful registration
          if (typeof window !== 'undefined') {
            window.location.href = '/dashboard'
          }
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Đăng ký thất bại',
            isLoading: false,
          })
          
          // Re-throw error so register form can handle it with ErrorHandler
          throw error
        }
      },

      logout: async () => {
        try {
          await authService.signOut()
          
          set({
            user: null,
            isAuthenticated: false,
            error: null,
          })

          // Clear any stored auth data
          if (typeof window !== 'undefined') {
            localStorage.removeItem('auth-storage')
          }

          // Redirect to home after logout
          if (typeof window !== 'undefined') {
            window.location.href = '/'
          }
        } catch (error) {
          console.error('Logout error:', error)
          // Force logout even if API call fails
          set({
            user: null,
            isAuthenticated: false,
            error: null,
          })
          
          if (typeof window !== 'undefined') {
            localStorage.removeItem('auth-storage')
            window.location.href = '/'
          }
        }
      },

      clearError: () => {
        set({ error: null })
      },

      setUser: (user: User | null) => {
        set({ 
          user,
          isAuthenticated: !!user,
        })
      },

      updateUser: async (userData: Partial<User>) => {
        set({ isLoading: true, error: null })
        
        try {
          const currentUser = get().user;
          if (!currentUser) throw new Error('No user logged in');
          const updatedUser = await authService.updateProfile(currentUser.id, userData.profile || {})
          
          set({
            user: updatedUser,
            isLoading: false,
            error: null,
          })
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to update profile',
            isLoading: false,
          })
          throw error
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        // Persist user session and auth state
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        initialized: state.initialized,
      }),
    }
  )
)