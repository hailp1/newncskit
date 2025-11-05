import Link from 'next/link';
import { Search, TrendingUp, Tag, Folder } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { BlogPost, BlogCategory, BlogTag } from '@/types/blog';

interface BlogSidebarProps {
  popularPosts: BlogPost[];
  categories: BlogCategory[];
  tags: BlogTag[];
  onSearch?: (query: string) => void;
}

export function BlogSidebar({ popularPosts, categories, tags, onSearch }: BlogSidebarProps) {
  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const query = formData.get('search') as string;
    if (onSearch && query.trim()) {
      onSearch(query.trim());
    }
  };

  return (
    <div className="space-y-6">
      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            <Search className="h-5 w-5 mr-2" />
            Tìm kiếm
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="flex space-x-2">
            <Input
              name="search"
              placeholder="Tìm kiếm bài viết..."
              className="flex-1"
            />
            <Button type="submit" size="sm">
              <Search className="h-4 w-4" />
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Popular Posts */}
      {popularPosts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <TrendingUp className="h-5 w-5 mr-2" />
              Bài viết phổ biến
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {popularPosts.map((post, index) => (
              <div key={post.id} className="flex space-x-3">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold">
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <Link 
                    href={`/blog/${post.slug}`}
                    className="block text-sm font-medium text-gray-900 hover:text-blue-600 line-clamp-2 mb-1"
                  >
                    {post.title}
                  </Link>
                  <div className="flex items-center text-xs text-gray-500 space-x-2">
                    <span>{post.views.toLocaleString()} lượt xem</span>
                    <span>•</span>
                    <span>{post.likes.toLocaleString()} lượt thích</span>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Categories */}
      {categories.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <Folder className="h-5 w-5 mr-2" />
              Danh mục
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {categories.map(category => (
                <Link
                  key={category.id}
                  href={`/blog?category=${category.slug}`}
                  className="flex items-center justify-between p-2 rounded hover:bg-gray-50 transition-colors group"
                >
                  <div className="flex items-center">
                    <div 
                      className="w-3 h-3 rounded-full mr-3"
                      style={{ backgroundColor: category.color }}
                    />
                    <span className="text-sm font-medium text-gray-700 group-hover:text-blue-600">
                      {category.name}
                    </span>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {category.post_count}
                  </Badge>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tags */}
      {tags.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <Tag className="h-5 w-5 mr-2" />
              Thẻ phổ biến
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {tags.slice(0, 20).map(tag => (
                <Link
                  key={tag.id}
                  href={`/blog?tag=${tag.slug}`}
                  className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 hover:bg-blue-100 hover:text-blue-700 transition-colors"
                >
                  #{tag.name}
                  <span className="ml-1 text-gray-500">({tag.post_count})</span>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Newsletter Signup */}
      <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-lg text-blue-900">
            Đăng ký nhận tin
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-blue-700 mb-4">
            Nhận thông báo về các bài viết mới và tips hữu ích về nghiên cứu marketing.
          </p>
          <form className="space-y-3">
            <Input
              type="email"
              placeholder="Email của bạn"
              className="bg-white border-blue-200"
            />
            <Button className="w-full bg-blue-600 hover:bg-blue-700">
              Đăng ký
            </Button>
          </form>
          <p className="text-xs text-blue-600 mt-2">
            Chúng tôi tôn trọng quyền riêng tư của bạn. Không spam!
          </p>
        </CardContent>
      </Card>
    </div>
  );
}