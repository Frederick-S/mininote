import { create } from 'zustand';
import { signUp, signIn, signOut, confirmSignUp, getCurrentUser, fetchAuthSession, resendSignUpCode } from 'aws-amplify/auth';
import type { AuthState, LoginFormData, SignUpFormData, AuthError } from '../types';

interface AuthStore extends AuthState {
  // Actions
  login: (data: LoginFormData) => Promise<void>;
  signup: (data: SignUpFormData) => Promise<void>;
  logout: () => Promise<void>;
  confirmEmail: (email: string, code: string) => Promise<void>;
  resendVerificationCode: (email: string) => Promise<void>;
  checkAuthState: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  // Initial state
  user: null,
  isLoading: false,
  isAuthenticated: false,
  error: null,

  // Actions
  login: async (data: LoginFormData) => {
    set({ isLoading: true, error: null });
    try {
      const result = await signIn({
        username: data.email,
        password: data.password,
      });

      if (result.isSignedIn) {
        const user = await getCurrentUser();
        set({
          user: {
            id: user.userId,
            email: user.signInDetails?.loginId || data.email,
            emailVerified: true,
          },
          isAuthenticated: true,
          isLoading: false,
        });
      }
    } catch (error: any) {
      let errorMessage = 'Login failed. Please try again.';
      
      // Handle specific error cases
      switch (error.name) {
        case 'NotAuthorizedException':
          errorMessage = 'Invalid email or password.';
          break;
        case 'UserNotConfirmedException':
          errorMessage = 'Please verify your email address before signing in.';
          break;
        case 'UserNotFoundException':
          errorMessage = 'No account found with this email address.';
          break;
        case 'TooManyRequestsException':
          errorMessage = 'Too many failed attempts. Please try again later.';
          break;
        default:
          errorMessage = error.message || errorMessage;
      }

      const authError: AuthError = {
        code: error.name || 'LoginError',
        message: errorMessage,
      };
      set({ error: authError.message, isLoading: false });
      throw authError;
    }
  },

  signup: async (data: SignUpFormData) => {
    set({ isLoading: true, error: null });
    try {
      const result = await signUp({
        username: data.email,
        password: data.password,
        options: {
          userAttributes: {
            email: data.email,
          },
        },
      });

      if (result.isSignUpComplete) {
        // Auto-login after successful signup
        await get().login({ email: data.email, password: data.password });
      } else {
        // Email verification required
        set({ isLoading: false });
      }
    } catch (error: any) {
      let errorMessage = 'Sign up failed. Please try again.';
      
      // Handle specific error cases
      switch (error.name) {
        case 'UsernameExistsException':
          errorMessage = 'An account with this email already exists.';
          break;
        case 'InvalidPasswordException':
          errorMessage = 'Password does not meet requirements.';
          break;
        case 'InvalidParameterException':
          errorMessage = 'Please check your email format and try again.';
          break;
        case 'TooManyRequestsException':
          errorMessage = 'Too many requests. Please try again later.';
          break;
        default:
          errorMessage = error.message || errorMessage;
      }

      const authError: AuthError = {
        code: error.name || 'SignUpError',
        message: errorMessage,
      };
      set({ error: authError.message, isLoading: false });
      throw authError;
    }
  },

  logout: async () => {
    set({ isLoading: true, error: null });
    try {
      await signOut();
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
    } catch (error: any) {
      const authError: AuthError = {
        code: error.name || 'LogoutError',
        message: error.message || 'Logout failed. Please try again.',
      };
      set({ error: authError.message, isLoading: false });
      throw authError;
    }
  },

  confirmEmail: async (email: string, code: string) => {
    set({ isLoading: true, error: null });
    try {
      await confirmSignUp({
        username: email,
        confirmationCode: code,
      });
      set({ isLoading: false });
    } catch (error: any) {
      let errorMessage = 'Email confirmation failed. Please try again.';
      
      // Handle specific error cases
      switch (error.name) {
        case 'CodeMismatchException':
          errorMessage = 'Invalid verification code. Please check and try again.';
          break;
        case 'ExpiredCodeException':
          errorMessage = 'Verification code has expired. Please request a new one.';
          break;
        case 'LimitExceededException':
          errorMessage = 'Too many attempts. Please try again later.';
          break;
        case 'UserNotFoundException':
          errorMessage = 'User not found. Please sign up again.';
          break;
        default:
          errorMessage = error.message || errorMessage;
      }

      const authError: AuthError = {
        code: error.name || 'ConfirmationError',
        message: errorMessage,
      };
      set({ error: authError.message, isLoading: false });
      throw authError;
    }
  },

  resendVerificationCode: async (email: string) => {
    set({ isLoading: true, error: null });
    try {
      await resendSignUpCode({
        username: email,
      });
      set({ isLoading: false });
    } catch (error: any) {
      const authError: AuthError = {
        code: error.name || 'ResendError',
        message: error.message || 'Failed to resend verification code. Please try again.',
      };
      set({ error: authError.message, isLoading: false });
      throw authError;
    }
  },

  checkAuthState: async () => {
    set({ isLoading: true });
    try {
      const session = await fetchAuthSession();
      if (session.tokens) {
        const user = await getCurrentUser();
        set({
          user: {
            id: user.userId,
            email: user.signInDetails?.loginId || '',
            emailVerified: true,
          },
          isAuthenticated: true,
          isLoading: false,
        });
      } else {
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
        });
      }
    } catch (error) {
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  },

  clearError: () => set({ error: null }),
}));