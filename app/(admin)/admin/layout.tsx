"use client"

import { AdminSidebar } from "@/components/layout/admin-sidebar"
import { AdminHeader } from "@/components/layout/admin-header"
import { WalletInit } from "@/components/wallet/wallet-init"
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuthStore } from "@/lib/store";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Shield, ArrowLeft } from "lucide-react";

// Enhanced loading component
function AdminLoading({ message = "Loading admin panel..." }: { message?: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
      <div className="text-center">
        <LoadingSpinner size="lg" className="mb-4" />
        <p className="text-sm text-slate-600 dark:text-slate-400">{message}</p>
      </div>
    </div>
  );
}

// Enhanced access denied component
function AdminAccessDenied({ userRole, onGoToDashboard }: { 
  userRole?: string; 
  onGoToDashboard: () => void; 
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 p-4">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center">
          <Shield className="mx-auto h-16 w-16 text-red-500 mb-4" />
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
            Access Denied
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            You don't have permission to access the admin panel.
          </p>
        </div>
        
        <Alert variant="destructive">
          <Shield className="h-4 w-4" />
          <AlertDescription>
            Admin access is required to view this content. Please contact an administrator if you need access.
          </AlertDescription>
        </Alert>

        <div className="space-y-3">
          <Button 
            onClick={onGoToDashboard} 
            className="w-full"
            variant="outline"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go to Dashboard
          </Button>
          
          <div className="text-center text-sm text-slate-500 dark:text-slate-400">
            Current role: {userRole || "Unknown"}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuthStore();

  // Handle authentication - middleware already validates admin access
  useEffect(() => {
    // Don't redirect while AuthProvider is still loading
    if (isLoading) {
      return;
    }

    // If AuthProvider finished loading and no user, redirect to login
    if (!isAuthenticated || !user) {
      router.replace("/login?redirect=/admin");
      return;
    }

    // If user exists but not admin (middleware should have caught this, but double-check)
    if (user.role !== "admin") {
      router.replace("/dashboard");
      return;
    }
  }, [isAuthenticated, user, isLoading, router]);

  // Show loading while AuthProvider is initializing
  if (isLoading) {
    return <AdminLoading message="Initializing authentication..." />;
  }

  // Show loading while not authenticated (but AuthProvider finished)
  if (!isAuthenticated || !user) {
    return <AdminLoading message="Redirecting to login..." />;
  }

  // Final check - if somehow we get here without admin role, show access denied
  if (user.role !== "admin") {
    return (
      <AdminAccessDenied 
        userRole={user.role}
        onGoToDashboard={() => router.push("/dashboard")}
      />
    );
  }

  // Render admin layout for authorized users
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <WalletInit />
      <AdminSidebar />
      <div className="lg:ml-64 flex flex-col min-h-screen">
        <AdminHeader />
        <main className="flex-1 py-6 px-6 lg:px-8">{children}</main>
      </div>
    </div>
  )
}


