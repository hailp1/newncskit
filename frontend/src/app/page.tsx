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
    name: 'Phân Tích Dữ Liệu Khảo Sát',
    description: 'Upload CSV và phân tích dữ liệu khảo sát với các phương pháp thống kê tiên tiến: Cronbach Alpha, EFA, CFA, SEM',
    icon: ChartBarIcon,
    href: '/analysis/new',
  },
  {
    name: 'Kiểm Định Độ Tin Cậy',
    description: 'Tự động tính Cronbach Alpha, kiểm tra độ tin cậy thang đo và đề xuất loại bỏ biến không phù hợp',
    icon: CheckCircleIcon,
    href: '/analysis/new',
  },
  {
    name: 'Phân Tích Nhân Tố',
    description: 'Thực hiện EFA (Exploratory Factor Analysis) và CFA (Confirmatory Factor Analysis) một cách dễ dàng',
    icon: BeakerIcon,
    href: '/analysis/new',
  },
  {
    name: 'Mô Hình Cấu Trúc (SEM)',
    description: 'Xây dựng và kiểm định mô hình cấu trúc tuyến tính (Structural Equation Modeling) chuyên nghiệp',
    icon: AcademicCapIcon,
    href: '/analysis/new',
  },
  {
    name: 'Hồi Quy & Tương Quan',
    description: 'Phân tích hồi quy tuyến tính, tương quan Pearson, và các kiểm định thống kê cơ bản',
    icon: SparklesIcon,
    href: '/analysis/new',
  },
  {
    name: 'Báo Cáo Tự Động',
    description: 'Tạo báo cáo phân tích chuyên nghiệp với biểu đồ, bảng số liệu và giải thích kết quả',
    icon: DocumentTextIcon,
    href: '/analysis/new',
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
      <div className="bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(59,130,246,0.1)_1px,transparent_0)] bg-[size:20px_20px] opacity-20"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28 lg:py-32 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 bg-white border border-blue-200 rounded-full text-sm font-medium text-blue-700 shadow-sm">
              <SparklesIcon className="w-4 h-4" />
              <span>AI-Powered Research Platform</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight tracking-tight">
              Streamline Your
              <span className="block mt-2 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Research Journey
              </span>
            </h1>
            
            <p className="text-lg sm:text-xl text-gray-600 mb-10 max-w-3xl mx-auto leading-relaxed">
              NCSKIT is a unified platform that guides researchers through every phase of the 
              academic publication process - from planning and execution to writing and submission.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button 
                asChild 
                size="lg" 
                className="text-base sm:text-lg px-8 py-6 shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <Link href="/auth/login">
                  <SparklesIcon className="w-5 h-5 mr-2" />
                  Get Started
                </Link>
              </Button>
              <Button 
                asChild 
                variant="outline" 
                size="lg" 
                className="text-base sm:text-lg px-8 py-6 border-2 hover:bg-gray-50 transition-all duration-200"
              >
                <Link href="/blog">
                  <BookOpenIcon className="w-5 h-5 mr-2" />
                  View Blog
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 md:py-24 lg:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4 tracking-tight">
              Everything You Need for Research Success
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              From AI-powered writing assistance to intelligent journal matching, 
              NCSKIT provides all the tools you need to publish high-quality research.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {features.map((feature) => (
              <Card 
                key={feature.name} 
                className="group hover:shadow-lg transition-all duration-300 cursor-pointer border border-gray-200 hover:border-blue-300 bg-white"
              >
                <Link href={feature.href} className="block h-full">
                  <CardHeader className="pb-4">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-blue-50 group-hover:bg-blue-100 mb-4 transition-colors duration-300">
                      <feature.icon className="h-6 w-6 text-blue-600" />
                    </div>
                    <CardTitle className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                      {feature.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                  </CardContent>
                </Link>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="py-20 md:py-24 lg:py-28 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-6 tracking-tight">
                Why Choose NCSKIT?
              </h2>
              <p className="text-lg sm:text-xl text-gray-600 mb-8 leading-relaxed">
                Join thousands of researchers who have streamlined their publication 
                workflow and increased their research productivity with our AI-powered platform.
              </p>
              <ul className="space-y-4">
                {benefits.map((benefit, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-0.5">
                      <CheckCircleIcon className="h-6 w-6 text-green-600" />
                    </div>
                    <span className="text-gray-700 text-base leading-relaxed">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="grid grid-cols-2 gap-4 md:gap-6">
              <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="pt-6 pb-6 text-center">
                  <div className="text-3xl md:text-4xl font-bold text-blue-600 mb-2">10K+</div>
                  <div className="text-sm md:text-base text-gray-600 font-medium">Active Researchers</div>
                </CardContent>
              </Card>
              <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="pt-6 pb-6 text-center">
                  <div className="text-3xl md:text-4xl font-bold text-green-600 mb-2">50K+</div>
                  <div className="text-sm md:text-base text-gray-600 font-medium">Papers Published</div>
                </CardContent>
              </Card>
              <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="pt-6 pb-6 text-center">
                  <div className="text-3xl md:text-4xl font-bold text-purple-600 mb-2">95%</div>
                  <div className="text-sm md:text-base text-gray-600 font-medium">Success Rate</div>
                </CardContent>
              </Card>
              <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="pt-6 pb-6 text-center">
                  <div className="text-3xl md:text-4xl font-bold text-orange-600 mb-2">24/7</div>
                  <div className="text-sm md:text-base text-gray-600 font-medium">AI Support</div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 md:py-24 lg:py-28 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight">
            Ready to Transform Your Research?
          </h2>
          <p className="text-lg sm:text-xl text-blue-100 mb-10 max-w-2xl mx-auto leading-relaxed">
            Join the research revolution and start publishing high-quality papers 
            with the power of AI-assisted research management.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              asChild 
              size="lg" 
              variant="secondary" 
              className="text-base sm:text-lg px-8 py-6 shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <Link href="/auth/login">
                <UsersIcon className="w-5 h-5 mr-2" />
                Start Free Trial
              </Link>
            </Button>
            <Button 
              asChild 
              variant="outline" 
              size="lg" 
              className="text-base sm:text-lg px-8 py-6 text-white border-2 border-white hover:bg-white hover:text-blue-600 transition-all duration-200"
            >
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