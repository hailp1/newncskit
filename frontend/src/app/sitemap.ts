import { MetadataRoute } from 'next';
import { blogService } from '@/services/blog';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://ncskit.com';
  
  // Static pages
  const staticPages = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/features`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/dashboard`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    },
  ];

  // Blog posts - static for now
  const blogPages: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/blog/phan-tich-nhan-to-efa-cfa`,
      lastModified: new Date('2024-12-15'),
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    },
    {
      url: `${baseUrl}/blog/mo-hinh-phuong-trinh-cau-truc-sem`,
      lastModified: new Date('2024-12-10'),
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    },
    {
      url: `${baseUrl}/blog/hoi-quy-toan-dien`,
      lastModified: new Date('2024-12-05'),
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    },
  ];

  return [...staticPages, ...blogPages];
}