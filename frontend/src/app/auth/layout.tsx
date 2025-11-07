/**
 * Auth Layout
 * Layout for authentication pages with header and footer
 */

import { MainLayout } from '@/components/layout/main-layout'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <MainLayout className="bg-gray-50">
      {children}
    </MainLayout>
  )
}
