import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { requireAuth } from '../lib/database';
import type { AttachmentData } from '../types/database';

/**
 * Hook for fetching all attachments for a page
 */
export function useAttachments(pageId: string | undefined) {
  return useQuery({
    queryKey: ['attachments', pageId],
    queryFn: async () => {
      if (!pageId) return [];
      
      const userId = await requireAuth();
      
      const { data, error } = await supabase
        .from('attachments')
        .select('*')
        .eq('page_id', pageId)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      if (error) {
        throw error;
      }
      
      return data || [];
    },
    enabled: !!pageId,
  });
}

/**
 * Hook for fetching a single attachment by ID
 */
export function useAttachment(attachmentId: string | undefined) {
  return useQuery({
    queryKey: ['attachment', attachmentId],
    queryFn: async () => {
      if (!attachmentId) return null;
      
      const userId = await requireAuth();
      
      const { data, error } = await supabase
        .from('attachments')
        .select('*')
        .eq('id', attachmentId)
        .eq('user_id', userId)
        .single();
      
      if (error) {
        throw error;
      }
      
      return data;
    },
    enabled: !!attachmentId,
  });
}

/**
 * Hook for uploading a file and creating an attachment record
 */
export function useUploadAttachment() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: {
      file: File;
      page_id: string;
    }) => {
      const userId = await requireAuth();
      
      // Generate storage path
      const fileExt = data.file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const storagePath = `${userId}/${data.page_id}/${fileName}`;
      
      // Upload file to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('user-files')
        .upload(storagePath, data.file, {
          cacheControl: '3600',
          upsert: false,
        });
      
      if (uploadError) {
        throw uploadError;
      }
      
      // Create attachment record
      const { data: attachment, error } = await supabase
        .from('attachments')
        .insert({
          filename: data.file.name,
          file_type: data.file.type,
          file_size: data.file.size,
          storage_path: uploadData.path,
          page_id: data.page_id,
          user_id: userId,
        })
        .select()
        .single();
      
      if (error) {
        // Cleanup uploaded file if database insert fails
        await supabase.storage.from('user-files').remove([storagePath]);
        throw error;
      }
      
      return attachment;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['attachments', data?.page_id] });
    },
  });
}

/**
 * Hook for getting a public URL for an attachment
 */
export function useAttachmentUrl(storagePath: string | undefined) {
  return useQuery({
    queryKey: ['attachment-url', storagePath],
    queryFn: async () => {
      if (!storagePath) return null;
      
      const { data } = supabase.storage
        .from('user-files')
        .getPublicUrl(storagePath);
      
      return data.publicUrl;
    },
    enabled: !!storagePath,
    staleTime: 1000 * 60 * 60, // 1 hour
  });
}

/**
 * Hook for downloading an attachment
 */
export function useDownloadAttachment() {
  return useMutation({
    mutationFn: async (storagePath: string) => {
      const { data, error } = await supabase.storage
        .from('user-files')
        .download(storagePath);
      
      if (error) {
        throw error;
      }
      
      return data;
    },
  });
}

/**
 * Hook for deleting an attachment
 */
export function useDeleteAttachment() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (attachmentId: string) => {
      const userId = await requireAuth();
      
      // Get attachment info before deletion
      const { data: attachment, error: fetchError } = await supabase
        .from('attachments')
        .select('*')
        .eq('id', attachmentId)
        .eq('user_id', userId)
        .single();
      
      if (fetchError) {
        throw fetchError;
      }
      
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('user-files')
        .remove([attachment.storage_path]);
      
      if (storageError) {
        throw storageError;
      }
      
      // Delete attachment record
      const { error } = await supabase
        .from('attachments')
        .delete()
        .eq('id', attachmentId)
        .eq('user_id', userId);
      
      if (error) {
        throw error;
      }
      
      return { attachmentId, pageId: attachment.page_id };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['attachments', data.pageId] });
      queryClient.invalidateQueries({ queryKey: ['attachment', data.attachmentId] });
    },
  });
}

/**
 * Hook for deleting all attachments for a page
 */
export function useDeletePageAttachments() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (pageId: string) => {
      const userId = await requireAuth();
      
      // Get all attachments for the page
      const { data: attachments, error: fetchError } = await supabase
        .from('attachments')
        .select('*')
        .eq('page_id', pageId)
        .eq('user_id', userId);
      
      if (fetchError) {
        throw fetchError;
      }
      
      const attachmentList = attachments || [];
      
      if (attachmentList.length === 0) {
        return { deleted: 0 };
      }
      
      // Delete all files from storage
      const storagePaths = attachmentList.map(a => a.storage_path);
      const { error: storageError } = await supabase.storage
        .from('user-files')
        .remove(storagePaths);
      
      if (storageError) {
        throw storageError;
      }
      
      // Delete all attachment records
      const { error } = await supabase
        .from('attachments')
        .delete()
        .eq('page_id', pageId)
        .eq('user_id', userId);
      
      if (error) {
        throw error;
      }
      
      return { deleted: attachmentList.length };
    },
    onSuccess: (data, pageId) => {
      queryClient.invalidateQueries({ queryKey: ['attachments', pageId] });
    },
  });
}

/**
 * Hook for batch uploading multiple files
 */
export function useBatchUploadAttachments() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: {
      files: File[];
      page_id: string;
    }) => {
      const userId = await requireAuth();
      const results: AttachmentData[] = [];
      const errors: Error[] = [];
      
      for (const file of data.files) {
        try {
          // Generate storage path
          const fileExt = file.name.split('.').pop();
          const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
          const storagePath = `${userId}/${data.page_id}/${fileName}`;
          
          // Upload file
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('user-files')
            .upload(storagePath, file, {
              cacheControl: '3600',
              upsert: false,
            });
          
          if (uploadError) {
            throw uploadError;
          }
          
          // Create attachment record
          const { data: attachment, error } = await supabase
            .from('attachments')
            .insert({
              filename: file.name,
              file_type: file.type,
              file_size: file.size,
              storage_path: uploadData.path,
              page_id: data.page_id,
              user_id: userId,
            })
            .select()
            .single();
          
          if (error) {
            // Cleanup uploaded file if database insert fails
            await supabase.storage.from('user-files').remove([storagePath]);
            throw error;
          }
          
          results.push(attachment);
        } catch (error) {
          errors.push(error as Error);
        }
      }
      
      return { results, errors };
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['attachments', variables.page_id] });
    },
  });
}
