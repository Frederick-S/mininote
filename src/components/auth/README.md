# Authentication Components

This directory contains all authentication-related components for Mini Note.

## Components

### SignUpForm

A complete sign-up form with email/password validation and email verification flow.

**Features:**
- Email format validation
- Strong password requirements (8+ chars, uppercase, lowercase, number)
- Password confirmation matching
- Email verification flow with success message
- Error handling with user-friendly messages
- Loading states during submission
- Switch to login option

**Usage:**
```tsx
import { SignUpForm } from './components/auth';

<SignUpForm
  onSuccess={() => console.log('User signed up')}
  onSwitchToLogin={() => setView('login')}
/>
```

**Password Requirements:**
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number

### LoginForm

A login form with error handling and password reset functionality.

**Features:**
- Email/password authentication
- User-friendly error messages
- Forgot password flow
- Password reset email sending
- Loading states
- Switch to sign-up option

**Usage:**
```tsx
import { LoginForm } from './components/auth';

<LoginForm
  onSuccess={() => console.log('User logged in')}
  onSwitchToSignUp={() => setView('signup')}
/>
```

**Error Handling:**
- Invalid credentials → "Invalid email or password"
- Unverified email → "Please verify your email address"
- Network errors → Appropriate error messages

### AuthGuard

A component that protects routes and content requiring authentication.

**Features:**
- Automatic session checking
- Real-time auth state listening
- Loading state during verification
- Customizable fallback content
- Callback on unauthenticated access

**Usage:**
```tsx
import { AuthGuard } from './components/auth';

<AuthGuard
  fallback={<LoginForm />}
  onUnauthenticated={() => console.log('User not authenticated')}
>
  <ProtectedContent />
</AuthGuard>
```

### AuthCallback

Handles email verification and password reset callbacks from Supabase.

**Features:**
- Email verification handling
- Password reset link verification
- Success/error states with visual feedback
- Automatic URL cleanup
- Redirect after successful verification

**Usage:**
```tsx
import { AuthCallback } from './components/auth';

// On your /auth/callback route
<AuthCallback
  onSuccess={() => navigate('/dashboard')}
  onError={(error) => console.error(error)}
/>
```

## Authentication Flow

### Sign Up Flow
1. User fills out sign-up form
2. Form validates email format and password strength
3. Supabase creates user account
4. Verification email sent to user
5. User clicks verification link
6. AuthCallback component handles verification
7. User is redirected to app

### Login Flow
1. User enters credentials
2. Form validates input
3. Supabase authenticates user
4. Session is established
5. User gains access to protected content

### Password Reset Flow
1. User clicks "Forgot password"
2. User enters email address
3. Reset email sent
4. User clicks reset link
5. AuthCallback verifies link
6. User can set new password

## Integration with Supabase

All components use the Supabase client configured in `src/lib/supabase.ts`:

```typescript
import { supabase } from '../../lib/supabase';

// Sign up
await supabase.auth.signUp({ email, password });

// Login
await supabase.auth.signInWithPassword({ email, password });

// Logout
await supabase.auth.signOut();

// Get session
await supabase.auth.getSession();

// Listen to auth changes
supabase.auth.onAuthStateChange((event, session) => {
  // Handle auth state changes
});
```

## Styling

All components use Tailwind CSS for styling with a consistent design system:

- Primary color: Blue (600/700)
- Success color: Green (600)
- Error color: Red (600/700)
- Background: White with gray-50 page background
- Shadows: Subtle shadow-md for cards
- Rounded corners: rounded-md/lg

## Error Handling

Components provide user-friendly error messages for common scenarios:

- **Invalid credentials**: Clear message without exposing security details
- **Network errors**: Retry suggestions
- **Validation errors**: Specific field-level feedback
- **Email verification**: Clear instructions and status

## Security Features

- Password strength validation
- Email format validation
- Secure session management
- Automatic token refresh
- Session persistence
- CSRF protection (via Supabase)

## Testing Considerations

When testing these components:

1. Mock the Supabase client
2. Test validation logic independently
3. Test error handling paths
4. Test loading states
5. Test auth state changes
6. Test callback URL handling

## Next Steps

After authentication is complete, the next tasks will implement:

- Authentication state management (Zustand store)
- Protected routes and navigation
- User profile management
- Session timeout handling
