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
    <div className="min-h-screen flex flex-col lg:grid lg:grid-cols-[40%_60%] transition-all duration-300">
      {/* Form Panel - Left side on desktop, full width on mobile/tablet */}
      <main 
        className="flex items-center justify-center px-4 py-8 sm:py-12 sm:px-6 md:px-8 lg:px-8 bg-white transition-all duration-300"
        role="main"
        aria-label={mode === 'login' ? 'Biểu mẫu đăng nhập' : 'Biểu mẫu đăng ký'}
      >
        <div className="w-full max-w-md space-y-4 sm:space-y-6">
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
