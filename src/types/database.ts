/**
 * Database type definitions
 * These types match the Supabase database schema
 */

import type {
  NotebookData,
  PageData,
  PageVersionData,
  AttachmentData,
  SearchResult,
  Database
} from '../lib/supabase';

// Re-export types from supabase.ts for convenience
export type {
  NotebookData,
  PageData,
  PageVersionData,
  AttachmentData,
  SearchResult,
  Database
};

/**
 * Page with nested children for hierarchical display
 */
export interface PageWithChildren extends PageData {
  children?: PageWithChildren[];
}

/**
 * Notebook with page count
 */
export interface NotebookWithStats extends NotebookData {
  page_count?: number;
}

/**
 * Page with notebook information
 */
export interface PageWithNotebook extends PageData {
  notebook?: NotebookData;
}

/**
 * Search result with highlighting
 */
export interface EnhancedSearchResult extends SearchResult {
  highlights: string[];
  snippet: string;
  page_path?: string[];
}

/**
 * File upload metadata
 */
export interface FileUploadMetadata {
  filename: string;
  file_type: string;
  file_size: number;
  page_id: string;
}

/**
 * Version comparison result
 */
export interface VersionDiff {
  version_a: PageVersionData;
  version_b: PageVersionData;
  additions: string[];
  deletions: string[];
  changes: string[];
}

/**
 * Export options
 */
export interface ExportOptions {
  includeAttachments: boolean;
  format: 'markdown' | 'html';
  includeMetadata: boolean;
}

/**
 * Pagination parameters
 */
export interface PaginationParams {
  page: number;
  pageSize: number;
}

/**
 * Pagination result
 */
export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

/**
 * Sort options
 */
export type SortOrder = 'asc' | 'desc';

export interface SortOptions {
  field: string;
  order: SortOrder;
}

/**
 * Filter options for notebooks
 */
export interface NotebookFilters {
  search?: string;
  sortBy?: 'title' | 'created_at' | 'updated_at';
  sortOrder?: SortOrder;
}

/**
 * Filter options for pages
 */
export interface PageFilters {
  notebookId?: string;
  parentPageId?: string | null;
  search?: string;
  sortBy?: 'title' | 'created_at' | 'updated_at';
  sortOrder?: SortOrder;
}

/**
 * Search options
 */
export interface SearchOptions {
  query: string;
  notebookId?: string;
  limit?: number;
  offset?: number;
}
