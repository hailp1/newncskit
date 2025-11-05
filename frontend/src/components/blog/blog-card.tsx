import Link from 'next/link';
import Image from 'next/image';
import { Calendar, Clock, User, Eye, Heart } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import type { BlogPost } from '@/types/blog';

interface BlogCardProps {
  post: BlogPost;
  featured?: boolean;
  showExcerpt?: boolean;
}

export function BlogCard({ post, featured = false, showExcerpt = true }: BlogCardProps) {
  const cardClasses = featured 
    ? "group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-white to-gray-50"
    : "group hover:shadow-lg transition-all duration-300";

  return (
    <Card className={cardClasses}>
      <CardContent className="p-0">
        {/* Featured Image */}
        {post.featured_image && (
          <div className={`relative overflow-hidden ${featured ? 'h-64' : 'h-48'}`}>
            <Link href={`/blog/${post.slug}`}>
              <Image
                src={post.featured_image}
                alt={post.featured_image_alt || post.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
                sizes={featured ? "(max-width: 768px) 100vw, 50vw" : "(max-width: 768px) 100vw, 33vw"}
              />
            </Link>
            
            {/* Category Badge */}
            <div className="absolute top-4 left-4">
              <Badge 
                className="text-white border-0"
                style={{ backgroundColor: post.category.color }}
              >
                {post.category.name}
              </Badge>
            </div>

            {/* Reading Time */}
            <div className="absolute top-4 right-4 bg-black/50 text-white px-2 py-1 rounded text-xs flex items-center">
              <Clock className="h-3 w-3 mr-1" />
              {post.reading_time} phút
            </div>
          </div>
        )}

        {/* Content */}
        <div className={`p-6 ${featured ? 'pb-8' : ''}`}>
          {/* Tags */}
          {post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {post.tags.slice(0, 3).map(tag => (
                <Link
                  key={tag}
                  href={`/blog?tag=${encodeURIComponent(tag)}`}
                  className="text-xs text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-2 py-1 rounded transition-colors"
                >
                  #{tag}
                </Link>
              ))}
            </div>
          )}

          {/* Title */}
          <h3 className={`font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors line-clamp-2 ${
            featured ? 'text-2xl' : 'text-lg'
          }`}>
            <Link href={`/blog/${post.slug}`}>
              {post.title}
            </Link>
          </h3>

          {/* Excerpt */}
          {showExcerpt && (
            <p className={`text-gray-600 mb-4 line-clamp-3 ${featured ? 'text-base' : 'text-sm'}`}>
              {post.excerpt}
            </p>
          )}

          {/* Meta Info */}
          <div className="flex items-center justify-between text-sm text-gray-500">
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <User className="h-4 w-4 mr-1" />
                {post.author.name}
              </div>
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                {new Date(post.published_at || post.created_at).toLocaleDateString('vi-VN')}
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="flex items-center">
                <Eye className="h-4 w-4 mr-1" />
                {post.views.toLocaleString()}
              </div>
              <div className="flex items-center">
                <Heart className="h-4 w-4 mr-1" />
                {post.likes.toLocaleString()}
              </div>
            </div>
          </div>

          {/* Read More Link */}
          <div className="mt-4">
            <Link 
              href={`/blog/${post.slug}`}
              className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium text-sm group-hover:underline"
            >
              Đọc tiếp
              <svg className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}