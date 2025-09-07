"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Wallet, 
  TrendingUp, 
  Clock, 
  DollarSign, 
  PieChart, 
  AlertCircle,
  CheckCircle,
  Pause
} from "lucide-react"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { useWalletStore, formatBalance } from "@/lib/stores/wallet-store"

export function BalanceCards() {
  const { connection } = useWalletStore()
  
  // Fetch user data
  const userProfile = useQuery(api.users.getCurrentUserProfile)
  const investments = useQuery(api.investments.getUserInvestments)
  const transactions = useQuery(api.transactions.getUserTransactions, { limit: 100 })
  
  // Extract wallet data
  const isConnected = connection?.isConnected || false
  const walletBalance = connection?.balance || 0
  
  // Calculate balances
  const totalInvested = investments?.reduce((sum, inv) => 
    inv.status === "active" || inv.status === "completed" ? sum + inv.usdValue : sum, 0
  ) || 0
  
  const pendingInvestments = investments?.filter(inv => inv.status === "pending") || []
  const pendingInvestmentAmount = pendingInvestments.reduce((sum, inv) => sum + inv.usdValue, 0)
  
  const activeInvestments = investments?.filter(inv => inv.status === "active") || []
  const activeInvestmentAmount = activeInvestments.reduce((sum, inv) => sum + inv.usdValue, 0)
  
  const totalReturns = investments?.reduce((sum, inv) => sum + (inv.totalReturn || 0), 0) || 0
  
  const pendingDeposits = transactions?.filter(tx => 
    tx.type === "deposit" && tx.status === "pending"
  ) || []
  const pendingDepositAmount = pendingDeposits.reduce((sum, tx) => sum + tx.usdValue, 0)
  
  const completedDeposits = transactions?.filter(tx => 
    tx.type === "deposit" && tx.status === "completed"
  ) || []
  const walletBalanceFromDeposits = completedDeposits.reduce((sum, tx) => sum + tx.usdValue, 0)
  
  const totalPortfolioValue = totalInvested + totalReturns + walletBalanceFromDeposits

  const balanceCards = [
    {
      title: "Wallet Balance",
      value: isConnected ? `${formatBalance(walletBalance)} ETH` : "Not Connected",
      subtitle: `$${walletBalanceFromDeposits.toLocaleString()} from deposits`,
      icon: Wallet,
      color: "text-blue-600",
      bgColor: "bg-blue-100 dark:bg-blue-900",
      status: isConnected ? "connected" : "disconnected",
    },
    {
      title: "Total Portfolio",
      value: `$${totalPortfolioValue.toLocaleString()}`,
      subtitle: `$${totalInvested.toLocaleString()} invested + $${totalReturns.toLocaleString()} returns`,
      icon: PieChart,
      color: "text-green-600",
      bgColor: "bg-green-100 dark:bg-green-900",
      status: "active",
    },
    {
      title: "Active Investments",
      value: `$${activeInvestmentAmount.toLocaleString()}`,
      subtitle: `${activeInvestments.length} active investments`,
      icon: TrendingUp,
      color: "text-purple-600",
      bgColor: "bg-purple-100 dark:bg-purple-900",
      status: "active",
    },
    {
      title: "Pending Investments",
      value: `$${pendingInvestmentAmount.toLocaleString()}`,
      subtitle: `${pendingInvestments.length} pending approval`,
      icon: Clock,
      color: "text-amber-600",
      bgColor: "bg-amber-100 dark:bg-amber-900",
      status: "pending",
    },
    {
      title: "Pending Deposits",
      value: `$${pendingDepositAmount.toLocaleString()}`,
      subtitle: `${pendingDeposits.length} pending confirmation`,
      icon: DollarSign,
      color: "text-orange-600",
      bgColor: "bg-orange-100 dark:bg-orange-900",
      status: "pending",
    },
    {
      title: "Total Returns",
      value: `$${totalReturns.toLocaleString()}`,
      subtitle: "Earned from investments",
      icon: CheckCircle,
      color: "text-emerald-600",
      bgColor: "bg-emerald-100 dark:bg-emerald-900",
      status: "completed",
    },
  ]

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "connected":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "disconnected":
        return <AlertCircle className="h-4 w-4 text-red-600" />
      case "pending":
        return <Clock className="h-4 w-4 text-amber-600" />
      case "active":
        return <TrendingUp className="h-4 w-4 text-green-600" />
      case "completed":
        return <CheckCircle className="h-4 w-4 text-emerald-600" />
      default:
        return null
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "connected":
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Connected</Badge>
      case "disconnected":
        return <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">Disconnected</Badge>
      case "pending":
        return <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200">Pending</Badge>
      case "active":
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Active</Badge>
      case "completed":
        return <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200">Completed</Badge>
      default:
        return null
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {balanceCards.map((card, index) => (
        <Card key={index} className="bg-white dark:bg-slate-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-300">
              {card.title}
            </CardTitle>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${card.bgColor}`}>
              <card.icon className={`h-5 w-5 ${card.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-2xl font-bold text-slate-900 dark:text-white">
                {card.value}
              </div>
              <div className="flex items-center justify-between">
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  {card.subtitle}
                </p>
                <div className="flex items-center space-x-1">
                  {getStatusIcon(card.status)}
                  {getStatusBadge(card.status)}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
