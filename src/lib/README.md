# Database Library

This directory contains the core database utilities and Supabase client configuration for the web note application.

## Files

- `supabase.ts` - Supabase client configuration and database type definitions
- `database.ts` - Database helper functions, error handling, and utilities
- `utils.ts` - General utility functions

## Usage Examples

### Basic Database Operations

```typescript
import { supabase } from './lib/supabase';
import { withErrorHandling, requireAuth } from './lib/database';

// Example: Fetch notebooks for current user
async function getNotebooks() {
  const userId = await requireAuth();
  
  const result = await withErrorHandling(async () => {
    return await supabase
      .from('notebooks')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
  });
  
  if (result.error) {
    console.error('Failed to fetch notebooks:', result.error.message);
    return [];
  }
  
  return result.data || [];
}
```

### Error Handling

```typescript
import { DatabaseError, DatabaseErrorCode, handleDatabaseError } from './lib/database';

try {
  const { data, error } = await supabase
    .from('pages')
    .insert({ title: 'New Page', content: '', notebook_id: notebookId });
    
  if (error) {
    const dbError = handleDatabaseError(error);
    
    if (dbError.code === DatabaseErrorCode.VALIDATION) {
      // Handle validation error
      showValidationError(dbError.message);
    } else if (dbError.retryable) {
      // Retry the operation
      await retryOperation();
    }
  }
} catch (err) {
  // Handle unexpected errors
  console.error('Unexpected error:', err);
}
```

### Retry Logic

```typescript
import { withRetry, withErrorHandling } from './lib/database';

// Automatically retry failed operations
const result = await withRetry(
  async () => withErrorHandling(async () => {
    return await supabase
      .from('notebooks')
      .select('*')
      .eq('user_id', userId);
  }),
  3, // max retries
  1000 // initial delay in ms
);

if (result.error) {
  console.error('Operation failed after retries:', result.error.message);
}
```

### Validation

```typescript
import { validateRequiredFields, sanitizeInput } from './lib/database';

function createNotebook(data: any) {
  // Validate required fields
  validateRequiredFields(data, ['title', 'user_id']);
  
  // Sanitize user input
  const sanitizedTitle = sanitizeInput(data.title);
  const sanitizedDescription = data.description 
    ? sanitizeInput(data.description) 
    : undefined;
  
  // Proceed with database operation
  return supabase.from('notebooks').insert({
    title: sanitizedTitle,
    description: sanitizedDescription,
    user_id: data.user_id
  });
}
```

### Type-Safe Database Operations

```typescript
import { supabase, Database } from './lib/supabase';
import type { NotebookData, PageData } from './types';

// TypeScript will enforce correct types
async function createPage(pageData: Database['public']['Tables']['pages']['Insert']) {
  const { data, error } = await supabase
    .from('pages')
    .insert(pageData)
    .select()
    .single();
    
  return { data, error };
}

// Use the typed data
const notebook: NotebookData = {
  id: '123',
  title: 'My Notebook',
  description: 'A test notebook',
  user_id: 'user-123',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
};
```

## Error Codes

The following error codes are available:

- `UNKNOWN_ERROR` - Unknown or unexpected error
- `NETWORK_ERROR` - Network connection issues (retryable)
- `UNAUTHORIZED` - User not authenticated
- `NOT_FOUND` - Resource not found
- `CONFLICT` - Duplicate or conflicting data
- `VALIDATION_ERROR` - Invalid input data
- `PERMISSION_DENIED` - Insufficient permissions
- `FOREIGN_KEY_VIOLATION` - Related records prevent operation

## Best Practices

1. **Always use `withErrorHandling`** - Wrap database operations for consistent error handling
2. **Validate user input** - Use `validateRequiredFields` and `sanitizeInput` before database operations
3. **Check authentication** - Use `requireAuth()` for operations requiring authentication
4. **Handle retryable errors** - Use `withRetry` for operations that may fail due to network issues
5. **Use TypeScript types** - Leverage the typed Supabase client for type safety
6. **Log errors appropriately** - Use the error details for debugging and monitoring

## Environment Variables

Required environment variables (set in `.env`):

```
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Testing

Tests are located in `__tests__/database.test.ts`. Run tests with:

```bash
npm run test
```
