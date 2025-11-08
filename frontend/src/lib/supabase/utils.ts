/**
 * Supabase Utility Functions
 */

import { createClient as createBrowserClient } from './client'
import { createClient as createServerClient } from './server'

/**
 * Get current user from browser
 */
export async function getCurrentUser() {
  const supabase = createBrowserClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user
}

/**
 * Get current user from server
 */
export async function getCurrentUserServer() {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user
}

/**
 * Get user profile
 */
export async function getUserProfile(userId: string) {
  const supabase = createBrowserClient()
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (error) throw error
  return data
}

/**
 * Update user profile
 */
export async function updateUserProfile(
  userId: string,
  updates: {
    full_name?: string
    avatar_url?: string
  }
) {
  const supabase = createBrowserClient()
  const { data, error } = await supabase
    .from('profiles')
    // @ts-ignore - Supabase type inference issue with dynamic updates
    .update(updates)
    .eq('id', userId)
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Sign out user
 */
export async function signOut() {
  const supabase = createBrowserClient()
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

/**
 * Upload file to Supabase Storage
 */
export async function uploadFile(
  bucket: string,
  path: string,
  file: File
) {
  const supabase = createBrowserClient()
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file, {
      cacheControl: '3600',
      upsert: false,
    })

  if (error) throw error
  return data
}

/**
 * Get public URL for file
 */
export function getPublicUrl(bucket: string, path: string) {
  const supabase = createBrowserClient()
  const { data } = supabase.storage.from(bucket).getPublicUrl(path)
  return data.publicUrl
}

/**
 * Delete file from storage
 */
export async function deleteFile(bucket: string, path: string) {
  const supabase = createBrowserClient()
  const { error } = await supabase.storage.from(bucket).remove([path])
  if (error) throw error
}
