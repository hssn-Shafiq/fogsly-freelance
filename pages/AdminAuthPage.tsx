import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Label } from "../components/ui/Label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/Card";
import { Lock, Mail, Eye, EyeOff, Shield } from "lucide-react";
import { adminSignIn } from '../firebase/services/adminAuthService';
import { toast, ToastContainer } from 'react-toastify';
import { AdminUser } from '../firebase/types/admin';
import 'react-toastify/dist/ReactToastify.css';

interface AdminAuthPageProps {
  onAdminLogin: (admin: AdminUser) => void;
  goBack: () => void;
}

export default function AdminAuthPage({ onAdminLogin, goBack }: AdminAuthPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = () => {
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

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);

    try {
      const result = await adminSignIn(email, password);
      
      if (result.success && result.admin) {
        toast.success('🎉 Welcome to Admin Panel!');
        onAdminLogin(result.admin);
      } else {
        toast.error(result.error || 'Admin login failed');
      }
    } catch (error: any) {
      console.error('Admin auth error:', error);
      toast.error('❌ An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[--color-bg-secondary] p-4">
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        closeOnClick
        draggable
        pauseOnHover
        theme="colored"
        aria-label="Notifications"
      />
      
      <div className="absolute top-6 left-6">
        <button
          onClick={goBack}
          className="flex items-center gap-2 text-[--color-text-secondary] hover:text-[--color-primary] transition-colors"
          aria-label="Go back"
        >
          ← Back to Website
        </button>
      </div>

      <motion.div
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-md"
      >
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-[--color-primary]/10 rounded-full flex items-center justify-center mb-4">
              <Shield className="w-8 h-8 text-[--color-primary]" />
            </div>
            <CardTitle className="text-2xl">Admin Access</CardTitle>
            <CardDescription>
              Sign in to access the FOGSLY admin panel
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[--color-text-secondary]/70" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@fogsly.com"
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
                    placeholder="Enter admin password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10"
                    required
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
              </div>
              
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <span className="animate-pulse">Authenticating...</span>
                ) : (
                  <>
                    <Shield className="w-4 h-4 mr-2" />
                    Access Admin Panel
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 p-4 bg-[--color-bg-tertiary] rounded-lg">
              <h4 className="font-medium text-sm mb-2 text-[--color-text-primary]">Admin Access Required</h4>
              <p className="text-xs text-[--color-text-secondary]">
                Only authorized administrators can access this panel. If you need admin access, 
                please contact your system administrator.
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
