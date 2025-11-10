'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/toast';
import { useAuthStore } from '@/store/auth';
import { 
  Upload, 
  Image as ImageIcon, 
  Globe, 
  Smartphone,
  Facebook,
  Twitter,
  Loader2,
  Check,
  X,
  AlertCircle
} from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

interface BrandingAssets {
  favicon: string | null;
  icon: string | null;
  appleIcon: string | null;
  ogImage: string | null;
  twitterImage: string | null;
}

export default function BrandingSettingsPage() {
  const { user } = useAuthStore();
  const { showSuccess, showError } = useToast();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [assets, setAssets] = useState<BrandingAssets>({
    favicon: null,
    icon: null,
    appleIcon: null,
    ogImage: null,
    twitterImage: null,
  });

  // Check if user is admin
  useEffect(() => {
    if (user) {
      const userIsAdmin = user.role && ['super_admin', 'admin', 'moderator'].includes(user.role);
      if (!userIsAdmin) {
        showError('Không có quyền truy cập', 'Chỉ admin mới có thể truy cập trang này');
        router.push('/dashboard');
      }
    }
  }, [user, router, showError]);

  // Load current assets
  useEffect(() => {
    loadCurrentAssets();
  }, []);

  const loadCurrentAssets = async () => {
    setIsLoading(true);
    try {
      // Check if files exist in public folder
      const checks = await Promise.all([
        fetch('/favicon.ico').then(r => r.ok),
        fetch('/icon.png').then(r => r.ok),
        fetch('/apple-icon.png').then(r => r.ok),
        fetch('/og-image.png').then(r => r.ok),
        fetch('/twitter-image.png').then(r => r.ok),
      ]);

      setAssets({
        favicon: checks[0] ? '/favicon.ico' : null,
        icon: checks[1] ? '/icon.png' : null,
        appleIcon: checks[2] ? '/apple-icon.png' : null,
        ogImage: checks[3] ? '/og-image.png' : null,
        twitterImage: checks[4] ? '/twitter-image.png' : null,
      });
    } catch (error) {
      console.error('Error loading assets:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (file: File, type: keyof BrandingAssets) => {
    if (!file) return;

    // Validate file type
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/x-icon', 'image/vnd.microsoft.icon'];
    if (!validTypes.includes(file.type)) {
      showError('Định dạng không hợp lệ', 'Chỉ chấp nhận file PNG, JPG hoặc ICO');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showError('File quá lớn', 'Kích thước file không được vượt quá 5MB');
      return;
    }

    setIsSaving(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', type);

      const response = await fetch('/api/admin/branding/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();

      // Update local state
      setAssets(prev => ({
        ...prev,
        [type]: data.url,
      }));

      showSuccess('Upload thành công', `${getAssetLabel(type)} đã được cập nhật`);

      // Reload page to see changes
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      console.error('Upload error:', error);
      showError('Upload thất bại', 'Có lỗi xảy ra khi upload file');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (type: keyof BrandingAssets) => {
    if (!confirm(`Bạn có chắc muốn xóa ${getAssetLabel(type)}?`)) {
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch('/api/admin/branding/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ type }),
      });

      if (!response.ok) {
        throw new Error('Delete failed');
      }

      setAssets(prev => ({
        ...prev,
        [type]: null,
      }));

      showSuccess('Xóa thành công', `${getAssetLabel(type)} đã được xóa`);
    } catch (error) {
      console.error('Delete error:', error);
      showError('Xóa thất bại', 'Có lỗi xảy ra khi xóa file');
    } finally {
      setIsSaving(false);
    }
  };

  const getAssetLabel = (type: keyof BrandingAssets): string => {
    const labels = {
      favicon: 'Favicon',
      icon: 'Icon PNG',
      appleIcon: 'Apple Icon',
      ogImage: 'Open Graph Image',
      twitterImage: 'Twitter Card Image',
    };
    return labels[type];
  };

  const getAssetDescription = (type: keyof BrandingAssets): string => {
    const descriptions = {
      favicon: 'Icon hiển thị trên tab trình duyệt (32x32px, .ico)',
      icon: 'Icon PNG cho trình duyệt hiện đại (32x32px, .png)',
      appleIcon: 'Icon cho iOS devices (180x180px, .png)',
      ogImage: 'Hình ảnh khi share trên Facebook, Zalo, LinkedIn (1200x630px, .png/.jpg)',
      twitterImage: 'Hình ảnh khi share trên Twitter (1200x600px, .png/.jpg)',
    };
    return descriptions[type];
  };

  const getAssetIcon = (type: keyof BrandingAssets) => {
    const icons = {
      favicon: Globe,
      icon: ImageIcon,
      appleIcon: Smartphone,
      ogImage: Facebook,
      twitterImage: Twitter,
    };
    const Icon = icons[type];
    return <Icon className="h-5 w-5" />;
  };

  if (user) {
    const userIsAdmin = user.role && ['super_admin', 'admin', 'moderator'].includes(user.role);
    if (!userIsAdmin) {
      return null;
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Quản Lý Branding</h1>
        <p className="text-gray-600 mt-2">
          Cập nhật logo, favicon và hình ảnh social media cho website
        </p>
      </div>

      {/* Instructions Card */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-900">
            <AlertCircle className="h-5 w-5" />
            Hướng Dẫn
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-blue-800 space-y-2">
          <p>• <strong>Favicon</strong>: Icon nhỏ hiển thị trên tab trình duyệt (32x32px)</p>
          <p>• <strong>Icon PNG</strong>: Icon cho trình duyệt hiện đại (32x32px)</p>
          <p>• <strong>Apple Icon</strong>: Icon khi lưu website vào màn hình iOS (180x180px)</p>
          <p>• <strong>Open Graph</strong>: Hình khi share trên Facebook, Zalo, LinkedIn (1200x630px)</p>
          <p>• <strong>Twitter Card</strong>: Hình khi share trên Twitter (1200x600px)</p>
          <p className="mt-4 font-semibold">💡 Sau khi upload, trang sẽ tự động reload để áp dụng thay đổi</p>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      ) : (
        <div className="grid gap-6">
          {/* Favicon */}
          <AssetUploadCard
            type="favicon"
            label={getAssetLabel('favicon')}
            description={getAssetDescription('favicon')}
            icon={getAssetIcon('favicon')}
            currentAsset={assets.favicon}
            onUpload={handleFileUpload}
            onDelete={handleDelete}
            isSaving={isSaving}
            acceptedFormats=".ico"
          />

          {/* Icon PNG */}
          <AssetUploadCard
            type="icon"
            label={getAssetLabel('icon')}
            description={getAssetDescription('icon')}
            icon={getAssetIcon('icon')}
            currentAsset={assets.icon}
            onUpload={handleFileUpload}
            onDelete={handleDelete}
            isSaving={isSaving}
            acceptedFormats=".png"
          />

          {/* Apple Icon */}
          <AssetUploadCard
            type="appleIcon"
            label={getAssetLabel('appleIcon')}
            description={getAssetDescription('appleIcon')}
            icon={getAssetIcon('appleIcon')}
            currentAsset={assets.appleIcon}
            onUpload={handleFileUpload}
            onDelete={handleDelete}
            isSaving={isSaving}
            acceptedFormats=".png"
          />

          {/* Open Graph Image */}
          <AssetUploadCard
            type="ogImage"
            label={getAssetLabel('ogImage')}
            description={getAssetDescription('ogImage')}
            icon={getAssetIcon('ogImage')}
            currentAsset={assets.ogImage}
            onUpload={handleFileUpload}
            onDelete={handleDelete}
            isSaving={isSaving}
            acceptedFormats=".png,.jpg,.jpeg"
            showPreview
          />

          {/* Twitter Image */}
          <AssetUploadCard
            type="twitterImage"
            label={getAssetLabel('twitterImage')}
            description={getAssetDescription('twitterImage')}
            icon={getAssetIcon('twitterImage')}
            currentAsset={assets.twitterImage}
            onUpload={handleFileUpload}
            onDelete={handleDelete}
            isSaving={isSaving}
            acceptedFormats=".png,.jpg,.jpeg"
            showPreview
          />
        </div>
      )}

      {/* Testing Tools */}
      <Card>
        <CardHeader>
          <CardTitle>Công Cụ Kiểm Tra</CardTitle>
          <CardDescription>
            Sử dụng các công cụ này để kiểm tra hình ảnh sau khi upload
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium">Facebook Debugger</p>
              <p className="text-sm text-gray-600">Kiểm tra Open Graph image</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open('https://developers.facebook.com/tools/debug/', '_blank')}
            >
              Mở Tool
            </Button>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium">Twitter Card Validator</p>
              <p className="text-sm text-gray-600">Kiểm tra Twitter card image</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open('https://cards-dev.twitter.com/validator', '_blank')}
            >
              Mở Tool
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

interface AssetUploadCardProps {
  type: keyof BrandingAssets;
  label: string;
  description: string;
  icon: React.ReactNode;
  currentAsset: string | null;
  onUpload: (file: File, type: keyof BrandingAssets) => void;
  onDelete: (type: keyof BrandingAssets) => void;
  isSaving: boolean;
  acceptedFormats: string;
  showPreview?: boolean;
}

function AssetUploadCard({
  type,
  label,
  description,
  icon,
  currentAsset,
  onUpload,
  onDelete,
  isSaving,
  acceptedFormats,
  showPreview = false,
}: AssetUploadCardProps) {
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onUpload(e.dataTransfer.files[0], type);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      onUpload(e.target.files[0], type);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {icon}
          {label}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {currentAsset ? (
          <div className="space-y-4">
            {showPreview && (
              <div className="relative w-full h-48 bg-gray-100 rounded-lg overflow-hidden">
                <Image
                  src={currentAsset}
                  alt={label}
                  fill
                  className="object-contain"
                />
              </div>
            )}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 text-green-600 bg-green-50 px-3 py-2 rounded-lg flex-1">
                <Check className="h-4 w-4" />
                <span className="text-sm font-medium">Đã upload</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDelete(type)}
                disabled={isSaving}
              >
                <X className="h-4 w-4 mr-1" />
                Xóa
              </Button>
            </div>
          </div>
        ) : (
          <div
            className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              type="file"
              id={`file-${type}`}
              className="hidden"
              accept={acceptedFormats}
              onChange={handleChange}
              disabled={isSaving}
            />
            <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-sm text-gray-600 mb-2">
              Kéo thả file vào đây hoặc
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => document.getElementById(`file-${type}`)?.click()}
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Đang upload...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Chọn file
                </>
              )}
            </Button>
            <p className="text-xs text-gray-500 mt-2">
              Định dạng: {acceptedFormats} • Tối đa 5MB
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
