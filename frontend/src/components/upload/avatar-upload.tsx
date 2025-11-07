'use client'

/**
 * Avatar Upload Component
 * Specialized component for uploading user avatars
 */

import { useState } from 'react'
import Image from 'next/image'
import { uploadAvatar, deleteFile } from '@/lib/supabase/storage'
import { useAuthStore } from '@/store/auth'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle, Upload, Loader2, Camera } from 'lucide-react'

interface AvatarUploadProps {
  currentAvatarUrl?: string
  onUploadSuccess?: (url: string) => void
  size?: number
}

export function AvatarUpload({
  currentAvatarUrl,
  onUploadSuccess,
  size = 128,
}: AvatarUploadProps) {
  const { user } = useAuthStore()
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentAvatarUrl || null)

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file')
      return
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setError('Image size must be less than 2MB')
      return
    }

    setError(null)
    setIsUploading(true)

    try {
      // Create preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string)
      }
      reader.readAsDataURL(file)

      // Upload to Supabase
      const result = await uploadAvatar(file)

      // Update profile in database (you may want to add this)
      // await updateProfile({ avatar_url: result.publicUrl })

      if (onUploadSuccess && result.publicUrl) {
        onUploadSuccess(result.publicUrl)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
      setPreviewUrl(currentAvatarUrl || null)
    } finally {
      setIsUploading(false)
    }
  }

  const handleRemove = async () => {
    if (!user) return

    setIsUploading(true)
    setError(null)

    try {
      await deleteFile('avatars', `${user.id}/avatar.jpg`)
      setPreviewUrl(null)
      
      if (onUploadSuccess) {
        onUploadSuccess('')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove avatar')
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Avatar Preview */}
      <div className="flex items-center space-x-4">
        <div
          className="relative rounded-full overflow-hidden bg-gray-200"
          style={{ width: size, height: size }}
        >
          {previewUrl ? (
            <Image
              src={previewUrl}
              alt="Avatar"
              fill
              className="object-cover"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400">
              <Camera className="h-8 w-8" />
            </div>
          )}

          {isUploading && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <Loader2 className="h-8 w-8 text-white animate-spin" />
            </div>
          )}
        </div>

        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isUploading}
              onClick={() => document.getElementById('avatar-upload')?.click()}
            >
              <Upload className="h-4 w-4 mr-2" />
              {previewUrl ? 'Change Avatar' : 'Upload Avatar'}
            </Button>

            {previewUrl && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={isUploading}
                onClick={handleRemove}
              >
                Remove
              </Button>
            )}
          </div>

          <p className="text-xs text-gray-500">
            JPG, PNG or GIF. Max size 2MB.
          </p>
        </div>
      </div>

      {/* Hidden File Input */}
      <input
        id="avatar-upload"
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Error Message */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  )
}
