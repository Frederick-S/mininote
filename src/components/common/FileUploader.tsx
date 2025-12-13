/**
 * FileUploader Component
 * Provides drag-and-drop file upload with validation, progress tracking, and preview
 */

import React, { useRef, useState, useCallback } from 'react';
import { Upload, X, File, Image, Video, FileText, AlertCircle, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { fileUploadService, type UploadResult } from '@/lib/fileUploadService';

export interface FileUploadItem {
  file: File;
  id: string;
  progress: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  result?: UploadResult;
  error?: string;
}

export interface FileUploaderProps {
  pageId: string;
  userId: string;
  onUploadComplete?: (results: UploadResult[]) => void;
  onUploadError?: (error: Error) => void;
  maxFiles?: number;
  className?: string;
}

export const FileUploader: React.FC<FileUploaderProps> = ({
  pageId,
  userId,
  onUploadComplete,
  onUploadError,
  maxFiles = 10,
  className
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadItems, setUploadItems] = useState<FileUploadItem[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Handle drag events
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  }, [pageId, userId]);

  // Handle file selection
  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    handleFiles(files);
    // Reset input value to allow selecting the same file again
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  }, [pageId, userId]);

  // Process selected files
  const handleFiles = useCallback((files: File[]) => {
    if (files.length === 0) return;

    // Check max files limit
    if (uploadItems.length + files.length > maxFiles) {
      onUploadError?.(new Error(`Maximum ${maxFiles} files allowed`));
      return;
    }

    // Validate and create upload items
    const newItems: FileUploadItem[] = files.map(file => {
      const validation = fileUploadService.validateFile(file);
      return {
        file,
        id: `${Date.now()}-${Math.random()}`,
        progress: 0,
        status: validation.valid ? 'pending' : 'error',
        error: validation.error?.message
      };
    });

    setUploadItems(prev => [...prev, ...newItems]);

    // Start upload for valid files
    const validItems = newItems.filter(item => item.status === 'pending');
    if (validItems.length > 0) {
      uploadFiles(validItems);
    }
  }, [uploadItems, maxFiles, pageId, userId]);

  // Upload files
  const uploadFiles = async (items: FileUploadItem[]) => {
    setIsUploading(true);
    const results: UploadResult[] = [];

    for (const item of items) {
      try {
        // Update status to uploading
        setUploadItems(prev =>
          prev.map(i => (i.id === item.id ? { ...i, status: 'uploading' as const } : i))
        );

        // Upload file
        const result = await fileUploadService.uploadFile({
          file: item.file,
          pageId,
          userId,
          onProgress: (progress) => {
            setUploadItems(prev =>
              prev.map(i => (i.id === item.id ? { ...i, progress } : i))
            );
          }
        });

        // Update status to success
        setUploadItems(prev =>
          prev.map(i =>
            i.id === item.id
              ? { ...i, status: 'success' as const, result, progress: 100 }
              : i
          )
        );

        results.push(result);
      } catch (error) {
        // Update status to error
        setUploadItems(prev =>
          prev.map(i =>
            i.id === item.id
              ? {
                  ...i,
                  status: 'error' as const,
                  error: error instanceof Error ? error.message : 'Upload failed'
                }
              : i
          )
        );

        onUploadError?.(error instanceof Error ? error : new Error('Upload failed'));
      }
    }

    setIsUploading(false);

    if (results.length > 0) {
      onUploadComplete?.(results);
    }
  };

  // Remove upload item
  const removeItem = useCallback((id: string) => {
    setUploadItems(prev => prev.filter(item => item.id !== id));
  }, []);

  // Clear all items
  const clearAll = useCallback(() => {
    setUploadItems([]);
  }, []);

  // Get file icon
  const getFileIcon = (fileType: string) => {
    if (fileUploadService.isImage(fileType)) {
      return <Image className="h-5 w-5" />;
    } else if (fileUploadService.isVideo(fileType)) {
      return <Video className="h-5 w-5" />;
    } else if (fileUploadService.isDocument(fileType)) {
      return <FileText className="h-5 w-5" />;
    }
    return <File className="h-5 w-5" />;
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Drop zone */}
      <div
        className={cn(
          'border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors',
          isDragging
            ? 'border-primary bg-primary/10'
            : 'border-gray-300 hover:border-gray-400',
          isUploading && 'opacity-50 pointer-events-none'
        )}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="image/*,video/*,.pdf,.doc,.docx,.txt,.csv,.xlsx"
          className="hidden"
          onChange={handleFileSelect}
          disabled={isUploading}
        />
        <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <p className="text-sm text-gray-600 mb-2">
          {isDragging
            ? 'Drop files here'
            : 'Drag and drop files here, or click to browse'}
        </p>
        <p className="text-xs text-gray-500">
          Supports images, videos, and documents (max 50MB per file)
        </p>
      </div>

      {/* Upload items list */}
      {uploadItems.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium">
              Files ({uploadItems.length}/{maxFiles})
            </h3>
            {!isUploading && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAll}
                className="h-8 text-xs"
              >
                Clear All
              </Button>
            )}
          </div>

          <div className="space-y-2 max-h-96 overflow-y-auto">
            {uploadItems.map(item => (
              <div
                key={item.id}
                className="flex items-start gap-3 p-3 border rounded-lg bg-white"
              >
                {/* File icon */}
                <div className="flex-shrink-0 mt-0.5">
                  {getFileIcon(item.file.type)}
                </div>

                {/* File info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {item.file.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {fileUploadService.formatFileSize(item.file.size)}
                      </p>
                    </div>

                    {/* Status icon */}
                    <div className="flex-shrink-0">
                      {item.status === 'success' && (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      )}
                      {item.status === 'error' && (
                        <AlertCircle className="h-5 w-5 text-red-500" />
                      )}
                      {item.status !== 'success' && item.status !== 'error' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeItem(item.id)}
                          disabled={item.status === 'uploading'}
                          className="h-6 w-6 p-0"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Progress bar */}
                  {item.status === 'uploading' && (
                    <Progress value={item.progress} className="mt-2 h-1" />
                  )}

                  {/* Error message */}
                  {item.status === 'error' && item.error && (
                    <Alert variant="destructive" className="mt-2">
                      <AlertDescription className="text-xs">
                        {item.error}
                      </AlertDescription>
                    </Alert>
                  )}

                  {/* Preview for images */}
                  {item.status === 'success' &&
                    item.result &&
                    fileUploadService.isImage(item.file.type) && (
                      <div className="mt-2">
                        <img
                          src={item.result.url}
                          alt={item.file.name}
                          className="max-w-full h-auto max-h-32 rounded border"
                        />
                      </div>
                    )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
