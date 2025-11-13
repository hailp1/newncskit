import NextAuth from 'next-auth'
import { authOptions } from '@/lib/auth'

// Log NEXTAUTH_URL for debugging (remove in production if needed)
if (process.env.NODE_ENV === 'production') {
  console.log('[NextAuth] NEXTAUTH_URL:', process.env.NEXTAUTH_URL)
  console.log('[NextAuth] NEXT_PUBLIC_APP_URL:', process.env.NEXT_PUBLIC_APP_URL)
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
