'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BookOpen, 
  Search, 
  FileText, 
  Code, 
  Settings, 
  Users, 
  BarChart3,
  Lightbulb,
  Download,
  ExternalLink,
  Star,
  Clock,
  Tag
} from 'lucide-react';

interface DocSection {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  category: 'getting-started' | 'features' | 'advanced' | 'api' | 'admin';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  readTime: number;
  lastUpdated: string;
  popular: boolean;
}

const DOC_SECTIONS: DocSection[] = [
  {
    id: 'quick-start',
    title: 'Quick Start Guide',
    description: 'Bắt đầu với NCSKIT trong 5 phút. Hướng dẫn từng bước để tạo dự án đầu tiên.',
    icon: <Lightbulb className="h-5 w-5" />,
    category: 'getting-started',
    difficulty: 'beginner',
    readTime: 5,
    lastUpdated: '2024-11-06',
    popular: true
  },
  {
    id: 'survey-builder',
    title: 'Survey Builder',
    description: 'Tạo khảo sát chuyên nghiệp với AI-powered builder và question bank.',
    icon: <FileText className="h-5 w-5" />,
    category: 'features',
    difficulty: 'beginner',
    readTime: 15,
    lastUpdated: '2024-11-06',
    popular: true
  },
  {
    id: 'data-collection',
    title: 'Data Collection',
    description: 'Thu thập dữ liệu hiệu quả với campaign management và quality control.',
    icon: <BarChart3 className="h-5 w-5" />,
    category: 'features',
    difficulty: 'intermediate',
    readTime: 12,
    lastUpdated: '2024-11-06',
    popular: false
  },
  {
    id: 'advanced-analytics',
    title: 'Advanced Analytics',
    description: 'Phân tích thống kê nâng cao: SEM, Factor Analysis, Reliability Analysis.',
    icon: <BarChart3 className="h-5 w-5" />,
    category: 'advanced',
    difficulty: 'advanced',
    readTime: 25,
    lastUpdated: '2024-11-06',
    popular: true
  },
  {
    id: 'collaboration',
    title: 'Team Collaboration',
    description: 'Làm việc nhóm hiệu quả với project management và role-based permissions.',
    icon: <Users className="h-5 w-5" />,
    category: 'features',
    difficulty: 'intermediate',
    readTime: 10,
    lastUpdated: '2024-11-06',
    popular: false
  },
  {
    id: 'api-reference',
    title: 'API Reference',
    description: 'Tài liệu API đầy đủ cho developers. RESTful endpoints và authentication.',
    icon: <Code className="h-5 w-5" />,
    category: 'api',
    difficulty: 'advanced',
    readTime: 30,
    lastUpdated: '2024-11-06',
    popular: false
  },
  {
    id: 'admin-guide',
    title: 'Admin Guide',
    description: 'Quản trị hệ thống: user management, system configuration, monitoring.',
    icon: <Settings className="h-5 w-5" />,
    category: 'admin',
    difficulty: 'advanced',
    readTime: 20,
    lastUpdated: '2024-11-06',
    popular: false
  },
  {
    id: 'system-architecture',
    title: 'System Architecture',
    description: 'Kiến trúc hệ thống chi tiết: components, data flow, security.',
    icon: <Settings className="h-5 w-5" />,
    category: 'advanced',
    difficulty: 'advanced',
    readTime: 35,
    lastUpdated: '2024-11-06',
    popular: false
  }
];

const QUICK_LINKS = [
  { title: 'Tạo dự án đầu tiên', href: '#quick-start', icon: <Lightbulb className="h-4 w-4" /> },
  { title: 'Thiết kế khảo sát', href: '#survey-builder', icon: <FileText className="h-4 w-4" /> },
  { title: 'Phân tích dữ liệu', href: '#advanced-analytics', icon: <BarChart3 className="h-4 w-4" /> },
  { title: 'API Documentation', href: '#api-reference', icon: <Code className="h-4 w-4" /> }
];

export default function DocsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');

  const filteredSections = DOC_SECTIONS.filter(section => {
    const matchesSearch = section.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         section.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || section.category === selectedCategory;
    const matchesDifficulty = selectedDifficulty === 'all' || section.difficulty === selectedDifficulty;
    
    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  const popularSections = DOC_SECTIONS.filter(section => section.popular);

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'getting-started': return 'bg-green-100 text-green-800 border-green-200';
      case 'features': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'advanced': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'api': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'admin': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="container mx-auto px-4 py-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3">
          <BookOpen className="h-8 w-8 text-blue-600" />
          <h1 className="text-4xl font-bold text-gray-900">Documentation</h1>
        </div>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Tài liệu hướng dẫn toàn diện cho NCSKIT - Nền tảng nghiên cứu thị trường AI-powered
        </p>
      </div>

      {/* Quick Links */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-500" />
            Quick Links
          </CardTitle>
          <CardDescription>
            Các tài liệu quan trọng và được sử dụng nhiều nhất
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {QUICK_LINKS.map((link, index) => (
              <Button
                key={index}
                variant="outline"
                className="h-auto p-4 justify-start"
                asChild
              >
                <a href={link.href} className="flex items-center gap-3">
                  {link.icon}
                  <span className="font-medium">{link.title}</span>
                </a>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Tìm kiếm tài liệu..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex gap-2">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Tất cả danh mục</option>
                <option value="getting-started">Getting Started</option>
                <option value="features">Features</option>
                <option value="advanced">Advanced</option>
                <option value="api">API</option>
                <option value="admin">Admin</option>
              </select>
              
              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Tất cả cấp độ</option>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="all-docs" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="all-docs">Tất cả tài liệu</TabsTrigger>
          <TabsTrigger value="popular">Phổ biến</TabsTrigger>
        </TabsList>

        <TabsContent value="all-docs" className="space-y-6">
          {/* Documentation Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSections.map((section) => (
              <Card key={section.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        {section.icon}
                      </div>
                      <div>
                        <CardTitle className="text-lg">{section.title}</CardTitle>
                        {section.popular && (
                          <Badge variant="outline" className="mt-1 text-xs bg-yellow-50 text-yellow-700 border-yellow-200">
                            <Star className="h-3 w-3 mr-1" />
                            Popular
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <CardDescription className="text-sm leading-relaxed">
                    {section.description}
                  </CardDescription>
                  
                  <div className="flex flex-wrap gap-2">
                    <Badge className={getCategoryColor(section.category)}>
                      {section.category.replace('-', ' ')}
                    </Badge>
                    <Badge className={getDifficultyColor(section.difficulty)}>
                      {section.difficulty}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {section.readTime} min read
                    </div>
                    <div className="flex items-center gap-1">
                      <Tag className="h-3 w-3" />
                      {section.lastUpdated}
                    </div>
                  </div>
                  
                  <div className="flex gap-2 pt-2">
                    <Button size="sm" className="flex-1">
                      <BookOpen className="h-4 w-4 mr-2" />
                      Đọc tài liệu
                    </Button>
                    <Button size="sm" variant="outline">
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="popular" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {popularSections.map((section) => (
              <Card key={section.id} className="hover:shadow-lg transition-shadow cursor-pointer border-yellow-200 bg-yellow-50">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-yellow-100 rounded-lg">
                        {section.icon}
                      </div>
                      <div>
                        <CardTitle className="text-lg">{section.title}</CardTitle>
                        <Badge variant="outline" className="mt-1 text-xs bg-yellow-100 text-yellow-800 border-yellow-300">
                          <Star className="h-3 w-3 mr-1" />
                          Popular
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <CardDescription className="text-sm leading-relaxed">
                    {section.description}
                  </CardDescription>
                  
                  <div className="flex flex-wrap gap-2">
                    <Badge className={getCategoryColor(section.category)}>
                      {section.category.replace('-', ' ')}
                    </Badge>
                    <Badge className={getDifficultyColor(section.difficulty)}>
                      {section.difficulty}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {section.readTime} min read
                    </div>
                    <div className="flex items-center gap-1">
                      <Tag className="h-3 w-3" />
                      {section.lastUpdated}
                    </div>
                  </div>
                  
                  <div className="flex gap-2 pt-2">
                    <Button size="sm" className="flex-1">
                      <BookOpen className="h-4 w-4 mr-2" />
                      Đọc tài liệu
                    </Button>
                    <Button size="sm" variant="outline">
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Additional Resources */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5" />
              Downloads
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full justify-start">
              <FileText className="h-4 w-4 mr-2" />
              NCSKIT User Guide (PDF)
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Code className="h-4 w-4 mr-2" />
              API Reference (PDF)
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Settings className="h-4 w-4 mr-2" />
              Admin Guide (PDF)
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ExternalLink className="h-5 w-5" />
              External Resources
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full justify-start">
              <BookOpen className="h-4 w-4 mr-2" />
              Video Tutorials
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Users className="h-4 w-4 mr-2" />
              Community Forum
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Lightbulb className="h-4 w-4 mr-2" />
              Best Practices Blog
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Help Section */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-6 text-center">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">
            Cần hỗ trợ thêm?
          </h3>
          <p className="text-blue-700 mb-4">
            Không tìm thấy thông tin bạn cần? Đội ngũ hỗ trợ của chúng tôi luôn sẵn sàng giúp đỡ.
          </p>
          <div className="flex justify-center gap-3">
            <Button>
              Liên hệ hỗ trợ
            </Button>
            <Button variant="outline">
              Tham gia Community
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}