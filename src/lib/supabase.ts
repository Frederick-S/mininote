import { createClient } from '@supabase/supabase-js';

// Environment variable validation
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

// Database types
export interface NotebookData {
  id: string;
  title: string;
  description?: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface PageData {
  id: string;
  title: string;
  content: string;
  version: number;
  parent_page_id?: string;
  notebook_id: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface PageVersionData {
  id: string;
  page_id: string;
  title: string;
  content: string;
  version: number;
  user_id: string;
  created_at: string;
}

export interface AttachmentData {
  id: string;
  filename: string;
  file_type: string;
  file_size: number;
  storage_path: string;
  page_id: string;
  user_id: string;
  created_at: string;
}

export interface SearchResult {
  type: 'page' | 'notebook';
  id: string;
  title: string;
  content: string;
  notebook_title: string;
  rank: number;
}

// Database schema type definition
export type Database = {
  public: {
    Tables: {
      notebooks: {
        Row: NotebookData;
        Insert: Omit<NotebookData, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<NotebookData, 'id' | 'user_id' | 'created_at'>>;
        Relationships: [];
      };
      pages: {
        Row: PageData;
        Insert: Omit<PageData, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<PageData, 'id' | 'user_id' | 'created_at'>>;
        Relationships: [];
      };
      page_versions: {
        Row: PageVersionData;
        Insert: {
          page_id: string;
          title: string;
          content: string;
          version: number;
          user_id: string;
        };
        Update: Partial<Omit<PageVersionData, 'id' | 'created_at'>>;
        Relationships: [];
      };
      attachments: {
        Row: AttachmentData;
        Insert: Omit<AttachmentData, 'id' | 'created_at'>;
        Update: Partial<Omit<AttachmentData, 'id' | 'created_at'>>;
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

// Create typed Supabase client
export const supabase = createClient<Database>(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      flowType: 'pkce'
    }
  }
);
