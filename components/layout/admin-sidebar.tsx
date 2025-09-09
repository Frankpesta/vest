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
  LogOut
} from "lucide-react"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"

const adminNavItems = [
  {
    title: "Overview",
    href: "/admin",
    icon: LayoutDashboard,
    description: "Dashboard overview and analytics"
  },
  {
    title: "Users",
    href: "/admin/users",
    icon: Users,
    description: "Manage user accounts and profiles"
  },
  {
    title: "KYC Management",
    href: "/admin/kyc",
    icon: Shield,
    description: "Review and manage KYC submissions"
  },
  {
    title: "Investments",
    href: "/admin/investments",
    icon: TrendingUp,
    description: "Monitor and manage investments"
  },
  {
    title: "Transactions",
    href: "/admin/transactions",
    icon: CreditCard,
    description: "View and manage all transactions"
  },
  {
    title: "Withdrawals",
    href: "/admin/withdrawals",
    icon: Wallet,
    description: "Process withdrawal requests"
  },
  {
    title: "Investment Plans",
    href: "/admin/plans",
    icon: FileText,
    description: "Manage investment plans and categories"
  },
  {
    title: "Support Tickets",
    href: "/admin/support",
    icon: HelpCircle,
    description: "Handle customer support requests"
  },
  {
    title: "Notifications",
    href: "/admin/notifications",
    icon: Bell,
    description: "Manage system notifications"
  },
  {
    title: "Analytics",
    href: "/admin/analytics",
    icon: BarChart3,
    description: "Platform analytics and reports"
  },
  {
    title: "Security",
    href: "/admin/security",
    icon: Shield,
    description: "Security monitoring and settings"
  },
  {
    title: "System",
    href: "/admin/system",
    icon: Settings,
    description: "System settings and configuration"
  }
]

interface AdminSidebarProps {
  className?: string
}

export function AdminSidebar({ className }: AdminSidebarProps) {
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(false)

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

  return (
    <div className={cn(
      "flex h-full flex-col bg-slate-900 text-slate-100 transition-all duration-300",
      isCollapsed ? "w-16" : "w-64",
      className
    )}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-700">
        {!isCollapsed && (
          <div>
            <h2 className="text-lg font-semibold text-white">Admin Panel</h2>
            <p className="text-xs text-slate-400">MultiXcapital</p>
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="text-slate-400 hover:text-white hover:bg-slate-800"
        >
          <LayoutDashboard className="h-4 w-4" />
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-2">
        {adminNavItems.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon
          
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
            <Link key={item.href} href={item.href}>
              <div
                className={cn(
                  "flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  "hover:bg-slate-800 hover:text-white space-y-4",
                  isActive 
                    ? "bg-blue-600 text-white" 
                    : "text-slate-300"
                )}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                {!isCollapsed && (
                  <>
                    <span className="flex-1">{item.title}</span>
                    {badgeCount > 0 && (
                      <Badge 
                        variant="destructive" 
                        className="ml-auto h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center"
                      >
                        {badgeCount > 99 ? "99+" : badgeCount}
                      </Badge>
                    )}
                  </>
                )}
              </div>
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-slate-700 p-2">
        <Link href="/dashboard">
          <div className="flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-300 transition-colors hover:bg-slate-800 hover:text-white">
            <LayoutDashboard className="h-5 w-5 flex-shrink-0" />
            {!isCollapsed && <span>User Dashboard</span>}
          </div>
        </Link>
        
        <div className="mt-2">
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start text-slate-300 hover:text-white hover:bg-slate-800"
          >
            <LogOut className="h-4 w-4 mr-2" />
            {!isCollapsed && "Logout"}
          </Button>
        </div>
      </div>
    </div>
  )
}