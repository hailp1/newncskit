/**
 * useFileUpload Hook
 * Custom hook for managing file uploads with Supabase Storage
 */

import { useState } from 'react'
import { uploadFile, type UploadOptions, type UploadResult } from '@/lib/supabase/storage'

interface UseFileUploadOptions extends UploadOptions {
  onSuccess?: (result: UploadResult) => void
  onError?: (error: Error) => void
}

export function useFileUpload(options: UseFileUploadOptions) {
  const [isUploading, setIsUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<Error | null>(null)
  const [result, setResult] = useState<UploadResult | null>(null)

  const upload = async (file: File) => {
    setIsUploading(true)
    setProgress(0)
    setError(null)
    setResult(null)

    try {
      // Simulate progress (Supabase doesn't provide upload progress yet)
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90))
      }, 200)

      const uploadResult = await uploadFile(file, options)

      clearInterval(progressInterval)
      setProgress(100)
      setResult(uploadResult)

      if (options.onSuccess) {
        options.onSuccess(uploadResult)
      }

      return uploadResult
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Upload failed')
      setError(error)

      if (options.onError) {
        options.onError(error)
      }

      throw error
    } finally {
      setIsUploading(false)
    }
  }

  const reset = () => {
    setIsUploading(false)
    setProgress(0)
    setError(null)
    setResult(null)
  }

  return {
    upload,
    reset,
    isUploading,
    progress,
    error,
    result,
  }
}
