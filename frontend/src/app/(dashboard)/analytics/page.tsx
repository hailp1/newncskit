'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  PresentationChartBarIcon,
  SparklesIcon,
  ChartPieIcon,
  ArrowTrendingUpIcon,
} from '@heroicons/react/24/outline'

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-600">Track your research productivity and progress</p>
        </div>
        <Button>
          <SparklesIcon className="w-4 h-4 mr-2" />
          Generate Report
        </Button>
      </div>

      {/* Coming Soon */}
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-12">
            <PresentationChartBarIcon className="mx-auto h-16 w-16 text-blue-500 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Advanced Analytics Coming Soon
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Get detailed insights into your research productivity, collaboration patterns, 
              and publication success metrics.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
              <div className="text-center p-4">
                <ChartPieIcon className="mx-auto h-8 w-8 text-green-500 mb-2" />
                <h4 className="font-medium">Productivity Metrics</h4>
                <p className="text-sm text-gray-600">Words written, references added</p>
              </div>
              <div className="text-center p-4">
                <ArrowTrendingUpIcon className="mx-auto h-8 w-8 text-yellow-500 mb-2" />
                <h4 className="font-medium">Progress Tracking</h4>
                <p className="text-sm text-gray-600">Project milestones and timelines</p>
              </div>
              <div className="text-center p-4">
                <PresentationChartBarIcon className="mx-auto h-8 w-8 text-purple-500 mb-2" />
                <h4 className="font-medium">Success Analytics</h4>
                <p className="text-sm text-gray-600">Publication and citation metrics</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}