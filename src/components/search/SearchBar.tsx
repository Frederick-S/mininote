import React, { useState, useCallback } from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { cn } from '../../lib/utils';
import type { SearchScope } from '../../lib/searchService';

export interface SearchBarProps {
  onSearch: (query: string, scope: SearchScope, notebookId?: string) => void;
  currentNotebookId?: string;
  currentNotebookTitle?: string;
  placeholder?: string;
  className?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  onSearch,
  currentNotebookId,
  currentNotebookTitle,
  placeholder = 'Search pages...',
  className,
}) => {
  const [query, setQuery] = useState('');
  const [scope, setScope] = useState<SearchScope>('all');

  const handleSearch = useCallback(() => {
    if (query.trim()) {
      onSearch(
        query.trim(),
        scope,
        scope === 'notebook' ? currentNotebookId : undefined
      );
    }
  }, [query, scope, currentNotebookId, onSearch]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleClear = () => {
    setQuery('');
  };

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          className="pl-9 pr-9"
        />
        {query && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClear}
            className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      <Select
        value={scope}
        onValueChange={(value) => setScope(value as SearchScope)}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Notebooks</SelectItem>
          {currentNotebookId && (
            <SelectItem value="notebook">
              {currentNotebookTitle || 'Current Notebook'}
            </SelectItem>
          )}
        </SelectContent>
      </Select>

      <Button onClick={handleSearch} disabled={!query.trim()}>
        Search
      </Button>
    </div>
  );
};
