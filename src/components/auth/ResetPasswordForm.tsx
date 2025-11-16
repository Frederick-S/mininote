import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { CheckCircle2, Loader2, XCircle } from 'lucide-react';
import type { AuthError } from '@/types';

const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

interface ResetPasswordFormProps {
  onSuccess?: () => void;
}

export function ResetPasswordForm({ onSuccess }: ResetPasswordFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [isResetting, setIsResetting] = useState(false);
  const [resetComplete, setResetComplete] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [sessionError, setSessionError] = useState('');

  const form = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  // Check if user has valid session from reset link
  useEffect(() => {
    const validateSession = async () => {
      try {
        // First, check if Supabase already established a session from the URL
        // (detectSessionInUrl: true does this automatically)
        const { data: { session } } = await supabase.auth.getSession();

        console.log('Existing session:', session);

        if (session) {
          // Session was already established by Supabase's detectSessionInUrl
          console.log('Session already established by Supabase:', session.user?.email);
          setCheckingSession(false);
          return;
        }

        // If no session exists, try to extract tokens from URL manually
        const fullHash = window.location.hash;
        console.log('Full hash:', fullHash);

        // Extract the auth params after the second #
        const hashParts = fullHash.split('#');
        const authHash = hashParts.length > 2 ? hashParts[2] : hashParts[1];

        console.log('Auth hash:', authHash);

        const hashParams = new URLSearchParams(authHash);
        const hasAccessToken = hashParams.has('access_token');
        const tokenType = hashParams.get('type');

        console.log('Hash params:', {
          hasAccessToken,
          tokenType,
          accessToken: hashParams.get('access_token')?.substring(0, 20) + '...',
        });

        if (!hasAccessToken) {
          setSessionError('Invalid reset link. Please click the complete reset link from your email.');
          setCheckingSession(false);
          return;
        }

        // Manually set the session using the tokens from URL
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');

        if (accessToken && refreshToken) {
          console.log('Setting session manually with tokens from URL');
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (error) {
            console.error('Error setting session:', error);
            setSessionError('Unable to establish session: ' + error.message);
          } else if (!data.session) {
            console.error('No session returned after setSession');
            setSessionError('Unable to establish session. The token may have expired.');
          } else {
            console.log('Session established successfully:', data.session.user?.email);
          }
        } else {
          setSessionError('Reset link is missing required tokens.');
        }
      } catch (err) {
        console.error('Mount error:', err);
        setSessionError('An error occurred while validating the session');
      } finally {
        setCheckingSession(false);
      }
    };

    validateSession();
  }, []);

  const onSubmit = async (values: ResetPasswordFormValues) => {
    setError(null);
    setIsResetting(true);

    try {
      // Verify we still have a session before attempting password update
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        setError('Session has expired. Please request a new password reset.');
        setSessionError('Session has expired');
        setIsResetting(false);
        return;
      }

      const { error: updateError } = await supabase.auth.updateUser({
        password: values.password,
      });

      if (updateError) {
        throw updateError;
      }

      setResetComplete(true);

      // Sign out to clear the recovery session
      await supabase.auth.signOut();

      // Clear the hash to remove recovery tokens
      window.location.hash = '';

      if (onSuccess) {
        setTimeout(onSuccess, 2000);
      }
    } catch (err) {
      const authError = err as AuthError;
      setError(authError.message || 'An error occurred while resetting password');
    } finally {
      setIsResetting(false);
    }
  };

  // Loading State
  if (checkingSession) {
    return (
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <Loader2 className="w-16 h-16 mx-auto animate-spin text-primary" />
            <div className="space-y-2">
              <h2 className="text-2xl font-bold">Validating...</h2>
              <p className="text-muted-foreground">
                Please wait while we verify your reset link.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Error State
  if (sessionError) {
    return (
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <XCircle className="w-16 h-16 mx-auto text-destructive" />
            <div className="space-y-2">
              <h2 className="text-2xl font-bold">Invalid or Expired Link</h2>
              <p className="text-muted-foreground">{sessionError}</p>
            </div>
            <Button onClick={() => window.location.href = '/'}>
              Return to Login
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Success State
  if (resetComplete) {
    return (
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <CheckCircle2 className="w-16 h-16 mx-auto text-green-600" />
            <div className="space-y-2">
              <h2 className="text-2xl font-bold">Password Reset Complete</h2>
              <p className="text-muted-foreground">
                Your password has been successfully updated. Redirecting to login...
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Reset Password Form
  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Reset Password</CardTitle>
        <CardDescription>Enter your new password</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New Password</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="••••••••"
                      {...field}
                      disabled={isResetting}
                    />
                  </FormControl>
                  <FormDescription>
                    Must be at least 8 characters with uppercase, lowercase, and number
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm New Password</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="••••••••"
                      {...field}
                      disabled={isResetting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {error && (
              <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full" disabled={isResetting}>
              {isResetting ? 'Resetting Password...' : 'Reset Password'}
            </Button>
          </form>
        </Form>

        <div className="mt-4 text-center">
          <Button variant="link" onClick={() => window.location.href = '/'}>
            Return to Login
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
