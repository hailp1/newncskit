import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  BeakerIcon,
  DocumentTextIcon,
  BookOpenIcon,
  AcademicCapIcon,
  SparklesIcon,
  ChartBarIcon,
  UsersIcon,
  ClockIcon,
  ShieldCheckIcon,
  CloudIcon,
} from '@heroicons/react/24/outline'

const features = [
  {
    name: 'Project Management',
    description: 'Comprehensive project tracking through all research phases',
    icon: BeakerIcon,
    details: [
      'Track projects from planning to publication',
      'Milestone and deadline management',
      'Team collaboration tools',
      'Progress visualization',
    ],
  },
  {
    name: 'Smart Editor',
    description: 'AI-powered writing assistant for academic papers',
    icon: DocumentTextIcon,
    details: [
      'Real-time grammar and style checking',
      'Academic formatting assistance',
      'AI-powered content suggestions',
      'Citation management integration',
    ],
  },
  {
    name: 'Reference Manager',
    description: 'Advanced reference organization and management',
    icon: BookOpenIcon,
    details: [
      'Import from multiple sources',
      'Advanced search and filtering',
      'Automatic metadata extraction',
      'Multiple citation formats',
    ],
  },
  {
    name: 'Topic Suggestions',
    description: 'AI-generated research topic recommendations',
    icon: AcademicCapIcon,
    details: [
      'Trend analysis and gap identification',
      'Personalized recommendations',
      'Literature review assistance',
      'Novelty scoring',
    ],
  },
  {
    name: 'Journal Matcher',
    description: 'Find the perfect journals for your research',
    icon: SparklesIcon,
    details: [
      'Content-based journal matching',
      'Impact factor and acceptance rates',
      'Submission guidelines',
      'Q1/Q2 journal focus',
    ],
  },
  {
    name: 'Analytics Dashboard',
    description: 'Comprehensive research productivity insights',
    icon: ChartBarIcon,
    details: [
      'Productivity metrics tracking',
      'Collaboration analytics',
      'Publication success rates',
      'Time management insights',
    ],
  },
]

const additionalFeatures = [
  {
    name: 'Real-time Collaboration',
    description: 'Work together with your research team seamlessly',
    icon: UsersIcon,
  },
  {
    name: 'Deadline Management',
    description: 'Never miss important submission deadlines',
    icon: ClockIcon,
  },
  {
    name: 'Data Security',
    description: 'Enterprise-grade security for your research data',
    icon: ShieldCheckIcon,
  },
  {
    name: 'Cloud Sync',
    description: 'Access your work from anywhere, anytime',
    icon: CloudIcon,
  },
]

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-white">
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
              <Button asChild>
                <Link href="/dashboard">Try Demo</Link>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="py-24 bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Powerful Features for
            <span className="text-blue-600"> Research Excellence</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Discover how NCSKIT's comprehensive suite of AI-powered tools can transform 
            your research workflow and accelerate your path to publication.
          </p>
        </div>
      </div>

      {/* Main Features */}
      <div className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Core Features
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Everything you need to manage your research projects from start to finish
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {features.map((feature, index) => (
              <Card key={feature.name} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center mb-4">
                    <feature.icon className="h-8 w-8 text-blue-600 mr-3" />
                    <CardTitle className="text-xl">{feature.name}</CardTitle>
                  </div>
                  <p className="text-gray-600">{feature.description}</p>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {feature.details.map((detail, idx) => (
                      <li key={idx} className="flex items-center text-sm text-gray-700">
                        <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mr-3"></div>
                        {detail}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Additional Features */}
      <div className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Additional Capabilities
            </h2>
            <p className="text-lg text-gray-600">
              More features to enhance your research experience
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {additionalFeatures.map((feature) => (
              <Card key={feature.name} className="text-center hover:shadow-lg transition-shadow">
                <CardContent className="pt-8">
                  <feature.icon className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">{feature.name}</h3>
                  <p className="text-gray-600 text-sm">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-24 bg-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-6">
            Ready to Experience These Features?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Try NCSKIT today and see how our powerful features can accelerate your research journey.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" variant="secondary">
              <Link href="/dashboard">
                Try Demo Now
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="text-white border-white hover:bg-white hover:text-blue-600">
              <Link href="/contact">
                Contact Sales
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}