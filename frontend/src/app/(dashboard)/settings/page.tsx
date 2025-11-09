'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeftIcon, CheckCircleIcon, CogIcon, ShieldCheckIcon } from '@heroicons/react/24/outline'
import { useAuthStore } from '@/store/auth'
import { ChangePasswordForm } from '@/components/auth/change-password-form'
import AdminSettingsPanel from '@/components/admin/admin-settings-panel'
import Link from 'next/link'
import { profileService, UserProfile } from '@/services/profile.service'
import { Validator } from '@/services/validator'

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
  
  // Check if user is admin
  const isAdmin = user?.role === 'admin' || 
                  user?.email === 'admin@ncskit.com' || 
                  user?.email === 'admin@ncskit.org' ||
                  user?.profile?.firstName === 'Admin'
  
  const [isLoading, setIsLoading] = useState(false)
  const [isFetching, setIsFetching] = useState(true)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    institution: '',
    orcidId: '',
    researchDomains: [] as string[],
  })

  // Load profile data on mount
  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    try {
      setIsFetching(true)
      const profileData = await profileService.getProfile()
      setProfile(profileData)
      
      // Populate form with profile data
      setFormData({
        fullName: profileData.full_name || '',
        email: profileData.email || '',
        institution: profileData.institution || '',
        orcidId: profileData.orcid_id || '',
        researchDomains: profileData.research_domains || [],
      })
    } catch (err) {
      console.error('Failed to load profile:', err)
      setError(err instanceof Error ? err.message : 'Không thể tải thông tin cá nhân')
    } finally {
      setIsFetching(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setSuccess(false)

    try {
      // Validate all inputs before save
      if (formData.fullName.trim()) {
        const nameValidation = Validator.validateName(formData.fullName)
        if (!nameValidation.isValid) {
          throw new Error(nameValidation.error || 'Tên không hợp lệ')
        }
      }

      if (formData.email.trim()) {
        if (!Validator.validateEmail(formData.email)) {
          throw new Error('Email không hợp lệ')
        }
      }

      if (formData.orcidId.trim()) {
        if (!Validator.validateOrcidId(formData.orcidId)) {
          throw new Error('ORCID ID không hợp lệ. Định dạng: 0000-0000-0000-000X')
        }
      }

      if (formData.institution.trim()) {
        const institutionValidation = Validator.validateInstitution(formData.institution)
        if (!institutionValidation.isValid) {
          throw new Error(institutionValidation.error || 'Tên tổ chức không hợp lệ')
        }
      }

      if (formData.researchDomains.length > 0) {
        const domainsValidation = Validator.validateResearchDomains(formData.researchDomains)
        if (!domainsValidation.isValid) {
          throw new Error(domainsValidation.error || 'Lĩnh vực nghiên cứu không hợp lệ')
        }
      }

      // Call ProfileService to update profile
      const updatedProfile = await profileService.updateProfile({
        full_name: formData.fullName.trim() || null,
        institution: formData.institution.trim() || null,
        orcid_id: formData.orcidId.trim() || null,
        research_domains: formData.researchDomains.length > 0 ? formData.researchDomains : null,
      })

      // Update local profile state
      setProfile(updatedProfile)
      
      setSuccess(true)

      // Auto hide success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000)

    } catch (err) {
      console.error('Profile update error:', err)
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra khi cập nhật thông tin')
    } finally {
      setIsLoading(false)
    }
  }

  const toggleResearchDomain = (domain: string) => {
    setFormData(prev => ({
      ...prev,
      researchDomains: prev.researchDomains.includes(domain)
        ? prev.researchDomains.filter(d => d !== domain)
        : [...prev.researchDomains, domain]
    }))
  }

  // Show loading state while fetching profile
  if (isFetching) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải thông tin...</p>
        </div>
      </div>
    )
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
      {isAdmin && user && (
        <AdminSettingsPanel user={user as any} />
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
                <div className="space-y-2">
                  <label className="text-sm font-medium">Họ và tên</label>
                  <Input
                    value={formData.fullName}
                    onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                    placeholder="Nhập họ và tên đầy đủ"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Email</label>
                  <Input
                    type="email"
                    value={formData.email}
                    disabled
                    className="bg-gray-50 cursor-not-allowed"
                    placeholder="email@example.com"
                  />
                  <p className="text-xs text-gray-500">
                    Email không thể thay đổi
                  </p>
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
                          checked={formData.researchDomains.includes(domain)}
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
                  {profile?.subscription_type === 'free' && 'Miễn phí'}
                  {profile?.subscription_type === 'premium' && 'Premium'}
                  {profile?.subscription_type === 'institutional' && 'Tổ chức'}
                  {!profile?.subscription_type && 'Miễn phí'}
                  {profile?.role && ['admin', 'super_admin'].includes(profile.role) && (
                    <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                      Admin
                    </span>
                  )}
                </p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-900">Trạng thái</p>
                <p className="text-sm text-gray-600">
                  {profile?.is_active ? (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Đang hoạt động
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      Tạm khóa
                    </span>
                  )}
                </p>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-900">Ngày tạo</p>
                <p className="text-sm text-gray-600">
                  {profile?.created_at ? new Date(profile.created_at).toLocaleDateString('vi-VN') : 'Không xác định'}
                </p>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-900">Lần cập nhật cuối</p>
                <p className="text-sm text-gray-600">
                  {profile?.updated_at ? new Date(profile.updated_at).toLocaleDateString('vi-VN') : 'Không xác định'}
                </p>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-900">Đăng nhập lần cuối</p>
                <p className="text-sm text-gray-600">
                  {profile?.last_login_at ? new Date(profile.last_login_at).toLocaleDateString('vi-VN') : 'Không xác định'}
                </p>
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