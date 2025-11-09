/**
 * Manual Test Script for ProfileService.getProfile()
 * 
 * This script can be used to manually test the getProfile method
 * Run this in a server context where Supabase auth is available
 */

import { profileService } from '@/services/profile.service'

export async function testGetProfile() {
  console.log('Testing ProfileService.getProfile()...')
  
  try {
    const profile = await profileService.getProfile()
    
    console.log('✅ Profile fetched successfully:')
    console.log('- ID:', profile.id)
    console.log('- Email:', profile.email)
    console.log('- Full Name:', profile.full_name || 'Not specified')
    console.log('- Institution:', profile.institution || 'Not specified')
    console.log('- ORCID ID:', profile.orcid_id || 'Not specified')
    console.log('- Research Domains:', profile.research_domains || 'Not specified')
    console.log('- Role:', profile.role)
    console.log('- Subscription Type:', profile.subscription_type)
    console.log('- Is Active:', profile.is_active)
    console.log('- Status:', profile.status || 'Not specified')
    console.log('- Created At:', profile.created_at)
    console.log('- Updated At:', profile.updated_at)
    console.log('- Last Login At:', profile.last_login_at || 'Not specified')
    
    return { success: true, profile }
  } catch (error) {
    console.error('❌ Error fetching profile:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

// Test error handling
export async function testGetProfileErrorHandling() {
  console.log('Testing ProfileService error handling...')
  
  // This would need to be run in a context without authentication
  // to test the authentication error handling
  console.log('Note: Run this test without authentication to verify error handling')
}
