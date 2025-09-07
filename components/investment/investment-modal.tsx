"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { 
  AlertCircle, 
  CheckCircle, 
  Loader2, 
  TrendingUp, 
  Wallet,
  ExternalLink,
  Copy
} from "lucide-react"
import { useWalletStore, formatBalance } from "@/lib/stores/wallet-store"
import { useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { getCryptoPrice, formatCurrency, formatCryptoAmount } from "@/lib/price-api"
import { toast } from "sonner"

interface InvestmentModalProps {
  isOpen: boolean
  onClose: () => void
  plan: any
}

export function InvestmentModal({ isOpen, onClose, plan }: InvestmentModalProps) {
  const { connection, sendTransaction, companyWallets } = useWalletStore()
  const [amount, setAmount] = useState("")
  const [usdValue, setUsdValue] = useState(0)
  const [isCalculating, setIsCalculating] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [step, setStep] = useState(1) // 1: Amount, 2: Confirmation, 3: Transaction, 4: Success
  
  const createInvestment = useMutation(api.investments.createInvestment)
  
  // Calculate USD value when amount changes
  useEffect(() => {
    const calculateUSD = async () => {
      if (!amount || !connection?.chain) return
      
      setIsCalculating(true)
      try {
        const { usdValue: value } = await getCryptoPrice("eth", parseFloat(amount))
        setUsdValue(value)
      } catch (error) {
        console.error("Failed to calculate USD value:", error)
        toast.error("Failed to calculate USD value")
      } finally {
        setIsCalculating(false)
      }
    }
    
    calculateUSD()
  }, [amount, connection?.chain])
  
  const handleAmountChange = (value: string) => {
    setAmount(value)
  }
  
  const handleInvest = async () => {
    if (!connection?.isConnected) {
      toast.error("Please connect your wallet first")
      return
    }
    
    if (!amount || parseFloat(amount) <= 0) {
      toast.error("Please enter a valid amount")
      return
    }
    
    if (usdValue < plan.minInvestment || usdValue > plan.maxInvestment) {
      toast.error(`Investment amount must be between $${plan.minInvestment} and $${plan.maxInvestment}`)
      return
    }
    
    setStep(2)
  }
  
  const handleConfirmInvestment = async () => {
    if (!connection) return
    
    setIsProcessing(true)
    setStep(3)
    
    try {
      // Get company wallet address for the current chain
      const companyWallet = companyWallets.find(w => w.chain === connection.chain)?.address
      if (!companyWallet) {
        throw new Error("Company wallet not found for this chain")
      }
      
      // Send transaction
      const txHash = await sendTransaction(
        companyWallet,
        parseFloat(amount),
        "ETH"
      )
      
      // Create investment record
      await createInvestment({
        planId: plan._id,
        amount: usdValue,
        currency: "ETH",
        cryptoAmount: parseFloat(amount),
        usdValue,
        transactionHash: txHash,
        fromAddress: connection.address,
        toAddress: companyWallet,
        chain: connection.chain,
      })
      
      setStep(4)
      toast.success("Investment submitted successfully! Waiting for admin confirmation.")
      
    } catch (error) {
      console.error("Investment failed:", error)
      toast.error(`Investment failed: ${error instanceof Error ? error.message : "Unknown error"}`)
      setStep(1)
    } finally {
      setIsProcessing(false)
    }
  }
  
  const handleClose = () => {
    setStep(1)
    setAmount("")
    setUsdValue(0)
    onClose()
  }
  
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success("Copied to clipboard")
  }
  
  const openExplorer = (txHash: string) => {
    // This would open the transaction in a block explorer
    window.open(`https://etherscan.io/tx/${txHash}`, "_blank")
  }
  
  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <TrendingUp className="mr-2 h-5 w-5" />
            Invest in {plan.name}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {step === 1 && (
            <>
              {/* Plan Summary */}
              <Card>
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <h3 className="font-semibold">{plan.name}</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">{plan.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Expected Return:</span>
                      <Badge className="bg-green-100 text-green-800">{plan.apy}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Duration:</span>
                      <span className="text-sm font-medium">{plan.duration} days</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Risk Level:</span>
                      <Badge variant="outline">{plan.riskLevel.replace("-", " ").replace(/\b\w/g, (l: string) => l.toUpperCase())}</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Amount Input */}
              <div className="space-y-2">
                <Label htmlFor="amount">Investment Amount (ETH)</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0"
                  value={amount}
                  onChange={(e) => handleAmountChange(e.target.value)}
                  placeholder="Enter amount in ETH"
                />
                {isCalculating ? (
                  <div className="flex items-center text-sm text-slate-500">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Calculating USD value...
                  </div>
                ) : usdValue > 0 && (
                  <div className="text-sm text-slate-600 dark:text-slate-400">
                    ≈ {formatCurrency(usdValue)}
                  </div>
                )}
              </div>
              
              {/* Investment Range */}
              <div className="text-sm text-slate-600 dark:text-slate-400">
                <p>Investment Range: {formatCurrency(plan.minInvestment)} - {formatCurrency(plan.maxInvestment)}</p>
                {usdValue > 0 && (usdValue < plan.minInvestment || usdValue > plan.maxInvestment) && (
                  <p className="text-red-600 mt-1">
                    Amount must be between {formatCurrency(plan.minInvestment)} and {formatCurrency(plan.maxInvestment)}
                  </p>
                )}
              </div>
              
              {/* Wallet Status */}
              <div className="flex items-center space-x-2 p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                <Wallet className="h-4 w-4 text-slate-500" />
                <span className="text-sm">
                  {connection?.isConnected ? (
                    <>Connected: {formatBalance(connection.balance)} ETH</>
                  ) : (
                    "Wallet not connected"
                  )}
                </span>
              </div>
              
              <div className="flex space-x-2">
                <Button variant="outline" onClick={handleClose} className="flex-1">
                  Cancel
                </Button>
                <Button 
                  onClick={handleInvest} 
                  disabled={!connection?.isConnected || !amount || usdValue < plan.minInvestment || usdValue > plan.maxInvestment}
                  className="flex-1"
                >
                  Continue
                </Button>
              </div>
            </>
          )}
          
          {step === 2 && (
            <>
              {/* Confirmation */}
              <div className="space-y-4">
                <div className="text-center">
                  <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold">Confirm Investment</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Please review your investment details before proceeding
                  </p>
                </div>
                
                <Card>
                  <CardContent className="p-4 space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm">Plan:</span>
                      <span className="font-medium">{plan.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Amount:</span>
                      <span className="font-medium">{formatCryptoAmount(parseFloat(amount), "ETH")}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">USD Value:</span>
                      <span className="font-medium">{formatCurrency(usdValue)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Expected Return:</span>
                      <span className="font-medium text-green-600">{plan.apy}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Duration:</span>
                      <span className="font-medium">{plan.duration} days</span>
                    </div>
                  </CardContent>
                </Card>
                
                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
                  <div className="flex items-start space-x-2">
                    <AlertCircle className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium text-amber-800 dark:text-amber-200">Important Notice</p>
                      <p className="text-amber-700 dark:text-amber-300 mt-1">
                        Your investment will be pending until admin confirmation. This usually takes a few minutes.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex space-x-2">
                <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                  Back
                </Button>
                <Button onClick={handleConfirmInvestment} className="flex-1">
                  Confirm Investment
                </Button>
              </div>
            </>
          )}
          
          {step === 3 && (
            <>
              {/* Processing */}
              <div className="text-center space-y-4">
                <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto" />
                <h3 className="text-lg font-semibold">Processing Investment</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Please wait while we process your investment...
                </p>
              </div>
            </>
          )}
          
          {step === 4 && (
            <>
              {/* Success */}
              <div className="text-center space-y-4">
                <CheckCircle className="h-12 w-12 text-green-600 mx-auto" />
                <h3 className="text-lg font-semibold">Investment Submitted!</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Your investment has been submitted and is pending admin confirmation.
                </p>
                
                <Card>
                  <CardContent className="p-4 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Transaction Hash:</span>
                      <div className="flex items-center space-x-2">
                        <code className="text-xs bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded">
                          {connection?.address?.slice(0, 8)}...{connection?.address?.slice(-6)}
                        </code>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => copyToClipboard(connection?.address || "")}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Amount:</span>
                      <span className="font-medium">{formatCurrency(usdValue)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Status:</span>
                      <Badge className="bg-amber-100 text-amber-800">Pending</Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <Button onClick={handleClose} className="w-full">
                Close
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
