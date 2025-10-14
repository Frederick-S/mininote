import { useState, useEffect } from 'react';
import {
  SignUpForm,
  LoginForm,
  AuthGuard,
  ResetPasswordForm,
  ChangePasswordForm,
} from '@/components/auth';
import { useAuthStore } from '@/store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ChevronDown, KeyRound, LogOut } from 'lucide-react';

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
                    {user?.emailVerified ? 'Yes' : 'Pending'}
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
                  <li>✅ Authentication state management with Zustand (Complete!)</li>
                  <li>Database access layer for notebooks and pages</li>
                  <li>Navigation and layout components with tree view</li>
                  <li>Rich markdown editor with TipTap</li>
                </ul>
              </CardContent>
            </Card>
              </div>
            )}
          </AuthGuard>
        )}
      </main>
    </div>
  );
}

export default App;
