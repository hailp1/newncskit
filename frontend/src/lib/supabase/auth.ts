/**
 * Supabase Authentication Helpers
 */

import { createClient } from './client'

export interface SignUpData {
  email: string
  password: string
  fullName?: string
}

export interface SignInData {
  email: string
  password: string
}

/**
 * Sign up with email and password
 */
export async function signUp({ email, password, fullName }: SignUpData) {
  const supabase = createClient()

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
      emailRedirectTo: `${window.location.origin}/auth/callback`,
    },
  })

  if (error) throw error
  return data
}

/**
 * Sign in with email and password
 */
export async function signIn({ email, password }: SignInData) {
  const supabase = createClient()

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) throw error
  return data
}

/**
 * Check if popup was blocked
 */
function checkPopupBlocked(popup: Window | null): boolean {
  if (!popup) return true
  
  try {
    // Check if popup is closed immediately (blocked)
    if (popup.closed) return true
    
    // Try to access popup properties
    popup.focus()
    return false
  } catch (e) {
    return true
  }
}

/**
 * Sign in with Google OAuth
 */
export async function signInWithGoogle() {
  const supabase = createClient()

  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        skipBrowserRedirect: false,
      },
    })

    if (error) throw error

    // Check if popup was blocked (for popup mode)
    if (data.url) {
      const popup = window.open(data.url, '_blank', 'popup=yes,width=600,height=700')
      
      if (checkPopupBlocked(popup)) {
        throw new Error('Popup blocked. Please allow popups for this site.')
      }
    }

    return data
  } catch (error) {
    // Enhance error message for OAuth-specific issues
    if (error instanceof Error) {
      if (error.message.includes('popup')) {
        throw new Error('Cửa sổ đăng nhập bị chặn. Vui lòng cho phép popup và thử lại.')
      }
    }
    throw error
  }
}

/**
 * Sign in with LinkedIn OAuth
 */
export async function signInWithLinkedIn() {
  const supabase = createClient()

  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'linkedin_oidc',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        skipBrowserRedirect: false,
      },
    })

    if (error) throw error

    // Check if popup was blocked (for popup mode)
    if (data.url) {
      const popup = window.open(data.url, '_blank', 'popup=yes,width=600,height=700')
      
      if (checkPopupBlocked(popup)) {
        throw new Error('Popup blocked. Please allow popups for this site.')
      }
    }

    return data
  } catch (error) {
    // Enhance error message for OAuth-specific issues
    if (error instanceof Error) {
      if (error.message.includes('popup')) {
        throw new Error('Cửa sổ đăng nhập bị chặn. Vui lòng cho phép popup và thử lại.')
      }
    }
    throw error
  }
}

/**
 * Sign out
 */
export async function signOut() {
  const supabase = createClient()
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

/**
 * Reset password
 */
export async function resetPassword(email: string) {
  const supabase = createClient()

  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/auth/reset-password`,
  })

  if (error) throw error
  return data
}

/**
 * Update password
 */
export async function updatePassword(newPassword: string) {
  const supabase = createClient()

  const { data, error } = await supabase.auth.updateUser({
    password: newPassword,
  })

  if (error) throw error
  return data
}

/**
 * Get current session
 */
export async function getSession() {
  const supabase = createClient()
  const { data, error } = await supabase.auth.getSession()
  if (error) throw error
  return data.session
}

/**
 * Refresh session
 */
export async function refreshSession() {
  const supabase = createClient()
  const { data, error } = await supabase.auth.refreshSession()
  if (error) throw error
  return data.session
}
