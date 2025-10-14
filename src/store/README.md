# Authentication Store

This directory contains the Zustand-based state management for the application.

## Auth Store (`authStore.ts`)

The authentication store manages user authentication state, session persistence, and authentication actions.

### Features

- ✅ User authentication state management
- ✅ Login/logout/signup actions with Supabase Auth
- ✅ Automatic session persistence
- ✅ Authentication error handling
- ✅ Session initialization and monitoring
- ✅ Type-safe with TypeScript

### Usage

#### Import the store

```typescript
import { useAuthStore } from '@/store';
```

#### Access authentication state

```typescript
function MyComponent() {
  const { user, isAuthenticated, isLoading, error } = useAuthStore();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <div>Please log in</div>;
  }

  return <div>Welcome, {user?.email}!</div>;
}
```

#### Sign up a new user

```typescript
function SignUpComponent() {
  const { signUp, error, isLoading } = useAuthStore();

  const handleSignUp = async () => {
    try {
      await signUp('user@example.com', 'password123');
      // User will receive verification email
    } catch (err) {
      console.error('Sign up failed:', err);
    }
  };

  return (
    <button onClick={handleSignUp} disabled={isLoading}>
      {isLoading ? 'Signing up...' : 'Sign Up'}
    </button>
  );
}
```

#### Sign in an existing user

```typescript
function LoginComponent() {
  const { signIn, error, isLoading } = useAuthStore();

  const handleLogin = async () => {
    try {
      await signIn('user@example.com', 'password123');
      // User is now authenticated
    } catch (err) {
      console.error('Login failed:', err);
    }
  };

  return (
    <button onClick={handleLogin} disabled={isLoading}>
      {isLoading ? 'Logging in...' : 'Log In'}
    </button>
  );
}
```

#### Sign out the current user

```typescript
function LogoutButton() {
  const { signOut, isLoading } = useAuthStore();

  const handleLogout = async () => {
    try {
      await signOut();
      // User is now logged out
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  return (
    <button onClick={handleLogout} disabled={isLoading}>
      {isLoading ? 'Logging out...' : 'Log Out'}
    </button>
  );
}
```

#### Initialize authentication on app start

The store should be initialized when your app starts. This is typically done in the `AuthGuard` component:

```typescript
function App() {
  const { initialize, isInitialized } = useAuthStore();

  useEffect(() => {
    if (!isInitialized) {
      initialize();
    }
  }, [isInitialized, initialize]);

  // Rest of your app
}
```

#### Clear error state

```typescript
function ErrorDisplay() {
  const { error, clearError } = useAuthStore();

  if (!error) return null;

  return (
    <div>
      <p>{error}</p>
      <button onClick={clearError}>Dismiss</button>
    </div>
  );
}
```

### Store State

| Property | Type | Description |
|----------|------|-------------|
| `user` | `User \| null` | Current authenticated user or null |
| `isLoading` | `boolean` | Whether an auth operation is in progress |
| `isAuthenticated` | `boolean` | Whether a user is currently authenticated |
| `error` | `string \| null` | Current error message or null |
| `isInitialized` | `boolean` | Whether the store has been initialized |

### Store Actions

| Action | Parameters | Description |
|--------|------------|-------------|
| `signUp` | `email: string, password: string` | Create a new user account |
| `signIn` | `email: string, password: string` | Sign in an existing user |
| `signOut` | None | Sign out the current user |
| `initialize` | None | Initialize auth state from session |
| `clearError` | None | Clear the current error state |

### User Type

```typescript
interface User {
  id: string;
  email: string;
  emailVerified: boolean;
}
```

### Error Handling

The store automatically formats Supabase auth errors into user-friendly messages:

- "Invalid login credentials" → "Invalid email or password"
- "Email not confirmed" → "Please verify your email before signing in"
- "User already registered" → "An account with this email already exists"
- And more...

Errors are stored in the `error` state property and can be cleared with `clearError()`.

### Session Management

The store automatically:
- Persists sessions across page refreshes
- Monitors auth state changes
- Refreshes tokens automatically
- Clears session data on logout

### Integration with Components

The auth store is already integrated with:
- `LoginForm` - Uses `signIn` action
- `SignUpForm` - Uses `signUp` action
- `AuthGuard` - Uses `initialize`, `isAuthenticated`, and `user`
- `AuthCallback` - Uses `initialize` after email verification
- `App.tsx` - Uses `user` and `signOut`

### Best Practices

1. **Always initialize the store** on app start (done in `AuthGuard`)
2. **Handle errors gracefully** by checking the `error` state
3. **Show loading states** using the `isLoading` property
4. **Clear errors** when appropriate using `clearError()`
5. **Use `isAuthenticated`** instead of checking `user !== null` for consistency
6. **Wrap protected routes** with `AuthGuard` component

### Example: Protected Route

```typescript
import { AuthGuard } from '@/components/auth';
import { useAuthStore } from '@/store';

function ProtectedPage() {
  const { user } = useAuthStore();

  return (
    <AuthGuard fallback={<LoginPage />}>
      <div>
        <h1>Protected Content</h1>
        <p>Welcome, {user?.email}!</p>
      </div>
    </AuthGuard>
  );
}
```

### Testing

When testing components that use the auth store, you can mock it:

```typescript
import { useAuthStore } from '@/store';

// Mock the store
vi.mock('@/store', () => ({
  useAuthStore: vi.fn(() => ({
    user: { id: '123', email: 'test@example.com', emailVerified: true },
    isAuthenticated: true,
    isLoading: false,
    error: null,
    signIn: vi.fn(),
    signOut: vi.fn(),
    signUp: vi.fn(),
    initialize: vi.fn(),
    clearError: vi.fn(),
  })),
}));
```
