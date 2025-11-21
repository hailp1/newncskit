/**
 * Supabase Authentication Helpers
 */

import { createClient } from './client'

function getAppUrl() {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL
  }

  if (typeof window !== 'undefined') {
    return window.location.origin
  }

  return 'http://localhost:3000'
}

function buildRedirectPath(path: string) {
  const base = getAppUrl().replace(/\/$/, '')
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  return `${base}${normalizedPath}`
}

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
        emailRedirectTo: buildRedirectPath('/auth/callback'),
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

// checkPopupBlocked function removed as we are using redirect flow


/**
 * Sign in with Google OAuth
 */
export async function signInWithGoogle() {
  const supabase = createClient()

  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: buildRedirectPath('/auth/callback'),
        skipBrowserRedirect: false,
      },
    })

    if (error) throw error

    return data
  } catch (error) {
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
        redirectTo: buildRedirectPath('/auth/callback'),
        skipBrowserRedirect: false,
      },
    })

    if (error) throw error

    return data
  } catch (error) {
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
    redirectTo: buildRedirectPath('/auth/reset-password'),
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
