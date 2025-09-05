"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Bell, Search, Wallet } from "lucide-react"
import { Input } from "@/components/ui/input"
import { ModeToggle } from "@/components/mode-toggle"
import { useWalletStore, useNotificationStore } from "@/lib/store"

export function DashboardHeader() {
  const { isConnected, address, balance } = useWalletStore()
  const { unreadCount } = useNotificationStore()

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
          {/* Wallet Status */}
          <div className="flex items-center space-x-2">
            <Wallet className="h-4 w-4 text-slate-500" />
            {isConnected ? (
              <div className="flex items-center space-x-2">
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  Connected
                </Badge>
                <span className="text-sm text-slate-600 dark:text-slate-300">{balance.toFixed(4)} ETH</span>
              </div>
            ) : (
              <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                Disconnected
              </Badge>
            )}
          </div>

          {/* Notifications */}
          <Button variant="ghost" size="sm" className="relative">
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center bg-red-500 text-white text-xs">
                {unreadCount}
              </Badge>
            )}
          </Button>

          <ModeToggle />
        </div>
      </div>
    </header>
  )
}
