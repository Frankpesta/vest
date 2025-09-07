"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Wallet, Loader2, ExternalLink, Copy, AlertCircle } from "lucide-react"
import { useWalletStore, formatAddress, formatBalance, getExplorerUrl } from "@/lib/stores/wallet-store"
import { toast } from "sonner"

interface WalletOption {
  id: "metamask" | "walletconnect" | "coinbase"
  name: string
  icon: string
  description: string
}

const WALLET_OPTIONS: WalletOption[] = [
  {
    id: "metamask",
    name: "MetaMask",
    icon: "🦊",
    description: "Connect using MetaMask wallet",
  },
  {
    id: "coinbase",
    name: "Coinbase Wallet",
    icon: "🔵",
    description: "Connect using Coinbase Wallet",
  },
  {
    id: "walletconnect",
    name: "WalletConnect",
    icon: "🔗",
    description: "Connect using WalletConnect protocol",
  },
]

// Check if wallet is available
const isWalletAvailable = (walletType: string) => {
  if (typeof window === "undefined") return false;
  
  switch (walletType) {
    case "metamask":
      return !!(window as any).ethereum?.isMetaMask;
    case "coinbase":
      return !!(window as any).coinbaseWalletExtension || !!(window as any).ethereum?.isCoinbaseWallet;
    case "walletconnect":
      return true; // WalletConnect can work with any wallet
    default:
      return false;
  }
}

export function WalletConnectButton() {
  const [isOpen, setIsOpen] = useState(false)
  const [availableWallets, setAvailableWallets] = useState<WalletOption[]>([])
  const { connection, isConnecting, connectWallet, disconnectWallet } = useWalletStore()

  // Check available wallets on mount
  useEffect(() => {
    const available = WALLET_OPTIONS.filter(wallet => isWalletAvailable(wallet.id))
    setAvailableWallets(available)
  }, [])

  const handleConnect = async (walletType: "metamask" | "walletconnect" | "coinbase") => {
    try {
      if (!isWalletAvailable(walletType)) {
        toast.error(`${WALLET_OPTIONS.find((w) => w.id === walletType)?.name} is not installed or available`)
        return
      }

      await connectWallet(walletType)
      setIsOpen(false)
      toast.success(`${WALLET_OPTIONS.find((w) => w.id === walletType)?.name} connected successfully`)
    } catch (error) {
      toast.error(`Failed to connect wallet: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  }

  const handleDisconnect = () => {
    disconnectWallet()
    toast.success("Wallet disconnected")
  }

  const copyAddress = () => {
    if (connection?.address) {
      navigator.clipboard.writeText(connection.address)
      toast.success("Address copied to clipboard")
    }
  }

  const openExplorer = () => {
    if (connection?.address) {
      // Get current chain ID from connection
      const chainId = "1" // Default to Ethereum mainnet
      const explorerUrl = getExplorerUrl(chainId, connection.address)
      window.open(explorerUrl, "_blank")
    }
  }

  if (connection?.isConnected) {
    return (
      <div className="flex items-center space-x-2">
        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
          <div className="w-2 h-2 bg-green-500 rounded-full mr-2" />
          Connected
        </Badge>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <Wallet className="mr-2 h-4 w-4" />
              {formatAddress(connection.address)}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Wallet Details</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-slate-600 dark:text-slate-400">Address</span>
                  <Button variant="ghost" size="sm" onClick={copyAddress}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <code className="text-sm font-mono">{connection.address}</code>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Balance</p>
                    <p className="font-semibold">{formatBalance(connection.balance)} ETH</p>
                  </div>
                  <Badge variant="outline" className="capitalize">
                    {connection.chain}
                  </Badge>
                </div>
              </div>

              <div className="flex space-x-2">
                <Button variant="outline" className="flex-1 bg-transparent" onClick={openExplorer}>
                  <ExternalLink className="mr-2 h-4 w-4" />
                  View on Explorer
                </Button>
                <Button variant="outline" className="flex-1 bg-transparent" onClick={handleDisconnect}>
                  Disconnect
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <Wallet className="mr-2 h-4 w-4" />
          Connect Wallet
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Connect Your Wallet</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          {availableWallets.length > 0 ? (
            availableWallets.map((wallet) => (
              <Button
                key={wallet.id}
                variant="outline"
                className="w-full justify-start h-auto p-4 bg-transparent"
                onClick={() => handleConnect(wallet.id)}
                disabled={isConnecting}
              >
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{wallet.icon}</span>
                  <div className="text-left">
                    <p className="font-medium">{wallet.name}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{wallet.description}</p>
                  </div>
                </div>
                {isConnecting && <Loader2 className="ml-auto h-4 w-4 animate-spin" />}
              </Button>
            ))
          ) : (
            <div className="text-center py-8">
              <AlertCircle className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-600 dark:text-slate-300 mb-2">No wallets detected</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Please install MetaMask, Coinbase Wallet, or another supported wallet to continue.
              </p>
            </div>
          )}
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 text-center">
          By connecting a wallet, you agree to our Terms of Service and Privacy Policy
        </p>
      </DialogContent>
    </Dialog>
  )
}
