/**
 * Supabase Client for Server
 * Use this in Server Components, Server Actions, and Route Handlers
 */

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from '@/types/supabase'

function buildCookieOptions(options: Record<string, unknown> = {}) {
  const result: Record<string, unknown> = {
    ...options,
    sameSite: options.sameSite ?? 'lax',
    secure: options.secure ?? process.env.NODE_ENV === 'production',
  }

  const cookieDomain = process.env.NEXT_PUBLIC_COOKIE_DOMAIN
  if (cookieDomain) {
    result.domain = cookieDomain
  } else if (!options.domain) {
    delete result.domain
  }

  return result
}

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: any = {}) {
          try {
            const cookieOptions = buildCookieOptions(options)
            cookieStore.set({ name, value, ...cookieOptions })
          } catch (error) {
            // Handle cookie setting errors in Server Components
          }
        },
        remove(name: string, options: any = {}) {
          try {
            const cookieOptions = buildCookieOptions(options)
            cookieStore.set({ name, value: '', ...cookieOptions })
          } catch (error) {
            // Handle cookie removal errors
          }
        },
      },
    }
  )
}
