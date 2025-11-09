'use client'

import { useState, useEffect } from 'react'
import { useAuthStore } from '@/store/auth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ProfileEditForm } from '@/components/profile/profile-edit-form'
import { profileServiceClient as profileService, UserProfile } from '@/services/profile.service.client'
import { 
  UserIcon, 
  AcademicCapIcon, 
  BuildingOfficeIcon,
  IdentificationIcon,
  PencilIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline'

export default function ProfilePage() {
  const { user } = useAuthStore()
  const [isEditing, setIsEditing] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load profile data on mount
  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const profileData = await profileService.getProfile()
      setProfile(profileData)
    } catch (err) {
      console.error('Failed to load profile:', err)
      setError(err instanceof Error ? err.message : 'Failed to load profile')
    } finally {
      setIsLoading(false)
    }
  }

  const handleEditSuccess = async () => {
    setIsEditing(false)
    setShowSuccess(true)
    setTimeout(() => setShowSuccess(false), 3000)
    // Reload profile data after successful edit
    await loadProfile()
  }

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      setIsLoading(true)
      setError(null)
      await profileService.uploadAvatar(file)
      setShowSuccess(true)
      setTimeout(() => setShowSuccess(false), 3000)
      // Reload profile to show new avatar
      await loadProfile()
    } catch (err) {
      console.error('Failed to upload avatar:', err)
      setError(err instanceof Error ? err.message : 'Failed to upload avatar')
    } finally {
      setIsLoading(false)
      // Reset file input
      event.target.value = ''
    }
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Not Authenticated</h2>
          <p className="text-gray-600">Please log in to view your profile.</p>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading Profile...</h2>
          <p className="text-gray-600">Please wait while we load your profile information.</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-red-600 mb-2">Error Loading Profile</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={loadProfile}>Try Again</Button>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Profile Not Found</h2>
          <p className="text-gray-600">Unable to load profile data.</p>
        </div>
      </div>
    )
  }

  if (isEditing) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Edit Profile</h1>
            <p className="text-gray-600">Update your personal and academic information</p>
          </div>
        </div>

        <div className="flex justify-center">
          <ProfileEditForm
            profile={profile}
            onSuccess={handleEditSuccess}
            onCancel={() => setIsEditing(false)}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
          <p className="text-gray-600">Manage your personal and academic information</p>
        </div>
        <Button onClick={() => setIsEditing(true)}>
          <PencilIcon className="w-4 h-4 mr-2" />
          Edit Profile
        </Button>
      </div>

      {/* Success Message */}
      {showSuccess && (
        <Card className="bg-green-50 border-green-200">
          <CardContent className="pt-6">
            <div className="flex items-center">
              <CheckCircleIcon className="w-5 h-5 text-green-600 mr-2" />
              <span className="text-green-800 font-medium">Profile updated successfully!</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Avatar Section */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center space-x-6">
            <div className="relative">
              {profile.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt="Profile avatar"
                  className="w-24 h-24 rounded-full object-cover border-2 border-gray-200"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center">
                  <UserIcon className="w-12 h-12 text-gray-400" />
                </div>
              )}
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900">{profile.full_name || 'User'}</h3>
              <p className="text-sm text-gray-600">{profile.email}</p>
              <div className="mt-3">
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  className="hidden"
                  onChange={handleAvatarUpload}
                  disabled={isLoading}
                />
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => document.getElementById('avatar-upload')?.click()}
                  disabled={isLoading}
                >
                  {isLoading ? 'Uploading...' : 'Change Avatar'}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Profile Information */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <UserIcon className="w-5 h-5 mr-2" />
              Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Full Name</label>
              <p className="text-lg font-medium text-gray-900">
                {profile.full_name || 'Not specified'}
              </p>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-500">Email</label>
              <p className="text-gray-900">{profile.email}</p>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-500">Member Since</label>
              <p className="text-gray-900">
                {new Date(profile.created_at).toLocaleDateString('vi-VN', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>

            {profile.last_login_at && (
              <div>
                <label className="text-sm font-medium text-gray-500">Last Login</label>
                <p className="text-gray-900">
                  {new Date(profile.last_login_at).toLocaleDateString('vi-VN', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Academic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <AcademicCapIcon className="w-5 h-5 mr-2" />
              Academic Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Institution</label>
              <p className="text-gray-900 flex items-center">
                <BuildingOfficeIcon className="w-4 h-4 mr-2 text-gray-400" />
                {profile.institution || 'Not specified'}
              </p>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-500">ORCID ID</label>
              <p className="text-gray-900 flex items-center">
                <IdentificationIcon className="w-4 h-4 mr-2 text-gray-400" />
                {profile.orcid_id || 'Not specified'}
              </p>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-500">Research Domains</label>
              <div className="flex flex-wrap gap-2 mt-2">
                {profile.research_domains && profile.research_domains.length > 0 ? (
                  profile.research_domains.map((domain) => (
                    <span
                      key={domain}
                      className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                    >
                      {domain}
                    </span>
                  ))
                ) : (
                  <span className="text-gray-500 italic">No research domains specified</span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Account Information */}
        <Card>
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Role</label>
              <p className="text-gray-900 capitalize">{profile.role}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-500">Subscription Type</label>
              <p className="text-gray-900 capitalize">{profile.subscription_type}</p>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-500">Account Status</label>
              <p className={`capitalize font-medium ${profile.is_active ? 'text-green-600' : 'text-red-600'}`}>
                {profile.is_active ? 'Active' : 'Inactive'}
              </p>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-500">Available Features</label>
              <div className="mt-2">
                <div className="flex items-center text-sm text-gray-600">
                  <CheckCircleIcon className="w-4 h-4 text-green-500 mr-2" />
                  CSV Analysis
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <CheckCircleIcon className="w-4 h-4 text-green-500 mr-2" />
                  Data Export
                </div>
                {profile.subscription_type !== 'free' && (
                  <>
                    <div className="flex items-center text-sm text-gray-600">
                      <CheckCircleIcon className="w-4 h-4 text-green-500 mr-2" />
                      Advanced Analytics
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <CheckCircleIcon className="w-4 h-4 text-green-500 mr-2" />
                      Priority Support
                    </div>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full justify-start">
              <PencilIcon className="w-4 h-4 mr-2" />
              Change Password
            </Button>
            
            <Button variant="outline" className="w-full justify-start">
              <UserIcon className="w-4 h-4 mr-2" />
              Export Profile Data
            </Button>
            
            <Button variant="outline" className="w-full justify-start text-red-600 hover:text-red-700">
              <UserIcon className="w-4 h-4 mr-2" />
              Delete Account
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}