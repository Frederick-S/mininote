import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';

interface AuthCallbackProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export function AuthCallback({ onSuccess, onError }: AuthCallbackProps) {
  const { initialize } = useAuthStore();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Verifying your email...');

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Get the hash fragment from the URL
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const type = hashParams.get('type');

        if (!accessToken) {
          throw new Error('No access token found in URL');
        }

        // Handle email verification
        if (type === 'signup' || type === 'email') {
          const {
            data: { session },
            error: sessionError,
          } = await supabase.auth.getSession();

          if (sessionError) {
            throw sessionError;
          }

          if (session) {
            setStatus('success');
            setMessage('Email verified successfully! Redirecting...');
            
            // Reinitialize auth store with new session
            await initialize();
            
            // Clear the hash from URL
            window.history.replaceState(null, '', window.location.pathname);
            
            if (onSuccess) {
              setTimeout(onSuccess, 2000);
            }
          } else {
            throw new Error('Failed to establish session');
          }
        } else if (type === 'recovery') {
          // Handle password reset
          await initialize();
          
          setStatus('success');
          setMessage('Password reset link verified. You can now set a new password.');
          
          if (onSuccess) {
            setTimeout(onSuccess, 2000);
          }
        } else {
          throw new Error('Unknown verification type');
        }
      } catch (err) {
        console.error('Auth callback error:', err);
        setStatus('error');
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to verify email. Please try again.';
        setMessage(errorMessage);
        
        if (onError) {
          onError(errorMessage);
        }
      }
    };

    // Only run if there's a hash in the URL
    if (window.location.hash) {
      handleAuthCallback();
    } else {
      setStatus('error');
      setMessage('Invalid verification link');
      if (onError) {
        onError('Invalid verification link');
      }
    }
  }, [onSuccess, onError, initialize]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            {status === 'loading' && (
              <>
                <Loader2 className="w-12 h-12 mx-auto animate-spin text-primary" />
                <div className="space-y-2">
                  <h2 className="text-xl font-semibold">Verifying...</h2>
                  <p className="text-muted-foreground">{message}</p>
                </div>
              </>
            )}

            {status === 'success' && (
              <>
                <CheckCircle2 className="w-16 h-16 mx-auto text-green-600" />
                <div className="space-y-2">
                  <h2 className="text-xl font-semibold">Success!</h2>
                  <p className="text-muted-foreground">{message}</p>
                </div>
              </>
            )}

            {status === 'error' && (
              <>
                <XCircle className="w-16 h-16 mx-auto text-destructive" />
                <div className="space-y-2">
                  <h2 className="text-xl font-semibold">Verification Failed</h2>
                  <p className="text-muted-foreground">{message}</p>
                </div>
                <Button asChild>
                  <a href="/">Return to Home</a>
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
