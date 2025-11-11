/**
 * Responsive Layout Wrapper
 * Handles mobile/tablet/desktop layout variants with sidebar state management
 */

'use client'

import { useState, useEffect, ReactNode, createContext, useContext } from 'react'
import { useViewport } from '@/hooks/use-viewport'
import { cn } from '@/lib/utils'

interface ResponsiveLayoutProps {
  children: ReactNode
  sidebar?: ReactNode
  header?: ReactNode
  showSidebar?: boolean
  onSidebarToggle?: (isOpen: boolean) => void
  className?: string
}

export function ResponsiveLayout({
  children,
  sidebar,
  header,
  showSidebar = true,
  onSidebarToggle,
  className,
}: ResponsiveLayoutProps) {
  const { isMobile, isTablet, isDesktop } = useViewport()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Auto-close sidebar on mobile when viewport changes
  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false)
    }
  }, [isMobile])

  // Handle sidebar toggle
  const handleSidebarToggle = (isOpen: boolean) => {
    setSidebarOpen(isOpen)
    onSidebarToggle?.(isOpen)
  }

  // Get layout variant based on viewport
  const getLayoutVariant = () => {
    if (isMobile) return 'mobile'
    if (isTablet) return 'tablet'
    return 'desktop'
  }

  const layoutVariant = getLayoutVariant()

  return (
    <SidebarContext.Provider
      value={{
        isOpen: sidebarOpen,
        toggle: handleSidebarToggle,
        variant: layoutVariant,
      }}
    >
      <div className={cn('min-h-screen bg-gray-50', className)}>
        {/* Header */}
        {header && (
          <header className="sticky top-0 z-40 bg-white border-b border-gray-200">
            {header}
          </header>
        )}

        <div className="flex h-[calc(100vh-64px)]">
          {/* Sidebar */}
          {showSidebar && sidebar && (
            <>
              {/* Mobile: Overlay sidebar */}
              {isMobile && (
                <>
                  {/* Backdrop */}
                  {sidebarOpen && (
                    <div
                      className="fixed inset-0 z-30 bg-black bg-opacity-50 transition-opacity"
                      onClick={() => handleSidebarToggle(false)}
                    />
                  )}
                  
                  {/* Sidebar drawer */}
                  <aside
                    className={cn(
                      'fixed inset-y-0 left-0 z-40 w-64 bg-white transform transition-transform duration-300 ease-in-out',
                      sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                    )}
                  >
                    {sidebar}
                  </aside>
                </>
              )}

              {/* Tablet: Collapsible sidebar */}
              {isTablet && (
                <aside
                  className={cn(
                    'flex-shrink-0 bg-white border-r border-gray-200 transition-all duration-300',
                    sidebarOpen ? 'w-64' : 'w-16'
                  )}
                >
                  {sidebar}
                </aside>
              )}

              {/* Desktop: Fixed sidebar */}
              {isDesktop && (
                <aside className="flex-shrink-0 w-64 bg-white border-r border-gray-200">
                  {sidebar}
                </aside>
              )}
            </>
          )}

          {/* Main content */}
          <main className="flex-1 overflow-auto">
            <div className="container-responsive section-responsive">
              {children}
            </div>
          </main>
        </div>
      </div>
    </SidebarContext.Provider>
  )
}

// Sidebar context for child components
interface SidebarContextType {
  isOpen: boolean
  toggle: (isOpen: boolean) => void
  variant: 'mobile' | 'tablet' | 'desktop'
}

const SidebarContext = createContext<SidebarContextType | null>(null)

export function useSidebar() {
  const context = useContext(SidebarContext)
  if (!context) {
    throw new Error('useSidebar must be used within ResponsiveLayout')
  }
  return context
}

// Layout variants for different components
export const LayoutVariants = {
  mobile: {
    sidebar: {
      width: 'w-64',
      position: 'fixed',
      overlay: true,
    },
    content: {
      padding: 'p-4',
      margin: 'ml-0',
    },
  },
  tablet: {
    sidebar: {
      width: 'w-16 hover:w-64',
      position: 'relative',
      overlay: false,
    },
    content: {
      padding: 'p-6',
      margin: 'ml-16',
    },
  },
  desktop: {
    sidebar: {
      width: 'w-64',
      position: 'relative',
      overlay: false,
    },
    content: {
      padding: 'p-8',
      margin: 'ml-64',
    },
  },
} as const

// Helper component for responsive containers
export function ResponsiveContainer({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div className={cn('container-responsive', className)}>
      {children}
    </div>
  )
}

// Helper component for responsive sections
export function ResponsiveSection({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <section className={cn('section-responsive', className)}>
      {children}
    </section>
  )
}

// Smooth transition wrapper
export function SmoothTransition({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div className={cn('transition-responsive', className)}>
      {children}
    </div>
  )
}
