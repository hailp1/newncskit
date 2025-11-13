'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRightIcon, CalendarIcon, UserIcon, ClockIcon } from '@heroicons/react/24/outline';
import { blogService, BlogPost } from '@/services/blog';

export function BlogPostsSection() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadPaperPosts = async () => {
      try {
        setIsLoading(true);
        
        // Load posts with category "paper" that are published
        // First, get all categories to find "paper" category ID
        const categories = await blogService.getCategories();
        const paperCategory = categories.find(cat => 
          cat.name.toLowerCase().trim() === 'paper' || 
          cat.slug.toLowerCase().trim() === 'paper'
        );

        if (!paperCategory) {
          console.warn('[BlogPostsSection] Paper category not found. Available categories:', categories.map(c => ({ name: c.name, slug: c.slug })));
          setPosts([]);
          setIsLoading(false);
          return;
        }

        // Load posts with paper category - only published posts
        const response = await blogService.getPosts({
          limit: 6,
          status: 'published',
          categoryId: paperCategory.id.toString(),
        });
        
        // Double-check: filter to ensure only posts with paper category are shown
        const paperPosts = (response?.results || []).filter(post => {
          // Check if post has paper category
          const hasPaperCategory = post.categories && post.categories.some(cat => 
            cat.id === paperCategory.id || 
            cat.name.toLowerCase().trim() === 'paper' || 
            cat.slug.toLowerCase().trim() === 'paper'
          );
          
          // Only show published posts
          const isPublished = post.status === 'published' && post.is_published;
          
          return hasPaperCategory && isPublished;
        });
        
        console.log('[BlogPostsSection] Loaded paper posts:', {
          total: response?.count || 0,
          filtered: paperPosts.length,
          category: { id: paperCategory.id, name: paperCategory.name, slug: paperCategory.slug }
        });
        
        setPosts(paperPosts);
      } catch (error) {
        console.error('[BlogPostsSection] Error loading paper posts:', error);
        setPosts([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadPaperPosts();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <section className="py-20 lg:py-28 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Latest Research Papers
          </h2>
          <p className="text-xl text-gray-600">
            Các bài nghiên cứu đã được duyệt và xuất bản
          </p>
        </div>

        {isLoading ? (
          <div className="grid md:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <div className="aspect-video bg-gray-200 rounded-t-lg"></div>
                <CardHeader>
                  <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                  <div className="h-6 bg-gray-200 rounded w-full"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : posts.length > 0 ? (
          <>
            <div className="grid md:grid-cols-3 gap-8">
              {posts
                .filter(post => {
                  // Double-check: only show posts with paper category
                  return post.categories && post.categories.length > 0 && 
                    (post.categories[0].name.toLowerCase().trim() === 'paper' || 
                     post.categories[0].slug.toLowerCase().trim() === 'paper');
                })
                .map((post) => (
                  <Card key={post.id} className="hover:shadow-xl transition-shadow cursor-pointer">
                    <Link href={`/blog/${post.id}`}>
                      <div className="aspect-video bg-gradient-to-br from-blue-100 to-indigo-100 rounded-t-lg flex items-center justify-center">
                        {post.categories.length > 0 && (
                          <Badge className="bg-blue-600 text-white">
                            {post.categories[0].name}
                          </Badge>
                        )}
                      </div>
                      <CardHeader>
                        <div className="text-sm text-blue-600 font-medium mb-2">
                          {post.categories.length > 0 ? post.categories[0].name : 'Research Paper'}
                        </div>
                        <CardTitle className="text-lg line-clamp-2">
                          {post.title}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-600 text-sm line-clamp-3 mb-4">
                          {post.excerpt || post.content?.substring(0, 150) || 'No description available'}
                        </p>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <UserIcon className="h-4 w-4" />
                            <span>{post.author.first_name} {post.author.last_name}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <CalendarIcon className="h-4 w-4" />
                            <span>{formatDate(post.published_at || post.created_at)}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <ClockIcon className="h-4 w-4" />
                            <span>{post.reading_time || Math.ceil((post.content?.split(/\s+/).length || 0) / 200)} phút</span>
                          </div>
                        </div>
                      </CardContent>
                    </Link>
                  </Card>
                ))}
            </div>

            <div className="text-center mt-12">
              <Button asChild variant="outline" size="lg">
                <Link href="/blog">
                  Xem tất cả bài viết
                  <ArrowRightIcon className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600">Chưa có bài nghiên cứu nào được xuất bản</p>
          </div>
        )}
      </div>
    </section>
  );
}

