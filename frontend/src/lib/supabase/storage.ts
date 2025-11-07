/**
 * Supabase Storage Helpers
 * Handles file uploads, downloads, and deletions
 */

import { createClient } from './client'

export interface UploadOptions {
  bucket: 'avatars' | 'datasets' | 'exports'
  folder?: string
  fileName?: string
  upsert?: boolean
}

export interface UploadResult {
  path: string
  fullPath: string
  publicUrl?: string
}

/**
 * Upload file to Supabase Storage
 */
export async function uploadFile(
  file: File,
  options: UploadOptions
): Promise<UploadResult> {
  const supabase = createClient()

  // Get current user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('User not authenticated')
  }

  // Generate file path
  const timestamp = Date.now()
  const fileExt = file.name.split('.').pop()
  const fileName = options.fileName || `${timestamp}.${fileExt}`
  
  // Build path: {user_id}/{folder}/{fileName}
  const folder = options.folder || ''
  const filePath = folder 
    ? `${user.id}/${folder}/${fileName}`
    : `${user.id}/${fileName}`

  // Upload file
  const { data, error } = await supabase.storage
    .from(options.bucket)
    .upload(filePath, file, {
      upsert: options.upsert || false,
      contentType: file.type,
    })

  if (error) {
    throw new Error(`Upload failed: ${error.message}`)
  }

  // Get public URL if bucket is public
  let publicUrl: string | undefined
  if (options.bucket === 'avatars') {
    const { data: urlData } = supabase.storage
      .from(options.bucket)
      .getPublicUrl(filePath)
    publicUrl = urlData.publicUrl
  }

  return {
    path: data.path,
    fullPath: filePath,
    publicUrl,
  }
}

/**
 * Upload avatar image
 */
export async function uploadAvatar(file: File): Promise<UploadResult> {
  return uploadFile(file, {
    bucket: 'avatars',
    fileName: 'avatar.jpg',
    upsert: true, // Replace existing avatar
  })
}

/**
 * Upload dataset file
 */
export async function uploadDataset(
  file: File,
  projectId: string
): Promise<UploadResult> {
  return uploadFile(file, {
    bucket: 'datasets',
    folder: projectId,
  })
}

/**
 * Upload export file
 */
export async function uploadExport(file: File): Promise<UploadResult> {
  return uploadFile(file, {
    bucket: 'exports',
  })
}

/**
 * Download file from Supabase Storage
 */
export async function downloadFile(
  bucket: 'avatars' | 'datasets' | 'exports',
  path: string
): Promise<Blob> {
  const supabase = createClient()

  const { data, error } = await supabase.storage
    .from(bucket)
    .download(path)

  if (error) {
    throw new Error(`Download failed: ${error.message}`)
  }

  return data
}

/**
 * Get signed URL for private file (expires in 1 hour)
 */
export async function getSignedUrl(
  bucket: 'datasets' | 'exports',
  path: string,
  expiresIn: number = 3600 // 1 hour
): Promise<string> {
  const supabase = createClient()

  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(path, expiresIn)

  if (error) {
    throw new Error(`Failed to create signed URL: ${error.message}`)
  }

  return data.signedUrl
}

/**
 * Delete file from Supabase Storage
 */
export async function deleteFile(
  bucket: 'avatars' | 'datasets' | 'exports',
  path: string
): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase.storage
    .from(bucket)
    .remove([path])

  if (error) {
    throw new Error(`Delete failed: ${error.message}`)
  }
}

/**
 * Delete multiple files
 */
export async function deleteFiles(
  bucket: 'avatars' | 'datasets' | 'exports',
  paths: string[]
): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase.storage
    .from(bucket)
    .remove(paths)

  if (error) {
    throw new Error(`Delete failed: ${error.message}`)
  }
}

/**
 * List files in a folder
 */
export async function listFiles(
  bucket: 'avatars' | 'datasets' | 'exports',
  folder?: string
): Promise<Array<{ name: string; id: string; updated_at: string; size: number }>> {
  const supabase = createClient()

  // Get current user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('User not authenticated')
  }

  const path = folder ? `${user.id}/${folder}` : user.id

  const { data, error } = await supabase.storage
    .from(bucket)
    .list(path)

  if (error) {
    throw new Error(`List failed: ${error.message}`)
  }

  return data || []
}

/**
 * Get file metadata
 */
export async function getFileMetadata(
  bucket: 'avatars' | 'datasets' | 'exports',
  path: string
) {
  const supabase = createClient()

  const { data, error } = await supabase.storage
    .from(bucket)
    .list(path.split('/').slice(0, -1).join('/'), {
      search: path.split('/').pop(),
    })

  if (error) {
    throw new Error(`Failed to get metadata: ${error.message}`)
  }

  return data?.[0]
}

/**
 * Check if file exists
 */
export async function fileExists(
  bucket: 'avatars' | 'datasets' | 'exports',
  path: string
): Promise<boolean> {
  try {
    await getFileMetadata(bucket, path)
    return true
  } catch {
    return false
  }
}
