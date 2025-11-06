'use client';

import React, { Suspense, useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Plus, Search, Filter, Calendar, User, Eye, Heart, MessageCircle, Edit, Trash2, MoreHorizontal } from 'lucide-react';
import Link from 'next/link';
import { blogService, BlogPost } from '@/services/blog';

function BlogPageContent() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [stats, setStats] = useState({
    total: 0,
    published: 0,
    draft: 0,
    totalViews: 0
  });

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      setIsLoading(true);
      const response = await blogService.getPosts({ limit: 50 });
      setPosts(response.results);
      
      // Calculate stats
      const published = response.results.filter(post => post.status === 'published').length;
      const draft = response.results.filter(post => post.status === 'draft').length;
      const totalViews = response.results.reduce((sum, post) => sum + post.view_count, 0);
      
      setStats({
        total: response.results.length,
        published,
        draft,
        totalViews
      });
    } catch (error) {
      console.error('Error loading posts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredPosts = posts.filter(post =>
    post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.excerpt.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'published':
        return <Badge className="bg-green-100 text-green-800">Đã xuất bản</Badge>;
      case 'draft':
        return <Badge className="bg-yellow-100 text-yellow-800">Nháp</Badge>;
      case 'scheduled':
        return <Badge className="bg-blue-100 text-blue-800">Đã lên lịch</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>;
    }
  };

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Blog Management</h1>
          <p className="text-gray-600 mt-1">Quản lý bài viết blog chuyên nghiệp</p>
        </div>
        <Link href="/blog-admin/create">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Tạo bài viết mới
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tổng bài viết</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <Calendar className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Đã xuất bản</p>
                <p className="text-2xl font-bold text-green-600">{stats.published}</p>
              </div>
              <Eye className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Nháp</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.draft}</p>
              </div>
              <User className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Lượt xem</p>
                <p className="text-2xl font-bold text-purple-600">{stats.totalViews.toLocaleString()}</p>
              </div>
              <Heart className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Tìm kiếm bài viết..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Blog Posts List */}
      <Card>
        <CardHeader>
          <CardTitle>Danh sách bài viết</CardTitle>
          <CardDescription>
            Quản lý và theo dõi tất cả bài viết blog
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-600 mt-2">Đang tải...</p>
            </div>
          ) : filteredPosts.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchQuery ? 'Không tìm thấy bài viết' : 'Chưa có bài viết'}
              </h3>
              <p className="text-gray-600 mb-4">
                {searchQuery ? 'Thử từ khóa khác' : 'Bắt đầu tạo bài viết blog đầu tiên của bạn'}
              </p>
              {!searchQuery && (
                <Link href="/blog-admin/create">
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Tạo bài viết mới
                  </Button>
                </Link>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredPosts.map((post) => (
                <div key={post.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 hover:text-blue-600">
                          <Link href={`/blog/${post.id}`}>
                            {post.title}
                          </Link>
                        </h3>
                        {getStatusBadge(post.status)}
                      </div>
                      
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                        {post.excerpt}
                      </p>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <User className="h-4 w-4" />
                          <span>{post.author.first_name} {post.author.last_name}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>{formatDate(post.created_at)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Eye className="h-4 w-4" />
                          <span>{post.view_count}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MessageCircle className="h-4 w-4" />
                          <span>{post.comment_count}</span>
                        </div>
                      </div>
                      
                      <div className="flex gap-1 mt-2">
                        {post.categories.slice(0, 2).map((category) => (
                          <Badge key={category.id} variant="outline" className="text-xs">
                            {category.name}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 ml-4">
                      <Button size="sm" variant="outline">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function BlogPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <BlogPageContent />
    </Suspense>
  );
}