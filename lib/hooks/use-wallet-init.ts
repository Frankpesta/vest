import { useEffect } from "react";
import { useWalletStore } from "@/lib/stores/wallet-store";

export function useWalletInit() {
  const { connection, reconnectWallet } = useWalletStore();

  useEffect(() => {
    // Only attempt to reconnect if we have a stored connection
    if (connection && connection.address && connection.isConnected) {
      reconnectWallet().catch((error) => {
        console.error("Failed to reconnect wallet on app init:", error);
      });
    }
  }, []); // Only run on mount

  // Listen for account changes
  useEffect(() => {
    if (typeof window === "undefined" || !window.ethereum) return;

    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        // User disconnected wallet
        useWalletStore.getState().disconnectWallet();
      } else if (connection && accounts[0] !== connection.address) {
        // User switched accounts
        useWalletStore.getState().disconnectWallet();
      }
    };

    const handleChainChanged = () => {
      // Reconnect to update chain info
      if (connection) {
        reconnectWallet().catch((error) => {
          console.error("Failed to reconnect after chain change:", error);
        });
      }
    };

    window.ethereum.on("accountsChanged", handleAccountsChanged);
    window.ethereum.on("chainChanged", handleChainChanged);

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
        window.ethereum.removeListener("chainChanged", handleChainChanged);
      }
    };
  }, [connection, reconnectWallet]);
}
