'use client'

import { useState } from 'react'
import { useAuthStore } from '@/store/auth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ProfileEditForm } from '@/components/profile/profile-edit-form'
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

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading Profile...</h2>
          <p className="text-gray-600">Please wait while we load your profile information.</p>
        </div>
      </div>
    )
  }

  const handleEditSuccess = () => {
    setIsEditing(false)
    setShowSuccess(true)
    setTimeout(() => setShowSuccess(false), 3000)
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
              <label className="text-sm font-medium text-gray-500">User ID</label>
              <p className="text-lg font-medium text-gray-900">
                {user.id}
              </p>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-500">Email</label>
              <p className="text-gray-900">{user.email}</p>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-500">Member Since</label>
              <p className="text-gray-900">
                {new Date(user.created_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
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
                Not specified
              </p>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-500">ORCID ID</label>
              <p className="text-gray-900 flex items-center">
                <IdentificationIcon className="w-4 h-4 mr-2 text-gray-400" />
                Not provided
              </p>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-500">Research Domains</label>
              <div className="flex flex-wrap gap-2 mt-2">
                <span className="text-gray-500 italic">No research domains specified</span>
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
              <label className="text-sm font-medium text-gray-500">Account Status</label>
              <p className="text-gray-900 capitalize">Active</p>
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