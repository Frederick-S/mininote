import React, { useState, useCallback, useEffect } from 'react';
import { Search as SearchIcon } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { SearchBar } from './SearchBar';
import { SearchResults } from './SearchResults';
import { searchService, type SearchScope, type EnhancedSearchResult } from '../../lib/searchService';
import { useNavigate } from 'react-router-dom';

export interface SearchDialogProps {
  currentNotebookId?: string;
  currentNotebookTitle?: string;
  trigger?: React.ReactNode;
}

export const SearchDialog: React.FC<SearchDialogProps> = ({
  currentNotebookId,
  currentNotebookTitle,
  trigger,
}) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [scope, setScope] = useState<SearchScope>('all');
  const [notebookId, setNotebookId] = useState<string | undefined>();
  const [results, setResults] = useState<EnhancedSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [offset, setOffset] = useState(0);
  const navigate = useNavigate();

  const performSearch = useCallback(
    async (searchQuery: string, searchScope: SearchScope, searchNotebookId?: string, searchOffset = 0) => {
      if (!searchQuery.trim()) return;

      setIsLoading(true);
      try {
        const response = await searchService.searchPages({
          query: searchQuery,
          scope: searchScope,
          notebookId: searchNotebookId,
          limit: 20,
          offset: searchOffset,
        });

        if (searchOffset === 0) {
          setResults(response.results);
        } else {
          setResults((prev) => [...prev, ...response.results]);
        }

        setHasMore(response.hasMore);
        setOffset(searchOffset + response.results.length);
      } catch (error) {
        console.error('Search error:', error);
        setResults([]);
        setHasMore(false);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const handleSearch = useCallback(
    (searchQuery: string, searchScope: SearchScope, searchNotebookId?: string) => {
      setQuery(searchQuery);
      setScope(searchScope);
      setNotebookId(searchNotebookId);
      setOffset(0);
      performSearch(searchQuery, searchScope, searchNotebookId, 0);
    },
    [performSearch]
  );

  const handleLoadMore = useCallback(() => {
    if (query && !isLoading) {
      performSearch(query, scope, notebookId, offset);
    }
  }, [query, scope, notebookId, offset, isLoading, performSearch]);

  const handleResultClick = useCallback(
    (result: EnhancedSearchResult) => {
      // Navigate to the page
      navigate(`/notebooks/${result.notebook_id}/pages/${result.id}`);
      setOpen(false);
    },
    [navigate]
  );

  // Reset state when dialog closes
  useEffect(() => {
    if (!open) {
      setQuery('');
      setResults([]);
      setOffset(0);
      setHasMore(false);
    }
  }, [open]);

  // Keyboard shortcut (Cmd/Ctrl + K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <SearchIcon className="mr-2 h-4 w-4" />
            Search
            <kbd className="ml-2 pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
              <span className="text-xs">⌘</span>K
            </kbd>
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Search Pages</DialogTitle>
          <DialogDescription>
            Search across your notebooks and pages
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 flex-1 overflow-hidden flex flex-col">
          <SearchBar
            onSearch={handleSearch}
            currentNotebookId={currentNotebookId}
            currentNotebookTitle={currentNotebookTitle}
            placeholder="Search pages..."
          />

          <div className="flex-1 overflow-hidden">
            <SearchResults
              results={results}
              query={query}
              isLoading={isLoading}
              hasMore={hasMore}
              onLoadMore={handleLoadMore}
              onResultClick={handleResultClick}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
