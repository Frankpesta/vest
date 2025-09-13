"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  LayoutDashboard,
  Users,
  TrendingUp,
  CreditCard,
  FileText,
  Settings,
  Shield,
  Bell,
  HelpCircle,
  BarChart3,
  Wallet,
  UserCheck,
  AlertTriangle,
  Activity,
  Database,
  LogOut,
  Menu,
  X,
  Crown
} from "lucide-react"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { useAuthStore } from "@/lib/store"
import { logout } from '@/lib/auth'
import { useRouter } from 'next/navigation'

const adminNavigation = [
  { name: "Overview", href: "/admin", icon: LayoutDashboard },
  { name: "Users", href: "/admin/users", icon: Users },
  { name: "KYC Management", href: "/admin/kyc", icon: Shield },
  { name: "Investments", href: "/admin/investments", icon: TrendingUp },
  { name: "Transactions", href: "/admin/transactions", icon: CreditCard },
  { name: "Withdrawals", href: "/admin/withdrawals", icon: Wallet },
  { name: "Investment Plans", href: "/admin/plans", icon: FileText },
  { name: "Support Tickets", href: "/admin/support", icon: HelpCircle },
  { name: "Notifications", href: "/admin/notifications", icon: Bell },
  { name: "Analytics", href: "/admin/analytics", icon: BarChart3 },
  { name: "Security", href: "/admin/security", icon: Shield },
  { name: "Blog", href: "/admin/blog", icon: FileText },
  { name: "System", href: "/admin/system", icon: Settings },
]

export function AdminSidebar() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()
  const { user } = useAuthStore()
  const router = useRouter()

  // Get admin statistics for badges
  const pendingWithdrawals = useQuery(api.withdrawalRequests.getAllWithdrawalRequests, {
    status: "pending",
    limit: 10
  })
  
  const pendingTransactions = useQuery(api.transactions.getPendingTransactions, {
    limit: 10
  })
  
  // Support tickets removed - table deleted from schema
  const openTicketsCount = 0

  const pendingWithdrawalsCount = pendingWithdrawals?.length || 0
  const pendingTransactionsCount = pendingTransactions?.length || 0

  const handleLogout = async () => {
    await logout()
    router.push('/')
  }

  return (
    <>
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="fixed inset-0 bg-slate-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        </div>
      )}

      {/* Mobile sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-slate-800 transform transition-transform duration-300 ease-in-out lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
        )}  
      >
        <div className="flex items-center justify-between h-16 px-6 border-b border-slate-200 dark:border-slate-700">
          <Link href="/admin" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-purple-700 rounded-lg flex items-center justify-center">
              <Crown className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-slate-900 dark:text-white">Admin Panel</span>
          </Link>
          <Button variant="ghost" size="sm" className="lg:hidden" onClick={() => setSidebarOpen(false)}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2">
          {adminNavigation.map((item) => {
            const isActive = pathname === item.href
            
            // Get badge count for specific items
            let badgeCount = 0
            if (item.href === "/admin/withdrawals") {
              badgeCount = pendingWithdrawalsCount
            } else if (item.href === "/admin/transactions") {
              badgeCount = pendingTransactionsCount
            } else if (item.href === "/admin/support") {
              badgeCount = openTicketsCount
            }
            
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  isActive
                    ? "bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300"
                    : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700",
                )}
              >
                <div className="flex items-center space-x-3">
                  <item.icon className="h-5 w-5" />
                  <span>{item.name}</span>
                </div>
                {badgeCount > 0 && (
                  <Badge variant="secondary" className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                    {badgeCount > 99 ? "99+" : badgeCount}
                  </Badge>
                )}
              </Link>
            )
          })}
        </nav>

        <div className="border-t border-slate-200 dark:border-slate-700 p-4">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center">
              <span className="text-white font-semibold text-sm">{user?.name?.charAt(0) || "A"}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{user?.name || "Admin"}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user?.email || "admin@example.com"}</p>
            </div>
          </div>
          
          {/* User Dashboard Link */}
          <Link href="/dashboard" className="block mb-2">
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start text-slate-600 dark:text-slate-300"
            >
              <LayoutDashboard className="h-4 w-4 mr-2" />
              User Dashboard
            </Button>
          </Link>
          
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start text-slate-600 dark:text-slate-300"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </div>

      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-40">
        <Button variant="outline" size="sm" onClick={() => setSidebarOpen(true)} className="bg-white dark:bg-slate-800">
          <Menu className="h-5 w-5" />
        </Button>
      </div>
    </>
  )
}