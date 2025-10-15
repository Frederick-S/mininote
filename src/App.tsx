import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import {
  SignUpForm,
  LoginForm,
  AuthGuard,
  ResetPasswordForm,
  ChangePasswordForm,
} from '@/components/auth';
import { useAuthStore } from '@/store';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ChevronDown, KeyRound, LogOut } from 'lucide-react';
import {
  NotebooksPage,
  NotebookCreatePage,
  NotebookEditPage,
  NotebookViewPage,
} from '@/pages';

function App() {
  const [view, setView] = useState<'login' | 'signup'>('login');
  const [signUpEmail, setSignUpEmail] = useState<string>('');
  const [showVerification, setShowVerification] = useState(false);
  const [isPasswordReset, setIsPasswordReset] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const { user, signOut } = useAuthStore();

  // Check if this is a password reset flow
  useEffect(() => {
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const type = hashParams.get('type');
    
    if (type === 'recovery') {
      setIsPasswordReset(true);
    }
  }, []);

  const handleLogout = async () => {
    await signOut();
  };

  const handleSignUpSuccess = (email: string) => {
    setSignUpEmail(email);
    setShowVerification(true);
  };

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-background">
        {/* Header - only show when logged in and not in password reset mode */}
        {user && !isPasswordReset && (
          <header className="border-b">
            <div className="container mx-auto px-4 py-4">
              <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">Web Note App</h1>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="gap-2">
                      <span className="text-sm">{user.email}</span>
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setShowChangePassword(true)}>
                      <KeyRound className="mr-2 h-4 w-4" />
                      Change Password
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                      <LogOut className="mr-2 h-4 w-4" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </header>
        )}

        {/* Main Content */}
        <main className="container mx-auto px-4 py-8">
        {isPasswordReset ? (
          <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
            <ResetPasswordForm
              onSuccess={() => {
                setIsPasswordReset(false);
                setView('login');
                // Clear the hash from URL
                window.history.replaceState(null, '', window.location.pathname);
              }}
            />
          </div>
        ) : (
          <AuthGuard
            fallback={
              <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
                {showVerification ? (
                <Card className="w-full max-w-md">
                  <CardContent className="pt-6">
                    <div className="text-center space-y-4">
                      <div className="w-16 h-16 mx-auto rounded-full bg-green-100 flex items-center justify-center">
                        <svg
                          className="w-10 h-10 text-green-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      </div>
                      <div className="space-y-2">
                        <h2 className="text-2xl font-bold">Check Your Email</h2>
                        <p className="text-muted-foreground">
                          We've sent a verification link to <strong>{signUpEmail}</strong>. Please
                          check your email and click the link to verify your account.
                        </p>
                      </div>
                      <Button
                        variant="link"
                        onClick={() => {
                          setShowVerification(false);
                          setView('login');
                        }}
                      >
                        Return to Login
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : view === 'login' ? (
                <LoginForm
                  onSuccess={() => console.log('Login successful')}
                  onSwitchToSignUp={() => setView('signup')}
                />
              ) : (
                <SignUpForm
                  onSuccess={handleSignUpSuccess}
                  onSwitchToLogin={() => setView('login')}
                />
                )}
              </div>
            }
          >
            {showChangePassword ? (
              <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
                <ChangePasswordForm
                  onSuccess={() => setShowChangePassword(false)}
                  onCancel={() => setShowChangePassword(false)}
                />
              </div>
            ) : (
              <Routes>
                <Route path="/" element={<Navigate to="/notebooks" replace />} />
                <Route path="/notebooks" element={<NotebooksPage />} />
                <Route path="/notebooks/new" element={<NotebookCreatePage />} />
                <Route path="/notebooks/:notebookId" element={<NotebookViewPage />} />
                <Route path="/notebooks/:notebookId/edit" element={<NotebookEditPage />} />
                <Route path="*" element={<Navigate to="/notebooks" replace />} />
              </Routes>
            )}
          </AuthGuard>
        )}
      </main>
    </div>
    </BrowserRouter>
  );
}

export default App;
