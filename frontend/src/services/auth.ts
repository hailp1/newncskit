import type { User, UserRegistration, LoginCredentials } from '@/types'

// Convert API user response to app user format
function apiUserToAppUser(apiUser: any): User {
  return {
    id: apiUser.id,
    email: apiUser.email,
    profile: {
      firstName: apiUser.full_name?.split(' ')[0] || '',
      lastName: apiUser.full_name?.split(' ').slice(1).join(' ') || '',
      institution: undefined,
      researchDomain: [],
      orcidId: undefined,
      avatar: undefined,
    },
    subscription: {
      type: 'free',
      features: ['basic_projects', 'reference_manager', 'smart_editor'],
    },
    preferences: {
      theme: 'light',
      language: 'en',
      notifications: {
        email: true,
        push: false,
        deadlines: true,
        collaboration: true,
      },
    },
    role: apiUser.role || 'user',
    status: 'active',
    full_name: apiUser.full_name || apiUser.email,
    createdAt: new Date(),
    updatedAt: new Date(),
  }
}

export const authService = {
  // Sign up with email and password
  async signUp(userData: UserRegistration) {
    try {
      // Simple demo registration - create user immediately
      const demoUser = {
        id: `user-${Date.now()}`,
        email: userData.email,
        full_name: `${userData.firstName} ${userData.lastName}`.trim(),
        role: 'user' // Always user role for demo
      }

      return {
        user: apiUserToAppUser(demoUser),
        session: { access_token: 'demo-token' },
      }
    } catch (error: any) {
      console.error('Sign up error:', error)
      throw new Error(error?.message || 'Registration failed. Please try again.')
    }
  },

  // Sign in with email and password
  async signIn(credentials: LoginCredentials) {
    try {
      // Admin authentication
      if (credentials.email === 'admin@ncskit.org' && credentials.password === 'admin123') {
        const adminUser = {
          id: 'admin-user-1',
          email: 'admin@ncskit.org',
          full_name: 'NCSKIT Administrator',
          role: 'admin' // Full admin privileges
        }

        return {
          user: apiUserToAppUser(adminUser),
          session: { access_token: 'admin-token' },
        }
      }

      // Demo user authentication
      if (credentials.email === 'demo@ncskit.org' && credentials.password === 'demo123') {
        const demoUser = {
          id: 'demo-user-1',
          email: 'demo@ncskit.org',
          full_name: 'Demo Researcher',
          role: 'user'
        }

        return {
          user: apiUserToAppUser(demoUser),
          session: { access_token: 'demo-token' },
        }
      }

      // For any other credentials, allow them to "register" as new user
      if (credentials.email && credentials.password) {
        const newUser = {
          id: `user-${Date.now()}`,
          email: credentials.email,
          full_name: credentials.email.split('@')[0], // Use email prefix as name
          role: 'user'
        }

        return {
          user: apiUserToAppUser(newUser),
          session: { access_token: 'demo-token' },
        }
      }

      throw new Error('Please enter valid email and password')
    } catch (error: any) {
      console.error('Sign in error:', error)
      throw new Error(error?.message || 'Login failed. Please check your credentials.')
    }
  },

  // Sign in with OAuth (placeholder for future implementation)
  async signInWithOAuth(provider: 'google' | 'linkedin') {
    throw new Error(`OAuth with ${provider} is not yet implemented`)
  },

  // Sign out
  async signOut() {
    try {
      await fetch('/api/auth/session', {
        method: 'DELETE',
      })
    } catch (error) {
      console.error('Sign out error:', error)
      // Don't throw error, allow logout to proceed
    }
  },

  // Get current session
  async getSession() {
    try {
      const response = await fetch('/api/auth/session')
      
      if (!response.ok) {
        return null
      }

      const data = await response.json()
      
      if (!data.user) {
        return null
      }

      return {
        user: apiUserToAppUser(data.user),
        session: { access_token: 'session-token' },
      }
    } catch (error) {
      console.error('Get session error:', error)
      return null
    }
  },

  // Update user profile
  async updateProfile(userId: string, updates: Partial<User['profile']>) {
    try {
      // For now, return the current user with updates applied
      // In a real implementation, this would make an API call
      const currentSession = await this.getSession()
      if (!currentSession?.user) {
        throw new Error('No user logged in')
      }

      const updatedUser = {
        ...currentSession.user,
        profile: {
          ...currentSession.user.profile,
          ...updates,
        },
      }

      return updatedUser
    } catch (error) {
      console.error('Update profile error:', error)
      throw error
    }
  },

  // Listen to auth state changes (simplified for now)
  onAuthStateChange(callback: (user: User | null) => void) {
    // For now, just call the callback immediately with current session
    this.getSession().then((session) => {
      callback(session?.user || null)
    })

    // Return a dummy unsubscribe function
    return {
      data: {
        subscription: {
          unsubscribe: () => {},
        },
      },
    }
  },

  // Reset password - send reset email
  async resetPassword(email: string) {
    try {
      // For now, just return success
      // In a real implementation, this would send a reset email
      return { success: true }
    } catch (error: any) {
      console.error('Reset password error:', error)
      throw new Error('Không thể gửi email đặt lại mật khẩu')
    }
  },

  // Update password with reset token
  async updatePassword(newPassword: string) {
    try {
      // For now, just return success
      // In a real implementation, this would update the password
      return { success: true }
    } catch (error: any) {
      console.error('Update password error:', error)
      throw new Error('Không thể cập nhật mật khẩu')
    }
  },

  // Change password for logged in user
  async changePassword(currentPassword: string, newPassword: string) {
    try {
      // For now, just return success
      // In a real implementation, this would verify current password and update
      return { success: true }
    } catch (error: any) {
      console.error('Change password error:', error)
      throw new Error('Không thể thay đổi mật khẩu')
    }
  },
}