/**
 * File Upload Service
 * Handles file uploads to Supabase Storage with validation, progress tracking, and URL generation
 */

import { supabase } from './supabase';
import type { AttachmentData } from './supabase';

export interface UploadOptions {
  file: File;
  pageId: string;
  userId: string;
  onProgress?: (progress: number) => void;
}

export interface UploadResult {
  url: string;
  attachmentId: string;
  filename: string;
  fileType: string;
  fileSize: number;
}

export interface FileValidationError {
  type: 'size' | 'type';
  message: string;
}

class FileUploadService {
  private readonly MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
  private readonly ALLOWED_TYPES = {
    images: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'],
    videos: ['video/mp4', 'video/webm', 'video/ogg'],
    documents: [
      'application/pdf',
      'text/plain',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/csv'
    ]
  };

  /**
   * Upload a file to Supabase Storage
   */
  async uploadFile(options: UploadOptions): Promise<UploadResult> {
    const { file, pageId, userId, onProgress } = options;

    // Validate file
    const validation = this.validateFile(file);
    if (!validation.valid) {
      throw new Error(validation.error?.message || 'File validation failed');
    }

    // Determine file category
    const category = this.getFileCategory(file.type);

    // Generate storage path
    const timestamp = Date.now();
    const sanitizedName = this.sanitizeFilename(file.name);
    const storagePath = `${userId}/${pageId}/${category}/${timestamp}-${sanitizedName}`;

    try {
      // Upload to Supabase Storage
      const { error } = await supabase.storage
        .from('user-files')
        .upload(storagePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        throw new Error(`Upload failed: ${error.message}`);
      }

      // Simulate progress for better UX (Supabase client doesn't support progress callbacks yet)
      if (onProgress) {
        onProgress(100);
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('user-files')
        .getPublicUrl(storagePath);

      // Create attachment record
      const { data: attachment, error: dbError } = await supabase
        .from('attachments')
        .insert({
          filename: file.name,
          file_type: file.type,
          file_size: file.size,
          storage_path: storagePath,
          page_id: pageId,
          user_id: userId
        } as any)
        .select()
        .single<AttachmentData>();

      if (dbError) {
        // Clean up uploaded file if database insert fails
        await supabase.storage.from('user-files').remove([storagePath]);
        throw new Error(`Failed to create attachment record: ${dbError.message}`);
      }

      if (!attachment) {
        throw new Error('Failed to create attachment record: No data returned');
      }

      return {
        url: urlData.publicUrl,
        attachmentId: attachment.id,
        filename: file.name,
        fileType: file.type,
        fileSize: file.size
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Upload multiple files
   */
  async uploadFiles(
    files: File[],
    pageId: string,
    userId: string,
    onProgress?: (fileIndex: number, progress: number) => void
  ): Promise<UploadResult[]> {
    const results: UploadResult[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        const result = await this.uploadFile({
          file,
          pageId,
          userId,
          onProgress: (progress) => onProgress?.(i, progress)
        });
        results.push(result);
      } catch (error) {
        console.error(`Failed to upload ${file.name}:`, error);
        // Continue with other files even if one fails
      }
    }

    return results;
  }

  /**
   * Delete an attachment and its file from storage
   */
  async deleteAttachment(attachmentId: string): Promise<void> {
    // Get attachment details
    const { data: attachment, error: fetchError } = await supabase
      .from('attachments')
      .select('storage_path')
      .eq('id', attachmentId)
      .single<Pick<AttachmentData, 'storage_path'>>();

    if (fetchError || !attachment) {
      throw new Error('Attachment not found');
    }

    // Delete from storage
    const { error: storageError } = await supabase.storage
      .from('user-files')
      .remove([attachment.storage_path]);

    if (storageError) {
      console.error('Failed to delete file from storage:', storageError);
    }

    // Delete database record
    const { error: dbError } = await supabase
      .from('attachments')
      .delete()
      .eq('id', attachmentId);

    if (dbError) {
      throw new Error(`Failed to delete attachment record: ${dbError.message}`);
    }
  }

  /**
   * Clean up orphaned files for a page
   * Removes attachments that are no longer referenced in the page content
   */
  async cleanupOrphanedFiles(pageId: string): Promise<void> {
    // Get page content
    const { data: page, error: pageError } = await supabase
      .from('pages')
      .select('content')
      .eq('id', pageId)
      .single<{ content: string }>();

    if (pageError || !page) {
      throw new Error('Page not found');
    }

    // Get all attachments for page
    const { data: attachments, error: attachmentsError } = await supabase
      .from('attachments')
      .select('*')
      .eq('page_id', pageId)
      .returns<AttachmentData[]>();

    if (attachmentsError) {
      throw new Error(`Failed to fetch attachments: ${attachmentsError.message}`);
    }

    if (!attachments || attachments.length === 0) {
      return;
    }

    // Find attachments not referenced in content
    const orphaned = attachments.filter(att => 
      !page.content.includes(att.storage_path) &&
      !page.content.includes(att.filename)
    );

    // Delete orphaned attachments
    for (const attachment of orphaned) {
      try {
        await this.deleteAttachment(attachment.id);
      } catch (error) {
        console.error(`Failed to delete orphaned attachment ${attachment.id}:`, error);
      }
    }
  }

  /**
   * Validate file size and type
   */
  validateFile(file: File): { valid: boolean; error?: FileValidationError } {
    // Check file size
    if (file.size > this.MAX_FILE_SIZE) {
      return {
        valid: false,
        error: {
          type: 'size',
          message: `File size exceeds ${this.MAX_FILE_SIZE / 1024 / 1024}MB limit`
        }
      };
    }

    // Check file type
    const allAllowedTypes = [
      ...this.ALLOWED_TYPES.images,
      ...this.ALLOWED_TYPES.videos,
      ...this.ALLOWED_TYPES.documents
    ];

    if (!allAllowedTypes.includes(file.type)) {
      return {
        valid: false,
        error: {
          type: 'type',
          message: `File type ${file.type} is not supported. Allowed types: images, videos, and documents.`
        }
      };
    }

    return { valid: true };
  }

  /**
   * Get file category based on MIME type
   */
  private getFileCategory(mimeType: string): 'images' | 'videos' | 'documents' {
    if (this.ALLOWED_TYPES.images.includes(mimeType)) return 'images';
    if (this.ALLOWED_TYPES.videos.includes(mimeType)) return 'videos';
    return 'documents';
  }

  /**
   * Sanitize filename for storage
   */
  private sanitizeFilename(filename: string): string {
    return filename.replace(/[^a-zA-Z0-9.-]/g, '_');
  }

  /**
   * Generate markdown syntax for uploaded file
   */
  generateMarkdown(result: UploadResult): string {
    const { url, filename, fileType } = result;

    if (fileType.startsWith('image/')) {
      return `![${filename}](${url})`;
    } else if (fileType.startsWith('video/')) {
      return `[${filename}](${url})`;
    } else {
      return `[${filename}](${url})`;
    }
  }

  /**
   * Check if file type is an image
   */
  isImage(fileType: string): boolean {
    return this.ALLOWED_TYPES.images.includes(fileType);
  }

  /**
   * Check if file type is a video
   */
  isVideo(fileType: string): boolean {
    return this.ALLOWED_TYPES.videos.includes(fileType);
  }

  /**
   * Check if file type is a document
   */
  isDocument(fileType: string): boolean {
    return this.ALLOWED_TYPES.documents.includes(fileType);
  }

  /**
   * Get file preview URL (for images)
   */
  getPreviewUrl(url: string, fileType: string): string | null {
    if (this.isImage(fileType)) {
      return url;
    }
    return null;
  }

  /**
   * Format file size for display
   */
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  }
}

export const fileUploadService = new FileUploadService();
