'use client'

import { useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useAuthStore } from '@/store/auth'
import { Loader2 } from 'lucide-react'
import { AuthLayout } from '@/components/auth/auth-layout'
import { AuthForm } from '@/components/auth/auth-form'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { isAuthenticated } = useAuthStore()

  const redirectTo = searchParams.get('redirect') || '/dashboard'

  useEffect(() => {
    if (isAuthenticated) {
      router.push(redirectTo)
    }
  }, [isAuthenticated, router, redirectTo])

  const handleSuccess = () => {
    router.push(redirectTo)
  }

  return (
    <AuthLayout mode="login">
      <AuthForm
        mode="login"
        onSuccess={handleSuccess}
      />
      
      {/* Forgot Password Link */}
      <div className="mt-4 text-center text-sm">
        <Link 
          href="/auth/forgot-password" 
          className="font-medium text-blue-600 hover:text-blue-500 inline-flex items-center justify-center min-h-[44px] px-2"
        >
          Quên mật khẩu?
        </Link>
      </div>
    </AuthLayout>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}
