import { create } from "zustand";
import type { WalletConnection, CompanyWallet } from "@/lib/types";

interface WalletState {
	connection: WalletConnection | null;
	isConnecting: boolean;
	companyWallets: CompanyWallet[];
	supportedChains: Chain[];
	connectWallet: (
		walletType?: "metamask" | "walletconnect" | "coinbase"
	) => Promise<boolean>;
	disconnectWallet: () => void;
	switchChain: (chainId: string) => Promise<boolean>;
	sendTransaction: (
		to: string,
		amount: number,
		token: string
	) => Promise<string>;
	getBalance: (token?: string) => Promise<number>;
	estimateGas: (to: string, amount: number, token: string) => Promise<string>;
	getTransactionStatus: (txHash: string) => Promise<TransactionStatus>;
}

interface Chain {
	id: string;
	name: string;
	nativeCurrency: {
		name: string;
		symbol: string;
		decimals: number;
	};
	rpcUrls: string[];
	blockExplorerUrls: string[];
}

interface TransactionStatus {
	status: "pending" | "confirmed" | "failed";
	confirmations: number;
	blockNumber?: number;
}

const SUPPORTED_CHAINS: Chain[] = [
	{
		id: "1",
		name: "Ethereum Mainnet",
		nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
		rpcUrls: ["https://mainnet.infura.io/v3/"],
		blockExplorerUrls: ["https://etherscan.io"],
	},
	{
		id: "56",
		name: "BNB Smart Chain",
		nativeCurrency: { name: "BNB", symbol: "BNB", decimals: 18 },
		rpcUrls: ["https://bsc-dataseed.binance.org/"],
		blockExplorerUrls: ["https://bscscan.com"],
	},
	{
		id: "137",
		name: "Polygon",
		nativeCurrency: { name: "MATIC", symbol: "MATIC", decimals: 18 },
		rpcUrls: ["https://polygon-rpc.com/"],
		blockExplorerUrls: ["https://polygonscan.com"],
	},
];

const COMPANY_WALLETS: CompanyWallet[] = [
	{
		chain: "ethereum",
		address: "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b1",
		name: "MultiXcapital Ethereum Wallet",
	},
	{
		chain: "bsc",
		address: "0x8ba1f109551bD432803012645Hac136c22C85B",
		name: "MultiXcapital BSC Wallet",
	},
	{
		chain: "polygon",
		address: "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984",
		name: "MultiXcapital Polygon Wallet",
	},
];

export const useWalletStore = create<WalletState>((set, get) => ({
	connection: null,
	isConnecting: false,
	companyWallets: COMPANY_WALLETS,
	supportedChains: SUPPORTED_CHAINS,

	connectWallet: async (walletType = "metamask") => {
		set({ isConnecting: true });

		try {
			// Mock wallet connection with different wallet types
			await new Promise((resolve) => setTimeout(resolve, 2000));

			// Simulate different wallet addresses based on type
			const walletAddresses = {
				metamask: "0x1234567890123456789012345678901234567890",
				walletconnect: "0x2345678901234567890123456789012345678901",
				coinbase: "0x3456789012345678901234567890123456789012",
			};

			const mockConnection: WalletConnection = {
				address: walletAddresses[walletType],
				chain: "ethereum",
				balance: Math.random() * 10 + 0.1, // Random balance between 0.1-10
				isConnected: true,
			};

			set({
				connection: mockConnection,
				isConnecting: false,
			});

			return true;
		} catch (error) {
			set({ isConnecting: false });
			throw new Error(`Failed to connect ${walletType} wallet`);
		}
	},

	disconnectWallet: () => {
		set({ connection: null });
	},

	switchChain: async (chainId: string) => {
		const { connection, supportedChains } = get();
		if (!connection) return false;

		const targetChain = supportedChains.find((chain) => chain.id === chainId);
		if (!targetChain) {
			throw new Error(`Unsupported chain: ${chainId}`);
		}

		// Mock chain switching with loading time
		await new Promise((resolve) => setTimeout(resolve, 1500));

		// Simulate different balances per chain
		const chainBalances = {
			"1": Math.random() * 5 + 0.1, // ETH
			"56": Math.random() * 20 + 1, // BNB
			"137": Math.random() * 100 + 10, // MATIC
		};

		set({
			connection: {
				...connection,
				chain: targetChain.name.toLowerCase().replace(" ", "-"),
				balance: chainBalances[chainId as keyof typeof chainBalances] || 1,
			},
		});

		return true;
	},

	sendTransaction: async (to: string, amount: number, token: string) => {
		const { connection } = get();
		if (!connection) {
			throw new Error("Wallet not connected");
		}

		// Mock transaction validation
		if (amount > connection.balance) {
			throw new Error("Insufficient balance");
		}

		// Simulate transaction processing time
		await new Promise((resolve) => setTimeout(resolve, 3000));

		// Generate realistic transaction hash
		const mockTxHash = `0x${Array.from({ length: 64 }, () =>
			Math.floor(Math.random() * 16).toString(16)
		).join("")}`;

		// Update balance after transaction
		set({
			connection: {
				...connection,
				balance: connection.balance - amount - 0.001, // Subtract amount + gas fee
			},
		});

		return mockTxHash;
	},

	getBalance: async (token = "native") => {
		const { connection } = get();
		if (!connection) return 0;

		// Mock balance fetching
		await new Promise((resolve) => setTimeout(resolve, 1000));

		if (token === "native") {
			return connection.balance;
		}

		// Mock token balances
		const tokenBalances = {
			USDC: Math.random() * 1000 + 100,
			USDT: Math.random() * 1000 + 100,
			DAI: Math.random() * 500 + 50,
		};

		return tokenBalances[token as keyof typeof tokenBalances] || 0;
	},

	estimateGas: async (to: string, amount: number, token: string) => {
		// Mock gas estimation
		await new Promise((resolve) => setTimeout(resolve, 500));

		const baseGas = token === "native" ? 21000 : 65000; // Higher gas for token transfers
		const gasPrice = Math.random() * 50 + 10; // Random gas price 10-60 gwei

		return ((baseGas * gasPrice) / 1e9).toFixed(6); // Convert to ETH
	},

	getTransactionStatus: async (txHash: string) => {
		// Mock transaction status checking
		await new Promise((resolve) => setTimeout(resolve, 1000));

		// Simulate different transaction states
		const statuses: TransactionStatus[] = [
			{ status: "pending", confirmations: 0 },
			{
				status: "confirmed",
				confirmations: 1,
				blockNumber: Math.floor(Math.random() * 1000000) + 18000000,
			},
			{
				status: "confirmed",
				confirmations: 12,
				blockNumber: Math.floor(Math.random() * 1000000) + 18000000,
			},
		];

		return statuses[Math.floor(Math.random() * statuses.length)];
	},
}));

export const formatAddress = (address: string) => {
	return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

export const formatBalance = (balance: number, decimals = 4) => {
	return Number(balance).toFixed(decimals);
};

export const getExplorerUrl = (chainId: string, txHash: string) => {
	const explorers = {
		"1": "https://etherscan.io/tx/",
		"56": "https://bscscan.com/tx/",
		"137": "https://polygonscan.com/tx/",
	};
	return `${
		explorers[chainId as keyof typeof explorers] || explorers["1"]
	}${txHash}`;
};
