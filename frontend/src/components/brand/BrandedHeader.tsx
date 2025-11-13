'use client'

import { useBrand } from '@/contexts/BrandContext'

export function BrandedHeader() {
  const { brandSettings, isLoading } = useBrand()

  if (isLoading) {
    return (
      <div className="h-16 bg-gray-100 animate-pulse"></div>
    )
  }

  return (
    <header 
      className="py-4 px-6 shadow-sm"
      style={{ backgroundColor: brandSettings.primaryColor }}
    >
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center gap-4">
          {brandSettings.logo && (
            <img 
              src={brandSettings.logo} 
              alt={brandSettings.companyName}
              className="w-auto"
              style={{ height: `${brandSettings.logoHeight || 40}px` }}
            />
          )}
          <div>
            <h1 className="text-xl font-bold text-white">
              {brandSettings.companyName}
            </h1>
            <p className="text-sm text-white/80">
              {brandSettings.tagline}
            </p>
          </div>
        </div>
      </div>
    </header>
  )
}
