'use client'

import { useBrand } from '@/contexts/BrandContext'
import { BrandedHeader } from '@/components/brand/BrandedHeader'

export default function BrandDemoPage() {
  const { brandSettings, isLoading } = useBrand()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <BrandedHeader />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Brand Settings Demo</h1>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Current Brand Settings</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Company Name
                </label>
                <p className="text-lg font-semibold">{brandSettings.companyName}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tagline
                </label>
                <p className="text-gray-600">{brandSettings.tagline}</p>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Primary Color
                  </label>
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-12 h-12 rounded border border-gray-300"
                      style={{ backgroundColor: brandSettings.primaryColor }}
                    ></div>
                    <span className="text-sm text-gray-600">{brandSettings.primaryColor}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Secondary Color
                  </label>
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-12 h-12 rounded border border-gray-300"
                      style={{ backgroundColor: brandSettings.secondaryColor }}
                    ></div>
                    <span className="text-sm text-gray-600">{brandSettings.secondaryColor}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Accent Color
                  </label>
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-12 h-12 rounded border border-gray-300"
                      style={{ backgroundColor: brandSettings.accentColor }}
                    ></div>
                    <span className="text-sm text-gray-600">{brandSettings.accentColor}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold mb-4">Example Components</h2>
            
            <div className="space-y-4">
              <button 
                className="px-6 py-3 text-white rounded-lg font-medium transition-colors"
                style={{ backgroundColor: brandSettings.primaryColor }}
              >
                Primary Button
              </button>

              <button 
                className="px-6 py-3 text-white rounded-lg font-medium transition-colors ml-4"
                style={{ backgroundColor: brandSettings.secondaryColor }}
              >
                Secondary Button
              </button>

              <button 
                className="px-6 py-3 text-white rounded-lg font-medium transition-colors ml-4"
                style={{ backgroundColor: brandSettings.accentColor }}
              >
                Accent Button
              </button>
            </div>

            <div className="mt-6 p-4 rounded-lg" style={{ backgroundColor: `${brandSettings.primaryColor}20` }}>
              <p className="text-sm" style={{ color: brandSettings.primaryColor }}>
                This is an example of using the primary color with transparency for backgrounds.
              </p>
            </div>
          </div>

          <div className="mt-6 text-center">
            <a 
              href="/admin/brand" 
              className="text-blue-600 hover:text-blue-700 underline"
            >
              Go to Brand Settings Admin
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
