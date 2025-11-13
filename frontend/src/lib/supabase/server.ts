// This file has been deprecated - Supabase has been replaced with NextAuth + Prisma
// Keeping this stub to prevent import errors during migration
// TODO: Remove all imports of this file and migrate analysis upload to Prisma

import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function createClient() {
  // Temporary stub to prevent errors during migration
  // Analysis upload API needs to be migrated to Prisma
  console.warn('Supabase server client is deprecated. Analysis upload needs migration to Prisma.')
  
  // Get NextAuth session instead
  const session = await getServerSession(authOptions)
  
  // Return a minimal mock with NextAuth session
  return {
    auth: {
      getSession: async () => ({ 
        data: { 
          session: session ? {
            user: {
              id: session.user.id,
              email: session.user.email
            }
          } : null 
        }, 
        error: null 
      })
    },
    from: () => ({
      insert: () => ({ 
        select: () => ({ 
          single: () => ({ 
            data: null, 
            error: { message: 'Supabase deprecated - migrate to Prisma' } 
          }) 
        }) 
      }),
      delete: () => ({ eq: () => Promise.resolve() })
    }),
    storage: {
      from: () => ({
        upload: () => Promise.resolve({ 
          data: null, 
          error: { message: 'Supabase storage deprecated - migrate to Prisma' } 
        })
      })
    }
  } as any
}
