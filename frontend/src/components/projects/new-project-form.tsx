'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuthStore } from '@/store/auth'

const projectSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  researchDomain: z.string().min(1, 'Please select a research domain'),
  methodology: z.array(z.string()).min(1, 'Please select at least one methodology'),
  keywords: z.array(z.string()).min(1, 'Please add at least one keyword'),
  startDate: z.string().min(1, 'Start date is required'),
  expectedEndDate: z.string().min(1, 'Expected end date is required'),
  fundingSource: z.string().optional(),
  budgetAmount: z.string().optional(),
})

type ProjectFormData = z.infer<typeof projectSchema>

const researchDomains = [
  'Computer Science',
  'Medicine & Health Sciences',
  'Engineering',
  'Life Sciences',
  'Physical Sciences',
  'Social Sciences',
  'Mathematics',
  'Environmental Sciences',
  'Psychology',
  'Economics',
  'Other',
]

const methodologies = [
  'Experimental Research',
  'Theoretical Analysis',
  'Literature Review',
  'Case Study',
  'Survey Research',
  'Qualitative Research',
  'Quantitative Research',
  'Mixed Methods',
  'Meta-Analysis',
  'Systematic Review',
  'Action Research',
  'Ethnographic Study',
]

interface NewProjectFormProps {
  onSuccess?: (project: any) => void
  onCancel?: () => void
}

export function NewProjectForm({ onSuccess, onCancel }: NewProjectFormProps) {
  const { user } = useAuthStore()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedMethodologies, setSelectedMethodologies] = useState<string[]>([])
  const [keywords, setKeywords] = useState<string[]>([])
  const [keywordInput, setKeywordInput] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      methodology: [],
      keywords: [],
    },
  })

  const onSubmit = async (data: ProjectFormData) => {
    if (!user) return

    setIsLoading(true)
    setError(null)

    try {
      // Create project via Django API
      const response = await fetch('http://127.0.0.1:8000/api/projects/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // In a real app, you'd include the JWT token here
          // 'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: data.title,
          description: data.description,
          research_domain: data.researchDomain,
          methodology: data.methodology,
          keywords: data.keywords,
          start_date: data.startDate,
          expected_end_date: data.expectedEndDate,
          funding_source: data.fundingSource,
          budget_amount: data.budgetAmount ? parseFloat(data.budgetAmount) : null,
          owner_id: user.id,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create project')
      }

      const project = await response.json()
      onSuccess?.(project)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create project')
    } finally {
      setIsLoading(false)
    }
  }

  const toggleMethodology = (methodology: string) => {
    const newMethodologies = selectedMethodologies.includes(methodology)
      ? selectedMethodologies.filter(m => m !== methodology)
      : [...selectedMethodologies, methodology]
    
    setSelectedMethodologies(newMethodologies)
    setValue('methodology', newMethodologies)
  }

  const addKeyword = () => {
    if (keywordInput.trim() && !keywords.includes(keywordInput.trim())) {
      const newKeywords = [...keywords, keywordInput.trim()]
      setKeywords(newKeywords)
      setValue('keywords', newKeywords)
      setKeywordInput('')
    }
  }

  const removeKeyword = (keyword: string) => {
    const newKeywords = keywords.filter(k => k !== keyword)
    setKeywords(newKeywords)
    setValue('keywords', newKeywords)
  }

  const handleKeywordKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addKeyword()
    }
  }

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <CardTitle>Create New Research Project</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Basic Information</h3>
            
            <div className="space-y-2">
              <label htmlFor="title" className="text-sm font-medium">
                Project Title *
              </label>
              <Input
                id="title"
                placeholder="Enter your research project title"
                {...register('title')}
                className={errors.title ? 'border-red-500' : ''}
              />
              {errors.title && (
                <p className="text-sm text-red-500">{errors.title.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="description" className="text-sm font-medium">
                Project Description *
              </label>
              <textarea
                id="description"
                rows={4}
                placeholder="Describe your research project, objectives, and expected outcomes"
                {...register('description')}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.description ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.description && (
                <p className="text-sm text-red-500">{errors.description.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="researchDomain" className="text-sm font-medium">
                Research Domain *
              </label>
              <select
                id="researchDomain"
                {...register('researchDomain')}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.researchDomain ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Select a research domain</option>
                {researchDomains.map((domain) => (
                  <option key={domain} value={domain}>
                    {domain}
                  </option>
                ))}
              </select>
              {errors.researchDomain && (
                <p className="text-sm text-red-500">{errors.researchDomain.message}</p>
              )}
            </div>
          </div>

          {/* Methodology */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Research Methodology</h3>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Methodologies *</label>
              <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto border rounded-md p-3">
                {methodologies.map((methodology) => (
                  <label key={methodology} className="flex items-center space-x-2 text-sm">
                    <input
                      type="checkbox"
                      checked={selectedMethodologies.includes(methodology)}
                      onChange={() => toggleMethodology(methodology)}
                      className="rounded border-gray-300"
                    />
                    <span>{methodology}</span>
                  </label>
                ))}
              </div>
              {errors.methodology && (
                <p className="text-sm text-red-500">{errors.methodology.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Keywords *</label>
              <div className="flex gap-2">
                <Input
                  value={keywordInput}
                  onChange={(e) => setKeywordInput(e.target.value)}
                  onKeyPress={handleKeywordKeyPress}
                  placeholder="Add keywords (press Enter to add)"
                  className="flex-1"
                />
                <Button type="button" onClick={addKeyword} variant="outline">
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {keywords.map((keyword, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full flex items-center"
                  >
                    {keyword}
                    <button
                      type="button"
                      onClick={() => removeKeyword(keyword)}
                      className="ml-2 text-blue-600 hover:text-blue-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              {errors.keywords && (
                <p className="text-sm text-red-500">{errors.keywords.message}</p>
              )}
            </div>
          </div>

          {/* Timeline & Funding */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Timeline & Funding</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="startDate" className="text-sm font-medium">
                  Start Date *
                </label>
                <Input
                  id="startDate"
                  type="date"
                  {...register('startDate')}
                  className={errors.startDate ? 'border-red-500' : ''}
                />
                {errors.startDate && (
                  <p className="text-sm text-red-500">{errors.startDate.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="expectedEndDate" className="text-sm font-medium">
                  Expected End Date *
                </label>
                <Input
                  id="expectedEndDate"
                  type="date"
                  {...register('expectedEndDate')}
                  className={errors.expectedEndDate ? 'border-red-500' : ''}
                />
                {errors.expectedEndDate && (
                  <p className="text-sm text-red-500">{errors.expectedEndDate.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="fundingSource" className="text-sm font-medium">
                  Funding Source
                </label>
                <Input
                  id="fundingSource"
                  placeholder="e.g., NSF, NIH, University Grant"
                  {...register('fundingSource')}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="budgetAmount" className="text-sm font-medium">
                  Budget Amount (USD)
                </label>
                <Input
                  id="budgetAmount"
                  type="number"
                  placeholder="0.00"
                  {...register('budgetAmount')}
                />
              </div>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="p-3 text-sm text-red-500 bg-red-50 border border-red-200 rounded-md">
              {error}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button type="submit" disabled={isLoading} className="flex-1">
              {isLoading ? 'Creating Project...' : 'Create Project'}
            </Button>
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  )
}