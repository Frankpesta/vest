"use client"

import { useWalletInit } from "@/lib/hooks/use-wallet-init"

export function WalletInit() {
  useWalletInit()
  return null // This component doesn't render anything
}
