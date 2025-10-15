import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { requireAuth } from '../lib/database';
import type { PageData, PageFilters, PageWithChildren } from '../types/database';

/**
 * Hook for fetching all pages for a notebook
 */
export function usePages(notebookId: string | undefined, filters?: PageFilters) {
  return useQuery({
    queryKey: ['pages', notebookId, filters],
    queryFn: async () => {
      if (!notebookId) return [];
      
      const userId = await requireAuth();
      
      let query = supabase
        .from('pages')
        .select('*')
        .eq('notebook_id', notebookId)
        .eq('user_id', userId);
      
      // Apply parent filter
      if (filters?.parentPageId !== undefined) {
        if (filters.parentPageId === null) {
          query = query.is('parent_page_id', null);
        } else {
          query = query.eq('parent_page_id', filters.parentPageId);
        }
      }
      
      // Apply search filter
      if (filters?.search) {
        query = query.ilike('title', `%${filters.search}%`);
      }
      
      // Apply sorting
      const sortBy = filters?.sortBy || 'updated_at';
      const sortOrder = filters?.sortOrder || 'desc';
      query = query.order(sortBy, { ascending: sortOrder === 'asc' });
      
      const { data, error } = await query;
      
      if (error) {
        throw error;
      }
      
      return data || [];
    },
    enabled: !!notebookId,
  });
}

/**
 * Hook for fetching a single page by ID
 */
export function usePage(pageId: string | undefined) {
  return useQuery({
    queryKey: ['page', pageId],
    queryFn: async () => {
      if (!pageId) return null;
      
      const userId = await requireAuth();
      
      const { data, error } = await supabase
        .from('pages')
        .select('*')
        .eq('id', pageId)
        .eq('user_id', userId)
        .single();
      
      if (error) {
        throw error;
      }
      
      return data;
    },
    enabled: !!pageId,
  });
}

/**
 * Hook for fetching pages in hierarchical structure
 */
export function usePagesHierarchy(notebookId: string | undefined) {
  const { data: pages, ...rest } = usePages(notebookId);
  
  const buildHierarchy = (pages: PageData[]): PageWithChildren[] => {
    const pageMap = new Map<string, PageWithChildren>();
    const rootPages: PageWithChildren[] = [];
    
    // Create map of all pages
    pages.forEach(page => {
      pageMap.set(page.id, { ...page, children: [] });
    });
    
    // Build hierarchy
    pages.forEach(page => {
      const pageWithChildren = pageMap.get(page.id)!;
      
      if (page.parent_page_id) {
        const parent = pageMap.get(page.parent_page_id);
        if (parent) {
          parent.children = parent.children || [];
          parent.children.push(pageWithChildren);
        } else {
          // Parent not found, treat as root
          rootPages.push(pageWithChildren);
        }
      } else {
        rootPages.push(pageWithChildren);
      }
    });
    
    return rootPages;
  };
  
  return {
    ...rest,
    data: pages ? buildHierarchy(pages) : [],
    flatPages: pages,
  };
}

/**
 * Hook for fetching child pages of a parent page
 */
export function useChildPages(parentPageId: string | undefined) {
  return useQuery({
    queryKey: ['pages', 'children', parentPageId],
    queryFn: async () => {
      if (!parentPageId) return [];
      
      const userId = await requireAuth();
      
      const { data, error } = await supabase
        .from('pages')
        .select('*')
        .eq('parent_page_id', parentPageId)
        .eq('user_id', userId)
        .order('title', { ascending: true });
      
      if (error) {
        throw error;
      }
      
      return data || [];
    },
    enabled: !!parentPageId,
  });
}

/**
 * Hook for creating a new page
 */
export function useCreatePage() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: {
      title: string;
      content?: string;
      notebook_id: string;
      parent_page_id?: string;
    }) => {
      const userId = await requireAuth();
      
      const { data: page, error } = await supabase
        .from('pages')
        .insert({
          title: data.title,
          content: data.content || '',
          version: 1,
          notebook_id: data.notebook_id,
          parent_page_id: data.parent_page_id,
          user_id: userId,
        })
        .select()
        .single();
      
      if (error) {
        throw error;
      }
      
      return page;
    },
    onMutate: async (newPage) => {
      await queryClient.cancelQueries({ queryKey: ['pages', newPage.notebook_id] });
      
      const previousPages = queryClient.getQueryData<PageData[]>(['pages', newPage.notebook_id]);
      
      // Optimistically add new page
      if (previousPages) {
        const optimisticPage: PageData = {
          id: `temp-${Date.now()}`,
          title: newPage.title,
          content: newPage.content || '',
          version: 1,
          notebook_id: newPage.notebook_id,
          parent_page_id: newPage.parent_page_id,
          user_id: 'temp',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        
        queryClient.setQueryData<PageData[]>(
          ['pages', newPage.notebook_id],
          [...previousPages, optimisticPage]
        );
      }
      
      return { previousPages };
    },
    onError: (err, newPage, context) => {
      if (context?.previousPages) {
        queryClient.setQueryData(['pages', newPage.notebook_id], context.previousPages);
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['pages', data?.notebook_id] });
      if (data?.parent_page_id) {
        queryClient.invalidateQueries({ queryKey: ['pages', 'children', data.parent_page_id] });
      }
    },
  });
}

/**
 * Hook for updating a page
 */
export function useUpdatePage() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: {
      id: string;
      title?: string;
      content?: string;
      parent_page_id?: string;
    }) => {
      const userId = await requireAuth();
      
      // Get current page to increment version
      const { data: currentPage, error: fetchError } = await supabase
        .from('pages')
        .select('version, notebook_id')
        .eq('id', data.id)
        .eq('user_id', userId)
        .single();
      
      if (fetchError) {
        throw fetchError;
      }
      
      const { data: page, error } = await supabase
        .from('pages')
        .update({
          title: data.title,
          content: data.content,
          parent_page_id: data.parent_page_id,
          version: currentPage.version + 1,
        })
        .eq('id', data.id)
        .eq('user_id', userId)
        .select()
        .single();
      
      if (error) {
        throw error;
      }
      
      return page;
    },
    onMutate: async (updatedPage) => {
      await queryClient.cancelQueries({ queryKey: ['page', updatedPage.id] });
      
      const previousPage = queryClient.getQueryData<PageData>(['page', updatedPage.id]);
      
      // Optimistically update
      if (previousPage) {
        queryClient.setQueryData<PageData>(
          ['page', updatedPage.id],
          {
            ...previousPage,
            ...updatedPage,
            version: previousPage.version + 1,
            updated_at: new Date().toISOString(),
          }
        );
      }
      
      return { previousPage };
    },
    onError: (err, updatedPage, context) => {
      if (context?.previousPage) {
        queryClient.setQueryData(['page', updatedPage.id], context.previousPage);
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['page', data?.id] });
      queryClient.invalidateQueries({ queryKey: ['pages', data?.notebook_id] });
      if (data?.parent_page_id) {
        queryClient.invalidateQueries({ queryKey: ['pages', 'children', data.parent_page_id] });
      }
    },
  });
}

/**
 * Hook for moving a page to a different parent or notebook
 */
export function useMovePage() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: {
      id: string;
      parent_page_id?: string | null;
      notebook_id?: string;
    }) => {
      const userId = await requireAuth();
      
      const { data: page, error } = await supabase
        .from('pages')
        .update({
          parent_page_id: data.parent_page_id,
          notebook_id: data.notebook_id,
        })
        .eq('id', data.id)
        .eq('user_id', userId)
        .select()
        .single();
      
      if (error) {
        throw error;
      }
      
      return page;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['pages'] });
      queryClient.invalidateQueries({ queryKey: ['page', data?.id] });
    },
  });
}

/**
 * Hook for deleting a page
 */
export function useDeletePage() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (pageId: string) => {
      const userId = await requireAuth();
      
      // Get page info before deletion
      const { data: pageInfo, error: fetchError } = await supabase
        .from('pages')
        .select('notebook_id, parent_page_id')
        .eq('id', pageId)
        .eq('user_id', userId)
        .single();
      
      if (fetchError) {
        throw fetchError;
      }
      
      const { error } = await supabase
        .from('pages')
        .delete()
        .eq('id', pageId)
        .eq('user_id', userId);
      
      if (error) {
        throw error;
      }
      
      return { pageId, ...pageInfo };
    },
    onMutate: async (pageId) => {
      await queryClient.cancelQueries({ queryKey: ['pages'] });
      
      return { pageId };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['pages', data.notebook_id] });
      queryClient.invalidateQueries({ queryKey: ['page', data.pageId] });
      if (data.parent_page_id) {
        queryClient.invalidateQueries({ queryKey: ['pages', 'children', data.parent_page_id] });
      }
    },
  });
}
