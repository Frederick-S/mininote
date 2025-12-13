import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { FileUploader } from '../FileUploader';
import { fileUploadService } from '@/lib/fileUploadService';

// Mock the file upload service
vi.mock('@/lib/fileUploadService', () => ({
  fileUploadService: {
    validateFile: vi.fn(),
    uploadFile: vi.fn(),
    formatFileSize: vi.fn((size: number) => `${size} bytes`),
    isImage: vi.fn((type: string) => type.startsWith('image/')),
    isVideo: vi.fn((type: string) => type.startsWith('video/')),
    isDocument: vi.fn((type: string) => type.startsWith('application/')),
  },
}));

describe('FileUploader', () => {
  const mockPageId = 'test-page-id';
  const mockUserId = 'test-user-id';
  const mockOnUploadComplete = vi.fn();
  const mockOnUploadError = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render the drop zone', () => {
    render(
      <FileUploader
        pageId={mockPageId}
        userId={mockUserId}
        onUploadComplete={mockOnUploadComplete}
        onUploadError={mockOnUploadError}
      />
    );

    expect(screen.getByText(/drag and drop files here/i)).toBeInTheDocument();
    expect(screen.getByText(/supports images, videos, and documents/i)).toBeInTheDocument();
  });

  it('should validate files before upload', async () => {
    const mockFile = new File(['test'], 'test.pdf', { type: 'application/pdf' });
    
    (fileUploadService.validateFile as any).mockReturnValue({
      valid: true,
    });

    (fileUploadService.uploadFile as any).mockResolvedValue({
      url: 'https://example.com/test.pdf',
      attachmentId: 'attachment-1',
      filename: 'test.pdf',
      fileType: 'application/pdf',
      fileSize: 1024,
    });

    render(
      <FileUploader
        pageId={mockPageId}
        userId={mockUserId}
        onUploadComplete={mockOnUploadComplete}
        onUploadError={mockOnUploadError}
      />
    );

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    
    // Simulate file selection
    Object.defineProperty(input, 'files', {
      value: [mockFile],
      writable: false,
    });

    fireEvent.change(input);

    await waitFor(() => {
      expect(fileUploadService.validateFile).toHaveBeenCalledWith(mockFile);
    });
  });

  it('should show error for invalid files', async () => {
    const mockFile = new File(['test'], 'test.exe', { type: 'application/x-msdownload' });
    
    (fileUploadService.validateFile as any).mockReturnValue({
      valid: false,
      error: {
        type: 'type',
        message: 'File type not supported',
      },
    });

    render(
      <FileUploader
        pageId={mockPageId}
        userId={mockUserId}
        onUploadComplete={mockOnUploadComplete}
        onUploadError={mockOnUploadError}
      />
    );

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    
    Object.defineProperty(input, 'files', {
      value: [mockFile],
      writable: false,
    });

    fireEvent.change(input);

    await waitFor(() => {
      expect(screen.getByText(/file type not supported/i)).toBeInTheDocument();
    });
  });

  it('should enforce max files limit', async () => {
    const files = Array.from({ length: 15 }, (_, i) => 
      new File(['test'], `test${i}.pdf`, { type: 'application/pdf' })
    );

    render(
      <FileUploader
        pageId={mockPageId}
        userId={mockUserId}
        onUploadComplete={mockOnUploadComplete}
        onUploadError={mockOnUploadError}
        maxFiles={10}
      />
    );

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    
    Object.defineProperty(input, 'files', {
      value: files,
      writable: false,
    });

    fireEvent.change(input);

    await waitFor(() => {
      expect(mockOnUploadError).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('Maximum 10 files allowed'),
        })
      );
    });
  });

  it('should upload valid files successfully', async () => {
    const mockFile = new File(['test'], 'test.pdf', { type: 'application/pdf' });
    const mockResult = {
      url: 'https://example.com/test.pdf',
      attachmentId: 'attachment-1',
      filename: 'test.pdf',
      fileType: 'application/pdf',
      fileSize: 1024,
    };

    (fileUploadService.validateFile as any).mockReturnValue({ valid: true });
    (fileUploadService.uploadFile as any).mockResolvedValue(mockResult);

    render(
      <FileUploader
        pageId={mockPageId}
        userId={mockUserId}
        onUploadComplete={mockOnUploadComplete}
        onUploadError={mockOnUploadError}
      />
    );

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    
    Object.defineProperty(input, 'files', {
      value: [mockFile],
      writable: false,
    });

    fireEvent.change(input);

    await waitFor(() => {
      expect(mockOnUploadComplete).toHaveBeenCalledWith([mockResult]);
    });
  });

  it('should show progress during upload', async () => {
    const mockFile = new File(['test'], 'test.pdf', { type: 'application/pdf' });

    (fileUploadService.validateFile as any).mockReturnValue({ valid: true });
    (fileUploadService.uploadFile as any).mockImplementation(({ onProgress }) => {
      // Simulate progress
      onProgress?.(50);
      return new Promise((resolve) => {
        setTimeout(() => {
          onProgress?.(100);
          resolve({
            url: 'https://example.com/test.pdf',
            attachmentId: 'attachment-1',
            filename: 'test.pdf',
            fileType: 'application/pdf',
            fileSize: 1024,
          });
        }, 100);
      });
    });

    render(
      <FileUploader
        pageId={mockPageId}
        userId={mockUserId}
        onUploadComplete={mockOnUploadComplete}
        onUploadError={mockOnUploadError}
      />
    );

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    
    Object.defineProperty(input, 'files', {
      value: [mockFile],
      writable: false,
    });

    fireEvent.change(input);

    // Wait for file to appear in the list
    await waitFor(() => {
      expect(screen.getByText('test.pdf')).toBeInTheDocument();
    });
  });
});
