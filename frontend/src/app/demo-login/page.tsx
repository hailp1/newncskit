'use client'

import { useState } from 'react'
import { useAuthStore } from '@/store/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MainLayout } from '@/components/layout/main-layout'

export default function DemoLoginPage() {
  const [email, setEmail] = useState('demo@ncskit.org')
  const [password, setPassword] = useState('demo123')
  const { login, isLoading, error, user, isAuthenticated } = useAuthStore()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await login({ email, password })
    } catch (error) {
      console.error('Login failed:', error)
    }
  }

  const handleDemoLogin = () => {
    setEmail('demo@ncskit.org')
    setPassword('demo123')
  }

  const handleAdminLogin = () => {
    setEmail('admin@ncskit.org')
    setPassword('admin123')
  }

  if (isAuthenticated && user) {
    return (
      <MainLayout>
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-center text-green-600">✅ Đăng nhập thành công!</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <p><strong>Tên:</strong> {user.full_name}</p>
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>Role:</strong> {user.role}</p>
              </div>
              <div className="flex gap-2">
                <Button 
                  onClick={() => window.location.href = '/dashboard'}
                  className="flex-1"
                >
                  Vào Dashboard
                </Button>
                <Button 
                  onClick={() => window.location.href = '/blog'}
                  variant="outline"
                  className="flex-1"
                >
                  Xem Blog
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">NCSKIT Login</CardTitle>
            <p className="text-center text-sm text-gray-600">
              Access your research management platform
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter email"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Password</label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  required
                />
              </div>

              {error && (
                <div className="text-red-600 text-sm bg-red-50 p-2 rounded">
                  {error}
                </div>
              )}

              <Button 
                type="submit" 
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
              </Button>
            </form>

            <div className="mt-6 pt-4 border-t">
              <p className="text-sm text-gray-600 mb-3">Demo Accounts:</p>
              
              <div className="space-y-2">
                <Button 
                  onClick={handleAdminLogin}
                  variant="default"
                  className="w-full bg-red-600 hover:bg-red-700"
                >
                  🔑 Admin Account (Full Access)
                </Button>
                
                <Button 
                  onClick={handleDemoLogin}
                  variant="outline"
                  className="w-full"
                >
                  👤 User Account (Researcher)
                </Button>
              </div>
              
              <div className="mt-3 text-xs text-gray-500 space-y-1">
                <div className="bg-red-50 p-2 rounded">
                  <strong>Admin:</strong> admin@ncskit.org / admin123<br/>
                  <span className="text-red-600">Full system access + management</span>
                </div>
                <div className="bg-blue-50 p-2 rounded">
                  <strong>User:</strong> demo@ncskit.org / demo123<br/>
                  <span className="text-blue-600">Research tools access</span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t">
                <p className="text-xs text-gray-500 text-center">
                  Hoặc nhập bất kỳ email/password nào để tạo user mới
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}