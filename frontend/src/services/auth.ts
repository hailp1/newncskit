import { supabase } from '@/lib/supabase'
import type { User, UserRegistration, LoginCredentials } from '@/types'
import type { Database } from '@/types/database'

type DbUser = Database['public']['Tables']['users']['Row']

// Convert database user to app user format
function dbUserToAppUser(dbUser: DbUser): User {
  return {
    id: dbUser.id,
    email: dbUser.email,
    profile: {
      firstName: dbUser.first_name,
      lastName: dbUser.last_name,
      institution: dbUser.institution || undefined,
      researchDomain: dbUser.research_domains,
      orcidId: dbUser.orcid_id || undefined,
      avatar: dbUser.avatar_url || undefined,
    },
    subscription: {
      type: dbUser.subscription_type,
      features: getSubscriptionFeatures(dbUser.subscription_type),
    },
    preferences: (dbUser.preferences as any) || {
      theme: 'light',
      language: 'en',
      notifications: {
        email: true,
        push: false,
        deadlines: true,
        collaboration: true,
      },
    },
    createdAt: new Date(dbUser.created_at),
    updatedAt: new Date(dbUser.updated_at),
  }
}

function getSubscriptionFeatures(type: 'free' | 'premium' | 'institutional'): string[] {
  switch (type) {
    case 'free':
      return ['basic_projects', 'reference_manager', 'smart_editor']
    case 'premium':
      return ['all_features', 'ai_assistance', 'collaboration', 'analytics']
    case 'institutional':
      return ['all_features', 'ai_assistance', 'collaboration', 'analytics', 'team_management', 'advanced_security']
    default:
      return ['basic_projects']
  }
}

export const authService = {
  // Sign up with email and password
  async signUp(userData: UserRegistration) {
    try {
      // Try Supabase Auth first
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
      })

      if (authError) {
        console.log('Supabase auth signup failed, trying Django backend...', authError.message)
        // Fallback to Django backend registration
        try {
          return await this.signUpWithDjango(userData)
        } catch (djangoError) {
          // If Django also fails, throw the Django error (more informative)
          throw djangoError
        }
      }

      if (!authData.user) throw new Error('Failed to create user')

      // Create user profile in Supabase
      try {
        const { data: profileData, error: profileError } = await supabase
          .from('users')
          .insert([{
            id: authData.user.id,
            email: userData.email,
            full_name: `${userData.firstName} ${userData.lastName}`.trim(),
            institution: userData.institution,
          }] as any)
          .select()
          .single()

        if (profileError) {
          console.warn('Profile creation error:', profileError)
          // Continue without profile creation error
        }
      } catch (error) {
        console.warn('Profile creation failed:', error)
        // Continue without profile creation error
      }

      // Create a basic user object from auth data
      const basicUser = {
        id: authData.user.id,
        email: authData.user.email!,
        full_name: `${userData.firstName} ${userData.lastName}`.trim(),
        avatar_url: null,
        institution: userData.institution,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      return {
        user: dbUserToAppUser(basicUser as any),
        session: authData.session,
      }
    } catch (error: any) {
      console.error('Sign up error:', error)
      
      // Handle specific Supabase auth errors
      if (error?.code === 'email_address_invalid') {
        throw new Error('Please enter a valid email address')
      }
      if (error?.code === 'signup_disabled') {
        throw new Error('Account registration is currently disabled')
      }
      if (error?.code === 'email_address_not_authorized') {
        throw new Error('This email domain is not authorized for registration')
      }
      if (error?.message?.includes('User already registered')) {
        throw new Error('An account with this email already exists')
      }
      
      throw new Error(error?.message || 'Registration failed. Please try again.')
    }
  },

  // Fallback registration via Django backend
  async signUpWithDjango(userData: UserRegistration) {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/auth/register/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: userData.email,
          password: userData.password,
          password_confirm: userData.password,
          first_name: userData.firstName,
          last_name: userData.lastName,
          institution: userData.institution,
          research_domains: userData.researchDomain,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error('Django registration error:', errorData)
        
        // Handle specific Django errors
        if (errorData.email) {
          throw new Error('Email: ' + errorData.email.join(', '))
        }
        if (errorData.password) {
          throw new Error('Password: ' + errorData.password.join(', '))
        }
        if (errorData.non_field_errors) {
          throw new Error(errorData.non_field_errors.join(', '))
        }
        
        throw new Error('Registration failed. Please check your information.')
      }

      const data = await response.json()
      console.log('Django registration successful:', data.user.email)
      
      // Try to create user in Supabase database (optional, for data sync)
      try {
        const { error: profileError } = await supabase
          .from('users')
          .insert({
            id: data.user.id, // Use Django user ID
            email: userData.email,
            first_name: userData.firstName,
            last_name: userData.lastName,
            institution: userData.institution,
            research_domains: userData.researchDomain,
            subscription_type: 'free',
          })

        if (profileError) {
          console.warn('Could not sync to Supabase:', profileError.message)
          // Don't throw error, Django registration was successful
        } else {
          console.log('User synced to Supabase database')
        }
      } catch (syncError) {
        console.warn('Supabase sync failed:', syncError)
        // Continue with Django-only registration
      }

      return this.convertDjangoResponse(data)
    } catch (error) {
      console.error('Django signup error:', error)
      throw error
    }
  },

  // Sign in with email and password
  async signIn(credentials: LoginCredentials) {
    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      })

      if (authError) {
        // If Supabase auth fails, try Django backend as fallback
        console.log('Supabase auth failed, trying Django backend...')
        return await this.signInWithDjango(credentials)
      }
      
      if (!authData.user) throw new Error('Failed to sign in')

      // Get user profile
      const { data: profileData, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', authData.user.id)
        .single()

      if (profileError) {
        // If profile doesn't exist, create it
        const newProfile = await this.createUserProfile(authData.user, credentials)
        return {
          user: dbUserToAppUser(newProfile),
          session: authData.session,
        }
      }

      return {
        user: dbUserToAppUser(profileData),
        session: authData.session,
      }
    } catch (error) {
      console.error('Sign in error:', error)
      throw error
    }
  },

  // Fallback to Django backend
  async signInWithDjango(credentials: LoginCredentials) {
    try {
      // Try demo login endpoint first
      const response = await fetch('http://127.0.0.1:8000/api/auth/demo/login/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      })

      if (!response.ok) {
        // If demo login fails, try regular login
        const regularResponse = await fetch('http://127.0.0.1:8000/api/auth/login/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(credentials),
        })
        
        if (!regularResponse.ok) {
          throw new Error('Authentication failed. Please check your credentials.')
        }
        
        const data = await regularResponse.json()
        return this.convertDjangoResponse(data)
      }

      const data = await response.json()
      return this.convertDjangoResponse(data)
      
    } catch (error) {
      console.error('Django sign in error:', error)
      throw error
    }
  },

  // Convert Django response to our User format
  convertDjangoResponse(data: any) {
    const user: User = {
      id: data.user.id,
      email: data.user.email,
      profile: {
        firstName: data.user.first_name,
        lastName: data.user.last_name,
        institution: data.user.institution,
        researchDomain: data.user.research_domains || [],
      },
      subscription: {
        type: data.user.subscription_type || 'free',
        features: data.user.subscription_features || [],
      },
      preferences: data.user.preferences || {
        theme: 'light',
        language: 'en',
        notifications: {
          email: true,
          push: false,
          deadlines: true,
          collaboration: true,
        },
      },
      createdAt: new Date(data.user.created_at),
      updatedAt: new Date(data.user.updated_at),
    }

    return {
      user,
      session: { access_token: data.tokens.access, refresh_token: data.tokens.refresh },
    }
  },

  // Create user profile in Supabase
  async createUserProfile(authUser: any, credentials: LoginCredentials) {
    const { data: profileData, error: profileError } = await supabase
      .from('users')
      .insert({
        id: authUser.id,
        email: authUser.email,
        first_name: authUser.user_metadata?.first_name || 'User',
        last_name: authUser.user_metadata?.last_name || '',
        subscription_type: 'free',
        research_domains: [],
      })
      .select()
      .single()

    if (profileError) throw profileError
    return profileData
  },

  // Sign in with OAuth (ORCID, Google, LinkedIn)
  async signInWithOAuth(provider: 'google' | 'linkedin') {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) throw error
      return data
    } catch (error) {
      console.error('OAuth sign in error:', error)
      throw error
    }
  },

  // Sign out
  async signOut() {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
    } catch (error) {
      console.error('Sign out error:', error)
      throw error
    }
  },

  // Get current session
  async getSession() {
    try {
      // First try to get session from localStorage (Django tokens)
      const storedAuth = localStorage.getItem('auth-storage')
      if (storedAuth) {
        const authData = JSON.parse(storedAuth)
        if (authData.state?.user && authData.state?.isAuthenticated) {
          console.log('Found stored auth session')
          return {
            user: authData.state.user,
            session: { access_token: 'stored', refresh_token: 'stored' }
          }
        }
      }

      // Fallback to Supabase auth
      const { data: { session }, error } = await supabase.auth.getSession()
      if (error) throw error

      if (!session?.user) return null

      // Get user profile from Supabase
      const { data: profileData, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', session.user.id)
        .single()

      if (profileError) throw profileError

      return {
        user: dbUserToAppUser(profileData),
        session,
      }
    } catch (error) {
      console.error('Get session error:', error)
      return null
    }
  },

  // Update user profile
  async updateProfile(userId: string, updates: Partial<User['profile']>) {
    try {
      const { data, error } = await supabase
        .from('users')
        .update({
          first_name: updates.firstName,
          last_name: updates.lastName,
          institution: updates.institution,
          research_domains: updates.researchDomain,
          orcid_id: updates.orcidId,
          avatar_url: updates.avatar,
        })
        .eq('id', userId)
        .select()
        .single()

      if (error) throw error
      return dbUserToAppUser(data)
    } catch (error) {
      console.error('Update profile error:', error)
      throw error
    }
  },

  // Listen to auth state changes
  onAuthStateChange(callback: (user: User | null) => void) {
    return supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        try {
          const { data: profileData, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .single()

          if (error) throw error
          callback(dbUserToAppUser(profileData))
        } catch (error) {
          console.error('Auth state change error:', error)
          callback(null)
        }
      } else {
        callback(null)
      }
    })
  },
}