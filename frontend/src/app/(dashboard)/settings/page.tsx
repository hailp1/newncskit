'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeftIcon, CheckCircleIcon, CogIcon, ShieldCheckIcon } from '@heroicons/react/24/outline'
import { useAuthStore } from '@/store/auth'
import ChangePasswordForm from '@/components/auth/change-password-form'
import AdminSettingsPanel from '@/components/admin/admin-settings-panel'
import Link from 'next/link'

const RESEARCH_DOMAINS = [
  'Marketing',
  'Du lịch & Khách sạn',
  'Nhân sự',
  'Hệ thống thông tin quản lý',
  'Tài chính & Ngân hàng',
  'Bán lẻ & Thương mại điện tử',
  'Kinh tế học',
  'Quản trị kinh doanh',
  'Kế toán',
  'Logistics & Supply Chain'
]

export default function SettingsPage() {
  const router = useRouter()
  const { user, updateUser } = useAuthStore()
  
  // Check if user is admin (FORCE ENABLED FOR DEBUG)
  const forceAdmin = true; // TEMPORARY DEBUG FLAG
  const isAdmin = forceAdmin || user?.role === 'admin' || 
                  user?.email === 'admin@ncskit.com' || 
                  user?.email === 'admin@ncskit.org' ||
                  user?.profile?.firstName === 'Admin' ||
                  user?.full_name?.includes('Admin')
  
  // Debug logging
  console.log('🔍 ADMIN DEBUG:', {
    user: user,
    isAdmin: isAdmin,
    role: user?.role,
    email: user?.email,
    firstName: user?.profile?.firstName,
    fullName: user?.full_name
  })
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    firstName: user?.profile.firstName || '',
    lastName: user?.profile.lastName || '',
    email: user?.email || '',
    institution: user?.profile.institution || '',
    orcidId: user?.profile.orcidId || '',
    researchDomain: user?.profile.researchDomain || [],
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setSuccess(false)

    try {
      // Validate passwords if changing
      if (formData.newPassword) {
        if (formData.newPassword !== formData.confirmPassword) {
          throw new Error('Mật khẩu mới không khớp')
        }
        if (formData.newPassword.length < 6) {
          throw new Error('Mật khẩu mới phải có ít nhất 6 ký tự')
        }
        if (!formData.currentPassword) {
          throw new Error('Vui lòng nhập mật khẩu hiện tại')
        }
      }

      // Update profile
      const updatedUser = {
        ...user!,
        email: formData.email,
        profile: {
          ...user!.profile,
          firstName: formData.firstName,
          lastName: formData.lastName,
          institution: formData.institution,
          orcidId: formData.orcidId,
          researchDomain: formData.researchDomain
        }
      }

      // In real app, call API to update user
      // await authService.updateProfile(user!.id, updatedUser.profile)
      // if (formData.newPassword) {
      //   await authService.changePassword(formData.currentPassword, formData.newPassword)
      // }

      // Update local state
      updateUser(updatedUser)
      
      setSuccess(true)
      
      // Clear password fields
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }))

      // Auto hide success message
      setTimeout(() => setSuccess(false), 3000)

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra')
    } finally {
      setIsLoading(false)
    }
  }

  const toggleResearchDomain = (domain: string) => {
    setFormData(prev => ({
      ...prev,
      researchDomain: prev.researchDomain.includes(domain)
        ? prev.researchDomain.filter(d => d !== domain)
        : [...prev.researchDomain, domain]
    }))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeftIcon className="w-4 h-4 mr-2" />
            Quay lại
          </Button>
        </div>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-gray-900">Cài đặt tài khoản</h1>
        <p className="text-gray-600">
          Quản lý thông tin cá nhân và cài đặt bảo mật của bạn
        </p>
      </div>

      {/* Admin Panel */}
      {isAdmin && (
        <AdminSettingsPanel user={user} />
      )}

      {/* Success Message */}
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-md p-4">
          <div className="flex items-center">
            <CheckCircleIcon className="w-5 h-5 text-green-600 mr-2" />
            <span className="text-green-800">Cập nhật thông tin thành công!</span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Information */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Thông tin cá nhân</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Họ *</label>
                    <Input
                      value={formData.firstName}
                      onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                      placeholder="Nhập họ"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Tên *</label>
                    <Input
                      value={formData.lastName}
                      onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                      placeholder="Nhập tên"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Email *</label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="email@example.com"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Tổ chức/Trường học</label>
                  <Input
                    value={formData.institution}
                    onChange={(e) => setFormData(prev => ({ ...prev, institution: e.target.value }))}
                    placeholder="VD: Đại học Kinh tế TP.HCM"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">ORCID ID</label>
                  <Input
                    value={formData.orcidId}
                    onChange={(e) => setFormData(prev => ({ ...prev, orcidId: e.target.value }))}
                    placeholder="0000-0000-0000-0000"
                  />
                  <p className="text-xs text-gray-500">
                    ORCID ID giúp định danh duy nhất cho các nhà nghiên cứu
                  </p>
                </div>

                {/* Research Domains */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Lĩnh vực nghiên cứu</label>
                  <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto border rounded-md p-3">
                    {RESEARCH_DOMAINS.map((domain) => (
                      <label key={domain} className="flex items-center space-x-2 text-sm">
                        <input
                          type="checkbox"
                          checked={formData.researchDomain.includes(domain)}
                          onChange={() => toggleResearchDomain(domain)}
                          className="rounded border-gray-300"
                        />
                        <span>{domain}</span>
                      </label>
                    ))}
                  </div>
                </div>



                {/* Error Display */}
                {error && (
                  <div className="p-3 text-sm text-red-500 bg-red-50 border border-red-200 rounded-md">
                    {error}
                  </div>
                )}

                {/* Submit Button */}
                <div className="flex gap-3 pt-4">
                  <Button type="submit" disabled={isLoading} className="flex-1">
                    {isLoading ? 'Đang cập nhật...' : 'Lưu thay đổi'}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => router.back()}>
                    Hủy
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Account Summary */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Tóm tắt tài khoản</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-900">Loại tài khoản</p>
                <p className="text-sm text-gray-600">
                  {user?.subscription?.type || 'Free'}
                  {isAdmin && (
                    <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                      Admin
                    </span>
                  )}
                </p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-900">Ngày tạo</p>
                <p className="text-sm text-gray-600">
                  {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('vi-VN') : 'N/A'}
                </p>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-900">Lần cập nhật cuối</p>
                <p className="text-sm text-gray-600">
                  {user?.updatedAt ? new Date(user.updatedAt).toLocaleDateString('vi-VN') : 'N/A'}
                </p>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-900">Số dự án</p>
                <p className="text-sm text-gray-600">0 dự án</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tính năng</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Tạo đề cương AI</span>
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Có</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Tạo survey</span>
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Có</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Phân tích dữ liệu</span>
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Sắp có</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Xuất báo cáo</span>
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Sắp có</span>
              </div>
            </CardContent>
          </Card>

          {/* Change Password Section */}
          <ChangePasswordForm />
        </div>
      </div>
    </div>
  )
}