import { create } from 'zustand';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import type { User } from '@/types';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  isInitialized: boolean;
}

interface AuthActions {
  signUp: (email: string, password: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  initialize: () => Promise<void>;
  clearError: () => void;
}

type AuthStore = AuthState & AuthActions;

// Helper to convert Supabase user to app user
const mapSupabaseUser = (supabaseUser: SupabaseUser | null): User | null => {
  if (!supabaseUser) return null;
  
  return {
    id: supabaseUser.id,
    email: supabaseUser.email || '',
    emailVerified: !!supabaseUser.email_confirmed_at,
  };
};

// Helper to format auth errors
const formatAuthError = (error: any): string => {
  if (!error) return 'An unexpected error occurred';
  
  // Handle Supabase auth errors
  if (error.message) {
    // Common error messages mapping
    const errorMap: Record<string, string> = {
      'Invalid login credentials': 'Invalid email or password',
      'Email not confirmed': 'Please verify your email before signing in',
      'User already registered': 'An account with this email already exists',
      'Password should be at least 6 characters': 'Password must be at least 6 characters',
    };
    
    return errorMap[error.message] || error.message;
  }
  
  return 'An unexpected error occurred';
};

export const useAuthStore = create<AuthStore>((set) => ({
  // Initial state
  user: null,
  isLoading: false,
  isAuthenticated: false,
  error: null,
  isInitialized: false,

  // Initialize auth state from session
  initialize: async () => {
    try {
      set({ isLoading: true, error: null });
      
      // Get current session
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) throw error;
      
      const user = mapSupabaseUser(session?.user || null);
      
      set({
        user,
        isAuthenticated: !!user,
        isLoading: false,
        isInitialized: true,
      });
      
      // Set up auth state change listener
      supabase.auth.onAuthStateChange((_event, session) => {
        const user = mapSupabaseUser(session?.user || null);
        set({
          user,
          isAuthenticated: !!user,
        });
      });
    } catch (error) {
      console.error('Auth initialization error:', error);
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        isInitialized: true,
        error: formatAuthError(error),
      });
    }
  },

  // Sign up new user
  signUp: async (email: string, password: string) => {
    try {
      set({ error: null });
      
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      
      if (error) throw error;
      
      // Note: User won't be fully authenticated until email is verified
      // Don't set user state until email is verified
      set({
        user: null,
        isAuthenticated: false,
      });
    } catch (error) {
      console.error('Sign up error:', error);
      set({
        error: formatAuthError(error),
      });
      throw error;
    }
  },

  // Sign in existing user
  signIn: async (email: string, password: string) => {
    try {
      set({ error: null });
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
      const user = mapSupabaseUser(data.user);
      
      set({
        user,
        isAuthenticated: !!user,
      });
    } catch (error) {
      console.error('Sign in error:', error);
      set({
        error: formatAuthError(error),
      });
      throw error;
    }
  },

  // Sign out current user
  signOut: async () => {
    try {
      set({ error: null });
      
      const { error } = await supabase.auth.signOut();
      
      if (error) throw error;
      
      set({
        user: null,
        isAuthenticated: false,
      });
    } catch (error) {
      console.error('Sign out error:', error);
      set({
        error: formatAuthError(error),
      });
      throw error;
    }
  },

  // Clear error state
  clearError: () => {
    set({ error: null });
  },
}));
