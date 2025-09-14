"use client";

import React from 'react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface AuthErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface AuthErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error; resetError: () => void }>;
}

export class AuthErrorBoundary extends React.Component<
  AuthErrorBoundaryProps,
  AuthErrorBoundaryState
> {
  constructor(props: AuthErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): AuthErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Auth Error Boundary caught an error:', error, errorInfo);
  }

  resetError = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return <FallbackComponent error={this.state.error!} resetError={this.resetError} />;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 p-4">
          <div className="max-w-md w-full space-y-6">
            <div className="text-center">
              <AlertTriangle className="mx-auto h-16 w-16 text-red-500 mb-4" />
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                Authentication Error
              </h1>
              <p className="text-slate-600 dark:text-slate-400">
                Something went wrong with the authentication system.
              </p>
            </div>
            
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                {this.state.error?.message || "An unexpected error occurred"}
              </AlertDescription>
            </Alert>

            <div className="space-y-3">
              <Button 
                onClick={this.resetError} 
                className="w-full"
                variant="outline"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Try Again
              </Button>
              
              <Button 
                onClick={() => window.location.href = '/'} 
                className="w-full"
              >
                Go to Homepage
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Hook to handle auth errors in functional components
export const useAuthErrorHandler = () => {
  const handleAuthError = (error: Error) => {
    console.error('Auth error:', error);
    
    // Clear auth state on critical errors
    if (error.message.includes('session') || error.message.includes('token')) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth-storage');
        window.location.href = '/login';
      }
    }
  };

  return { handleAuthError };
};
