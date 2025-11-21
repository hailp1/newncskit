/**
 * Auth Callback Route
 * Handles OAuth callbacks from Supabase Auth
 */

import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') || '/dashboard'
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || requestUrl.origin

  if (code) {
    const supabase = await createClient()
    
    try {
      const { error } = await supabase.auth.exchangeCodeForSession(code)
      
      if (error) {
        console.error('Auth callback error:', error)
        return NextResponse.redirect(
          new URL(`/auth/login?error=${encodeURIComponent(error.message)}`, baseUrl)
        )
      }
      
      // IMPORTANT: After exchanging code, wait a moment or verify session is established
      // This helps prevent race conditions where middleware doesn't see the session yet
      await supabase.auth.getUser()
      
    } catch (error) {
      console.error('Auth callback exception:', error)
      return NextResponse.redirect(
        new URL('/auth/login?error=Authentication failed', baseUrl)
      )
    }
  }

  // Redirect to the next URL or dashboard
  return NextResponse.redirect(new URL(next, baseUrl))
}
