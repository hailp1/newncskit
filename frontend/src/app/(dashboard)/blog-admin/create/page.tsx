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
    try {
      // Convert categories and tags to proper format
      const postData = {
        ...post,
        categories: post.categories?.map((cat: any) => cat.id || cat) || [],
        tags: post.tags?.map((tag: any) => tag.id || tag) || []
      };
      
      const savedPost = await blogService.createPost(postData);
      console.log('Blog post saved:', savedPost);
      // Redirect to edit page or show success message
    } catch (error) {
      console.error('Error saving post:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handlePublish = async (post: any) => {
    setIsSaving(true);
    try {
      const postData = {
        ...post,
        status: 'published',
        categories: post.categories?.map((cat: any) => cat.id || cat) || [],
        tags: post.tags?.map((tag: any) => tag.id || tag) || []
      };
      
      const publishedPost = await blogService.createPost(postData);
      console.log('Blog post published:', publishedPost);
      // Redirect or show success message
    } catch (error) {
      console.error('Error publishing post:', error);
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