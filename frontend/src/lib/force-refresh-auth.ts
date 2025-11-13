/**
 * Force refresh authentication state
 * Use this when user role or profile has been updated
 * Now using NextAuth instead of Supabase
 */

import { getSession } from 'next-auth/react'
import type { User } from '@/store/auth'

export async function forceRefreshAuth(): Promise<User | null> {
  try {
    // Get fresh session from NextAuth
    const session = await getSession()
    
    if (!session?.user) {
      console.log('No active session')
      return null
    }

    // Convert NextAuth user to our User type
    const user: User = {
      id: (session.user as any).id || '',
      email: session.user.email || '',
      name: session.user.name,
      full_name: session.user.name,
      role: (session.user as any).role || 'user',
      avatar_url: session.user.image || null,
      status: 'active',
    }

    return user
  } catch (error) {
    console.error('Force refresh error:', error)
    return null
  }
}
