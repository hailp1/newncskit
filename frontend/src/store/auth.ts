/**
 * Authentication Store using Zustand
 * Manages authentication state with Supabase
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User, Session } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'
import { signIn, signUp, signOut, signInWithGoogle, signInWithLinkedIn } from '@/lib/supabase/auth'
import type { SignInData, SignUpData } from '@/lib/supabase/auth'

interface AuthState {
  user: User | null
  session: Session | null
  isLoading: boolean
  isAuthenticated: boolean
  error: string | null
  
  // Actions
  initialize: () => Promise<void>
  login: (data: SignInData) => Promise<void>
  register: (data: SignUpData) => Promise<void>
  loginWithGoogle: () => Promise<void>
  loginWithLinkedIn: () => Promise<void>
  logout: () => Promise<void>
  clearError: () => void
  refreshSession: () => Promise<void>
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      session: null,
      isLoading: true,
      isAuthenticated: false,
      error: null,

      initialize: async () => {
        try {
          set({ isLoading: true, error: null })
          const supabase = createClient()
          
          // Get current session
          const { data: { session }, error: sessionError } = await supabase.auth.getSession()
          
          if (sessionError) throw sessionError

          if (session) {
            set({
              user: session.user,
              session,
              isAuthenticated: true,
              isLoading: false,
            })
          } else {
            set({
              user: null,
              session: null,
              isAuthenticated: false,
              isLoading: false,
            })
          }

          // Listen for auth changes
          supabase.auth.onAuthStateChange((_event, session) => {
            set({
              user: session?.user ?? null,
              session,
              isAuthenticated: !!session,
            })
          })
        } catch (error) {
          console.error('Auth initialization error:', error)
          set({
            error: error instanceof Error ? error.message : 'Failed to initialize auth',
            isLoading: false,
            isAuthenticated: false,
          })
        }
      },

      login: async (data: SignInData) => {
        try {
          set({ isLoading: true, error: null })
          const result = await signIn(data)
          
          set({
            user: result.user,
            session: result.session,
            isAuthenticated: true,
            isLoading: false,
          })
        } catch (error) {
          console.error('Login error:', error)
          set({
            error: error instanceof Error ? error.message : 'Login failed',
            isLoading: false,
          })
          throw error
        }
      },

      register: async (data: SignUpData) => {
        try {
          set({ isLoading: true, error: null })
          const result = await signUp(data)
          
          // Note: User might need to confirm email before session is created
          set({
            user: result.user,
            session: result.session,
            isAuthenticated: !!result.session,
            isLoading: false,
          })
        } catch (error) {
          console.error('Registration error:', error)
          set({
            error: error instanceof Error ? error.message : 'Registration failed',
            isLoading: false,
          })
          throw error
        }
      },

      loginWithGoogle: async () => {
        try {
          set({ isLoading: true, error: null })
          await signInWithGoogle()
          // OAuth redirect will happen, state will be updated on callback
        } catch (error) {
          console.error('Google login error:', error)
          set({
            error: error instanceof Error ? error.message : 'Google login failed',
            isLoading: false,
          })
          throw error
        }
      },

      loginWithLinkedIn: async () => {
        try {
          set({ isLoading: true, error: null })
          await signInWithLinkedIn()
          // OAuth redirect will happen, state will be updated on callback
        } catch (error) {
          console.error('LinkedIn login error:', error)
          set({
            error: error instanceof Error ? error.message : 'LinkedIn login failed',
            isLoading: false,
          })
          throw error
        }
      },

      logout: async () => {
        try {
          set({ isLoading: true, error: null })
          await signOut()
          
          set({
            user: null,
            session: null,
            isAuthenticated: false,
            isLoading: false,
          })
        } catch (error) {
          console.error('Logout error:', error)
          set({
            error: error instanceof Error ? error.message : 'Logout failed',
            isLoading: false,
          })
          throw error
        }
      },

      clearError: () => {
        set({ error: null })
      },

      refreshSession: async () => {
        try {
          const supabase = createClient()
          const { data: { session }, error } = await supabase.auth.refreshSession()
          
          if (error) throw error

          set({
            user: session?.user ?? null,
            session,
            isAuthenticated: !!session,
          })
        } catch (error) {
          console.error('Session refresh error:', error)
          set({
            error: error instanceof Error ? error.message : 'Failed to refresh session',
          })
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        // Only persist user and session
        user: state.user,
        session: state.session,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)
