import React, { Suspense } from 'react';
import PageLayout from '@/components/layout/page-layout';
import { BlogContent } from '@/components/blog/blog-content';
import { BlogSkeleton } from '@/components/blog/blog-skeleton';

// Enable static generation with revalidation
export const revalidate = 300; // Revalidate every 5 minutes

export const metadata = {
  title: 'NCSKIT Research Blog - Nghiên cứu & Phân tích',
  description: 'Những hiểu biết sâu sắc, phương pháp luận và thực tiễn tốt nhất từ thế giới nghiên cứu khảo sát và phân tích dữ liệu',
};

export default function BlogPage() {
  return (
    <PageLayout>
      <Suspense fallback={<BlogSkeleton />}>
        <BlogContent />
      </Suspense>
    </PageLayout>
  );
}
