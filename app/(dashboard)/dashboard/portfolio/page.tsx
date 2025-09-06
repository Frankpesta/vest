"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TrendingUp, DollarSign, PieChart, BarChart3, Activity, ArrowUpRight, ArrowDownLeft } from "lucide-react"
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
import { mockPortfolio } from "@/mocks/data"

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ArcElement, BarElement)

const portfolioSummary = {
  totalValue: 85420,
  totalInvested: 70000,
}

const performanceData = {
  labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
  datasets: [
    {
      label: "Portfolio Value",
      data: [45000, 52000, 48000, 61000, 58000, 67000, 72000, 69000, 75000, 78000, 82000, 85000],
      borderColor: "rgb(59, 130, 246)",
      backgroundColor: "rgba(59, 130, 246, 0.1)",
      tension: 0.4,
      fill: true,
    },
  ],
}

const allocationData = {
  labels: ["Crypto Staking", "DeFi Protocols", "Real Estate", "REITs", "Forex Trading", "NFTs"],
  datasets: [
    {
      data: [25, 15, 20, 15, 10, 15],
      backgroundColor: ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899"],
      borderWidth: 0,
    },
  ],
}

const monthlyReturnsData = {
  labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
  datasets: [
    {
      label: "Monthly Returns (%)",
      data: [8.2, -2.1, 15.6, 3.4, 12.8, 7.9],
      backgroundColor: (ctx: any) => (ctx.parsed.y >= 0 ? "#10B981" : "#EF4444"),
      borderRadius: 4,
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

const portfolioAnalyticsData = {
  totalValue: portfolioSummary.totalValue,
  totalInvested: portfolioSummary.totalInvested,
  sharpeRatio: 1.25,
  beta: 0.95,
  alpha: 2.3,
  volatility: 18.5,
  maxDrawdown: -12.4,
  diversificationScore: 78,
}

export default function PortfolioPage() {
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
                <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">+15.2%</Badge>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Total Value</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                ${portfolioSummary.totalValue.toLocaleString()}
              </p>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <TrendingUp className="h-8 w-8 text-green-600" />
                <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">+$15,420</Badge>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Total Gains</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                ${(portfolioSummary.totalValue - portfolioSummary.totalInvested).toLocaleString()}
              </p>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <Activity className="h-8 w-8 text-purple-600" />
                <Badge variant="outline">8 Active</Badge>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Investments</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">8</p>
            </div>

            <div className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <PieChart className="h-8 w-8 text-amber-600" />
                <Badge variant="outline">6 Categories</Badge>
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
                <div className="space-y-4">
                  {mockPortfolio.allocations.map((holding: any) => (
                    <div
                      key={holding.id}
                      className="flex items-center justify-between p-4 rounded-lg border border-slate-200 dark:border-slate-700"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                          <span className="text-white font-bold text-sm">{holding.category.charAt(0)}</span>
                        </div>
                        <div>
                          <h3 className="font-semibold text-slate-900 dark:text-white">{holding.category}</h3>
                          <p className="text-sm text-slate-500 dark:text-slate-400">{holding.percentage}%</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-slate-900 dark:text-white">
                          ${holding.value.toLocaleString()}
                        </p>
                        <div className="flex items-center space-x-2">
                          <ArrowUpRight className="h-4 w-4 text-green-500" />
                          <span className="text-sm text-green-500">
                            +{holding.percentage}%
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
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
                </CardContent>
              </Card>

              <Card className="bg-white dark:bg-slate-800">
                <CardHeader>
                  <CardTitle>Allocation Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { name: "Crypto Staking", percentage: 25, value: "$21,355", color: "bg-blue-500" },
                      { name: "Real Estate", percentage: 20, value: "$17,084", color: "bg-amber-500" },
                      { name: "DeFi Protocols", percentage: 15, value: "$12,813", color: "bg-green-500" },
                      { name: "REITs", percentage: 15, value: "$12,813", color: "bg-red-500" },
                      { name: "NFTs", percentage: 15, value: "$12,813", color: "bg-pink-500" },
                      { name: "Forex Trading", percentage: 10, value: "$8,542", color: "bg-purple-500" },
                    ].map((item) => (
                      <div
                        key={item.name}
                        className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-700"
                      >
                        <div className="flex items-center space-x-3">
                          <div className={`w-4 h-4 rounded-full ${item.color}`} />
                          <span className="font-medium text-slate-900 dark:text-white">{item.name}</span>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-slate-900 dark:text-white">{item.value}</p>
                          <p className="text-sm text-slate-500 dark:text-slate-400">{item.percentage}%</p>
                        </div>
                      </div>
                    ))}
                  </div>
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
