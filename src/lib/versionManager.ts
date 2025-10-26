/**
 * Version management utilities
 * Provides helper functions for page version tracking and cleanup
 */

import { supabase } from './supabase';
import type { PageVersionData } from '../types/database';

/**
 * Configuration for version management
 */
export interface VersionConfig {
  maxVersions: number; // Maximum number of versions to keep per page
  autoCleanup: boolean; // Whether to automatically cleanup old versions
}

/**
 * Default version configuration
 */
export const DEFAULT_VERSION_CONFIG: VersionConfig = {
  maxVersions: 50, // Keep last 50 versions
  autoCleanup: true,
};

/**
 * Create a version snapshot of a page
 * This is called automatically before updating a page
 */
export async function createVersionSnapshot(
  pageId: string,
  title: string,
  content: string,
  version: number,
  userId: string
): Promise<PageVersionData | null> {
  try {
    const { data, error } = await supabase
      .from('page_versions')
      .insert({
        page_id: pageId,
        title,
        content,
        version,
        user_id: userId,
      })
      .select()
      .single();

    if (error) {
      console.error('Failed to create version snapshot:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error creating version snapshot:', error);
    return null;
  }
}

/**
 * Cleanup old versions for a page
 * Keeps only the most recent N versions
 */
export async function cleanupOldVersions(
  pageId: string,
  userId: string,
  config: VersionConfig = DEFAULT_VERSION_CONFIG
): Promise<number> {
  if (!config.autoCleanup) {
    return 0;
  }

  try {
    // Get all versions for the page
    const { data: versions, error: fetchError } = await supabase
      .from('page_versions')
      .select('id, version')
      .eq('page_id', pageId)
      .eq('user_id', userId)
      .order('version', { ascending: false });

    if (fetchError) {
      console.error('Failed to fetch versions for cleanup:', fetchError);
      return 0;
    }

    const versionList = versions || [];

    // Keep only the latest N versions
    if (versionList.length > config.maxVersions) {
      const versionsToDelete = versionList.slice(config.maxVersions);
      const idsToDelete = versionsToDelete.map(v => v.id);

      const { error } = await supabase
        .from('page_versions')
        .delete()
        .in('id', idsToDelete)
        .eq('user_id', userId);

      if (error) {
        console.error('Failed to delete old versions:', error);
        return 0;
      }

      return idsToDelete.length;
    }

    return 0;
  } catch (error) {
    console.error('Error cleaning up old versions:', error);
    return 0;
  }
}

/**
 * Get version statistics for a page
 */
export async function getVersionStats(
  pageId: string,
  userId: string
): Promise<{
  totalVersions: number;
  oldestVersion: PageVersionData | null;
  newestVersion: PageVersionData | null;
}> {
  try {
    const { data: versions, error } = await supabase
      .from('page_versions')
      .select('*')
      .eq('page_id', pageId)
      .eq('user_id', userId)
      .order('version', { ascending: false });

    if (error) {
      throw error;
    }

    const versionList = versions || [];

    return {
      totalVersions: versionList.length,
      oldestVersion: versionList.length > 0 ? versionList[versionList.length - 1] : null,
      newestVersion: versionList.length > 0 ? versionList[0] : null,
    };
  } catch (error) {
    console.error('Error getting version stats:', error);
    return {
      totalVersions: 0,
      oldestVersion: null,
      newestVersion: null,
    };
  }
}

/**
 * Delete all versions for a page
 * Useful when deleting a page
 */
export async function deleteAllVersions(
  pageId: string,
  userId: string
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('page_versions')
      .delete()
      .eq('page_id', pageId)
      .eq('user_id', userId);

    if (error) {
      console.error('Failed to delete all versions:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error deleting all versions:', error);
    return false;
  }
}

/**
 * Check if a version exists
 */
export async function versionExists(
  versionId: string,
  userId: string
): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('page_versions')
      .select('id')
      .eq('id', versionId)
      .eq('user_id', userId)
      .single();

    if (error) {
      return false;
    }

    return !!data;
  } catch (error) {
    return false;
  }
}

/**
 * Get the latest version number for a page
 */
export async function getLatestVersionNumber(
  pageId: string,
  userId: string
): Promise<number> {
  try {
    const { data, error } = await supabase
      .from('page_versions')
      .select('version')
      .eq('page_id', pageId)
      .eq('user_id', userId)
      .order('version', { ascending: false })
      .limit(1)
      .single();

    if (error || !data) {
      return 0;
    }

    return data.version;
  } catch (error) {
    return 0;
  }
}
