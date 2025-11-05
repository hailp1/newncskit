'use client'

import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  BookOpenIcon, 
  CodeBracketIcon, 
  AcademicCapIcon,
  ChartBarIcon,
  CogIcon,
  UserGroupIcon,
  DocumentTextIcon,
  PlayIcon
} from '@heroicons/react/24/outline'

export default function DocumentationPage() {
  const documentationSections = [
    {
      title: 'Bắt đầu',
      description: 'Hướng dẫn cài đặt và sử dụng NCSKit cho người mới',
      icon: PlayIcon,
      color: 'bg-green-500',
      items: [
        { title: 'Giới thiệu NCSKit', href: '/docs/introduction', badge: 'Cơ bản' },
        { title: 'Cài đặt hệ thống', href: '/docs/installation', badge: 'Cơ bản' },
        { title: 'Hướng dẫn nhanh', href: '/docs/quick-start', badge: 'Cơ bản' },
        { title: 'Tạo dự án đầu tiên', href: '/docs/first-project', badge: 'Cơ bản' }
      ]
    },
    {
      title: 'Hướng dẫn sử dụng',
      description: 'Hướng dẫn chi tiết các tính năng của NCSKit',
      icon: BookOpenIcon,
      color: 'bg-blue-500',
      items: [
        { title: 'Quản lý dự án nghiên cứu', href: '/docs/project-management', badge: 'Cơ bản' },
        { title: 'Thiết kế nghiên cứu', href: '/docs/research-design', badge: 'Trung cấp' },
        { title: 'Tạo khảo sát', href: '/docs/survey-creation', badge: 'Trung cấp' },
        { title: 'Thu thập dữ liệu', href: '/docs/data-collection', badge: 'Trung cấp' },
        { title: 'Phân tích thống kê', href: '/docs/statistical-analysis', badge: 'Nâng cao' }
      ]
    },
    {
      title: 'Phân tích dữ liệu',
      description: 'Hướng dẫn phân tích thống kê và mô hình nghiên cứu',
      icon: ChartBarIcon,
      color: 'bg-purple-500',
      items: [
        { title: 'Thống kê mô tả', href: '/docs/descriptive-statistics', badge: 'Cơ bản' },
        { title: 'Kiểm định độ tin cậy', href: '/docs/reliability-analysis', badge: 'Trung cấp' },
        { title: 'Phân tích nhân tố EFA/CFA', href: '/docs/factor-analysis', badge: 'Nâng cao' },
        { title: 'Mô hình phương trình cấu trúc SEM', href: '/docs/structural-equation-modeling', badge: 'Nâng cao' },
        { title: 'Hồi quy và ANOVA', href: '/docs/regression-anova', badge: 'Trung cấp' }
      ]
    },
    {
      title: 'Mô hình lý thuyết',
      description: 'Thư viện các mô hình và lý thuyết nghiên cứu',
      icon: AcademicCapIcon,
      color: 'bg-orange-500',
      items: [
        { title: 'Theory of Planned Behavior', href: '/docs/models/tpb', badge: 'Mô hình' },
        { title: 'Technology Acceptance Model', href: '/docs/models/tam', badge: 'Mô hình' },
        { title: 'SERVQUAL Model', href: '/docs/models/servqual', badge: 'Mô hình' },
        { title: 'Value-Belief-Norm Model', href: '/docs/models/vbn', badge: 'Mô hình' },
        { title: 'Tất cả mô hình', href: '/docs/models', badge: 'Thư viện' }
      ]
    },
    {
      title: 'API Documentation',
      description: 'Tài liệu API cho nhà phát triển',
      icon: CodeBracketIcon,
      color: 'bg-red-500',
      items: [
        { title: 'API Overview', href: '/docs/api', badge: 'Dev' },
        { title: 'Authentication', href: '/docs/api/auth', badge: 'Dev' },
        { title: 'Projects API', href: '/docs/api/projects', badge: 'Dev' },
        { title: 'Surveys API', href: '/docs/api/surveys', badge: 'Dev' },
        { title: 'Analysis API', href: '/docs/api/analysis', badge: 'Dev' }
      ]
    },
    {
      title: 'Quản trị hệ thống',
      description: 'Hướng dẫn cho quản trị viên',
      icon: CogIcon,
      color: 'bg-gray-500',
      items: [
        { title: 'Cài đặt hệ thống', href: '/docs/admin/installation', badge: 'Admin' },
        { title: 'Quản lý người dùng', href: '/docs/admin/user-management', badge: 'Admin' },
        { title: 'Cấu hình hệ thống', href: '/docs/admin/configuration', badge: 'Admin' },
        { title: 'Backup và bảo mật', href: '/docs/admin/security', badge: 'Admin' },
        { title: 'Monitoring', href: '/docs/admin/monitoring', badge: 'Admin' }
      ]
    }
  ]

  const getBadgeColor = (badge: string) => {
    switch (badge) {
      case 'Cơ bản': return 'bg-green-100 text-green-800'
      case 'Trung cấp': return 'bg-yellow-100 text-yellow-800'
      case 'Nâng cao': return 'bg-red-100 text-red-800'
      case 'Mô hình': return 'bg-purple-100 text-purple-800'
      case 'Dev': return 'bg-blue-100 text-blue-800'
      case 'Admin': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Tài liệu NCSKit
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Hướng dẫn toàn diện về cách sử dụng NCSKit - Nền tảng nghiên cứu khoa học thông minh
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Quick Links */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Liên kết nhanh</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Link href="/docs/quick-start" className="group">
              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6 text-center">
                  <PlayIcon className="w-8 h-8 text-green-500 mx-auto mb-2" />
                  <h3 className="font-semibold text-gray-900 group-hover:text-green-600">
                    Bắt đầu ngay
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">5 phút</p>
                </CardContent>
              </Card>
            </Link>
            
            <Link href="/docs/first-project" className="group">
              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6 text-center">
                  <DocumentTextIcon className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                  <h3 className="font-semibold text-gray-900 group-hover:text-blue-600">
                    Dự án đầu tiên
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">10 phút</p>
                </CardContent>
              </Card>
            </Link>
            
            <Link href="/docs/statistical-analysis" className="group">
              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6 text-center">
                  <ChartBarIcon className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                  <h3 className="font-semibold text-gray-900 group-hover:text-purple-600">
                    Phân tích dữ liệu
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">30 phút</p>
                </CardContent>
              </Card>
            </Link>
            
            <Link href="/docs/api" className="group">
              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6 text-center">
                  <CodeBracketIcon className="w-8 h-8 text-red-500 mx-auto mb-2" />
                  <h3 className="font-semibold text-gray-900 group-hover:text-red-600">
                    API Reference
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">Tham khảo</p>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>

        {/* Documentation Sections */}
        <div className="space-y-12">
          {documentationSections.map((section, index) => (
            <div key={index}>
              <div className="flex items-center mb-6">
                <div className={`w-10 h-10 ${section.color} rounded-lg flex items-center justify-center mr-4`}>
                  <section.icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{section.title}</h2>
                  <p className="text-gray-600">{section.description}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {section.items.map((item, itemIndex) => (
                  <Link key={itemIndex} href={item.href} className="group">
                    <Card className="hover:shadow-lg transition-shadow h-full">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 flex-1">
                            {item.title}
                          </h3>
                          <Badge className={`ml-2 ${getBadgeColor(item.badge)}`}>
                            {item.badge}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Help Section */}
        <div className="mt-16 bg-blue-50 rounded-lg p-8 text-center">
          <UserGroupIcon className="w-12 h-12 text-blue-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Cần hỗ trợ thêm?
          </h2>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Nếu bạn không tìm thấy thông tin cần thiết trong tài liệu, đừng ngại liên hệ với chúng tôi.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/contact" className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              Liên hệ hỗ trợ
            </Link>
            <Link href="/community" className="inline-flex items-center px-6 py-3 bg-white text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors">
              Cộng đồng
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}