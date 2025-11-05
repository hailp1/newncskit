'use client'

import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  PlayIcon,
  AcademicCapIcon,
  ChartBarIcon,
  UserGroupIcon,
  DocumentTextIcon,
  CogIcon,
  LightBulbIcon,
  ClockIcon
} from '@heroicons/react/24/outline'

export default function TutorialsPage() {
  const tutorialCategories = [
    {
      title: 'Hướng dẫn cơ bản',
      description: 'Các tutorial dành cho người mới bắt đầu',
      icon: PlayIcon,
      color: 'bg-green-500',
      tutorials: [
        {
          title: 'Tạo dự án nghiên cứu đầu tiên',
          description: 'Hướng dẫn từng bước tạo dự án nghiên cứu hoàn chỉnh',
          duration: '15 phút',
          level: 'Cơ bản',
          href: '/tutorials/first-research-project',
          tags: ['Dự án', 'Thiết kế']
        },
        {
          title: 'Sử dụng AI để thiết kế nghiên cứu',
          description: 'Tận dụng sức mạnh AI để tạo thiết kế nghiên cứu chuyên nghiệp',
          duration: '10 phút',
          level: 'Cơ bản',
          href: '/tutorials/ai-research-design',
          tags: ['AI', 'Thiết kế']
        }
      ]
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Tutorials NCSKit
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Học cách sử dụng NCSKit qua các hướng dẫn thực hành chi tiết
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Tutorial Categories */}
        {tutorialCategories.map((category, index) => (
          <section key={index} className="mb-12">
            <div className="flex items-center mb-6">
              <div className={`w-10 h-10 ${category.color} rounded-lg flex items-center justify-center mr-4`}>
                <category.icon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{category.title}</h2>
                <p className="text-gray-600">{category.description}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {category.tutorials.map((tutorial, tutorialIndex) => (
                <Link key={tutorialIndex} href={tutorial.href} className="group">
                  <Card className="hover:shadow-lg transition-shadow h-full">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-3">
                        <Badge className="bg-blue-100 text-blue-800">
                          {tutorial.level}
                        </Badge>
                        <div className="flex items-center text-sm text-gray-500">
                          <ClockIcon className="w-4 h-4 mr-1" />
                          {tutorial.duration}
                        </div>
                      </div>
                      
                      <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 mb-2">
                        {tutorial.title}
                      </h3>
                      
                      <p className="text-gray-600 mb-4 text-sm">
                        {tutorial.description}
                      </p>
                      
                      <div className="flex flex-wrap gap-2">
                        {tutorial.tags.map((tag, tagIndex) => (
                          <Badge key={tagIndex} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}