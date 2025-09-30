import { useState } from 'react';
import { useAuthStore } from '../store';

interface EmailVerificationFormProps {
  email: string;
  onVerificationSuccess: () => void;
  onBackToSignUp: () => void;
}

export const EmailVerificationForm: React.FC<EmailVerificationFormProps> = ({
  email,
  onVerificationSuccess,
  onBackToSignUp,
}) => {
  const [verificationCode, setVerificationCode] = useState('');
  const [validationError, setValidationError] = useState('');

  const { confirmEmail, resendVerificationCode, isLoading, error, clearError } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setValidationError('');

    if (!verificationCode || verificationCode.length !== 6) {
      setValidationError('Please enter the 6-digit verification code');
      return;
    }

    try {
      await confirmEmail(email, verificationCode);
      onVerificationSuccess();
    } catch (error) {
      // Error is handled by the store
    }
  };

  const handleCodeChange = (value: string) => {
    // Only allow numbers and limit to 6 digits
    const numericValue = value.replace(/\D/g, '').slice(0, 6);
    setVerificationCode(numericValue);
    
    if (validationError) {
      setValidationError('');
    }
    if (error) {
      clearError();
    }
  };

  const handleResendCode = async () => {
    try {
      await resendVerificationCode(email);
      alert('Verification code resent to ' + email);
    } catch (error) {
      // Error is handled by the store
    }
  };

  return (
    <div style={{
      maxWidth: '400px',
      width: '100%',
      backgroundColor: 'white',
      padding: '32px',
      borderRadius: '8px',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      display: 'flex',
      flexDirection: 'column',
      gap: '24px'
    }}>
      <h1 style={{
        fontSize: '24px',
        fontWeight: 'bold',
        textAlign: 'center',
        margin: 0
      }}>
        Verify Your Email
      </h1>

      <div style={{ textAlign: 'center' }}>
        <p style={{ color: '#6b7280', margin: '0 0 8px 0' }}>
          We've sent a 6-digit verification code to:
        </p>
        <p style={{ fontWeight: 'bold', margin: 0 }}>
          {email}
        </p>
      </div>

      {error && (
        <div style={{
          padding: '12px',
          backgroundColor: '#fee2e2',
          border: '1px solid #fecaca',
          borderRadius: '6px',
          color: '#dc2626'
        }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>
          <label style={{ 
            display: 'block', 
            marginBottom: '8px', 
            fontWeight: '500',
            textAlign: 'center'
          }}>
            Enter Verification Code
          </label>
          <input
            type="text"
            value={verificationCode}
            onChange={(e) => handleCodeChange(e.target.value)}
            placeholder="123456"
            maxLength={6}
            style={{
              width: '100%',
              padding: '12px',
              border: validationError ? '2px solid #dc2626' : '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '18px',
              textAlign: 'center',
              letterSpacing: '4px',
              boxSizing: 'border-box'
            }}
          />
          {validationError && (
            <div style={{ 
              color: '#dc2626', 
              fontSize: '14px', 
              marginTop: '4px',
              textAlign: 'center'
            }}>
              {validationError}
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          style={{
            width: '100%',
            padding: '12px',
            backgroundColor: isLoading ? '#9ca3af' : '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontSize: '16px',
            fontWeight: '500',
            cursor: isLoading ? 'not-allowed' : 'pointer'
          }}
        >
          {isLoading ? 'Verifying...' : 'Verify Email'}
        </button>
      </form>

      <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <p style={{ fontSize: '14px', margin: 0 }}>
          Didn't receive the code?{' '}
          <button
            type="button"
            onClick={handleResendCode}
            style={{
              background: 'none',
              border: 'none',
              color: '#3b82f6',
              cursor: 'pointer',
              textDecoration: 'underline'
            }}
          >
            Resend code
          </button>
        </p>
        <p style={{ fontSize: '14px', margin: 0 }}>
          <button
            type="button"
            onClick={onBackToSignUp}
            style={{
              background: 'none',
              border: 'none',
              color: '#3b82f6',
              cursor: 'pointer',
              textDecoration: 'underline'
            }}
          >
            Back to sign up
          </button>
        </p>
      </div>
    </div>
  );
};