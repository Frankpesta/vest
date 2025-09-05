"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Bell, Search, Shield } from "lucide-react"
import { Input } from "@/components/ui/input"
import { useNotificationStore } from "@/lib/store"
import { ModeToggle } from "../mode-toggle"

export function AdminHeader() {
  const { unreadCount } = useNotificationStore()

  return (
    <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4 flex-1">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
            <Input
              placeholder="Search users, transactions, content..."
              className="pl-10 bg-slate-50 dark:bg-slate-700 border-0"
            />
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {/* Admin Status */}
          <div className="flex items-center space-x-2">
            <Shield className="h-4 w-4 text-purple-500" />
            <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
              Admin Access
            </Badge>
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
