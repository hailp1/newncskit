// Use mock Supabase for blog system to avoid authentication requirements
import { supabase as mockSupabase } from './supabase-mock'

// Check if we have real Supabase credentials
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

let supabaseClient: any
let supabaseAdminClient: any

if (supabaseUrl && supabaseAnonKey && !supabaseAnonKey.includes('example')) {
  // Use real Supabase if properly configured
  const { createClient } = require('@supabase/supabase-js')
  supabaseClient = createClient(supabaseUrl, supabaseAnonKey)
  supabaseAdminClient = createClient(supabaseUrl, supabaseAnonKey)
} else {
  // Use mock Supabase for blog demo
  supabaseClient = mockSupabase
  supabaseAdminClient = mockSupabase
}

export const supabase = supabaseClient
export const supabaseAdmin = supabaseAdminClient