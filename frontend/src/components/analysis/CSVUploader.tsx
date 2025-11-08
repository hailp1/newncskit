'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, File, X, AlertCircle, CheckCircle } from 'lucide-react';

interface CSVUploaderProps {
  onUploadComplete: (projectId: string, preview: any[]) => void;
  onError: (error: Error) => void;
}

export default function CSVUploader({ onUploadComplete, onError }: CSVUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  const validateFile = (file: File): string | null => {
    // Check file type
    const validTypes = ['text/csv', 'application/vnd.ms-excel', 'text/plain'];
    const validExtensions = ['.csv'];
    const fileExtension = file.name.toLowerCase().slice(file.name.lastIndexOf('.'));
    
    if (!validTypes.includes(file.type) && !validExtensions.includes(fileExtension)) {
      return 'Chỉ chấp nhận file CSV. Vui lòng chọn file có định dạng .csv';
    }

    // Check file size (50MB limit)
    const maxSize = 50 * 1024 * 1024; // 50MB in bytes
    if (file.size > maxSize) {
      return `File quá lớn. Kích thước tối đa là 50MB. File của bạn: ${(file.size / 1024 / 1024).toFixed(2)}MB`;
    }

    // Check file size minimum (should have some content)
    if (file.size < 100) {
      return 'File quá nhỏ hoặc rỗng. Vui lòng chọn file CSV có dữ liệu';
    }

    return null;
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setError(null);
    
    if (acceptedFiles.length === 0) {
      setError('Không thể đọc file. Vui lòng thử lại');
      return;
    }

    const file = acceptedFiles[0];
    const validationError = validateFile(file);
    
    if (validationError) {
      setError(validationError);
      return;
    }

    setSelectedFile(file);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.csv'],
      'text/plain': ['.csv']
    },
    multiple: false,
    maxSize: 50 * 1024 * 1024 // 50MB
  });

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    setProgress(0);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('name', selectedFile.name.replace('.csv', ''));

      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const response = await fetch('/api/analysis/upload', {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Upload failed');
      }

      const data = await response.json();
      setProgress(100);

      // Wait a bit to show 100% before completing
      setTimeout(() => {
        onUploadComplete(data.project.id, data.preview);
      }, 500);

    } catch (err) {
      const error = err as Error;
      setError(error.message);
      onError(error);
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setError(null);
    setProgress(0);
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">
          Upload CSV File
        </h2>
        <p className="text-gray-600 mb-6">
          Upload your survey data in CSV format to begin analysis
        </p>

        {!selectedFile ? (
          <div
            {...getRootProps()}
            className={`
              border-2 border-dashed rounded-lg p-12 text-center cursor-pointer
              transition-colors duration-200
              ${isDragActive 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-300 hover:border-gray-400 bg-gray-50'
              }
            `}
          >
            <input {...getInputProps()} />
            <Upload className={`
              w-16 h-16 mx-auto mb-4
              ${isDragActive ? 'text-blue-500' : 'text-gray-400'}
            `} />
            
            {isDragActive ? (
              <p className="text-lg text-blue-600 font-medium">
                Drop the file here...
              </p>
            ) : (
              <>
                <p className="text-lg text-gray-700 font-medium mb-2">
                  Drag & drop your CSV file here
                </p>
                <p className="text-sm text-gray-500 mb-4">
                  or click to browse
                </p>
                <p className="text-xs text-gray-400">
                  Maximum file size: 50MB
                </p>
              </>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {/* Selected File Info */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-center space-x-3">
                <File className="w-8 h-8 text-blue-500" />
                <div>
                  <p className="font-medium text-gray-900">{selectedFile.name}</p>
                  <p className="text-sm text-gray-500">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
              {!uploading && (
                <button
                  onClick={handleRemoveFile}
                  className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                  title="Remove file"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              )}
            </div>

            {/* Upload Progress */}
            {uploading && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Uploading...</span>
                  <span>{progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Upload Button */}
            {!uploading && (
              <button
                onClick={handleUpload}
                className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Upload and Continue
              </button>
            )}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-800">Upload Error</p>
              <p className="text-sm text-red-600 mt-1">{error}</p>
            </div>
          </div>
        )}

        {/* Success Message */}
        {progress === 100 && !error && (
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start space-x-3">
            <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-green-800">Upload Successful</p>
              <p className="text-sm text-green-600 mt-1">
                Your file has been uploaded successfully. Proceeding to data health check...
              </p>
            </div>
          </div>
        )}

        {/* File Requirements */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="text-sm font-medium text-blue-900 mb-2">File Requirements:</h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Format: CSV (Comma-separated values)</li>
            <li>• Maximum size: 50MB</li>
            <li>• First row should contain column headers</li>
            <li>• Use UTF-8 encoding for Vietnamese characters</li>
            <li>• Numeric values should use decimal point (not comma)</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
