"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, PieChart, ArrowUpRight, ArrowDownLeft, Activity, Wallet } from "lucide-react"
import { Line, Doughnut } from "react-chartjs-2"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js"
import { useAuthStore } from "@/lib/store"
import { useWalletStore, formatBalance } from "@/lib/stores/wallet-store"
import { mockTransactions } from "@/mocks/data"
import { BalanceCards } from "@/components/dashboard/balance-cards-new"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ArcElement)

export default function DashboardPage() {
  const { user } = useAuthStore()
  const { connection, isConnecting } = useWalletStore()
  
  // Extract wallet data from connection
  const isConnected = connection?.isConnected || false
  const balance = connection?.balance || 0
  const walletAddress = connection?.address || null
  
  // Fetch data from backend
  const investments = useQuery(api.investments.getUserInvestments)
  const transactions = useQuery(api.transactions.getUserTransactions, { limit: 10 })

  const portfolioChartData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    datasets: [
      {
        label: "Portfolio Value",
        data: [45000, 52000, 48000, 61000, 58000, 67000],
        borderColor: "rgb(59, 130, 246)",
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        tension: 0.4,
      },
    ],
  }

  const allocationChartData = {
    labels: ["Crypto", "Real Estate", "REITs", "Forex", "Other"],
    datasets: [
      {
        data: [40, 25, 20, 10, 5],
        backgroundColor: ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6"],
        borderWidth: 0,
      },
    ],
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
      },
      y: {
        grid: {
          color: "rgba(0, 0, 0, 0.1)",
        },
      },
    },
  }

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom" as const,
      },
    },
  }

  return (
    <div className="container mx-auto px-4 space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">Welcome back, {user?.name || "Investor"}!</h1>
        <p className="text-blue-100 mb-6">Here's your investment portfolio overview</p>

        {/* Balance Cards */}
        <BalanceCards />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-white dark:bg-slate-800">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Portfolio Performance
              <Badge variant="outline" className="bg-green-50 text-green-700">
                +15.2%
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <Line data={portfolioChartData} options={chartOptions} />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-slate-800">
          <CardHeader>
            <CardTitle>Asset Allocation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <Doughnut data={allocationChartData} options={doughnutOptions} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="bg-white dark:bg-slate-800">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full justify-start bg-blue-600 hover:bg-blue-700">
              <ArrowDownLeft className="mr-2 h-4 w-4" />
              Make Deposit
            </Button>
            <Button variant="outline" className="w-full justify-start bg-transparent">
              <TrendingUp className="mr-2 h-4 w-4" />
              Browse Investments
            </Button>
            <Button variant="outline" className="w-full justify-start bg-transparent">
              <ArrowUpRight className="mr-2 h-4 w-4" />
              Request Withdrawal
            </Button>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 bg-white dark:bg-slate-800">
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {transactions && transactions.length > 0 ? (
                transactions.slice(0, 5).map((transaction) => (
                  <div
                    key={transaction._id}
                    className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-700"
                  >
                    <div className="flex items-center space-x-3">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          transaction.type === "deposit"
                            ? "bg-green-100 text-green-600"
                            : transaction.type === "withdrawal"
                              ? "bg-red-100 text-red-600"
                              : transaction.type === "return"
                                ? "bg-emerald-100 text-emerald-600"
                                : "bg-blue-100 text-blue-600"
                        }`}
                      >
                        {transaction.type === "deposit" ? (
                          <ArrowDownLeft className="h-5 w-5" />
                        ) : transaction.type === "withdrawal" ? (
                          <ArrowUpRight className="h-5 w-5" />
                        ) : transaction.type === "return" ? (
                          <TrendingUp className="h-5 w-5" />
                        ) : (
                          <Activity className="h-5 w-5" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-slate-900 dark:text-white">
                          {transaction.type === "deposit" 
                            ? "Deposit" 
                            : transaction.type === "withdrawal" 
                            ? "Withdrawal" 
                            : transaction.type === "return"
                            ? "Investment Return"
                            : "Investment"}
                        </p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          {new Date(transaction.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p
                        className={`font-semibold ${
                          transaction.type === "deposit" || transaction.type === "return"
                            ? "text-green-600"
                            : transaction.type === "withdrawal"
                              ? "text-red-600"
                              : "text-blue-600"
                        }`}
                      >
                        {transaction.type === "withdrawal" ? "-" : "+"}${transaction.usdValue.toLocaleString()}
                      </p>
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${
                          transaction.status === "completed" 
                            ? "bg-green-100 text-green-800" 
                            : transaction.status === "pending"
                            ? "bg-amber-100 text-amber-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {transaction.status}
                      </Badge>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <Activity className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                  <p className="text-slate-600 dark:text-slate-300">No transactions yet</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Start by making a deposit or investment</p>
                </div>
              )}
            </div>
            <Button variant="ghost" className="w-full mt-4">
              View All Transactions
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
