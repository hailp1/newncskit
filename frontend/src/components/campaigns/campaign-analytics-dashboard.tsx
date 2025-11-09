'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  BarChart3, 
  Users, 
  TrendingUp, 
  Clock, 
  DollarSign,
  Target,
  Eye,
  Download,
  Calendar,
  MapPin,
  Smartphone,
  Monitor,
  Tablet,
  Star,
  AlertTriangle,
  CheckCircle
} from 'lucide-react'

interface CampaignAnalytics {
  campaignId: string
  participationMetrics: {
    totalViews: number
    totalClicks: number
    conversionRate: number
    participationRate: number
    completionRate: number
    dropoutRate: number
  }
  qualityMetrics: {
    averageResponseTime: number
    responseQualityScore: number
    satisfactionScore: number
    flaggedResponses: number
  }
  demographics: {
    ageDistribution: Record<string, number>
    genderDistribution: Record<string, number>
    locationDistribution: Record<string, number>
    educationDistribution: Record<string, number>
  }
  financialMetrics: {
    totalCost: number
    costPerResponse: number
    adminFeesCollected: number
    roiScore: number
  }
  timeSeriesData: {
    dailyParticipation: Array<{ date: string; responses: number }>
    hourlyEngagement: Array<{ hour: number; engagement: number }>
    completionTrends: Array<{ date: string; completionRate: number }>
  }
  deviceBreakdown: {
    desktop: number
    mobile: number
    tablet: number
  }
}

const MOCK_ANALYTICS: CampaignAnalytics = {
  campaignId: '1',
  participationMetrics: {
    totalViews: 2450,
    totalClicks: 1876,
    conversionRate: 76.6,
    participationRate: 68.2,
    completionRate: 84.3,
    dropoutRate: 15.7
  },
  qualityMetrics: {
    averageResponseTime: 8.5,
    responseQualityScore: 4.2,
    satisfactionScore: 4.6,
    flaggedResponses: 12
  },
  demographics: {
    ageDistribution: {
      '18-25': 145,
      '26-35': 234,
      '36-45': 189,
      '46-55': 98,
      '56+': 67
    },
    genderDistribution: {
      'Nam': 387,
      'Nữ': 421,
      'Khác': 25
    },
    locationDistribution: {
      'TP.HCM': 298,
      'Hà Nội': 245,
      'Đà Nẵng': 89,
      'Cần Thơ': 67,
      'Khác': 134
    },
    educationDistribution: {
      'Trung học': 89,
      'Cao đẳng': 156,
      'Đại học': 445,
      'Thạc sĩ': 123,
      'Tiến sĩ': 20
    }
  },
  financialMetrics: {
    totalCost: 12450,
    costPerResponse: 14.95,
    adminFeesCollected: 1245,
    roiScore: 3.2
  },
  timeSeriesData: {
    dailyParticipation: [
      { date: '2024-01-01', responses: 45 },
      { date: '2024-01-02', responses: 67 },
      { date: '2024-01-03', responses: 52 },
      { date: '2024-01-04', responses: 78 },
      { date: '2024-01-05', responses: 89 },
      { date: '2024-01-06', responses: 94 },
      { date: '2024-01-07', responses: 76 }
    ],
    hourlyEngagement: [
      { hour: 8, engagement: 12 },
      { hour: 9, engagement: 28 },
      { hour: 10, engagement: 45 },
      { hour: 11, engagement: 67 },
      { hour: 12, engagement: 34 },
      { hour: 13, engagement: 23 },
      { hour: 14, engagement: 56 },
      { hour: 15, engagement: 78 },
      { hour: 16, engagement: 65 },
      { hour: 17, engagement: 43 },
      { hour: 18, engagement: 32 },
      { hour: 19, engagement: 45 },
      { hour: 20, engagement: 67 },
      { hour: 21, engagement: 54 },
      { hour: 22, engagement: 23 }
    ],
    completionTrends: [
      { date: '2024-01-01', completionRate: 78.5 },
      { date: '2024-01-02', completionRate: 82.1 },
      { date: '2024-01-03', completionRate: 79.8 },
      { date: '2024-01-04', completionRate: 85.2 },
      { date: '2024-01-05', completionRate: 87.6 },
      { date: '2024-01-06', completionRate: 84.3 },
      { date: '2024-01-07', completionRate: 86.1 }
    ]
  },
  deviceBreakdown: {
    desktop: 456,
    mobile: 312,
    tablet: 65
  }
}

interface CampaignAnalyticsDashboardProps {
  campaignId: string
}

export default function CampaignAnalyticsDashboard({ campaignId }: CampaignAnalyticsDashboardProps) {
  const [analytics, setAnalytics] = useState<CampaignAnalytics | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedTimeRange, setSelectedTimeRange] = useState<'7d' | '30d' | '90d' | 'all'>('30d')

  useEffect(() => {
    loadAnalytics()
  }, [campaignId, selectedTimeRange])

  const loadAnalytics = async () => {
    try {
      setIsLoading(true)
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      setAnalytics(MOCK_ANALYTICS)
    } catch (error) {
      console.error('Error loading analytics:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const exportAnalytics = async (format: 'csv' | 'excel' | 'pdf') => {
    try {
      // Export functionality will be implemented in future release
      alert(`Export to ${format.toUpperCase()} coming soon!`)
    } catch (error) {
      console.error('Error exporting analytics:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!analytics) {
    return (
      <div className="text-center py-12">
        <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Không có dữ liệu analytics</h3>
        <p className="text-gray-600">Dữ liệu sẽ xuất hiện sau khi có người tham gia chiến dịch</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Campaign Analytics</h1>
          <p className="text-gray-600 mt-1">
            Phân tích chi tiết hiệu suất chiến dịch
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <select
            value={selectedTimeRange}
            onChange={(e) => setSelectedTimeRange(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value="7d">7 ngày qua</option>
            <option value="30d">30 ngày qua</option>
            <option value="90d">90 ngày qua</option>
            <option value="all">Toàn bộ</option>
          </select>
          <Button variant="outline" onClick={() => exportAnalytics('excel')}>
            <Download className="h-4 w-4 mr-2" />
            Xuất báo cáo
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tỷ lệ chuyển đổi</p>
                <p className="text-2xl font-bold text-blue-600">
                  {analytics.participationMetrics.conversionRate.toFixed(1)}%
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {analytics.participationMetrics.totalClicks} / {analytics.participationMetrics.totalViews}
                </p>
              </div>
              <Target className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tỷ lệ hoàn thành</p>
                <p className="text-2xl font-bold text-green-600">
                  {analytics.participationMetrics.completionRate.toFixed(1)}%
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Chất lượng cao
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Thời gian TB</p>
                <p className="text-2xl font-bold text-purple-600">
                  {analytics.qualityMetrics.averageResponseTime}p
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Phản hồi nhanh
                </p>
              </div>
              <Clock className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Chi phí/Phản hồi</p>
                <p className="text-2xl font-bold text-orange-600">
                  {analytics.financialMetrics.costPerResponse.toFixed(0)}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  tokens
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Participation Funnel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="h-5 w-5 mr-2" />
            Funnel tham gia
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Lượt xem</span>
              <span className="text-sm text-gray-600">{analytics.participationMetrics.totalViews}</span>
            </div>
            <Progress value={100} className="h-2" />
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Lượt click</span>
              <span className="text-sm text-gray-600">{analytics.participationMetrics.totalClicks}</span>
            </div>
            <Progress value={analytics.participationMetrics.conversionRate} className="h-2" />
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Bắt đầu khảo sát</span>
              <span className="text-sm text-gray-600">
                {Math.round(analytics.participationMetrics.totalClicks * analytics.participationMetrics.participationRate / 100)}
              </span>
            </div>
            <Progress value={analytics.participationMetrics.participationRate} className="h-2" />
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Hoàn thành</span>
              <span className="text-sm text-gray-600">
                {Math.round(analytics.participationMetrics.totalClicks * analytics.participationMetrics.participationRate * analytics.participationMetrics.completionRate / 10000)}
              </span>
            </div>
            <Progress value={analytics.participationMetrics.completionRate} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Demographics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Age Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="h-5 w-5 mr-2" />
              Phân bố độ tuổi
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(analytics.demographics.ageDistribution).map(([age, count]) => {
                const total = Object.values(analytics.demographics.ageDistribution).reduce((a, b) => a + b, 0)
                const percentage = (count / total) * 100
                return (
                  <div key={age} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3 flex-1">
                      <span className="text-sm font-medium w-16">{age}</span>
                      <Progress value={percentage} className="flex-1 h-2" />
                    </div>
                    <span className="text-sm text-gray-600 w-12 text-right">{count}</span>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Gender Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="h-5 w-5 mr-2" />
              Phân bố giới tính
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(analytics.demographics.genderDistribution).map(([gender, count]) => {
                const total = Object.values(analytics.demographics.genderDistribution).reduce((a, b) => a + b, 0)
                const percentage = (count / total) * 100
                return (
                  <div key={gender} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3 flex-1">
                      <span className="text-sm font-medium w-16">{gender}</span>
                      <Progress value={percentage} className="flex-1 h-2" />
                    </div>
                    <span className="text-sm text-gray-600 w-12 text-right">{count}</span>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Location Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <MapPin className="h-5 w-5 mr-2" />
              Phân bố địa lý
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(analytics.demographics.locationDistribution).map(([location, count]) => {
                const total = Object.values(analytics.demographics.locationDistribution).reduce((a, b) => a + b, 0)
                const percentage = (count / total) * 100
                return (
                  <div key={location} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3 flex-1">
                      <span className="text-sm font-medium w-20">{location}</span>
                      <Progress value={percentage} className="flex-1 h-2" />
                    </div>
                    <span className="text-sm text-gray-600 w-12 text-right">{count}</span>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Device Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Monitor className="h-5 w-5 mr-2" />
              Thiết bị sử dụng
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3 flex-1">
                  <Monitor className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium">Desktop</span>
                  <Progress value={(analytics.deviceBreakdown.desktop / (analytics.deviceBreakdown.desktop + analytics.deviceBreakdown.mobile + analytics.deviceBreakdown.tablet)) * 100} className="flex-1 h-2" />
                </div>
                <span className="text-sm text-gray-600 w-12 text-right">{analytics.deviceBreakdown.desktop}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3 flex-1">
                  <Smartphone className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium">Mobile</span>
                  <Progress value={(analytics.deviceBreakdown.mobile / (analytics.deviceBreakdown.desktop + analytics.deviceBreakdown.mobile + analytics.deviceBreakdown.tablet)) * 100} className="flex-1 h-2" />
                </div>
                <span className="text-sm text-gray-600 w-12 text-right">{analytics.deviceBreakdown.mobile}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3 flex-1">
                  <Tablet className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium">Tablet</span>
                  <Progress value={(analytics.deviceBreakdown.tablet / (analytics.deviceBreakdown.desktop + analytics.deviceBreakdown.mobile + analytics.deviceBreakdown.tablet)) * 100} className="flex-1 h-2" />
                </div>
                <span className="text-sm text-gray-600 w-12 text-right">{analytics.deviceBreakdown.tablet}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quality Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Star className="h-5 w-5 mr-2" />
            Chỉ số chất lượng
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 mb-1">
                {analytics.qualityMetrics.responseQualityScore.toFixed(1)}/5
              </div>
              <div className="text-sm text-gray-600">Chất lượng phản hồi</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 mb-1">
                {analytics.qualityMetrics.satisfactionScore.toFixed(1)}/5
              </div>
              <div className="text-sm text-gray-600">Mức độ hài lòng</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600 mb-1">
                {analytics.qualityMetrics.averageResponseTime}p
              </div>
              <div className="text-sm text-gray-600">Thời gian TB</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600 mb-1">
                {analytics.qualityMetrics.flaggedResponses}
              </div>
              <div className="text-sm text-gray-600">Phản hồi cảnh báo</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Financial Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <DollarSign className="h-5 w-5 mr-2" />
            Tóm tắt tài chính
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <div className="text-sm text-gray-600 mb-1">Tổng chi phí</div>
              <div className="text-xl font-bold text-gray-900">
                {analytics.financialMetrics.totalCost.toLocaleString()} tokens
              </div>
            </div>
            
            <div>
              <div className="text-sm text-gray-600 mb-1">Chi phí/Phản hồi</div>
              <div className="text-xl font-bold text-gray-900">
                {analytics.financialMetrics.costPerResponse.toFixed(2)} tokens
              </div>
            </div>
            
            <div>
              <div className="text-sm text-gray-600 mb-1">Phí admin</div>
              <div className="text-xl font-bold text-gray-900">
                {analytics.financialMetrics.adminFeesCollected.toLocaleString()} tokens
              </div>
            </div>
            
            <div>
              <div className="text-sm text-gray-600 mb-1">ROI Score</div>
              <div className="text-xl font-bold text-gray-900">
                {analytics.financialMetrics.roiScore.toFixed(1)}x
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}