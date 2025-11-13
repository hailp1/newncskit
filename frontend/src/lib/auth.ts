import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import LinkedInProvider from 'next-auth/providers/linkedin'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import { prisma } from './prisma'
import bcrypt from 'bcryptjs'

// Custom ORCID Provider
const ORCIDProvider = (options: any) => ({
  id: 'orcid',
  name: 'ORCID',
  type: 'oauth' as const,
  wellKnown: 'https://orcid.org/.well-known/openid-configuration',
  authorization: {
    url: 'https://orcid.org/oauth/authorize',
    params: { scope: '/authenticate' }
  },
  token: 'https://orcid.org/oauth/token',
  userinfo: 'https://pub.orcid.org/v3.0',
  profile(profile: any) {
    return {
      id: profile.orcid,
      name: profile.name || `${profile['given-names']?.value || ''} ${profile['family-name']?.value || ''}`.trim(),
      email: profile.email || null,
      image: null,
      orcidId: profile.orcid,
    }
  },
  style: {
    logo: '/orcid-logo.svg',
    logoDark: '/orcid-logo.svg',
    bg: '#fff',
    text: '#000',
    bgDark: '#fff',
    textDark: '#000',
  },
  options
})

// Get base URL from environment or detect from request
function getBaseUrl(): string {
  // In production, use NEXTAUTH_URL if set
  if (process.env.NEXTAUTH_URL) {
    return process.env.NEXTAUTH_URL
  }
  
  // Fallback to localhost for development
  return process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
}

export const authOptions: NextAuthOptions = {
  // Set base URL explicitly for OAuth callbacks
  // This ensures OAuth redirects use the correct domain
  baseUrl: process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  
  // Note: PrismaAdapter doesn't work well with CredentialsProvider
  // adapter: PrismaAdapter(prisma),
  providers: [
    // Email/Password Login
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Invalid credentials')
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          select: {
            id: true,
            email: true,
            password: true,
            fullName: true,
            role: true,
            status: true,
            avatarUrl: true,
          }
        })

        if (!user || !user.password) {
          throw new Error('Invalid credentials')
        }

        const isCorrectPassword = await bcrypt.compare(
          credentials.password,
          user.password
        )

        if (!isCorrectPassword) {
          throw new Error('Invalid credentials')
        }

        // Return user without password
        const { password, ...userWithoutPassword } = user
        return userWithoutPassword as any
      }
    }),
    
    // Google OAuth
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      authorization: {
        params: {
          prompt: 'consent',
          access_type: 'offline',
          response_type: 'code'
        }
      }
    }),
    
    // LinkedIn OAuth
    LinkedInProvider({
      clientId: process.env.LINKEDIN_CLIENT_ID || '',
      clientSecret: process.env.LINKEDIN_CLIENT_SECRET || '',
      authorization: {
        params: {
          scope: 'openid profile email'
        }
      }
    }),
    
    // ORCID OAuth
    ORCIDProvider({
      clientId: process.env.ORCID_CLIENT_ID || '',
      clientSecret: process.env.ORCID_CLIENT_SECRET || '',
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/auth/login',
    error: '/auth/error',
  },
  debug: process.env.NODE_ENV === 'development',
  callbacks: {
    async redirect({ url, baseUrl }) {
      // Use baseUrl from NextAuth (which uses authOptions.baseUrl or detects from request)
      // This ensures OAuth callbacks use the correct domain
      const actualBaseUrl = baseUrl || getBaseUrl()
      
      // If url is relative, prepend baseUrl
      if (url.startsWith('/')) {
        return `${actualBaseUrl}${url}`
      }
      
      // If url is on the same origin, allow it
      try {
        const urlObj = new URL(url)
        const baseUrlObj = new URL(actualBaseUrl)
        if (urlObj.origin === baseUrlObj.origin) {
          return url
        }
      } catch {
        // Invalid URL, return baseUrl
      }
      
      // Default to baseUrl
      return actualBaseUrl
    },
    
    async signIn({ user, account, profile }) {
      // Allow credentials provider
      if (account?.provider === 'credentials') {
        return true
      }

      // Handle OAuth providers (Google, LinkedIn, ORCID)
      if (account?.provider && user.email) {
        try {
          // Check if user exists
          let existingUser = await prisma.user.findUnique({
            where: { email: user.email }
          })

          // Create user if doesn't exist
          if (!existingUser) {
            existingUser = await prisma.user.create({
              data: {
                email: user.email,
                fullName: user.name || '',
                avatarUrl: user.image || null,
                emailVerified: true,
                emailVerifiedAt: new Date(),
                orcidId: account.provider === 'orcid' ? (profile as any)?.orcid : null,
              }
            })
          } else {
            // Update ORCID if signing in with ORCID
            if (account.provider === 'orcid' && (profile as any)?.orcid) {
              await prisma.user.update({
                where: { id: existingUser.id },
                data: { orcidId: (profile as any).orcid }
              })
            }
          }

          return true
        } catch (error) {
          console.error('Error in signIn callback:', error)
          return false
        }
      }

      return true
    },
    
    async jwt({ token, user, trigger, account }) {
      // Initial sign in
      if (user) {
        // For OAuth providers, user.id might not be set, need to get from database
        if (account?.provider && account.provider !== 'credentials' && user.email) {
          try {
            const dbUser = await prisma.user.findUnique({
              where: { email: user.email },
              select: {
                id: true,
                email: true,
                fullName: true,
                role: true,
                status: true,
              }
            })
            
            if (dbUser) {
              token.id = dbUser.id
              token.email = dbUser.email
              token.role = dbUser.role || 'user'
              token.name = dbUser.fullName || user.name
            } else {
              // Fallback to user object if database lookup fails
              token.id = (user as any).id || ''
              token.email = user.email
              token.role = (user as any).role || 'user'
              token.name = (user as any).fullName || user.name
            }
          } catch (error) {
            console.error('Error fetching user in jwt callback:', error)
            // Fallback
            token.id = (user as any).id || ''
            token.email = user.email
            token.role = (user as any).role || 'user'
            token.name = (user as any).fullName || user.name
          }
        } else {
          // For credentials provider, user.id should be set
          token.id = (user as any).id || user.email || ''
          token.email = user.email
          token.role = (user as any).role || 'user'
          token.name = (user as any).fullName || user.name
        }
      }
      
      // Update token on session update
      if (trigger === 'update') {
        const updatedUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: {
            id: true,
            email: true,
            fullName: true,
            role: true,
            status: true,
          }
        })
        
        if (updatedUser) {
          token.role = updatedUser.role
          token.name = updatedUser.fullName
        }
      }
      
      return token
    },
    
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.email = token.email as string
        session.user.name = token.name as string
        ;(session.user as any).role = token.role
      }
      return session
    }
  }
}
