import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { usePages, useCreatePage, usePagesHierarchy } from '../usePages';
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

describe('usePages', () => {
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

  it('should fetch pages successfully', async () => {
    const mockPages = [
      {
        id: '1',
        title: 'Test Page',
        content: 'Test Content',
        version: 1,
        notebook_id: 'notebook-1',
        user_id: 'test-user-id',
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
      },
    ];

    const { supabase } = await import('../../lib/supabase');

    const mockFrom = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({
              data: mockPages,
              error: null,
            }),
          }),
        }),
      }),
    });

    (supabase.from as any) = mockFrom;

    const { result } = renderHook(() => usePages('notebook-1'), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(mockPages);
    expect(mockFrom).toHaveBeenCalledWith('pages');
  });

  it('should not fetch when notebookId is undefined', () => {
    const { result } = renderHook(() => usePages(undefined), { wrapper });

    expect(result.current.data).toBeUndefined();
    expect(result.current.isLoading).toBe(false);
  });
});

describe('usePagesHierarchy', () => {
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

  it('should build hierarchical structure from flat pages', async () => {
    const mockPages = [
      {
        id: '1',
        title: 'Parent Page',
        content: 'Parent Content',
        version: 1,
        notebook_id: 'notebook-1',
        user_id: 'test-user-id',
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
      },
      {
        id: '2',
        title: 'Child Page',
        content: 'Child Content',
        version: 1,
        parent_page_id: '1',
        notebook_id: 'notebook-1',
        user_id: 'test-user-id',
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
      },
    ];

    const { supabase } = await import('../../lib/supabase');

    const mockFrom = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({
              data: mockPages,
              error: null,
            }),
          }),
        }),
      }),
    });

    (supabase.from as any) = mockFrom;

    const { result } = renderHook(() => usePagesHierarchy('notebook-1'), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toHaveLength(1);
    expect(result.current.data?.[0].id).toBe('1');
    expect(result.current.data?.[0].children).toHaveLength(1);
    expect(result.current.data?.[0].children?.[0].id).toBe('2');
    expect(result.current.flatPages).toEqual(mockPages);
  });
});

describe('useCreatePage', () => {
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

  it('should create a page successfully', async () => {
    const newPage = {
      id: '1',
      title: 'New Page',
      content: 'New Content',
      version: 1,
      notebook_id: 'notebook-1',
      user_id: 'test-user-id',
      created_at: '2024-01-01',
      updated_at: '2024-01-01',
    };

    const { supabase } = await import('../../lib/supabase');

    const mockFrom = vi.fn().mockReturnValue({
      insert: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: newPage,
            error: null,
          }),
        }),
      }),
    });

    (supabase.from as any) = mockFrom;

    const { result } = renderHook(() => useCreatePage(), { wrapper });

    result.current.mutate({
      title: 'New Page',
      content: 'New Content',
      notebook_id: 'notebook-1',
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(newPage);
  });
});
