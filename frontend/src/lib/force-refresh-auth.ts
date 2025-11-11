/**
 * Force refresh authentication state from database
 * Use this when user role or profile has been updated in database
 */

import { createClient } from '@/lib/supabase/client'

export async function forceRefreshAuth() {
  try {
    const supabase = createClient()
    
    // Get current session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError) {
      console.error('Session error:', sessionError)
      return null
    }

    if (!session) {
      console.log('No active session')
      return null
    }

    // Fetch fresh profile data from database
    const { data: userProfile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single()

    if (profileError) {
      console.error('Profile fetch error:', profileError)
      return null
    }

    console.log('Fresh profile data:', userProfile)

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
      status: profile.status ?? 'active',
      subscription_type: profile.subscription_type ?? 'free',
      is_active: profile.is_active ?? true,
    }
  } catch (error) {
    console.error('Force refresh error:', error)
    return null
  }
}
