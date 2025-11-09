'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { profileServiceClient as profileService, UserProfile } from '@/services/profile.service.client'

const profileSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  institution: z.string().optional(),
  orcidId: z.string().optional(),
  researchDomains: z.array(z.string()).optional(),
})

type ProfileFormData = z.infer<typeof profileSchema>

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

interface ProfileEditFormProps {
  profile: UserProfile
  onSuccess?: () => void
  onCancel?: () => void
}

export function ProfileEditForm({ profile, onSuccess, onCancel }: ProfileEditFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedDomains, setSelectedDomains] = useState<string[]>(
    profile.research_domains || []
  )

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: profile.full_name || '',
      institution: profile.institution || '',
      orcidId: profile.orcid_id || '',
      researchDomains: profile.research_domains || [],
    },
  })

  const onSubmit = async (data: ProfileFormData) => {
    setIsLoading(true)
    setError(null)

    try {
      await profileService.updateProfile({
        full_name: data.fullName,
        institution: data.institution || null,
        orcid_id: data.orcidId || null,
        research_domains: data.researchDomains || null,
      })
      
      onSuccess?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile')
    } finally {
      setIsLoading(false)
    }
  }

  const toggleDomain = (domain: string) => {
    const newDomains = selectedDomains.includes(domain)
      ? selectedDomains.filter(d => d !== domain)
      : [...selectedDomains, domain]
    
    setSelectedDomains(newDomains)
    setValue('researchDomains', newDomains)
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Edit Profile</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Full Name */}
          <div className="space-y-2">
            <label htmlFor="fullName" className="text-sm font-medium">
              Full Name *
            </label>
            <Input
              id="fullName"
              {...register('fullName')}
              className={errors.fullName ? 'border-red-500' : ''}
            />
            {errors.fullName && (
              <p className="text-sm text-red-500">{errors.fullName.message}</p>
            )}
          </div>

          {/* Institution */}
          <div className="space-y-2">
            <label htmlFor="institution" className="text-sm font-medium">
              Institution
            </label>
            <Input
              id="institution"
              placeholder="Your university or organization"
              {...register('institution')}
            />
          </div>

          {/* ORCID ID */}
          <div className="space-y-2">
            <label htmlFor="orcidId" className="text-sm font-medium">
              ORCID ID
            </label>
            <Input
              id="orcidId"
              placeholder="0000-0000-0000-0000"
              {...register('orcidId')}
            />
            <p className="text-xs text-gray-500">
              Your ORCID identifier (optional)
            </p>
          </div>

          {/* Research Domains */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Research Domains</label>
            <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto border rounded-md p-3">
              {researchDomains.map((domain) => (
                <label key={domain} className="flex items-center space-x-2 text-sm">
                  <input
                    type="checkbox"
                    checked={selectedDomains.includes(domain)}
                    onChange={() => toggleDomain(domain)}
                    className="rounded border-gray-300"
                  />
                  <span>{domain}</span>
                </label>
              ))}
            </div>
            {errors.researchDomains && (
              <p className="text-sm text-red-500">{errors.researchDomains.message}</p>
            )}
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
              {isLoading ? 'Updating...' : 'Update Profile'}
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