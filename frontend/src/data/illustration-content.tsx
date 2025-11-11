/**
 * Illustration content for authentication pages
 * Contains slides for login and register modes
 * Uses lazy loading for better performance
 */

'use client';

import { lazy, Suspense } from 'react';
import { IllustrationContent } from '@/types/illustration';

// Lazy load illustration components for code splitting
const WelcomeIllustration = lazy(() => import('@/components/auth/illustrations/welcome-illustration').then(m => ({ default: m.WelcomeIllustration })));
const StatsChart = lazy(() => import('@/components/auth/illustrations/stats-chart').then(m => ({ default: m.StatsChart })));
const FeaturesShowcase = lazy(() => import('@/components/auth/illustrations/features-showcase').then(m => ({ default: m.FeaturesShowcase })));
const JoinIllustration = lazy(() => import('@/components/auth/illustrations/join-illustration').then(m => ({ default: m.JoinIllustration })));
const CapabilitiesChart = lazy(() => import('@/components/auth/illustrations/capabilities-chart').then(m => ({ default: m.CapabilitiesChart })));
const TestimonialCard = lazy(() => import('@/components/auth/illustrations/testimonial-card').then(m => ({ default: m.TestimonialCard })));

// Loading fallback component
const IllustrationLoader = () => (
  <div className="flex items-center justify-center h-full p-8">
    <div className="w-48 h-48 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl animate-pulse" />
  </div>
);

// Wrapper component for lazy-loaded illustrations
const LazyIllustration = ({ Component }: { Component: React.LazyExoticComponent<React.FC> }) => (
  <Suspense fallback={<IllustrationLoader />}>
    <Component />
  </Suspense>
);

// Export illustration content data
export const illustrationContent: IllustrationContent = {
  login: [
    {
      id: 'welcome',
      type: 'feature',
      title: 'Chào mừng trở lại',
      description: 'Tiếp tục nghiên cứu của bạn',
      content: <LazyIllustration Component={WelcomeIllustration} />
    },
    {
      id: 'stats',
      type: 'chart',
      title: 'Phân tích dữ liệu mạnh mẽ',
      description: 'Hơn 10,000 phân tích đã hoàn thành',
      content: <LazyIllustration Component={StatsChart} />
    },
    {
      id: 'features',
      type: 'feature',
      title: 'Công cụ toàn diện',
      description: 'Từ khảo sát đến báo cáo',
      content: <LazyIllustration Component={FeaturesShowcase} />
    }
  ],
  register: [
    {
      id: 'join',
      type: 'feature',
      title: 'Tham gia cộng đồng',
      description: 'Hàng nghìn nhà nghiên cứu tin tưởng',
      content: <LazyIllustration Component={JoinIllustration} />
    },
    {
      id: 'capabilities',
      type: 'chart',
      title: 'Khả năng vượt trội',
      description: 'Phân tích thống kê chuyên nghiệp',
      content: <LazyIllustration Component={CapabilitiesChart} />
    },
    {
      id: 'testimonial',
      type: 'testimonial',
      title: 'Câu chuyện thành công',
      description: 'Từ người dùng thực tế',
      content: <LazyIllustration Component={TestimonialCard} />
    }
  ]
};
