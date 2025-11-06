'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import DOMPurify from 'dompurify';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Bold, 
  Italic, 
  Underline, 
  List, 
  ListOrdered, 
  Quote, 
  Link, 
  Image, 
  Code, 
  Heading1, 
  Heading2, 
  Heading3,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Undo,
  Redo,
  Eye,
  Type,
  Save,
  Upload,
  Settings,
  Tag,
  Calendar,
  Globe,
  FileText,
  BarChart3
} from 'lucide-react';
import { SEOAnalyzer } from './seo-analyzer';

interface BlogPost {
  id?: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  status: 'draft' | 'review' | 'scheduled' | 'published';
  meta_title: string;
  meta_description: string;
  focus_keyword: string;
  canonical_url: string;
  og_title: string;
  og_description: string;
  categories: Array<{ id: string; name: string; slug: string }>;
  tags: Array<{ id: string; name: string; slug: string }>;
  featured_image?: string;
  published_at?: string;
  scheduled_at?: string;
}

interface BlogEditorProps {
  post?: BlogPost;
  onSave: (post: Partial<BlogPost>) => void;
  onPublish?: (post: Partial<BlogPost>) => void;
  onSchedule?: (post: Partial<BlogPost>, scheduledAt: string) => void;
  categories?: Array<{ id: string; name: string; slug: string }>;
  tags?: Array<{ id: string; name: string; slug: string }>;
}

export const BlogEditor: React.FC<BlogEditorProps> = ({ 
  post, 
  onSave, 
  onPublish, 
  onSchedule,
  categories = [],
  tags = []
}) => {
  const [currentPost, setCurrentPost] = useState<BlogPost>(post || {
    title: '',
    slug: '',
    content: '',
    excerpt: '',
    status: 'draft',
    meta_title: '',
    meta_description: '',
    focus_keyword: '',
    canonical_url: '',
    og_title: '',
    og_description: '',
    categories: [],
    tags: []
  });

  const [isPreview, setIsPreview] = useState(false);
  const [selectedText, setSelectedText] = useState('');
  const [activeTab, setActiveTab] = useState<'content' | 'seo' | 'social' | 'settings'>('content');
  const [autoSaveStatus, setAutoSaveStatus] = useState<'saved' | 'saving' | 'unsaved'>('saved');
  const [wordCount, setWordCount] = useState(0);
  const [readingTime, setReadingTime] = useState(0);
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-save functionality
  const triggerAutoSave = useCallback(() => {
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }
    
    setAutoSaveStatus('unsaved');
    
    autoSaveTimeoutRef.current = setTimeout(() => {
      setAutoSaveStatus('saving');
      onSave(currentPost);
      setTimeout(() => setAutoSaveStatus('saved'), 1000);
    }, 2000);
  }, [currentPost, onSave]);

  // Update post data
  const updatePost = useCallback((updates: Partial<BlogPost>) => {
    setCurrentPost(prev => ({ ...prev, ...updates }));
  }, []);

  // Trigger auto-save when post changes
  useEffect(() => {
    if (currentPost.title || currentPost.content) {
      triggerAutoSave();
    }
  }, [currentPost, triggerAutoSave]);

  // Calculate word count and reading time
  useEffect(() => {
    const words = currentPost.content.split(/\s+/).filter(word => word.length > 0).length;
    setWordCount(words);
    setReadingTime(Math.ceil(words / 200)); // Average reading speed: 200 words/minute
  }, [currentPost.content]);

  // Auto-generate slug from title
  useEffect(() => {
    if (currentPost.title && !currentPost.slug) {
      const slug = currentPost.title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
      setCurrentPost(prev => ({ ...prev, slug }));
    }
  }, [currentPost.title, currentPost.slug]);

  const insertText = (before: string, after: string = '') => {
    const textarea = editorRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = currentPost.content.substring(start, end);
    
    const newContent = currentPost.content.substring(0, start) + before + selectedText + after + currentPost.content.substring(end);
    updatePost({ content: newContent });

    // Restore cursor position
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, end + before.length);
    }, 0);
  };

  const insertHeading = (level: number) => {
    const prefix = '#'.repeat(level) + ' ';
    insertText(prefix);
  };

  const insertList = (ordered: boolean = false) => {
    const prefix = ordered ? '1. ' : '- ';
    insertText(prefix);
  };

  const insertLink = () => {
    const url = prompt('Nhập URL:');
    if (url) {
      const text = selectedText || 'link text';
      insertText(`[${text}](${url})`);
    }
  };

  const insertImage = () => {
    const url = prompt('Nhập URL hình ảnh:');
    const alt = prompt('Nhập alt text:') || 'image';
    if (url) {
      insertText(`![${alt}](${url})`);
    }
  };

  const insertCode = () => {
    if (selectedText.includes('\n')) {
      insertText('```\n', '\n```');
    } else {
      insertText('`', '`');
    }
  };

  const handleTextSelection = () => {
    const textarea = editorRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    setSelectedText(currentPost.content.substring(start, end));
  };

  const renderPreview = () => {
    
    // Simple markdown to HTML conversion for preview
    let html = currentPost.content
      .replace(/^### (.*$)/gim, '<h3 class="text-lg font-semibold mt-4 mb-2">$1</h3>')
      .replace(/^## (.*$)/gim, '<h2 class="text-xl font-semibold mt-6 mb-3">$1</h2>')
      .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold mt-8 mb-4">$1</h1>')
      .replace(/\*\*(.*)\*\*/gim, '<strong class="font-semibold">$1</strong>')
      .replace(/\*(.*)\*/gim, '<em class="italic">$1</em>')
      .replace(/!\[([^\]]*)\]\(([^\)]*)\)/gim, '<img alt="$1" src="$2" class="max-w-full h-auto rounded-lg my-4" />')
      .replace(/\[([^\]]*)\]\(([^\)]*)\)/gim, '<a href="$2" class="text-blue-600 hover:underline">$1</a>')
      .replace(/`([^`]*)`/gim, '<code class="bg-gray-100 px-1 py-0.5 rounded text-sm font-mono">$1</code>')
      .replace(/```([^```]*)```/gim, '<pre class="bg-gray-100 p-4 rounded-lg overflow-x-auto my-4"><code class="text-sm font-mono">$1</code></pre>')
      .replace(/^> (.*$)/gim, '<blockquote class="border-l-4 border-gray-300 pl-4 italic my-4">$1</blockquote>')
      .replace(/^\- (.*$)/gim, '<li class="ml-4">$1</li>')
      .replace(/^\d+\. (.*$)/gim, '<li class="ml-4">$1</li>')
      .replace(/\n/gim, '<br>');

    // Sanitize HTML to prevent XSS attacks
    const sanitizedHtml = DOMPurify.sanitize(html, {
      ALLOWED_TAGS: ['h1', 'h2', 'h3', 'strong', 'em', 'img', 'a', 'code', 'pre', 'blockquote', 'li', 'br'],
      ALLOWED_ATTR: ['class', 'alt', 'src', 'href']
    });

    return { __html: sanitizedHtml };
  };

  const handlePublish = () => {
    if (onPublish) {
      onPublish({ ...currentPost, status: 'published', published_at: new Date().toISOString() });
    }
  };

  const handleSchedule = () => {
    const scheduledAt = prompt('Nhập thời gian xuất bản (YYYY-MM-DD HH:MM):');
    if (scheduledAt && onSchedule) {
      onSchedule({ ...currentPost, status: 'scheduled' }, scheduledAt);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            {currentPost.id ? 'Chỉnh sửa bài viết' : 'Tạo bài viết mới'}
          </h1>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant={autoSaveStatus === 'saved' ? 'default' : autoSaveStatus === 'saving' ? 'secondary' : 'destructive'}>
              {autoSaveStatus === 'saved' ? 'Đã lưu' : autoSaveStatus === 'saving' ? 'Đang lưu...' : 'Chưa lưu'}
            </Badge>
            <span className="text-sm text-gray-500">
              {wordCount} từ • {readingTime} phút đọc
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => onSave(currentPost)}>
            <Save className="h-4 w-4 mr-2" />
            Lưu nháp
          </Button>
          <Button variant="outline" onClick={handleSchedule}>
            <Calendar className="h-4 w-4 mr-2" />
            Lên lịch
          </Button>
          <Button onClick={handlePublish}>
            <Globe className="h-4 w-4 mr-2" />
            Xuất bản
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Editor Area */}
        <div className="lg:col-span-3 space-y-4">
          {/* Title and Basic Info */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Tiêu đề bài viết</Label>
              <Input
                id="title"
                value={currentPost.title}
                onChange={(e) => updatePost({ title: e.target.value })}
                placeholder="Nhập tiêu đề bài viết..."
                className="text-lg font-semibold"
              />
            </div>
            <div>
              <Label htmlFor="slug">Slug (URL)</Label>
              <Input
                id="slug"
                value={currentPost.slug}
                onChange={(e) => updatePost({ slug: e.target.value })}
                placeholder="url-bai-viet"
              />
            </div>
            <div>
              <Label htmlFor="excerpt">Tóm tắt</Label>
              <Textarea
                id="excerpt"
                value={currentPost.excerpt}
                onChange={(e) => updatePost({ excerpt: e.target.value })}
                placeholder="Viết tóm tắt ngắn gọn về bài viết..."
                rows={3}
              />
            </div>
          </div>

          {/* Content Editor */}
          <div className="border border-gray-300 rounded-lg overflow-hidden">
            {/* Toolbar */}
            <div className="bg-gray-50 border-b border-gray-300 p-2">
              <div className="flex flex-wrap gap-1">
                {/* Text Formatting */}
                <div className="flex gap-1 border-r border-gray-300 pr-2 mr-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => insertText('**', '**')}
                    title="Bold"
                  >
                    <Bold className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => insertText('*', '*')}
                    title="Italic"
                  >
                    <Italic className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => insertText('~~', '~~')}
                    title="Strikethrough"
                  >
                    <Underline className="h-4 w-4" />
                  </Button>
                </div>

                {/* Headings */}
                <div className="flex gap-1 border-r border-gray-300 pr-2 mr-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => insertHeading(1)}
                    title="Heading 1"
                  >
                    <Heading1 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => insertHeading(2)}
                    title="Heading 2"
                  >
                    <Heading2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => insertHeading(3)}
                    title="Heading 3"
                  >
                    <Heading3 className="h-4 w-4" />
                  </Button>
                </div>

                {/* Lists */}
                <div className="flex gap-1 border-r border-gray-300 pr-2 mr-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => insertList(false)}
                    title="Bullet List"
                  >
                    <List className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => insertList(true)}
                    title="Numbered List"
                  >
                    <ListOrdered className="h-4 w-4" />
                  </Button>
                </div>

                {/* Insert Elements */}
                <div className="flex gap-1 border-r border-gray-300 pr-2 mr-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={insertLink}
                    title="Insert Link"
                  >
                    <Link className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={insertImage}
                    title="Insert Image"
                  >
                    <Image className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={insertCode}
                    title="Code"
                  >
                    <Code className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => insertText('> ')}
                    title="Quote"
                  >
                    <Quote className="h-4 w-4" />
                  </Button>
                </div>

                {/* Preview Toggle */}
                <div className="flex gap-1">
                  <Button
                    variant={isPreview ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setIsPreview(!isPreview)}
                    title="Toggle Preview"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Editor/Preview Area */}
            <div className="relative">
              {isPreview ? (
                <div 
                  className="p-6 min-h-96 prose max-w-none"
                  dangerouslySetInnerHTML={renderPreview()}
                />
              ) : (
                <textarea
                  ref={editorRef}
                  value={currentPost.content}
                  onChange={(e) => updatePost({ content: e.target.value })}
                  onSelect={handleTextSelection}
                  placeholder="Bắt đầu viết nội dung bài blog của bạn..."
                  className="w-full min-h-96 p-6 border-none outline-none resize-none font-mono text-sm leading-relaxed"
                  style={{ fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace' }}
                />
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Tabs */}
          <div className="flex flex-col space-y-2">
            <Button
              variant={activeTab === 'content' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('content')}
              className="justify-start"
            >
              <FileText className="h-4 w-4 mr-2" />
              Nội dung
            </Button>
            <Button
              variant={activeTab === 'seo' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('seo')}
              className="justify-start"
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              SEO
            </Button>
            <Button
              variant={activeTab === 'social' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('social')}
              className="justify-start"
            >
              <Globe className="h-4 w-4 mr-2" />
              Mạng xã hội
            </Button>
            <Button
              variant={activeTab === 'settings' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('settings')}
              className="justify-start"
            >
              <Settings className="h-4 w-4 mr-2" />
              Cài đặt
            </Button>
          </div>

          {/* Tab Content */}
          {activeTab === 'content' && (
            <div className="space-y-4">
              <div>
                <Label>Danh mục</Label>
                <div className="mt-2 space-y-2">
                  {categories.map(category => (
                    <label key={category.id} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={currentPost.categories.some(cat => cat.id === category.id)}
                        onChange={(e) => {
                          const newCategories = e.target.checked
                            ? [...currentPost.categories, category]
                            : currentPost.categories.filter(cat => cat.id !== category.id);
                          updatePost({ categories: newCategories });
                        }}
                      />
                      <span className="text-sm">{category.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <Label>Tags</Label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {currentPost.tags.map(tag => (
                    <Badge key={tag.id} variant="secondary">
                      {tag.name}
                      <button
                        onClick={() => {
                          const newTags = currentPost.tags.filter(t => t.id !== tag.id);
                          updatePost({ tags: newTags });
                        }}
                        className="ml-1 text-xs"
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'seo' && (
            <SEOAnalyzer
              content={currentPost.content}
              title={currentPost.title}
              metaDescription={currentPost.meta_description}
              focusKeyword={currentPost.focus_keyword}
              onUpdateSEO={(seoData) => updatePost(seoData)}
            />
          )}

          {activeTab === 'social' && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="og_title">Facebook Title</Label>
                <Input
                  id="og_title"
                  value={currentPost.og_title}
                  onChange={(e) => updatePost({ og_title: e.target.value })}
                  placeholder="Tiêu đề hiển thị trên Facebook"
                />
              </div>
              <div>
                <Label htmlFor="og_description">Facebook Description</Label>
                <Textarea
                  id="og_description"
                  value={currentPost.og_description}
                  onChange={(e) => updatePost({ og_description: e.target.value })}
                  placeholder="Mô tả hiển thị trên Facebook"
                  rows={3}
                />
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="canonical_url">Canonical URL</Label>
                <Input
                  id="canonical_url"
                  value={currentPost.canonical_url}
                  onChange={(e) => updatePost({ canonical_url: e.target.value })}
                  placeholder="https://example.com/canonical-url"
                />
              </div>
              <div>
                <Label>Trạng thái</Label>
                <select
                  value={currentPost.status}
                  onChange={(e) => updatePost({ status: e.target.value as BlogPost['status'] })}
                  className="w-full mt-1 p-2 border border-gray-300 rounded-md"
                >
                  <option value="draft">Nháp</option>
                  <option value="review">Đang xem xét</option>
                  <option value="scheduled">Đã lên lịch</option>
                  <option value="published">Đã xuất bản</option>
                </select>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};