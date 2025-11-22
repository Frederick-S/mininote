import { useQuery } from '@tanstack/react-query';
import { searchService, type SearchParams, type SearchResponse } from '../lib/searchService';

/**
 * Hook for searching pages with full-text search
 */
export function useSearch(params: SearchParams, enabled: boolean = true) {
  return useQuery<SearchResponse, Error>({
    queryKey: ['search', params],
    queryFn: async () => {
      // Use ranked search if available, fallback to basic search
      return searchService.searchPagesRanked(params);
    },
    enabled: enabled && params.query.length > 0,
    staleTime: 30000, // Cache results for 30 seconds
    gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
  });
}

/**
 * Hook for highlighting search terms in text
 */
export function useSearchHighlight() {
  return {
    highlightText: (text: string, query: string) => {
      return searchService.highlightText(text, query);
    }
  };
}
