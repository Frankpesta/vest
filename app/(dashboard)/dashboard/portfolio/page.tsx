"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TrendingUp, DollarSign, PieChart, BarChart3, Activity, ArrowUpRight, ArrowDownLeft, Loader2 } from "lucide-react"
import { Line, Doughnut, Bar } from "react-chartjs-2"
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
  BarElement,
} from "chart.js"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ArcElement, BarElement)

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

export default function PortfolioPage() {
  // Fetch real data from backend
  const userBalances = useQuery(api.userBalances.getUserBalances)
  const investments = useQuery(api.investments.getUserInvestments)
  const transactions = useQuery(api.transactions.getUserTransactions, { limit: 100 })

  // Calculate portfolio summary from real data
  const portfolioSummary = {
    totalValue: userBalances?.totalBalance || 0,
    totalInvested: investments?.reduce((sum, inv) => sum + inv.usdValue, 0) || 0,
  }

  const totalGains = portfolioSummary.totalValue - portfolioSummary.totalInvested
  const returnPercentage = portfolioSummary.totalInvested > 0 ? (totalGains / portfolioSummary.totalInvested) * 100 : 0

  // Calculate allocation data from investments
  const allocationData = {
    labels: [] as string[],
    datasets: [
      {
        data: [] as number[],
        backgroundColor: ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899"],
        borderWidth: 0,
      },
    ],
  }

  // Group investments by category
  if (investments && investments.length > 0) {
    const categoryTotals: { [key: string]: number } = {}
    investments.forEach(inv => {
      if (inv.plan?.category) {
        categoryTotals[inv.plan.category] = (categoryTotals[inv.plan.category] || 0) + inv.usdValue
      }
    })

    allocationData.labels = Object.keys(categoryTotals)
    allocationData.datasets[0].data = Object.values(categoryTotals)
  }

  // Generate performance data from transactions (simplified)
  const performanceData = {
    labels: ["6M ago", "5M ago", "4M ago", "3M ago", "2M ago", "1M ago", "Now"],
    datasets: [
      {
        label: "Portfolio Value",
        data: [0, 0, 0, 0, 0, 0, portfolioSummary.totalValue],
        borderColor: "rgb(59, 130, 246)",
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        tension: 0.4,
        fill: true,
      },
    ],
  }

  // Calculate monthly returns from transactions
  const monthlyReturnsData = {
    labels: ["6M ago", "5M ago", "4M ago", "3M ago", "2M ago", "1M ago"],
    datasets: [
      {
        label: "Monthly Returns (%)",
        data: [0, 0, 0, 0, 0, returnPercentage],
        backgroundColor: (ctx: any) => (ctx.parsed.y >= 0 ? "#10B981" : "#EF4444"),
        borderRadius: 4,
      },
    ],
  }

  const portfolioAnalyticsData = {
    totalValue: portfolioSummary.totalValue,
    totalInvested: portfolioSummary.totalInvested,
    sharpeRatio: 1.25, // Placeholder - would need historical data
    beta: 0.95, // Placeholder
    alpha: 2.3, // Placeholder
    volatility: 18.5, // Placeholder
    maxDrawdown: -12.4, // Placeholder
    diversificationScore: allocationData.labels.length * 15, // Simple calculation based on categories
  }
  return (
    <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Portfolio</h1>
          <p className="text-muted-foreground">Track your investment performance and asset allocation.</p>
        </div>

        {/* Portfolio Summary */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Portfolio Overview</h1>
              <p className="text-slate-600 dark:text-slate-300">Track your investment performance and allocation</p>
            </div>
            <div className="flex space-x-3">
              <Button variant="outline">
                <BarChart3 className="mr-2 h-4 w-4" />
                Export Report
              </Button>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <TrendingUp className="mr-2 h-4 w-4" />
                Rebalance
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <DollarSign className="h-8 w-8 text-blue-600" />
                <Badge className={`${returnPercentage >= 0 ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'}`}>
                  {returnPercentage >= 0 ? '+' : ''}{returnPercentage.toFixed(1)}%
                </Badge>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Total Value</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                ${portfolioSummary.totalValue.toLocaleString()}
              </p>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <TrendingUp className="h-8 w-8 text-green-600" />
                <Badge className={`${totalGains >= 0 ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'}`}>
                  {totalGains >= 0 ? '+' : ''}${totalGains.toLocaleString()}
                </Badge>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Total Gains</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                ${totalGains.toLocaleString()}
              </p>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <Activity className="h-8 w-8 text-purple-600" />
                <Badge variant="outline">
                  {investments?.filter(inv => inv.status === "active").length || 0} Active
                </Badge>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Investments</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                {investments?.length || 0}
              </p>
            </div>

            <div className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <PieChart className="h-8 w-8 text-amber-600" />
                <Badge variant="outline">
                  {allocationData.labels.length} Categories
                </Badge>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Diversification</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                {portfolioAnalyticsData.diversificationScore}%
              </p>
            </div>
          </div>
        </div>

        {/* Portfolio Analytics */}
        <Tabs defaultValue="holdings" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="holdings">Holdings</TabsTrigger>
            <TabsTrigger value="allocation">Asset Allocation</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="goals">Goals</TabsTrigger>
          </TabsList>

          <TabsContent value="holdings" className="space-y-6">
            <Card className="bg-white dark:bg-slate-800">
              <CardHeader>
                <CardTitle>Current Holdings</CardTitle>
              </CardHeader>
              <CardContent>
                {investments === undefined ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
                    <span className="ml-2 text-slate-600 dark:text-slate-300">Loading investments...</span>
                  </div>
                ) : investments && investments.length > 0 ? (
                  <div className="space-y-4">
                    {investments.map((investment) => (
                      <div
                        key={investment._id}
                        className="flex items-center justify-between p-4 rounded-lg border border-slate-200 dark:border-slate-700"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-sm">
                              {investment.plan?.category?.charAt(0) || 'I'}
                            </span>
                          </div>
                          <div>
                            <h3 className="font-semibold text-slate-900 dark:text-white">
                              {investment.plan?.name || 'Investment'}
                            </h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                              {investment.plan?.category || 'Unknown'} • {investment.status}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-slate-900 dark:text-white">
                            ${investment.usdValue.toLocaleString()}
                          </p>
                          <div className="flex items-center space-x-2">
                            {investment.actualReturn && investment.actualReturn > 0 ? (
                              <>
                                <ArrowUpRight className="h-4 w-4 text-green-500" />
                                <span className="text-sm text-green-500">
                                  +${investment.actualReturn.toFixed(2)}
                                </span>
                              </>
                            ) : (
                              <span className="text-sm text-slate-500">No returns yet</span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Activity className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                    <p className="text-slate-600 dark:text-slate-300">No investments yet</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Start investing to see your holdings here</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="allocation" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-white dark:bg-slate-800">
                <CardHeader>
                  <CardTitle>Asset Allocation</CardTitle>
                </CardHeader>
                <CardContent>
                  {allocationData.labels.length > 0 ? (
                    <div className="h-80">
                      <Doughnut
                        data={allocationData}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: {
                            legend: {
                              position: "bottom" as const,
                            },
                          },
                        }}
                      />
                    </div>
                  ) : (
                    <div className="h-80 flex items-center justify-center">
                      <div className="text-center">
                        <PieChart className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                        <p className="text-slate-600 dark:text-slate-300">No allocation data</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Start investing to see your allocation</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="bg-white dark:bg-slate-800">
                <CardHeader>
                  <CardTitle>Allocation Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  {allocationData.labels.length > 0 ? (
                    <div className="space-y-4">
                      {allocationData.labels.map((category, index) => {
                        const value = allocationData.datasets[0].data[index] as number
                        const percentage = portfolioSummary.totalInvested > 0 ? (value / portfolioSummary.totalInvested) * 100 : 0
                        const colors = ["bg-blue-500", "bg-green-500", "bg-amber-500", "bg-red-500", "bg-purple-500", "bg-pink-500"]
                        
                        return (
                          <div
                            key={category}
                            className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-700"
                          >
                            <div className="flex items-center space-x-3">
                              <div className={`w-4 h-4 rounded-full ${colors[index % colors.length]}`} />
                              <span className="font-medium text-slate-900 dark:text-white capitalize">
                                {category.replace('-', ' ')}
                              </span>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold text-slate-900 dark:text-white">
                                ${value.toLocaleString()}
                              </p>
                              <p className="text-sm text-slate-500 dark:text-slate-400">
                                {percentage.toFixed(1)}%
                              </p>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <PieChart className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                      <p className="text-slate-600 dark:text-slate-300">No allocation data</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">Start investing to see your allocation breakdown</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="performance" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-white dark:bg-slate-800">
                <CardHeader>
                  <CardTitle>Portfolio Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <Line data={performanceData} options={chartOptions} />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white dark:bg-slate-800">
                <CardHeader>
                  <CardTitle>Monthly Returns</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <Bar data={monthlyReturnsData} options={chartOptions} />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="text-center py-8">
              <p className="text-muted-foreground">Analytics component coming soon</p>
            </div>
          </TabsContent>

          <TabsContent value="goals" className="space-y-6">
            <div className="text-center py-8">
              <p className="text-muted-foreground">Investment goals component coming soon</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
  )
}
