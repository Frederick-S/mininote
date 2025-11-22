import React from 'react';
import { FileText, ChevronRight, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { ScrollArea } from '../ui/scroll-area';
import { Separator } from '../ui/separator';
import { cn } from '../../lib/utils';
import type { EnhancedSearchResult } from '../../lib/searchService';

export interface SearchResultsProps {
  results: EnhancedSearchResult[];
  query: string;
  isLoading?: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
  onResultClick: (result: EnhancedSearchResult) => void;
  className?: string;
}

export const SearchResults: React.FC<SearchResultsProps> = ({
  results,
  query,
  isLoading = false,
  hasMore = false,
  onLoadMore,
  onResultClick,
  className,
}) => {
  if (isLoading && results.length === 0) {
    return (
      <div className={cn('flex items-center justify-center py-12', className)}>
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!isLoading && results.length === 0 && query) {
    return (
      <div className={cn('flex flex-col items-center justify-center py-12 text-center', className)}>
        <FileText className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">No results found</h3>
        <p className="text-sm text-muted-foreground">
          Try adjusting your search query or search scope
        </p>
      </div>
    );
  }

  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {results.length} {results.length === 1 ? 'result' : 'results'} found
          {query && ` for "${query}"`}
        </p>
      </div>

      <ScrollArea className="h-[600px]">
        <div className="space-y-3 pr-4">
          {results.map((result) => (
            <SearchResultCard
              key={result.id}
              result={result}
              query={query}
              onClick={() => onResultClick(result)}
            />
          ))}

          {hasMore && onLoadMore && (
            <>
              <Separator className="my-4" />
              <Button
                variant="outline"
                onClick={onLoadMore}
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading...
                  </>
                ) : (
                  'Load More'
                )}
              </Button>
            </>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

interface SearchResultCardProps {
  result: EnhancedSearchResult;
  query: string;
  onClick: () => void;
}

const SearchResultCard: React.FC<SearchResultCardProps> = ({
  result,
  query,
  onClick,
}) => {
  return (
    <Card
      className="cursor-pointer transition-colors hover:bg-accent"
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-base line-clamp-1">
              <HighlightedText text={result.title} query={query} />
            </CardTitle>
            <CardDescription className="flex items-center gap-1 mt-1">
              <span className="truncate">{result.notebook_title}</span>
              <ChevronRight className="h-3 w-3 flex-shrink-0" />
              <span className="truncate">{result.title}</span>
            </CardDescription>
          </div>
          <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="text-sm text-muted-foreground line-clamp-3">
          <HighlightedText text={result.snippet} query={query} />
        </p>
        {result.highlights.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {result.highlights.slice(0, 5).map((highlight, index) => (
              <span
                key={index}
                className="inline-flex items-center rounded-md bg-primary/10 px-2 py-1 text-xs font-medium text-primary"
              >
                {highlight}
              </span>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

interface HighlightedTextProps {
  text: string;
  query: string;
}

const HighlightedText: React.FC<HighlightedTextProps> = ({ text, query }) => {
  if (!query) {
    return <>{text}</>;
  }

  // Parse query into terms
  const searchTerms = query
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter((term) => term.length >= 2);

  if (searchTerms.length === 0) {
    return <>{text}</>;
  }

  // Create regex pattern for all terms
  const pattern = searchTerms.map((term) => term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');
  const regex = new RegExp(`(\\b(?:${pattern})\\w*)`, 'gi');

  // Split text and highlight matches
  const parts = text.split(regex);

  return (
    <>
      {parts.map((part, index) => {
        const isMatch = searchTerms.some((term) =>
          part.toLowerCase().startsWith(term)
        );
        return isMatch ? (
          <mark key={index} className="bg-yellow-200 dark:bg-yellow-900/50 font-medium">
            {part}
          </mark>
        ) : (
          <span key={index}>{part}</span>
        );
      })}
    </>
  );
};
