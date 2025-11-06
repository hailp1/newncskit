'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
  showBackButton?: boolean;
}

export default function AuthLayout({ 
  children, 
  title, 
  subtitle,
  showBackButton = true 
}: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header with back button */}
      {showBackButton && (
        <div className="absolute top-6 left-6 z-10">
          <Link 
            href="/" 
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="text-sm font-medium">Back to Home</span>
          </Link>
        </div>
      )}

      {/* Main content */}
      <div className="flex items-center justify-center min-h-screen py-12 px-4">
        <div className="max-w-md w-full space-y-8">
          
          {/* Header */}
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 rounded-2xl shadow-lg">
                <div className="text-white text-2xl font-bold">NCSKIT</div>
              </div>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{title}</h1>
            <p className="text-gray-600">{subtitle}</p>
          </div>

          {/* Content */}
          {children}

          {/* Footer */}
          <div className="text-center space-y-2">
            <p className="text-xs text-gray-500">
              Secure authentication powered by industry-standard encryption
            </p>
            <div className="flex justify-center space-x-4 text-xs text-gray-400">
              <Link href="/privacy" className="hover:text-gray-600 transition-colors">
                Privacy Policy
              </Link>
              <span>•</span>
              <Link href="/terms" className="hover:text-gray-600 transition-colors">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}