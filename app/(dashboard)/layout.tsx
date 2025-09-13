"use client"

import { DashboardSidebar } from "@/components/layout/dashboard-sidebar"
import { DashboardHeader } from "@/components/layout/dashboard-header"
import { WalletInit } from "@/components/wallet/wallet-init"


export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
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
