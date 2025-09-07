"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign, Wallet, TrendingUp, Hourglass, Banknote, Coins, Target, PiggyBank } from "lucide-react"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { useWalletStore, formatBalance } from "@/lib/stores/wallet-store"

export function BalanceCards() {
  const { connection } = useWalletStore()
  
  // Fetch user data
  const userProfile = useQuery(api.users.getCurrentUserProfile)
  const userBalances = useQuery(api.userBalances.getUserBalances)
  const investments = useQuery(api.investments.getUserInvestments)
  const transactions = useQuery(api.transactions.getUserTransactions, { limit: 100 })
  
  // Extract wallet data
  const isConnected = connection?.isConnected || false
  const walletBalance = connection?.balance || 0
  
  // Get balances from new system
  const mainBalance = userBalances?.mainBalance || 0
  const interestBalance = userBalances?.interestBalance || 0
  const investmentBalance = userBalances?.investmentBalance || 0
  const totalBalance = userBalances?.totalBalance || 0
  
  // Calculate pending amounts
  const pendingInvestments = investments?.filter(inv => inv.status === "pending") || []
  const pendingInvestmentAmount = pendingInvestments.reduce((sum, inv) => sum + inv.usdValue, 0)
  
  const activeInvestments = investments?.filter(inv => inv.status === "active") || []
  const activeInvestmentAmount = activeInvestments.reduce((sum, inv) => sum + inv.usdValue, 0)
  
  const pendingDeposits = transactions?.filter(tx => 
    tx.type === "deposit" && tx.status === "pending"
  ) || []
  const pendingDepositAmount = pendingDeposits.reduce((sum, tx) => sum + tx.usdValue, 0)

  const balanceCards = [
    {
      title: "Wallet Balance",
      value: isConnected ? `${formatBalance(walletBalance)} ETH` : "Not Connected",
      subtitle: `Connected via ${connection?.chain || "N/A"}`,
      icon: Wallet,
      color: "text-blue-600",
      bgColor: "bg-blue-100 dark:bg-blue-900",
      status: isConnected ? "connected" : "disconnected",
    },
    {
      title: "Main Balance",
      value: `$${mainBalance.toLocaleString()}`,
      subtitle: "From deposits",
      icon: Banknote,
      color: "text-green-600",
      bgColor: "bg-green-100 dark:bg-green-900",
    },
    {
      title: "Interest Balance",
      value: `$${interestBalance.toLocaleString()}`,
      subtitle: "From investment returns",
      icon: TrendingUp,
      color: "text-purple-600",
      bgColor: "bg-purple-100 dark:bg-purple-900",
    },
    {
      title: "Investment Balance",
      value: `$${investmentBalance.toLocaleString()}`,
      subtitle: "From completed investments",
      icon: PiggyBank,
      color: "text-orange-600",
      bgColor: "bg-orange-100 dark:bg-orange-900",
    },
    {
      title: "Total Portfolio",
      value: `$${totalBalance.toLocaleString()}`,
      subtitle: "All balances combined",
      icon: DollarSign,
      color: "text-emerald-600",
      bgColor: "bg-emerald-100 dark:bg-emerald-900",
    },
  ]

  const pendingCards = [
    {
      title: "Pending Deposits",
      value: `$${pendingDepositAmount.toLocaleString()}`,
      subtitle: `${pendingDeposits.length} transactions`,
      icon: Hourglass,
      color: "text-yellow-600",
      bgColor: "bg-yellow-100 dark:bg-yellow-900",
    },
    {
      title: "Pending Investments",
      value: `$${pendingInvestmentAmount.toLocaleString()}`,
      subtitle: `${pendingInvestments.length} investments`,
      icon: Target,
      color: "text-indigo-600",
      bgColor: "bg-indigo-100 dark:bg-indigo-900",
    },
    {
      title: "Active Investments",
      value: `$${activeInvestmentAmount.toLocaleString()}`,
      subtitle: `${activeInvestments.length} investments`,
      icon: Coins,
      color: "text-cyan-600",
      bgColor: "bg-cyan-100 dark:bg-cyan-900",
    },
  ]

  return (
    <div className="space-y-6">
      {/* Main Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {balanceCards.map((card, index) => (
          <Card key={index} className="bg-white dark:bg-slate-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${card.bgColor}`}>
                <card.icon className={`h-4 w-4 ${card.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
              <p className="text-xs text-muted-foreground">{card.subtitle}</p>
              {card.status && (
                <div className={`mt-2 text-xs px-2 py-1 rounded-full ${
                  card.status === "connected" 
                    ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                    : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                }`}>
                  {card.status}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pending/Active Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {pendingCards.map((card, index) => (
          <Card key={index} className="bg-white dark:bg-slate-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${card.bgColor}`}>
                <card.icon className={`h-4 w-4 ${card.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
              <p className="text-xs text-muted-foreground">{card.subtitle}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
