"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { 
  AlertCircle, 
  CheckCircle, 
  Loader2, 
  Wallet,
  Banknote,
  TrendingUp,
  PiggyBank,
  ExternalLink,
  Copy
} from "lucide-react"
import { useWalletStore, formatBalance } from "@/lib/stores/wallet-store"
import { useMutation, useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { getCryptoPrice, formatCurrency, formatCryptoAmount } from "@/lib/price-api"
import { toast } from "sonner"

interface WithdrawalModalProps {
  isOpen: boolean
  onClose: () => void
}

const BALANCE_TYPES = [
  {
    value: "main",
    label: "Main Balance",
    description: "From deposits",
    icon: Banknote,
    color: "text-green-600",
    bgColor: "bg-green-100 dark:bg-green-900",
  },
  {
    value: "interest",
    label: "Interest Balance", 
    description: "From investment returns",
    icon: TrendingUp,
    color: "text-purple-600",
    bgColor: "bg-purple-100 dark:bg-purple-900",
  },
  {
    value: "investment",
    label: "Investment Balance",
    description: "From completed investments", 
    icon: PiggyBank,
    color: "text-orange-600",
    bgColor: "bg-orange-100 dark:bg-orange-900",
  },
]

const CURRENCIES = [
  { value: "ETH", label: "Ethereum (ETH)", chain: "ethereum" },
  { value: "BTC", label: "Bitcoin (BTC)", chain: "bitcoin" },
  { value: "BNB", label: "BNB (BNB)", chain: "bsc" },
  { value: "MATIC", label: "Polygon (MATIC)", chain: "polygon" },
]

export function WithdrawalModal({ isOpen, onClose }: WithdrawalModalProps) {
  const { connection } = useWalletStore()
  const [balanceType, setBalanceType] = useState<string>("")
  const [amount, setAmount] = useState("")
  const [currency, setCurrency] = useState("ETH")
  const [cryptoAmount, setCryptoAmount] = useState(0)
  const [walletAddress, setWalletAddress] = useState("")
  const [isCalculating, setIsCalculating] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [step, setStep] = useState(1) // 1: Setup, 2: Confirmation, 3: Processing, 4: Success
  
  const userBalances = useQuery(api.userBalances.getUserBalances)
  const createWithdrawalRequest = useMutation(api.withdrawalRequests.createWithdrawalRequest)
  
  // Calculate crypto amount when amount or currency changes
  useEffect(() => {
    const calculateCrypto = async () => {
      if (!amount || !currency) return
      
      setIsCalculating(true)
      try {
        const { price } = await getCryptoPrice(currency.toLowerCase(), 1) // Get price for 1 unit
        const cryptoAmount = parseFloat(amount) / price // Convert USD to crypto
        setCryptoAmount(cryptoAmount)
      } catch (error) {
        console.error("Failed to calculate crypto amount:", error)
        toast.error("Failed to calculate crypto amount")
      } finally {
        setIsCalculating(false)
      }
    }
    
    calculateCrypto()
  }, [amount, currency])
  
  // Set wallet address when connection changes
  useEffect(() => {
    if (connection?.address) {
      setWalletAddress(connection.address)
    }
  }, [connection?.address])
  
  const getAvailableBalance = () => {
    if (!userBalances || !balanceType) return 0
    
    switch (balanceType) {
      case "main":
        return userBalances.mainBalance
      case "interest":
        return userBalances.interestBalance
      case "investment":
        return userBalances.investmentBalance
      default:
        return 0
    }
  }
  
  const getBalanceTypeInfo = () => {
    return BALANCE_TYPES.find(type => type.value === balanceType)
  }
  
  const handleContinue = () => {
    if (!balanceType) {
      toast.error("Please select a balance type")
      return
    }
    
    if (!amount || parseFloat(amount) <= 0) {
      toast.error("Please enter a valid amount")
      return
    }
    
    const availableBalance = getAvailableBalance()
    if (parseFloat(amount) > availableBalance) {
      toast.error(`Insufficient balance. Available: $${availableBalance.toLocaleString()}`)
      return
    }
    
    if (!walletAddress) {
      toast.error("Please enter a wallet address")
      return
    }
    
    setStep(2)
  }
  
  const handleConfirmWithdrawal = async () => {
    setIsProcessing(true)
    setStep(3)
    
    try {
      await createWithdrawalRequest({
        balanceType: balanceType as "main" | "interest" | "investment",
        amount: parseFloat(amount),
        currency,
        cryptoAmount,
        walletAddress,
        chain: CURRENCIES.find(c => c.value === currency)?.chain || "ethereum",
      })
      
      setStep(4)
      toast.success("Withdrawal request submitted successfully!")
      
    } catch (error) {
      console.error("Withdrawal request failed:", error)
      toast.error(`Withdrawal request failed: ${error instanceof Error ? error.message : "Unknown error"}`)
      setStep(1)
    } finally {
      setIsProcessing(false)
    }
  }
  
  const handleClose = () => {
    setStep(1)
    setBalanceType("")
    setAmount("")
    setCurrency("ETH")
    setCryptoAmount(0)
    setWalletAddress("")
    onClose()
  }
  
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success("Copied to clipboard")
  }
  
  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto scrollbar-hide">
        <DialogHeader className="sticky top-0 z-10 pb-4">
          <DialogTitle className="flex items-center">
            <Wallet className="mr-2 h-5 w-5" />
            Request Withdrawal
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 pb-4">
          {step === 1 && (
            <>
              {/* Balance Type Selection */}
              <div className="space-y-3">
                <Label>Select Balance Type</Label>
                <div className="grid grid-cols-1 gap-3">
                  {BALANCE_TYPES.map((type) => {
                    const availableBalance = type.value === "main" ? userBalances?.mainBalance || 0 :
                                           type.value === "interest" ? userBalances?.interestBalance || 0 :
                                           userBalances?.investmentBalance || 0
                    
                    return (
                      <Card 
                        key={type.value}
                        className={`cursor-pointer transition-colors ${
                          balanceType === type.value 
                            ? "ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/20" 
                            : "hover:bg-slate-50 dark:hover:bg-slate-700"
                        }`}
                        onClick={() => setBalanceType(type.value)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${type.bgColor}`}>
                                <type.icon className={`h-5 w-5 ${type.color}`} />
                              </div>
                              <div>
                                <p className="font-medium">{type.label}</p>
                                <p className="text-sm text-slate-600 dark:text-slate-400">{type.description}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold">${availableBalance.toLocaleString()}</p>
                              <Badge variant="outline" className="text-xs">
                                Available
                              </Badge>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </div>
              
              {/* Amount Input */}
              <div className="space-y-2">
                <Label htmlFor="amount">Withdrawal Amount (USD)</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Enter amount in USD"
                />
                {amount && (
                  <div className="text-sm text-slate-600 dark:text-slate-400">
                    Available: ${getAvailableBalance().toLocaleString()}
                  </div>
                )}
              </div>
              
              {/* Currency Selection */}
              <div className="space-y-2">
                <Label>Receive Currency</Label>
                <Select value={currency} onValueChange={setCurrency}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select currency" />
                  </SelectTrigger>
                  <SelectContent>
                    {CURRENCIES.map((curr) => (
                      <SelectItem key={curr.value} value={curr.value}>
                        {curr.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {/* Crypto Amount Display */}
              {isCalculating ? (
                <div className="flex items-center text-sm text-slate-500">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Calculating crypto amount...
                </div>
              ) : cryptoAmount > 0 && (
                <div className="p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600 dark:text-slate-400">You will receive:</span>
                    <span className="font-semibold">{formatCryptoAmount(cryptoAmount, currency)}</span>
                  </div>
                </div>
              )}
              
              {/* Wallet Address */}
              <div className="space-y-2">
                <Label htmlFor="walletAddress">Wallet Address</Label>
                <Input
                  id="walletAddress"
                  value={walletAddress}
                  onChange={(e) => setWalletAddress(e.target.value)}
                  placeholder="Enter wallet address"
                />
                {connection?.address && (
                  <div className="flex items-center space-x-2 text-sm text-slate-600 dark:text-slate-400">
                    <span>Connected: {connection.address.slice(0, 8)}...{connection.address.slice(-6)}</span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setWalletAddress(connection.address)}
                    >
                      Use Connected
                    </Button>
                  </div>
                )}
              </div>
              
              <div className="flex space-x-2">
                <Button variant="outline" onClick={handleClose} className="flex-1">
                  Cancel
                </Button>
                <Button 
                  onClick={handleContinue} 
                  disabled={!balanceType || !amount || !walletAddress || parseFloat(amount) > getAvailableBalance()}
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
                  <h3 className="text-lg font-semibold">Confirm Withdrawal</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Please review your withdrawal details before submitting
                  </p>
                </div>
                
                <Card>
                  <CardContent className="p-4 space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm">Balance Type:</span>
                      <div className="flex items-center space-x-2">
                        {(() => {
                          const balanceInfo = getBalanceTypeInfo();
                          if (!balanceInfo) return null;
                          const IconComponent = balanceInfo.icon;
                          return (
                            <>
                              <div className={`w-6 h-6 rounded-full flex items-center justify-center ${balanceInfo.bgColor}`}>
                                <IconComponent className={`h-3 w-3 ${balanceInfo.color}`} />
                              </div>
                              <span className="font-medium">{balanceInfo.label}</span>
                            </>
                          );
                        })()}
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Amount:</span>
                      <span className="font-medium">{formatCurrency(parseFloat(amount))}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Receive:</span>
                      <span className="font-medium">{formatCryptoAmount(cryptoAmount, currency)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Wallet:</span>
                      <div className="flex items-center space-x-2">
                        <code className="text-xs bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded">
                          {walletAddress.slice(0, 8)}...{walletAddress.slice(-6)}
                        </code>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => copyToClipboard(walletAddress)}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
                  <div className="flex items-start space-x-2">
                    <AlertCircle className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium text-amber-800 dark:text-amber-200">Important Notice</p>
                      <p className="text-amber-700 dark:text-amber-300 mt-1">
                        Your withdrawal request will be reviewed by our admin team. Processing typically takes 1-3 business days.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex space-x-2">
                <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                  Back
                </Button>
                <Button onClick={handleConfirmWithdrawal} className="flex-1">
                  Submit Request
                </Button>
              </div>
            </>
          )}
          
          {step === 3 && (
            <>
              {/* Processing */}
              <div className="text-center space-y-4">
                <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto" />
                <h3 className="text-lg font-semibold">Submitting Request</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Please wait while we submit your withdrawal request...
                </p>
              </div>
            </>
          )}
          
          {step === 4 && (
            <>
              {/* Success */}
              <div className="text-center space-y-4">
                <CheckCircle className="h-12 w-12 text-green-600 mx-auto" />
                <h3 className="text-lg font-semibold">Request Submitted!</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Your withdrawal request has been submitted and is pending admin review.
                </p>
                
                <Card>
                  <CardContent className="p-4 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Amount:</span>
                      <span className="font-medium">{formatCurrency(parseFloat(amount))}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Receive:</span>
                      <span className="font-medium">{formatCryptoAmount(cryptoAmount, currency)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Status:</span>
                      <Badge className="bg-amber-100 text-amber-800">Pending Review</Badge>
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
