'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  Search, 
  Filter, 
  Plus, 
  Play, 
  Pause, 
  Square, 
  Eye, 
  BarChart3,
  Users,
  Calendar,
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  MoreHorizontal,
  Download,
  Copy,
  Edit,
  Trash2
} from 'lucide-react'
import { campaignService, Campaign, CampaignStats } from '@/services/campaign-service'



interface CampaignFilters {
  status?: string[]
  category?: string[]
  dateRange?: { start: Date; end: Date }
  createdBy?: string
  participantRange?: { min: number; max: number }
  budgetRange?: { min: number; max: number }
}

export default function EnhancedCampaignDashboard() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [filteredCampaigns, setFilteredCampaigns] = useState<Campaign[]>([])
  const [stats, setStats] = useState<CampaignStats>({
    total: 0,
    active: 0,
    completed: 0,
    draft: 0,
    totalResponses: 0,
    totalRevenue: 0
  })
  const [selectedCampaigns, setSelectedCampaigns] = useState<string[]>([])
  const [filters, setFilters] = useState<CampaignFilters>({})
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState<'created' | 'updated' | 'participants' | 'completion'>('created')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [isLoading, setIsLoading] = useState(true)
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    loadCampaigns()
    loadStats()
  }, [])

  useEffect(() => {
    filterAndSortCampaigns()
  }, [campaigns, filters, searchTerm, sortBy, sortOrder])

  const loadCampaigns = async () => {
    try {
      setIsLoading(true)
      const data = await campaignService.getCampaigns()
      setCampaigns(data)
    } catch (error) {
      console.error('Error loading campaigns:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadStats = async () => {
    try {
      const statsData = await campaignService.getCampaignStats()
      setStats(statsData)
    } catch (error) {
      console.error('Error loading stats:', error)
    }
  }

  const filterAndSortCampaigns = () => {
    let filtered = campaigns

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(campaign =>
        campaign.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        campaign.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Apply status filter
    if (filters.status && filters.status.length > 0) {
      filtered = filtered.filter(campaign => filters.status!.includes(campaign.status))
    }

    // Apply category filter
    if (filters.category && filters.category.length > 0) {
      filtered = filtered.filter(campaign => 
        filters.category!.includes(campaign.category || 'general')
      )
    }

    // Apply date range filter
    if (filters.dateRange) {
      filtered = filtered.filter(campaign => {
        const createdDate = new Date(campaign.createdAt)
        return createdDate >= filters.dateRange!.start && createdDate <= filters.dateRange!.end
      })
    }

    // Apply participant range filter
    if (filters.participantRange) {
      filtered = filtered.filter(campaign => 
        campaign.currentResponses >= filters.participantRange!.min &&
        campaign.currentResponses <= filters.participantRange!.max
      )
    }

    // Sort campaigns
    filtered.sort((a, b) => {
      let aValue: any, bValue: any

      switch (sortBy) {
        case 'created':
          aValue = new Date(a.createdAt)
          bValue = new Date(b.createdAt)
          break
        case 'updated':
          aValue = new Date(a.updatedAt)
          bValue = new Date(b.updatedAt)
          break
        case 'participants':
          aValue = a.currentResponses
          bValue = b.currentResponses
          break
        case 'completion':
          aValue = a.completionRate
          bValue = b.completionRate
          break
        default:
          aValue = new Date(a.createdAt)
          bValue = new Date(b.createdAt)
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })

    setFilteredCampaigns(filtered)
  }

  const handleCampaignAction = async (campaignId: string, action: 'launch' | 'pause' | 'resume' | 'complete') => {
    try {
      let updatedCampaign: Campaign

      switch (action) {
        case 'launch':
        case 'resume':
          updatedCampaign = await campaignService.launchCampaign(campaignId)
          break
        case 'pause':
          updatedCampaign = await campaignService.pauseCampaign(campaignId)
          break
        case 'complete':
          updatedCampaign = await campaignService.completeCampaign(campaignId)
          break
        default:
          return
      }

      setCampaigns(prev => prev.map(c => c.id === campaignId ? updatedCampaign : c))
      loadStats() // Refresh stats
    } catch (error) {
      console.error(`Error ${action} campaign:`, error)
    }
  }

  const handleBulkAction = async (action: 'delete' | 'export' | 'statusUpdate', status?: string) => {
    if (selectedCampaigns.length === 0) return

    try {
      switch (action) {
        case 'delete':
          // TODO: Implement bulk delete
          console.log('Bulk delete:', selectedCampaigns)
          break
        case 'export':
          // TODO: Implement bulk export
          console.log('Bulk export:', selectedCampaigns)
          break
        case 'statusUpdate':
          // TODO: Implement bulk status update
          console.log('Bulk status update:', selectedCampaigns, status)
          break
      }
      setSelectedCampaigns([])
    } catch (error) {
      console.error(`Error ${action}:`, error)
    }
  }

  const toggleCampaignSelection = (campaignId: string) => {
    setSelectedCampaigns(prev =>
      prev.includes(campaignId)
        ? prev.filter(id => id !== campaignId)
        : [...prev, campaignId]
    )
  }

  const selectAllCampaigns = () => {
    if (selectedCampaigns.length === filteredCampaigns.length) {
      setSelectedCampaigns([])
    } else {
      setSelectedCampaigns(filteredCampaigns.map(c => c.id))
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'paused': return 'bg-yellow-100 text-yellow-800'
      case 'completed': return 'bg-blue-100 text-blue-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      case 'draft': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <Play className="h-3 w-3" />
      case 'paused': return <Pause className="h-3 w-3" />
      case 'completed': return <CheckCircle className="h-3 w-3" />
      case 'cancelled': return <AlertCircle className="h-3 w-3" />
      default: return <Clock className="h-3 w-3" />
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Campaign Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Quản lý và theo dõi tất cả chiến dịch khảo sát
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={() => window.location.href = '/campaigns/templates'}>
            Từ template
          </Button>
          <Button onClick={() => window.location.href = '/campaigns/create'}>
            <Plus className="h-4 w-4 mr-2" />
            Tạo chiến dịch
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tổng chiến dịch</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Đang hoạt động</p>
                <p className="text-2xl font-bold text-green-600">{stats.active}</p>
              </div>
              <Play className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Hoàn thành</p>
                <p className="text-2xl font-bold text-blue-600">{stats.completed}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Nháp</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.draft}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tổng phản hồi</p>
                <p className="text-2xl font-bold text-purple-600">{stats.totalResponses}</p>
              </div>
              <Users className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Doanh thu</p>
                <p className="text-2xl font-bold text-indigo-600">{stats.totalRevenue}</p>
              </div>
              <DollarSign className="h-8 w-8 text-indigo-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            {/* Search and Filter Toggle */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Tìm kiếm chiến dịch..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center space-x-2"
                >
                  <Filter className="h-4 w-4" />
                  <span>Bộ lọc</span>
                </Button>
                <select
                  value={`${sortBy}-${sortOrder}`}
                  onChange={(e) => {
                    const [sort, order] = e.target.value.split('-')
                    setSortBy(sort as any)
                    setSortOrder(order as any)
                  }}
                  className="px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="created-desc">Mới nhất</option>
                  <option value="created-asc">Cũ nhất</option>
                  <option value="updated-desc">Cập nhật gần đây</option>
                  <option value="participants-desc">Nhiều tham gia nhất</option>
                  <option value="completion-desc">Tỷ lệ hoàn thành cao</option>
                </select>
              </div>
            </div>

            {/* Advanced Filters */}
            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Trạng thái
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-md">
                    <option value="">Tất cả</option>
                    <option value="draft">Nháp</option>
                    <option value="active">Đang hoạt động</option>
                    <option value="paused">Tạm dừng</option>
                    <option value="completed">Hoàn thành</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Danh mục
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-md">
                    <option value="">Tất cả</option>
                    <option value="academic">Nghiên cứu học thuật</option>
                    <option value="market">Nghiên cứu thị trường</option>
                    <option value="social">Nghiên cứu xã hội</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Từ ngày
                  </label>
                  <Input type="date" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Đến ngày
                  </label>
                  <Input type="date" />
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      {selectedCampaigns.length > 0 && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-blue-800">
                  Đã chọn {selectedCampaigns.length} chiến dịch
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Button size="sm" variant="outline" onClick={() => handleBulkAction('export')}>
                  <Download className="h-4 w-4 mr-1" />
                  Xuất dữ liệu
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleBulkAction('delete')}>
                  <Trash2 className="h-4 w-4 mr-1" />
                  Xóa
                </Button>
                <Button size="sm" variant="outline" onClick={() => setSelectedCampaigns([])}>
                  Bỏ chọn
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Campaign List */}
      <div className="space-y-4">
        {filteredCampaigns.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Không tìm thấy chiến dịch</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || Object.keys(filters).length > 0
                  ? 'Thử điều chỉnh bộ lọc hoặc từ khóa tìm kiếm'
                  : 'Tạo chiến dịch đầu tiên để bắt đầu'}
              </p>
              <Button onClick={() => window.location.href = '/campaigns/create'}>
                <Plus className="h-4 w-4 mr-2" />
                Tạo chiến dịch mới
              </Button>
            </CardContent>
          </Card>
        ) : (
          filteredCampaigns.map((campaign) => (
            <Card key={campaign.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    {/* Selection Checkbox */}
                    <input
                      type="checkbox"
                      checked={selectedCampaigns.includes(campaign.id)}
                      onChange={() => toggleCampaignSelection(campaign.id)}
                      className="mt-1 rounded"
                    />

                    {/* Campaign Info */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-1">
                            {campaign.title}
                          </h3>
                          <p className="text-sm text-gray-600 mb-2">
                            {campaign.description}
                          </p>
                        </div>
                        <Badge className={`ml-4 ${getStatusColor(campaign.status)}`}>
                          <div className="flex items-center space-x-1">
                            {getStatusIcon(campaign.status)}
                            <span>{campaign.status}</span>
                          </div>
                        </Badge>
                      </div>

                      {/* Progress Bar */}
                      <div className="mb-4">
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span>Tiến độ tham gia</span>
                          <span>{campaign.currentResponses}/{campaign.targetResponses}</span>
                        </div>
                        <Progress value={campaign.completionRate} className="h-2" />
                        <p className="text-xs text-gray-500 mt-1">
                          {campaign.completionRate.toFixed(1)}% hoàn thành
                        </p>
                      </div>

                      {/* Stats Grid */}
                      <div className="grid grid-cols-4 gap-4 text-sm">
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-600">
                            {new Date(campaign.startDate).toLocaleDateString('vi-VN')}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Users className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-600">
                            {campaign.currentResponses} phản hồi
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <DollarSign className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-600">
                            {campaign.rewards?.amount || 0} tokens
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <TrendingUp className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-600">
                            {campaign.completionRate.toFixed(1)}% tỷ lệ
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-2 ml-4">
                    {campaign.status === 'draft' && (
                      <Button
                        size="sm"
                        onClick={() => handleCampaignAction(campaign.id, 'launch')}
                      >
                        <Play className="h-4 w-4 mr-1" />
                        Khởi chạy
                      </Button>
                    )}
                    
                    {campaign.status === 'active' && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleCampaignAction(campaign.id, 'pause')}
                        >
                          <Pause className="h-4 w-4 mr-1" />
                          Tạm dừng
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleCampaignAction(campaign.id, 'complete')}
                        >
                          <Square className="h-4 w-4 mr-1" />
                          Hoàn thành
                        </Button>
                      </>
                    )}
                    
                    {campaign.status === 'paused' && (
                      <Button
                        size="sm"
                        onClick={() => handleCampaignAction(campaign.id, 'resume')}
                      >
                        <Play className="h-4 w-4 mr-1" />
                        Tiếp tục
                      </Button>
                    )}

                    <Button size="sm" variant="ghost">
                      <Eye className="h-4 w-4" />
                    </Button>
                    
                    <Button size="sm" variant="ghost">
                      <BarChart3 className="h-4 w-4" />
                    </Button>
                    
                    <Button size="sm" variant="ghost">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}