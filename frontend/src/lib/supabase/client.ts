/**
 * Supabase Client for Browser
 * Use this in Client Components
 */

import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/types/supabase'
import { env } from '@/config/env'

export function createClient() {
  return createBrowserClient<Database>(
    env.supabase.url,
    env.supabase.anonKey
  )
}

// Export singleton instance for convenience
export const supabase = createClient()
