/**
 * OAuth Fallback Instructions Component
 * Provides helpful instructions when OAuth fails due to popup blockers or other issues
 */

import { Alert, AlertDescription } from '@/components/ui/alert'
import { Info } from 'lucide-react'

interface OAuthFallbackInstructionsProps {
  provider: 'google' | 'linkedin'
  errorType: 'popup_blocked' | 'access_denied' | 'general'
}

export function OAuthFallbackInstructions({ provider, errorType }: OAuthFallbackInstructionsProps) {
  const providerName = provider === 'google' ? 'Google' : 'LinkedIn'

  const getInstructions = () => {
    switch (errorType) {
      case 'popup_blocked':
        return {
          title: 'Cửa sổ đăng nhập bị chặn',
          steps: [
            'Nhấp vào biểu tượng popup bị chặn trên thanh địa chỉ trình duyệt',
            'Chọn "Luôn cho phép popup từ trang này"',
            'Nhấp lại vào nút đăng nhập ' + providerName,
          ],
        }
      case 'access_denied':
        return {
          title: 'Quyền truy cập bị từ chối',
          steps: [
            'Đảm bảo bạn đã cấp quyền truy cập email cho ứng dụng',
            'Kiểm tra cài đặt quyền riêng tư trong tài khoản ' + providerName,
            'Thử đăng nhập lại và chấp nhận các quyền được yêu cầu',
          ],
        }
      default:
        return {
          title: 'Đăng nhập ' + providerName + ' thất bại',
          steps: [
            'Kiểm tra kết nối internet của bạn',
            'Đảm bảo bạn đã đăng nhập vào tài khoản ' + providerName,
            'Thử xóa cookie và cache trình duyệt',
            'Hoặc sử dụng email và mật khẩu để đăng nhập',
          ],
        }
    }
  }

  const instructions = getInstructions()

  return (
    <Alert className="bg-blue-50 border-blue-200 text-blue-900">
      <Info className="h-4 w-4 text-blue-600" />
      <AlertDescription>
        <div className="space-y-2">
          <p className="font-medium">{instructions.title}</p>
          <ol className="list-decimal list-inside space-y-1 text-sm">
            {instructions.steps.map((step, index) => (
              <li key={index}>{step}</li>
            ))}
          </ol>
        </div>
      </AlertDescription>
    </Alert>
  )
}
