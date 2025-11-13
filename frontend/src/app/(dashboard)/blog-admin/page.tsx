'use client';

import React, { Suspense, useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Plus, Search, Filter, Calendar, User, Eye, Heart, MessageCircle, Edit, Trash2, MoreHorizontal, CheckCircle, XCircle, Bell, Folder, CheckSquare, Square } from 'lucide-react';
import Link from 'next/link';
import { blogService, BlogPost } from '@/services/blog';
import { useAuthStore } from '@/store/auth';

function BlogPageContent() {
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'admin' || user?.role === 'super_admin';
  const currentUserId = user?.id;
  
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [pendingPosts, setPendingPosts] = useState<BlogPost[]>([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const postsPerPage = 10; // Giảm từ 50 xuống 10
  
  const [stats, setStats] = useState({
    total: 0,
    published: 0,
    draft: 0,
    review: 0,
    totalViews: 0
  });

  // Bulk delete state (admin only)
  const [selectedPosts, setSelectedPosts] = useState<Set<string>>(new Set());
  const [isDeleting, setIsDeleting] = useState(false);

  // Load stats and pending posts separately
  useEffect(() => {
    loadStats();
    if (isAdmin) {
      loadPendingPosts();
    }
  }, [isAdmin]);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1); // Reset to first page on search
    }, 500); // Wait 500ms after user stops typing

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Load posts when page or debounced search changes
  useEffect(() => {
    loadPosts();
  }, [currentPage, debouncedSearch]);

  // Reload posts when page becomes visible (after redirect from create page)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        loadPosts();
      }
    };
    
    // Also reload if URL has refresh parameter
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('refresh')) {
      loadPosts();
      // Remove refresh parameter from URL
      window.history.replaceState({}, '', '/blog-admin');
    }
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  const loadPendingPosts = async () => {
    try {
      const response = await blogService.getPendingPosts({ limit: 10 });
      setPendingPosts(response?.results || []);
      setPendingCount(response?.count || 0);
    } catch (error) {
      console.error('Error loading pending posts:', error);
    }
  };

  const handleApprovePost = async (postId: string) => {
    try {
      await blogService.approvePost(postId);
      // Reload posts and pending posts
      loadPosts();
      loadPendingPosts();
      loadStats();
    } catch (error) {
      console.error('Error approving post:', error);
      alert('Không thể phê duyệt bài viết. Vui lòng thử lại.');
    }
  };

  const handleDeletePost = async (postId: string) => {
    const post = posts.find(p => p.id === postId);
    if (!post) return;
    
    const confirmMessage = `Bạn có chắc chắn muốn xóa bài viết "${post.title}"?\n\nHành động này không thể hoàn tác.`;
    if (!confirm(confirmMessage)) return;
    
    try {
      await blogService.deletePost(postId);
      // Reload posts and stats
      loadPosts();
      loadPendingPosts();
      loadStats();
      alert('Xóa bài viết thành công!');
    } catch (error: any) {
      console.error('Error deleting post:', error);
      const errorMessage = error?.response?.data?.message || error?.message || 'Không thể xóa bài viết. Vui lòng thử lại.';
      alert(errorMessage);
    }
  };

  // Bulk delete functions (admin only)
  const handleToggleSelect = (postId: string) => {
    setSelectedPosts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(postId)) {
        newSet.delete(postId);
      } else {
        newSet.add(postId);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (selectedPosts.size === filteredPosts.length) {
      setSelectedPosts(new Set());
    } else {
      setSelectedPosts(new Set(filteredPosts.map(p => p.id)));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedPosts.size === 0) {
      alert('Vui lòng chọn ít nhất một bài viết để xóa.');
      return;
    }

    const selectedCount = selectedPosts.size;
    const confirmMessage = `Bạn có chắc chắn muốn xóa ${selectedCount} bài viết đã chọn?\n\nHành động này không thể hoàn tác.`;
    if (!confirm(confirmMessage)) return;

    setIsDeleting(true);
    let successCount = 0;
    let failCount = 0;

    try {
      // Delete posts in parallel
      const deletePromises = Array.from(selectedPosts).map(async (postId) => {
        try {
          await blogService.deletePost(postId);
          successCount++;
        } catch (error) {
          console.error(`Error deleting post ${postId}:`, error);
          failCount++;
        }
      });

      await Promise.all(deletePromises);

      // Reload data
      loadPosts();
      loadPendingPosts();
      loadStats();
      setSelectedPosts(new Set());

      if (failCount === 0) {
        alert(`Đã xóa thành công ${successCount} bài viết!`);
      } else {
        alert(`Đã xóa ${successCount} bài viết. ${failCount} bài viết không thể xóa.`);
      }
    } catch (error) {
      console.error('Error in bulk delete:', error);
      alert('Có lỗi xảy ra khi xóa bài viết. Vui lòng thử lại.');
    } finally {
      setIsDeleting(false);
    }
  };

  const loadStats = async () => {
    try {
      // Check if blogService is available
      if (!blogService || typeof blogService.getPosts !== 'function') {
        console.warn('Blog service not available')
        setStats({
          total: 0,
          published: 0,
          draft: 0,
          review: 0,
          totalViews: 0
        })
        return
      }
      
      // Load only stats, not full posts - Already optimized with Promise.all
      const [publishedRes, draftRes, reviewRes] = await Promise.all([
        blogService.getPosts({ status: 'published', limit: 1 }),
        blogService.getPosts({ status: 'draft', limit: 1 }),
        blogService.getPosts({ status: 'review', limit: 1 })
      ]);
      
      setStats({
        total: (publishedRes?.count || 0) + (draftRes?.count || 0) + (reviewRes?.count || 0),
        published: publishedRes?.count || 0,
        draft: draftRes?.count || 0,
        review: reviewRes?.count || 0,
        totalViews: 0 // Calculate separately if needed
      });
    } catch (error) {
      console.error('Error loading stats:', error);
      // Set default stats on error
      setStats({
        total: 0,
        published: 0,
        draft: 0,
        review: 0,
        totalViews: 0
      });
    }
  };

  const loadPosts = async () => {
    try {
      setIsLoading(true);
      
      // Check if blogService is available
      if (!blogService || typeof blogService.getPosts !== 'function') {
        console.warn('Blog service not available')
        setPosts([]);
        setTotalCount(0);
        setTotalPages(1);
        return;
      }
      
      // Load all posts for admin (no status filter)
      const response = await blogService.getPosts({ 
        page: currentPage,
        limit: postsPerPage,
        search: debouncedSearch || undefined,
        // Don't filter by status - admin can see all posts
      });
      
      console.log('[Blog Admin] Loaded posts:', response);
      
      setPosts(response?.results || []);
      setTotalCount(response?.count || 0);
      setTotalPages(Math.ceil((response?.count || 0) / postsPerPage));
    } catch (error) {
      console.error('Error loading posts:', error);
      setPosts([]);
      setTotalCount(0);
      setTotalPages(1);
    } finally {
      setIsLoading(false);
    }
  };

  // Search is now handled by API, no need to filter client-side
  const filteredPosts = posts;

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
        <div className="flex items-center gap-3">
          {isAdmin && (
            <Link href="/blog-admin/categories">
              <Button variant="outline">
                <Folder className="h-4 w-4 mr-2" />
                Quản lý Danh mục
              </Button>
            </Link>
          )}
          <Link href="/blog-admin/create">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Tạo bài viết mới
            </Button>
          </Link>
        </div>
      </div>

      {/* Pending Posts Notification (Admin Only) */}
      {isAdmin && pendingCount > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-orange-600" />
                <span className="text-orange-900">Bài viết chờ duyệt</span>
                <Badge className="bg-orange-600 text-white">{pendingCount}</Badge>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pendingPosts.slice(0, 3).map((post) => (
                <div key={post.id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-orange-200">
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-gray-900 truncate">{post.title}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge className="bg-orange-100 text-orange-800">Chờ duyệt</Badge>
                      {post.categories.length > 0 && (
                        <Badge variant="outline" className="text-xs">
                          {post.categories[0].name}
                        </Badge>
                      )}
                      <span className="text-xs text-gray-500">
                        {post.author.first_name} {post.author.last_name}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4 flex-shrink-0">
                    <Button
                      size="sm"
                      variant="outline"
                      className="bg-green-50 text-green-700 border-green-300 hover:bg-green-100"
                      onClick={() => handleApprovePost(post.id)}
                      title="Phê duyệt bài viết"
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Duyệt
                    </Button>
                    <Link href={`/blog-admin/create?id=${post.id}`}>
                      <Button size="sm" variant="outline" title="Xem/Chỉnh sửa">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </Link>
                    {/* Show delete button only if user is the author or admin */}
                    {(isAdmin || post.author.id === currentUserId) && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                        onClick={() => handleDeletePost(post.id)}
                        title="Xóa bài viết"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
              {pendingCount > 3 && (
                <div className="text-center pt-2">
                  <Button variant="outline" size="sm" onClick={() => {
                    // Filter to show only review posts
                    setSearchQuery('');
                    // TODO: Add filter by status
                  }}>
                    Xem tất cả {pendingCount} bài viết chờ duyệt
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Cards */}
      <div className={`grid grid-cols-1 md:grid-cols-${isAdmin ? '5' : '4'} gap-4`}>
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

        {isAdmin && (
          <Card className="border-orange-200 bg-orange-50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-700">Chờ duyệt</p>
                  <p className="text-2xl font-bold text-orange-600">{pendingCount || stats.review || 0}</p>
                </div>
                <Bell className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        )}
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Lượt xem</p>
                <p className="text-2xl font-bold text-purple-600">{(stats.totalViews || 0).toLocaleString()}</p>
              </div>
              <Heart className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search with debounce */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Tìm kiếm bài viết... (tự động tìm sau 0.5s)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
            {searchQuery && searchQuery !== debouncedSearch && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Blog Posts List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Danh sách bài viết</CardTitle>
              <CardDescription>
                Quản lý và theo dõi tất cả bài viết blog
              </CardDescription>
            </div>
            {isAdmin && filteredPosts.length > 0 && (
              <div className="flex items-center gap-2">
                {selectedPosts.size > 0 && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleBulkDelete}
                    disabled={isDeleting}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    {isDeleting ? 'Đang xóa...' : `Xóa đã chọn (${selectedPosts.size})`}
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSelectAll}
                  title={selectedPosts.size === filteredPosts.length ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
                >
                  {selectedPosts.size === filteredPosts.length ? (
                    <CheckSquare className="h-4 w-4" />
                  ) : (
                    <Square className="h-4 w-4" />
                  )}
                </Button>
              </div>
            )}
          </div>
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
                  <div className="flex items-start justify-between gap-4">
                    {/* Checkbox for bulk selection (admin only) */}
                    {isAdmin && (
                      <div className="flex-shrink-0 pt-1">
                        <input
                          type="checkbox"
                          checked={selectedPosts.has(post.id)}
                          onChange={() => handleToggleSelect(post.id)}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          title="Chọn bài viết"
                        />
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 hover:text-blue-600">
                          <Link href={`/blog-admin/create?id=${post.id}`}>
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
                          <span>{post.view_count || 0}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MessageCircle className="h-4 w-4" />
                          <span>{post.comment_count || 0}</span>
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
                    
                    <div className="flex items-center gap-2 ml-4 flex-shrink-0">
                      {isAdmin && post.status === 'review' && (
                        <Button
                          size="sm"
                          className="bg-green-600 text-white hover:bg-green-700"
                          onClick={() => handleApprovePost(post.id)}
                          title="Phê duyệt bài viết"
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Duyệt
                        </Button>
                      )}
                      <Link href={`/blog-admin/create?id=${post.id}`}>
                        <Button size="sm" variant="outline" title="Chỉnh sửa">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </Link>
                      {/* Show delete button only if user is the author or admin */}
                      {(isAdmin || post.author.id === currentUserId) && (
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                          title="Xóa bài viết"
                          onClick={() => handleDeletePost(post.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {!isLoading && filteredPosts.length > 0 && totalPages > 1 && (
            <div className="mt-6 flex items-center justify-between border-t pt-4">
              <div className="text-sm text-gray-600">
                Hiển thị {((currentPage - 1) * postsPerPage) + 1} - {Math.min(currentPage * postsPerPage, totalCount)} trong tổng số {totalCount} bài viết
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  Trước
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <Button
                        key={pageNum}
                        size="sm"
                        variant={currentPage === pageNum ? "default" : "outline"}
                        onClick={() => setCurrentPage(pageNum)}
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                >
                  Sau
                </Button>
              </div>
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