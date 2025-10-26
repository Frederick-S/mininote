import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { requireAuth } from '../lib/database';

/**
 * Hook for fetching all versions of a page
 */
export function usePageVersions(pageId: string | undefined) {
  return useQuery({
    queryKey: ['page-versions', pageId],
    queryFn: async () => {
      if (!pageId) return [];

      const userId = await requireAuth();

      const { data, error } = await supabase
        .from('page_versions')
        .select('*')
        .eq('page_id', pageId)
        .eq('user_id', userId)
        .order('version', { ascending: false });

      if (error) {
        throw error;
      }

      return data || [];
    },
    enabled: !!pageId,
  });
}

/**
 * Hook for fetching a specific version of a page
 */
export function usePageVersion(versionId: string | undefined) {
  return useQuery({
    queryKey: ['page-version', versionId],
    queryFn: async () => {
      if (!versionId) return null;

      const userId = await requireAuth();

      const { data, error } = await supabase
        .from('page_versions')
        .select('*')
        .eq('id', versionId)
        .eq('user_id', userId)
        .single();

      if (error) {
        throw error;
      }

      return data;
    },
    enabled: !!versionId,
  });
}

/**
 * Hook for creating a new page version (snapshot)
 */
export function useCreatePageVersion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      page_id: string;
      title: string;
      content: string;
      version: number;
    }) => {
      const userId = await requireAuth();

      const { data: version, error } = await supabase
        .from('page_versions')
        .insert({
          page_id: data.page_id,
          title: data.title,
          content: data.content,
          version: data.version,
          user_id: userId,
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      return version;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['page-versions', data?.page_id] });
    },
  });
}

/**
 * Hook for restoring a page to a previous version
 */
export function useRestorePageVersion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      page_id: string;
      version_id: string;
    }) => {
      const userId = await requireAuth();

      // Get the version to restore
      const { data: version, error: versionError } = await supabase
        .from('page_versions')
        .select('*')
        .eq('id', data.version_id)
        .eq('user_id', userId)
        .single();

      if (versionError) {
        throw versionError;
      }

      // Get current page to increment version
      const { data: currentPage, error: pageError } = await supabase
        .from('pages')
        .select('version')
        .eq('id', data.page_id)
        .eq('user_id', userId)
        .single();

      if (pageError) {
        throw pageError;
      }

      // Update the page with the version content
      const { data: page, error } = await supabase
        .from('pages')
        .update({
          title: version.title,
          content: version.content,
          version: currentPage.version + 1,
        })
        .eq('id', data.page_id)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return page;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['page', data?.id] });
      queryClient.invalidateQueries({ queryKey: ['pages', data?.notebook_id] });
      queryClient.invalidateQueries({ queryKey: ['page-versions', data?.id] });
    },
  });
}

/**
 * Hook for comparing two page versions
 */
export function useComparePageVersions(versionId1: string | undefined, versionId2: string | undefined) {
  return useQuery({
    queryKey: ['page-versions-compare', versionId1, versionId2],
    queryFn: async () => {
      if (!versionId1 || !versionId2) return null;

      const userId = await requireAuth();

      // Fetch both versions
      const [version1Result, version2Result] = await Promise.all([
        supabase
          .from('page_versions')
          .select('*')
          .eq('id', versionId1)
          .eq('user_id', userId)
          .single(),
        supabase
          .from('page_versions')
          .select('*')
          .eq('id', versionId2)
          .eq('user_id', userId)
          .single(),
      ]);

      if (version1Result.error) {
        throw version1Result.error;
      }

      if (version2Result.error) {
        throw version2Result.error;
      }

      return {
        version1: version1Result.data,
        version2: version2Result.data,
      };
    },
    enabled: !!versionId1 && !!versionId2,
  });
}

/**
 * Hook for deleting old page versions (cleanup)
 */
export function useDeletePageVersions() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      page_id: string;
      keep_latest?: number;
    }) => {
      const userId = await requireAuth();
      const keepLatest = data.keep_latest || 10;

      // Get all versions for the page
      const { data: versions, error: fetchError } = await supabase
        .from('page_versions')
        .select('id, version')
        .eq('page_id', data.page_id)
        .eq('user_id', userId)
        .order('version', { ascending: false });

      if (fetchError) {
        throw fetchError;
      }

      const versionList = versions || [];

      // Keep only the latest N versions
      if (versionList.length > keepLatest) {
        const versionsToDelete = versionList.slice(keepLatest);
        const idsToDelete = versionsToDelete.map(v => v.id);

        const { error } = await supabase
          .from('page_versions')
          .delete()
          .in('id', idsToDelete)
          .eq('user_id', userId);

        if (error) {
          throw error;
        }

        return { deleted: idsToDelete.length };
      }

      return { deleted: 0 };
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['page-versions', variables.page_id] });
    },
  });
}

/**
 * Hook for deleting a specific page version
 */
export function useDeletePageVersion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      version_id: string;
      page_id: string;
    }) => {
      const userId = await requireAuth();

      const { error } = await supabase
        .from('page_versions')
        .delete()
        .eq('id', data.version_id)
        .eq('user_id', userId);

      if (error) {
        throw error;
      }

      return { version_id: data.version_id, page_id: data.page_id };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['page-versions', data.page_id] });
      queryClient.invalidateQueries({ queryKey: ['page-version', data.version_id] });
    },
  });
}

/**
 * Hook for getting version count for a page
 */
export function usePageVersionCount(pageId: string | undefined) {
  return useQuery({
    queryKey: ['page-versions-count', pageId],
    queryFn: async () => {
      if (!pageId) return 0;

      const userId = await requireAuth();

      const { count, error } = await supabase
        .from('page_versions')
        .select('*', { count: 'exact', head: true })
        .eq('page_id', pageId)
        .eq('user_id', userId);

      if (error) {
        throw error;
      }

      return count || 0;
    },
    enabled: !!pageId,
  });
}
