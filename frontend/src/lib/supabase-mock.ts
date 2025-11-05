// Mock Supabase client for blog system
// This prevents Supabase initialization errors when we only need blog functionality

export const createClient = () => {
  return {
    auth: {
      getSession: () => Promise.resolve({ data: { session: null }, error: null }),
      signInWithPassword: () => Promise.resolve({ data: { user: null, session: null }, error: { message: 'Auth disabled for blog demo' } }),
      signUp: () => Promise.resolve({ data: { user: null, session: null }, error: { message: 'Auth disabled for blog demo' } }),
      signOut: () => Promise.resolve({ error: null }),
      resetPasswordForEmail: () => Promise.resolve({ error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } })
    },
    from: () => ({
      select: (columns?: string) => ({
        order: (column: string, options?: any) => ({
          range: (from: number, to: number) => Promise.resolve({ data: [], error: null }),
          limit: (count: number) => Promise.resolve({ data: [], error: null })
        }),
        filter: (column: string, operator: string, value: any) => ({
          order: (column: string, options?: any) => Promise.resolve({ data: [], error: null })
        }),
        eq: (column: string, value: any) => ({
          order: (column: string, options?: any) => Promise.resolve({ data: [], error: null })
        }),
        range: (from: number, to: number) => Promise.resolve({ data: [], error: null }),
        limit: (count: number) => Promise.resolve({ data: [], error: null }),
        single: () => Promise.resolve({ data: null, error: null })
      }),
      insert: (values: any) => ({
        select: (columns?: string) => Promise.resolve({ data: null, error: null })
      }),
      update: (values: any) => ({
        eq: (column: string, value: any) => ({
          select: (columns?: string) => Promise.resolve({ data: null, error: null })
        })
      }),
      delete: () => ({
        eq: (column: string, value: any) => Promise.resolve({ data: null, error: null })
      })
    })
  }
}

export const supabase = createClient()