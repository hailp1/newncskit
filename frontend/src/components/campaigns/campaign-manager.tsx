'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { ErrorMessageComponent } from '@/components/ui/error-message'
import { surveyCampaignService } from '@/services/survey-campaigns'
import type { SurveyCampaign, CampaignStatus } from '@/types'
import { tokenRewardService } from '@/services/tokens'
import { useCampaignManagerErrorHandling } from '@/hooks/use-error-handling'
import {
  PlayIcon,
  PauseIcon,
  StopIcon,
  EyeIcon,
  ChartBarIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
  ClockIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline'

interface CampaignManagerProps {
  projectId?: string
  onCampaignSelect?: (campaign: SurveyCampaign) => void
}

export default function CampaignManager({ projectId, onCampaignSelect }: CampaignManagerProps) {
  const [campaigns, setCampaigns] = useState<SurveyCampaign[]>([])
  const [selectedCampaign, setSelectedCampaign] = useState<SurveyCampaign | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<CampaignStatus | 'all'>('all')

  const {
    error,
    isRecovering,
    recoveryActions,
    handleError,
    executeRecovery,
    clearError,
    withErrorHandling
  } = useCampaignManagerErrorHandling({
    onError: (error, context) => {
      console.error('Campaign manager error:', error, context)
    }
  })

  // Load campaigns
  const loadCampaigns = async () => {
    await withErrorHandling(async () => {
      setIsLoading(true)
      try {
        const filter = projectId ? { projectId } : undefined
        const result = await surveyCampaignService.getCampaigns(filter)
        setCampaigns(result.campaigns)
      } finally {
        setIsLoading(false)
      }
    }, 'loadCampaigns', { retries: 2 })
  }

  useEffect(() => {
    loadCampaigns()
  }, [projectId])

  // Campaign actions
  const handleLaunchCampaign = async (campaignId: string) => {
    await withErrorHandling(async () => {
      const updatedCampaign = await surveyCampaignService.launchCampaign(campaignId)
      setCampaigns(prev => prev.map(c => c.id === campaignId ? updatedCampaign : c))
      
      if (selectedCampaign?.id === campaignId) {
        setSelectedCampaign(updatedCampaign)
      }
    }, 'launchCampaign')
  }

  const handlePauseCampaign = async (campaignId: string) => {
    await withErrorHandling(async () => {
      const updatedCampaign = await surveyCampaignService.pauseCampaign(campaignId)
      setCampaigns(prev => prev.map(c => c.id === campaignId ? updatedCampaign : c))
      
      if (selectedCampaign?.id === campaignId) {
        setSelectedCampaign(updatedCampaign)
      }
    }, 'pauseCampaign')
  }

  const handleCompleteCampaign = async (campaignId: string) => {
    await withErrorHandling(async () => {
      const updatedCampaign = await surveyCampaignService.completeCampaign(campaignId)
      setCampaigns(prev => prev.map(c => c.id === campaignId ? updatedCampaign : c))
      
      if (selectedCampaign?.id === campaignId) {
        setSelectedCampaign(updatedCampaign)
      }
    }, 'completeCampaign')
  }

  // Filter campaigns
  const filteredCampaigns = campaigns.filter(campaign => {
    const matchesSearch = campaign.title.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || campaign.status === statusFilter
    return matchesSearch && matchesStatus
  })

  // Get status color
  const getStatusColor = (status: CampaignStatus) => {
    return surveyCampaignService.getStatusColor(status)
  }

  // Calculate progress
  const calculateProgress = (campaign: SurveyCampaign) => {
    return surveyCampaignService.calculateProgress(campaign)
  }

  // Format duration
  const formatDuration = (days: number) => {
    return surveyCampaignService.formatDuration(days)
  }

  return (
    <div className="space-y-6">
      {/* Error Display */}
      {error && (
        <ErrorMessageComponent 
          error={error} 
          onDismiss={clearError}
        />
      )}

      {/* Recovery Actions */}
      {recoveryActions.length > 0 && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <h4 className="text-sm font-medium text-blue-800 mb-2">
              Suggested Actions:
            </h4>
            <div className="space-y-2">
              {recoveryActions.map((action, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => executeRecovery(action)}
                  disabled={isRecovering}
                  className="mr-2 border-blue-300 text-blue-700 hover:bg-blue-100"
                >
                  {isRecovering ? 'Processing...' : action.label}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Campaign Management</h2>
          <p className="text-gray-600">
            Manage survey campaigns and track participation
            {isLoading && <span className="text-blue-600"> (Loading...)</span>}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          {error && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => loadCampaigns()}
              disabled={isLoading}
            >
              Retry
            </Button>
          )}
          <Button onClick={() => window.location.href = '/campaigns/new'}>
            Create Campaign
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search campaigns..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as CampaignStatus | 'all')}
              className="px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="all">All Status</option>
              <option value="draft">Draft</option>
              <option value="active">Active</option>
              <option value="paused">Paused</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Campaign List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {isLoading ? (
          <div className="col-span-full text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-2">Loading campaigns...</p>
          </div>
        ) : filteredCampaigns.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <UserGroupIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No campaigns found</h3>
            <p className="text-gray-600">
              {searchTerm || statusFilter !== 'all' 
                ? 'Try adjusting your filters' 
                : 'Create your first campaign to get started'}
            </p>
          </div>
        ) : (
          filteredCampaigns.map((campaign) => {
            const progress = calculateProgress(campaign)
            
            return (
              <Card 
                key={campaign.id} 
                className={`hover:shadow-lg transition-shadow cursor-pointer ${
                  selectedCampaign?.id === campaign.id ? 'ring-2 ring-blue-500' : ''
                }`}
                onClick={() => {
                  setSelectedCampaign(campaign)
                  onCampaignSelect?.(campaign)
                }}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{campaign.title}</CardTitle>
                      <p className="text-sm text-gray-600 mt-1">
                        {campaign.description}
                      </p>
                    </div>
                    <Badge className={`bg-${getStatusColor(campaign.status)}-100 text-${getStatusColor(campaign.status)}-800`}>
                      {campaign.status}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent>
                  {/* Progress */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span>Participation Progress</span>
                      <span>{Math.round(progress.participationRate * 100)}%</span>
                    </div>
                    <Progress value={progress.participationRate * 100} />
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="flex items-center">
                      <UserGroupIcon className="w-4 h-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-600">
                        {campaign.participation.totalParticipants} / {campaign.config.targetParticipants}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <CurrencyDollarIcon className="w-4 h-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-600">
                        {tokenRewardService.formatTokenAmount(campaign.config.tokenRewardPerParticipant)}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <ClockIcon className="w-4 h-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-600">
                        {progress.timeRemaining} days left
                      </span>
                    </div>
                    <div className="flex items-center">
                      <CheckCircleIcon className="w-4 h-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-600">
                        {Math.round(progress.completionRate * 100)}% completion
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {campaign.status === 'draft' && (
                        <Button
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleLaunchCampaign(campaign.id)
                          }}
                          disabled={isRecovering}
                        >
                          <PlayIcon className="w-4 h-4 mr-1" />
                          Launch
                        </Button>
                      )}
                      
                      {campaign.status === 'active' && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation()
                              handlePauseCampaign(campaign.id)
                            }}
                            disabled={isRecovering}
                          >
                            <PauseIcon className="w-4 h-4 mr-1" />
                            Pause
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleCompleteCampaign(campaign.id)
                            }}
                            disabled={isRecovering}
                          >
                            <StopIcon className="w-4 h-4 mr-1" />
                            Complete
                          </Button>
                        </>
                      )}
                      
                      {campaign.status === 'paused' && (
                        <Button
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleLaunchCampaign(campaign.id)
                          }}
                          disabled={isRecovering}
                        >
                          <PlayIcon className="w-4 h-4 mr-1" />
                          Resume
                        </Button>
                      )}
                    </div>

                    <div className="flex items-center space-x-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation()
                          window.open(`/campaigns/${campaign.id}/preview`, '_blank')
                        }}
                      >
                        <EyeIcon className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation()
                          window.location.href = `/campaigns/${campaign.id}/analytics`
                        }}
                      >
                        <ChartBarIcon className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })
        )}
      </div>
    </div>
  )
}