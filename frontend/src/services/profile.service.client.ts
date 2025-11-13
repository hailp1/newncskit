/**
 * Profile Service (Client)
 * Uses API routes to fetch and update profile data
 */

export interface UserProfile {
  id: string
  email: string
  full_name?: string
  avatar_url?: string
  institution?: string
  orcid_id?: string
  research_domains?: string[]
  role?: string
  subscription_type?: string
  status?: string
  created_at?: string
  updated_at?: string
  last_login_at?: string | null
  [key: string]: any
}

export class ProfileServiceClient {
  async getProfile(): Promise<UserProfile | null> {
    try {
      const response = await fetch('/api/profile', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        if (response.status === 401) {
          // Not authenticated, return null
          return null
        }
        throw new Error(`Failed to fetch profile: ${response.statusText}`)
      }

      const profile = await response.json()
      return profile
    } catch (error) {
      console.error('Error fetching profile:', error)
      throw error
    }
  }

  async updateProfile(data: Partial<UserProfile>): Promise<void> {
    try {
      const response = await fetch('/api/profile', {
        method: 'PATCH',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update profile')
      }
    } catch (error) {
      console.error('Error updating profile:', error)
      throw error
    }
  }

  async uploadAvatar(file: File): Promise<string> {
    try {
      const formData = new FormData()
      formData.append('avatar', file)

      const response = await fetch('/api/profile/avatar', {
        method: 'POST',
        credentials: 'include',
        body: formData,
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to upload avatar')
      }

      const result = await response.json()
      return result.avatar_url
    } catch (error) {
      console.error('Error uploading avatar:', error)
      throw error
    }
  }
}

export const profileServiceClient = new ProfileServiceClient()
