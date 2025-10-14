import { useEffect } from 'react';
import { useAuthStore } from '@/store';
import { Loader2 } from 'lucide-react';

interface AuthGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onUnauthenticated?: () => void;
}

export function AuthGuard({ children, fallback, onUnauthenticated }: AuthGuardProps) {
  const { user, isLoading, isInitialized, isAuthenticated, initialize } = useAuthStore();

  useEffect(() => {
    // Initialize auth state on mount
    if (!isInitialized) {
      initialize();
    }
  }, [isInitialized, initialize]);

  useEffect(() => {
    // Call onUnauthenticated when user is not authenticated
    if (isInitialized && !isAuthenticated && onUnauthenticated) {
      onUnauthenticated();
    }
  }, [isInitialized, isAuthenticated, onUnauthenticated]);

  if (!isInitialized || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 mx-auto animate-spin text-primary" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user || !isAuthenticated) {
    return fallback ? <>{fallback}</> : null;
  }

  return <>{children}</>;
}
