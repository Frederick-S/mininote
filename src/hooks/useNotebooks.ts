import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { requireAuth } from '../lib/database';
import type { NotebookData, NotebookFilters } from '../types/database';

/**
 * Hook for fetching all notebooks for the current user
 */
export function useNotebooks(filters?: NotebookFilters) {
  return useQuery({
    queryKey: ['notebooks', filters],
    queryFn: async () => {
      const userId = await requireAuth();
      
      let query = supabase
        .from('notebooks')
        .select('*')
        .eq('user_id', userId);
      
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
  });
}

/**
 * Hook for fetching a single notebook by ID
 */
export function useNotebook(notebookId: string | undefined) {
  return useQuery({
    queryKey: ['notebook', notebookId],
    queryFn: async () => {
      if (!notebookId) return null;
      
      const userId = await requireAuth();
      
      const { data, error } = await supabase
        .from('notebooks')
        .select('*')
        .eq('id', notebookId)
        .eq('user_id', userId)
        .single();
      
      if (error) {
        throw error;
      }
      
      return data;
    },
    enabled: !!notebookId,
  });
}

/**
 * Hook for creating a new notebook
 */
export function useCreateNotebook() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: { title: string; description?: string }) => {
      const userId = await requireAuth();
      
      const { data: notebook, error } = await supabase
        .from('notebooks')
        .insert({
          title: data.title,
          description: data.description,
          user_id: userId,
        })
        .select()
        .single();
      
      if (error) {
        throw error;
      }
      
      return notebook;
    },
    onMutate: async (newNotebook) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['notebooks'] });
      
      // Snapshot previous value
      const previousNotebooks = queryClient.getQueryData<NotebookData[]>(['notebooks']);
      
      // Optimistically update
      if (previousNotebooks) {
        const optimisticNotebook: NotebookData = {
          id: `temp-${Date.now()}`,
          title: newNotebook.title,
          description: newNotebook.description,
          user_id: 'temp',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        
        queryClient.setQueryData<NotebookData[]>(
          ['notebooks'],
          [...previousNotebooks, optimisticNotebook]
        );
      }
      
      return { previousNotebooks };
    },
    onError: (err, newNotebook, context) => {
      // Rollback on error
      if (context?.previousNotebooks) {
        queryClient.setQueryData(['notebooks'], context.previousNotebooks);
      }
    },
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['notebooks'] });
    },
  });
}

/**
 * Hook for updating a notebook
 */
export function useUpdateNotebook() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: { id: string; title?: string; description?: string }) => {
      const userId = await requireAuth();
      
      const { data: notebook, error } = await supabase
        .from('notebooks')
        .update({
          title: data.title,
          description: data.description,
        })
        .eq('id', data.id)
        .eq('user_id', userId)
        .select()
        .single();
      
      if (error) {
        throw error;
      }
      
      return notebook;
    },
    onMutate: async (updatedNotebook) => {
      await queryClient.cancelQueries({ queryKey: ['notebooks'] });
      await queryClient.cancelQueries({ queryKey: ['notebook', updatedNotebook.id] });
      
      const previousNotebooks = queryClient.getQueryData<NotebookData[]>(['notebooks']);
      const previousNotebook = queryClient.getQueryData<NotebookData>(['notebook', updatedNotebook.id]);
      
      // Optimistically update notebooks list
      if (previousNotebooks) {
        queryClient.setQueryData<NotebookData[]>(
          ['notebooks'],
          previousNotebooks.map(nb =>
            nb.id === updatedNotebook.id
              ? { ...nb, ...updatedNotebook, updated_at: new Date().toISOString() }
              : nb
          )
        );
      }
      
      // Optimistically update single notebook
      if (previousNotebook) {
        queryClient.setQueryData<NotebookData>(
          ['notebook', updatedNotebook.id],
          { ...previousNotebook, ...updatedNotebook, updated_at: new Date().toISOString() }
        );
      }
      
      return { previousNotebooks, previousNotebook };
    },
    onError: (err, updatedNotebook, context) => {
      if (context?.previousNotebooks) {
        queryClient.setQueryData(['notebooks'], context.previousNotebooks);
      }
      if (context?.previousNotebook) {
        queryClient.setQueryData(['notebook', updatedNotebook.id], context.previousNotebook);
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['notebooks'] });
      queryClient.invalidateQueries({ queryKey: ['notebook', data?.id] });
    },
  });
}

/**
 * Hook for deleting a notebook
 */
export function useDeleteNotebook() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (notebookId: string) => {
      const userId = await requireAuth();
      
      const { error } = await supabase
        .from('notebooks')
        .delete()
        .eq('id', notebookId)
        .eq('user_id', userId);
      
      if (error) {
        throw error;
      }
      
      return notebookId;
    },
    onMutate: async (notebookId) => {
      await queryClient.cancelQueries({ queryKey: ['notebooks'] });
      
      const previousNotebooks = queryClient.getQueryData<NotebookData[]>(['notebooks']);
      
      // Optimistically remove from list
      if (previousNotebooks) {
        queryClient.setQueryData<NotebookData[]>(
          ['notebooks'],
          previousNotebooks.filter(nb => nb.id !== notebookId)
        );
      }
      
      return { previousNotebooks };
    },
    onError: (err, notebookId, context) => {
      if (context?.previousNotebooks) {
        queryClient.setQueryData(['notebooks'], context.previousNotebooks);
      }
    },
    onSuccess: (notebookId) => {
      queryClient.invalidateQueries({ queryKey: ['notebooks'] });
      queryClient.invalidateQueries({ queryKey: ['notebook', notebookId] });
      queryClient.invalidateQueries({ queryKey: ['pages'] });
    },
  });
}
