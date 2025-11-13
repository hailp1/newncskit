'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useBrand } from '@/contexts/BrandContext'
import { 
  PaintBrushIcon, 
  PhotoIcon,
  SwatchIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline'

interface BrandSettings {
  logo?: string
  logoHeight?: number
  logoFooter?: string
  logoFooterHeight?: number
  favicon?: string
  primaryColor: string
  secondaryColor: string
  accentColor: string
  companyName: string
  tagline: string
}

export default function AdminBrandPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { refreshBrandSettings } = useBrand()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  
  const [brandSettings, setBrandSettings] = useState<BrandSettings>({
    primaryColor: '#2563EB',
    secondaryColor: '#10B981',
    accentColor: '#F59E0B',
    companyName: 'NCSKit',
    tagline: 'Nền tảng phân tích dữ liệu nghiên cứu khoa học',
    logoHeight: 40,
    logoFooterHeight: 32
  })

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login')
      return
    }

    if (status === 'authenticated') {
      // Check if user is admin
      if (session?.user?.role !== 'admin') {
        router.push('/dashboard')
        return
      }

      // Load brand settings
      loadBrandSettings()
    }
  }, [status, session, router])

  const loadBrandSettings = async () => {
    try {
      const response = await fetch('/api/admin/brand')
      if (response.ok) {
        const data = await response.json()
        if (data.settings) {
          setBrandSettings(data.settings)
        }
      }
    } catch (error) {
      console.error('Error loading brand settings:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    setMessage(null)

    try {
      const response = await fetch('/api/admin/brand', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(brandSettings),
      })

      if (response.ok) {
        setMessage({ type: 'success', text: 'Đã lưu cài đặt thương hiệu thành công!' })
        // Refresh brand settings globally
        await refreshBrandSettings()
      } else {
        throw new Error('Failed to save brand settings')
      }
    } catch (error) {
      console.error('Error saving brand settings:', error)
      setMessage({ type: 'error', text: 'Có lỗi xảy ra khi lưu cài đặt. Vui lòng thử lại.' })
    } finally {
      setIsSaving(false)
    }
  }

  const handleImageUpload = async (type: 'logo' | 'favicon', file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('type', type)

    try {
      const response = await fetch('/api/admin/brand/upload', {
        method: 'POST',
        body: formData,
      })

      if (response.ok) {
        const data = await response.json()
        setBrandSettings(prev => ({
          ...prev,
          [type]: data.url
        }))
        setMessage({ type: 'success', text: `Đã tải lên ${type === 'logo' ? 'logo' : 'favicon'} thành công!` })
      } else {
        throw new Error('Upload failed')
      }
    } catch (error) {
      console.error('Error uploading image:', error)
      setMessage({ type: 'error', text: 'Có lỗi xảy ra khi tải lên hình ảnh.' })
    }
  }

  if (status === 'loading' || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <PaintBrushIcon className="h-8 w-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900">Quản lý Thương hiệu</h1>
        </div>
        <p className="text-gray-600">
          Tùy chỉnh logo, màu sắc và giao diện hệ thống
        </p>
      </div>

      {/* Message */}
      {message && (
        <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
          message.type === 'success' 
            ? 'bg-green-50 text-green-800 border border-green-200' 
            : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {message.type === 'success' ? (
            <CheckCircleIcon className="h-5 w-5" />
          ) : (
            <XCircleIcon className="h-5 w-5" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Company Information */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Thông tin Công ty</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tên công ty
            </label>
            <input
              type="text"
              value={brandSettings.companyName}
              onChange={(e) => setBrandSettings(prev => ({ ...prev, companyName: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="NCSKit"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Slogan / Tagline
            </label>
            <input
              type="text"
              value={brandSettings.tagline}
              onChange={(e) => setBrandSettings(prev => ({ ...prev, tagline: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Nền tảng phân tích dữ liệu nghiên cứu khoa học"
            />
          </div>
        </div>
      </div>

      {/* Logo & Favicon */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <PhotoIcon className="h-6 w-6" />
          Logo & Favicon
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Logo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Logo
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              {brandSettings.logo ? (
                <div className="space-y-3">
                  <img 
                    src={brandSettings.logo} 
                    alt="Logo" 
                    className="max-h-24 mx-auto"
                  />
                  <button
                    onClick={() => setBrandSettings(prev => ({ ...prev, logo: undefined }))}
                    className="text-sm text-red-600 hover:text-red-700"
                  >
                    Xóa logo
                  </button>
                </div>
              ) : (
                <div>
                  <PhotoIcon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 mb-2">Chưa có logo</p>
                  <label className="cursor-pointer inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    Tải lên logo
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) handleImageUpload('logo', file)
                      }}
                    />
                  </label>
                </div>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Khuyến nghị: PNG hoặc SVG, tối đa 2MB
            </p>
            
            {/* Logo Height Slider */}
            {brandSettings.logo && (
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Chiều cao logo trong header: {brandSettings.logoHeight || 40}px
                </label>
                <input
                  type="range"
                  min="20"
                  max="80"
                  value={brandSettings.logoHeight || 40}
                  onChange={(e) => setBrandSettings(prev => ({ ...prev, logoHeight: parseInt(e.target.value) }))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>20px</span>
                  <span>80px</span>
                </div>
              </div>
            )}
          </div>

          {/* Favicon */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Favicon
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              {brandSettings.favicon ? (
                <div className="space-y-3">
                  <img 
                    src={brandSettings.favicon} 
                    alt="Favicon" 
                    className="h-16 w-16 mx-auto"
                  />
                  <button
                    onClick={() => setBrandSettings(prev => ({ ...prev, favicon: undefined }))}
                    className="text-sm text-red-600 hover:text-red-700"
                  >
                    Xóa favicon
                  </button>
                </div>
              ) : (
                <div>
                  <PhotoIcon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 mb-2">Chưa có favicon</p>
                  <label className="cursor-pointer inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    Tải lên favicon
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) handleImageUpload('favicon', file)
                      }}
                    />
                  </label>
                </div>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Khuyến nghị: ICO hoặc PNG 32x32px
            </p>
          </div>
        </div>
      </div>

      {/* Logo Footer */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <PhotoIcon className="h-6 w-6" />
          Logo Footer (Tùy chọn)
        </h2>
        <p className="text-sm text-gray-600 mb-4">
          Nếu bạn muốn sử dụng logo khác cho footer, tải lên ở đây. Nếu không, logo header sẽ được sử dụng.
        </p>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Logo Footer
          </label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            {brandSettings.logoFooter ? (
              <div className="space-y-3">
                <img 
                  src={brandSettings.logoFooter} 
                  alt="Logo Footer" 
                  className="max-h-24 mx-auto"
                />
                <button
                  onClick={() => setBrandSettings(prev => ({ ...prev, logoFooter: undefined }))}
                  className="text-sm text-red-600 hover:text-red-700"
                >
                  Xóa logo footer
                </button>
              </div>
            ) : (
              <div>
                <PhotoIcon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600 mb-2">Chưa có logo footer</p>
                <label className="cursor-pointer inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  Tải lên logo footer
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) {
                        const formData = new FormData()
                        formData.append('file', file)
                        formData.append('type', 'logo-footer')
                        
                        fetch('/api/admin/brand/upload', {
                          method: 'POST',
                          body: formData,
                        }).then(res => res.json()).then(data => {
                          if (data.url) {
                            setBrandSettings(prev => ({ ...prev, logoFooter: data.url }))
                            setMessage({ type: 'success', text: 'Đã tải lên logo footer thành công!' })
                          }
                        }).catch(error => {
                          console.error('Error uploading logo footer:', error)
                          setMessage({ type: 'error', text: 'Có lỗi xảy ra khi tải lên logo footer.' })
                        })
                      }
                    }}
                  />
                </label>
              </div>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Khuyến nghị: PNG hoặc SVG, tối đa 2MB
          </p>
          
          {/* Logo Footer Height Slider */}
          {brandSettings.logoFooter && (
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Chiều cao logo footer: {brandSettings.logoFooterHeight || 32}px
              </label>
              <input
                type="range"
                min="20"
                max="60"
                value={brandSettings.logoFooterHeight || 32}
                onChange={(e) => setBrandSettings(prev => ({ ...prev, logoFooterHeight: parseInt(e.target.value) }))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>20px</span>
                <span>60px</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Color Scheme */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <SwatchIcon className="h-6 w-6" />
          Bảng màu
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Primary Color */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Màu chính (Primary)
            </label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={brandSettings.primaryColor}
                onChange={(e) => setBrandSettings(prev => ({ ...prev, primaryColor: e.target.value }))}
                className="h-12 w-12 rounded border border-gray-300 cursor-pointer"
              />
              <input
                type="text"
                value={brandSettings.primaryColor}
                onChange={(e) => setBrandSettings(prev => ({ ...prev, primaryColor: e.target.value }))}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="#3B82F6"
              />
            </div>
          </div>

          {/* Secondary Color */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Màu phụ (Secondary)
            </label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={brandSettings.secondaryColor}
                onChange={(e) => setBrandSettings(prev => ({ ...prev, secondaryColor: e.target.value }))}
                className="h-12 w-12 rounded border border-gray-300 cursor-pointer"
              />
              <input
                type="text"
                value={brandSettings.secondaryColor}
                onChange={(e) => setBrandSettings(prev => ({ ...prev, secondaryColor: e.target.value }))}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="#10B981"
              />
            </div>
          </div>

          {/* Accent Color */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Màu nhấn (Accent)
            </label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={brandSettings.accentColor}
                onChange={(e) => setBrandSettings(prev => ({ ...prev, accentColor: e.target.value }))}
                className="h-12 w-12 rounded border border-gray-300 cursor-pointer"
              />
              <input
                type="text"
                value={brandSettings.accentColor}
                onChange={(e) => setBrandSettings(prev => ({ ...prev, accentColor: e.target.value }))}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="#F59E0B"
              />
            </div>
          </div>
        </div>

        {/* Color Preview */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <p className="text-sm font-medium text-gray-700 mb-3">Xem trước màu sắc:</p>
          <div className="flex gap-4">
            <div className="flex-1 text-center">
              <div 
                className="h-20 rounded-lg mb-2"
                style={{ backgroundColor: brandSettings.primaryColor }}
              ></div>
              <p className="text-xs text-gray-600">Primary</p>
            </div>
            <div className="flex-1 text-center">
              <div 
                className="h-20 rounded-lg mb-2"
                style={{ backgroundColor: brandSettings.secondaryColor }}
              ></div>
              <p className="text-xs text-gray-600">Secondary</p>
            </div>
            <div className="flex-1 text-center">
              <div 
                className="h-20 rounded-lg mb-2"
                style={{ backgroundColor: brandSettings.accentColor }}
              ></div>
              <p className="text-xs text-gray-600">Accent</p>
            </div>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end gap-3">
        <button
          onClick={() => router.push('/admin')}
          className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Hủy
        </button>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {isSaving ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Đang lưu...
            </>
          ) : (
            'Lưu thay đổi'
          )}
        </button>
      </div>
    </div>
  )
}
