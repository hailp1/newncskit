# 📤 File Upload với Supabase Storage

## Tổng Quan

NCSKIT sử dụng Supabase Storage để quản lý file uploads với 3 buckets:
- **avatars** (public) - User avatar images
- **datasets** (private) - Dataset files (CSV, Excel, JSON)
- **exports** (private) - Export files (Excel, PDF)

## 🚀 Quick Start

### 1. Upload Avatar

```tsx
import { AvatarUpload } from '@/components/upload/avatar-upload'

function ProfilePage() {
  const handleUploadSuccess = (url: string) => {
    console.log('Avatar uploaded:', url)
    // Update user profile with new avatar URL
  }

  return (
    <AvatarUpload
      currentAvatarUrl={user?.avatar_url}
      onUploadSuccess={handleUploadSuccess}
      size={128}
    />
  )
}
```

### 2. Upload Dataset

```tsx
import { DatasetUpload } from '@/components/upload/dataset-upload'

function ProjectPage({ projectId }: { projectId: string }) {
  const handleUploadSuccess = (result) => {
    console.log('Dataset uploaded:', result)
    // Save dataset info to database
  }

  return (
    <DatasetUpload
      projectId={projectId}
      onUploadSuccess={handleUploadSuccess}
    />
  )
}
```

### 3. Generic File Upload

```tsx
import { FileUpload } from '@/components/upload/file-upload'
import { uploadExport } from '@/lib/supabase/storage'

function ExportPage() {
  const handleUpload = async (file: File) => {
    const result = await uploadExport(file)
    console.log('Export uploaded:', result)
  }

  return (
    <FileUpload
      onUpload={handleUpload}
      accept=".xlsx,.pdf"
      maxSize={20}
      label="Upload Export"
      description="Drag and drop your export file"
    />
  )
}
```

## 📚 API Reference

### Storage Helpers (`lib/supabase/storage.ts`)

#### `uploadFile(file, options)`

Upload file to Supabase Storage.

**Parameters:**
```typescript
file: File
options: {
  bucket: 'avatars' | 'datasets' | 'exports'
  folder?: string
  fileName?: string
  upsert?: boolean
}
```

**Returns:**
```typescript
{
  path: string        // Relative path in bucket
  fullPath: string    // Full path with user ID
  publicUrl?: string  // Public URL (only for public buckets)
}
```

**Example:**
```typescript
const result = await uploadFile(file, {
  bucket: 'datasets',
  folder: 'project-123',
  fileName: 'data.csv'
})
```

#### `uploadAvatar(file)`

Upload user avatar (replaces existing).

**Example:**
```typescript
const result = await uploadAvatar(avatarFile)
console.log(result.publicUrl) // Public URL for avatar
```

#### `uploadDataset(file, projectId)`

Upload dataset file to project folder.

**Example:**
```typescript
const result = await uploadDataset(file, 'project-123')
```

#### `uploadExport(file)`

Upload export file.

**Example:**
```typescript
const result = await uploadExport(file)
```

#### `downloadFile(bucket, path)`

Download file from storage.

**Example:**
```typescript
const blob = await downloadFile('datasets', 'user-id/project-id/data.csv')
const url = URL.createObjectURL(blob)
```

#### `getSignedUrl(bucket, path, expiresIn)`

Get temporary signed URL for private file.

**Example:**
```typescript
const url = await getSignedUrl('datasets', 'user-id/project-id/data.csv', 3600)
// URL expires in 1 hour
```

#### `deleteFile(bucket, path)`

Delete single file.

**Example:**
```typescript
await deleteFile('avatars', 'user-id/avatar.jpg')
```

#### `deleteFiles(bucket, paths)`

Delete multiple files.

**Example:**
```typescript
await deleteFiles('datasets', [
  'user-id/project-1/data.csv',
  'user-id/project-2/data.csv'
])
```

#### `listFiles(bucket, folder)`

List files in folder.

**Example:**
```typescript
const files = await listFiles('datasets', 'project-123')
files.forEach(file => {
  console.log(file.name, file.size, file.updated_at)
})
```

### React Hook (`hooks/use-file-upload.ts`)

#### `useFileUpload(options)`

Custom hook for managing file uploads.

**Example:**
```typescript
const { upload, isUploading, progress, error, result } = useFileUpload({
  bucket: 'datasets',
  folder: 'project-123',
  onSuccess: (result) => {
    console.log('Upload complete:', result)
  },
  onError: (error) => {
    console.error('Upload failed:', error)
  }
})

// Upload file
await upload(file)
```

## 🎨 Components

### `<FileUpload />`

Generic file upload component with drag & drop.

**Props:**
```typescript
{
  onUpload: (file: File) => Promise<void>
  accept?: string           // File types (e.g., ".csv,.xlsx")
  maxSize?: number          // Max size in MB
  label?: string
  description?: string
  className?: string
}
```

**Features:**
- ✅ Drag and drop support
- ✅ File type validation
- ✅ File size validation
- ✅ Upload progress
- ✅ Error handling
- ✅ Success feedback

### `<AvatarUpload />`

Specialized avatar upload component.

**Props:**
```typescript
{
  currentAvatarUrl?: string
  onUploadSuccess?: (url: string) => void
  size?: number             // Avatar size in pixels
}
```

**Features:**
- ✅ Image preview
- ✅ Circular crop
- ✅ Replace existing avatar
- ✅ Remove avatar
- ✅ Max 2MB size limit

### `<DatasetUpload />`

Specialized dataset upload component.

**Props:**
```typescript
{
  projectId: string
  onUploadSuccess?: (result: UploadResult) => void
  className?: string
}
```

**Features:**
- ✅ Accepts CSV, Excel, JSON
- ✅ Max 50MB size limit
- ✅ Auto-organizes by project

## 🔒 Security

### Storage Policies

All buckets have Row Level Security (RLS) policies:

**Avatars (public):**
- ✅ Anyone can read
- ✅ Users can upload/update/delete own avatar

**Datasets (private):**
- ✅ Users can only access own files
- ✅ Files organized by user ID and project ID

**Exports (private):**
- ✅ Users can only access own exports
- ✅ Files organized by user ID

### File Path Structure

```
avatars/
  └── {user_id}/
      └── avatar.jpg

datasets/
  └── {user_id}/
      └── {project_id}/
          ├── dataset-1.csv
          └── dataset-2.xlsx

exports/
  └── {user_id}/
      ├── export-2024-01-01.xlsx
      └── export-2024-01-02.pdf
```

### Access Control

- User ID is automatically added to file paths
- RLS policies verify user owns the files
- Signed URLs for temporary access to private files
- Public URLs only for avatars bucket

## 📝 Usage Examples

### Example 1: Upload and Save Dataset

```typescript
import { uploadDataset } from '@/lib/supabase/storage'
import { createClient } from '@/lib/supabase/client'

async function handleDatasetUpload(file: File, projectId: string) {
  // 1. Upload file to storage
  const { path, fullPath } = await uploadDataset(file, projectId)
  
  // 2. Save dataset info to database
  const supabase = createClient()
  const { data, error } = await supabase
    .from('datasets')
    .insert({
      project_id: projectId,
      name: file.name,
      file_url: fullPath,
      file_size: file.size,
    })
  
  if (error) throw error
  
  return data
}
```

### Example 2: Download Dataset

```typescript
import { downloadFile, getSignedUrl } from '@/lib/supabase/storage'

async function handleDownload(filePath: string) {
  // Option 1: Download as blob
  const blob = await downloadFile('datasets', filePath)
  const url = URL.createObjectURL(blob)
  
  // Create download link
  const a = document.createElement('a')
  a.href = url
  a.download = filePath.split('/').pop() || 'download'
  a.click()
  
  // Option 2: Get signed URL
  const signedUrl = await getSignedUrl('datasets', filePath)
  window.open(signedUrl, '_blank')
}
```

### Example 3: Delete Old Files

```typescript
import { deleteFiles, listFiles } from '@/lib/supabase/storage'

async function cleanupOldExports() {
  // List all exports
  const files = await listFiles('exports')
  
  // Filter files older than 30 days
  const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000)
  const oldFiles = files.filter(file => {
    const fileDate = new Date(file.updated_at).getTime()
    return fileDate < thirtyDaysAgo
  })
  
  // Delete old files
  if (oldFiles.length > 0) {
    const paths = oldFiles.map(f => f.name)
    await deleteFiles('exports', paths)
  }
}
```

### Example 4: Update Avatar

```typescript
import { uploadAvatar } from '@/lib/supabase/storage'
import { createClient } from '@/lib/supabase/client'

async function updateUserAvatar(file: File) {
  // 1. Upload new avatar
  const { publicUrl } = await uploadAvatar(file)
  
  // 2. Update profile in database
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (user) {
    await supabase
      .from('profiles')
      .update({ avatar_url: publicUrl })
      .eq('id', user.id)
  }
  
  return publicUrl
}
```

## 🐛 Troubleshooting

### Upload fails with "User not authenticated"

**Solution:** Ensure user is logged in before uploading.

```typescript
const { data: { user } } = await supabase.auth.getUser()
if (!user) {
  throw new Error('Please login to upload files')
}
```

### Upload fails with "permission denied"

**Solution:** Check storage policies in Supabase Dashboard.

1. Go to Storage > [bucket] > Policies
2. Verify policies allow INSERT for authenticated users
3. Check file path matches policy pattern

### File not found when downloading

**Solution:** Verify file path is correct.

```typescript
// List files to see actual paths
const files = await listFiles('datasets', 'project-id')
console.log(files)
```

### Public URL returns 404

**Solution:** Only avatars bucket is public.

```typescript
// For private buckets, use signed URLs
const signedUrl = await getSignedUrl('datasets', path)
```

## 🎯 Best Practices

1. **Always validate files client-side** before uploading
2. **Use appropriate file size limits** for each bucket
3. **Clean up old files** periodically to save storage
4. **Use signed URLs** for temporary access to private files
5. **Store file metadata** in database for easy querying
6. **Handle upload errors** gracefully with user feedback
7. **Show upload progress** for better UX
8. **Compress images** before uploading avatars

## 📊 Storage Limits

Supabase Free Tier:
- **Storage:** 1GB
- **Bandwidth:** 2GB/month
- **File size:** 50MB max

Pro Tier:
- **Storage:** 100GB
- **Bandwidth:** 200GB/month
- **File size:** 5GB max

## 🔗 Resources

- [Supabase Storage Docs](https://supabase.com/docs/guides/storage)
- [Storage Policies](https://supabase.com/docs/guides/storage/security/access-control)
- [File Upload Best Practices](https://supabase.com/docs/guides/storage/uploads)
