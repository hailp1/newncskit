'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  CogIcon, 
  PlusIcon,
  PencilIcon,
  TrashIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline'

interface SystemConfig {
  id: string
  key: string
  value: any
  category: string
  category_display: string
  description: string
  data_type: string
  data_type_display: string
  is_active: boolean
  is_system: boolean
  requires_restart: boolean
  created_at: string
  updated_at: string
}

interface ConfigCategories {
  [key: string]: {
    name: string
    configs: SystemConfig[]
  }
}

export default function SystemConfigPage() {
  const [configs, setConfigs] = useState<SystemConfig[]>([])
  const [categories, setCategories] = useState<ConfigCategories>({})
  const [loading, setLoading] = useState(true)
  const [editingConfig, setEditingConfig] = useState<SystemConfig | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  useEffect(() => {
    fetchConfigs()
    fetchConfigsByCategory()
  }, [])

  const fetchConfigs = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001'
      const response = await fetch(`${apiUrl}/api/admin/config/`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setConfigs(data.results || [])
      }
    } catch (error) {
      console.error('Error fetching configs:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchConfigsByCategory = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001'
      const response = await fetch(`${apiUrl}/api/admin/config/by_category/`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setCategories(data)
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const updateConfig = async (config: SystemConfig, newValue: any) => {
    try {
      const response = await fetch(`/api/admin/config/${config.id}/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        },
        body: JSON.stringify({
          value: newValue
        })
      })

      if (response.ok) {
        alert('Configuration updated successfully!')
        fetchConfigs()
        fetchConfigsByCategory()
        setEditingConfig(null)
      } else {
        const error = await response.json()
        alert(`Failed to update configuration: ${error.detail || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Error updating config:', error)
      alert('Error updating configuration')
    }
  }

  const createConfig = async (configData: any) => {
    try {
      const response = await fetch('/api/admin/config/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        },
        body: JSON.stringify(configData)
      })

      if (response.ok) {
        alert('Configuration created successfully!')
        fetchConfigs()
        fetchConfigsByCategory()
        setShowCreateModal(false)
      } else {
        const error = await response.json()
        alert(`Failed to create configuration: ${error.detail || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Error creating config:', error)
      alert('Error creating configuration')
    }
  }

  const deleteConfig = async (config: SystemConfig) => {
    if (config.is_system) {
      alert('System configurations cannot be deleted')
      return
    }

    if (!confirm(`Are you sure you want to delete configuration "${config.key}"?`)) {
      return
    }

    try {
      const response = await fetch(`/api/admin/config/${config.id}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      })

      if (response.ok) {
        alert('Configuration deleted successfully!')
        fetchConfigs()
        fetchConfigsByCategory()
      } else {
        alert('Failed to delete configuration')
      }
    } catch (error) {
      console.error('Error deleting config:', error)
      alert('Error deleting configuration')
    }
  }

  const renderConfigValue = (config: SystemConfig) => {
    if (editingConfig?.id === config.id) {
      return (
        <ConfigEditor
          config={config}
          onSave={(newValue) => updateConfig(config, newValue)}
          onCancel={() => setEditingConfig(null)}
        />
      )
    }

    let displayValue = config.value
    if (config.data_type === 'boolean') {
      displayValue = config.value ? 'True' : 'False'
    } else if (config.data_type === 'json' || config.data_type === 'array') {
      displayValue = JSON.stringify(config.value, null, 2)
    }

    return (
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="font-mono text-sm bg-gray-100 p-2 rounded">
            {displayValue}
          </div>
        </div>
        <div className="ml-4 flex space-x-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setEditingConfig(config)}
          >
            <PencilIcon className="h-4 w-4" />
          </Button>
          {!config.is_system && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => deleteConfig(config)}
            >
              <TrashIcon className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    )
  }

  const getConfigBadges = (config: SystemConfig) => (
    <div className="flex space-x-2">
      <Badge variant={config.is_active ? "default" : "secondary"}>
        {config.is_active ? 'Active' : 'Inactive'}
      </Badge>
      {config.is_system && (
        <Badge variant="outline">System</Badge>
      )}
      {config.requires_restart && (
        <Badge variant="destructive">Requires Restart</Badge>
      )}
      <Badge className="bg-blue-100 text-blue-800">
        {config.data_type_display}
      </Badge>
    </div>
  )

  const filteredConfigs = selectedCategory === 'all' 
    ? configs 
    : configs.filter(config => config.category === selectedCategory)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">System Configuration</h1>
          <p className="text-gray-600">Manage platform settings and configuration</p>
        </div>
        <div className="flex space-x-3">
          <Button onClick={() => fetchConfigs()} variant="outline">
            <ArrowPathIcon className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={() => setShowCreateModal(true)}>
            <PlusIcon className="w-4 h-4 mr-2" />
            Add Configuration
          </Button>
        </div>
      </div>

      {/* Category Filter */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedCategory === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory('all')}
            >
              All Categories ({configs.length})
            </Button>
            {Object.entries(categories).map(([key, category]) => (
              <Button
                key={key}
                variant={selectedCategory === key ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(key)}
              >
                {category.name} ({category.configs.length})
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Configurations */}
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredConfigs.map((config) => (
            <Card key={config.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg font-mono">{config.key}</CardTitle>
                    <p className="text-sm text-gray-600 mt-1">{config.description}</p>
                  </div>
                  {getConfigBadges(config)}
                </div>
              </CardHeader>
              <CardContent>
                {renderConfigValue(config)}
                <div className="mt-4 text-xs text-gray-500">
                  <div>Category: {config.category_display}</div>
                  <div>Last updated: {new Date(config.updated_at).toLocaleString()}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create Configuration Modal */}
      {showCreateModal && (
        <CreateConfigModal
          onSave={createConfig}
          onCancel={() => setShowCreateModal(false)}
        />
      )}
    </div>
  )
}

// Config Editor Component
function ConfigEditor({ 
  config, 
  onSave, 
  onCancel 
}: { 
  config: SystemConfig
  onSave: (value: any) => void
  onCancel: () => void 
}) {
  const [value, setValue] = useState(config.value)
  const [error, setError] = useState('')

  const handleSave = () => {
    try {
      let parsedValue = value

      if (config.data_type === 'integer') {
        parsedValue = parseInt(value)
        if (isNaN(parsedValue)) {
          setError('Invalid integer value')
          return
        }
      } else if (config.data_type === 'float') {
        parsedValue = parseFloat(value)
        if (isNaN(parsedValue)) {
          setError('Invalid float value')
          return
        }
      } else if (config.data_type === 'boolean') {
        parsedValue = value === 'true' || value === true
      } else if (config.data_type === 'json' || config.data_type === 'array') {
        try {
          parsedValue = JSON.parse(value)
        } catch (e) {
          setError('Invalid JSON format')
          return
        }
      }

      onSave(parsedValue)
    } catch (error) {
      setError('Invalid value format')
    }
  }

  return (
    <div className="space-y-4">
      {config.data_type === 'boolean' ? (
        <select
          value={value.toString()}
          onChange={(e) => setValue(e.target.value === 'true')}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="true">True</option>
          <option value="false">False</option>
        </select>
      ) : config.data_type === 'json' || config.data_type === 'array' ? (
        <textarea
          value={typeof value === 'string' ? value : JSON.stringify(value, null, 2)}
          onChange={(e) => setValue(e.target.value)}
          rows={6}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
        />
      ) : (
        <Input
          type={config.data_type === 'integer' || config.data_type === 'float' ? 'number' : 'text'}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          step={config.data_type === 'float' ? '0.01' : undefined}
        />
      )}
      
      {error && (
        <div className="text-red-600 text-sm">{error}</div>
      )}
      
      <div className="flex space-x-2">
        <Button onClick={handleSave} size="sm">
          <CheckCircleIcon className="h-4 w-4 mr-2" />
          Save
        </Button>
        <Button onClick={onCancel} variant="outline" size="sm">
          Cancel
        </Button>
      </div>
    </div>
  )
}

// Create Config Modal Component
function CreateConfigModal({ 
  onSave, 
  onCancel 
}: { 
  onSave: (config: any) => void
  onCancel: () => void 
}) {
  const [formData, setFormData] = useState({
    key: '',
    value: '',
    category: 'general',
    description: '',
    data_type: 'string'
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    let parsedValue: any = formData.value
    
    try {
      if (formData.data_type === 'integer') {
        parsedValue = parseInt(formData.value)
      } else if (formData.data_type === 'float') {
        parsedValue = parseFloat(formData.value)
      } else if (formData.data_type === 'boolean') {
        parsedValue = formData.value === 'true'
      } else if (formData.data_type === 'json' || formData.data_type === 'array') {
        parsedValue = JSON.parse(formData.value)
      }
    } catch (error) {
      alert('Invalid value format for selected data type')
      return
    }

    onSave({
      ...formData,
      value: parsedValue
    })
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Create Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Key</label>
              <Input
                required
                value={formData.key}
                onChange={(e) => setFormData({...formData, key: e.target.value})}
                placeholder="config_key"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="general">General</option>
                <option value="security">Security</option>
                <option value="email">Email</option>
                <option value="payment">Payment</option>
                <option value="features">Features</option>
                <option value="limits">Limits</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Data Type</label>
              <select
                value={formData.data_type}
                onChange={(e) => setFormData({...formData, data_type: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="string">String</option>
                <option value="integer">Integer</option>
                <option value="float">Float</option>
                <option value="boolean">Boolean</option>
                <option value="json">JSON</option>
                <option value="array">Array</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Value</label>
              {formData.data_type === 'boolean' ? (
                <select
                  value={formData.value}
                  onChange={(e) => setFormData({...formData, value: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="true">True</option>
                  <option value="false">False</option>
                </select>
              ) : (
                <Input
                  required
                  value={formData.value}
                  onChange={(e) => setFormData({...formData, value: e.target.value})}
                  placeholder={formData.data_type === 'json' ? '{"key": "value"}' : 'Configuration value'}
                />
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <Input
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Configuration description"
              />
            </div>

            <div className="flex space-x-2">
              <Button type="submit">Create</Button>
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}