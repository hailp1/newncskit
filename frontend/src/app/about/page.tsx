'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  Target, 
  Award, 
  Globe, 
  Heart,
  Lightbulb,
  TrendingUp,
  Shield,
  BarChart3,
  FileText,
  Code,
  Settings,
  BookOpen,
  Zap,
  Database,
  Brain
} from 'lucide-react';
import Link from 'next/link';

export default function AboutPage() {
  return (
      <div className="bg-gradient-to-br from-blue-50 to-indigo-100">
        {/* Hero Section */}
        <div className="bg-white">
          <div className="max-w-7xl mx-auto px-6 py-16">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-gray-900 mb-6">
                Về NCSKIT
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
                Nền tảng nghiên cứu khoa học AI-powered hàng đầu Việt Nam, cung cấp công cụ khảo sát chuyên nghiệp và phân tích dữ liệu nâng cao cho cộng đồng nghiên cứu học thuật và thị trường.
              </p>
              <div className="flex justify-center gap-4">
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                  Nền tảng nghiên cứu
                </Badge>
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  Cộng đồng toàn cầu
                </Badge>
                <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                  AI-Powered
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Mission & Vision */}
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="grid md:grid-cols-2 gap-12">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-6 w-6 text-blue-600" />
                  Sứ mệnh của chúng tôi
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed">
                  Dân chủ hóa việc tiếp cận các công cụ nghiên cứu chuyên nghiệp và trao quyền cho các nhà nghiên cứu, học giả và tổ chức để thực hiện các cuộc khảo sát chất lượng cao và tạo ra những hiểu biết có ý nghĩa thúc đẩy sự thay đổi tích cực trong xã hội.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="h-6 w-6 text-purple-600" />
                  Tầm nhìn của chúng tôi
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed">
                  Trở thành nền tảng hàng đầu thế giới về nghiên cứu khảo sát và phân tích dữ liệu, thúc đẩy một cộng đồng toàn cầu các nhà nghiên cứu hợp tác để giải quyết những thách thức phức tạp thông qua những hiểu biết dựa trên bằng chứng.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Core Values */}
        <div className="bg-white">
          <div className="max-w-7xl mx-auto px-6 py-16">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Giá trị cốt lõi</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Những nguyên tắc định hướng mọi hoạt động của chúng tôi tại NCSKIT
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Tính chính trực</h3>
                <p className="text-gray-600 text-sm">
                  Chúng tôi duy trì các tiêu chuẩn đạo đức cao nhất trong nghiên cứu và xử lý dữ liệu
                </p>
              </div>

              <div className="text-center">
                <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Hợp tác</h3>
                <p className="text-gray-600 text-sm">
                  Chúng tôi tin vào sức mạnh của cộng đồng và nghiên cứu hợp tác
                </p>
              </div>

              <div className="text-center">
                <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Đổi mới</h3>
                <p className="text-gray-600 text-sm">
                  Chúng tôi liên tục đẩy lùi ranh giới của công nghệ nghiên cứu
                </p>
              </div>

              <div className="text-center">
                <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart className="h-8 w-8 text-red-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Tác động</h3>
                <p className="text-gray-600 text-sm">
                  Chúng tôi nỗ lực tạo ra sự thay đổi có ý nghĩa thông qua những hiểu biết nghiên cứu
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Core Features */}
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Tính năng chính</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              NCSKIT cung cấp giải pháp nghiên cứu toàn diện cho các thách thức hiện đại
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <FileText className="h-5 w-5 text-blue-600" />
                  Survey Builder AI
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-sm mb-4">
                  Công cụ tạo khảo sát thông minh với AI-powered builder và question bank phong phú.
                </p>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Drag-and-drop survey designer</li>
                  <li>• Logic branching thông minh</li>
                  <li>• Question bank với 1000+ mẫu</li>
                  <li>• Multi-language support</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <BarChart3 className="h-5 w-5 text-green-600" />
                  Advanced Analytics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-sm mb-4">
                  Phân tích thống kê nâng cao với R integration và machine learning insights.
                </p>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• SEM & Factor Analysis</li>
                  <li>• Reliability Analysis</li>
                  <li>• Interactive visualizations</li>
                  <li>• Automated report generation</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Users className="h-5 w-5 text-purple-600" />
                  Team Collaboration
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-sm mb-4">
                  Làm việc nhóm hiệu quả với project management và role-based permissions.
                </p>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Real-time collaboration</li>
                  <li>• Project management tools</li>
                  <li>• Version control system</li>
                  <li>• Team workspace</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Database className="h-5 w-5 text-red-600" />
                  Data Collection
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-sm mb-4">
                  Thu thập dữ liệu hiệu quả với campaign management và quality control.
                </p>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Multi-channel distribution</li>
                  <li>• Real-time monitoring</li>
                  <li>• Quality control algorithms</li>
                  <li>• Response validation</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Brain className="h-5 w-5 text-orange-600" />
                  AI-Powered Insights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-sm mb-4">
                  Trí tuệ nhân tạo hỗ trợ phân tích và tạo insights tự động.
                </p>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Automated pattern detection</li>
                  <li>• Predictive analytics</li>
                  <li>• Natural language processing</li>
                  <li>• Smart recommendations</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Code className="h-5 w-5 text-indigo-600" />
                  Developer API
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-sm mb-4">
                  RESTful API đầy đủ cho developers tích hợp và mở rộng tính năng.
                </p>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• RESTful endpoints</li>
                  <li>• JWT authentication</li>
                  <li>• Comprehensive documentation</li>
                  <li>• SDK support</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Stats */}
        <div className="bg-white">
          <div className="max-w-7xl mx-auto px-6 py-16">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Tác động của chúng tôi</h2>
              <p className="text-gray-600">
                Những con số phản ánh cam kết của chúng tôi đối với sự xuất sắc trong nghiên cứu
              </p>
            </div>

            <div className="grid md:grid-cols-4 gap-8 text-center">
              <div>
                <div className="text-4xl font-bold text-blue-600 mb-2">5K+</div>
                <div className="text-gray-600">Nhà nghiên cứu hoạt động</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-green-600 mb-2">25K+</div>
                <div className="text-gray-600">Khảo sát đã thực hiện</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-purple-600 mb-2">500K+</div>
                <div className="text-gray-600">Phản hồi thu thập</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-red-600 mb-2">50+</div>
                <div className="text-gray-600">Quốc gia phục vụ</div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="max-w-7xl mx-auto px-6 py-16">
          <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
            <CardContent className="text-center py-12">
              <h2 className="text-3xl font-bold mb-4">Tham gia cộng đồng NCSKIT</h2>
              <p className="text-blue-100 mb-8 max-w-2xl mx-auto">
                Bắt đầu hành trình nghiên cứu của bạn ngay hôm nay và kết nối với hàng nghìn nhà nghiên cứu trên toàn thế giới. 
                Trải nghiệm sức mạnh của các công cụ nghiên cứu khảo sát chuyên nghiệp.
              </p>
              <div className="flex justify-center gap-4">
                <Link href="/register">
                  <Button size="lg" variant="secondary">
                    Bắt đầu miễn phí
                  </Button>
                </Link>
                <Link href="/contact">
                  <Button size="lg" variant="outline" className="text-white border-white hover:bg-white hover:text-blue-600">
                    Liên hệ chúng tôi
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
  );
}