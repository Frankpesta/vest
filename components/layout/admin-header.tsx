"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { 
  Search, 
  Bell, 
  Settings, 
  User,
  Moon,
  Sun,
  Monitor
} from "lucide-react"
import { useTheme } from "next-themes"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { useAuthStore } from "@/lib/store"
import Link from "next/link"

export function AdminHeader() {
  const { theme, setTheme } = useTheme()
  const { user } = useAuthStore()
  
  // Get user profile data for avatar
  const userProfile = useQuery(api.users.getCurrentUserProfile, {});
  const profileImageUrl = useQuery(
    api.files.getFileUrl, 
    userProfile?.image ? { fileId: userProfile.image as any } : "skip"
  );
  
  // Get notification count
  const unreadNotifications = useQuery(api.notifications.getUnreadCount, { userId: user?.id || "" })

  const toggleTheme = () => {
    if (theme === "light") {
      setTheme("dark")
    } else if (theme === "dark") {
      setTheme("system")
    } else {
      setTheme("light")
    }
  }

  const getThemeIcon = () => {
    switch (theme) {
      case "light":
        return <Sun className="h-4 w-4" />
      case "dark":
        return <Moon className="h-4 w-4" />
      default:
        return <Monitor className="h-4 w-4" />
    }
  }

  return (
    <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4 flex-1">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
            <Input
              placeholder="Search users, transactions, tickets..."
              className="pl-10 bg-slate-50 dark:bg-slate-700 border-0"
            />
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleTheme}
            className="text-slate-600 dark:text-slate-300"
          >
            {getThemeIcon()}
          </Button>

          {/* Notifications */}
          <Button variant="ghost" size="sm" className="relative" asChild>
            <Link href="/admin/notifications">
              <Bell className="h-5 w-5" />
              {unreadNotifications && unreadNotifications > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center bg-red-500 text-white text-xs">
                  {unreadNotifications > 99 ? "99+" : unreadNotifications}
                </Badge>
              )}
            </Link>
          </Button>

          {/* Settings */}
          <Button variant="ghost" size="sm" asChild>
            <Link href="/admin/system">
              <Settings className="h-5 w-5" />
            </Link>
          </Button>

          {/* Admin Profile */}
          <Button variant="ghost" size="sm" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center overflow-hidden">
              {profileImageUrl ? (
                /* eslint-disable @next/next/no-img-element */
                <img src={profileImageUrl} alt={user?.name || "Admin"} className="h-full w-full object-cover" />
              ) : (
                <User className="h-4 w-4 text-white" />
              )}
            </div>
            <span className="hidden md:block text-sm font-medium">{user?.name || "Admin"}</span>
          </Button>
        </div>
      </div>
    </header>
  )
}