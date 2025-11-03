'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/auth'

export default function AuthCallbackPage() {
  const router = useRouter()
  const { setUser } = useAuthStore()

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { data, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Auth callback error:', error)
          router.push('/login?error=auth_failed')
          return
        }

        if (data.session?.user) {
          // Check if user profile exists
          const { data: profileData, error: profileError } = await supabase
            .from('users')
            .select('*')
            .eq('id', data.session.user.id)
            .single()

          if (profileError && profileError.code === 'PGRST116') {
            // User profile doesn't exist, create it
            const userMetadata = data.session.user.user_metadata
            
            const { data: newProfile, error: createError } = await supabase
              .from('users')
              .insert({
                id: data.session.user.id,
                email: data.session.user.email!,
                first_name: userMetadata.first_name || userMetadata.given_name || 'User',
                last_name: userMetadata.last_name || userMetadata.family_name || '',
                avatar_url: userMetadata.avatar_url || userMetadata.picture,
                subscription_type: 'free',
                research_domains: [],
              })
              .select()
              .single()

            if (createError) {
              console.error('Create profile error:', createError)
              router.push('/login?error=profile_creation_failed')
              return
            }

            // Redirect to complete profile
            router.push('/complete-profile')
            return
          }

          // Profile exists, redirect to dashboard
          router.push('/dashboard')
        } else {
          router.push('/login?error=no_session')
        }
      } catch (error) {
        console.error('Auth callback error:', error)
        router.push('/login?error=callback_failed')
      }
    }

    handleAuthCallback()
  }, [router, setUser])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Completing Sign In</h2>
        <p className="text-gray-600">Please wait while we set up your account...</p>
      </div>
    </div>
  )
}