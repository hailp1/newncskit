// Auth Service using Supabase
import { createClient } from '@/lib/supabase/client'

export interface UserProfile {
  id: string
  email: string
  profile: {
    firstName: string
    lastName: string
    institution?: string
    orcidId?: string
    researchDomain: string[]
  }
}

export interface UpdateProfileData {
  firstName: string
  lastName: string
  institution?: string
  orcidId?: string
  researchDomain: string[]
}

class AuthService {
  private supabase = createClient()

  /**
   * Update user profile
   */
  async updateProfile(userId: string, data: UpdateProfileData): Promise<UserProfile> {
    try {
      // Update user metadata in Supabase Auth
      const { data: authData, error: authError } = await this.supabase.auth.updateUser({
        data: {
          first_name: data.firstName,
          last_name: data.lastName,
          institution: data.institution,
          orcid_id: data.orcidId,
          research_domain: data.researchDomain,
        }
      })

      if (authError) throw authError

      // Also update profiles table if it exists
      const { error: profileError } = await this.supabase
        .from('profiles')
        .upsert({
          id: userId,
          first_name: data.firstName,
          last_name: data.lastName,
          institution: data.institution,
          orcid_id: data.orcidId,
          research_domain: data.researchDomain,
          updated_at: new Date().toISOString(),
        } as any)

      if (profileError) {
        console.warn('Profile table update failed:', profileError)
        // Don't throw - auth metadata update succeeded
      }

      // Return updated user object
      return {
        id: userId,
        email: authData.user?.email || '',
        profile: {
          firstName: data.firstName,
          lastName: data.lastName,
          institution: data.institution,
          orcidId: data.orcidId,
          researchDomain: data.researchDomain,
        }
      }
    } catch (error) {
      console.error('Update profile error:', error)
      throw new Error('Failed to update profile')
    }
  }

  /**
   * Get current user profile
   */
  async getCurrentUser(): Promise<UserProfile | null> {
    try {
      const { data: { user }, error } = await this.supabase.auth.getUser()

      if (error || !user) return null

      // Try to get from profiles table first
      const { data: profile } = await this.supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (profile) {
        const profileData = profile as any
        return {
          id: user.id,
          email: user.email || '',
          profile: {
            firstName: profileData.first_name || '',
            lastName: profileData.last_name || '',
            institution: profileData.institution,
            orcidId: profileData.orcid_id,
            researchDomain: profileData.research_domain || [],
          }
        }
      }

      // Fallback to user metadata
      return {
        id: user.id,
        email: user.email || '',
        profile: {
          firstName: user.user_metadata?.first_name || '',
          lastName: user.user_metadata?.last_name || '',
          institution: user.user_metadata?.institution,
          orcidId: user.user_metadata?.orcid_id,
          researchDomain: user.user_metadata?.research_domain || [],
        }
      }
    } catch (error) {
      console.error('Get current user error:', error)
      return null
    }
  }

  /**
   * Sign out
   */
  async signOut(): Promise<void> {
    const { error } = await this.supabase.auth.signOut()
    if (error) throw error
  }

  /**
   * Check if user is authenticated
   */
  async isAuthenticated(): Promise<boolean> {
    const { data: { session } } = await this.supabase.auth.getSession()
    return !!session
  }
}

export const authService = new AuthService()
