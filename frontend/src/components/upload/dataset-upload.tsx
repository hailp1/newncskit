'use client'

/**
 * Dataset Upload Component
 * Specialized component for uploading dataset files (CSV, Excel, etc.)
 */

import { uploadDataset } from '@/lib/supabase/storage'
import { FileUpload } from './file-upload'

interface DatasetUploadProps {
  projectId: string
  onUploadSuccess?: (result: { path: string; fullPath: string }) => void
  className?: string
}

export function DatasetUpload({
  projectId,
  onUploadSuccess,
  className,
}: DatasetUploadProps) {
  const handleUpload = async (file: File) => {
    const result = await uploadDataset(file, projectId)
    
    if (onUploadSuccess) {
      onUploadSuccess(result)
    }
  }

  return (
    <FileUpload
      onUpload={handleUpload}
      accept=".csv,.xlsx,.xls,.json"
      maxSize={50} // 50MB for datasets
      label="Upload Dataset"
      description="Drag and drop your CSV, Excel, or JSON file here"
      className={className}
    />
  )
}
