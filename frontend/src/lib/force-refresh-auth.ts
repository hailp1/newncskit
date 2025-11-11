/**
 * Force refresh authentication state from database
 * Use this when user role or profile has been updated in database
 */

import { createClient } from '@/lib/supabase/client'

export async function forceRefreshAuth() {
  try {
    const supabase = createClient()
    
    // Add timeout to prevent hanging
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Request timeout')), 5000)
    )
    
    // Get current session with timeout
    const sessionPromise = supabase.auth.getSession()
    const { data: { session }, error: sessionError } = await Promise.race([
      sessionPromise,
      timeoutPromise
    ]) as any
    
    if (sessionError) {
      console.error('Session error:', sessionError)
      return null
    }

    if (!session) {
      console.log('No active session')
      return null
    }

    // Fetch fresh profile data from database with timeout
    const profilePromise = supabase
      .from('profiles')
      .select('role, full_name, avatar_url, subscription_type, is_active')
      .eq('id', session.user.id)
      .single()
      
    const { data: userProfile, error: profileError } = await Promise.race([
      profilePromise,
      timeoutPromise
    ]) as any

    if (profileError) {
      console.error('Profile fetch error:', profileError)
      return null
    }

    if (!userProfile) {
      console.error('No profile found')
      return null
    }

    // Return enriched user data
    const profile = userProfile as any
    return {
      ...session.user,
      role: profile.role ?? null,
      full_name: profile.full_name ?? null,
      avatar_url: profile.avatar_url ?? null,
      status: 'active',
      subscription_type: profile.subscription_type ?? 'free',
      is_active: profile.is_active ?? true,
    }
  } catch (error) {
    console.error('Force refresh error:', error)
    return null
  }
}
