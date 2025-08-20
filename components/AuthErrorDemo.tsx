/**
 * Demo component to test Firebase authentication error handling
 * This can be used for development and testing purposes
 */

import React from 'react';
import { toast } from 'react-toastify';
import { Button } from '../components/ui/Button';
import { getAuthErrorMessage } from '../firebase/utils/errorMessages';

const AuthErrorDemo: React.FC = () => {
  const testErrorMessages = () => {
    // Common signup errors
    const signupErrors = [
      'auth/email-already-in-use',
      'auth/weak-password',
      'auth/invalid-email',
      'auth/password-too-short',
    ];

    // Common login errors
    const loginErrors = [
      'auth/user-not-found',
      'auth/wrong-password',
      'auth/invalid-credential',
      'auth/too-many-requests',
      'auth/user-disabled',
    ];

    // Test signup errors
    signupErrors.forEach((errorCode, index) => {
      setTimeout(() => {
        const message = getAuthErrorMessage(errorCode);
        toast.error(`Signup Error: ${message}`);
      }, index * 1000);
    });

    // Test login errors
    loginErrors.forEach((errorCode, index) => {
      setTimeout(() => {
        const message = getAuthErrorMessage(errorCode);
        toast.error(`Login Error: ${message}`);
      }, (signupErrors.length + index) * 1000);
    });

    // Test success messages
    setTimeout(() => {
      toast.success('🎉 Account created successfully!');
    }, (signupErrors.length + loginErrors.length) * 1000);

    setTimeout(() => {
      toast.success('🎉 Welcome back to FOGSLY!');
    }, (signupErrors.length + loginErrors.length + 1) * 1000);
  };

  return (
    <div className="p-4 space-y-4">
      <h3 className="text-lg font-semibold">Authentication Error Testing</h3>
      <p className="text-sm text-gray-600">
        Click the button below to test different Firebase authentication error messages:
      </p>
      <Button onClick={testErrorMessages} variant="outline">
        Test Error Messages
      </Button>
      
      <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <h4 className="font-medium mb-2">Supported Error Codes:</h4>
        <div className="text-xs space-y-1">
          <div><strong>Signup:</strong> email-already-in-use, weak-password, invalid-email</div>
          <div><strong>Login:</strong> user-not-found, wrong-password, invalid-credential</div>
          <div><strong>Network:</strong> network-request-failed, timeout, too-many-requests</div>
          <div><strong>Account:</strong> user-disabled, requires-recent-login</div>
        </div>
      </div>
    </div>
  );
};

export default AuthErrorDemo;
