# Data Access Hooks Tests

## Overview

This directory contains comprehensive tests for all data access hooks using Vitest and React Testing Library.

## Test Coverage

### useNotebooks.test.tsx
- ✅ Fetching notebooks successfully
- ✅ Handling errors when fetching notebooks
- ✅ Creating a notebook successfully

### usePages.test.tsx
- ✅ Fetching pages successfully
- ✅ Not fetching when notebookId is undefined
- ✅ Building hierarchical structure from flat pages
- ✅ Creating a page successfully

### usePageVersions.test.tsx
- ✅ Fetching page versions successfully
- ✅ Not fetching when pageId is undefined
- ✅ Creating a page version successfully
- ✅ Restoring a page version successfully

### useAttachments.test.tsx
- ✅ Fetching attachments successfully
- ✅ Not fetching when pageId is undefined
- ✅ Uploading attachment successfully

## Running Tests

### Run all tests once
```bash
npm run test:run
```

### Run tests in watch mode
```bash
npm test
```

### Run tests with UI
```bash
npm run test:ui
```

## Test Structure

Each test file follows this pattern:

1. **Mock Setup**: Mock Supabase client and database utilities
2. **Query Client**: Create a fresh QueryClient for each test
3. **Wrapper**: Provide QueryClientProvider wrapper for hooks
4. **Test Cases**: Test success and error scenarios

## Example Test

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

describe('useNotebooks', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    vi.clearAllMocks();
  });

  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );

  it('should fetch notebooks successfully', async () => {
    // Mock Supabase response
    const mockNotebooks = [{ id: '1', title: 'Test' }];
    
    // Setup mock
    const { supabase } = await import('../../lib/supabase');
    (supabase.from as any) = mockFrom;

    // Render hook
    const { result } = renderHook(() => useNotebooks(), { wrapper });

    // Wait for success
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    // Assert
    expect(result.current.data).toEqual(mockNotebooks);
  });
});
```

## Mocking Strategy

### Supabase Client
The Supabase client is mocked at the module level:

```typescript
vi.mock('../../lib/supabase', () => ({
  supabase: {
    auth: { getUser: vi.fn() },
    from: vi.fn(),
    storage: { from: vi.fn() },
  },
}));
```

### Database Utilities
Authentication is mocked to always return a test user:

```typescript
vi.mock('../../lib/database', () => ({
  requireAuth: vi.fn().mockResolvedValue('test-user-id'),
}));
```

### Dynamic Mocking
For each test, we dynamically mock the Supabase response:

```typescript
const mockFrom = vi.fn().mockReturnValue({
  select: vi.fn().mockReturnValue({
    eq: vi.fn().mockReturnValue({
      order: vi.fn().mockResolvedValue({
        data: mockData,
        error: null,
      }),
    }),
  }),
});

(supabase.from as any) = mockFrom;
```

## Test Configuration

### vitest.config.ts
```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
  },
});
```

### src/test/setup.ts
```typescript
import { expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';

expect.extend(matchers);

afterEach(() => {
  cleanup();
});
```

## Best Practices

1. **Isolate Tests**: Each test has its own QueryClient to prevent state leakage
2. **Clear Mocks**: Always clear mocks in `beforeEach`
3. **Wait for Async**: Use `waitFor` for async operations
4. **Test Both Paths**: Test success and error scenarios
5. **Mock Minimally**: Only mock what's necessary

## Adding New Tests

To add tests for a new hook:

1. Create a new test file: `useYourHook.test.tsx`
2. Import the hook and testing utilities
3. Mock Supabase and database utilities
4. Write test cases for success and error scenarios
5. Run tests: `npm run test:run`

## Debugging Tests

### View test output
```bash
npm run test:run -- --reporter=verbose
```

### Run specific test file
```bash
npm run test:run -- useNotebooks.test.tsx
```

### Run specific test
```bash
npm run test:run -- -t "should fetch notebooks successfully"
```

### Debug with UI
```bash
npm run test:ui
```

## Coverage

To add coverage reporting, install coverage tools:

```bash
npm install -D @vitest/coverage-v8
```

Then run:

```bash
npx vitest run --coverage
```

## CI/CD Integration

Add to your CI pipeline:

```yaml
- name: Run tests
  run: npm run test:run
```

## Future Improvements

- [ ] Add integration tests with real Supabase instance
- [ ] Add E2E tests for complete user flows
- [ ] Increase test coverage to 100%
- [ ] Add performance tests
- [ ] Add accessibility tests
