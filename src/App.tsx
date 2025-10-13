import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { SignUpForm, LoginForm, AuthGuard } from '@/components/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { User } from '@supabase/supabase-js';

function App() {
  const [view, setView] = useState<'login' | 'signup'>('login');
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Check current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Web Note App</h1>
            {user && (
              <div className="flex items-center gap-4">
                <span className="text-sm text-muted-foreground">{user.email}</span>
                <Button variant="destructive" size="sm" onClick={handleLogout}>
                  Logout
                </Button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <AuthGuard
          fallback={
            <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
              {view === 'login' ? (
                <LoginForm
                  onSuccess={() => console.log('Login successful')}
                  onSwitchToSignUp={() => setView('signup')}
                />
              ) : (
                <SignUpForm
                  onSuccess={() => console.log('Sign up successful')}
                  onSwitchToLogin={() => setView('login')}
                />
              )}
            </div>
          }
        >
          <div className="max-w-4xl mx-auto space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-3xl">Welcome to Web Note App! 🎉</CardTitle>
                <CardDescription className="text-lg">
                  You are now authenticated and ready to start taking notes.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-green-200 bg-green-50">
              <CardHeader>
                <CardTitle className="text-green-900">✅ Authentication System Complete</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-green-800 mb-2">
                  The authentication system is now fully functional with:
                </p>
                <ul className="list-disc list-inside text-sm text-green-800 space-y-1 ml-4">
                  <li>Sign up with email/password validation</li>
                  <li>Login with error handling</li>
                  <li>Email verification flow</li>
                  <li>Password reset functionality</li>
                  <li>Route protection with AuthGuard</li>
                  <li>Session management and persistence</li>
                  <li>Built with shadcn/ui components</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-blue-200 bg-blue-50">
              <CardHeader>
                <CardTitle className="text-blue-900">📝 User Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-blue-800 space-y-1">
                  <p>
                    <strong>Email:</strong> {user?.email}
                  </p>
                  <p>
                    <strong>User ID:</strong> {user?.id}
                  </p>
                  <p>
                    <strong>Email Verified:</strong>{' '}
                    {user?.email_confirmed_at ? 'Yes' : 'Pending'}
                  </p>
                  <p>
                    <strong>Created:</strong>{' '}
                    {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-purple-200 bg-purple-50">
              <CardHeader>
                <CardTitle className="text-purple-900">🚀 Next Steps</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-purple-800 mb-2">
                  The authentication foundation is ready. Next tasks will implement:
                </p>
                <ul className="list-disc list-inside text-sm text-purple-800 space-y-1 ml-4">
                  <li>Authentication state management with Zustand</li>
                  <li>Database access layer for notebooks and pages</li>
                  <li>Navigation and layout components with tree view</li>
                  <li>Rich markdown editor with TipTap</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </AuthGuard>
      </main>
    </div>
  );
}

export default App;
