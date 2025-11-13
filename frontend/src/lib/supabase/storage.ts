// This file has been deprecated - Supabase has been replaced with NextAuth + Prisma
// Keeping this stub to prevent import errors during migration
// TODO: Remove all imports of this file

export interface UploadOptions {
  bucket: string
  path: string
  file: File
}

export interface UploadResult {
  success: boolean
  url?: string
  error?: string
}

export async function uploadFile(options: UploadOptions): Promise<UploadResult> {
  throw new Error('Supabase storage is deprecated. Implement file upload with a different solution.')
}

export async function uploadAvatar(file: File, userId: string): Promise<string> {
  throw new Error('Supabase storage is deprecated. Implement file upload with a different solution.')
}

export async function uploadDataset(file: File, projectId: string): Promise<string> {
  throw new Error('Supabase storage is deprecated. Implement file upload with a different solution.')
}

export async function deleteFile(path: string): Promise<void> {
  throw new Error('Supabase storage is deprecated. Implement file deletion with a different solution.')
}
