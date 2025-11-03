'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  AcademicCapIcon,
  SparklesIcon,
  TrendingUpIcon,
  LightBulbIcon,
} from '@heroicons/react/24/outline'

export default function TopicsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Topic Suggestions</h1>
          <p className="text-gray-600">AI-powered research topic recommendations</p>
        </div>
        <Button>
          <SparklesIcon className="w-4 h-4 mr-2" />
          Generate Topics
        </Button>
      </div>

      {/* Coming Soon */}
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-12">
            <AcademicCapIcon className="mx-auto h-16 w-16 text-blue-500 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              AI Topic Suggestions Coming Soon
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Our AI-powered topic suggestion engine will analyze current research trends 
              and recommend relevant topics based on your research domain and interests.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
              <div className="text-center p-4">
                <TrendingUpIcon className="mx-auto h-8 w-8 text-green-500 mb-2" />
                <h4 className="font-medium">Trend Analysis</h4>
                <p className="text-sm text-gray-600">Identify emerging research areas</p>
              </div>
              <div className="text-center p-4">
                <LightBulbIcon className="mx-auto h-8 w-8 text-yellow-500 mb-2" />
                <h4 className="font-medium">Gap Identification</h4>
                <p className="text-sm text-gray-600">Find unexplored research opportunities</p>
              </div>
              <div className="text-center p-4">
                <SparklesIcon className="mx-auto h-8 w-8 text-purple-500 mb-2" />
                <h4 className="font-medium">Personalized Suggestions</h4>
                <p className="text-sm text-gray-600">Tailored to your expertise</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}