"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ArrowUpRight, Wallet, Copy, ExternalLink, AlertCircle, CheckCircle, Clock, DollarSign } from "lucide-react"
import { useWalletStore } from "@/lib/store"
import { toast } from "sonner"

const supportedTokens = [
  { symbol: "ETH", name: "Ethereum", network: "Ethereum", minWithdrawal: 0.01 },
  { symbol: "BTC", name: "Bitcoin", network: "Bitcoin", minWithdrawal: 0.001 },
  { symbol: "USDC", name: "USD Coin", network: "Ethereum", minWithdrawal: 10 },
  { symbol: "BNB", name: "Binance Coin", network: "BSC", minWithdrawal: 0.1 },
]

const mockWithdrawals = [
  {
    id: 1,
    token: "ETH",
    amount: "1.5",
    status: "Completed",
    date: "2024-12-15 16:30",
    txHash: "0x1234...5678",
    address: "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8e1",
  },
  {
    id: 2,
    token: "USDC",
    amount: "500",
    status: "Pending",
    date: "2024-12-15 14:15",
    txHash: "0x9876...4321",
    address: "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8e1",
  },
  {
    id: 3,
    token: "BTC",
    amount: "0.05",
    status: "Failed",
    date: "2024-12-14 11:20",
    txHash: null,
    address: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
  },
]

export default function WithdrawalsPage() {
  const [selectedToken, setSelectedToken] = useState("ETH")
  const [withdrawalAmount, setWithdrawalAmount] = useState("")
  const [withdrawalAddress, setWithdrawalAddress] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const { isConnected, balance } = useWalletStore()

  const selectedTokenData = supportedTokens.find((token) => token.symbol === selectedToken)

  const handleWithdrawal = async () => {
    if (!isConnected) {
      toast.error("Please connect your wallet first")
      return
    }

    if (!withdrawalAmount || Number.parseFloat(withdrawalAmount) <= 0) {
      toast.error("Please enter a valid withdrawal amount")
      return
    }

    if (Number.parseFloat(withdrawalAmount) < (selectedTokenData?.minWithdrawal || 0)) {
      toast.error(`Minimum withdrawal amount is ${selectedTokenData?.minWithdrawal} ${selectedToken}`)
      return
    }

    if (!withdrawalAddress || withdrawalAddress.length < 10) {
      toast.error("Please enter a valid withdrawal address")
      return
    }

    setIsProcessing(true)

    // Mock withdrawal transaction
    setTimeout(() => {
      toast.success(`Withdrawal of ${withdrawalAmount} ${selectedToken} initiated successfully!`)
      setWithdrawalAmount("")
      setWithdrawalAddress("")
      setIsProcessing(false)
    }, 2000)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Completed":
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Completed</Badge>
      case "Pending":
        return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">Pending</Badge>
      case "Failed":
        return <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">Failed</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Completed":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "Pending":
        return <Clock className="h-4 w-4 text-yellow-600" />
      case "Failed":
        return <AlertCircle className="h-4 w-4 text-red-600" />
      default:
        return <Clock className="h-4 w-4 text-slate-600" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Withdraw Funds</h1>
            <p className="text-slate-600 dark:text-slate-300">Withdraw your cryptocurrency to external wallets</p>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className={isConnected ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}>
              {isConnected ? "Wallet Connected" : "Wallet Disconnected"}
            </Badge>
          </div>
        </div>

        {!isConnected && (
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-3">
              <AlertCircle className="h-5 w-5 text-amber-600" />
              <div>
                <p className="font-medium text-amber-800 dark:text-amber-200">Wallet Not Connected</p>
                <p className="text-sm text-amber-700 dark:text-amber-300">
                  Connect your wallet to make withdrawals and view your balance
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Withdrawal Form */}
        <Card className="bg-white dark:bg-slate-800">
          <CardHeader>
            <CardTitle className="flex items-center">
              <ArrowUpRight className="mr-2 h-5 w-5 text-red-600" />
              Request Withdrawal
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label htmlFor="token">Select Token</Label>
              <Select value={selectedToken} onValueChange={setSelectedToken}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {supportedTokens.map((token) => (
                    <SelectItem key={token.symbol} value={token.symbol}>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">{token.symbol}</span>
                        <span className="text-slate-500">- {token.name}</span>
                        <Badge variant="outline" className="text-xs">
                          {token.network}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                type="number"
                placeholder="0.00"
                value={withdrawalAmount}
                onChange={(e) => setWithdrawalAmount(e.target.value)}
                step="0.01"
                min={selectedTokenData?.minWithdrawal || 0}
              />
              <p className="text-xs text-slate-500 mt-1">
                Min: {selectedTokenData?.minWithdrawal} {selectedToken} | Available: {balance.toFixed(4)} {selectedToken}
              </p>
            </div>

            <div>
              <Label htmlFor="address">Withdrawal Address</Label>
              <Input
                id="address"
                placeholder="Enter wallet address"
                value={withdrawalAddress}
                onChange={(e) => setWithdrawalAddress(e.target.value)}
              />
              <p className="text-xs text-slate-500 mt-1">
                Network: {selectedTokenData?.network} • Double-check the address before submitting
              </p>
            </div>

            <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-4">
              <h4 className="font-medium text-slate-900 dark:text-white mb-2">Withdrawal Summary</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-300">Amount:</span>
                  <span className="font-medium">{withdrawalAmount || "0"} {selectedToken}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-300">Network Fee:</span>
                  <span className="font-medium">~0.001 {selectedToken}</span>
                </div>
                <div className="flex justify-between border-t border-slate-200 dark:border-slate-600 pt-2">
                  <span className="text-slate-600 dark:text-slate-300">You'll receive:</span>
                  <span className="font-medium text-green-600">
                    {withdrawalAmount ? (Number.parseFloat(withdrawalAmount) - 0.001).toFixed(4) : "0"} {selectedToken}
                  </span>
                </div>
              </div>
            </div>

            <Button
              className="w-full bg-red-600 hover:bg-red-700"
              onClick={handleWithdrawal}
              disabled={!isConnected || isProcessing || !withdrawalAmount || !withdrawalAddress}
            >
              {isProcessing ? (
                <>Processing...</>
              ) : (
                <>
                  <ArrowUpRight className="mr-2 h-4 w-4" />
                  Request Withdrawal
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Withdrawal Instructions */}
        <Card className="bg-white dark:bg-slate-800">
          <CardHeader>
            <CardTitle>Withdrawal Instructions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-blue-600 dark:text-blue-400 text-sm font-medium">1</span>
                </div>
                <div>
                  <p className="font-medium text-slate-900 dark:text-white">Select Token</p>
                  <p className="text-sm text-slate-600 dark:text-slate-300">
                    Choose the cryptocurrency you want to withdraw
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-blue-600 dark:text-blue-400 text-sm font-medium">2</span>
                </div>
                <div>
                  <p className="font-medium text-slate-900 dark:text-white">Enter Details</p>
                  <p className="text-sm text-slate-600 dark:text-slate-300">
                    Specify the amount and destination wallet address
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-blue-600 dark:text-blue-400 text-sm font-medium">3</span>
                </div>
                <div>
                  <p className="font-medium text-slate-900 dark:text-white">Review & Confirm</p>
                  <p className="text-sm text-slate-600 dark:text-slate-300">
                    Double-check all details before submitting
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="font-medium text-slate-900 dark:text-white">Processing</p>
                  <p className="text-sm text-slate-600 dark:text-slate-300">
                    Withdrawal will be processed within 24 hours
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
              <div className="flex items-start space-x-2">
                <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-amber-800 dark:text-amber-200">Important Notes</p>
                  <ul className="text-sm text-amber-700 dark:text-amber-300 mt-1 space-y-1">
                    <li>• Withdrawals are processed within 24 hours</li>
                    <li>• Network fees will be deducted from your withdrawal</li>
                    <li>• Double-check the destination address</li>
                    <li>• Withdrawals to incorrect addresses cannot be reversed</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Withdrawals */}
      <Card className="bg-white dark:bg-slate-800">
        <CardHeader>
          <CardTitle>Recent Withdrawals</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockWithdrawals.map((withdrawal) => (
              <div
                key={withdrawal.id}
                className="flex items-center justify-between p-4 rounded-lg border border-slate-200 dark:border-slate-700"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
                    <ArrowUpRight className="h-5 w-5 text-red-600" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white">
                      {withdrawal.amount} {withdrawal.token}
                    </p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{withdrawal.date}</p>
                    <p className="text-xs text-slate-400 dark:text-slate-500 truncate max-w-xs">
                      To: {withdrawal.address}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center space-x-2 mb-1">
                    {getStatusIcon(withdrawal.status)}
                    {getStatusBadge(withdrawal.status)}
                  </div>
                  {withdrawal.txHash && (
                    <p className="text-xs text-slate-500 dark:text-slate-400">{withdrawal.txHash}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
