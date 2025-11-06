import { NextAuthOptions, User } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { Pool } from 'pg';

// Extend the built-in session types
declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string;
      image?: string;
      role: string;
    };
  }

  interface User {
    id: string;
    email: string;
    name?: string;
    image?: string;
    role?: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    role: string;
  }
}

// Custom profile interface for ORCID
interface ORCIDProfile {
  id: string;
  name: string;
  email: string | null;
  image: string | null;
  orcid: string;
}

// Database connection for NextAuth
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 
    `postgresql://${process.env.POSTGRES_USER || 'postgres'}:${process.env.POSTGRES_PASSWORD || 'postgres'}@${process.env.POSTGRES_HOST || 'localhost'}:${process.env.POSTGRES_PORT || '5432'}/${process.env.POSTGRES_DB || 'ncskit'}`
});

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: 'openid email profile',
          prompt: 'consent',
          access_type: 'offline',
          response_type: 'code',
        },
      },
      // Environment-specific redirect URI
      ...(process.env.ENVIRONMENT === 'production' && {
        redirectUri: process.env.OAUTH_GOOGLE_REDIRECT_URI || 'https://ncskit.org/auth/google_connect.php'
      }),
    }),
    // LinkedIn Provider (enhanced implementation)
    {
      id: 'linkedin',
      name: 'LinkedIn',
      type: 'oauth',
      authorization: {
        url: 'https://www.linkedin.com/oauth/v2/authorization',
        params: {
          scope: 'r_liteprofile r_emailaddress',
          response_type: 'code',
        },
      },
      token: 'https://www.linkedin.com/oauth/v2/accessToken',
      userinfo: {
        url: 'https://api.linkedin.com/v2/people/~:(id,firstName,lastName,profilePicture(displayImage~:playableStreams))',
        async request({ tokens }) {
          try {
            const profileResponse = await fetch(
              'https://api.linkedin.com/v2/people/~:(id,firstName,lastName,profilePicture(displayImage~:playableStreams))',
              {
                headers: {
                  Authorization: `Bearer ${tokens.access_token}`,
                  'X-Restli-Protocol-Version': '2.0.0',
                },
              }
            );

            if (!profileResponse.ok) {
              throw new Error(`LinkedIn profile request failed: ${profileResponse.status}`);
            }

            const profile = await profileResponse.json();

            const emailResponse = await fetch(
              'https://api.linkedin.com/v2/emailAddress?q=members&projection=(elements*(handle~))',
              {
                headers: {
                  Authorization: `Bearer ${tokens.access_token}`,
                  'X-Restli-Protocol-Version': '2.0.0',
                },
              }
            );

            if (!emailResponse.ok) {
              throw new Error(`LinkedIn email request failed: ${emailResponse.status}`);
            }

            const emailData = await emailResponse.json();
            const email = emailData.elements?.[0]?.['handle~']?.emailAddress;

            return {
              id: profile.id || '',
              name: `${profile.firstName?.localized?.en_US || ''} ${profile.lastName?.localized?.en_US || ''}`.trim() || 'LinkedIn User',
              email: email || '',
              image: profile.profilePicture?.['displayImage~']?.elements?.[0]?.identifiers?.[0]?.identifier || null,
            };
          } catch (error) {
            console.error('LinkedIn userinfo request failed:', error);
            throw error;
          }
        },
      },
      clientId: process.env.LINKEDIN_CLIENT_ID!,
      clientSecret: process.env.LINKEDIN_CLIENT_SECRET!,
      profile(profile: any) {
        return {
          id: profile.id,
          name: profile.name,
          email: profile.email,
          image: profile.image,
        };
      },
    },
    // ORCID Provider (enhanced implementation)
    {
      id: 'orcid',
      name: 'ORCID',
      type: 'oauth',
      authorization: {
        url: 'https://orcid.org/oauth/authorize',
        params: {
          scope: '/authenticate',
          response_type: 'code',
        },
      },
      token: 'https://orcid.org/oauth/token',
      userinfo: {
        async request({ tokens }) {
          try {
            const response = await fetch(
              `https://pub.orcid.org/v3.0/${tokens.orcid}/person`,
              {
                headers: {
                  Authorization: `Bearer ${tokens.access_token}`,
                  Accept: 'application/json',
                },
              }
            );

            if (!response.ok) {
              throw new Error(`ORCID profile request failed: ${response.status}`);
            }

            const data = await response.json();
            
            return {
              id: tokens.orcid || '',
              name: data.name ? 
                `${data.name['given-names']?.value || ''} ${data.name['family-name']?.value || ''}`.trim() : 
                tokens.name || 'ORCID User',
              email: data.emails?.email?.[0]?.email || null,
              image: null,
              orcid: tokens.orcid,
            } as ORCIDProfile;
          } catch (error) {
            console.error('ORCID userinfo request failed:', error);
            throw error;
          }
        },
      },
      clientId: process.env.ORCID_CLIENT_ID!,
      clientSecret: process.env.ORCID_CLIENT_SECRET!,
      profile(profile: ORCIDProfile) {
        return {
          id: profile.id,
          name: profile.name,
          email: profile.email,
          image: profile.image,
        };
      },
    },
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      // Validate required data
      if (!user.email) {
        console.error('No email provided by OAuth provider:', account?.provider);
        return false;
      }

      // Security: Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(user.email)) {
        console.error('Invalid email format from OAuth provider:', user.email);
        return false;
      }

      try {
        const client = await pool.connect();
        
        try {
          // Check if user exists
          const existingUser = await client.query(
            'SELECT id, email, is_active, role FROM users WHERE email = $1',
            [user.email]
          );

          if (existingUser.rows.length > 0) {
            const dbUser = existingUser.rows[0];
            
            // Security: Check if account is active
            if (!dbUser.is_active) {
              console.error('User account is deactivated:', user.email);
              return false;
            }

            // Update user info and OAuth connection
            await client.query(
              `UPDATE users SET 
                full_name = COALESCE($1, full_name),
                profile_image = COALESCE($2, profile_image),
                last_login = NOW(),
                oauth_provider = $3,
                oauth_id = $4
               WHERE email = $5`,
              [user.name, user.image, account?.provider, account?.providerAccountId, user.email]
            );

            // Add ORCID if available
            if (account?.provider === 'orcid' && (profile as any)?.orcid) {
              await client.query(
                'UPDATE users SET orcid_id = $1 WHERE email = $2',
                [(profile as any).orcid, user.email]
              );
            }

            // Set user role for session
            user.role = dbUser.role;
            user.id = dbUser.id.toString();
          } else {
            // Create new user
            const newUser = await client.query(
              `INSERT INTO users (
                email, 
                full_name, 
                profile_image, 
                role, 
                is_active, 
                email_verified, 
                oauth_provider, 
                oauth_id,
                orcid_id,
                created_at
              ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW()) 
              RETURNING id, role`,
              [
                user.email,
                user.name || 'OAuth User',
                user.image,
                'user', // Default role
                true,
                true, // OAuth users are considered email verified
                account?.provider,
                account?.providerAccountId,
                account?.provider === 'orcid' ? (profile as any)?.orcid : null
              ]
            );

            user.id = newUser.rows[0].id.toString();
            user.role = newUser.rows[0].role;
          }

          console.log('OAuth sign in successful:', { 
            email: user.email, 
            provider: account?.provider,
            userId: user.id 
          });
          return true;
        } finally {
          client.release();
        }
      } catch (error) {
        console.error('Database error during OAuth sign in:', error);
        return false;
      }
    },
    async jwt({ token, user }) {
      // Add user info to JWT token
      if (user) {
        token.id = user.id;
        token.role = user.role || 'user';
      }
      return token;
    },
    async session({ session, token }) {
      // Add user info to session
      if (token && session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
      }
      return session;
    },
  },
  pages: {
    signIn: '/auth',
    error: '/auth/error',
    newUser: '/dashboard', // Redirect new users to dashboard
  },
  session: {
    strategy: 'jwt',
    maxAge: parseInt(process.env.OAUTH_SESSION_TIMEOUT || '3600'), // Configurable session timeout
    updateAge: 24 * 60 * 60, // Update session every 24 hours
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
  // Security settings
  useSecureCookies: process.env.NODE_ENV === 'production',
  cookies: {
    sessionToken: {
      name: process.env.NODE_ENV === 'production' ? '__Secure-next-auth.session-token' : 'next-auth.session-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
  },
};