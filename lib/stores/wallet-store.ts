import { create } from "zustand";
import { createPublicClient, createWalletClient, custom, http, formatEther, parseEther } from "viem";
import { mainnet, polygon, bsc } from "viem/chains";
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
	reconnectWallet: () => Promise<boolean>;
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
	{
		id: "1000",
		name: "Ganache",
		nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 },
		rpcUrls: ["http://127.0.0.1:7545"],
		blockExplorerUrls: ["http://127.0.0.1:7545"],
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

// Chain mapping for Viem
const CHAIN_MAP = {
	"1": mainnet,
	"56": bsc,
	"137": polygon,
};

// Get the appropriate chain for Viem
const getViemChain = (chainId: string) => {
	return CHAIN_MAP[chainId as keyof typeof CHAIN_MAP] || mainnet;
};

// Get wallet provider
const getWalletProvider = () => {
	if (typeof window === "undefined") return null;
	
	if (window.ethereum) {
		return window.ethereum;
	}
	
	// Check for other wallet providers
	if (window.coinbaseWalletExtension) {
		return window.coinbaseWalletExtension;
	}
	
	return null;
};

export const useWalletStore = create<WalletState>((set, get) => ({
	connection: null,
	isConnecting: false,
	companyWallets: COMPANY_WALLETS,
	supportedChains: SUPPORTED_CHAINS,

	connectWallet: async (walletType = "metamask") => {
		set({ isConnecting: true });

		try {
			const provider = getWalletProvider();
			if (!provider) {
				throw new Error("No wallet provider found. Please install MetaMask or another supported wallet.");
			}

			// Request account access
			const accounts = await provider.request({
				method: "eth_requestAccounts",
			});

			if (!accounts || accounts.length === 0) {
				throw new Error("No accounts found");
			}

			const address = accounts[0];
			const chainId = await provider.request({ method: "eth_chainId" });
			const currentChain = get().supportedChains.find(chain => chain.id === parseInt(chainId, 16).toString());
			
			if (!currentChain) {
				throw new Error("Unsupported chain");
			}

			// Create Viem clients
			const viemChain = getViemChain(chainId);
			const publicClient = createPublicClient({
				chain: viemChain,
				transport: http(),
			});

			const walletClient = createWalletClient({
				chain: viemChain,
				transport: custom(provider),
			});

			// Get balance
			const balance = await publicClient.getBalance({ address: address as `0x${string}` });
			const balanceInEth = parseFloat(formatEther(balance));

			const connection: WalletConnection = {
				address,
				chain: currentChain.name.toLowerCase().replace(" ", "-"),
				balance: balanceInEth,
				isConnected: true,
			};

			// Store clients for later use
			(connection as any).publicClient = publicClient;
			(connection as any).walletClient = walletClient;
			(connection as any).provider = provider;

			set({
				connection,
				isConnecting: false,
			});

			// Save to localStorage
			if (typeof window !== "undefined") {
				localStorage.setItem("wallet-connection", JSON.stringify({
					address: connection.address,
					chain: connection.chain,
				}));
			}

			return true;
		} catch (error) {
			set({ isConnecting: false });
			throw new Error(`Failed to connect wallet: ${error instanceof Error ? error.message : "Unknown error"}`);
		}
	},

	disconnectWallet: () => {
		set({ connection: null });
		// Clear localStorage
		if (typeof window !== "undefined") {
			localStorage.removeItem("wallet-connection");
		}
	},

	reconnectWallet: async () => {
		if (typeof window === "undefined") return false;
		
		const stored = localStorage.getItem("wallet-connection");
		if (!stored) return false;

		try {
			const { address, chain } = JSON.parse(stored);
			const provider = getWalletProvider();
			if (!provider) return false;

			// Check if account is still connected
			const accounts = await provider.request({ method: "eth_accounts" });
			if (!accounts || accounts[0] !== address) return false;

			// Get current chain
			const chainId = await provider.request({ method: "eth_chainId" });
			const currentChain = get().supportedChains.find(c => c.id === parseInt(chainId, 16).toString());
			if (!currentChain) return false;

			// Recreate clients
			const viemChain = getViemChain(chainId);
			const publicClient = createPublicClient({ chain: viemChain, transport: http() });
			const walletClient = createWalletClient({ chain: viemChain, transport: custom(provider) });

			// Get balance
			const balance = await publicClient.getBalance({ address: address as `0x${string}` });
			const balanceInEth = parseFloat(formatEther(balance));

			const connection: WalletConnection = {
				address,
				chain: currentChain.name.toLowerCase().replace(" ", "-"),
				balance: balanceInEth,
				isConnected: true,
			};

			(connection as any).publicClient = publicClient;
			(connection as any).walletClient = walletClient;
			(connection as any).provider = provider;

			set({ connection });
			return true;
		} catch (error) {
			localStorage.removeItem("wallet-connection");
			return false;
		}
	},

	switchChain: async (chainId: string) => {
		const { connection } = get();
		if (!connection) return false;

		const targetChain = get().supportedChains.find((chain) => chain.id === chainId);
		if (!targetChain) {
			throw new Error(`Unsupported chain: ${chainId}`);
		}

		try {
			const provider = (connection as any).provider;
			if (!provider) {
				throw new Error("No provider available");
			}

			// Request chain switch
			await provider.request({
				method: "wallet_switchEthereumChain",
				params: [{ chainId: `0x${parseInt(chainId).toString(16)}` }],
			});

			// Update connection with new chain info
			const viemChain = getViemChain(chainId);
			const publicClient = createPublicClient({
				chain: viemChain,
				transport: http(),
			});

			const walletClient = createWalletClient({
				chain: viemChain,
				transport: custom(provider),
			});

			// Get new balance
			const balance = await publicClient.getBalance({ 
				address: connection.address as `0x${string}` 
			});
			const balanceInEth = parseFloat(formatEther(balance));

			set({
				connection: {
					...connection,
					chain: targetChain.name.toLowerCase().replace(" ", "-"),
					balance: balanceInEth,
					publicClient,
					walletClient,
					provider,
				},
			});

			return true;
		} catch (error) {
			throw new Error(`Failed to switch chain: ${error instanceof Error ? error.message : "Unknown error"}`);
		}
	},

	sendTransaction: async (to: string, amount: number, token: string) => {
		const { connection } = get();
		if (!connection) {
			throw new Error("Wallet not connected");
		}

		try {
			const walletClient = (connection as any).walletClient;
			if (!walletClient) {
				throw new Error("Wallet client not available");
			}

			// Check balance
			if (amount > connection.balance) {
				throw new Error("Insufficient balance");
			}

			// Send transaction
			const hash = await walletClient.sendTransaction({
				to: to as `0x${string}`,
				value: parseEther(amount.toString()),
			});

			// Update balance after transaction
			const publicClient = (connection as any).publicClient;
			if (publicClient) {
				const newBalance = await publicClient.getBalance({ 
					address: connection.address as `0x${string}` 
				});
				const balanceInEth = parseFloat(formatEther(newBalance));

				set({
					connection: {
						...connection,
						balance: balanceInEth,
					},
				});
			}

			return hash;
		} catch (error) {
			throw new Error(`Transaction failed: ${error instanceof Error ? error.message : "Unknown error"}`);
		}
	},

	getBalance: async (token = "native") => {
		const { connection } = get();
		if (!connection) return 0;

		try {
			const publicClient = (connection as any).publicClient;
			if (!publicClient) {
				throw new Error("Public client not available");
			}

			if (token === "native") {
				const balance = await publicClient.getBalance({ 
					address: connection.address as `0x${string}` 
				});
				return parseFloat(formatEther(balance));
			}

			// For ERC-20 tokens, you would need to call the token contract
			// This is a simplified version - in production you'd want to implement ERC-20 balance checking
			return 0;
		} catch (error) {
			console.error("Failed to get balance:", error);
			return 0;
		}
	},

	estimateGas: async (to: string, amount: number, token: string) => {
		try {
			const { connection } = get();
			if (!connection) {
				throw new Error("Wallet not connected");
			}

			const publicClient = (connection as any).publicClient;
			if (!publicClient) {
				throw new Error("Public client not available");
			}

			const gasEstimate = await publicClient.estimateGas({
				to: to as `0x${string}`,
				value: parseEther(amount.toString()),
			});

			return gasEstimate.toString();
		} catch (error) {
			throw new Error(`Gas estimation failed: ${error instanceof Error ? error.message : "Unknown error"}`);
		}
	},

	getTransactionStatus: async (txHash: string) => {
		try {
			const { connection } = get();
			if (!connection) {
				throw new Error("Wallet not connected");
			}

			const publicClient = (connection as any).publicClient;
			if (!publicClient) {
				throw new Error("Public client not available");
			}

			const receipt = await publicClient.getTransactionReceipt({
				hash: txHash as `0x${string}`,
			});

			if (!receipt) {
				return { status: "pending", confirmations: 0 };
			}

			return {
				status: receipt.status === "success" ? "confirmed" : "failed",
				confirmations: receipt.confirmations,
				blockNumber: Number(receipt.blockNumber),
			};
		} catch (error) {
			return { status: "pending", confirmations: 0 };
		}
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

// Add window.ethereum type declaration
declare global {
	interface Window {
		ethereum?: any;
		coinbaseWalletExtension?: any;
	}
}