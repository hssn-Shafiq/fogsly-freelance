/**
 * Firebase Auth Error Code to User-Friendly Message Mapping
 */

export interface FirebaseAuthError {
  code: string;
  message: string;
}

/**
 * Maps Firebase Auth error codes to user-friendly messages
 */
export const getAuthErrorMessage = (errorCode: string): string => {
  const errorMessages: Record<string, string> = {
    // Email/Password errors
    'auth/email-already-in-use': 'An account with this email already exists. Please try logging in instead.',
    'auth/invalid-email': 'Please enter a valid email address.',
    'auth/operation-not-allowed': 'Email/password accounts are not enabled. Please contact support.',
    'auth/weak-password': 'Password should be at least 6 characters long.',
    
    // Login errors
    'auth/user-disabled': 'This account has been disabled. Please contact support.',
    'auth/user-not-found': 'No account found with this email address.',
    'auth/wrong-password': 'Incorrect password. Please try again.',
    'auth/invalid-credential': 'Invalid email or password. Please check your credentials and try again.',
    'auth/invalid-login-credentials': 'Invalid email or password. Please check your credentials and try again.',
    
    // Network errors
    'auth/network-request-failed': 'Network error. Please check your internet connection and try again.',
    'auth/timeout': 'Request timed out. Please try again.',
    
    // Rate limiting
    'auth/too-many-requests': 'Too many failed attempts. Please try again later.',
    
    // Password requirements
    'auth/missing-password': 'Password is required.',
    'auth/missing-email': 'Email is required.',
    
    // Other common errors
    'auth/requires-recent-login': 'This operation requires recent authentication. Please log in again.',
    'auth/expired-action-code': 'The action code has expired. Please try again.',
    'auth/invalid-action-code': 'The action code is invalid. Please try again.',
    'auth/missing-action-code': 'The action code is missing. Please try again.',
    
    // Custom validation errors
    'auth/password-too-short': 'Password must be at least 8 characters long.',
    'auth/password-missing-uppercase': 'Password must contain at least one uppercase letter.',
    'auth/password-missing-lowercase': 'Password must contain at least one lowercase letter.',
    'auth/password-missing-number': 'Password must contain at least one number.',
    'auth/name-required': 'Full name is required.',
    'auth/name-too-short': 'Name must be at least 2 characters long.',
  };

  return errorMessages[errorCode] || 'An unexpected error occurred. Please try again.';
};

/**
 * Validates email format
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validates password strength
 */
export const validatePassword = (password: string): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Validates name
 */
export const validateName = (name: string): { isValid: boolean; error?: string } => {
  if (!name || name.trim().length === 0) {
    return { isValid: false, error: 'Full name is required' };
  }
  
  if (name.trim().length < 2) {
    return { isValid: false, error: 'Name must be at least 2 characters long' };
  }
  
  return { isValid: true };
};

/**
 * Comprehensive form validation
 */
export const validateAuthForm = (
  email: string, 
  password: string, 
  name?: string, 
  isSignup?: boolean
): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  // Email validation
  if (!email) {
    errors.push('Email is required');
  } else if (!isValidEmail(email)) {
    errors.push('Please enter a valid email address');
  }
  
  // Password validation
  if (!password) {
    errors.push('Password is required');
  } else if (isSignup) {
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      errors.push(...passwordValidation.errors);
    }
  }
  
  // Name validation for signup
  if (isSignup && name !== undefined) {
    const nameValidation = validateName(name);
    if (!nameValidation.isValid && nameValidation.error) {
      errors.push(nameValidation.error);
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};
