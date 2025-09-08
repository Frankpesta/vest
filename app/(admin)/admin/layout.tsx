"use client"

import { AdminSidebar } from "@/components/layout/admin-sidebar"
import { AdminHeader } from "@/components/layout/admin-header"
import { WalletInit } from "@/components/wallet/wallet-init"
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useRouter } from 'next/navigation';
import { useEffect, ReactNode } from 'react';


// Loading component
function AdminLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  );
}

// Unauthorized component (shown briefly before redirect)
function AdminUnauthorized() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-xl font-semibold text-gray-900">Access Denied</h1>
        <p className="text-gray-600">Redirecting...</p>
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
  
  // Single query to check user role - this runs once for the entire admin section
  const userRole = useQuery(api.users.getUserRole);

  useEffect(() => {
    if (userRole !== undefined) {
      if (!userRole || userRole.role !== 'admin' || !userRole.isActive) {
        // Redirect non-admin users
        router.push('/');
        return;
      }
    }
  }, [userRole, router]);

  // Show loading while checking role
  if (userRole === undefined) {
    return <AdminLoading />;
  }

  // Show unauthorized (briefly) before redirect
  if (!userRole || userRole.role !== 'admin' || !userRole.isActive) {
    return <AdminUnauthorized />;
  }
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


