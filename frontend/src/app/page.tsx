import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MainLayout } from '@/components/layout/main-layout'
import {
  BeakerIcon,
  DocumentTextIcon,
  BookOpenIcon,
  AcademicCapIcon,
  SparklesIcon,
  ChartBarIcon,
  UsersIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline'

const features = [
  {
    name: 'Project Management',
    description: 'Track research projects through all phases from planning to publication',
    icon: BeakerIcon,
    href: '/projects',
  },
  {
    name: 'Smart Editor',
    description: 'AI-powered writing assistant with academic formatting and suggestions',
    icon: DocumentTextIcon,
    href: '/editor',
  },
  {
    name: 'Reference Manager',
    description: 'Organize and manage research references with advanced search capabilities',
    icon: BookOpenIcon,
    href: '/references',
  },
  {
    name: 'Topic Suggestions',
    description: 'AI-generated research topic recommendations based on current trends',
    icon: AcademicCapIcon,
    href: '/topics',
  },
  {
    name: 'Journal Matcher',
    description: 'Find the perfect Q1/Q2 journals for your research papers',
    icon: SparklesIcon,
    href: '/journals',
  },
  {
    name: 'Analytics Dashboard',
    description: 'Track productivity and research progress with detailed insights',
    icon: ChartBarIcon,
    href: '/analytics',
  },
]

const benefits = [
  'Streamline your entire research workflow',
  'AI-powered writing and topic suggestions',
  'Collaborate with team members in real-time',
  'Track progress and meet deadlines',
  'Find the best journals for publication',
  'Manage references and citations efficiently',
]

export default function HomePage() {
  return (
    <MainLayout>
      <div className="bg-gradient-to-br from-blue-50 to-indigo-100">

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Streamline Your
              <span className="text-blue-600"> Research Journey</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              NCSKIT is a unified platform that guides researchers through every phase of the 
              academic publication process - from planning and execution to writing and submission.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="text-lg px-8 py-3">
                <Link href="/demo-login">
                  <SparklesIcon className="w-5 h-5 mr-2" />
                  Try Demo Login
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="text-lg px-8 py-3">
                <Link href="/blog">
                  View Blog
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Everything You Need for Research Success
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              From AI-powered writing assistance to intelligent journal matching, 
              NCSKIT provides all the tools you need to publish high-quality research.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature) => (
              <Card key={feature.name} className="hover:shadow-lg transition-shadow cursor-pointer">
                <Link href={feature.href}>
                  <CardHeader>
                    <feature.icon className="h-8 w-8 text-blue-600 mb-2" />
                    <CardTitle className="text-xl">{feature.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">{feature.description}</p>
                  </CardContent>
                </Link>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Why Choose NCSKIT?
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Join thousands of researchers who have streamlined their publication 
                workflow and increased their research productivity with our AI-powered platform.
              </p>
              <ul className="space-y-4">
                {benefits.map((benefit, index) => (
                  <li key={index} className="flex items-center">
                    <CheckCircleIcon className="h-6 w-6 text-green-500 mr-3 flex-shrink-0" />
                    <span className="text-gray-700">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardContent className="pt-6 text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">10K+</div>
                  <div className="text-gray-600">Active Researchers</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6 text-center">
                  <div className="text-3xl font-bold text-green-600 mb-2">50K+</div>
                  <div className="text-gray-600">Papers Published</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6 text-center">
                  <div className="text-3xl font-bold text-purple-600 mb-2">95%</div>
                  <div className="text-gray-600">Success Rate</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6 text-center">
                  <div className="text-3xl font-bold text-orange-600 mb-2">24/7</div>
                  <div className="text-gray-600">AI Support</div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-24 bg-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Transform Your Research?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join the research revolution and start publishing high-quality papers 
            with the power of AI-assisted research management.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" variant="secondary" className="text-lg px-8 py-3">
              <Link href="/dashboard">
                <UsersIcon className="w-5 h-5 mr-2" />
                Start Free Trial
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="text-lg px-8 py-3 text-white border-white hover:bg-white hover:text-blue-600">
              <Link href="/contact">
                Contact Sales
              </Link>
            </Button>
          </div>
        </div>
      </div>
      </div>
    </MainLayout>
  )
}