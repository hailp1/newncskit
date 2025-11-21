/**
 * Supabase Middleware for Authentication
 * Handles session refresh and cookie management
 */

import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import type { Database } from '@/types/supabase'

function buildCookieOptions(request: NextRequest, options: Record<string, unknown> = {}) {
  const host = request.headers.get('host') ?? ''
  const isHttps = request.nextUrl.protocol === 'https:' || process.env.NODE_ENV === 'production'
  const envDomain = process.env.NEXT_PUBLIC_COOKIE_DOMAIN
  const derivedDomain = envDomain ?? (host.endsWith('ncskit.org') ? '.ncskit.org' : undefined)

  const result: Record<string, unknown> = {
    ...options,
    sameSite: options.sameSite ?? 'lax',
    secure: options.secure ?? isHttps,
  }

  if (derivedDomain) {
    result.domain = derivedDomain
  } else if (!options.domain) {
    delete result.domain
  }

  return result
}

export async function updateSession(request: NextRequest) {
  // Create an initial response
  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: any = {}) {
          const cookieOptions = buildCookieOptions(request, options)

          // Update the request cookies (so downstream sees new values)
          request.cookies.set({
            name,
            value,
            ...cookieOptions,
          })
          
          // Update the response cookies (so browser gets them)
          response.cookies.set({
            name,
            value,
            ...cookieOptions,
          })
        },
        remove(name: string, options: any = {}) {
          const cookieOptions = buildCookieOptions(request, options)

          request.cookies.set({
            name,
            value: '',
            ...cookieOptions,
          })
          
          response.cookies.set({
            name,
            value: '',
            ...cookieOptions,
          })
        },
      },
    }
  )

  // Refresh session if expired
  await supabase.auth.getUser()

  return response
}

/**
 * Check if user is authenticated
 */
export async function requireAuth(request: NextRequest) {
  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set() {},
        remove() {},
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  return user
}
