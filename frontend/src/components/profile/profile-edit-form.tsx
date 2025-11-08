'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuthStore } from '@/store/auth'
import { authService } from '@/services/auth'

const profileSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  institution: z.string().optional(),
  orcidId: z.string().optional(),
  researchDomain: z.array(z.string()).min(1, 'Please select at least one research domain'),
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
  onSuccess?: () => void
  onCancel?: () => void
}

export function ProfileEditForm({ onSuccess, onCancel }: ProfileEditFormProps) {
  const { user, updateUser } = useAuthStore()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedDomains, setSelectedDomains] = useState<string[]>(
    user?.profile.researchDomain || []
  )

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: user?.profile.firstName || '',
      lastName: user?.profile.lastName || '',
      institution: user?.profile.institution || '',
      orcidId: user?.profile.orcidId || '',
      researchDomain: user?.profile.researchDomain || [],
    },
  })

  const onSubmit = async (data: ProfileFormData) => {
    if (!user) return

    setIsLoading(true)
    setError(null)

    try {
      const updatedUser = await authService.updateProfile(user.id, {
        firstName: data.firstName,
        lastName: data.lastName,
        institution: data.institution,
        orcidId: data.orcidId,
        researchDomain: data.researchDomain,
      })

      // Update user in store
      updateUser(updatedUser)
      
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
    setValue('researchDomain', newDomains)
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Edit Profile</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Name Fields */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="firstName" className="text-sm font-medium">
                First Name *
              </label>
              <Input
                id="firstName"
                {...register('firstName')}
                className={errors.firstName ? 'border-red-500' : ''}
              />
              {errors.firstName && (
                <p className="text-sm text-red-500">{errors.firstName.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="lastName" className="text-sm font-medium">
                Last Name *
              </label>
              <Input
                id="lastName"
                {...register('lastName')}
                className={errors.lastName ? 'border-red-500' : ''}
              />
              {errors.lastName && (
                <p className="text-sm text-red-500">{errors.lastName.message}</p>
              )}
            </div>
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
            <label className="text-sm font-medium">Research Domains *</label>
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
            {errors.researchDomain && (
              <p className="text-sm text-red-500">{errors.researchDomain.message}</p>
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