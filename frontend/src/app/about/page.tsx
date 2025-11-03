import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  AcademicCapIcon,
  LightBulbIcon,
  UsersIcon,
  GlobeAltIcon,
} from '@heroicons/react/24/outline'

const values = [
  {
    name: 'Innovation',
    description: 'Pushing the boundaries of research technology with AI-powered solutions',
    icon: LightBulbIcon,
  },
  {
    name: 'Excellence',
    description: 'Committed to delivering the highest quality tools for academic success',
    icon: AcademicCapIcon,
  },
  {
    name: 'Collaboration',
    description: 'Fostering global research collaboration and knowledge sharing',
    icon: UsersIcon,
  },
  {
    name: 'Accessibility',
    description: 'Making advanced research tools accessible to researchers worldwide',
    icon: GlobeAltIcon,
  },
]

const stats = [
  { label: 'Active Researchers', value: '10,000+' },
  { label: 'Papers Published', value: '50,000+' },
  { label: 'Countries Served', value: '120+' },
  { label: 'Success Rate', value: '95%' },
]

export default function AboutPage() {
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
              <Link href="/features" className="text-gray-600 hover:text-gray-900">
                Features
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              About <span className="text-blue-600">NCSKIT</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              We're on a mission to revolutionize academic research by providing 
              AI-powered tools that streamline the entire publication process.
            </p>
          </div>
        </div>
      </div>

      {/* Mission Section */}
      <div className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Mission</h2>
              <p className="text-lg text-gray-600 mb-6">
                NCSKIT was born from the recognition that academic research publication 
                is often fragmented, stressful, and inefficient. Researchers spend 
                countless hours on administrative tasks instead of focusing on what 
                they do best - conducting groundbreaking research.
              </p>
              <p className="text-lg text-gray-600 mb-6">
                Our platform addresses this challenge by providing a unified, 
                AI-powered solution that guides researchers through every phase 
                of the publication process, from initial planning to final submission.
              </p>
              <p className="text-lg text-gray-600">
                We believe that by removing barriers and streamlining workflows, 
                we can help researchers focus on making discoveries that change the world.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-6">
              {stats.map((stat) => (
                <Card key={stat.label}>
                  <CardContent className="pt-6 text-center">
                    <div className="text-3xl font-bold text-blue-600 mb-2">
                      {stat.value}
                    </div>
                    <div className="text-gray-600">{stat.label}</div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Values Section */}
      <div className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Values</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              The principles that guide everything we do at NCSKIT
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value) => (
              <Card key={value.name} className="text-center hover:shadow-lg transition-shadow">
                <CardContent className="pt-8">
                  <value.icon className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-3">{value.name}</h3>
                  <p className="text-gray-600">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Story Section */}
      <div className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Our Story</h2>
            
            <div className="prose prose-lg mx-auto text-gray-600">
              <p className="text-lg leading-relaxed mb-6">
                NCSKIT was founded by a team of researchers, technologists, and academics 
                who experienced firsthand the challenges of modern research publication. 
                After years of struggling with fragmented tools, inefficient workflows, 
                and the overwhelming complexity of the academic publishing landscape, 
                we decided to build the solution we wished we had.
              </p>
              
              <p className="text-lg leading-relaxed mb-6">
                Our journey began in 2023 when we started developing AI-powered tools 
                to assist with literature review and topic identification. As we shared 
                our early prototypes with the research community, we discovered that 
                the need for comprehensive research management tools was universal.
              </p>
              
              <p className="text-lg leading-relaxed mb-6">
                Today, NCSKIT serves thousands of researchers across 120+ countries, 
                helping them publish high-quality research more efficiently than ever before. 
                Our platform has facilitated the publication of over 50,000 papers and 
                continues to evolve based on the needs of our global research community.
              </p>
              
              <p className="text-lg leading-relaxed">
                We're just getting started. Our vision is to become the indispensable 
                platform that every researcher relies on to advance human knowledge 
                and make meaningful contributions to their fields.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-24 bg-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-6">
            Join Our Research Community
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Be part of the research revolution. Start using NCSKIT today and 
            experience the future of academic research management.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" variant="secondary">
              <Link href="/dashboard">
                Try NCSKIT Free
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="text-white border-white hover:bg-white hover:text-blue-600">
              <Link href="/contact">
                Contact Us
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}