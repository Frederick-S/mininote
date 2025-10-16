import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PageCreator } from '../PageCreator';
import * as usePages from '@/hooks/usePages';

// Mock the hooks
vi.mock('@/hooks/usePages', () => ({
  useCreatePage: vi.fn(),
  usePagesHierarchy: vi.fn(),
}));

describe('PageCreator', () => {
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

  const renderWithProviders = (component: React.ReactElement) => {
    return render(
      <QueryClientProvider client={queryClient}>
        {component}
      </QueryClientProvider>
    );
  };

  it('renders the trigger button', () => {
    vi.mocked(usePages.useCreatePage).mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    } as any);

    vi.mocked(usePages.usePagesHierarchy).mockReturnValue({
      data: [],
    } as any);

    renderWithProviders(<PageCreator notebookId="test-notebook" />);

    expect(screen.getByRole('button', { name: /new page/i })).toBeInTheDocument();
  });

  it('opens dialog when trigger is clicked', async () => {
    const user = userEvent.setup();

    vi.mocked(usePages.useCreatePage).mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    } as any);

    vi.mocked(usePages.usePagesHierarchy).mockReturnValue({
      data: [],
    } as any);

    renderWithProviders(<PageCreator notebookId="test-notebook" />);

    await user.click(screen.getByRole('button', { name: /new page/i }));

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText('Create New Page')).toBeInTheDocument();
    });
  });

  it('displays form fields', async () => {
    const user = userEvent.setup();

    vi.mocked(usePages.useCreatePage).mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    } as any);

    vi.mocked(usePages.usePagesHierarchy).mockReturnValue({
      data: [],
    } as any);

    renderWithProviders(<PageCreator notebookId="test-notebook" />);

    await user.click(screen.getByRole('button', { name: /new page/i }));

    await waitFor(() => {
      expect(screen.getByLabelText(/title/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/parent page/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/initial content/i)).toBeInTheDocument();
    });
  });

  it('calls onSuccess with page id after successful creation', async () => {
    const user = userEvent.setup();
    const onSuccess = vi.fn();
    const mockMutateAsync = vi.fn().mockResolvedValue({
      id: 'new-page-id',
      title: 'Test Page',
      content: '',
      notebook_id: 'test-notebook',
    });

    vi.mocked(usePages.useCreatePage).mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: false,
    } as any);

    vi.mocked(usePages.usePagesHierarchy).mockReturnValue({
      data: [],
    } as any);

    renderWithProviders(
      <PageCreator notebookId="test-notebook" onSuccess={onSuccess} />
    );

    await user.click(screen.getByRole('button', { name: /new page/i }));

    await waitFor(() => {
      expect(screen.getByLabelText(/title/i)).toBeInTheDocument();
    });

    await user.type(screen.getByLabelText(/title/i), 'Test Page');
    await user.click(screen.getByRole('button', { name: /create page/i }));

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith({
        title: 'Test Page',
        content: '',
        notebook_id: 'test-notebook',
        parent_page_id: undefined,
      });
      expect(onSuccess).toHaveBeenCalledWith('new-page-id');
    });
  });
});
