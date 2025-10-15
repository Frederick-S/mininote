import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAttachments, useUploadAttachment } from '../useAttachments';
import type { ReactNode } from 'react';

// Mock Supabase
vi.mock('../../lib/supabase', () => ({
  supabase: {
    auth: {
      getUser: vi.fn(),
    },
    from: vi.fn(),
    storage: {
      from: vi.fn(),
    },
  },
}));

// Mock database utilities
vi.mock('../../lib/database', () => ({
  requireAuth: vi.fn().mockResolvedValue('test-user-id'),
}));

describe('useAttachments', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });

    vi.clearAllMocks();
  });

  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );

  it('should fetch attachments successfully', async () => {
    const mockAttachments = [
      {
        id: '1',
        filename: 'test.pdf',
        file_type: 'application/pdf',
        file_size: 1024,
        storage_path: 'user/page/test.pdf',
        page_id: 'page-1',
        user_id: 'test-user-id',
        created_at: '2024-01-01',
      },
    ];

    const { supabase } = await import('../../lib/supabase');

    const mockFrom = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({
              data: mockAttachments,
              error: null,
            }),
          }),
        }),
      }),
    });

    (supabase.from as any) = mockFrom;

    const { result } = renderHook(() => useAttachments('page-1'), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(mockAttachments);
    expect(mockFrom).toHaveBeenCalledWith('attachments');
  });

  it('should not fetch when pageId is undefined', () => {
    const { result } = renderHook(() => useAttachments(undefined), { wrapper });

    expect(result.current.data).toBeUndefined();
    expect(result.current.isLoading).toBe(false);
  });
});

describe('useUploadAttachment', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });

    vi.clearAllMocks();
  });

  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );

  it('should upload attachment successfully', async () => {
    const mockFile = new File(['test content'], 'test.pdf', { type: 'application/pdf' });
    const newAttachment = {
      id: '1',
      filename: 'test.pdf',
      file_type: 'application/pdf',
      file_size: mockFile.size,
      storage_path: 'user/page/test.pdf',
      page_id: 'page-1',
      user_id: 'test-user-id',
      created_at: '2024-01-01',
    };

    const { supabase } = await import('../../lib/supabase');

    const mockStorageFrom = vi.fn().mockReturnValue({
      upload: vi.fn().mockResolvedValue({
        data: { path: 'user/page/test.pdf' },
        error: null,
      }),
    });

    const mockFrom = vi.fn().mockReturnValue({
      insert: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: newAttachment,
            error: null,
          }),
        }),
      }),
    });

    (supabase.storage.from as any) = mockStorageFrom;
    (supabase.from as any) = mockFrom;

    const { result } = renderHook(() => useUploadAttachment(), { wrapper });

    result.current.mutate({
      file: mockFile,
      page_id: 'page-1',
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(newAttachment);
    expect(mockStorageFrom).toHaveBeenCalledWith('user-files');
  });
});
