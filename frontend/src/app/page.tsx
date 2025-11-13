import { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MainLayout } from '@/components/layout/main-layout'
import {
  BeakerIcon,
  ChartBarIcon,
  CheckCircleIcon,
  SparklesIcon,
  ShieldCheckIcon,
  ClockIcon,
  LightBulbIcon,
  MagnifyingGlassIcon,
  DocumentTextIcon,
  PresentationChartLineIcon,
  AcademicCapIcon,
  ArrowRightIcon,
  PlayCircleIcon,
  CurrencyDollarIcon,
  HeartIcon,
} from '@heroicons/react/24/outline'

// SEO Metadata
export const metadata: Metadata = {
  title: 'Complete Research Platform | From Idea to Publication | NCSKIT',
  description: 'End-to-end research platform for academic publishing. Find research gaps, build theoretical models, create surveys, analyze data, and prepare manuscripts for ISI, Scopus, ABDC journals. Token-based, non-profit.',
  keywords: 'research platform, academic publishing, ISI journals, Scopus, ABDC, research gap analysis, theoretical framework, survey creation, statistical analysis, manuscript preparation, non-profit research tool',
  authors: [{ name: 'NCSKIT Team' }],
  openGraph: {
    title: 'NCSKIT - Complete Research Platform for Academic Publishing',
    description: 'From research idea to international publication. AI-powered platform supporting every stage of academic research. Token-based, non-profit.',
    type: 'website',
    locale: 'en_US',
    siteName: 'NCSKIT',
    images: [
      {
        url: '/Logo_ngangback.png',
        width: 1200,
        height: 630,
        alt: 'NCSKIT Complete Research Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'NCSKIT - Complete Research Platform',
    description: 'From idea to publication. AI-powered research support for ISI, Scopus, ABDC journals.',
    images: ['/Logo_ngangback.png'],
  },
  alternates: {
    canonical: 'https://ncskit.org',
  },
}

const researchStages = [
  {
    name: 'Ideation & Gap Analysis',
    description: 'AI-powered research gap identification, literature review assistance, and topic validation.',
    icon: LightBulbIcon,
    href: '/research/ideation',
  },
  {
    name: 'Theoretical Framework',
    description: 'Build robust theoretical models with our library of validated frameworks and constructs.',
    icon: AcademicCapIcon,
    href: '/research/framework',
  },
  {
    name: 'Survey Design',
    description: 'Create professional surveys with validated scales, question banks, and expert templates.',
    icon: DocumentTextIcon,
    href: '/survey/create',
  },
  {
    name: 'Data Collection',
    description: 'Distribute surveys, track responses, and manage participant recruitment efficiently.',
    icon: MagnifyingGlassIcon,
    href: '/survey/distribute',
  },
  {
    name: 'Statistical Analysis',
    description: 'Advanced analysis: Cronbach\'s Alpha, EFA, CFA, SEM, regression, and more.',
    icon: ChartBarIcon,
    href: '/analysis/new',
  },
  {
    name: 'Manuscript Preparation',
    description: 'AI-assisted writing, formatting for target journals (ISI, Scopus, ABDC), and submission support.',
    icon: PresentationChartLineIcon,
    href: '/manuscript/prepare',
  },
]

const stats = [
  { label: 'Research Projects', value: '500+', icon: BeakerIcon, description: 'Active projects' },
  { label: 'Community Members', value: '2,000+', icon: AcademicCapIcon, description: 'Growing daily' },
  { label: 'Success Rate', value: '85%', icon: CheckCircleIcon, description: 'Publication rate' },
  { label: 'Token Model', value: 'Fair', icon: CurrencyDollarIcon, description: 'Pay as you use' },
]

const faqs = [
  {
    question: 'What makes NCSKIT different from other research tools?',
    answer: 'NCSKIT is the only platform that supports your entire research journey - from finding research gaps to preparing manuscripts for international journals. We\'re non-profit and token-based, making advanced research tools accessible to all.',
  },
  {
    question: 'How does the token system work?',
    answer: 'Similar to AI IDEs, you purchase tokens and use them for AI-powered features like gap analysis, literature review, statistical analysis, and manuscript preparation. No subscriptions, only pay for what you use.',
  },
  {
    question: 'Which journals do you support?',
    answer: 'We support formatting and submission guidelines for ISI (Web of Science), Scopus, ABDC, and other major journal databases. Our AI helps match your research to the most suitable journals.',
  },
  {
    question: 'Is my research data secure?',
    answer: 'Absolutely. Your data is encrypted, never shared, and you maintain full ownership. As a non-profit, we have no incentive to monetize your data.',
  },
  {
    question: 'Do I need statistical knowledge?',
    answer: 'While basic knowledge helps, our platform provides guided workflows, automatic interpretations, and AI explanations to support researchers at all levels.',
  },
]

export default function HomeNewPage() {
  return (
    <MainLayout>
      {/* Schema.org JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'SoftwareApplication',
            name: 'NCSKIT',
            applicationCategory: 'EducationalApplication',
            description: 'Complete research platform for academic publishing',
            offers: {
              '@type': 'Offer',
              priceSpecification: {
                '@type': 'UnitPriceSpecification',
                priceCurrency: 'USD',
                referenceQuantity: {
                  '@type': 'QuantityValue',
                  value: '1',
                  unitText: 'TOKEN',
                },
              },
            },
            aggregateRating: {
              '@type': 'AggregateRating',
              ratingValue: '4.8',
              ratingCount: '500',
            },
          }),
        }}
      />

      <div className="bg-white">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-indigo-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
            <div className="max-w-4xl mx-auto text-center">
              <div className="inline-flex items-center px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-medium mb-6">
                <HeartIcon className="w-4 h-4 mr-2" />
                Non-Profit • Token-Based • Community-Driven
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                Complete Research Platform
                <span className="text-blue-600"> From Idea to Publication</span>
              </h1>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                End-to-end support for academic research. Find gaps, build frameworks, create surveys, 
                analyze data, and prepare manuscripts for ISI, Scopus, and ABDC journals.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild size="lg" className="text-lg px-8 py-6 shadow-lg hover:shadow-xl transition-shadow">
                  <Link href="/auth/login" className="flex items-center">
                    Start Your Research Journey
                    <ArrowRightIcon className="w-5 h-5 ml-2" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="text-lg px-8 py-6">
                  <Link href="#video-demo" className="flex items-center">
                    <PlayCircleIcon className="w-5 h-5 mr-2" />
                    Watch Demo
                  </Link>
                </Button>
              </div>
              <p className="text-sm text-gray-500 mt-6">
                ✓ Free starter tokens  ✓ No credit card required  ✓ Cancel anytime
              </p>
            </div>
          </div>
        </section>

        {/* Video Demo Section */}
        <section id="video-demo" className="py-16 md:py-20 lg:py-28 bg-gradient-to-br from-gray-50 to-blue-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12 md:mb-16">
              <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mb-4">
                <PlayCircleIcon className="w-4 h-4 mr-2" />
                Platform Demo
              </div>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
                See NCSKIT in Action
              </h2>
              <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
                Watch how researchers use NCSKIT to streamline their entire research workflow
              </p>
            </div>

            <div className="max-w-5xl mx-auto">
              {/* Video Container */}
              <div className="relative aspect-video bg-white rounded-xl md:rounded-2xl overflow-hidden shadow-2xl border border-gray-200 mb-8 md:mb-12">
                {/* Video placeholder - replace with actual video */}
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-blue-600 to-indigo-700">
                  <div className="text-center px-4">
                    <div className="w-16 h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4 hover:bg-white/30 transition-all cursor-pointer group">
                      <PlayCircleIcon className="w-10 h-10 md:w-12 md:h-12 lg:w-14 lg:h-14 text-white group-hover:scale-110 transition-transform" />
                    </div>
                    <p className="text-lg md:text-xl font-semibold text-white mb-2">Watch Platform Demo</p>
                    <p className="text-sm md:text-base text-blue-100">3 minutes overview • Full HD</p>
                  </div>
                </div>
                {/* Uncomment when you have video URL */}
                {/* <iframe
                  className="absolute inset-0 w-full h-full"
                  src="https://www.youtube.com/embed/YOUR_VIDEO_ID"
                  title="NCSKIT Demo"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                /> */}
              </div>
              
              {/* Feature Highlights */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
                <div className="bg-white rounded-lg md:rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                    <LightBulbIcon className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2 text-base md:text-lg">Research Planning</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">Find gaps and build frameworks with AI assistance</p>
                </div>
                <div className="bg-white rounded-lg md:rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                    <ChartBarIcon className="w-6 h-6 text-green-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2 text-base md:text-lg">Data Analysis</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">Advanced statistical methods made simple</p>
                </div>
                <div className="bg-white rounded-lg md:rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                    <DocumentTextIcon className="w-6 h-6 text-purple-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2 text-base md:text-lg">Publication Ready</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">Format for ISI, Scopus, ABDC journals</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Research Stages */}
        <section id="features" className="py-20 lg:py-28 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
                Complete Research Workflow Support
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                From initial idea to published paper, NCSKIT supports every stage of your research journey
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {researchStages.map((stage, index) => (
                <Card key={stage.name} className="hover:shadow-xl transition-all duration-300 border-2 hover:border-blue-200 cursor-pointer group relative">
                  <div className="absolute -top-3 -left-3 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                    {index + 1}
                  </div>
                  <Link href={stage.href} className="block">
                    <CardHeader>
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-blue-600 transition-colors">
                        <stage.icon className="h-6 w-6 text-blue-600 group-hover:text-white transition-colors" />
                      </div>
                      <CardTitle className="text-xl group-hover:text-blue-600 transition-colors">{stage.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 leading-relaxed">{stage.description}</p>
                    </CardContent>
                  </Link>
                </Card>
              ))}
            </div>
            
            {/* Additional Internal Links Section for SEO */}
            <div className="mt-16 text-center">
              <p className="text-gray-600 mb-6">Explore our research tools and resources:</p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link href="/model_theories" className="text-blue-600 hover:text-blue-700 font-medium underline">
                  Model Theories
                </Link>
                <span className="text-gray-300">•</span>
                <Link href="/analysis" className="text-blue-600 hover:text-blue-700 font-medium underline">
                  Data Analysis
                </Link>
                <span className="text-gray-300">•</span>
                <Link href="/projects" className="text-blue-600 hover:text-blue-700 font-medium underline">
                  Research Projects
                </Link>
                <span className="text-gray-300">•</span>
                <Link href="/topics" className="text-blue-600 hover:text-blue-700 font-medium underline">
                  Research Topics
                </Link>
                <span className="text-gray-300">•</span>
                <Link href="/journals" className="text-blue-600 hover:text-blue-700 font-medium underline">
                  Journal Finder
                </Link>
                <span className="text-gray-300">•</span>
                <Link href="/blog" className="text-blue-600 hover:text-blue-700 font-medium underline">
                  Research Blog
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Latest Research Insights (Blog Posts) */}
        <section className="py-20 lg:py-28 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
                Latest Research Insights
              </h2>
              <p className="text-xl text-gray-600">
                Learn from our community of researchers
              </p>
            </div>

            {/* Blog posts will be loaded dynamically by tag */}
            <div className="grid md:grid-cols-3 gap-8">
              {/* Placeholder cards - replace with actual blog posts */}
              {[1, 2, 3].map((i) => (
                <Card key={i} className="hover:shadow-xl transition-shadow cursor-pointer">
                  <Link href="/blog">
                    <div className="aspect-video bg-gradient-to-br from-blue-100 to-indigo-100 rounded-t-lg"></div>
                    <CardHeader>
                      <div className="text-sm text-blue-600 font-medium mb-2">Research Tips</div>
                      <CardTitle className="text-lg line-clamp-2">
                        How to Find Research Gaps in Your Field
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 text-sm line-clamp-3">
                        Discover proven strategies for identifying research gaps and developing impactful research questions...
                      </p>
                      <div className="mt-4 text-sm text-gray-500">
                        5 min read • 2 days ago
                      </div>
                    </CardContent>
                  </Link>
                </Card>
              ))}
            </div>

            <div className="text-center mt-12">
              <Button asChild variant="outline" size="lg">
                <Link href="/blog" className="flex items-center">
                  View All Articles
                  <ArrowRightIcon className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Token Model Explanation */}
        <section className="py-20 lg:py-28 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="inline-flex items-center px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-medium mb-6">
                  <HeartIcon className="w-4 h-4 mr-2" />
                  Non-Profit Mission
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                  Fair, Transparent Token System
                </h2>
                <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                  Like modern AI IDEs, we use a token-based system. Purchase tokens and use them for 
                  AI-powered features. No hidden fees, no subscriptions - just pay for what you use.
                </p>
                <ul className="space-y-4">
                  <li className="flex items-start">
                    <CheckCircleIcon className="h-6 w-6 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold text-gray-900">Free Starter Tokens</div>
                      <div className="text-gray-600">Get started with complimentary tokens to explore the platform</div>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <CheckCircleIcon className="h-6 w-6 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold text-gray-900">Pay As You Go</div>
                      <div className="text-gray-600">Only pay for AI features you actually use</div>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <CheckCircleIcon className="h-6 w-6 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold text-gray-900">Non-Profit Pricing</div>
                      <div className="text-gray-600">Tokens priced at cost - we don't profit from your research</div>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <CheckCircleIcon className="h-6 w-6 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold text-gray-900">Community Support</div>
                      <div className="text-gray-600">Revenue supports platform development and community resources</div>
                    </div>
                  </li>
                </ul>
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 border-2 border-blue-100">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Token Usage Examples</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-4 bg-white rounded-lg">
                    <div>
                      <div className="font-semibold">Literature Review AI</div>
                      <div className="text-sm text-gray-600">Gap analysis & synthesis</div>
                    </div>
                    <div className="text-blue-600 font-bold">~50 tokens</div>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-white rounded-lg">
                    <div>
                      <div className="font-semibold">Statistical Analysis</div>
                      <div className="text-sm text-gray-600">EFA, CFA, SEM</div>
                    </div>
                    <div className="text-blue-600 font-bold">~30 tokens</div>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-white rounded-lg">
                    <div>
                      <div className="font-semibold">Manuscript Review</div>
                      <div className="text-sm text-gray-600">AI writing assistance</div>
                    </div>
                    <div className="text-blue-600 font-bold">~40 tokens</div>
                  </div>
                </div>
                <div className="mt-6 p-4 bg-blue-600 text-white rounded-lg text-center">
                  <div className="text-sm mb-1">Starter Package</div>
                  <div className="text-3xl font-bold">100 Tokens Free</div>
                  <div className="text-sm opacity-90 mt-1">No credit card required</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-20 lg:py-28 bg-gray-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
                Frequently Asked Questions
              </h2>
              <p className="text-xl text-gray-600">
                Everything you need to know about NCSKIT
              </p>
            </div>

            <div className="space-y-6">
              {faqs.map((faq, index) => (
                <Card key={index} className="border-2 hover:border-blue-200 transition-colors">
                  <CardHeader>
                    <CardTitle className="text-lg">{faq.question}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Trust Signals */}
        <section className="py-16 bg-white border-y border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              <p className="text-gray-600 font-medium">Supporting researchers targeting top-tier journals</p>
            </div>
            <div className="flex flex-wrap justify-center items-center gap-12 opacity-60">
              <div className="text-2xl font-bold text-gray-400">ISI / Web of Science</div>
              <div className="text-2xl font-bold text-gray-400">Scopus</div>
              <div className="text-2xl font-bold text-gray-400">ABDC</div>
              <div className="text-2xl font-bold text-gray-400">Q1 Journals</div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 lg:py-28 bg-gradient-to-br from-blue-600 to-indigo-700 text-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
              Ready to Start Your Research Journey?
            </h2>
            <p className="text-xl text-blue-100 mb-8 leading-relaxed">
              Join our growing community of researchers. Get free starter tokens and experience 
              the complete research platform designed for academic success.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" variant="secondary" className="text-lg px-8 py-6 shadow-xl hover:shadow-2xl transition-shadow">
                <Link href="/auth/login" className="flex items-center">
                  <SparklesIcon className="w-5 h-5 mr-2" />
                  Get Started Free
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="text-lg px-8 py-6 text-white border-2 border-white hover:bg-white hover:text-blue-600 transition-colors">
                <Link href="/pricing" className="flex items-center">
                  View Token Pricing
                </Link>
              </Button>
            </div>
            <p className="text-sm text-blue-200 mt-6">
              100 free starter tokens • No credit card required • Non-profit mission
            </p>
          </div>
        </section>
      </div>
    </MainLayout>
  )
}
