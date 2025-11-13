'use client';

import React from 'react';
import { IllustrationPanel } from './illustration-panel';

interface AuthLayoutProps {
  children: React.ReactNode;
  mode: 'login' | 'register';
  illustrationContent?: React.ReactNode;
}

/**
 * AuthLayout Component
 * 
 * Provides a split-screen layout for authentication pages:
 * - Desktop (≥1024px): Two-column grid (40% form, 60% illustration)
 * - Tablet (768px-1023px): Single-column layout (illustration hidden)
 * - Mobile (<768px): Single-column layout (illustration hidden)
 * 
 * Requirements: 1.1, 1.2, 2.1, 2.3, 8.1, 8.5
 */
export const AuthLayout: React.FC<AuthLayoutProps> = ({
  children,
  mode,
  illustrationContent,
}) => {
  return (
    <div className="min-h-screen flex flex-col lg:grid lg:grid-cols-[40%_60%] transition-all duration-300 bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/30">
      {/* Form Panel - Left side on desktop, full width on mobile/tablet */}
      <main 
        className="flex items-center justify-center px-4 py-8 sm:py-12 sm:px-6 md:px-8 lg:px-12 bg-white/80 backdrop-blur-sm transition-all duration-300 relative"
        role="main"
        aria-label={mode === 'login' ? 'Biểu mẫu đăng nhập' : 'Biểu mẫu đăng ký'}
      >
        {/* Decorative background */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(59,130,246,0.3)_1px,transparent_0)] bg-[size:30px_30px]"></div>
        </div>
        
        <div className="w-full max-w-md space-y-4 sm:space-y-6 relative z-10">
          {children}
        </div>
      </main>

      {/* Illustration Panel - Right side on desktop only, hidden on mobile/tablet */}
      <aside 
        className="hidden lg:flex lg:items-center lg:justify-center transition-all duration-300"
        aria-label="Giới thiệu tính năng nền tảng"
      >
        {illustrationContent || <IllustrationPanel mode={mode} />}
      </aside>
    </div>
  );
};
