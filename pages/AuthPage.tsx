import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Label } from "../components/ui/Label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/ui/Card";
import { User, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { type Route } from '../types';
import { signUp, signIn } from '../firebase/services/authService';
import { setupNewUser } from '../firebase/services/userService';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../styles/toast.css';
type AuthMode = 'login' | 'signup';

interface AuthPageProps {
  navigate: (route: Route) => void;
  onLogin: () => void;
}

export default function AuthPage({ navigate, onLogin }: AuthPageProps) {
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Client-side validation
  const validateForm = () => {
    if (mode === 'signup') {
      if (!name.trim() || name.trim().length < 2) {
        toast.error('Please enter a valid name (at least 2 characters)');
        return false;
      }
    }

    if (!email.trim()) {
      toast.error('Email is required');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error('Please enter a valid email address');
      return false;
    }

    if (!password) {
      toast.error('Password is required');
      return false;
    }

    if (mode === 'signup' && password.length < 8) {
      toast.error('Password must be at least 8 characters long');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Client-side validation first
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);

    try {
      if (mode === 'signup') {
        // Sign up new user
        const result = await signUp({ name, email, password });
        
        if (result.success && result.user) {
          // Setup user data and profile in Firestore
          await setupNewUser(result.user.uid, email, name);
          
          toast.success('🎉 Account created successfully! Please log in to continue.');
          setMode('login');
          setPassword(''); // Clear password for security
        } else {
          toast.error(result.error || 'Failed to create account');
        }
      } else {
        // Sign in existing user
        const result = await signIn({ email, password });
        
        if (result.success && result.user) {
          toast.success('🎉 Welcome back to FOGSLY!');
          onLogin(); // Set login state in App
          navigate('home'); // Redirect to home
        } else {
          toast.error(result.error || 'Failed to log in');
        }
      }
    } catch (error: any) {
      console.error('Auth error:', error);
      toast.error('❌ An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // const handleGuestLogin = () => {
  //   setIsLoading(true);
  //   // Simulate guest login
  //   setTimeout(() => {
  //       console.log('Continuing as guest');
  //       setIsLoading(false);
  //       onLogin();
  //       navigate('home');
  //   }, 1000);
  // };
  
  const switchMode = (newMode: AuthMode) => {
    setMode(newMode);
    setPassword(''); // Clear password for security
    // Dismiss any existing toasts
    toast.dismiss();
  };
  
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[--color-bg-secondary] p-4 pt-24">
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
        toastClassName="text-sm"
        aria-label="Notifications"
      />
      <div className="absolute top-6 left-6">
            <button
              onClick={() => navigate('home')}
              className="flex items-center gap-2"
              aria-label="Go to homepage"
            >
              <span className="text-xl font-bold text-[--color-primary]">FOGSLY</span>
            </button>
       </div>
      <motion.div
        {...{
          variants: cardVariants,
          initial: "hidden",
          animate: "visible",
        }}
        className="w-full max-w-md"
      >
        <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">
                {mode === 'login' ? 'Welcome Back' : 'Create an Account'}
              </CardTitle>
              <CardDescription>
                {mode === 'login' 
                  ? 'Log in to access your FOGSLY account.' 
                  : 'Get started with your free account today.'}
              </CardDescription>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {mode === 'signup' && (
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[--color-text-secondary]/70" />
                      <Input
                        id="name"
                        type="text"
                        placeholder="John Doe"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                )}
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[--color-text-secondary]/70" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[--color-text-secondary]/70" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder={mode === 'login' ? "Enter your password" : "Create a password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 pr-10"
                      required
                      minLength={mode === 'signup' ? 8 : undefined}
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-[--color-text-secondary]/70" />
                      ) : (
                        <Eye className="h-4 w-4 text-[--color-text-secondary]/70" />
                      )}
                    </button>
                  </div>
                  {mode === 'signup' && (
                    <p className="text-xs text-[--color-text-secondary]">
                      Password must be at least 8 characters.
                    </p>
                  )}
                </div>
                
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <span className="animate-pulse">Processing...</span>
                  ) : mode === 'login' ? (
                    'Log In'
                  ) : (
                    'Create Account'
                  )}
                </Button>
              </form>

              <div className="relative mt-4">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-[--color-border]" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-[--color-card] px-2 text-[--color-text-secondary]">
                    Or
                    </span>
                </div>
              </div>

              {/* <Button 
                variant="outline" 
                className="w-full"
                onClick={handleGuestLogin}
                disabled={isLoading}
              >
                Continue as Guest
              </Button> */}
            </CardContent>

            <CardFooter className="flex flex-col space-y-2 text-center pt-1">
              {mode === 'login' ? (
                <>
                  <Button variant="link" className="text-sm" onClick={() => switchMode('signup')}>
                    Don't have an account? <span className="font-semibold ml-1">Sign up</span>
                  </Button>
                  <Button variant="link" className="text-sm -mt-2">
                    Forgot password?
                  </Button>
                </>
              ) : (
                <Button variant="link" className="text-sm" onClick={() => switchMode('login')}>
                  Already have an account? <span className="font-semibold ml-1">Log in</span>
                </Button>
              )}
            </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}