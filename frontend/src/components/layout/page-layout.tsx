'use client';

import React from 'react';
import { Header } from './header';
import { Footer } from './footer';

interface PageLayoutProps {
  children: React.ReactNode;
  className?: string;
  showHeader?: boolean;
  showFooter?: boolean;
}

export default function PageLayout({ 
  children, 
  className = "", 
  showHeader = true, 
  showFooter = true 
}: PageLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      {showHeader && <Header />}
      <main className={`flex-1 ${className}`}>
        {children}
      </main>
      {showFooter && <Footer />}
    </div>
  );
}