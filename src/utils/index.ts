// Authentication utilities
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password: string): { isValid: boolean; errors: string[] } => {
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

  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const getAuthErrorMessage = (errorCode: string): string => {
  const errorMessages: Record<string, string> = {
    'UserNotFoundException': 'No account found with this email address.',
    'NotAuthorizedException': 'Incorrect email or password.',
    'UserNotConfirmedException': 'Please verify your email address before signing in.',
    'UsernameExistsException': 'An account with this email already exists.',
    'InvalidPasswordException': 'Password does not meet requirements.',
    'CodeMismatchException': 'Invalid verification code. Please try again.',
    'ExpiredCodeException': 'Verification code has expired. Please request a new one.',
    'LimitExceededException': 'Too many attempts. Please try again later.',
    'TooManyRequestsException': 'Too many requests. Please try again later.',
  };

  return errorMessages[errorCode] || 'An unexpected error occurred. Please try again.';
};