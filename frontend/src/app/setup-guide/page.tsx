'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, AlertCircle, ExternalLink, Copy } from 'lucide-react';

export default function SetupGuidePage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🚀 Hướng dẫn Setup NCSKIT
          </h1>
          <p className="text-gray-600">
            Khắc phục lỗi đăng nhập và thiết lập hệ thống
          </p>
        </div>

        {/* Current Issue */}
        <Card className="mb-6 border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="flex items-center text-red-800">
              <AlertCircle className="h-5 w-5 mr-2" />
              Vấn đề hiện tại
            </CardTitle>
          </CardHeader>
          <CardContent className="text-red-700">
            <p className="mb-2">
              <strong>Lỗi:</strong> "Email hoặc mật khẩu không đúng. Vui lòng kiểm tra lại."
            </p>
            <p>
              <strong>Nguyên nhân:</strong> Chưa có users trong database hoặc Supabase chưa được cấu hình.
            </p>
          </CardContent>
        </Card>

        {/* Step 1: Configure Supabase */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-3">1</span>
              Cấu hình Supabase
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Bước 1.1: Tạo project Supabase</h4>
              <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600 ml-4">
                <li>Truy cập <a href="https://supabase.com" target="_blank" className="text-blue-600 hover:underline">https://supabase.com</a></li>
                <li>Tạo project mới hoặc sử dụng project có sẵn</li>
                <li>Vào Settings → API để lấy credentials</li>
              </ol>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Bước 1.2: Lấy thông tin kết nối</h4>
              <div className="bg-gray-100 p-3 rounded-md text-sm">
                <p><strong>Project URL:</strong> https://your-project.supabase.co</p>
                <p><strong>Anon Key:</strong> eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...</p>
                <p><strong>Service Role Key:</strong> eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...</p>
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-2">Bước 1.3: Cập nhật file .env.local</h4>
              <div className="bg-gray-900 text-green-400 p-4 rounded-md text-sm font-mono">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400">frontend/.env.local</span>
                  <Button size="sm" variant="ghost" className="text-gray-400 hover:text-white">
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <pre>{`NEXT_PUBLIC_SUPABASE_URL=https://your-actual-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_actual_anon_key
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=NCSKIT`}</pre>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Step 2: Setup Database */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-3">2</span>
              Thiết lập Database
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Phương án A: Chạy SQL Scripts (Khuyến nghị)</h4>
              <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600 ml-4">
                <li>Vào Supabase Dashboard → SQL Editor</li>
                <li>Chạy các file SQL theo thứ tự:</li>
              </ol>
              <div className="ml-8 mt-2 space-y-1 text-sm">
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                  <code>frontend/database/setup-complete.sql</code>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                  <code>frontend/database/permission-system.sql</code>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                  <code>frontend/database/update-token-system.sql</code>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-2">Phương án B: Sử dụng Script tự động</h4>
              <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600 ml-4">
                <li>Cập nhật credentials trong <code>frontend/create-test-user.js</code></li>
                <li>Chạy: <code className="bg-gray-100 px-2 py-1 rounded">node frontend/create-test-user.js</code></li>
              </ol>
            </div>
          </CardContent>
        </Card>

        {/* Step 3: Create Test Users */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-3">3</span>
              Tạo Test Users
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Cách thủ công (Supabase Dashboard)</h4>
              <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600 ml-4">
                <li>Vào Authentication → Users</li>
                <li>Thêm user: <code>test@ncskit.com</code> / <code>test123</code></li>
                <li>Thêm admin: <code>admin@ncskit.com</code> / <code>admin123</code></li>
                <li>✅ Tích "Auto Confirm User"</li>
              </ol>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
              <h4 className="font-medium text-blue-900 mb-2">Thông tin đăng nhập test:</h4>
              <div className="space-y-1 text-blue-800 text-sm">
                <p><strong>User:</strong> test@ncskit.com / test123</p>
                <p><strong>Admin:</strong> admin@ncskit.com / admin123</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Step 4: Test Connection */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-3">4</span>
              Kiểm tra kết nối
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Chạy script kiểm tra:</h4>
              <div className="bg-gray-900 text-green-400 p-3 rounded-md text-sm font-mono">
                <pre>{`cd frontend
npm install dotenv
node test-connection.js`}</pre>
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-2">Restart development server:</h4>
              <div className="bg-gray-900 text-green-400 p-3 rounded-md text-sm font-mono">
                <pre>{`# Dừng server hiện tại (Ctrl+C)
npm run dev`}</pre>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Step 5: Test Login */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <span className="bg-green-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-3">5</span>
              Test đăng nhập
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Thử đăng nhập tại:</p>
                <p className="text-sm text-gray-600">http://localhost:3000/login</p>
              </div>
              <Link href="/login">
                <Button>
                  Đi đến trang đăng nhập
                  <ExternalLink className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Troubleshooting */}
        <Card className="mb-6 border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="text-yellow-800">
              🔍 Khắc phục sự cố
            </CardTitle>
          </CardHeader>
          <CardContent className="text-yellow-700 space-y-3">
            <div>
              <h4 className="font-medium">Vẫn gặp lỗi đăng nhập?</h4>
              <ul className="list-disc list-inside text-sm ml-4 space-y-1">
                <li>Kiểm tra browser console để xem lỗi chi tiết</li>
                <li>Xác minh Supabase URL chính xác</li>
                <li>Kiểm tra Supabase logs trong dashboard</li>
                <li>Đảm bảo users tồn tại trong Authentication tab</li>
              </ul>
            </div>

            <div>
              <h4 className="font-medium">Environment không load?</h4>
              <ul className="list-disc list-inside text-sm ml-4 space-y-1">
                <li>Restart development server</li>
                <li>Kiểm tra tên file là <code>.env.local</code> (không phải <code>.env</code>)</li>
                <li>Không có khoảng trắng xung quanh dấu <code>=</code></li>
              </ul>
            </div>

            <div>
              <h4 className="font-medium">Lỗi database?</h4>
              <ul className="list-disc list-inside text-sm ml-4 space-y-1">
                <li>Kiểm tra Supabase project đang hoạt động</li>
                <li>Chạy database scripts theo đúng thứ tự</li>
                <li>Kiểm tra table permissions trong Supabase</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Thao tác nhanh</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              <Link href="/login">
                <Button>Thử đăng nhập</Button>
              </Link>
              <Link href="/test-errors">
                <Button variant="outline">Test Error Messages</Button>
              </Link>
              <Button variant="outline" onClick={() => window.open('https://supabase.com', '_blank')}>
                Mở Supabase Dashboard
              </Button>
              <Button variant="outline" onClick={() => window.location.reload()}>
                Reload trang
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-gray-500">
          <p>🎯 Sau khi setup xong, bạn sẽ có thể đăng nhập và sử dụng tất cả tính năng của NCSKIT!</p>
        </div>
      </div>
    </div>
  );
}