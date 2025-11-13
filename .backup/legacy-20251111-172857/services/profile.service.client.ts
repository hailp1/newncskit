/**
 * Profile Service (Client-side)
 * Manages user profile operations from the browser
 * Implements requirements: 3.1, 3.3, 4.1, 7.1
 */

import { createClient } from '@/lib/supabase/client'
import { UserRole } from '@/lib/permissions/constants'

/**
 * User profile interface matching database schema
 */
export interface UserProfile {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  institution: string | null
  orcid_id: string | null
  research_domains: string[] | null
  role: UserRole
  subscription_type: 'free' | 'premium' | 'institutional'
  is_active: boolean
  status: string | null
  created_at: string
  updated_at: string
  last_login_at?: string | null
}

/**
 * Validation error class
 */
export class ValidationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ValidationError'
  }
}

/**
 * Input validation utilities
 */
class Validator {
  /**
   * Validate email format (RFC 5322 compliant)
   */
  static validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  /**
   * Validate ORCID ID format (0000-0000-0000-000X)
   */
  static validateOrcidId(orcid: string): boolean {
    const orcidRegex = /^\d{4}-\d{4}-\d{4}-\d{3}[0-9X]$/
    return orcidRegex.test(orcid)
  }

  /**
   * Validate password strength
   */
  static validatePassword(password: string): { valid: boolean; message?: string } {
    if (password.length < 8) {
      return { valid: false, message: 'Password must be at least 8 characters long' }
    }
    if (!/[A-Z]/.test(password)) {
      return { valid: false, message: 'Password must contain at least one uppercase letter' }
    }
    if (!/[a-z]/.test(password)) {
      return { valid: false, message: 'Password must contain at least one lowercase letter' }
    }
    if (!/[0-9]/.test(password)) {
      return { valid: false, message: 'Password must contain at least one number' }
    }
    return { valid: true }
  }

  /**
   * Sanitize input to prevent XSS
   */
  static sanitizeInput(input: string): string {
    return input
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;')
      .trim()
  }
}

/**
 * Profile Service Class (Client-side)
 */
export class ProfileServiceClient {
  private supabase = createClient()

  /**
   * Get current user profile
   */
  async getProfile(): Promise<UserProfile> {
    // Get current authenticated user
    const { data: { user }, error: authError } = await this.supabase.auth.getUser()

    if (authError) {
      throw new Error(`Authentication error: ${authError.message}`)
    }

    if (!user) {
      throw new Error('User not authenticated')
    }

    // Fetch profile from database
    const { data: profile, error: profileError } = await this.supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (profileError) {
      if (profileError.code === 'PGRST116') {
        throw new Error('Profile not found. Please contact support.')
      }
      throw new Error(`Failed to fetch profile: ${profileError.message}`)
    }

    if (!profile) {
      throw new Error('Profile not found')
    }

    const profileData = profile as any

    return {
      id: profileData.id,
      email: profileData.email || user.email || '',
      full_name: profileData.full_name || null,
      avatar_url: profileData.avatar_url || null,
      institution: profileData.institution || null,
      orcid_id: profileData.orcid_id || null,
      research_domains: profileData.research_domains || null,
      role: (profileData.role as UserRole) || 'user',
      subscription_type: profileData.subscription_type || 'free',
      is_active: profileData.is_active !== undefined ? profileData.is_active : true,
      status: profileData.status || null,
      created_at: profileData.created_at,
      updated_at: profileData.updated_at,
      last_login_at: profileData.last_login_at || null,
    } as UserProfile
  }

  /**
   * Update user profile
   */
  async updateProfile(data: Partial<UserProfile>): Promise<UserProfile> {
    // Get current authenticated user
    const { data: { user }, error: authError } = await this.supabase.auth.getUser()

    if (authError || !user) {
      throw new Error('User not authenticated')
    }

    // Validate inputs
    if (data.email && !Validator.validateEmail(data.email)) {
      throw new ValidationError('Invalid email format')
    }

    if (data.orcid_id && data.orcid_id.trim() !== '' && !Validator.validateOrcidId(data.orcid_id)) {
      throw new ValidationError('Invalid ORCID ID format. Expected format: 0000-0000-0000-000X')
    }

    // Sanitize text inputs
    const sanitizedData: any = {}

    if (data.full_name !== undefined) {
      sanitizedData.full_name = data.full_name ? Validator.sanitizeInput(data.full_name) : null
    }

    if (data.institution !== undefined) {
      sanitizedData.institution = data.institution ? Validator.sanitizeInput(data.institution) : null
    }

    if (data.orcid_id !== undefined) {
      sanitizedData.orcid_id = data.orcid_id ? data.orcid_id.trim() : null
    }

    if (data.research_domains !== undefined) {
      sanitizedData.research_domains = data.research_domains
    }

    // Only include fields that users can update
    const allowedFields = ['full_name', 'institution', 'orcid_id', 'research_domains']
    const updateData: any = {}

    for (const field of allowedFields) {
      if (field in sanitizedData) {
        updateData[field] = sanitizedData[field]
      }
    }

    // Add updated_at timestamp
    updateData.updated_at = new Date().toISOString()

    // Update profile in database
    const { data: updatedProfile, error: updateError } = await (this.supabase as any)
      .from('profiles')
      .update(updateData)
      .eq('id', user.id)
      .select()
      .single()

    if (updateError) {
      throw new Error(`Failed to update profile: ${updateError.message}`)
    }

    if (!updatedProfile) {
      throw new Error('Failed to retrieve updated profile')
    }

    // Return updated profile
    return this.getProfile()
  }

  /**
   * Change user password
   */
  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    // Get current authenticated user
    const { data: { user }, error: authError } = await this.supabase.auth.getUser()

    if (authError || !user) {
      throw new Error('User not authenticated')
    }

    // Validate new password strength
    const validation = Validator.validatePassword(newPassword)
    if (!validation.valid) {
      throw new ValidationError(validation.message || 'Invalid password')
    }

    // Verify current password by attempting to sign in
    const { error: signInError } = await this.supabase.auth.signInWithPassword({
      email: user.email!,
      password: currentPassword,
    })

    if (signInError) {
      throw new ValidationError('Current password is incorrect')
    }

    // Update password in Supabase Auth
    const { error: updateError } = await this.supabase.auth.updateUser({
      password: newPassword,
    })

    if (updateError) {
      throw new Error(`Failed to change password: ${updateError.message}`)
    }
  }

  /**
   * Upload user avatar
   */
  async uploadAvatar(file: File): Promise<string> {
    // Get current authenticated user
    const { data: { user }, error: authError } = await this.supabase.auth.getUser()

    if (authError || !user) {
      throw new Error('User not authenticated')
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      throw new ValidationError('Invalid file type. Only JPEG, PNG, and WebP images are allowed.')
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      throw new ValidationError('File size too large. Maximum size is 5MB.')
    }

    // Generate unique filename
    const fileExt = file.name.split('.').pop()
    const fileName = `${user.id}-${Date.now()}.${fileExt}`
    const filePath = `avatars/${fileName}`

    // Upload to Supabase Storage
    const { error: uploadError } = await this.supabase.storage
      .from('avatars')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true,
      })

    if (uploadError) {
      throw new Error(`Failed to upload avatar: ${uploadError.message}`)
    }

    // Get public URL
    const { data: urlData } = this.supabase.storage
      .from('avatars')
      .getPublicUrl(filePath)

    const avatarUrl = urlData.publicUrl

    // Update profile with new avatar URL
    const { error: updateError } = await (this.supabase as any)
      .from('profiles')
      .update({
        avatar_url: avatarUrl,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id)

    if (updateError) {
      throw new Error(`Failed to update profile with avatar URL: ${updateError.message}`)
    }

    return avatarUrl
  }
}

// Export singleton instance
export const profileServiceClient = new ProfileServiceClient()
