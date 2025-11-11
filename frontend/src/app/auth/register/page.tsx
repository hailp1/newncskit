'use client'

import { useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useAuthStore } from '@/store/auth'
import { Loader2 } from 'lucide-react'
import { AuthLayout } from '@/components/auth/auth-layout'
import { AuthForm } from '@/components/auth/auth-form'

function RegisterForm() {
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
    <AuthLayout mode="register">
      <AuthForm
        mode="register"
        onSuccess={handleSuccess}
        redirectTo={redirectTo}
      />
      
      {/* Terms and Privacy Link */}
      <p className="mt-4 text-center text-xs sm:text-xs text-gray-600 leading-relaxed">
        Bằng cách đăng ký, bạn đồng ý với{' '}
        <Link 
          href="/terms" 
          className="text-blue-600 hover:text-blue-500 inline-flex items-center min-h-[44px] px-1"
        >
          Điều khoản dịch vụ
        </Link>{' '}
        và{' '}
        <Link 
          href="/privacy" 
          className="text-blue-600 hover:text-blue-500 inline-flex items-center min-h-[44px] px-1"
        >
          Chính sách bảo mật
        </Link>
      </p>
    </AuthLayout>
  )
}

export default function RegisterPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    }>
      <RegisterForm />
    </Suspense>
  )
}
