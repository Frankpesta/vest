"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/lib/store"
import { getSession } from "@/lib/auth"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  Users, 
  TrendingUp, 
  DollarSign, 
  Wallet, 
  Activity,
  UserPlus,
  CheckCircle,
  AlertTriangle,
  Clock,
  Eye,
  MoreHorizontal,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import Link from "next/link"

export default function AdminPage() {
  const { user, isAuthenticated, isLoading, setLoading } = useAuthStore()
  const router = useRouter()

  // Fetch admin statistics
  const adminStats = useQuery(api.adminStats.getAdminStats, {})
  const userGrowthData = useQuery(api.adminStats.getUserGrowthData, { days: 30 })
  const investmentPerformanceData = useQuery(api.adminStats.getInvestmentPerformanceData, { days: 30 })

  useEffect(() => {
    const checkAuth = async () => {
      setLoading(true)
      try {
        const session = await getSession()
        if (!session?.data?.session) {
          router.push("/login")
          return
        }

        // Check if user is admin (use client store which includes role)
        if (user?.role !== "admin") {
          router.push("/dashboard")
          return
        }
      } catch (error) {
        router.push("/login")
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [router, setLoading])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!isAuthenticated || !user || user.role !== "admin") {
    return null
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatTimestamp = (timestamp: number) => {
    const now = Date.now()
    const diff = now - timestamp
    const minutes = Math.floor(diff / (1000 * 60))
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (minutes < 60) {
      return `${minutes}m ago`
    } else if (hours < 24) {
      return `${hours}h ago`
    } else {
      return `${days}d ago`
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Active</Badge>
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">Pending</Badge>
      case "completed":
        return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">Completed</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="container mx-auto px-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Admin Dashboard</h1>
          <p className="text-slate-600 dark:text-slate-300">Welcome back! Here's what's happening on your platform.</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="bg-green-50 text-green-700">
            <Activity className="mr-1 h-3 w-3" />
            System Online
          </Badge>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Users */}
        <Card className="bg-white dark:bg-slate-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-300">Total Users</CardTitle>
            <Users className="h-4 w-4 text-slate-600 dark:text-slate-300" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">
              {adminStats?.users.total || 0}
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              <span className="text-green-600 dark:text-green-400">+{adminStats?.users.newToday || 0}</span> today
            </p>
          </CardContent>
        </Card>

        {/* Total Investments */}
        <Card className="bg-white dark:bg-slate-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-300">Total Investments</CardTitle>
            <TrendingUp className="h-4 w-4 text-slate-600 dark:text-slate-300" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">
              {formatCurrency(adminStats?.investments.totalAmount || 0)}
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              <span className="text-green-600 dark:text-green-400">+{adminStats?.investments.newToday || 0}</span> today
            </p>
          </CardContent>
        </Card>

        {/* Total Withdrawals */}
        <Card className="bg-white dark:bg-slate-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-300">Total Withdrawals</CardTitle>
            <Wallet className="h-4 w-4 text-slate-600 dark:text-slate-300" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">
              {formatCurrency(adminStats?.transactions.totalWithdrawals || 0)}
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              <span className="text-orange-600 dark:text-orange-400">{adminStats?.transactions.pendingWithdrawals || 0}</span> pending
            </p>
          </CardContent>
        </Card>

        {/* Net Profit */}
        <Card className="bg-white dark:bg-slate-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-300">Net Profit</CardTitle>
            <DollarSign className="h-4 w-4 text-slate-600 dark:text-slate-300" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">
              {formatCurrency(adminStats?.revenue.netProfit || 0)}
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              <span className="text-green-600 dark:text-green-400">
                {adminStats?.investments.successRate ? adminStats.investments.successRate.toFixed(1) : 0}%
              </span> success rate
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Growth Chart */}
        <Card className="bg-white dark:bg-slate-800">
          <CardHeader>
            <CardTitle className="flex items-center">
              <UserPlus className="mr-2 h-5 w-5" />
              User Growth (30 Days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {userGrowthData ? (
              <div className="h-64 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-3xl font-bold text-slate-900 dark:text-white">
                    {userGrowthData.reduce((sum, day) => sum + day.users, 0)}
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-300">New users this month</p>
                </div>
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center">
                <LoadingSpinner size="lg" />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Investment Performance Chart */}
        <Card className="bg-white dark:bg-slate-800">
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="mr-2 h-5 w-5" />
              Investment Performance (30 Days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {investmentPerformanceData ? (
              <div className="h-64 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-3xl font-bold text-slate-900 dark:text-white">
                    {formatCurrency(investmentPerformanceData.reduce((sum, day) => sum + day.amount, 0))}
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-300">Invested this month</p>
                </div>
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center">
                <LoadingSpinner size="lg" />
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Users */}
        <Card className="bg-white dark:bg-slate-800">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center">
                <Users className="mr-2 h-5 w-5" />
                Recent Users
              </span>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/admin/users">
                  <Eye className="h-4 w-4" />
                </Link>
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {adminStats?.users.recent ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {adminStats.users.recent.slice(0, 5).map((user) => (
                    <TableRow key={user._id}>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>
                              {user.userId?.charAt(0)?.toUpperCase() || "U"}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium">User {user.userId?.slice(-6)}</p>
                            <p className="text-xs text-slate-500">ID: {user.userId}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {user.isActive ? (
                          <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Active</Badge>
                        ) : (
                          <Badge variant="outline">Inactive</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-slate-600 dark:text-slate-300">
                        {formatTimestamp(user.createdAt)}
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="flex items-center justify-center py-8">
                <LoadingSpinner size="lg" />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Investments */}
        <Card className="bg-white dark:bg-slate-800">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center">
                <TrendingUp className="mr-2 h-5 w-5" />
                Recent Investments
              </span>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/admin/investments">
                  <Eye className="h-4 w-4" />
                </Link>
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {adminStats?.investments.recent ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {adminStats.investments.recent.slice(0, 5).map((investment) => (
                    <TableRow key={investment._id}>
                      <TableCell>
                        <div>
                          <p className="text-sm font-medium">{formatCurrency(investment.usdValue)}</p>
                          <p className="text-xs text-slate-500">{investment.currency}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(investment.status)}
                      </TableCell>
                      <TableCell className="text-sm text-slate-600 dark:text-slate-300">
                        {formatTimestamp(investment.createdAt)}
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="flex items-center justify-center py-8">
                <LoadingSpinner size="lg" />
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="bg-white dark:bg-slate-800">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="outline" className="h-20 flex flex-col" asChild>
              <Link href="/admin/withdrawals">
                <Wallet className="h-6 w-6 mb-2" />
                <span>Process Withdrawals</span>
                {adminStats?.transactions.pendingWithdrawals && adminStats.transactions.pendingWithdrawals > 0 && (
                  <Badge className="mt-1 bg-red-500 text-white">
                    {adminStats.transactions.pendingWithdrawals}
                  </Badge>
                )}
              </Link>
            </Button>
            
            <Button variant="outline" className="h-20 flex flex-col" asChild>
              <Link href="/admin/support">
                <AlertTriangle className="h-6 w-6 mb-2" />
                <span>Support Tickets</span>
                {/* Support tickets removed - table deleted from schema */}
              </Link>
            </Button>
            
            <Button variant="outline" className="h-20 flex flex-col" asChild>
              <Link href="/admin/transactions">
                <Clock className="h-6 w-6 mb-2" />
                <span>Pending Transactions</span>
                {adminStats?.transactions.pending && adminStats.transactions.pending > 0 && (
                  <Badge className="mt-1 bg-yellow-500 text-white">
                    {adminStats.transactions.pending}
                  </Badge>
                )}
              </Link>
            </Button>
            
            <Button variant="outline" className="h-20 flex flex-col" asChild>
              <Link href="/admin/users">
                <Users className="h-6 w-6 mb-2" />
                <span>Manage Users</span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
