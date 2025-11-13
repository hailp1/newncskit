/**
 * Profile Service
 * NOTE: This service is deprecated - using NextAuth + Prisma
 * Keeping stubs to prevent build errors
 */

export interface UserProfile {
  id: string
  email: string
  full_name?: string
  avatar_url?: string
  [key: string]: any
}

export class ProfileService {
  async getProfile(userId?: string): Promise<UserProfile | null> {
    throw new Error('Use NextAuth session for profile data')
  }

  async updateProfile(userId: string, data: Partial<UserProfile>): Promise<void> {
    throw new Error('Use API routes for profile updates')
  }

  async uploadAvatar(userId: string, file: File): Promise<string> {
    throw new Error('Use API routes for avatar upload')
  }

  async deleteAvatar(userId: string): Promise<void> {
    throw new Error('Use API routes for avatar deletion')
  }

  async changePassword(userId: string, oldPassword: string, newPassword: string): Promise<void> {
    throw new Error('Use API routes for password change')
  }
}

export const profileService = new ProfileService()
