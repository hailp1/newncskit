'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { 
  Save, 
  Eye, 
  Send, 
  Image, 
  Link, 
  Hash, 
  Search, 
  TrendingUp,
  Target,
  Globe,
  Calendar,
  User,
  Tag,
  FileText,
  Lightbulb,
  Zap,
  BarChart3,
  CheckCircle,
  AlertTriangle,
  Info
} from 'lucide-react';
import { BlogEditor } from '../../../../components/blog/blog-editor';
import { blogService, BlogPost as BlogPostType, BlogCategory, BlogTag } from '@/services/blog';



export default function CreateBlogPage() {
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [tags, setTags] = useState<BlogTag[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load categories and tags
  useEffect(() => {
    const loadData = async () => {
      try {
        const [categoriesData, tagsData] = await Promise.all([
          blogService.getCategories(),
          blogService.getTags()
        ]);
        setCategories(categoriesData);
        setTags(tagsData);
      } catch (error) {
        console.error('Error loading blog data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (post: any) => {
    setIsSaving(true);
    setError(null);
    setSuccess(null);
    
    try {
      // Validate required fields
      if (!post.title) {
        setError('Vui lòng nhập tiêu đề bài viết');
        return;
      }

      // Convert categories and tags to proper format
      const postData = {
        ...post,
        status: 'draft',
        categories: post.categories?.map((cat: any) => cat.id || cat) || [],
        tags: post.tags?.map((tag: any) => tag.id || tag) || []
      };
      
      const savedPost = await blogService.createPost(postData);
      console.log('Blog post saved:', savedPost);
      
      setSuccess('Bài viết đã được lưu thành công!');
      
    } catch (error: any) {
      console.error('Error saving post:', error);
      const errorMessage = error?.response?.data?.message || error?.message || 'Không thể lưu bài viết. Vui lòng thử lại.';
      setError(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handlePublish = async (post: any) => {
    setIsSaving(true);
    setError(null);
    setSuccess(null);
    
    try {
      // Validate required fields
      if (!post.title || !post.content) {
        setError('Vui lòng nhập tiêu đề và nội dung bài viết');
        return;
      }

      const postData = {
        ...post,
        status: 'published',
        published_at: new Date().toISOString(),
        categories: post.categories?.map((cat: any) => cat.id || cat) || [],
        tags: post.tags?.map((tag: any) => tag.id || tag) || []
      };
      
      const publishedPost = await blogService.createPost(postData);
      console.log('Blog post published:', publishedPost);
      
      setSuccess('Bài viết đã được xuất bản thành công!');
      
      // Redirect to blog admin after 2 seconds
      setTimeout(() => {
        window.location.href = '/blog-admin';
      }, 2000);
      
    } catch (error: any) {
      console.error('Error publishing post:', error);
      const errorMessage = error?.response?.data?.message || error?.message || 'Không thể xuất bản bài viết. Vui lòng thử lại.';
      setError(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSchedule = async (post: any, scheduledAt: string) => {
    setIsSaving(true);
    try {
      const postData = {
        ...post,
        status: 'scheduled',
        scheduled_at: scheduledAt,
        categories: post.categories?.map((cat: any) => cat.id || cat) || [],
        tags: post.tags?.map((tag: any) => tag.id || tag) || []
      };
      
      const scheduledPost = await blogService.createPost(postData);
      console.log('Blog post scheduled:', scheduledPost);
    } catch (error) {
      console.error('Error scheduling post:', error);
    } finally {
      setIsSaving(false);
    }
  };



  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Error/Success Messages */}
      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg flex items-start">
          <svg className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <div>
            <p className="font-medium">Lỗi</p>
            <p className="text-sm">{error}</p>
          </div>
        </div>
      )}
      
      {success && (
        <div className="mb-4 bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg flex items-start">
          <svg className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <div>
            <p className="font-medium">Thành công</p>
            <p className="text-sm">{success}</p>
          </div>
        </div>
      )}

      <BlogEditor
        onSave={handleSave}
        onPublish={handlePublish}
        onSchedule={handleSchedule}
        categories={categories}
        tags={tags}
      />
    </div>
  );
}