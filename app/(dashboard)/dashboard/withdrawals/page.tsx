"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  ArrowUpRight, 
  Wallet, 
  Copy, 
  ExternalLink, 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  DollarSign,
  TrendingUp,
  PiggyBank,
  Banknote,
  Loader2,
  Shield,
  AlertTriangle
} from "lucide-react"
import { useWalletStore, formatBalance } from "@/lib/stores/wallet-store"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { WithdrawalModal } from "@/components/withdrawal/withdrawal-modal"
import { toast } from "sonner"
import Link from "next/link"

export default function WithdrawalsPage() {
  const { connection } = useWalletStore()
  const [isWithdrawalModalOpen, setIsWithdrawalModalOpen] = useState(false)
  
  // Fetch data
  const userBalances = useQuery(api.userBalances.getUserBalances, {})
  const withdrawalRequests = useQuery(api.withdrawalRequests.getUserWithdrawalRequests, {})
  const canPerformActions = useQuery(api.kyc.canPerformFinancialActions, {})
  
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success("Copied to clipboard")
  }
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">Pending</Badge>
      case "approved":
        return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">Approved</Badge>
      case "processing":
        return <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">Processing</Badge>
      case "completed":
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Completed</Badge>
      case "rejected":
        return <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">Rejected</Badge>
      case "failed":
        return <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">Failed</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }
  
  const getBalanceTypeInfo = (type: string) => {
    switch (type) {
      case "main":
        return { label: "Main Balance", icon: Banknote, color: "text-green-600", bgColor: "bg-green-100 dark:bg-green-900" }
      case "interest":
        return { label: "Interest Balance", icon: TrendingUp, color: "text-purple-600", bgColor: "bg-purple-100 dark:bg-purple-900" }
      case "investment":
        return { label: "Investment Balance", icon: PiggyBank, color: "text-orange-600", bgColor: "bg-orange-100 dark:bg-orange-900" }
      default:
        return { label: type, icon: DollarSign, color: "text-slate-600", bgColor: "bg-slate-100 dark:bg-slate-700" }
    }
  }

  return (
    <div className="space-y-6">
      {/* KYC Warning */}
      {canPerformActions && !canPerformActions.canPerform && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-sm font-medium text-amber-800 dark:text-amber-200">
                KYC Verification Required
              </h3>
              <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                {canPerformActions.reason === "KYC verification required" 
                  ? "You need to complete KYC verification before making withdrawals. Please verify your identity to continue."
                  : canPerformActions.reason
                }
              </p>
              <div className="mt-3">
                <Link 
                  href="/dashboard/kyc"
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-amber-800 bg-amber-100 hover:bg-amber-200 dark:bg-amber-800 dark:text-amber-200 dark:hover:bg-amber-700"
                >
                  <Shield className="mr-2 h-4 w-4" />
                  Complete KYC Verification
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Withdrawals</h1>
            <p className="text-slate-600 dark:text-slate-300">Withdraw funds from your account balances</p>
          </div>
          <Button 
            onClick={() => setIsWithdrawalModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700"
            disabled={!canPerformActions?.canPerform}
          >
            <ArrowUpRight className="mr-2 h-4 w-4" />
            Request Withdrawal
          </Button>
        </div>

        {/* Balance Overview */}
        {userBalances === undefined ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
            <span className="ml-2 text-slate-600 dark:text-slate-300">Loading balances...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-green-600 dark:text-green-400">Main Balance</p>
                    <p className="text-2xl font-bold text-green-700 dark:text-green-300">
                      ${(userBalances?.mainBalance || 0).toLocaleString()}
                    </p>
                  </div>
                  <Banknote className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-purple-600 dark:text-purple-400">Interest Balance</p>
                    <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                      ${(userBalances?.interestBalance || 0).toLocaleString()}
                    </p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-orange-600 dark:text-orange-400">Investment Balance</p>
                    <p className="text-2xl font-bold text-orange-700 dark:text-orange-300">
                      ${(userBalances?.investmentBalance || 0).toLocaleString()}
                    </p>
                  </div>
                  <PiggyBank className="h-8 w-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-emerald-600 dark:text-emerald-400">Total Balance</p>
                    <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">
                      ${(userBalances?.totalBalance || 0).toLocaleString()}
                    </p>
                  </div>
                  <DollarSign className="h-8 w-8 text-emerald-600" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      <Tabs defaultValue="requests" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="requests">Withdrawal Requests</TabsTrigger>
          <TabsTrigger value="history">Transaction History</TabsTrigger>
        </TabsList>

        <TabsContent value="requests" className="space-y-6">
          <Card className="bg-white dark:bg-slate-800">
            <CardHeader>
              <CardTitle>Recent Withdrawal Requests</CardTitle>
            </CardHeader>
            <CardContent>
              {withdrawalRequests === undefined ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
                  <span className="ml-2 text-slate-600 dark:text-slate-300">Loading withdrawal requests...</span>
                </div>
              ) : withdrawalRequests && withdrawalRequests.length > 0 ? (
                <div className="space-y-4">
                  {withdrawalRequests.map((request) => {
                    const balanceInfo = getBalanceTypeInfo(request.balanceType)
                    return (
                      <div
                        key={request._id}
                        className="flex items-center justify-between p-4 rounded-lg border border-slate-200 dark:border-slate-700"
                      >
                        <div className="flex items-center space-x-4">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${balanceInfo.bgColor}`}>
                            <balanceInfo.icon className={`h-5 w-5 ${balanceInfo.color}`} />
                          </div>
                          <div>
                            <p className="font-medium text-slate-900 dark:text-white">
                              ${request.amount.toLocaleString()} from {balanceInfo.label}
                            </p>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                              {request.cryptoAmount.toFixed(6)} {request.currency} • {new Date(request.createdAt).toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          {getStatusBadge(request.status)}
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                            {request.walletAddress.slice(0, 8)}...{request.walletAddress.slice(-6)}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <ArrowUpRight className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                  <p className="text-slate-600 dark:text-slate-300">No withdrawal requests yet</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Your withdrawal requests will appear here</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <Card className="bg-white dark:bg-slate-800">
            <CardHeader>
              <CardTitle>Withdrawal History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Clock className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-600 dark:text-slate-300">Withdrawal history will appear here</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">Completed withdrawals will be shown in this section</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Withdrawal Modal */}
      <WithdrawalModal
        isOpen={isWithdrawalModalOpen}
        onClose={() => setIsWithdrawalModalOpen(false)}
      />
    </div>
  )
}