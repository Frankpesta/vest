"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  BarChart3, 
  TrendingUp,
  TrendingDown,
  Users,
  DollarSign,
  Activity,
  Calendar,
  Download,
  RefreshCw,
  PieChart,
  LineChart,
  Target,
  Zap,
  Shield,
  Clock
} from "lucide-react"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { EmptyState } from "@/components/ui/empty-state"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function AdminAnalyticsPage() {
  const [timeRange, setTimeRange] = useState("30")
  const [selectedMetric, setSelectedMetric] = useState("overview")

  // Fetch data from backend
  const userStats = useQuery(api.users.getUserStats, {})
  const transactionStats = useQuery(api.transactions.getTransactionStats, {})
  const investmentStats = useQuery(api.adminInvestments.getInvestmentStats, {})
  const kycStats = useQuery(api.kyc.getKycStats, {})
  const supportStats = useQuery(api.supportTickets.getSupportTicketStats, {})

  const timeRanges = [
    { value: "7", label: "Last 7 days" },
    { value: "30", label: "Last 30 days" },
    { value: "90", label: "Last 90 days" },
    { value: "365", label: "Last year" },
  ]

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num)
  }

  const calculateGrowthRate = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0
    return ((current - previous) / previous) * 100
  }

  const getGrowthIcon = (rate: number) => {
    if (rate > 0) return <TrendingUp className="h-4 w-4 text-green-500" />
    if (rate < 0) return <TrendingDown className="h-4 w-4 text-red-500" />
    return <Activity className="h-4 w-4 text-gray-500" />
  }

  const getGrowthColor = (rate: number) => {
    if (rate > 0) return "text-green-600"
    if (rate < 0) return "text-red-600"
    return "text-gray-600"
  }

  // Mock data for charts (in a real app, this would come from the backend)
  const mockChartData = {
    users: [
      { date: "2024-01-01", count: 120 },
      { date: "2024-01-02", count: 135 },
      { date: "2024-01-03", count: 142 },
      { date: "2024-01-04", count: 158 },
      { date: "2024-01-05", count: 165 },
      { date: "2024-01-06", count: 172 },
      { date: "2024-01-07", count: 180 },
    ],
    transactions: [
      { date: "2024-01-01", amount: 50000 },
      { date: "2024-01-02", amount: 75000 },
      { date: "2024-01-03", amount: 62000 },
      { date: "2024-01-04", amount: 88000 },
      { date: "2024-01-05", amount: 95000 },
      { date: "2024-01-06", amount: 78000 },
      { date: "2024-01-07", amount: 105000 },
    ],
    investments: [
      { date: "2024-01-01", count: 25, amount: 250000 },
      { date: "2024-01-02", count: 32, amount: 320000 },
      { date: "2024-01-03", count: 28, amount: 280000 },
      { date: "2024-01-04", count: 35, amount: 350000 },
      { date: "2024-01-05", count: 42, amount: 420000 },
      { date: "2024-01-06", count: 38, amount: 380000 },
      { date: "2024-01-07", count: 45, amount: 450000 },
    ],
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Analytics Dashboard</h1>
          <p className="text-slate-600 dark:text-slate-300">Comprehensive platform analytics and insights</p>
        </div>
        <div className="flex items-center space-x-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {timeRanges.map((range) => (
                <SelectItem key={range.value} value={range.value}>
                  {range.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" className="bg-green-50 text-green-700 border-green-200 hover:bg-green-100">
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
          <Button variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Key Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-white dark:bg-slate-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-300">Total Users</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {userStats ? formatNumber(userStats.totalUsers) : "0"}
                </p>
                <div className="flex items-center mt-1">
                  {getGrowthIcon(12.5)}
                  <span className={`text-sm ${getGrowthColor(12.5)}`}>+12.5%</span>
                </div>
              </div>
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-slate-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-300">Total Revenue</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {transactionStats ? formatCurrency(transactionStats.totalAmount) : "$0"}
                </p>
                <div className="flex items-center mt-1">
                  {getGrowthIcon(8.2)}
                  <span className={`text-sm ${getGrowthColor(8.2)}`}>+8.2%</span>
                </div>
              </div>
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-slate-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-300">Active Investments</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {investmentStats ? formatNumber(investmentStats.active) : "0"}
                </p>
                <div className="flex items-center mt-1">
                  {getGrowthIcon(15.3)}
                  <span className={`text-sm ${getGrowthColor(15.3)}`}>+15.3%</span>
                </div>
              </div>
              <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-slate-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-300">KYC Approved</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {kycStats ? formatNumber(kycStats.approved) : "0"}
                </p>
                <div className="flex items-center mt-1">
                  {getGrowthIcon(5.7)}
                  <span className={`text-sm ${getGrowthColor(5.7)}`}>+5.7%</span>
                </div>
              </div>
              <div className="w-10 h-10 bg-cyan-100 dark:bg-cyan-900 rounded-lg flex items-center justify-center">
                <Shield className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics Tabs */}
      <Tabs value={selectedMetric} onValueChange={setSelectedMetric} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="investments">Investments</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* User Growth Chart */}
            <Card className="bg-white dark:bg-slate-800">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <LineChart className="mr-2 h-5 w-5" />
                  User Growth
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-end space-x-2">
                  {mockChartData.users.map((data, index) => (
                    <div key={index} className="flex-1 flex flex-col items-center">
                      <div 
                        className="w-full bg-blue-500 rounded-t"
                        style={{ 
                          height: `${Math.max((data.count / Math.max(...mockChartData.users.map(d => d.count))) * 200, 4)}px` 
                        }}
                      />
                      <span className="text-xs text-slate-500 mt-2">
                        {new Date(data.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Revenue Chart */}
            <Card className="bg-white dark:bg-slate-800">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="mr-2 h-5 w-5" />
                  Revenue Trend
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-end space-x-2">
                  {mockChartData.transactions.map((data, index) => (
                    <div key={index} className="flex-1 flex flex-col items-center">
                      <div 
                        className="w-full bg-green-500 rounded-t"
                        style={{ 
                          height: `${Math.max((data.amount / Math.max(...mockChartData.transactions.map(d => d.amount))) * 200, 4)}px` 
                        }}
                      />
                      <span className="text-xs text-slate-500 mt-2">
                        {new Date(data.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Platform Health Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-white dark:bg-slate-800">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-300">Platform Uptime</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">99.9%</p>
                  </div>
                  <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                    <Zap className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-slate-800">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-300">Avg Response Time</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">120ms</p>
                  </div>
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                    <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-slate-800">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-300">Success Rate</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">98.5%</p>
                  </div>
                  <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                    <Target className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="bg-white dark:bg-slate-800">
              <CardHeader>
                <CardTitle>User Registration Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center">
                  <div className="text-center">
                    <Users className="h-12 w-12 text-slate-400 mx-auto mb-2" />
                    <p className="text-slate-500">User registration chart would go here</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-slate-800">
              <CardHeader>
                <CardTitle>User Demographics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">Verified Users</span>
                    <span className="font-medium">{userStats ? userStats.verifiedUsers : 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">Active Users</span>
                    <span className="font-medium">{userStats ? userStats.activeUsers : 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">Admin Users</span>
                    <span className="font-medium">{userStats ? userStats.adminUsers : 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">Recent Users (30d)</span>
                    <span className="font-medium">{userStats ? userStats.recentUsers : 0}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="transactions" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="bg-white dark:bg-slate-800">
              <CardHeader>
                <CardTitle>Transaction Volume</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center">
                  <div className="text-center">
                    <DollarSign className="h-12 w-12 text-slate-400 mx-auto mb-2" />
                    <p className="text-slate-500">Transaction volume chart would go here</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-slate-800">
              <CardHeader>
                <CardTitle>Transaction Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">Total Transactions</span>
                    <span className="font-medium">{transactionStats ? transactionStats.total : 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">Pending</span>
                    <span className="font-medium">{transactionStats ? transactionStats.pending : 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">Confirmed</span>
                    <span className="font-medium">{transactionStats ? transactionStats.confirmed : 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">Failed</span>
                    <span className="font-medium">{transactionStats ? transactionStats.failed : 0}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="investments" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="bg-white dark:bg-slate-800">
              <CardHeader>
                <CardTitle>Investment Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center">
                  <div className="text-center">
                    <PieChart className="h-12 w-12 text-slate-400 mx-auto mb-2" />
                    <p className="text-slate-500">Investment performance chart would go here</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-slate-800">
              <CardHeader>
                <CardTitle>Investment Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">Total Investments</span>
                    <span className="font-medium">{investmentStats ? investmentStats.total : 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">Active</span>
                    <span className="font-medium">{investmentStats ? investmentStats.active : 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">Completed</span>
                    <span className="font-medium">{investmentStats ? investmentStats.completed : 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">Total Invested</span>
                    <span className="font-medium">{investmentStats ? formatCurrency(investmentStats.totalInvested) : "$0"}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">Total Returns</span>
                    <span className="font-medium">{investmentStats ? formatCurrency(investmentStats.totalReturns) : "$0"}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
