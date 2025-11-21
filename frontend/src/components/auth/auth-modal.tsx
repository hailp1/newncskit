'use client'

import { useEffect, useState, useRef } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import { VisuallyHidden } from '@radix-ui/react-visually-hidden'
import { useAuthModal } from '@/hooks/use-auth-modal'
import { AuthForm } from './auth-form'

export function AuthModal() {
  const { isOpen, mode, close, setMode } = useAuthModal()
  const [isModeSwitching, setIsModeSwitching] = useState(false)
  const previousFocusRef = useRef<HTMLElement | null>(null)

  // Prevent body scroll when modal is open and manage focus
  useEffect(() => {
    if (isOpen) {
      // Store the currently focused element
      previousFocusRef.current = document.activeElement as HTMLElement
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
      
      // Restore focus to the element that opened the modal
      if (previousFocusRef.current) {
        // Small delay to ensure modal is fully closed
        setTimeout(() => {
          previousFocusRef.current?.focus()
        }, 100)
      }
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  const handleSuccess = () => {
    close()
  }

  const handleModeChange = (newMode: 'login' | 'register') => {
    // Trigger mode switching animation
    setIsModeSwitching(true)
    
    // Wait for fade out before changing mode
    setTimeout(() => {
      setMode(newMode)
      // Fade back in
      setTimeout(() => {
        setIsModeSwitching(false)
      }, 50)
    }, 200)
  }

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && close()}>
      <Dialog.Portal>
        {/* Backdrop with fade animation */}
        <Dialog.Overlay 
          className="fixed inset-0 bg-black/50 z-50 transition-opacity duration-300 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" 
          style={{ willChange: 'opacity' }}
        />
        
        {/* Modal Content with scale and fade animation */}
        <Dialog.Content
          className="fixed left-[50%] top-[50%] z-50 w-[calc(100%-2rem)] sm:w-full max-w-md translate-x-[-50%] translate-y-[-50%] bg-white rounded-lg shadow-2xl focus:outline-none p-4 sm:p-6 max-h-[90vh] overflow-y-auto transition-all duration-300 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]"
          aria-describedby={undefined}
          aria-label={mode === 'login' ? 'Đăng nhập' : 'Đăng ký'}
          role="dialog"
          aria-modal="true"
          style={{ willChange: 'transform, opacity' }}
        >
          <VisuallyHidden>
            <Dialog.Title>
              {mode === 'login' ? 'Đăng nhập vào NCSKIT' : 'Tạo tài khoản NCSKIT'}
            </Dialog.Title>
          </VisuallyHidden>
          {/* Close Button */}
          <Dialog.Close
            className="absolute right-3 top-3 sm:right-4 sm:top-4 rounded-sm opacity-70 ring-offset-white transition-all duration-200 hover:opacity-100 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:pointer-events-none min-w-[44px] min-h-[44px] flex items-center justify-center"
            aria-label="Close"
          >
            <X className="h-5 w-5 sm:h-4 sm:w-4" />
          </Dialog.Close>

          {/* Auth Form with mode switching animation */}
          <div 
            className={`transition-all duration-200 ${
              isModeSwitching 
                ? 'opacity-0 scale-95' 
                : 'opacity-100 scale-100'
            }`}
            style={{ willChange: 'opacity, transform' }}
          >
            <AuthForm
              mode={mode}
              onModeChange={handleModeChange}
              onSuccess={handleSuccess}
              isModal={true}
            />
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
