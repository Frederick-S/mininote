import { supabase } from './supabase';
import { requireAuth } from './database';
import type { SearchResult } from '../types/database';

/**
 * Search scope options
 */
export type SearchScope = 'all' | 'notebook';

/**
 * Search parameters
 */
export interface SearchParams {
  query: string;
  scope: SearchScope;
  notebookId?: string;
  limit?: number;
  offset?: number;
}

/**
 * Search result with highlighting and ranking
 */
export interface EnhancedSearchResult extends SearchResult {
  notebook_id: string;
  highlights: string[];
  snippet: string;
}

/**
 * Search response
 */
export interface SearchResponse {
  results: EnhancedSearchResult[];
  total: number;
  hasMore: boolean;
}

/**
 * Service for full-text search functionality
 */
class SearchService {
  private readonly DEFAULT_LIMIT = 20;
  private readonly SNIPPET_LENGTH = 150;

  /**
   * Performs full-text search across pages
   */
  async searchPages(params: SearchParams): Promise<SearchResponse> {
    await requireAuth();
    const limit = params.limit || this.DEFAULT_LIMIT;
    const offset = params.offset || 0;

    // Build the base query with full-text search
    let query = supabase
      .from('pages')
      .select(`
        id,
        title,
        content,
        notebook_id,
        notebooks!inner(id, title)
      `, { count: 'exact' });

    // Apply scope filter
    if (params.scope === 'notebook' && params.notebookId) {
      query = query.eq('notebook_id', params.notebookId);
    }

    // Apply full-text search using PostgreSQL's text search
    // Use websearch_to_tsquery for better query parsing
    query = query.textSearch('searchable_content', params.query, {
      type: 'websearch',
      config: 'english'
    });

    // Order by relevance using ts_rank
    // Note: Supabase doesn't directly expose ts_rank in the query builder,
    // so we'll need to use a custom RPC function for ranking
    const { data, error, count } = await query
      .range(offset, offset + limit - 1);

    if (error) {
      throw error;
    }

    // Transform results and add highlighting
    const results: EnhancedSearchResult[] = (data || []).map((page: any) => {
      const notebookTitle = page.notebooks?.title || 'Unknown Notebook';
      const notebookId = page.notebook_id;
      
      return {
        type: 'page' as const,
        id: page.id,
        title: page.title,
        content: page.content,
        notebook_title: notebookTitle,
        notebook_id: notebookId,
        rank: 1, // Will be calculated by RPC function
        highlights: this.extractHighlights(page.content, params.query),
        snippet: this.generateSnippet(page.content, params.query)
      };
    });

    return {
      results,
      total: count || 0,
      hasMore: (count || 0) > offset + limit
    };
  }

  /**
   * Performs ranked search using custom RPC function
   */
  async searchPagesRanked(params: SearchParams): Promise<SearchResponse> {
    await requireAuth();
    const limit = params.limit || this.DEFAULT_LIMIT;
    const offset = params.offset || 0;

    // Call custom RPC function for ranked search
    const { data, error } = await (supabase.rpc as any)('search_pages_ranked', {
      search_query: params.query,
      notebook_filter: params.scope === 'notebook' ? params.notebookId || null : null,
      result_limit: limit,
      result_offset: offset
    });

    if (error) {
      // Fallback to basic search if RPC function doesn't exist
      console.warn('Ranked search RPC not available, falling back to basic search:', error);
      return this.searchPages(params);
    }

    // Transform RPC results
    const results: EnhancedSearchResult[] = ((data as any[]) || []).map((row: any) => ({
      type: 'page' as const,
      id: row.page_id,
      title: row.page_title,
      content: row.page_content,
      notebook_title: row.notebook_title,
      notebook_id: row.notebook_id || row.page_notebook_id,
      rank: row.rank,
      highlights: this.extractHighlights(row.page_content, params.query),
      snippet: this.generateSnippet(row.page_content, params.query)
    }));

    return {
      results,
      total: results.length,
      hasMore: results.length === limit
    };
  }

  /**
   * Extracts highlighted text snippets from content
   */
  private extractHighlights(content: string, query: string): string[] {
    const highlights: string[] = [];
    const searchTerms = this.parseSearchQuery(query);
    
    // Find matches for each search term
    for (const term of searchTerms) {
      const regex = new RegExp(`\\b${this.escapeRegex(term)}\\w*`, 'gi');
      const matches = content.match(regex);
      
      if (matches) {
        // Add unique matches
        matches.forEach(match => {
          if (!highlights.includes(match.toLowerCase())) {
            highlights.push(match);
          }
        });
      }
    }
    
    return highlights.slice(0, 10); // Limit to 10 highlights
  }

  /**
   * Generates a snippet of content around the search query
   */
  private generateSnippet(content: string, query: string): string {
    const searchTerms = this.parseSearchQuery(query);
    
    // Find the first occurrence of any search term
    let firstMatchIndex = -1;
    
    for (const term of searchTerms) {
      const regex = new RegExp(`\\b${this.escapeRegex(term)}`, 'i');
      const match = content.match(regex);
      
      if (match && match.index !== undefined) {
        if (firstMatchIndex === -1 || match.index < firstMatchIndex) {
          firstMatchIndex = match.index;
        }
      }
    }
    
    // If no match found, return beginning of content
    if (firstMatchIndex === -1) {
      return this.truncateText(content, this.SNIPPET_LENGTH);
    }
    
    // Calculate snippet boundaries
    const snippetStart = Math.max(0, firstMatchIndex - 50);
    const snippetEnd = Math.min(content.length, firstMatchIndex + this.SNIPPET_LENGTH);
    
    let snippet = content.substring(snippetStart, snippetEnd);
    
    // Add ellipsis if truncated
    if (snippetStart > 0) {
      snippet = '...' + snippet;
    }
    if (snippetEnd < content.length) {
      snippet = snippet + '...';
    }
    
    return snippet.trim();
  }

  /**
   * Parses search query into individual terms
   */
  private parseSearchQuery(query: string): string[] {
    // Remove special characters and split by whitespace
    return query
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(term => term.length > 2); // Ignore very short terms
  }

  /**
   * Escapes special regex characters
   */
  private escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  /**
   * Truncates text to specified length
   */
  private truncateText(text: string, maxLength: number): string {
    if (text.length <= maxLength) {
      return text;
    }
    
    return text.substring(0, maxLength).trim() + '...';
  }

  /**
   * Highlights search terms in text
   */
  highlightText(text: string, query: string): string {
    const searchTerms = this.parseSearchQuery(query);
    let highlightedText = text;
    
    for (const term of searchTerms) {
      const regex = new RegExp(`(\\b${this.escapeRegex(term)}\\w*)`, 'gi');
      highlightedText = highlightedText.replace(regex, '<mark>$1</mark>');
    }
    
    return highlightedText;
  }
}

export const searchService = new SearchService();
