'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  ClockIcon,
  ServerIcon,
  CircleStackIcon,
  CpuChipIcon
} from '@heroicons/react/24/outline'

interface ServiceHealth {
  status: 'healthy' | 'unhealthy' | 'degraded'
  latency?: number
  error?: string
  timestamp?: string
  [key: string]: any
}

interface HealthData {
  status: 'healthy' | 'unhealthy' | 'degraded'
  timestamp: string
  services: {
    vercel: ServiceHealth
    supabase: ServiceHealth
    docker: ServiceHealth
  }
  summary: {
    total: number
    healthy: number
    unhealthy: number
    degraded: number
  }
}

export default function HealthMonitoringPage() {
  const [healthData, setHealthData] = useState<HealthData | null>(null)
  const [loading, setLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())
  const [autoRefresh, setAutoRefresh] = useState(true)

  const fetchHealthData = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/health')
      
      if (response.ok) {
        const data = await response.json()
        setHealthData(data)
        setLastUpdate(new Date())
      } else {
        console.error('Failed to fetch health data')
      }
    } catch (error) {
      console.error('Error fetching health data:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchHealthData()
  }, [])

  useEffect(() => {
    if (!autoRefresh) return

    const interval = setInterval(() => {
      fetchHealthData()
    }, 30000) // Refresh every 30 seconds

    return () => clearInterval(interval)
  }, [autoRefresh])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircleIcon className="h-6 w-6 text-green-500" />
      case 'degraded':
        return <ExclamationTriangleIcon className="h-6 w-6 text-yellow-500" />
      case 'unhealthy':
        return <XCircleIcon className="h-6 w-6 text-red-500" />
      default:
        return <ExclamationTriangleIcon className="h-6 w-6 text-gray-400" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'healthy':
        return <Badge className="bg-green-100 text-green-800">Healthy</Badge>
      case 'degraded':
        return <Badge className="bg-yellow-100 text-yellow-800">Degraded</Badge>
      case 'unhealthy':
        return <Badge variant="destructive">Unhealthy</Badge>
      default:
        return <Badge variant="secondary">Unknown</Badge>
    }
  }

  const formatLatency = (latency?: number) => {
    if (!latency) return 'N/A'
    return `${latency}ms`
  }

  const formatTimestamp = (timestamp?: string) => {
    if (!timestamp) return 'N/A'
    return new Date(timestamp).toLocaleString()
  }

  const getServiceIcon = (service: string) => {
    switch (service) {
      case 'vercel':
        return <ServerIcon className="h-5 w-5" />
      case 'supabase':
        return <CircleStackIcon className="h-5 w-5" />
      case 'docker':
        return <CpuChipIcon className="h-5 w-5" />
      default:
        return <ServerIcon className="h-5 w-5" />
    }
  }

  const getServiceName = (service: string) => {
    switch (service) {
      case 'vercel':
        return 'Vercel Frontend'
      case 'supabase':
        return 'Supabase Backend'
      case 'docker':
        return 'R Analytics (Docker)'
      default:
        return service
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">System Health Monitor</h1>
          <p className="text-gray-600">Real-time monitoring of all system services</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <ClockIcon className="h-4 w-4" />
            <span>Last updated: {lastUpdate.toLocaleTimeString()}</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            {autoRefresh ? 'Disable' : 'Enable'} Auto-refresh
          </Button>
          <Button
            onClick={fetchHealthData}
            disabled={loading}
          >
            <ArrowPathIcon className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Overall Status */}
      {healthData && (
        <Card className={
          healthData.status === 'healthy' 
            ? 'border-green-200 bg-green-50' 
            : healthData.status === 'degraded'
            ? 'border-yellow-200 bg-yellow-50'
            : 'border-red-200 bg-red-50'
        }>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {getStatusIcon(healthData.status)}
                <div>
                  <h2 className="text-xl font-semibold">
                    System Status: {healthData.status.charAt(0).toUpperCase() + healthData.status.slice(1)}
                  </h2>
                  <p className="text-sm text-gray-600">
                    {healthData.summary.healthy} of {healthData.summary.total} services operational
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-600">Last Check</div>
                <div className="text-sm font-medium">{formatTimestamp(healthData.timestamp)}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Service Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {healthData && Object.entries(healthData.services).map(([serviceName, serviceData]) => (
          <Card key={serviceName} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {getServiceIcon(serviceName)}
                  <span>{getServiceName(serviceName)}</span>
                </div>
                {getStatusBadge(serviceData.status)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Response Time</span>
                  <span className="text-sm font-medium">{formatLatency(serviceData.latency)}</span>
                </div>
                
                {serviceData.error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-xs text-red-800 font-medium">Error:</p>
                    <p className="text-xs text-red-600 mt-1">{serviceData.error}</p>
                  </div>
                )}

                {/* Service-specific details */}
                {serviceName === 'vercel' && serviceData.environment && (
                  <div className="pt-3 border-t border-gray-200">
                    <p className="text-xs text-gray-600 mb-2">Environment Details:</p>
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-500">Environment:</span>
                        <span className="font-medium">{serviceData.environment}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-500">Region:</span>
                        <span className="font-medium">{serviceData.region || 'N/A'}</span>
                      </div>
                      {serviceData.uptime && (
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-500">Uptime:</span>
                          <span className="font-medium">{Math.floor(serviceData.uptime)}s</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {serviceName === 'supabase' && serviceData.checks && (
                  <div className="pt-3 border-t border-gray-200">
                    <p className="text-xs text-gray-600 mb-2">Component Status:</p>
                    <div className="space-y-1">
                      {Object.entries(serviceData.checks).map(([component, data]: [string, any]) => (
                        <div key={component} className="flex justify-between items-center text-xs">
                          <span className="text-gray-500 capitalize">{component}:</span>
                          <div className="flex items-center space-x-2">
                            <span className="font-medium">{formatLatency(data.latency)}</span>
                            {data.status === 'healthy' ? (
                              <CheckCircleIcon className="h-3 w-3 text-green-500" />
                            ) : (
                              <XCircleIcon className="h-3 w-3 text-red-500" />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {serviceName === 'docker' && serviceData.analytics && (
                  <div className="pt-3 border-t border-gray-200">
                    <p className="text-xs text-gray-600 mb-2">Analytics Service:</p>
                    <div className="space-y-1">
                      {serviceData.analytics.version && (
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-500">Version:</span>
                          <span className="font-medium">{serviceData.analytics.version}</span>
                        </div>
                      )}
                      {serviceData.config?.serviceUrl && (
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-500">URL:</span>
                          <span className="font-medium text-xs truncate max-w-[150px]">
                            {serviceData.config.serviceUrl}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Loading State */}
      {loading && !healthData && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <ArrowPathIcon className="h-12 w-12 text-blue-600 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading health data...</p>
          </div>
        </div>
      )}

      {/* Info Card */}
      <Card>
        <CardHeader>
          <CardTitle>About Health Monitoring</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm text-gray-600">
            <p>
              This dashboard monitors the health of all critical system services in real-time.
              Health checks are performed every 30 seconds when auto-refresh is enabled.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-3">
              <div>
                <h4 className="font-medium text-gray-900 mb-1">Vercel Frontend</h4>
                <p className="text-xs">
                  Monitors the Next.js application running on Vercel's edge network.
                </p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-1">Supabase Backend</h4>
                <p className="text-xs">
                  Checks database, authentication, and storage services.
                </p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-1">R Analytics</h4>
                <p className="text-xs">
                  Verifies the Docker container running R analytics is accessible.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
