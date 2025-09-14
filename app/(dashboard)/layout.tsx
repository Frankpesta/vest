"use client"

import { DashboardSidebar } from "@/components/layout/dashboard-sidebar"
import { DashboardHeader } from "@/components/layout/dashboard-header"
import { WalletInit } from "@/components/wallet/wallet-init"
import { useAuthStore } from "@/lib/store"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { LoadingSpinner } from "@/components/ui/loading-spinner"

// Loading component for dashboard
function DashboardLoading({ message = "Loading dashboard..." }: { message?: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
      <div className="text-center">
        <LoadingSpinner size="lg" className="mb-4" />
        <p className="text-sm text-slate-600 dark:text-slate-400">{message}</p>
      </div>
    </div>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuthStore();
  
  // Debug logging
  useEffect(() => {
    console.log('🔍 DashboardLayout: Auth state check', {
      isAuthenticated,
      hasUser: !!user,
      userEmail: user?.email,
      isLoading
    });
  }, [isAuthenticated, user, isLoading]);

  // Handle authentication
  useEffect(() => {
    // Don't redirect while AuthProvider is still loading
    if (isLoading) {
      console.log('🔍 DashboardLayout: AuthProvider still loading, waiting...');
      return;
    }

    // If AuthProvider finished loading and no user, redirect to login
    if (!isAuthenticated || !user) {
      console.log('🔍 DashboardLayout: No auth after loading complete, redirecting to login');
      router.replace("/login?redirect=/dashboard");
      return;
    }

    console.log('🔍 DashboardLayout: Auth check complete');
  }, [isAuthenticated, user, router, isLoading]);

  // Show loading while AuthProvider is initializing
  if (isLoading) {
    return <DashboardLoading message="Initializing authentication..." />;
  }

  // Show loading while not authenticated (but AuthProvider finished)
  if (!isAuthenticated || !user) {
    return <DashboardLoading message="Redirecting to login..." />;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <WalletInit />

      <DashboardSidebar />
      <div className="lg:ml-64 flex flex-col min-h-screen">
        <DashboardHeader />    
        <main className="flex-1 py-6 px-6 lg:px-8">{children}</main>
      </div>
    </div>
  )
}
