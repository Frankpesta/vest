export interface WalletConnection {
	address: string; // Ethereum address, e.g., "0x1234..."
	chain: string; // chain identifier string, e.g., "ethereum", "bsc", "polygon"
	balance: number; // wallet balance (native token), e.g., 1.234
	isConnected: boolean; // connection status
}

export interface CompanyWallet {
	chain: string; // chain name string like "ethereum", "bsc", "polygon"
	address: string; // Ethereum address string
	name: string; // descriptive name of the company wallet
}
