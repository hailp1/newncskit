'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuthStore } from '@/store/auth'

export default function DemoRegisterPage() {
  const { register, isLoading, error } = useAuthStore()
  const [formData, setFormData] = useState({
    firstName: 'Test',
    lastName: 'User',
    email: 'testuser@example.com',
    password: 'testpassword123',
    institution: 'Test University',
    researchDomain: ['Computer Science'],
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await register(formData)
      alert('Registration successful!')
    } catch (err) {
      console.error('Registration failed:', err)
    }
  }

  const handleQuickRegister = async (userType: 'researcher' | 'student' | 'professor') => {
    const userData = {
      researcher: {
        firstName: 'New',
        lastName: 'Researcher',
        email: 'newresearcher@ncskit.com',
        password: 'researcher123',
        institution: 'NCSKIT University',
        researchDomain: ['Computer Science', 'AI'],
      },
      student: {
        firstName: 'New',
        lastName: 'Student',
        email: 'newstudent@ncskit.com',
        password: 'student123',
        institution: 'State University',
        researchDomain: ['Biology'],
      },
      professor: {
        firstName: 'New',
        lastName: 'Professor',
        email: 'newprofessor@ncskit.com',
        password: 'professor123',
        institution: 'Tech Institute',
        researchDomain: ['Data Science'],
      },
    }

    try {
      await register(userData[userType])
      alert(`${userType} registration successful!`)
    } catch (err) {
      console.error('Registration failed:', err)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">🧪 Demo Registration Test</h1>
        
        <div className="space-y-6">
          {/* Quick Registration Buttons */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Demo Registration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button 
                  onClick={() => handleQuickRegister('researcher')}
                  disabled={isLoading}
                  className="w-full"
                >
                  Register as Researcher
                </Button>
                <Button 
                  onClick={() => handleQuickRegister('student')}
                  disabled={isLoading}
                  variant="outline"
                  className="w-full"
                >
                  Register as Student
                </Button>
                <Button 
                  onClick={() => handleQuickRegister('professor')}
                  disabled={isLoading}
                  variant="outline"
                  className="w-full"
                >
                  Register as Professor
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Custom Registration Form */}
          <Card>
            <CardHeader>
              <CardTitle>Custom Registration</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    placeholder="First Name"
                    value={formData.firstName}
                    onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                  />
                  <Input
                    placeholder="Last Name"
                    value={formData.lastName}
                    onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                  />
                </div>
                
                <Input
                  type="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
                
                <Input
                  type="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                />
                
                <Input
                  placeholder="Institution"
                  value={formData.institution}
                  onChange={(e) => setFormData({...formData, institution: e.target.value})}
                />
                
                <Button type="submit" disabled={isLoading} className="w-full">
                  {isLoading ? 'Registering...' : 'Register'}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Error Display */}
          {error && (
            <Card className="border-red-200 bg-red-50">
              <CardContent className="pt-6">
                <p className="text-red-600">❌ Error: {error}</p>
              </CardContent>
            </Card>
          )}

          {/* Status Info */}
          <Card>
            <CardHeader>
              <CardTitle>Registration Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <p>🔗 <strong>Supabase URL:</strong> https://ujcsqwegzchvsxigydcl.supabase.co</p>
                <p>🔧 <strong>Django Backend:</strong> http://127.0.0.1:8000</p>
                <p>📊 <strong>Strategy:</strong> Try Supabase Auth first, fallback to Django</p>
                <p>💾 <strong>Database:</strong> Supabase PostgreSQL with sample data</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}