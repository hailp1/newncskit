'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  ChatBubbleLeftRightIcon,
  SparklesIcon,
  DocumentTextIcon,
  ClockIcon,
} from '@heroicons/react/24/outline'

export default function ReviewsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Review Manager</h1>
          <p className="text-gray-600">Manage peer review processes efficiently</p>
        </div>
        <Button>
          <SparklesIcon className="w-4 h-4 mr-2" />
          Import Reviews
        </Button>
      </div>

      {/* Coming Soon */}
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-12">
            <ChatBubbleLeftRightIcon className="mx-auto h-16 w-16 text-blue-500 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Review Management Coming Soon
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Streamline your peer review process with AI-assisted response generation 
              and organized feedback management.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
              <div className="text-center p-4">
                <DocumentTextIcon className="mx-auto h-8 w-8 text-green-500 mb-2" />
                <h4 className="font-medium">Feedback Organization</h4>
                <p className="text-sm text-gray-600">Categorize and prioritize reviews</p>
              </div>
              <div className="text-center p-4">
                <SparklesIcon className="mx-auto h-8 w-8 text-yellow-500 mb-2" />
                <h4 className="font-medium">Response Assistance</h4>
                <p className="text-sm text-gray-600">AI-powered response drafting</p>
              </div>
              <div className="text-center p-4">
                <ClockIcon className="mx-auto h-8 w-8 text-purple-500 mb-2" />
                <h4 className="font-medium">Timeline Tracking</h4>
                <p className="text-sm text-gray-600">Monitor review deadlines</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}