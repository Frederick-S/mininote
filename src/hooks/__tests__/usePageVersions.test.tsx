import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { usePageVersions, useCreatePageVersion, useRestorePageVersion } from '../usePageVersions';
import type { ReactNode } from 'react';

// Mock Supabase
vi.mock('../../lib/supabase', () => ({
  supabase: {
    auth: {
      getUser: vi.fn(),
    },
    from: vi.fn(),
  },
}));

// Mock database utilities
vi.mock('../../lib/database', () => ({
  requireAuth: vi.fn().mockResolvedValue('test-user-id'),
}));

describe('usePageVersions', () => {
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

  it('should fetch page versions successfully', async () => {
    const mockVersions = [
      {
        id: '1',
        page_id: 'page-1',
        title: 'Version 2',
        content: 'Updated content',
        version: 2,
        user_id: 'test-user-id',
        created_at: '2024-01-02',
      },
      {
        id: '2',
        page_id: 'page-1',
        title: 'Version 1',
        content: 'Original content',
        version: 1,
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
              data: mockVersions,
              error: null,
            }),
          }),
        }),
      }),
    });

    (supabase.from as any) = mockFrom;

    const { result } = renderHook(() => usePageVersions('page-1'), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(mockVersions);
    expect(mockFrom).toHaveBeenCalledWith('page_versions');
  });

  it('should not fetch when pageId is undefined', () => {
    const { result } = renderHook(() => usePageVersions(undefined), { wrapper });

    expect(result.current.data).toBeUndefined();
    expect(result.current.isLoading).toBe(false);
  });
});

describe('useCreatePageVersion', () => {
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

  it('should create a page version successfully', async () => {
    const newVersion = {
      id: '1',
      page_id: 'page-1',
      title: 'Version 2',
      content: 'Updated content',
      version: 2,
      user_id: 'test-user-id',
      created_at: '2024-01-02',
    };

    const { supabase } = await import('../../lib/supabase');

    const mockFrom = vi.fn().mockReturnValue({
      insert: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: newVersion,
            error: null,
          }),
        }),
      }),
    });

    (supabase.from as any) = mockFrom;

    const { result } = renderHook(() => useCreatePageVersion(), { wrapper });

    result.current.mutate({
      page_id: 'page-1',
      title: 'Version 2',
      content: 'Updated content',
      version: 2,
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(newVersion);
  });
});

describe('useRestorePageVersion', () => {
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

  it('should restore a page version successfully', async () => {
    const versionToRestore = {
      id: 'version-1',
      page_id: 'page-1',
      title: 'Old Title',
      content: 'Old content',
      version: 1,
      user_id: 'test-user-id',
      created_at: '2024-01-01',
    };

    const currentPage = {
      version: 2,
    };

    const restoredPage = {
      id: 'page-1',
      title: 'Old Title',
      content: 'Old content',
      version: 3,
      notebook_id: 'notebook-1',
      user_id: 'test-user-id',
      created_at: '2024-01-01',
      updated_at: '2024-01-03',
    };

    const { supabase } = await import('../../lib/supabase');

    let callCount = 0;
    const mockFrom = vi.fn().mockImplementation((table: string) => {
      if (table === 'page_versions') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                  data: versionToRestore,
                  error: null,
                }),
              }),
            }),
          }),
        };
      } else if (table === 'pages') {
        callCount++;
        if (callCount === 1) {
          // First call: get current version
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  single: vi.fn().mockResolvedValue({
                    data: currentPage,
                    error: null,
                  }),
                }),
              }),
            }),
          };
        } else {
          // Second call: update page
          return {
            update: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  select: vi.fn().mockReturnValue({
                    single: vi.fn().mockResolvedValue({
                      data: restoredPage,
                      error: null,
                    }),
                  }),
                }),
              }),
            }),
          };
        }
      }
    });

    (supabase.from as any) = mockFrom;

    const { result } = renderHook(() => useRestorePageVersion(), { wrapper });

    result.current.mutate({
      page_id: 'page-1',
      version_id: 'version-1',
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(restoredPage);
  });
});
