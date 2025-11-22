import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SearchBar } from '../SearchBar';

describe('SearchBar', () => {
  it('should render search input and button', () => {
    const onSearch = vi.fn();
    render(<SearchBar onSearch={onSearch} />);

    expect(screen.getByPlaceholderText('Search pages...')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /search/i })).toBeInTheDocument();
  });

  it('should call onSearch when search button is clicked', () => {
    const onSearch = vi.fn();
    render(<SearchBar onSearch={onSearch} />);

    const input = screen.getByPlaceholderText('Search pages...');
    const button = screen.getByRole('button', { name: /search/i });

    fireEvent.change(input, { target: { value: 'test query' } });
    fireEvent.click(button);

    expect(onSearch).toHaveBeenCalledWith('test query', 'all', undefined);
  });

  it('should call onSearch when Enter key is pressed', () => {
    const onSearch = vi.fn();
    render(<SearchBar onSearch={onSearch} />);

    const input = screen.getByPlaceholderText('Search pages...');

    fireEvent.change(input, { target: { value: 'test query' } });
    fireEvent.keyDown(input, { key: 'Enter' });

    expect(onSearch).toHaveBeenCalledWith('test query', 'all', undefined);
  });

  it('should not call onSearch with empty query', () => {
    const onSearch = vi.fn();
    render(<SearchBar onSearch={onSearch} />);

    const button = screen.getByRole('button', { name: /search/i });
    fireEvent.click(button);

    expect(onSearch).not.toHaveBeenCalled();
  });

  it('should clear input when clear button is clicked', () => {
    const onSearch = vi.fn();
    render(<SearchBar onSearch={onSearch} />);

    const input = screen.getByPlaceholderText('Search pages...') as HTMLInputElement;

    fireEvent.change(input, { target: { value: 'test query' } });
    expect(input.value).toBe('test query');

    const clearButton = screen.getByRole('button', { name: '' });
    fireEvent.click(clearButton);

    expect(input.value).toBe('');
  });

  it('should show notebook scope option when currentNotebookId is provided', () => {
    const onSearch = vi.fn();
    render(
      <SearchBar
        onSearch={onSearch}
        currentNotebookId="notebook-123"
        currentNotebookTitle="My Notebook"
      />
    );

    const scopeSelect = screen.getByRole('combobox');
    fireEvent.click(scopeSelect);

    // Use getAllByText since there are multiple instances
    const allNotebooksOptions = screen.getAllByText('All Notebooks');
    expect(allNotebooksOptions.length).toBeGreaterThan(0);
    expect(screen.getByText('My Notebook')).toBeInTheDocument();
  });

  it('should pass notebook scope to onSearch when notebook scope is selected', () => {
    const onSearch = vi.fn();
    render(
      <SearchBar
        onSearch={onSearch}
        currentNotebookId="notebook-123"
        currentNotebookTitle="My Notebook"
      />
    );

    const input = screen.getByPlaceholderText('Search pages...');
    fireEvent.change(input, { target: { value: 'test query' } });

    const scopeSelect = screen.getByRole('combobox');
    fireEvent.click(scopeSelect);

    const notebookOption = screen.getByText('My Notebook');
    fireEvent.click(notebookOption);

    const button = screen.getByRole('button', { name: /search/i });
    fireEvent.click(button);

    expect(onSearch).toHaveBeenCalledWith('test query', 'notebook', 'notebook-123');
  });
});
