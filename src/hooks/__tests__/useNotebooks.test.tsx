import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useNotebooks, useCreateNotebook } from '../useNotebooks';
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

describe('useNotebooks', () => {
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

  it('should fetch notebooks successfully', async () => {
    const mockNotebooks = [
      {
        id: '1',
        title: 'Test Notebook',
        description: 'Test Description',
        user_id: 'test-user-id',
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
      },
    ];

    // Import supabase after mocking
    const { supabase } = await import('../../lib/supabase');

    const mockFrom = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({
            data: mockNotebooks,
            error: null,
          }),
        }),
      }),
    });

    (supabase.from as any) = mockFrom;

    const { result } = renderHook(() => useNotebooks(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(mockNotebooks);
    expect(mockFrom).toHaveBeenCalledWith('notebooks');
  });

  it('should handle errors when fetching notebooks', async () => {
    const mockError = new Error('Failed to fetch');

    const { supabase } = await import('../../lib/supabase');

    const mockFrom = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({
            data: null,
            error: mockError,
          }),
        }),
      }),
    });

    (supabase.from as any) = mockFrom;

    const { result } = renderHook(() => useNotebooks(), { wrapper });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error).toBeTruthy();
  });
});

describe('useCreateNotebook', () => {
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

  it('should create a notebook successfully', async () => {
    const newNotebook = {
      id: '1',
      title: 'New Notebook',
      description: 'New Description',
      user_id: 'test-user-id',
      created_at: '2024-01-01',
      updated_at: '2024-01-01',
    };

    const { supabase } = await import('../../lib/supabase');

    const mockFrom = vi.fn().mockReturnValue({
      insert: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: newNotebook,
            error: null,
          }),
        }),
      }),
    });

    (supabase.from as any) = mockFrom;

    const { result } = renderHook(() => useCreateNotebook(), { wrapper });

    result.current.mutate({
      title: 'New Notebook',
      description: 'New Description',
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(newNotebook);
  });
});
