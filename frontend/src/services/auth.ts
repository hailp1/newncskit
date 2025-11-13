/**
 * Auth Service
 * NOTE: This service is deprecated - using NextAuth instead
 * Keeping stubs to prevent build errors during migration
 */

export class AuthService {
  async signIn(email: string, password: string): Promise<any> {
    throw new Error('Use NextAuth for authentication')
  }

  async signUp(email: string, password: string, userData: any): Promise<any> {
    throw new Error('Use NextAuth for authentication')
  }

  async signOut(): Promise<void> {
    throw new Error('Use NextAuth for authentication')
  }

  async resetPassword(email: string): Promise<void> {
    throw new Error('Use NextAuth for authentication')
  }

  async updatePassword(newPassword: string): Promise<void> {
    throw new Error('Use NextAuth for authentication')
  }

  async getCurrentUser(): Promise<any> {
    throw new Error('Use NextAuth for authentication')
  }

  async updateProfile(data: any): Promise<void> {
    throw new Error('Use NextAuth for authentication')
  }
}

export const authService = new AuthService()
