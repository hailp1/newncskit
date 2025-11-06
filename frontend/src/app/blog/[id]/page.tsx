'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import PageLayout from '@/components/layout/page-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  Calendar, 
  User, 
  Clock, 
  Eye,
  MessageCircle,
  Share2,
  Bookmark,
  ThumbsUp,
  Tag,
  ArrowLeft,
  Twitter,
  Facebook,
  Linkedin,
  Link as LinkIcon
} from 'lucide-react';
import Link from 'next/link';
import { blogService, BlogPost, BlogComment } from '@/services/blog';

// Interface để hiển thị blog post
interface BlogPostDisplay {
  id: string;
  title: string;
  content: string;
  author: {
    name: string;
    bio: string;
    avatar?: string;
  };
  publishedAt: string;
  updatedAt?: string;
  readTime: number;
  category: string;
  tags: string[];
  views: number;
  likes: number;
  comments: number;
  featured: boolean;
}

interface CommentDisplay {
  id: string;
  author: string;
  content: string;
  publishedAt: string;
  likes: number;
}

export default function BlogPostPage() {
  const params = useParams();
  const [post, setPost] = useState<BlogPostDisplay | null>(null);
  const [comments, setComments] = useState<CommentDisplay[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);

  useEffect(() => {
    if (params.id) {
      loadPost(params.id as string);
    }
  }, [params.id]);

  const loadPost = async (postId: string) => {
    try {
      setIsLoading(true);
      
      // Load post
      const blogPost = await blogService.getPostById(postId);
      
      // Load comments
      const blogComments = await blogService.getComments(postId);
      
      // Transform API data to display format
      const displayPost: BlogPostDisplay = {
        id: blogPost.id,
        title: blogPost.title,
        content: blogPost.content,
        author: {
          name: `${blogPost.author.first_name} ${blogPost.author.last_name}`.trim() || blogPost.author.username,
          bio: `Tác giả tại NCSKIT với chuyên môn về ${blogPost.categories.map(c => c.name).join(', ')}.`,
          avatar: undefined
        },
        publishedAt: blogPost.published_at || blogPost.created_at,
        updatedAt: blogPost.updated_at,
        readTime: blogPost.reading_time,
        category: blogPost.categories.length > 0 ? blogPost.categories[0].name : 'Chưa phân loại',
        tags: blogPost.tags.map(tag => tag.name),
        views: blogPost.view_count,
        likes: blogPost.like_count,
        comments: blogPost.comment_count,
        featured: blogPost.categories.some(cat => cat.name.toLowerCase().includes('featured')) || blogPost.seo_score > 80
      };
      
      const displayComments: CommentDisplay[] = blogComments.map(comment => ({
        id: comment.id,
        author: `${comment.author.first_name} ${comment.author.last_name}`.trim() || comment.author.username,
        content: comment.content,
        publishedAt: comment.created_at,
        likes: 0 // API không có likes cho comments
      }));
      
      setPost(displayPost);
      setComments(displayComments);
      
      // Increment view count
      await blogService.incrementView(postId);
      
    } catch (error) {
      console.error('Error loading post:', error);
      setPost(null);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleShare = (platform: string) => {
    const url = window.location.href;
    const title = post?.title || '';
    
    let shareUrl = '';
    switch (platform) {
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`;
        break;
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
        break;
      case 'copy':
        navigator.clipboard.writeText(url);
        return;
    }
    
    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=600,height=400');
    }
  };

  const handleLike = async () => {
    if (!post) return;
    
    try {
      const action = liked ? 'unlike' : 'like';
      await blogService.likePost(post.id, action);
      setLiked(!liked);
      
      // Update post likes count locally
      setPost(prev => prev ? {
        ...prev,
        likes: prev.likes + (liked ? -1 : 1)
      } : null);
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  if (isLoading) {
    return (
      <PageLayout>
        <div className="max-w-4xl mx-auto px-6 py-12">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded mb-4"></div>
            <div className="h-4 bg-gray-200 rounded mb-2"></div>
            <div className="h-4 bg-gray-200 rounded mb-8"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </PageLayout>
    );
  }

  if (!post) {
    return (
      <PageLayout>
        <div className="max-w-4xl mx-auto px-6 py-12 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Không tìm thấy bài viết</h1>
          <p className="text-gray-600 mb-8">Bài viết bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.</p>
          <Link href="/blog">
            <Button>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Quay lại Blog
            </Button>
          </Link>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="max-w-4xl mx-auto px-6 py-12">
          
          {/* Back Button */}
          <div className="mb-8">
            <Link href="/blog">
              <Button variant="ghost">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Quay lại Blog
              </Button>
            </Link>
          </div>

          {/* Article Header */}
          <Card className="mb-8">
            <CardHeader>
              <div className="flex items-center gap-2 mb-4">
                <Badge variant="secondary">{post.category}</Badge>
                {post.featured && (
                  <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                    Nổi bật
                  </Badge>
                )}
              </div>
              
              <CardTitle className="text-3xl font-bold text-gray-900 mb-4">
                {post.title}
              </CardTitle>
              
              <div className="flex items-center justify-between text-sm text-gray-500 mb-6">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <span>{post.author.name}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>{formatDate(post.publishedAt)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{post.readTime} phút đọc</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    <Eye className="h-4 w-4" />
                    <span>{post.views}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MessageCircle className="h-4 w-4" />
                    <span>{post.comments}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <Button
                  variant={liked ? "default" : "outline"}
                  size="sm"
                  onClick={handleLike}
                >
                  <ThumbsUp className="h-4 w-4 mr-1" />
                  {post.likes}
                </Button>
                
                <Button
                  variant={bookmarked ? "default" : "outline"}
                  size="sm"
                  onClick={() => setBookmarked(!bookmarked)}
                >
                  <Bookmark className="h-4 w-4 mr-1" />
                  {bookmarked ? 'Đã lưu' : 'Lưu'}
                </Button>
                
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleShare('twitter')}
                  >
                    <Twitter className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleShare('facebook')}
                  >
                    <Facebook className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleShare('linkedin')}
                  >
                    <Linkedin className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleShare('copy')}
                  >
                    <LinkIcon className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Article Content */}
          <Card className="mb-8">
            <CardContent className="p-8">
              <div 
                className="prose prose-lg max-w-none"
                dangerouslySetInnerHTML={{ __html: post.content }}
              />
              
              <Separator className="my-8" />
              
              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-6">
                {post.tags.map((tag) => (
                  <Badge key={tag} variant="outline">
                    <Tag className="h-3 w-3 mr-1" />
                    {tag}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Author Bio */}
          <Card className="mb-8">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                  {post.author.name.charAt(0)}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {post.author.name}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    {post.author.bio}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Comments Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                Bình luận ({comments.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {comments.map((comment) => (
                  <div key={comment.id} className="border-b border-gray-200 pb-4 last:border-b-0">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                        {comment.author.charAt(0)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-gray-900">{comment.author}</span>
                          <span className="text-sm text-gray-500">
                            {formatDate(comment.publishedAt)}
                          </span>
                        </div>
                        <p className="text-gray-700 mb-2">{comment.content}</p>
                        <Button variant="ghost" size="sm">
                          <ThumbsUp className="h-3 w-3 mr-1" />
                          {comment.likes}
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageLayout>
  );
}