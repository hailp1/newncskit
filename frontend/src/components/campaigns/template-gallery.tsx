'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  Search, 
  Filter, 
  Star, 
  Users, 
  Clock, 
  TrendingUp,
  BookOpen,
  Briefcase,
  Heart,
  Laptop,
  GraduationCap,
  BarChart3
} from 'lucide-react'

interface CampaignTemplate {
  id: string
  name: string
  description: string
  category: string
  previewImage?: string
  defaultSettings: any
  customizableFields: string[]
  requiredFields: string[]
  usageCount: number
  rating: number
  isPublic: boolean
  isFeatured: boolean
  createdBy: string
  tags: string[]
  estimatedTime: number
  targetParticipants: number
  estimatedReward: number
}

const TEMPLATE_CATEGORIES = [
  { id: 'all', name: 'Tất cả', icon: BarChart3 },
  { id: 'academic', name: 'Nghiên cứu học thuật', icon: GraduationCap },
  { id: 'market', name: 'Nghiên cứu thị trường', icon: Briefcase },
  { id: 'social', name: 'Nghiên cứu xã hội', icon: Users },
  { id: 'health', name: 'Sức khỏe & Y tế', icon: Heart },
  { id: 'technology', name: 'Công nghệ', icon: Laptop },
  { id: 'education', name: 'Giáo dục', icon: BookOpen }
]

const MOCK_TEMPLATES: CampaignTemplate[] = [
  {
    id: '1',
    name: 'Khảo sát hài lòng khách hàng',
    description: 'Template chuẩn để đo lường mức độ hài lòng của khách hàng với sản phẩm/dịch vụ',
    category: 'market',
    defaultSettings: {
      targetParticipants: 200,
      tokenRewardPerParticipant: 15,
      duration: 14,
      estimatedCompletionTime: 8
    },
    customizableFields: ['targetParticipants', 'tokenRewardPerParticipant', 'duration'],
    requiredFields: ['title', 'description'],
    usageCount: 1250,
    rating: 4.8,
    isPublic: true,
    isFeatured: true,
    createdBy: 'NCSKIT Team',
    tags: ['customer satisfaction', 'feedback', 'service quality'],
    estimatedTime: 8,
    targetParticipants: 200,
    estimatedReward: 15
  },
  {
    id: '2',
    name: 'Nghiên cứu hành vi người dùng',
    description: 'Template để nghiên cứu patterns và preferences trong hành vi sử dụng sản phẩm',
    category: 'academic',
    defaultSettings: {
      targetParticipants: 300,
      tokenRewardPerParticipant: 20,
      duration: 21,
      estimatedCompletionTime: 12
    },
    customizableFields: ['targetParticipants', 'tokenRewardPerParticipant', 'duration'],
    requiredFields: ['title', 'description', 'researchObjectives'],
    usageCount: 890,
    rating: 4.6,
    isPublic: true,
    isFeatured: true,
    createdBy: 'Dr. Nguyen Van A',
    tags: ['user behavior', 'UX research', 'psychology'],
    estimatedTime: 12,
    targetParticipants: 300,
    estimatedReward: 20
  },
  {
    id: '3',
    name: 'Đánh giá chất lượng giáo dục',
    description: 'Template cho việc đánh giá hiệu quả và chất lượng của các chương trình giáo dục',
    category: 'education',
    defaultSettings: {
      targetParticipants: 150,
      tokenRewardPerParticipant: 12,
      duration: 10,
      estimatedCompletionTime: 6
    },
    customizableFields: ['targetParticipants', 'tokenRewardPerParticipant'],
    requiredFields: ['title', 'description', 'educationLevel'],
    usageCount: 567,
    rating: 4.7,
    isPublic: true,
    isFeatured: false,
    createdBy: 'Education Research Group',
    tags: ['education', 'quality assessment', 'learning outcomes'],
    estimatedTime: 6,
    targetParticipants: 150,
    estimatedReward: 12
  },
  {
    id: '4',
    name: 'Khảo sát sức khỏe cộng đồng',
    description: 'Template để thu thập dữ liệu về tình trạng sức khỏe và thói quen sinh hoạt',
    category: 'health',
    defaultSettings: {
      targetParticipants: 500,
      tokenRewardPerParticipant: 25,
      duration: 30,
      estimatedCompletionTime: 15
    },
    customizableFields: ['targetParticipants', 'tokenRewardPerParticipant', 'duration'],
    requiredFields: ['title', 'description', 'healthFocus'],
    usageCount: 423,
    rating: 4.9,
    isPublic: true,
    isFeatured: true,
    createdBy: 'Health Research Institute',
    tags: ['public health', 'wellness', 'lifestyle'],
    estimatedTime: 15,
    targetParticipants: 500,
    estimatedReward: 25
  },
  {
    id: '5',
    name: 'Nghiên cứu xu hướng công nghệ',
    description: 'Template để khảo sát về adoption và perception của các công nghệ mới',
    category: 'technology',
    defaultSettings: {
      targetParticipants: 250,
      tokenRewardPerParticipant: 18,
      duration: 14,
      estimatedCompletionTime: 10
    },
    customizableFields: ['targetParticipants', 'tokenRewardPerParticipant'],
    requiredFields: ['title', 'description', 'technologyFocus'],
    usageCount: 334,
    rating: 4.5,
    isPublic: true,
    isFeatured: false,
    createdBy: 'Tech Innovation Lab',
    tags: ['technology adoption', 'innovation', 'digital transformation'],
    estimatedTime: 10,
    targetParticipants: 250,
    estimatedReward: 18
  },
  {
    id: '6',
    name: 'Khảo sát tác động xã hội',
    description: 'Template để đánh giá tác động của các chính sách hoặc chương trình xã hội',
    category: 'social',
    defaultSettings: {
      targetParticipants: 400,
      tokenRewardPerParticipant: 22,
      duration: 21,
      estimatedCompletionTime: 14
    },
    customizableFields: ['targetParticipants', 'tokenRewardPerParticipant', 'duration'],
    requiredFields: ['title', 'description', 'socialImpactArea'],
    usageCount: 278,
    rating: 4.4,
    isPublic: true,
    isFeatured: false,
    createdBy: 'Social Research Center',
    tags: ['social impact', 'policy evaluation', 'community development'],
    estimatedTime: 14,
    targetParticipants: 400,
    estimatedReward: 22
  }
]

interface TemplateGalleryProps {
  onSelectTemplate: (template: CampaignTemplate) => void
  onCreateFromTemplate: (templateId: string) => void
}

export default function TemplateGallery({ onSelectTemplate, onCreateFromTemplate }: TemplateGalleryProps) {
  const [templates, setTemplates] = useState<CampaignTemplate[]>(MOCK_TEMPLATES)
  const [filteredTemplates, setFilteredTemplates] = useState<CampaignTemplate[]>(MOCK_TEMPLATES)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState<'popular' | 'rating' | 'recent'>('popular')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    filterAndSortTemplates()
  }, [selectedCategory, searchTerm, sortBy, templates])

  const filterAndSortTemplates = () => {
    let filtered = templates

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(template => template.category === selectedCategory)
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(template =>
        template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        template.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    }

    // Sort templates
    switch (sortBy) {
      case 'popular':
        filtered.sort((a, b) => b.usageCount - a.usageCount)
        break
      case 'rating':
        filtered.sort((a, b) => b.rating - a.rating)
        break
      case 'recent':
        // For demo, we'll use usage count as proxy for recency
        filtered.sort((a, b) => b.usageCount - a.usageCount)
        break
    }

    setFilteredTemplates(filtered)
  }

  const getCategoryIcon = (categoryId: string) => {
    const category = TEMPLATE_CATEGORIES.find(cat => cat.id === categoryId)
    return category ? category.icon : BarChart3
  }

  const handleUseTemplate = async (template: CampaignTemplate) => {
    setIsLoading(true)
    try {
      // Simulate API call to increment usage
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Update usage count locally
      setTemplates(prev => prev.map(t => 
        t.id === template.id 
          ? { ...t, usageCount: t.usageCount + 1 }
          : t
      ))
      
      onCreateFromTemplate(template.id)
    } catch (error) {
      console.error('Error using template:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`h-3 w-3 ${
          index < Math.floor(rating) 
            ? 'text-yellow-400 fill-current' 
            : 'text-gray-300'
        }`}
      />
    ))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Template Gallery</h2>
        <p className="text-gray-600">
          Chọn template phù hợp để tạo chiến dịch nhanh chóng và hiệu quả
        </p>
      </div>

      {/* Filters and Search */}
      <div className="space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Tìm kiếm template..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2">
          {TEMPLATE_CATEGORIES.map((category) => {
            const Icon = category.icon
            return (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(category.id)}
                className="flex items-center space-x-2"
              >
                <Icon className="h-4 w-4" />
                <span>{category.name}</span>
              </Button>
            )
          })}
        </div>

        {/* Sort Options */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-600">Sắp xếp theo:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'popular' | 'rating' | 'recent')}
              className="text-sm border border-gray-300 rounded px-2 py-1"
            >
              <option value="popular">Phổ biến nhất</option>
              <option value="rating">Đánh giá cao nhất</option>
              <option value="recent">Mới nhất</option>
            </select>
          </div>
          
          <div className="text-sm text-gray-500">
            {filteredTemplates.length} template
          </div>
        </div>
      </div>

      {/* Featured Templates */}
      {selectedCategory === 'all' && !searchTerm && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Star className="h-5 w-5 text-yellow-500 mr-2" />
            Template nổi bật
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {templates.filter(t => t.isFeatured).slice(0, 3).map((template) => (
              <Card key={template.id} className="hover:shadow-lg transition-shadow border-2 border-yellow-200">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-base font-semibold mb-1 flex items-center">
                        {React.createElement(getCategoryIcon(template.category), { className: "h-4 w-4 mr-2" })}
                        {template.name}
                      </CardTitle>
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {template.description}
                      </p>
                    </div>
                    <Badge className="bg-yellow-100 text-yellow-800 ml-2">
                      Nổi bật
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className="text-center">
                      <div className="font-medium text-gray-900">{template.usageCount}</div>
                      <div className="text-gray-500">Lượt dùng</div>
                    </div>
                    <div className="text-center">
                      <div className="font-medium text-gray-900">{template.estimatedTime}p</div>
                      <div className="text-gray-500">Thời gian</div>
                    </div>
                    <div className="text-center">
                      <div className="font-medium text-gray-900">{template.estimatedReward}</div>
                      <div className="text-gray-500">Tokens</div>
                    </div>
                  </div>

                  {/* Rating */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1">
                      {renderStars(template.rating)}
                      <span className="text-sm text-gray-600 ml-1">
                        {template.rating}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500">
                      {template.createdBy}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      onClick={() => handleUseTemplate(template)}
                      disabled={isLoading}
                      className="flex-1"
                    >
                      Sử dụng template
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onSelectTemplate(template)}
                    >
                      Xem chi tiết
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* All Templates */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          {selectedCategory === 'all' ? 'Tất cả template' : 
           TEMPLATE_CATEGORIES.find(cat => cat.id === selectedCategory)?.name}
        </h3>
        
        {filteredTemplates.length === 0 ? (
          <div className="text-center py-12">
            <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Không tìm thấy template</h3>
            <p className="text-gray-600">
              Thử điều chỉnh bộ lọc hoặc từ khóa tìm kiếm
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTemplates.map((template) => (
              <Card key={template.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-base font-semibold mb-1 flex items-center">
                        {React.createElement(getCategoryIcon(template.category), { className: "h-4 w-4 mr-2" })}
                        {template.name}
                      </CardTitle>
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {template.description}
                      </p>
                    </div>
                    {template.isFeatured && (
                      <Badge className="bg-yellow-100 text-yellow-800 ml-2">
                        <Star className="h-3 w-3 mr-1" />
                        Nổi bật
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* Tags */}
                  <div className="flex flex-wrap gap-1">
                    {template.tags.slice(0, 3).map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className="text-center">
                      <div className="font-medium text-gray-900">{template.usageCount}</div>
                      <div className="text-gray-500">Lượt dùng</div>
                    </div>
                    <div className="text-center">
                      <div className="font-medium text-gray-900">{template.estimatedTime}p</div>
                      <div className="text-gray-500">Thời gian</div>
                    </div>
                    <div className="text-center">
                      <div className="font-medium text-gray-900">{template.estimatedReward}</div>
                      <div className="text-gray-500">Tokens</div>
                    </div>
                  </div>

                  {/* Rating */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1">
                      {renderStars(template.rating)}
                      <span className="text-sm text-gray-600 ml-1">
                        {template.rating}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500">
                      {template.createdBy}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      onClick={() => handleUseTemplate(template)}
                      disabled={isLoading}
                      className="flex-1"
                    >
                      Sử dụng
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onSelectTemplate(template)}
                    >
                      Chi tiết
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}