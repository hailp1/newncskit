/**
 * Session API Route
 * Returns current user session information
 */

import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()
    
    const { data: { session }, error } = await supabase.auth.getSession()
    
    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      )
    }

    if (!session) {
      return NextResponse.json(
        { success: false, authenticated: false },
        { status: 401 }
      )
    }

    return NextResponse.json({
      success: true,
      authenticated: true,
      user: session.user,
      session: {
        access_token: session.access_token,
        expires_at: session.expires_at,
      },
    })
  } catch (error) {
    console.error('Session check error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to check session' },
      { status: 500 }
    )
  }
}
