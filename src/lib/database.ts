import { PostgrestError } from '@supabase/supabase-js';
import { supabase } from './supabase';

/**
 * Database error types
 */
export const DatabaseErrorCode = {
  UNKNOWN: 'UNKNOWN_ERROR',
  NETWORK: 'NETWORK_ERROR',
  UNAUTHORIZED: 'UNAUTHORIZED',
  NOT_FOUND: 'NOT_FOUND',
  CONFLICT: 'CONFLICT',
  VALIDATION: 'VALIDATION_ERROR',
  PERMISSION_DENIED: 'PERMISSION_DENIED',
  FOREIGN_KEY_VIOLATION: 'FOREIGN_KEY_VIOLATION',
} as const;

export type DatabaseErrorCode = typeof DatabaseErrorCode[keyof typeof DatabaseErrorCode];

/**
 * Custom database error class
 */
export class DatabaseError extends Error {
  code: DatabaseErrorCode;
  details?: any;
  retryable: boolean;

  constructor(
    message: string,
    code: DatabaseErrorCode = DatabaseErrorCode.UNKNOWN,
    details?: any,
    retryable: boolean = false
  ) {
    super(message);
    this.name = 'DatabaseError';
    this.code = code;
    this.details = details;
    this.retryable = retryable;
  }
}

/**
 * Maps Supabase PostgrestError to DatabaseError
 */
export function handleDatabaseError(error: PostgrestError | Error | null): DatabaseError {
  if (!error) {
    return new DatabaseError('An unknown error occurred', DatabaseErrorCode.UNKNOWN);
  }

  // Handle PostgrestError
  if ('code' in error && 'details' in error) {
    const pgError = error as PostgrestError;
    
    // Map PostgreSQL error codes to our error types
    switch (pgError.code) {
      case 'PGRST301': // Network/connection error
      case '08006':
      case '08003':
        return new DatabaseError(
          'Network connection error. Please check your internet connection.',
          DatabaseErrorCode.NETWORK,
          pgError.details,
          true
        );
      
      case 'PGRST116': // Not found
      case '42P01':
        return new DatabaseError(
          'The requested resource was not found.',
          DatabaseErrorCode.NOT_FOUND,
          pgError.details,
          false
        );
      
      case '23505': // Unique violation
        return new DatabaseError(
          'A record with this information already exists.',
          DatabaseErrorCode.CONFLICT,
          pgError.details,
          false
        );
      
      case '23503': // Foreign key violation
        return new DatabaseError(
          'Cannot perform this operation due to related records.',
          DatabaseErrorCode.FOREIGN_KEY_VIOLATION,
          pgError.details,
          false
        );
      
      case '42501': // Insufficient privilege
      case 'PGRST301':
        return new DatabaseError(
          'You do not have permission to perform this action.',
          DatabaseErrorCode.PERMISSION_DENIED,
          pgError.details,
          false
        );
      
      case '23514': // Check violation
      case '23502': // Not null violation
        return new DatabaseError(
          'Invalid data provided. Please check your input.',
          DatabaseErrorCode.VALIDATION,
          pgError.details,
          false
        );
      
      default:
        return new DatabaseError(
          pgError.message || 'A database error occurred.',
          DatabaseErrorCode.UNKNOWN,
          pgError.details,
          false
        );
    }
  }

  // Handle generic errors
  return new DatabaseError(
    error.message || 'An unexpected error occurred.',
    DatabaseErrorCode.UNKNOWN,
    undefined,
    false
  );
}

/**
 * Database operation result type
 */
export type DatabaseResult<T> = {
  data: T | null;
  error: DatabaseError | null;
};

/**
 * Wraps a database operation with error handling
 */
export async function withErrorHandling<T>(
  operation: () => Promise<{ data: T | null; error: PostgrestError | null }>
): Promise<DatabaseResult<T>> {
  try {
    const { data, error } = await operation();
    
    if (error) {
      return {
        data: null,
        error: handleDatabaseError(error)
      };
    }
    
    return { data, error: null };
  } catch (err) {
    return {
      data: null,
      error: handleDatabaseError(err as Error)
    };
  }
}

/**
 * Get current authenticated user ID
 */
export async function getCurrentUserId(): Promise<string | null> {
  const { data: { user } } = await supabase.auth.getUser();
  return user?.id || null;
}

/**
 * Validates that user is authenticated
 */
export async function requireAuth(): Promise<string> {
  const userId = await getCurrentUserId();
  
  if (!userId) {
    throw new DatabaseError(
      'You must be logged in to perform this action.',
      DatabaseErrorCode.UNAUTHORIZED
    );
  }
  
  return userId;
}

/**
 * Retry logic for database operations
 */
export async function withRetry<T>(
  operation: () => Promise<DatabaseResult<T>>,
  maxRetries: number = 3,
  delayMs: number = 1000
): Promise<DatabaseResult<T>> {
  let lastError: DatabaseError | null = null;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    const result = await operation();
    
    if (!result.error || !result.error.retryable) {
      return result;
    }
    
    lastError = result.error;
    
    // Wait before retrying (exponential backoff)
    if (attempt < maxRetries - 1) {
      await new Promise(resolve => setTimeout(resolve, delayMs * Math.pow(2, attempt)));
    }
  }
  
  return {
    data: null,
    error: lastError || new DatabaseError('Operation failed after retries', DatabaseErrorCode.UNKNOWN)
  };
}

/**
 * Validates required fields in an object
 */
export function validateRequiredFields<T extends Record<string, any>>(
  data: T,
  requiredFields: (keyof T)[]
): void {
  const missingFields = requiredFields.filter(field => {
    const value = data[field];
    return value === undefined || value === null || value === '';
  });
  
  if (missingFields.length > 0) {
    throw new DatabaseError(
      `Missing required fields: ${missingFields.join(', ')}`,
      DatabaseErrorCode.VALIDATION,
      { missingFields }
    );
  }
}

/**
 * Sanitizes user input to prevent injection attacks
 */
export function sanitizeInput(input: string): string {
  return input.trim().replace(/[<>]/g, '');
}

/**
 * Formats database timestamps to readable format
 */
export function formatTimestamp(timestamp: string): string {
  return new Date(timestamp).toLocaleString();
}

/**
 * Checks if a database error is retryable
 */
export function isRetryableError(error: DatabaseError): boolean {
  return error.retryable;
}
