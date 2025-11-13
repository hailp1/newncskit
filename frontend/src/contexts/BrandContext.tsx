'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'

interface BrandSettings {
  logo?: string | null
  logoHeight?: number
  logoFooter?: string | null
  logoFooterHeight?: number
  favicon?: string | null
  primaryColor: string
  secondaryColor: string
  accentColor: string
  companyName: string
  tagline: string
}

interface BrandContextType {
  brandSettings: BrandSettings
  isLoading: boolean
  refreshBrandSettings: () => Promise<void>
}

const defaultBrandSettings: BrandSettings = {
  primaryColor: '#2563EB',
  secondaryColor: '#10B981',
  accentColor: '#F59E0B',
  companyName: 'NCSKit',
  tagline: 'Nền tảng phân tích dữ liệu nghiên cứu khoa học',
  logoHeight: 40,
  logoFooterHeight: 32
}

const BrandContext = createContext<BrandContextType>({
  brandSettings: defaultBrandSettings,
  isLoading: true,
  refreshBrandSettings: async () => {}
})

export function BrandProvider({ children }: { children: ReactNode }) {
  const [brandSettings, setBrandSettings] = useState<BrandSettings>(defaultBrandSettings)
  const [isLoading, setIsLoading] = useState(true)

  const loadBrandSettings = async () => {
    try {
      const response = await fetch('/api/brand/public')
      if (response.ok) {
        const data = await response.json()
        if (data.settings) {
          setBrandSettings(data.settings)
          
          // Apply CSS variables for colors
          if (typeof document !== 'undefined') {
            document.documentElement.style.setProperty('--color-primary', data.settings.primaryColor)
            document.documentElement.style.setProperty('--color-secondary', data.settings.secondaryColor)
            document.documentElement.style.setProperty('--color-accent', data.settings.accentColor)
            
            // Update document title
            document.title = data.settings.companyName
            
            // Update favicon if set
            if (data.settings.favicon) {
              let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement
              if (!link) {
                link = document.createElement('link')
                link.rel = 'icon'
                document.head.appendChild(link)
              }
              link.href = data.settings.favicon
            }
          }
        }
      }
    } catch (error) {
      console.error('Error loading brand settings:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadBrandSettings()
  }, [])

  const refreshBrandSettings = async () => {
    setIsLoading(true)
    await loadBrandSettings()
  }

  return (
    <BrandContext.Provider value={{ brandSettings, isLoading, refreshBrandSettings }}>
      {children}
    </BrandContext.Provider>
  )
}

export function useBrand() {
  const context = useContext(BrandContext)
  if (!context) {
    throw new Error('useBrand must be used within a BrandProvider')
  }
  return context
}
