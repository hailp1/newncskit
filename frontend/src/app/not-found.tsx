import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full text-center space-y-8">
        <div className="space-y-4">
          <div className="text-6xl font-bold text-blue-600">404</div>
          <h1 className="text-2xl font-bold text-gray-900">
            Trang không tồn tại
          </h1>
          <p className="text-gray-600">
            Xin lỗi, chúng tôi không thể tìm thấy trang bạn đang tìm kiếm.
          </p>
        </div>

        <div className="space-y-4">
          <Link href="/">
            <Button className="w-full">
              Về trang chủ
            </Button>
          </Link>
          
          <Link href="/dashboard">
            <Button variant="outline" className="w-full">
              Về dashboard
            </Button>
          </Link>
        </div>

        <div className="text-sm text-gray-500">
          <p>
            Nếu bạn nghĩ đây là lỗi, vui lòng{' '}
            <Link href="/contact" className="text-blue-600 hover:text-blue-500">
              liên hệ với chúng tôi
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}