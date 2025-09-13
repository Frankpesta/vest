"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Wallet, ArrowDownLeft, Copy, ExternalLink, AlertCircle, CheckCircle, Loader2, Shield, AlertTriangle } from "lucide-react"
import { useWalletStore, formatBalance } from "@/lib/stores/wallet-store"
import { useQuery, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { getCryptoPrice, formatCurrency } from "@/lib/price-api"
import { toast } from "sonner"
import Link from "next/link"

const supportedTokens = [
  { symbol: "ETH", name: "Ethereum", network: "ethereum", address: "0xB6DAFc65Dad45CBf318452fC7EF5109A3D45CB79" },
  { symbol: "BTC", name: "Bitcoin", network: "bitcoin", address: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh" },
  { symbol: "USDC", name: "USD Coin", network: "ethereum", address: "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8e1" },
  { symbol: "BNB", name: "Binance Coin", network: "bsc", address: "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8e1" },
]

export default function DepositsPage() {
  const [selectedToken, setSelectedToken] = useState("ETH")
  const [depositAmount, setDepositAmount] = useState("")
  const [usdValue, setUsdValue] = useState(0)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isCalculating, setIsCalculating] = useState(false)
  const { connection, isConnecting, connectWallet, sendTransaction, companyWallets } = useWalletStore()
  
  // Convex queries
  const userTransactions = useQuery(api.transactions.getUserTransactions, { type: "deposit", limit: 10 })
  const pendingTransactions = useQuery(api.transactions.getUserPendingTransactions, { type: "deposit", limit: 5 })
  const canPerformActions = useQuery(api.kyc.canPerformFinancialActions, {})
  
  // Convex mutations
  const createDeposit = useMutation(api.transactions.createDeposit)
  
  // Extract wallet data from connection
  const isConnected = connection?.isConnected || false
  const balance = connection?.balance || 0

  const selectedTokenData = supportedTokens.find((token) => token.symbol === selectedToken)

  // Calculate USD value when amount changes
  useEffect(() => {
    const calculateUSD = async () => {
      if (!depositAmount || !selectedToken) return
      
      setIsCalculating(true)
      try {
        const { usdValue: value } = await getCryptoPrice(selectedToken.toLowerCase(), parseFloat(depositAmount))
        setUsdValue(value)
      } catch (error) {
        console.error("Failed to calculate USD value:", error)
        toast.error("Failed to calculate USD value")
      } finally {
        setIsCalculating(false)
      }
    }
    
    calculateUSD()
  }, [depositAmount, selectedToken])

  const handleDeposit = async () => {
    if (!isConnected) {
      toast.error("Please connect your wallet first")
      return
    }

    if (!depositAmount || Number.parseFloat(depositAmount) <= 0) {
      toast.error("Please enter a valid deposit amount")
      return
    }

    if (Number.parseFloat(depositAmount) > balance) {
      toast.error("Insufficient wallet balance")
      return
    }

    setIsProcessing(true)

    try {
      // Get company wallet address for the current chain
      const companyWallet = companyWallets.find(w => w.chain === connection?.chain)?.address
      if (!companyWallet) {
        throw new Error("Company wallet not found for this chain")
      }

      // Send transaction
      const txHash = await sendTransaction(
        companyWallet,
        parseFloat(depositAmount),
        selectedToken
      )

      // Create deposit record
      await createDeposit({
        amount: usdValue,
        currency: selectedToken,
        cryptoAmount: parseFloat(depositAmount),
        usdValue,
        transactionHash: txHash,
        fromAddress: connection?.address || "",
        toAddress: companyWallet,
        chain: connection?.chain || "ethereum",
      })

      toast.success(`Deposit of ${depositAmount} ${selectedToken} submitted successfully! Waiting for admin confirmation.`)
      setDepositAmount("")
      setUsdValue(0)
    } catch (error) {
      console.error("Deposit failed:", error)
      toast.error(`Deposit failed: ${error instanceof Error ? error.message : "Unknown error"}`)
    } finally {
      setIsProcessing(false)
    }
  }

  const copyAddress = (address: string) => {
    navigator.clipboard.writeText(address)
    toast.success("Address copied to clipboard")
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
                  ? "You need to complete KYC verification before making deposits. Please verify your identity to continue."
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
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Deposit Funds</h1>
            <p className="text-slate-600 dark:text-slate-300">Add cryptocurrency to your investment account</p>
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
                  Connect your wallet to make deposits and view your balance
                </p>
              </div>
              <Button onClick={() => connectWallet()} className="ml-auto bg-amber-600 hover:bg-amber-700">
                <Wallet className="mr-2 h-4 w-4" />
                Connect Wallet
              </Button>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Deposit Form */}
        <Card className="bg-white dark:bg-slate-800">
          <CardHeader>
            <CardTitle className="flex items-center">
              <ArrowDownLeft className="mr-2 h-5 w-5 text-green-600" />
              Make Deposit
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label htmlFor="token">Select Token</Label>
              <Select value={selectedToken} onValueChange={setSelectedToken} disabled={!canPerformActions?.canPerform}>
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
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                step="0.01"
                min="0"
                disabled={!canPerformActions?.canPerform}
              />
              {isConnected && (
                <p className="text-xs text-slate-500 mt-1">
                  Available: {formatBalance(balance)} {selectedToken}
                </p>
              )}
            </div>

            <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-4">
              <h4 className="font-medium text-slate-900 dark:text-white mb-2">Deposit Address</h4>
              <div className="flex items-center justify-between bg-white dark:bg-slate-800 rounded border p-3">
                <code className="text-sm text-slate-600 dark:text-slate-300 truncate flex-1">
                  {selectedTokenData?.address}
                </code>
                <div className="flex space-x-2 ml-2">
                  <Button variant="ghost" size="sm" onClick={() => copyAddress(selectedTokenData?.address || "")}>
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <p className="text-xs text-slate-500 mt-2">
                Network: {selectedTokenData?.network} • Only send {selectedToken} to this address
              </p>
            </div>

            <Button
              className="w-full bg-green-600 hover:bg-green-700"
              onClick={handleDeposit}
              disabled={!isConnected || isProcessing || !canPerformActions?.canPerform}
            >
              {isProcessing ? (
                <>Processing...</>
              ) : (
                <>
                  <ArrowDownLeft className="mr-2 h-4 w-4" />
                  Confirm Deposit
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Deposit Instructions */}
        <Card className="bg-white dark:bg-slate-800">
          <CardHeader>
            <CardTitle>Deposit Instructions</CardTitle>
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
                    Choose the cryptocurrency you want to deposit
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-blue-600 dark:text-blue-400 text-sm font-medium">2</span>
                </div>
                <div>
                  <p className="font-medium text-slate-900 dark:text-white">Copy Address</p>
                  <p className="text-sm text-slate-600 dark:text-slate-300">
                    Copy the deposit address for the selected network
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-blue-600 dark:text-blue-400 text-sm font-medium">3</span>
                </div>
                <div>
                  <p className="font-medium text-slate-900 dark:text-white">Send Transaction</p>
                  <p className="text-sm text-slate-600 dark:text-slate-300">
                    Send the desired amount from your external wallet
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="font-medium text-slate-900 dark:text-white">Confirmation</p>
                  <p className="text-sm text-slate-600 dark:text-slate-300">
                    Funds will appear after network confirmation
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
                    <li>• Only send supported tokens to the correct network</li>
                    <li>• Minimum deposit amounts may apply</li>
                    <li>• Deposits typically take 3-15 confirmations</li>
                    <li>• Double-check the address before sending</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Deposits */}
      <Card className="bg-white dark:bg-slate-800">
        <CardHeader>
          <CardTitle>Recent Deposits</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {userTransactions && userTransactions.length > 0 ? (
              userTransactions.map((deposit) => (
                <div
                  key={deposit._id}
                  className="flex items-center justify-between p-4 rounded-lg border border-slate-200 dark:border-slate-700"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                      <ArrowDownLeft className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white">
                        {deposit.amount} {deposit.currency}
                      </p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        {new Date(deposit.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge
                      variant="outline"
                      className={
                        deposit.status === "completed"
                          ? "bg-green-50 text-green-700 border-green-200"
                          : deposit.status === "pending"
                            ? "bg-yellow-50 text-yellow-700 border-yellow-200"
                            : "bg-red-50 text-red-700 border-red-200"
                      }
                    >
                      {deposit.status.charAt(0).toUpperCase() + deposit.status.slice(1)}
                    </Badge>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      {deposit.txHash ? `${deposit.txHash.slice(0, 6)}...${deposit.txHash.slice(-4)}` : "N/A"}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <ArrowDownLeft className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-600 dark:text-slate-300">No deposits yet</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">Your recent deposits will appear here</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}