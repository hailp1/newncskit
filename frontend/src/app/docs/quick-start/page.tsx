'use client'

import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  PlayIcon,
  CheckCircleIcon,
  ArrowRightIcon,
  ClockIcon,
  UserIcon,
  DocumentTextIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline'

export default function QuickStartPage() {
  const steps = [
    {
      number: 1,
      title: 'Đăng ký tài khoản',
      time: '1 phút',
      description: 'Tạo tài khoản miễn phí để bắt đầu sử dụng NCSKit',
      details: [
        'Truy cập trang đăng ký',
        'Nhập email và mật khẩu',
        'Xác nhận email',
        'Hoàn tất hồ sơ cá nhân'
      ],
      icon: UserIcon,
      color: 'bg-blue-500'
    },
    {
      number: 2,
      title: 'Tạo dự án nghiên cứu',
      time: '2 phút',
      description: 'Thiết lập dự án nghiên cứu đầu tiên với sự hỗ trợ của AI',
      details: [
        'Chọn "Tạo dự án mới"',
        'Nhập tiêu đề và mô tả nghiên cứu',
        'Chọn lĩnh vực nghiên cứu',
        'Chọn mô hình lý thuyết phù hợp'
      ],
      icon: DocumentTextIcon,
      color: 'bg-green-500'
    },
    {
      number: 3,
      title: 'Thiết kế khảo sát',
      time: '1 phút',
      description: 'AI tự động tạo bảng câu hỏi dựa trên mô hình đã chọn',
      details: [
        'Xem xét thiết kế nghiên cứu được tạo',
        'Kiểm tra các biến và giả thuyết',
        'Tùy chỉnh câu hỏi nếu cần',
        'Xác nhận và lưu khảo sát'
      ],
      icon: CheckCircleIcon,
      color: 'bg-purple-500'
    },
    {
      number: 4,
      title: 'Bắt đầu thu thập dữ liệu',
      time: '1 phút',
      description: 'Triển khai khảo sát và theo dõi tiến độ thu thập',
      details: [
        'Thiết lập chiến dịch khảo sát',
        'Cấu hình token reward',
        'Chia sẻ link khảo sát',
        'Theo dõi phản hồi real-time'
      ],
      icon: ChartBarIcon,
      color: 'bg-orange-500'
    }
  ]

  const tips = [
    {
      title: 'Chọn mô hình phù hợp',
      description: 'Dành thời gian tìm hiểu các mô hình lý thuyết để chọn mô hình phù hợp nhất với nghiên cứu của bạn.'
    },
    {
      title: 'Kiểm tra câu hỏi',
      description: 'Luôn xem xét và test thử bảng câu hỏi trước khi triển khai chính thức.'
    },
    {
      title: 'Sử dụng token reward',
      description: 'Token reward giúp tăng tỷ lệ phản hồi và chất lượng dữ liệu thu thập được.'
    },
    {
      title: 'Theo dõi tiến độ',
      description: 'Sử dụng dashboard để theo dõi tiến độ thu thập dữ liệu và điều chỉnh kịp thời.'
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
                <span className="text-gray-900 font-medium">Hướng dẫn nhanh</span>
              </li>
            </ol>
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-12 text-center">
          <div className="flex items-center justify-center mb-4">
            <PlayIcon className="w-8 h-8 text-blue-500 mr-3" />
            <h1 className="text-4xl font-bold text-gray-900">
              Hướng dẫn nhanh
            </h1>
          </div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Chỉ cần 5 phút để thiết lập và bắt đầu dự án nghiên cứu đầu tiên của bạn với NCSKit
          </p>
          <div className="flex items-center justify-center mt-4">
            <ClockIcon className="w-5 h-5 text-gray-400 mr-2" />
            <span className="text-gray-600">Thời gian: 5 phút</span>
          </div>
        </div>

        {/* Prerequisites */}
        <section className="mb-12">
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">
                Yêu cầu trước khi bắt đầu
              </h2>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-center">
                  <CheckCircleIcon className="w-5 h-5 text-green-500 mr-2" />
                  Trình duyệt web hiện đại (Chrome, Firefox, Safari, Edge)
                </li>
                <li className="flex items-center">
                  <CheckCircleIcon className="w-5 h-5 text-green-500 mr-2" />
                  Kết nối internet ổn định
                </li>
                <li className="flex items-center">
                  <CheckCircleIcon className="w-5 h-5 text-green-500 mr-2" />
                  Địa chỉ email hợp lệ để đăng ký
                </li>
                <li className="flex items-center">
                  <CheckCircleIcon className="w-5 h-5 text-green-500 mr-2" />
                  Ý tưởng nghiên cứu cơ bản (chủ đề, mục tiêu)
                </li>
              </ul>
            </CardContent>
          </Card>
        </section>

        {/* Steps */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Các bước thực hiện</h2>
          <div className="space-y-8">
            {steps.map((step, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-8">
                  <div className="flex items-start">
                    <div className={`w-12 h-12 ${step.color} rounded-lg flex items-center justify-center mr-6 flex-shrink-0`}>
                      <step.icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center mb-3">
                        <h3 className="text-xl font-semibold text-gray-900 mr-4">
                          Bước {step.number}: {step.title}
                        </h3>
                        <Badge variant="secondary" className="flex items-center">
                          <ClockIcon className="w-3 h-3 mr-1" />
                          {step.time}
                        </Badge>
                      </div>
                      <p className="text-gray-600 mb-4">
                        {step.description}
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {step.details.map((detail, detailIndex) => (
                          <div key={detailIndex} className="flex items-center text-sm text-gray-700">
                            <div className="w-2 h-2 bg-gray-300 rounded-full mr-3"></div>
                            {detail}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Tips */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Mẹo hữu ích</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {tips.map((tip, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    💡 {tip.title}
                  </h3>
                  <p className="text-gray-600">
                    {tip.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Next Steps */}
        <section className="mb-12">
          <Card className="bg-green-50 border-green-200">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                🎉 Chúc mừng! Bạn đã hoàn thành hướng dẫn nhanh
              </h2>
              <p className="text-gray-600 mb-6">
                Bây giờ bạn đã biết cách sử dụng các tính năng cơ bản của NCSKit. 
                Hãy khám phá thêm các tính năng nâng cao để tối ưu hóa nghiên cứu của bạn.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Link 
                  href="/docs/first-project" 
                  className="flex items-center p-4 bg-white rounded-lg border hover:shadow-md transition-shadow"
                >
                  <DocumentTextIcon className="w-6 h-6 text-blue-500 mr-3" />
                  <div>
                    <div className="font-semibold text-gray-900">Dự án đầu tiên</div>
                    <div className="text-sm text-gray-600">Hướng dẫn chi tiết</div>
                  </div>
                </Link>
                
                <Link 
                  href="/docs/research-design" 
                  className="flex items-center p-4 bg-white rounded-lg border hover:shadow-md transition-shadow"
                >
                  <ChartBarIcon className="w-6 h-6 text-green-500 mr-3" />
                  <div>
                    <div className="font-semibold text-gray-900">Thiết kế nghiên cứu</div>
                    <div className="text-sm text-gray-600">Tìm hiểu sâu hơn</div>
                  </div>
                </Link>
                
                <Link 
                  href="/docs/statistical-analysis" 
                  className="flex items-center p-4 bg-white rounded-lg border hover:shadow-md transition-shadow"
                >
                  <ChartBarIcon className="w-6 h-6 text-purple-500 mr-3" />
                  <div>
                    <div className="font-semibold text-gray-900">Phân tích dữ liệu</div>
                    <div className="text-sm text-gray-600">Nâng cao kỹ năng</div>
                  </div>
                </Link>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Help */}
        <section className="mb-12">
          <Card className="bg-yellow-50 border-yellow-200">
            <CardContent className="p-6 text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Cần hỗ trợ?
              </h3>
              <p className="text-gray-600 mb-4">
                Nếu bạn gặp khó khăn trong quá trình thực hiện, đừng ngại liên hệ với chúng tôi.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link 
                  href="/contact" 
                  className="inline-flex items-center px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
                >
                  Liên hệ hỗ trợ
                </Link>
                <Link 
                  href="/docs/faq" 
                  className="inline-flex items-center px-4 py-2 bg-white text-yellow-600 border border-yellow-600 rounded-lg hover:bg-yellow-50 transition-colors"
                >
                  Câu hỏi thường gặp
                </Link>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Navigation */}
        <div className="flex justify-between items-center pt-8 border-t">
          <Link 
            href="/docs/introduction" 
            className="text-blue-600 hover:text-blue-700 flex items-center"
          >
            ← Giới thiệu NCSKit
          </Link>
          <Link 
            href="/docs/first-project" 
            className="text-blue-600 hover:text-blue-700 flex items-center"
          >
            Tạo dự án đầu tiên →
          </Link>
        </div>
      </div>
    </div>
  )
}