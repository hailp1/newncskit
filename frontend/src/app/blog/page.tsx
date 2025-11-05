'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight, Search, Filter, Grid, List } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { BlogSEO } from '@/components/blog/blog-seo';
import { BlogCard } from '@/components/blog/blog-card';
import { BlogSidebar } from '@/components/blog/blog-sidebar';
import { blogService } from '@/services/blog';
import type { BlogPost, BlogCategory, BlogTag } from '@/types/blog';

export default function BlogPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [tags, setTags] = useState<BlogTag[]>([]);
  const [popularPosts, setPopularPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPosts, setTotalPosts] = useState(0);
  const [hasMore, setHasMore] = useState(false);

  // Get URL parameters
  const category = searchParams.get('category');
  const tag = searchParams.get('tag');
  const search = searchParams.get('search');

  // Static data for now (will be replaced with API calls)
  const staticPosts: BlogPost[] = [
    {
      id: '1',
      title: "Phân tích nhân tố khám phá (EFA) và khẳng định (CFA)",
      slug: "phan-tich-nhan-to-efa-cfa",
      excerpt: "Hướng dẫn chi tiết về phân tích nhân tố từ cơ bản đến nâng cao, bao gồm EFA và CFA với các ví dụ thực tế trong nghiên cứu marketing.",
      content: "",
      author: {
        id: '1',
        name: "Lê Phúc Hải",
        avatar: "/images/authors/hai.jpg"
      },
      category: {
        id: 'statistical-analysis',
        name: 'Phân tích thống kê',
        slug: 'phan-tich-thong-ke',
        color: '#3B82F6'
      },
      tags: ['EFA', 'CFA', 'Factor Analysis', 'SPSS', 'AMOS'],
      featured_image: "/images/blog/efa-cfa.jpg",
      featured_image_alt: "Phân tích nhân tố EFA và CFA",
      status: 'published',
      published_at: '2024-12-15T10:00:00Z',
      created_at: '2024-12-15T10:00:00Z',
      updated_at: '2024-12-15T10:00:00Z',
      reading_time: 12,
      views: 2847,
      likes: 156,
      seo: {
        meta_title: "Hướng dẫn EFA và CFA chi tiết - Phân tích nhân tố",
        meta_description: "Học cách thực hiện phân tích nhân tố khám phá (EFA) và khẳng định (CFA) với SPSS và AMOS. Hướng dẫn từng bước với ví dụ thực tế.",
        meta_keywords: ['EFA', 'CFA', 'phân tích nhân tố', 'SPSS', 'AMOS', 'nghiên cứu marketing']
      }
    },
    {
      id: '2',
      title: "Mô hình phương trình cấu trúc (SEM)",
      slug: "mo-hinh-phuong-trinh-cau-truc-sem",
      excerpt: "Tìm hiểu về SEM - một trong những phương pháp phân tích mạnh mẽ nhất trong nghiên cứu khoa học xã hội và marketing.",
      content: "",
      author: {
        id: '1',
        name: "Lê Phúc Hải"
      },
      category: {
        id: 'advanced-analysis',
        name: 'Phân tích nâng cao',
        slug: 'phan-tich-nang-cao',
        color: '#8B5CF6'
      },
      tags: ['SEM', 'Structural Equation Modeling', 'AMOS', 'SmartPLS'],
      featured_image: "/images/blog/sem.jpg",
      featured_image_alt: "Mô hình phương trình cấu trúc SEM",
      status: 'published',
      published_at: '2024-12-10T10:00:00Z',
      created_at: '2024-12-10T10:00:00Z',
      updated_at: '2024-12-10T10:00:00Z',
      reading_time: 15,
      views: 1923,
      likes: 89,
      seo: {
        meta_title: "Mô hình phương trình cấu trúc SEM - Hướng dẫn chi tiết",
        meta_description: "Tìm hiểu SEM từ cơ bản đến nâng cao. Hướng dẫn sử dụng AMOS và SmartPLS để phân tích mô hình cấu trúc.",
        meta_keywords: ['SEM', 'structural equation modeling', 'AMOS', 'SmartPLS', 'phân tích cấu trúc']
      }
    },
    {
      id: '3',
      title: "Hồi quy toàn diện: Tuyến tính, Logistic và Đa cấp",
      slug: "hoi-quy-toan-dien",
      excerpt: "Hướng dẫn chi tiết các kỹ thuật hồi quy từ cơ bản đến nâng cao với ví dụ thực tế và mẹo thực hành hữu ích.",
      content: "",
      author: {
        id: '1',
        name: "Lê Phúc Hải"
      },
      category: {
        id: 'statistical-analysis',
        name: 'Phân tích thống kê',
        slug: 'phan-tich-thong-ke',
        color: '#3B82F6'
      },
      tags: ['Regression', 'Linear Regression', 'Logistic Regression', 'Multilevel'],
      featured_image: "/images/blog/regression.jpg",
      featured_image_alt: "Phân tích hồi quy toàn diện",
      status: 'published',
      published_at: '2024-12-05T10:00:00Z',
      created_at: '2024-12-05T10:00:00Z',
      updated_at: '2024-12-05T10:00:00Z',
      reading_time: 18,
      views: 3156,
      likes: 203,
      seo: {
        meta_title: "Hồi quy tuyến tính và Logistic - Hướng dẫn toàn diện",
        meta_description: "Học các kỹ thuật hồi quy từ cơ bản đến nâng cao. Hướng dẫn thực hành với R, SPSS và Python.",
        meta_keywords: ['hồi quy', 'linear regression', 'logistic regression', 'multilevel modeling']
      }
    },
    {
      id: '4',
      title: "Thiết kế nghiên cứu hiệu quả: Từ ý tưởng đến kết quả",
      slug: "thiet-ke-nghien-cuu-hieu-qua",
      excerpt: "Hướng dẫn từng bước thiết kế một nghiên cứu chất lượng cao, từ việc xác định vấn đề đến thu thập và phân tích dữ liệu. Không còn 'mò mẫm' nữa!",
      content: "",
      author: {
        id: '1',
        name: "Lê Phúc Hải"
      },
      category: {
        id: 'research-methods',
        name: 'Phương pháp nghiên cứu',
        slug: 'phuong-phap-nghien-cuu',
        color: '#10B981'
      },
      tags: ['Research Design', 'Methodology', 'Data Collection', 'Research Planning'],
      featured_image: "/images/blog/research-design.jpg",
      featured_image_alt: "Thiết kế nghiên cứu hiệu quả",
      status: 'published',
      published_at: '2024-01-10T10:00:00Z',
      created_at: '2024-01-10T10:00:00Z',
      updated_at: '2024-01-10T10:00:00Z',
      reading_time: 20,
      views: 2156,
      likes: 134,
      seo: {
        meta_title: "Thiết kế nghiên cứu hiệu quả - Hướng dẫn từ A đến Z",
        meta_description: "Học cách thiết kế nghiên cứu khoa học từ ý tưởng đến kết quả. Hướng dẫn chi tiết với các ví dụ thực tế.",
        meta_keywords: ['thiết kế nghiên cứu', 'phương pháp nghiên cứu', 'research design', 'methodology']
      }
    }
  ];

  const staticCategories: BlogCategory[] = [
    { id: 'statistical-analysis', name: 'Phân tích thống kê', slug: 'phan-tich-thong-ke', description: 'Các phương pháp phân tích thống kê', color: '#3B82F6', post_count: 8 },
    { id: 'advanced-analysis', name: 'Phân tích nâng cao', slug: 'phan-tich-nang-cao', description: 'Kỹ thuật phân tích nâng cao', color: '#8B5CF6', post_count: 5 },
    { id: 'research-methods', name: 'Phương pháp nghiên cứu', slug: 'phuong-phap-nghien-cuu', description: 'Các phương pháp nghiên cứu', color: '#10B981', post_count: 6 },
    { id: 'case-studies', name: 'Case Studies', slug: 'case-studies', description: 'Các nghiên cứu điển hình', color: '#F59E0B', post_count: 4 }
  ];

  const staticTags: BlogTag[] = [
    { id: 'efa', name: 'EFA', slug: 'efa', post_count: 3 },
    { id: 'cfa', name: 'CFA', slug: 'cfa', post_count: 3 },
    { id: 'sem', name: 'SEM', slug: 'sem', post_count: 2 },
    { id: 'spss', name: 'SPSS', slug: 'spss', post_count: 5 },
    { id: 'amos', name: 'AMOS', slug: 'amos', post_count: 4 },
    { id: 'regression', name: 'Regression', slug: 'regression', post_count: 3 }
  ];

  useEffect(() => {
    loadData();
  }, [category, tag, search, currentPage]);

  const loadData = async () => {
    setLoading(true);
    try {
      // For now, use static data
      // In production, replace with actual API calls
      let filteredPosts = [...staticPosts];
      
      if (category) {
        filteredPosts = filteredPosts.filter(post => post.category.slug === category);
      }
      
      if (tag) {
        filteredPosts = filteredPosts.filter(post => 
          post.tags.some(t => t.toLowerCase().replace(/\s+/g, '-') === tag)
        );
      }
      
      if (search) {
        filteredPosts = filteredPosts.filter(post =>
          post.title.toLowerCase().includes(search.toLowerCase()) ||
          post.excerpt.toLowerCase().includes(search.toLowerCase())
        );
      }

      setPosts(filteredPosts);
      setTotalPosts(filteredPosts.length);
      setHasMore(false);
      setCategories(staticCategories);
      setTags(staticTags);
      setPopularPosts(staticPosts.slice(0, 3));
    } catch (error) {
      console.error('Error loading blog data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (query: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (query) {
      params.set('search', query);
    } else {
      params.delete('search');
    }
    router.push(`/blog?${params.toString()}`);
  };

  const clearFilters = () => {
    router.push('/blog');
  };

  const featuredPost = posts.find(post => post.views > 2000);
  const regularPosts = posts.filter(post => post !== featuredPost);

  return (
    <>
      <BlogSEO 
        title="NCSKIT Blog - Nghiên cứu Marketing & Thống kê"
        description="Khám phá những kiến thức sâu sắc về nghiên cứu marketing, phân tích thống kê và các phương pháp nghiên cứu khoa học từ đội ngũ chuyên gia NCSKIT."
      />
      
      <div className="bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                NCSKIT Blog
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Khám phá những kiến thức sâu sắc về nghiên cứu marketing, phân tích thống kê 
                và các phương pháp nghiên cứu khoa học từ đội ngũ chuyên gia NCSKIT.
              </p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="lg:grid lg:grid-cols-4 lg:gap-8">
            {/* Main Content */}
            <div className="lg:col-span-3">
              {/* Filters and Search */}
              <div className="mb-8 bg-white rounded-lg p-6 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex items-center space-x-4">
                    {(category || tag || search) && (
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-500">Lọc:</span>
                        {category && (
                          <Badge variant="secondary">
                            Danh mục: {categories.find(c => c.slug === category)?.name}
                          </Badge>
                        )}
                        {tag && (
                          <Badge variant="secondary">
                            Tag: {tag}
                          </Badge>
                        )}
                        {search && (
                          <Badge variant="secondary">
                            Tìm kiếm: {search}
                          </Badge>
                        )}
                        <Button variant="ghost" size="sm" onClick={clearFilters}>
                          Xóa bộ lọc
                        </Button>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button
                      variant={viewMode === 'grid' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setViewMode('grid')}
                    >
                      <Grid className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={viewMode === 'list' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setViewMode('list')}
                    >
                      <List className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Featured Post */}
              {featuredPost && !category && !tag && !search && (
                <div className="mb-12">
                  <div className="flex items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">Bài viết nổi bật</h2>
                    <div className="ml-3 h-px bg-gray-300 flex-1"></div>
                  </div>
                  <BlogCard post={featuredPost} featured={true} />
                </div>
              )}

              {/* Posts Grid/List */}
              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-4 text-gray-600">Đang tải bài viết...</p>
                </div>
              ) : posts.length > 0 ? (
                <>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">
                      {category || tag || search ? 'Kết quả tìm kiếm' : 'Bài viết mới nhất'}
                    </h2>
                    <span className="text-sm text-gray-500">
                      {totalPosts} bài viết
                    </span>
                  </div>
                  
                  <div className={viewMode === 'grid' 
                    ? "grid md:grid-cols-2 lg:grid-cols-2 gap-8" 
                    : "space-y-6"
                  }>
                    {regularPosts.map((post) => (
                      <BlogCard 
                        key={post.id} 
                        post={post} 
                        featured={false}
                        showExcerpt={viewMode === 'list'}
                      />
                    ))}
                  </div>

                  {/* Load More */}
                  {hasMore && (
                    <div className="text-center mt-12">
                      <Button onClick={() => setCurrentPage(prev => prev + 1)}>
                        Xem thêm bài viết
                      </Button>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-12">
                  <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Search className="h-12 w-12 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Không tìm thấy bài viết
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc.
                  </p>
                  <Button onClick={clearFilters}>
                    Xem tất cả bài viết
                  </Button>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1 mt-12 lg:mt-0">
              <BlogSidebar
                popularPosts={popularPosts}
                categories={categories}
                tags={tags}
                onSearch={handleSearch}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}