'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  ExclamationTriangleIcon,
  XCircleIcon,
  InformationCircleIcon,
  TrashIcon,
  FunnelIcon
} from '@heroicons/react/24/outline'
import { errorLogger, ErrorLog, ErrorSeverity, ErrorCategory } from '@/lib/monitoring/error-logger'

export default function MonitoringPage() {
  const [logs, setLogs] = useState<ErrorLog[]>([])
  const [filteredLogs, setFilteredLogs] = useState<ErrorLog[]>([])
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [autoRefresh, setAutoRefresh] = useState(true)

  const loadLogs = () => {
    const allLogs = errorLogger.getLogs()
    setLogs(allLogs)
    applyFilters(allLogs, selectedSeverity, selectedCategory)
  }

  const applyFilters = (logList: ErrorLog[], severity: string, category: string) => {
    let filtered = logList

    if (severity !== 'all') {
      filtered = filtered.filter(log => log.severity === severity)
    }

    if (category !== 'all') {
      filtered = filtered.filter(log => log.category === category)
    }

    setFilteredLogs(filtered)
  }

  useEffect(() => {
    loadLogs()

    // Subscribe to new errors
    const unsubscribe = errorLogger.onError(() => {
      loadLogs()
    })

    return unsubscribe
  }, [])

  useEffect(() => {
    if (!autoRefresh) return

    const interval = setInterval(() => {
      loadLogs()
    }, 5000) // Refresh every 5 seconds

    return () => clearInterval(interval)
  }, [autoRefresh])

  useEffect(() => {
    applyFilters(logs, selectedSeverity, selectedCategory)
  }, [selectedSeverity, selectedCategory, logs])

  const handleClearLogs = () => {
    if (confirm('Are you sure you want to clear all error logs?')) {
      errorLogger.clearLogs()
      loadLogs()
    }
  }

  const getSeverityBadge = (severity: ErrorSeverity) => {
    switch (severity) {
      case ErrorSeverity.CRITICAL:
        return <Badge variant="destructive">Critical</Badge>
      case ErrorSeverity.HIGH:
        return <Badge className="bg-red-100 text-red-800">High</Badge>
      case ErrorSeverity.MEDIUM:
        return <Badge className="bg-yellow-100 text-yellow-800">Medium</Badge>
      case ErrorSeverity.LOW:
        return <Badge className="bg-blue-100 text-blue-800">Low</Badge>
      default:
        return <Badge variant="secondary">{severity}</Badge>
    }
  }

  const getSeverityIcon = (severity: ErrorSeverity) => {
    switch (severity) {
      case ErrorSeverity.CRITICAL:
      case ErrorSeverity.HIGH:
        return <XCircleIcon className="h-5 w-5 text-red-500" />
      case ErrorSeverity.MEDIUM:
        return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />
      case ErrorSeverity.LOW:
        return <InformationCircleIcon className="h-5 w-5 text-blue-500" />
      default:
        return <InformationCircleIcon className="h-5 w-5 text-gray-500" />
    }
  }

  const getCategoryBadge = (category: ErrorCategory) => {
    const colors: Record<ErrorCategory, string> = {
      [ErrorCategory.API]: 'bg-purple-100 text-purple-800',
      [ErrorCategory.DATABASE]: 'bg-green-100 text-green-800',
      [ErrorCategory.AUTHENTICATION]: 'bg-orange-100 text-orange-800',
      [ErrorCategory.ANALYTICS]: 'bg-blue-100 text-blue-800',
      [ErrorCategory.HEALTH_CHECK]: 'bg-red-100 text-red-800',
      [ErrorCategory.NETWORK]: 'bg-indigo-100 text-indigo-800',
      [ErrorCategory.VALIDATION]: 'bg-yellow-100 text-yellow-800',
      [ErrorCategory.UNKNOWN]: 'bg-gray-100 text-gray-800'
    }

    return (
      <Badge className={colors[category]}>
        {category.replace('_', ' ').toUpperCase()}
      </Badge>
    )
  }

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString()
  }

  const getSeverityCount = (severity: ErrorSeverity) => {
    return logs.filter(log => log.severity === severity).length
  }

  const getCategoryCount = (category: ErrorCategory) => {
    return logs.filter(log => log.category === category).length
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Error Monitoring</h1>
          <p className="text-gray-600">View and manage application error logs</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            {autoRefresh ? 'Disable' : 'Enable'} Auto-refresh
          </Button>
          <Button
            variant="outline"
            onClick={loadLogs}
          >
            Refresh
          </Button>
          <Button
            variant="destructive"
            onClick={handleClearLogs}
          >
            <TrashIcon className="h-4 w-4 mr-2" />
            Clear Logs
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Errors</p>
                <p className="text-2xl font-bold">{logs.length}</p>
              </div>
              <XCircleIcon className="h-8 w-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Critical</p>
                <p className="text-2xl font-bold text-red-600">
                  {getSeverityCount(ErrorSeverity.CRITICAL)}
                </p>
              </div>
              <XCircleIcon className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">High</p>
                <p className="text-2xl font-bold text-orange-600">
                  {getSeverityCount(ErrorSeverity.HIGH)}
                </p>
              </div>
              <ExclamationTriangleIcon className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Medium/Low</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {getSeverityCount(ErrorSeverity.MEDIUM) + getSeverityCount(ErrorSeverity.LOW)}
                </p>
              </div>
              <InformationCircleIcon className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-4">
            <FunnelIcon className="h-5 w-5 text-gray-400" />
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Severity
                </label>
                <select
                  value={selectedSeverity}
                  onChange={(e) => setSelectedSeverity(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Severities</option>
                  <option value={ErrorSeverity.CRITICAL}>Critical</option>
                  <option value={ErrorSeverity.HIGH}>High</option>
                  <option value={ErrorSeverity.MEDIUM}>Medium</option>
                  <option value={ErrorSeverity.LOW}>Low</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Categories</option>
                  <option value={ErrorCategory.API}>API</option>
                  <option value={ErrorCategory.DATABASE}>Database</option>
                  <option value={ErrorCategory.AUTHENTICATION}>Authentication</option>
                  <option value={ErrorCategory.ANALYTICS}>Analytics</option>
                  <option value={ErrorCategory.HEALTH_CHECK}>Health Check</option>
                  <option value={ErrorCategory.NETWORK}>Network</option>
                  <option value={ErrorCategory.VALIDATION}>Validation</option>
                  <option value={ErrorCategory.UNKNOWN}>Unknown</option>
                </select>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error Logs */}
      <Card>
        <CardHeader>
          <CardTitle>Error Logs ({filteredLogs.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredLogs.length === 0 ? (
            <div className="text-center py-8">
              <InformationCircleIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No errors found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredLogs.map((log) => (
                <div
                  key={log.id}
                  className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start space-x-3">
                    {getSeverityIcon(log.severity)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-2">
                        {getSeverityBadge(log.severity)}
                        {getCategoryBadge(log.category)}
                        <span className="text-xs text-gray-500">
                          {formatTimestamp(log.timestamp)}
                        </span>
                      </div>
                      
                      <p className="text-sm font-medium text-gray-900 mb-1">
                        {log.message}
                      </p>

                      {log.context.url && (
                        <p className="text-xs text-gray-600 mb-1">
                          URL: {log.context.url}
                        </p>
                      )}

                      {log.context.method && (
                        <p className="text-xs text-gray-600 mb-1">
                          Method: {log.context.method}
                          {log.context.statusCode && ` (${log.context.statusCode})`}
                        </p>
                      )}

                      {log.stack && (
                        <details className="mt-2">
                          <summary className="text-xs text-blue-600 cursor-pointer hover:text-blue-800">
                            View Stack Trace
                          </summary>
                          <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-x-auto">
                            {log.stack}
                          </pre>
                        </details>
                      )}

                      {log.context.additionalData && (
                        <details className="mt-2">
                          <summary className="text-xs text-blue-600 cursor-pointer hover:text-blue-800">
                            View Additional Data
                          </summary>
                          <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-x-auto">
                            {JSON.stringify(log.context.additionalData, null, 2)}
                          </pre>
                        </details>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Info */}
      <Card>
        <CardHeader>
          <CardTitle>About Error Monitoring</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-gray-600 space-y-2">
            <p>
              This dashboard displays application errors captured by the error logging system.
              Errors are automatically logged and can be filtered by severity and category.
            </p>
            <p>
              Critical and high-severity errors in production are automatically sent to the monitoring
              service and can trigger notifications to administrators.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
