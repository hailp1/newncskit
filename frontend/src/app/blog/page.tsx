'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import PageLayout from '@/components/layout/page-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Calendar, 
  User, 
  Clock, 
  Search,
  Tag,
  TrendingUp,
  BookOpen,
  ArrowRight,
  Eye,
  MessageCircle
} from 'lucide-react';
import Link from 'next/link';
import { blogService } from '@/services/blog';

interface BlogPostDisplay {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  author: {
    name: string;
    avatar?: string;
  };
  publishedAt: string;
  readTime: number;
  category: string;
  tags: string[];
  views: number;
  comments: number;
  featured: boolean;
}

// Cache for blog data
let cachedPosts: BlogPostDisplay[] | null = null;
let cachedCategories: string[] | null = null;
let cacheTimestamp: number = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPostDisplay[]>([]);
  const [categories, setCategories] = useState<string[]>(['Tất cả']);
  const [selectedCategory, setSelectedCategory] = useState('Tất cả');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const POSTS_PER_PAGE = 6; // Giảm từ 10 xuống 6 để load nhanh hơn

  useEffect(() => {
    loadBlogData();
  }, []);

  const loadBlogData = async () => {
    try {
      setIsLoading(true);
      
      // Check cache first
      const now = Date.now();
      if (cachedPosts && cachedCategories && (now - cacheTimestamp) < CACHE_DURATION) {
        setPosts(cachedPosts);
        setCategories(cachedCategories);
        setIsLoading(false);
        return;
      }
      
      // Load data in parallel - Giảm limit để load nhanh hơn
      const [postsResponse, categoriesResponse] = await Promise.all([
        blogService.getPublishedPosts({ page: 0, limit: 20 }), // Giảm từ 50 xuống 20
        blogService.getCategories()
      ]);
      
      const blogPosts = postsResponse.results || [];
      
      // Transform API data
      const displayPosts: BlogPostDisplay[] = blogPosts.map(post => ({
        id: String(post.id),
        title: post.title,
        excerpt: post.excerpt || '',
        content: post.content,
        author: {
          name: `${post.author?.first_name || ''} ${post.author?.last_name || ''}`.trim() || post.author?.username || 'Anonymous',
          avatar: undefined
        },
        publishedAt: post.published_at || post.created_at,
        readTime: post.reading_time || Math.ceil((post.content?.split(' ').length || 0) / 200),
        category: post.categories && post.categories.length > 0 ? post.categories[0].name : 'Chưa phân loại',
        tags: Array.isArray(post.tags) ? post.tags.map(tag => typeof tag === 'string' ? tag : tag.name) : [],
        views: post.view_count || 0,
        comments: post.comment_count || 0,
        featured: post.view_count > 100 || false
      }));
      
      const categoryNames = ['Tất cả', ...categoriesResponse.map((cat: any) => cat.name)];
      
      // Update cache
      cachedPosts = displayPosts;
      cachedCategories = categoryNames;
      cacheTimestamp = now;
      
      setPosts(displayPosts);
      setCategories(categoryNames);
      
    } catch (error) {
      console.error('Error loading blog data:', error);
      setPosts([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Memoize filtered posts
  const filteredPosts = useMemo(() => {
    let filtered = posts;

    if (selectedCategory !== 'Tất cả') {
      filtered = filtered.filter(post => post.category === selectedCategory);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(post => 
        post.title.toLowerCase().includes(query) ||
        post.excerpt.toLowerCase().includes(query) ||
        post.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    return filtered;
  }, [posts, selectedCategory, searchQuery]);

  // Paginate posts
  const paginatedPosts = useMemo(() => {
    const start = 0;
    const end = page * POSTS_PER_PAGE;
    return filteredPosts.slice(start, end);
  }, [filteredPosts, page]);

  const featuredPosts = useMemo(() => 
    paginatedPosts.filter(post => post.featured).slice(0, 2),
    [paginatedPosts]
  );

  const regularPosts = useMemo(() => 
    paginatedPosts.filter(post => !post.featured),
    [paginatedPosts]
  );

  const formatDate = useCallback((dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }, []);

  const handlePostClick = useCallback(async (postId: string) => {
    try {
      await blogService.incrementView(postId);
    } catch (error) {
      console.error('Error incrementing view count:', error);
    }
  }, []);

  const handleLoadMore = useCallback(() => {
    setPage(prev => prev + 1);
  }, []);

  const hasMore = paginatedPosts.length < filteredPosts.length;

  if (isLoading) {
    return (
      <PageLayout>
        <div className="bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen">
          <div className="max-w-7xl mx-auto px-6 py-16">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded mb-4 max-w-md mx-auto"></div>
              <div className="h-4 bg-gray-200 rounded mb-2 max-w-2xl mx-auto"></div>
              <div className="h-4 bg-gray-200 rounded mb-8 max-w-xl mx-auto"></div>
              <div className="grid md:grid-cols-2 gap-6">
                {[1, 2].map((i) => (
                  <div key={i} className="h-48 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="bg-gradient-to-br from-blue-50 to-indigo-100">
        
        {/* Hero Section */}
        <div className="bg-white">
          <div className="max-w-7xl mx-auto px-6 py-16">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-gray-900 mb-6">
                NCSKIT Research Blog
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
                Những hiểu biết sâu sắc, phương pháp luận và thực tiễn tốt nhất từ thế giới nghiên cứu khảo sát và phân tích dữ liệu
              </p>
              <div className="flex justify-center gap-4 flex-wrap">
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                  Hiểu biết nghiên cứu
                </Badge>
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  Phân tích chuyên gia
                </Badge>
                <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                  Thực tiễn tốt nhất
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Tìm kiếm bài viết..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  onClick={() => setSelectedCategory(category)}
                  className="whitespace-nowrap"
                  size="sm"
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>

          {/* Featured Posts */}
          {featuredPosts.length > 0 && (
            <div className="mb-12">
              <div className="flex items-center gap-2 mb-6">
                <TrendingUp className="h-5 w-5 text-orange-600" />
                <h2 className="text-2xl font-bold text-gray-900">Bài viết nổi bật</h2>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                {featuredPosts.map((post) => (
                  <Card key={post.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="bg-gradient-to-r from-blue-600 to-purple-600 h-2"></div>
                    <CardHeader>
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="secondary">{post.category}</Badge>
                        <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                          Nổi bật
                        </Badge>
                      </div>
                      <CardTitle className="text-xl hover:text-blue-600 transition-colors">
                        <Link href={`/blog/${post.id}`} onClick={() => handlePostClick(post.id)}>
                          {post.title}
                        </Link>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 mb-4 line-clamp-3">{post.excerpt}</p>
                      
                      <div className="flex items-center justify-between text-sm text-gray-500 mb-4 flex-wrap gap-2">
                        <div className="flex items-center gap-4 flex-wrap">
                          <div className="flex items-center gap-1">
                            <User className="h-4 w-4" />
                            <span>{post.author.name}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            <span>{formatDate(post.publishedAt)}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            <span>{post.readTime} phút</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex gap-2 flex-wrap">
                          {post.tags.slice(0, 2).map((tag) => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                        <div className="flex items-center gap-3 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <Eye className="h-4 w-4" />
                            <span>{post.views}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Regular Posts */}
          <div>
            <div className="flex items-center gap-2 mb-6">
              <BookOpen className="h-5 w-5 text-blue-600" />
              <h2 className="text-2xl font-bold text-gray-900">Bài viết mới nhất</h2>
            </div>
            
            {paginatedPosts.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Không tìm thấy bài viết</h3>
                  <p className="text-gray-600">Thử điều chỉnh tiêu chí tìm kiếm hoặc bộ lọc của bạn</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6">
                {(regularPosts.length > 0 ? regularPosts : featuredPosts).map((post) => (
                  <Card key={post.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row gap-6">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-3 flex-wrap">
                            <Badge variant="secondary">{post.category}</Badge>
                            {post.featured && (
                              <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                                Nổi bật
                              </Badge>
                            )}
                          </div>
                          
                          <h3 className="text-xl font-semibold text-gray-900 mb-3 hover:text-blue-600 transition-colors">
                            <Link href={`/blog/${post.id}`} onClick={() => handlePostClick(post.id)}>
                              {post.title}
                            </Link>
                          </h3>
                          
                          <p className="text-gray-600 mb-4 line-clamp-2">{post.excerpt}</p>
                          
                          <div className="flex items-center justify-between flex-wrap gap-4">
                            <div className="flex items-center gap-4 text-sm text-gray-500 flex-wrap">
                              <div className="flex items-center gap-1">
                                <User className="h-4 w-4" />
                                <span>{post.author.name}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                <span>{formatDate(post.publishedAt)}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                <span>{post.readTime} phút</span>
                              </div>
                            </div>
                            
                            <Link href={`/blog/${post.id}`} onClick={() => handlePostClick(post.id)}>
                              <Button variant="ghost" size="sm">
                                Đọc thêm
                                <ArrowRight className="h-4 w-4 ml-1" />
                              </Button>
                            </Link>
                          </div>
                        </div>
                        
                        <div className="md:w-48 flex flex-col justify-between">
                          <div className="flex flex-wrap gap-1 mb-3">
                            {post.tags.slice(0, 3).map((tag) => (
                              <Badge key={tag} variant="outline" className="text-xs">
                                <Tag className="h-3 w-3 mr-1" />
                                {tag}
                              </Badge>
                            ))}
                          </div>
                          
                          <div className="flex items-center gap-3 text-sm text-gray-500">
                            <div className="flex items-center gap-1">
                              <Eye className="h-4 w-4" />
                              <span>{post.views}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Load More Button */}
          {hasMore && (
            <div className="text-center mt-12">
              <Button variant="outline" size="lg" onClick={handleLoadMore}>
                Tải thêm bài viết
              </Button>
            </div>
          )}
        </div>

        {/* Newsletter Signup */}
        <div className="bg-white">
          <div className="max-w-7xl mx-auto px-6 py-16">
            <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
              <CardContent className="text-center py-12">
                <h2 className="text-3xl font-bold mb-4">Cập nhật thông tin</h2>
                <p className="text-blue-100 mb-8 max-w-2xl mx-auto">
                  Đăng ký nhận bản tin của chúng tôi và nhận những hiểu biết nghiên cứu mới nhất, phương pháp luận và thực tiễn tốt nhất được gửi đến hộp thư của bạn.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                  <Input 
                    placeholder="Nhập email của bạn" 
                    className="bg-white text-gray-900"
                  />
                  <Button variant="secondary" size="lg">
                    Đăng ký
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
