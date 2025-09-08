"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Bell, Search, Wallet } from "lucide-react"
import { Input } from "@/components/ui/input"
import { ModeToggle } from "@/components/mode-toggle"
import { useNotificationStore } from "@/lib/store"
import { useWalletStore, formatAddress, formatBalance } from "@/lib/stores/wallet-store"
import { WalletConnectButton } from "@/components/wallet/wallet-connect-button"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import Link from "next/link"

export function DashboardHeader() {
  const { connection, isConnecting } = useWalletStore()
  const { unreadCount } = useNotificationStore()
  
  // Get real notification count from backend
  const unreadCountBackend = useQuery(api.notifications.getUnreadNotificationCount, {})
  
  // Extract wallet data from connection
  const isConnected = connection?.isConnected || false
  const balance = connection?.balance || 0
  const address = connection?.address || null
  
  // Use backend count if available, fallback to store count
  const displayUnreadCount = unreadCountBackend !== undefined ? unreadCountBackend : unreadCount

  return (
    <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4 flex-1">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
            <Input
              placeholder="Search investments, transactions..."
              className="pl-10 bg-slate-50 dark:bg-slate-700 border-0"
            />
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {/* Wallet Connection */}
          <WalletConnectButton />

          {/* Notifications */}
          <Button variant="ghost" size="sm" className="relative" asChild>
            <Link href="/dashboard/notifications">
              <Bell className="h-5 w-5" />
              {displayUnreadCount > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center bg-red-500 text-white text-xs">
                  {displayUnreadCount}
                </Badge>
              )}
            </Link>
          </Button>

          <ModeToggle />
        </div>
      </div>
    </header>
  )
}
