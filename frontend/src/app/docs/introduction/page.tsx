'use client'

import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  AcademicCapIcon,
  ChartBarIcon,
  UserGroupIcon,
  GlobeAltIcon,
  LightBulbIcon,
  ShieldCheckIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline'

export default function IntroductionPage() {
  const features = [
    {
      icon: AcademicCapIcon,
      title: 'Thiết kế nghiên cứu thông minh',
      description: 'AI hỗ trợ tạo thiết kế nghiên cứu dựa trên các mô hình lý thuyết đã được kiểm chứng',
      color: 'text-blue-500'
    },
    {
      icon: ChartBarIcon,
      title: 'Phân tích thống kê tự động',
      description: 'Tích hợp R để thực hiện các phân tích thống kê phức tạp như EFA, CFA, SEM',
      color: 'text-green-500'
    },
    {
      icon: UserGroupIcon,
      title: 'Thu thập dữ liệu hiệu quả',
      description: 'Hệ thống khảo sát với token reward để tăng tỷ lệ phản hồi',
      color: 'text-purple-500'
    },
    {
      icon: GlobeAltIcon,
      title: 'Đa ngôn ngữ',
      description: 'Hỗ trợ tiếng Việt và tiếng Anh, phù hợp với nghiên cứu quốc tế',
      color: 'text-orange-500'
    },
    {
      icon: LightBulbIcon,
      title: 'Thư viện mô hình phong phú',
      description: 'Hơn 50 mô hình lý thuyết từ Marketing, Du lịch, Nhân sự, IT',
      color: 'text-yellow-500'
    },
    {
      icon: ShieldCheckIcon,
      title: 'Bảo mật và riêng tư',
      description: 'Đảm bảo an toàn dữ liệu nghiên cứu với các tiêu chuẩn bảo mật cao',
      color: 'text-red-500'
    }
  ]

  const useCases = [
    {
      title: 'Nghiên cứu sinh',
      description: 'Hỗ trợ thực hiện luận văn, luận án với các công cụ phân tích chuyên nghiệp',
      badge: 'Phổ biến'
    },
    {
      title: 'Giảng viên đại học',
      description: 'Công cụ giảng dạy và nghiên cứu khoa học hiệu quả',
      badge: 'Chuyên nghiệp'
    },
    {
      title: 'Doanh nghiệp',
      description: 'Nghiên cứu thị trường, khảo sát khách hàng và phân tích hành vi người tiêu dùng',
      badge: 'Doanh nghiệp'
    },
    {
      title: 'Tổ chức nghiên cứu',
      description: 'Thực hiện các dự án nghiên cứu quy mô lớn với nhiều người tham gia',
      badge: 'Tổ chức'
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav className="flex" aria-label="Breadcrumb">
            <ol className="flex items-center space-x-4">
              <li>
                <Link href="/docs" className="text-gray-500 hover:text-gray-700">
                  Tài liệu
                </Link>
              </li>
              <li>
                <ArrowRightIcon className="w-4 h-4 text-gray-400" />
              </li>
              <li>
                <span className="text-gray-900 font-medium">Giới thiệu NCSKit</span>
              </li>
            </ol>
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Giới thiệu NCSKit
          </h1>
          <p className="text-xl text-gray-600 leading-relaxed">
            NCSKit (Nghiên Cứu Khoa học Kit) là nền tảng nghiên cứu khoa học thông minh, 
            được thiết kế để hỗ trợ toàn bộ quy trình nghiên cứu từ thiết kế đến phân tích kết quả.
          </p>
        </div>

        {/* What is NCSKit */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">NCSKit là gì?</h2>
          <div className="prose prose-lg max-w-none">
            <p className="text-gray-700 leading-relaxed mb-4">
              NCSKit là một hệ thống tích hợp hoàn chỉnh giúp các nhà nghiên cứu, sinh viên và doanh nghiệp 
              thực hiện nghiên cứu khoa học một cách hiệu quả và chuyên nghiệp. Hệ thống kết hợp sức mạnh 
              của trí tuệ nhân tạo (AI) với các phương pháp nghiên cứu đã được kiểm chứng.
            </p>
            <p className="text-gray-700 leading-relaxed mb-4">
              Với NCSKit, bạn có thể:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 mb-6">
              <li>Tạo thiết kế nghiên cứu dựa trên các mô hình lý thuyết có sẵn</li>
              <li>Xây dựng khảo sát chuyên nghiệp với hệ thống token reward</li>
              <li>Thu thập dữ liệu từ nhiều nguồn khác nhau</li>
              <li>Thực hiện phân tích thống kê phức tạp tự động</li>
              <li>Xuất báo cáo nghiên cứu hoàn chỉnh</li>
            </ul>
          </div>
        </section>

        {/* Key Features */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Tính năng chính</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start">
                    <feature.icon className={`w-8 h-8 ${feature.color} mr-4 mt-1 flex-shrink-0`} />
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {feature.title}
                      </h3>
                      <p className="text-gray-600">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Use Cases */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Ai nên sử dụng NCSKit?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {useCases.map((useCase, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {useCase.title}
                    </h3>
                    <Badge variant="secondary">{useCase.badge}</Badge>
                  </div>
                  <p className="text-gray-600">
                    {useCase.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* How it Works */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Cách thức hoạt động</h2>
          <div className="space-y-8">
            <div className="flex items-start">
              <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold mr-4 mt-1">
                1
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Thiết kế nghiên cứu
                </h3>
                <p className="text-gray-600">
                  Chọn lĩnh vực nghiên cứu và mô hình lý thuyết. AI sẽ hỗ trợ tạo thiết kế nghiên cứu 
                  hoàn chỉnh với các biến và giả thuyết phù hợp.
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center font-bold mr-4 mt-1">
                2
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Tạo khảo sát
                </h3>
                <p className="text-gray-600">
                  Hệ thống tự động tạo bảng câu hỏi dựa trên thiết kế nghiên cứu. 
                  Bạn có thể tùy chỉnh và thêm câu hỏi theo nhu cầu.
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center font-bold mr-4 mt-1">
                3
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Thu thập dữ liệu
                </h3>
                <p className="text-gray-600">
                  Triển khai khảo sát với hệ thống token reward để khuyến khích người tham gia. 
                  Theo dõi tiến độ thu thập dữ liệu real-time.
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center font-bold mr-4 mt-1">
                4
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Phân tích dữ liệu
                </h3>
                <p className="text-gray-600">
                  Thực hiện các phân tích thống kê tự động như độ tin cậy, phân tích nhân tố, 
                  mô hình phương trình cấu trúc và xuất báo cáo chi tiết.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Getting Started */}
        <section className="mb-12">
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-8 text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Sẵn sàng bắt đầu?
              </h2>
              <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                Chỉ cần 5 phút để thiết lập và bạn có thể bắt đầu dự án nghiên cứu đầu tiên của mình.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link 
                  href="/docs/quick-start" 
                  className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Hướng dẫn nhanh
                  <ArrowRightIcon className="w-4 h-4 ml-2" />
                </Link>
                <Link 
                  href="/docs/first-project" 
                  className="inline-flex items-center px-6 py-3 bg-white text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                >
                  Tạo dự án đầu tiên
                </Link>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Navigation */}
        <div className="flex justify-between items-center pt-8 border-t">
          <Link 
            href="/docs" 
            className="text-blue-600 hover:text-blue-700 flex items-center"
          >
            ← Quay lại tài liệu
          </Link>
          <Link 
            href="/docs/installation" 
            className="text-blue-600 hover:text-blue-700 flex items-center"
          >
            Cài đặt hệ thống →
          </Link>
        </div>
      </div>
    </div>
  )
}