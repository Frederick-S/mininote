import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SearchResults } from '../SearchResults';
import type { EnhancedSearchResult } from '../../../lib/searchService';

const mockResults: EnhancedSearchResult[] = [
  {
    type: 'page',
    id: 'page-1',
    title: 'Test Page 1',
    content: 'This is test content with some keywords',
    notebook_title: 'Test Notebook',
    notebook_id: 'notebook-1',
    rank: 1,
    highlights: ['test', 'keywords'],
    snippet: 'This is test content with some keywords',
  },
  {
    type: 'page',
    id: 'page-2',
    title: 'Test Page 2',
    content: 'Another page with different content',
    notebook_title: 'Test Notebook',
    notebook_id: 'notebook-1',
    rank: 0.8,
    highlights: ['different'],
    snippet: 'Another page with different content',
  },
];

describe('SearchResults', () => {
  it('should render loading state', () => {
    const onResultClick = vi.fn();
    render(
      <SearchResults
        results={[]}
        query="test"
        isLoading={true}
        onResultClick={onResultClick}
      />
    );

    // Check for the loading spinner
    const spinner = document.querySelector('.animate-spin');
    expect(spinner).toBeInTheDocument();
  });

  it('should render no results message when no results found', () => {
    const onResultClick = vi.fn();
    render(
      <SearchResults
        results={[]}
        query="test"
        isLoading={false}
        onResultClick={onResultClick}
      />
    );

    expect(screen.getByText('No results found')).toBeInTheDocument();
    expect(screen.getByText(/Try adjusting your search query/)).toBeInTheDocument();
  });

  it('should render search results', () => {
    const onResultClick = vi.fn();
    render(
      <SearchResults
        results={mockResults}
        query="test"
        isLoading={false}
        onResultClick={onResultClick}
      />
    );

    expect(screen.getByText('2 results found for "test"')).toBeInTheDocument();
    expect(screen.getByText('Test Page 1')).toBeInTheDocument();
    expect(screen.getByText('Test Page 2')).toBeInTheDocument();
  });

  it('should call onResultClick when a result is clicked', () => {
    const onResultClick = vi.fn();
    render(
      <SearchResults
        results={mockResults}
        query="test"
        isLoading={false}
        onResultClick={onResultClick}
      />
    );

    // Find the card element and click it
    const firstResult = screen.getByText('Test Page 1').closest('.cursor-pointer');
    if (firstResult) {
      fireEvent.click(firstResult);
    }

    expect(onResultClick).toHaveBeenCalledWith(mockResults[0]);
  });

  it('should render highlights', () => {
    const onResultClick = vi.fn();
    render(
      <SearchResults
        results={mockResults}
        query="test"
        isLoading={false}
        onResultClick={onResultClick}
      />
    );

    // Use getAllByText since there are multiple instances
    const testHighlights = screen.getAllByText('test');
    expect(testHighlights.length).toBeGreaterThan(0);
    expect(screen.getByText('keywords')).toBeInTheDocument();
  });

  it('should render load more button when hasMore is true', () => {
    const onResultClick = vi.fn();
    const onLoadMore = vi.fn();
    render(
      <SearchResults
        results={mockResults}
        query="test"
        isLoading={false}
        hasMore={true}
        onLoadMore={onLoadMore}
        onResultClick={onResultClick}
      />
    );

    const loadMoreButton = screen.getByRole('button', { name: /load more/i });
    expect(loadMoreButton).toBeInTheDocument();

    fireEvent.click(loadMoreButton);
    expect(onLoadMore).toHaveBeenCalled();
  });

  it('should highlight search terms in text', () => {
    const onResultClick = vi.fn();
    render(
      <SearchResults
        results={mockResults}
        query="test"
        isLoading={false}
        onResultClick={onResultClick}
      />
    );

    const marks = screen.getAllByText((content, element) => {
      return element?.tagName === 'MARK' && content.toLowerCase().includes('test');
    });

    expect(marks.length).toBeGreaterThan(0);
  });
});
