/**
 * Supabase Client for Browser
 * Use this in Client Components
 */

import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/types/supabase'

function getCookieDomain() {
  if (process.env.NEXT_PUBLIC_COOKIE_DOMAIN) {
    return process.env.NEXT_PUBLIC_COOKIE_DOMAIN
  }

  if (typeof window === 'undefined') return undefined

  return window.location.hostname.endsWith('ncskit.org')
    ? '.ncskit.org'
    : undefined
}

function isSecureContext() {
  if (typeof window === 'undefined') {
    return process.env.NODE_ENV === 'production'
  }
  return window.location.protocol === 'https:'
}

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookieOptions: {
        domain: getCookieDomain(),
        sameSite: 'lax',
        secure: isSecureContext(),
      },
    }
  )
}

// Export singleton instance for convenience
export const supabase = createClient()
