import { useState } from 'react';
import { useAuthStore } from '../store';
import type { SignUpFormData } from '../types';

interface SignUpFormProps {
  onSwitchToLogin: () => void;
  onSignUpSuccess?: (email: string) => void;
}

export const SignUpForm: React.FC<SignUpFormProps> = ({ onSwitchToLogin, onSignUpSuccess }) => {
  const [formData, setFormData] = useState<SignUpFormData>({
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [validationErrors, setValidationErrors] = useState<Partial<SignUpFormData>>({});

  const { signup, isLoading, error, clearError } = useAuthStore();

  const validatePassword = (password: string): string[] => {
    const errors: string[] = [];
    
    if (password.length < 8) {
      errors.push('At least 8 characters long');
    }
    if (!/[A-Z]/.test(password)) {
      errors.push('At least one uppercase letter');
    }
    if (!/[a-z]/.test(password)) {
      errors.push('At least one lowercase letter');
    }
    if (!/\d/.test(password)) {
      errors.push('At least one number');
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('At least one special character');
    }

    return errors;
  };

  const validateForm = (): boolean => {
    const errors: Partial<SignUpFormData> = {};

    // Email validation
    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (!formData.password) {
      errors.password = 'Password is required';
    } else {
      const passwordErrors = validatePassword(formData.password);
      if (passwordErrors.length > 0) {
        errors.password = 'Password does not meet requirements';
      }
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    if (!validateForm()) {
      return;
    }

    try {
      await signup(formData);
      onSignUpSuccess?.(formData.email);
    } catch (error) {
      // Error is handled by the store
    }
  };

  const handleInputChange = (field: keyof SignUpFormData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
    // Clear validation error when user starts typing
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: undefined }));
    }
    // Clear auth error when user starts typing
    if (error) {
      clearError();
    }
  };

  const passwordErrors = formData.password ? validatePassword(formData.password) : [];

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
        Create Account
      </h1>

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
          <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>
            Email
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={handleInputChange('email')}
            placeholder="Enter your email"
            autoComplete="email"
            style={{
              width: '100%',
              padding: '12px',
              border: validationErrors.email ? '2px solid #dc2626' : '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '16px',
              boxSizing: 'border-box'
            }}
          />
          {validationErrors.email && (
            <div style={{ color: '#dc2626', fontSize: '14px', marginTop: '4px' }}>
              {validationErrors.email}
            </div>
          )}
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>
            Password
          </label>
          <input
            type="password"
            value={formData.password}
            onChange={handleInputChange('password')}
            placeholder="Create a password"
            autoComplete="new-password"
            style={{
              width: '100%',
              padding: '12px',
              border: validationErrors.password ? '2px solid #dc2626' : '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '16px',
              boxSizing: 'border-box'
            }}
          />
          {validationErrors.password && (
            <div style={{ color: '#dc2626', fontSize: '14px', marginTop: '4px' }}>
              {validationErrors.password}
            </div>
          )}
          {formData.password && passwordErrors.length > 0 && (
            <div style={{
              marginTop: '8px',
              padding: '12px',
              backgroundColor: '#f9fafb',
              borderRadius: '6px'
            }}>
              <div style={{ fontSize: '14px', fontWeight: '500', marginBottom: '4px' }}>
                Password must have:
              </div>
              <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '14px' }}>
                {passwordErrors.map((error, index) => (
                  <li key={index} style={{ color: '#dc2626' }}>
                    {error}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>
            Confirm Password
          </label>
          <input
            type="password"
            value={formData.confirmPassword}
            onChange={handleInputChange('confirmPassword')}
            placeholder="Confirm your password"
            autoComplete="new-password"
            style={{
              width: '100%',
              padding: '12px',
              border: validationErrors.confirmPassword ? '2px solid #dc2626' : '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '16px',
              boxSizing: 'border-box'
            }}
          />
          {validationErrors.confirmPassword && (
            <div style={{ color: '#dc2626', fontSize: '14px', marginTop: '4px' }}>
              {validationErrors.confirmPassword}
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
          {isLoading ? 'Creating account...' : 'Create Account'}
        </button>
      </form>

      <p style={{ textAlign: 'center', margin: 0 }}>
        Already have an account?{' '}
        <button
          type="button"
          onClick={onSwitchToLogin}
          style={{
            background: 'none',
            border: 'none',
            color: '#3b82f6',
            cursor: 'pointer',
            textDecoration: 'underline'
          }}
        >
          Sign in here
        </button>
      </p>
    </div>
  );
};