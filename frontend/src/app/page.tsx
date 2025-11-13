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
      <div className="bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 min-h-screen">

      {/* Hero Section - Premium Academic Design with Animations */}
      <div className="relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(59,130,246,0.15)_1px,transparent_0)] bg-[size:20px_20px] opacity-30"></div>
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-1/3 w-96 h-96 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32 lg:py-40 relative z-10">
          <div className="text-center max-w-5xl mx-auto">
            {/* Badge with animation */}
            <div className="inline-flex items-center gap-2 px-5 py-2.5 mb-8 bg-white/80 backdrop-blur-md border border-blue-200 rounded-full text-sm font-semibold text-blue-700 shadow-lg animate-fade-in">
              <SparklesIcon className="w-4 h-4 animate-pulse" />
              <span>AI-Powered Research Platform</span>
            </div>
            
            {/* Main Heading with gradient animation */}
            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold text-gray-900 mb-8 leading-[1.1] tracking-tight animate-slide-up">
              Streamline Your
              <span className="block mt-3 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent animate-gradient">
                Research Journey
              </span>
            </h1>
            
            {/* Subtitle */}
            <p className="text-xl sm:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed font-light animate-fade-in-delay">
              NCSKIT is a unified platform that guides researchers through every phase of the 
              academic publication process - from planning and execution to writing and submission.
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-5 justify-center items-center animate-fade-in-delay-2">
              <Button 
                asChild 
                size="lg" 
                className="text-base sm:text-lg px-10 py-7 shadow-2xl hover:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)] hover:scale-105 transition-all duration-300 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              >
                <Link href="/auth/login">
                  <SparklesIcon className="w-5 h-5 mr-2" />
                  Get Started Free
                </Link>
              </Button>
              <Button 
                asChild 
                variant="outline" 
                size="lg" 
                className="text-base sm:text-lg px-10 py-7 border-2 border-gray-300 hover:border-blue-500 hover:bg-white/80 backdrop-blur-sm transition-all duration-300 hover:scale-105"
              >
                <Link href="/blog">
                  <BookOpenIcon className="w-5 h-5 mr-2" />
                  Explore Blog
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section - Premium Design with Hover Effects */}
      <div className="py-24 md:py-32 lg:py-40 bg-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20 md:mb-24">
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-gray-900 mb-6 tracking-tight">
              Everything You Need for
              <span className="block mt-2 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Research Success
              </span>
            </h2>
            <p className="text-xl sm:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed font-light">
              From AI-powered writing assistance to intelligent journal matching, 
              NCSKIT provides all the tools you need to publish high-quality research.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
            {features.map((feature, index) => (
              <Card 
                key={feature.name} 
                className="group hover:shadow-2xl transition-all duration-500 cursor-pointer border-2 border-gray-100 hover:border-blue-300 bg-white hover:-translate-y-2 relative overflow-hidden"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Gradient overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50/0 to-indigo-50/0 group-hover:from-blue-50/50 group-hover:to-indigo-50/50 transition-all duration-500"></div>
                
                <Link href={feature.href} className="block h-full relative z-10">
                  <CardHeader className="pb-6 pt-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 group-hover:from-blue-100 group-hover:to-indigo-100 mb-6 transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 shadow-lg">
                      <feature.icon className="h-8 w-8 text-blue-600 group-hover:text-indigo-700 transition-colors" />
                    </div>
                    <CardTitle className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
                      {feature.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pb-8">
                    <p className="text-gray-600 leading-relaxed text-base">{feature.description}</p>
                  </CardContent>
                </Link>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Benefits Section - Premium Stats with Animations */}
      <div className="py-24 md:py-32 lg:py-40 bg-gradient-to-br from-gray-50 via-blue-50/50 to-indigo-50/50 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-20 items-center">
            <div>
              <h2 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-gray-900 mb-8 tracking-tight">
                Why Choose
                <span className="block mt-2 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  NCSKIT?
                </span>
              </h2>
              <p className="text-xl sm:text-2xl text-gray-600 mb-10 leading-relaxed font-light">
                Join thousands of researchers who have streamlined their publication 
                workflow and increased their research productivity with our AI-powered platform.
              </p>
              <ul className="space-y-5">
                {benefits.map((benefit, index) => (
                  <li key={index} className="flex items-start gap-4 group">
                    <div className="flex-shrink-0 mt-1">
                      <div className="w-8 h-8 rounded-full bg-green-100 group-hover:bg-green-200 flex items-center justify-center transition-colors duration-300">
                        <CheckCircleIcon className="h-5 w-5 text-green-600" />
                      </div>
                    </div>
                    <span className="text-gray-700 text-lg leading-relaxed font-medium group-hover:text-gray-900 transition-colors">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="grid grid-cols-2 gap-6 md:gap-8">
              <Card className="border-2 border-gray-200 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 bg-white/80 backdrop-blur-sm group">
                <CardContent className="pt-8 pb-8 text-center">
                  <div className="text-5xl md:text-6xl font-extrabold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent mb-3 group-hover:scale-110 transition-transform duration-300">10K+</div>
                  <div className="text-base md:text-lg text-gray-600 font-semibold">Active Researchers</div>
                </CardContent>
              </Card>
              <Card className="border-2 border-gray-200 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 bg-white/80 backdrop-blur-sm group">
                <CardContent className="pt-8 pb-8 text-center">
                  <div className="text-5xl md:text-6xl font-extrabold bg-gradient-to-r from-green-600 to-green-700 bg-clip-text text-transparent mb-3 group-hover:scale-110 transition-transform duration-300">50K+</div>
                  <div className="text-base md:text-lg text-gray-600 font-semibold">Papers Published</div>
                </CardContent>
              </Card>
              <Card className="border-2 border-gray-200 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 bg-white/80 backdrop-blur-sm group">
                <CardContent className="pt-8 pb-8 text-center">
                  <div className="text-5xl md:text-6xl font-extrabold bg-gradient-to-r from-purple-600 to-purple-700 bg-clip-text text-transparent mb-3 group-hover:scale-110 transition-transform duration-300">95%</div>
                  <div className="text-base md:text-lg text-gray-600 font-semibold">Success Rate</div>
                </CardContent>
              </Card>
              <Card className="border-2 border-gray-200 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 bg-white/80 backdrop-blur-sm group">
                <CardContent className="pt-8 pb-8 text-center">
                  <div className="text-5xl md:text-6xl font-extrabold bg-gradient-to-r from-orange-600 to-orange-700 bg-clip-text text-transparent mb-3 group-hover:scale-110 transition-transform duration-300">24/7</div>
                  <div className="text-base md:text-lg text-gray-600 font-semibold">AI Support</div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section - Premium Call to Action with Effects */}
      <div className="py-24 md:py-32 lg:py-40 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 relative overflow-hidden">
        {/* Animated background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] bg-[size:40px_40px]"></div>
        </div>
        {/* Glowing orbs */}
        <div className="absolute top-0 left-1/4 w-72 h-72 bg-white/20 rounded-full filter blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-white/20 rounded-full filter blur-3xl animate-pulse animation-delay-2000"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-white mb-8 tracking-tight">
            Ready to Transform
            <span className="block mt-2">Your Research?</span>
          </h2>
          <p className="text-xl sm:text-2xl text-blue-100 mb-12 max-w-3xl mx-auto leading-relaxed font-light">
            Join the research revolution and start publishing high-quality papers 
            with the power of AI-assisted research management.
          </p>
          <div className="flex flex-col sm:flex-row gap-5 justify-center items-center">
            <Button 
              asChild 
              size="lg" 
              variant="secondary" 
              className="text-base sm:text-lg px-10 py-7 shadow-2xl hover:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)] hover:scale-105 transition-all duration-300 bg-white text-blue-600 hover:bg-gray-50 font-semibold"
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
              className="text-base sm:text-lg px-10 py-7 text-white border-2 border-white/80 hover:border-white hover:bg-white/10 backdrop-blur-sm transition-all duration-300 hover:scale-105 font-semibold"
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