import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  UserCircleIcon,
  AcademicCapIcon,
  ShieldCheckIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/outline'

const authMethods = [
  {
    name: 'ORCID Login',
    description: 'Sign in with your ORCID researcher ID',
    href: '/login',
    icon: '🎓',
    recommended: true,
    features: ['Academic profile sync', 'Publication tracking', 'Verified identity'],
  },
  {
    name: 'Google OAuth',
    description: 'Quick sign-in with Google account',
    href: '/login',
    icon: '🔍',
    recommended: false,
    features: ['Fast authentication', 'Google Scholar sync', 'Drive integration'],
  },
  {
    name: 'LinkedIn OAuth',
    description: 'Professional network integration',
    href: '/login',
    icon: '💼',
    recommended: false,
    features: ['Professional profile', 'Network connections', 'Career tracking'],
  },
  {
    name: 'Email Registration',
    description: 'Traditional email and password',
    href: '/register',
    icon: '📧',
    recommended: false,
    features: ['Full control', 'Custom profile', 'Manual setup'],
  },
]

export default function DemoAuthPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="text-2xl font-bold text-blue-600">
                NCSKIT
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/" className="text-gray-600 hover:text-gray-900">
                Home
              </Link>
              <Link href="/dashboard" className="text-gray-600 hover:text-gray-900">
                Dashboard
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Authentication Demo
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Experience all authentication methods available in NCSKIT. 
              Choose the method that best fits your research workflow.
            </p>
          </div>

          {/* Authentication Methods Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            {authMethods.map((method) => (
              <Card key={method.name} className={`hover:shadow-lg transition-shadow ${method.recommended ? 'ring-2 ring-blue-500' : ''}`}>
                {method.recommended && (
                  <Badge className="absolute -top-2 left-4 bg-blue-600">
                    Recommended for Researchers
                  </Badge>
                )}
                <CardHeader>
                  <div className="flex items-center mb-4">
                    <div className="text-3xl mr-4">{method.icon}</div>
                    <div>
                      <CardTitle className="text-xl">{method.name}</CardTitle>
                      <p className="text-gray-600 mt-1">{method.description}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-2">
                    {method.features.map((feature, index) => (
                      <li key={index} className="flex items-center text-sm">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button asChild className="w-full">
                    <Link href={method.href}>
                      Try {method.name}
                      <ArrowRightIcon className="w-4 h-4 ml-2" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Features Showcase */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <Card className="text-center">
              <CardContent className="pt-8">
                <UserCircleIcon className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Unified Profile</h3>
                <p className="text-gray-600 text-sm">
                  All authentication methods create a unified researcher profile 
                  with your academic information and preferences.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="pt-8">
                <AcademicCapIcon className="w-12 h-12 text-green-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Academic Integration</h3>
                <p className="text-gray-600 text-sm">
                  Automatically sync publications, citations, and research interests 
                  from your academic accounts.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="pt-8">
                <ShieldCheckIcon className="w-12 h-12 text-purple-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Secure & Private</h3>
                <p className="text-gray-600 text-sm">
                  Industry-standard OAuth 2.0 security with granular privacy controls 
                  for your research data.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Access */}
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Join thousands of researchers who are already using NCSKIT to streamline 
              their research workflow and increase productivity.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg">
                <Link href="/auth-info">
                  Choose Sign-Up Method
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/dashboard">
                  View Demo Dashboard
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}