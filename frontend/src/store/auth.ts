/**
 * Authentication Store using NextAuth
 * Compatible API with old Supabase store
 */

import { create } from 'zustand'
import { signIn as nextAuthSignIn, signOut as nextAuthSignOut } from 'next-auth/react'
import type { Session } from 'next-auth'

// Compatible User type
export interface User {
  id: string
  email: string
  name?: string | null
  role?: 'admin' | 'super_admin' | 'moderator' | 'user' | string | null
  full_name?: string | null
  avatar_url?: string | null
  status?: 'active' | 'inactive' | 'suspended' | 'banned'
  last_login_at?: string | null
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

interface SignInData {
  email: string
  password: string
}

interface SignUpData {
  email: string
  password: string
  fullName?: string
}

interface AuthState {
  user: User | null
  session: Session | null
  isLoading: boolean
  isAuthenticated: boolean
  error: string | null
  
  // Actions - Compatible with old API
  initialize: () => Promise<void>
  login: (data: SignInData) => Promise<void>
  register: (data: SignUpData) => Promise<void>
  loginWithGoogle: () => Promise<void>
  loginWithLinkedIn: () => Promise<void>
  loginWithOrcid: () => Promise<void>
  logout: () => Promise<void>
  clearError: () => void
  refreshSession: () => Promise<void>
  updateUser: (updates: Partial<User>) => void
  setSession: (session: Session | null) => void
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  session: null,
  isLoading: false,
  isAuthenticated: false,
  error: null,

  initialize: async () => {
    // NextAuth handles session automatically
    // This is just for compatibility
    set({ isLoading: false })
  },

  login: async (data: SignInData) => {
    set({ isLoading: true, error: null })
    
    try {
      const result = await nextAuthSignIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false,
      })

      if (result?.error) {
        throw new Error('Email hoặc mật khẩu không đúng')
      }

      set({ isLoading: false, isAuthenticated: true })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Đăng nhập thất bại'
      set({ error: message, isLoading: false })
      throw error
    }
  },

  register: async (data: SignUpData) => {
    set({ isLoading: true, error: null })
    
    try {
      // Call register API
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
          name: data.fullName,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Đăng ký thất bại')
      }

      // Auto login after register
      await get().login({ email: data.email, password: data.password })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Đăng ký thất bại'
      set({ error: message, isLoading: false })
      throw error
    }
  },

  loginWithGoogle: async () => {
    set({ isLoading: true, error: null })
    
    try {
      await nextAuthSignIn('google', { callbackUrl: '/dashboard' })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Đăng nhập Google thất bại'
      set({ error: message, isLoading: false })
      throw error
    }
  },

  loginWithLinkedIn: async () => {
    set({ isLoading: true, error: null })
    
    try {
      await nextAuthSignIn('linkedin', { callbackUrl: '/dashboard' })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Đăng nhập LinkedIn thất bại'
      set({ error: message, isLoading: false })
      throw error
    }
  },

  loginWithOrcid: async () => {
    set({ isLoading: true, error: null })
    
    try {
      await nextAuthSignIn('orcid', { callbackUrl: '/dashboard' })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Đăng nhập ORCID thất bại'
      set({ error: message, isLoading: false })
      throw error
    }
  },

  logout: async () => {
    set({ isLoading: true })
    
    try {
      await nextAuthSignOut({ callbackUrl: '/auth/login' })
      set({ 
        user: null, 
        session: null, 
        isAuthenticated: false, 
        isLoading: false 
      })
    } catch (error) {
      set({ isLoading: false })
      throw error
    }
  },

  clearError: () => {
    set({ error: null })
  },

  refreshSession: async () => {
    // NextAuth handles this automatically
    set({ isLoading: false })
  },

  updateUser: (updates: Partial<User>) => {
    const currentUser = get().user
    if (currentUser) {
      set({ user: { ...currentUser, ...updates } })
    }
  },

  setSession: (session: Session | null) => {
    if (session?.user) {
      const user: User = {
        id: (session.user as any).id || '',
        email: session.user.email || '',
        name: session.user.name,
        role: (session.user as any).role || 'user',
        full_name: session.user.name,
      }
      
      set({
        session,
        user,
        isAuthenticated: true,
        isLoading: false,
      })
    } else {
      set({
        session: null,
        user: null,
        isAuthenticated: false,
        isLoading: false,
      })
    }
  },
}))
