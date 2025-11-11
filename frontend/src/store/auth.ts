/**
 * Authentication Store using Zustand
 * Manages authentication state with Supabase
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User as SupabaseUser, Session } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'
import { signIn, signUp, signOut, signInWithGoogle, signInWithLinkedIn } from '@/lib/supabase/auth'
import type { SignInData, SignUpData } from '@/lib/supabase/auth'

// Extend Supabase User type with profile
export interface User extends SupabaseUser {
  role?: 'admin' | 'super_admin' | 'moderator' | 'user' | string | null;
  full_name?: string | null;
  avatar_url?: string | null;
  status?: 'active' | 'inactive' | 'suspended' | 'banned';
  last_login_at?: string | null;
  profile?: {
    firstName?: string
    lastName?: string
    institution?: string
    orcidId?: string
    researchDomain?: string[]
  }
  subscription?: {
    plan?: string
    status?: string
    expires_at?: string
    type?: string
  }
  createdAt?: string
  updatedAt?: string
}

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
  updateUser: (updates: Partial<User>) => void
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
            // Fetch user profile with role from public.profiles table
            const { data: userProfile } = await supabase
              .from('profiles')
              .select('role, full_name, avatar_url, status, last_login_at')
              .eq('id', session.user.id)
              .single()

            // Merge session user with profile data
            const enrichedUser: User = {
              ...session.user,
              role: (userProfile as any)?.role ?? null,
              full_name: (userProfile as any)?.full_name ?? null,
              avatar_url: (userProfile as any)?.avatar_url ?? null,
              status: (userProfile as any)?.status ?? 'active',
              last_login_at: (userProfile as any)?.last_login_at ?? null,
            }

            set({
              user: enrichedUser,
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
          supabase.auth.onAuthStateChange(async (_event, session) => {
            if (session) {
              // Fetch user profile when auth state changes
              const { data: userProfile } = await supabase
                .from('profiles')
                .select('role, full_name, avatar_url, status, last_login_at')
                .eq('id', session.user.id)
                .single()

              const enrichedUser: User = {
                ...session.user,
                role: (userProfile as any)?.role ?? null,
                full_name: (userProfile as any)?.full_name ?? null,
                avatar_url: (userProfile as any)?.avatar_url ?? null,
                status: (userProfile as any)?.status ?? 'active',
                last_login_at: (userProfile as any)?.last_login_at ?? null,
              }

              set({
                user: enrichedUser,
                session,
                isAuthenticated: true,
              })
            } else {
              set({
                user: null,
                session: null,
                isAuthenticated: false,
              })
            }
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
          
          // Fetch user profile with role
          const supabase = createClient()
          const { data: userProfile } = await supabase
            .from('profiles')
            .select('role, full_name, avatar_url, status, last_login_at')
            .eq('id', result.user.id)
            .single()

          const enrichedUser: User = {
            ...result.user,
            role: (userProfile as any)?.role ?? null,
            full_name: (userProfile as any)?.full_name ?? null,
            avatar_url: (userProfile as any)?.avatar_url ?? null,
            status: (userProfile as any)?.status ?? 'active',
            last_login_at: (userProfile as any)?.last_login_at ?? null,
          }
          
          set({
            user: enrichedUser,
            session: result.session,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          })
        } catch (error) {
          console.error('Login error:', error)
          const errorMessage = error instanceof Error ? error.message : 'Đăng nhập thất bại'
          set({
            error: errorMessage,
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
            error: null,
          })
        } catch (error) {
          console.error('Registration error:', error)
          const errorMessage = error instanceof Error ? error.message : 'Đăng ký thất bại'
          set({
            error: errorMessage,
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
          const errorMessage = error instanceof Error ? error.message : 'Đăng nhập Google thất bại'
          set({
            error: errorMessage,
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
          const errorMessage = error instanceof Error ? error.message : 'Đăng nhập LinkedIn thất bại'
          set({
            error: errorMessage,
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

      updateUser: (updates: Partial<User>) => {
        const currentUser = get().user
        if (currentUser) {
          set({
            user: { ...currentUser, ...updates }
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
