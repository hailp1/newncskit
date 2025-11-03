'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  ClipboardDocumentListIcon,
  SparklesIcon,
  MagnifyingGlassIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline'

export default function JournalsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Journal Matcher</h1>
          <p className="text-gray-600">Find the perfect journal for your research</p>
        </div>
        <Button>
          <SparklesIcon className="w-4 h-4 mr-2" />
          Analyze Paper
        </Button>
      </div>

      {/* Coming Soon */}
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-12">
            <ClipboardDocumentListIcon className="mx-auto h-16 w-16 text-blue-500 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Journal Matching Coming Soon
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Our intelligent journal matcher will analyze your paper content and recommend 
              the most suitable Q1/Q2 journals for submission.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
              <div className="text-center p-4">
                <MagnifyingGlassIcon className="mx-auto h-8 w-8 text-green-500 mb-2" />
                <h4 className="font-medium">Content Analysis</h4>
                <p className="text-sm text-gray-600">AI-powered paper analysis</p>
              </div>
              <div className="text-center p-4">
                <ChartBarIcon className="mx-auto h-8 w-8 text-yellow-500 mb-2" />
                <h4 className="font-medium">Impact Metrics</h4>
                <p className="text-sm text-gray-600">Impact factor and acceptance rates</p>
              </div>
              <div className="text-center p-4">
                <ClipboardDocumentListIcon className="mx-auto h-8 w-8 text-purple-500 mb-2" />
                <h4 className="font-medium">Submission Guidelines</h4>
                <p className="text-sm text-gray-600">Automated formatting assistance</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}