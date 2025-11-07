import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  AcademicCapIcon,
  LightBulbIcon,
  UsersIcon,
  GlobeAltIcon,
} from '@heroicons/react/24/outline'
import { GraduationCap } from 'lucide-react'

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
    <div className="bg-white">

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

      {/* Team Section */}
      <div className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Team</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Meet the researchers and developers behind NCSKIT
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-5xl mx-auto">
            {/* Lead Developer & Research Scientist */}
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="pt-8">
                <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <GraduationCap className="h-12 w-12 text-blue-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Lê Phúc Hải</h3>
                <p className="text-blue-600 font-semibold mb-2">Lead Developer & Research Scientist</p>
                <p className="text-gray-500 text-sm mb-4">PhD Candidate in Business Management</p>
                
                <div className="text-left mb-6">
                  <h4 className="font-semibold text-gray-900 mb-3">Key Responsibilities:</h4>
                  <ul className="text-gray-600 text-sm space-y-2">
                    <li>• System architecture and programming development</li>
                    <li>• Statistical analysis methodology implementation</li>
                    <li>• Research methodology design and validation</li>
                    <li>• AI-powered analytics engine development</li>
                    <li>• Scientific accuracy and quality assurance</li>
                  </ul>
                </div>

                <div className="text-left mb-6">
                  <h4 className="font-semibold text-gray-900 mb-3">Expertise:</h4>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">Statistical Analysis</span>
                    <span className="px-3 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">SEM & Factor Analysis</span>
                    <span className="px-3 py-1 bg-green-100 text-green-800 text-xs rounded-full">Research Methods</span>
                    <span className="px-3 py-1 bg-orange-100 text-orange-800 text-xs rounded-full">Full-Stack Development</span>
                  </div>
                </div>

                <div className="flex justify-center space-x-2">
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">PhD Candidate</span>
                  <span className="px-3 py-1 bg-indigo-100 text-indigo-800 text-sm rounded-full">Business Management</span>
                </div>
              </CardContent>
            </Card>

            {/* Research Assistant & Data Specialist */}
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="pt-8">
                <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <UsersIcon className="h-12 w-12 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Tín Nguyễn</h3>
                <p className="text-green-600 font-semibold mb-2">Research Assistant & Data Specialist</p>
                <p className="text-gray-500 text-sm mb-4">Master of Tourism Management</p>
                
                <div className="text-left mb-6">
                  <h4 className="font-semibold text-gray-900 mb-3">Key Responsibilities:</h4>
                  <ul className="text-gray-600 text-sm space-y-2">
                    <li>• Research literature collection and curation</li>
                    <li>• Data entry and database management</li>
                    <li>• Content quality control and validation</li>
                    <li>• Research documentation and archiving</li>
                    <li>• User support and data assistance</li>
                  </ul>
                </div>

                <div className="text-left mb-6">
                  <h4 className="font-semibold text-gray-900 mb-3">Expertise:</h4>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1 bg-green-100 text-green-800 text-xs rounded-full">Data Management</span>
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">Literature Review</span>
                    <span className="px-3 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">Content Curation</span>
                    <span className="px-3 py-1 bg-orange-100 text-orange-800 text-xs rounded-full">Quality Assurance</span>
                  </div>
                </div>

                <div className="flex justify-center space-x-2">
                  <span className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">Master's Degree</span>
                  <span className="px-3 py-1 bg-teal-100 text-teal-800 text-sm rounded-full">Tourism Management</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Team Collaboration */}
          <div className="mt-16 max-w-4xl mx-auto">
            <Card className="bg-gradient-to-r from-blue-50 to-green-50 border-0">
              <CardContent className="pt-8">
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Our Collaborative Approach</h3>
                  <p className="text-gray-600 mb-6 max-w-3xl mx-auto">
                    NCSKIT is built on the synergy between technical expertise and research experience. 
                    Our team combines deep statistical knowledge with practical software development skills, 
                    ensuring that every feature is both scientifically sound and user-friendly.
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <AcademicCapIcon className="h-8 w-8 text-blue-600" />
                      </div>
                      <h4 className="font-semibold text-gray-900 mb-2">Research Excellence</h4>
                      <p className="text-sm text-gray-600">
                        Grounded in academic rigor and statistical best practices
                      </p>
                    </div>
                    
                    <div className="text-center">
                      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <LightBulbIcon className="h-8 w-8 text-green-600" />
                      </div>
                      <h4 className="font-semibold text-gray-900 mb-2">Technical Innovation</h4>
                      <p className="text-sm text-gray-600">
                        Cutting-edge technology meets practical research needs
                      </p>
                    </div>
                    
                    <div className="text-center">
                      <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <UsersIcon className="h-8 w-8 text-purple-600" />
                      </div>
                      <h4 className="font-semibold text-gray-900 mb-2">User-Centric Design</h4>
                      <p className="text-sm text-gray-600">
                        Built by researchers, for researchers worldwide
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
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
                NCSKIT was born from the collaboration between Lê Phúc Hải, a PhD candidate in Business Management 
                with deep expertise in statistical analysis and research methodology, and Tín Nguyễn, a Master's 
                graduate in Tourism Management specializing in data management and research documentation. 
                Together, they experienced firsthand the challenges of modern academic research and publication.
              </p>
              
              <p className="text-lg leading-relaxed mb-6">
                After years of struggling with fragmented tools, inefficient workflows, and the overwhelming 
                complexity of statistical analysis software, they decided to build the comprehensive solution 
                they wished they had. Combining Hải's technical programming skills and statistical expertise 
                with Tín's meticulous approach to data curation and research support, they created NCSKIT.
              </p>
              
              <p className="text-lg leading-relaxed mb-6">
                Our journey began in 2023 when we started developing AI-powered tools to assist with literature 
                review, statistical analysis, and research methodology. As we shared our early prototypes with 
                the research community, we discovered that the need for comprehensive, user-friendly research 
                management tools was universal across disciplines and countries.
              </p>
              
              <p className="text-lg leading-relaxed mb-6">
                Today, NCSKIT serves researchers across multiple countries, helping them conduct rigorous 
                statistical analysis and publish high-quality research more efficiently than ever before. 
                Our platform continues to evolve based on the needs of our growing research community, 
                with new features and analytical capabilities added regularly.
              </p>
              
              <p className="text-lg leading-relaxed">
                We're just getting started. Our vision is to become the indispensable platform that every 
                researcher relies on to conduct sophisticated statistical analysis, manage their research 
                workflow, and make meaningful contributions to their fields. By combining academic rigor 
                with technological innovation, we're democratizing access to advanced research tools worldwide.
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