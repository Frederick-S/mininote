import { useState } from 'react';
import { LoginForm } from './LoginForm';
import { SignUpForm } from './SignUpForm';
import { EmailVerificationForm } from './EmailVerificationForm';

type AuthView = 'login' | 'signup' | 'verify-email';

interface AuthContainerProps {
  onAuthSuccess?: () => void;
}

export const AuthContainer: React.FC<AuthContainerProps> = ({ onAuthSuccess }) => {
  const [currentView, setCurrentView] = useState<AuthView>('login');
  const [pendingVerificationEmail, setPendingVerificationEmail] = useState('');

  const handleSwitchToSignUp = () => {
    setCurrentView('signup');
  };

  const handleSwitchToLogin = () => {
    setCurrentView('login');
  };

  const handleSignUpSuccess = (email: string) => {
    setPendingVerificationEmail(email);
    setCurrentView('verify-email');
  };

  const handleVerificationSuccess = () => {
    // After successful verification, switch back to login
    setCurrentView('login');
    setPendingVerificationEmail('');
  };

  const handleBackToSignUp = () => {
    setCurrentView('signup');
    setPendingVerificationEmail('');
  };

  const handleLoginSuccess = () => {
    onAuthSuccess?.();
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px',
      backgroundColor: '#f9fafb'
    }}>
      {currentView === 'login' && (
        <LoginForm
          onSwitchToSignUp={handleSwitchToSignUp}
          onLoginSuccess={handleLoginSuccess}
        />
      )}
      
      {currentView === 'signup' && (
        <SignUpForm
          onSwitchToLogin={handleSwitchToLogin}
          onSignUpSuccess={handleSignUpSuccess}
        />
      )}
      
      {currentView === 'verify-email' && (
        <EmailVerificationForm
          email={pendingVerificationEmail}
          onVerificationSuccess={handleVerificationSuccess}
          onBackToSignUp={handleBackToSignUp}
        />
      )}
    </div>
  );
};