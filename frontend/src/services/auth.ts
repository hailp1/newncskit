import type { User, UserRegistration, LoginCredentials } from '@/types'

// Convert API user response to app user format
function apiUserToAppUser(apiUser: any): User {
  return {
    id: apiUser.id,
    email: apiUser.email,
    profile: {
      firstName: apiUser.first_name || apiUser.full_name?.split(' ')[0] || '',
      lastName: apiUser.last_name || apiUser.full_name?.split(' ').slice(1).join(' ') || '',
      institution: apiUser.institution || undefined,
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
    role: (() => {
      // Determine role based on backend role assignment or staff status
      if (apiUser.role_assignments && apiUser.role_assignments.length > 0) {
        // Use the highest priority role from backend
        const roleNames = apiUser.role_assignments.map((ra: any) => ra.role.name.toLowerCase().replace(' ', '_'));
        if (roleNames.includes('super_admin')) return 'super_admin';
        if (roleNames.includes('admin')) return 'admin';
        if (roleNames.includes('moderator')) return 'moderator';
      }
      if (apiUser.is_superuser) return 'super_admin';
      if (apiUser.is_staff) return 'admin';
      return apiUser.role || 'user';
    })(),
    status: 'active',
    full_name: apiUser.full_name || `${apiUser.first_name || ''} ${apiUser.last_name || ''}`.trim() || apiUser.email,
    is_staff: apiUser.is_staff,
    is_superuser: apiUser.is_superuser,
    createdAt: new Date(),
    updatedAt: new Date(),
  }
}

export const authService = {
  // Sign up with email and password
  async signUp(userData: UserRegistration) {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001'
      
      const response = await fetch(`${apiUrl}/api/auth/register/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: userData.email,
          first_name: userData.firstName,
          last_name: userData.lastName,
          password: userData.password,
          password_confirm: userData.password,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        
        // Store tokens in localStorage
        if (data.tokens?.access) {
          localStorage.setItem('access_token', data.tokens.access)
        }
        if (data.tokens?.refresh) {
          localStorage.setItem('refresh_token', data.tokens.refresh)
        }

        return {
          user: apiUserToAppUser(data.user),
          session: { access_token: data.tokens.access },
        }
      } else {
        const errorData = await response.json()
        throw new Error(errorData.detail || errorData.message || 'Registration failed')
      }
    } catch (error: any) {
      console.error('Sign up error:', error)
      throw new Error(error?.message || 'Registration failed. Please try again.')
    }
  },

  // Sign in with email and password
  async signIn(credentials: LoginCredentials) {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001'
      
      const response = await fetch(`${apiUrl}/api/auth/login/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: credentials.email,
          password: credentials.password,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        
        // Store tokens in localStorage
        if (data.tokens?.access) {
          localStorage.setItem('access_token', data.tokens.access)
        }
        if (data.tokens?.refresh) {
          localStorage.setItem('refresh_token', data.tokens.refresh)
        }

        // Convert Django user to app user format
        const user = {
          id: data.user.id,
          email: data.user.email,
          full_name: `${data.user.first_name || ''} ${data.user.last_name || ''}`.trim() || data.user.email,
          role: data.user.is_staff || data.user.is_superuser ? 'admin' : 'user',
          is_staff: data.user.is_staff,
          is_superuser: data.user.is_superuser,
          first_name: data.user.first_name,
          last_name: data.user.last_name,
          institution: data.user.institution,
        }

        return {
          user: apiUserToAppUser(user),
          session: { access_token: data.tokens.access },
        }
      } else {
        const errorData = await response.json()
        throw new Error(errorData.detail || errorData.message || 'Invalid email or password')
      }
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
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001'
      const refreshToken = localStorage.getItem('refresh_token')
      
      if (refreshToken) {
        await fetch(`${apiUrl}/api/auth/logout/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`
          },
          body: JSON.stringify({
            refresh_token: refreshToken
          })
        })
      }
      
      // Clear tokens
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
    } catch (error) {
      console.error('Sign out error:', error)
      // Clear tokens even if API call fails
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
    }
  },

  // Get current session
  async getSession() {
    try {
      const accessToken = localStorage.getItem('access_token')
      if (!accessToken) {
        return null
      }

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001'
      const response = await fetch(`${apiUrl}/api/auth/profile/`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      })
      
      if (!response.ok) {
        // Token might be expired, try to refresh
        const refreshToken = localStorage.getItem('refresh_token')
        if (refreshToken) {
          const refreshResponse = await fetch(`${apiUrl}/api/auth/token/refresh/`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              refresh: refreshToken
            })
          })
          
          if (refreshResponse.ok) {
            const refreshData = await refreshResponse.json()
            localStorage.setItem('access_token', refreshData.access)
            
            // Retry with new token
            const retryResponse = await fetch(`${apiUrl}/api/auth/profile/`, {
              headers: {
                'Authorization': `Bearer ${refreshData.access}`
              }
            })
            
            if (retryResponse.ok) {
              const userData = await retryResponse.json()
              return {
                user: apiUserToAppUser(userData),
                session: { access_token: refreshData.access },
              }
            }
          }
        }
        
        // Clear invalid tokens
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        return null
      }

      const userData = await response.json()
      return {
        user: apiUserToAppUser(userData),
        session: { access_token: accessToken },
      }
    } catch (error) {
      console.error('Get session error:', error)
      return null
    }
  },

  // Update user profile
  async updateProfile(userId: string, updates: Partial<User['profile']>) {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001'
      const accessToken = localStorage.getItem('access_token')
      
      if (!accessToken) {
        throw new Error('No user logged in')
      }

      const response = await fetch(`${apiUrl}/api/auth/profile/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({
          first_name: updates.firstName,
          last_name: updates.lastName,
          institution: updates.institution,
          orcid_id: updates.orcidId,
        })
      })

      if (response.ok) {
        const userData = await response.json()
        return apiUserToAppUser(userData)
      } else {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Failed to update profile')
      }
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
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001'
      
      const response = await fetch(`${apiUrl}/api/auth/password/reset/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email })
      })

      if (response.ok) {
        return { success: true }
      } else {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Failed to send reset email')
      }
    } catch (error: any) {
      console.error('Reset password error:', error)
      throw new Error('Không thể gửi email đặt lại mật khẩu')
    }
  },

  // Update password with reset token
  async updatePassword(token: string, newPassword: string) {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001'
      
      const response = await fetch(`${apiUrl}/api/auth/password/reset/confirm/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          new_password: newPassword
        })
      })

      if (response.ok) {
        return { success: true }
      } else {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Failed to update password')
      }
    } catch (error: any) {
      console.error('Update password error:', error)
      throw new Error('Không thể cập nhật mật khẩu')
    }
  },

  // Change password for logged in user
  async changePassword(currentPassword: string, newPassword: string) {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001'
      const accessToken = localStorage.getItem('access_token')
      
      if (!accessToken) {
        throw new Error('No user logged in')
      }

      const response = await fetch(`${apiUrl}/api/auth/password/change/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({
          old_password: currentPassword,
          new_password: newPassword
        })
      })

      if (response.ok) {
        return { success: true }
      } else {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Failed to change password')
      }
    } catch (error: any) {
      console.error('Change password error:', error)
      throw new Error('Không thể thay đổi mật khẩu')
    }
  },
}