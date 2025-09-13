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
	addGanacheNetwork: () => Promise<boolean>;
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

// Custom Ganache chain definition for Viem
const ganacheChain = {
	id: 1337,
	name: 'Ganache',
	network: 'ganache',
	nativeCurrency: {
		decimals: 18,
		name: 'Ether',
		symbol: 'ETH',
	},
	rpcUrls: {
		default: {
			http: ['http://127.0.0.1:7545'],
		},
		public: {
			http: ['http://127.0.0.1:7545'],
		},
	},
	blockExplorers: {
		default: { name: 'Ganache', url: 'http://127.0.0.1:7545' },
	},
};

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
		id: "1337", // Corrected chain ID
		name: "Ganache",
		nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 },
		rpcUrls: ["http://127.0.0.1:7545"], // Default Ganache GUI port
		blockExplorerUrls: ["http://127.0.0.1:7545"],
	},
];

const COMPANY_WALLETS: CompanyWallet[] = [
	{
		chain: "ethereum",
		address: "0xB6DAFc65Dad45CBf318452fC7EF5109A3D45CB79",
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
	{
		chain: "ganache",
		address: "0xB6DAFc65Dad45CBf318452fC7EF5109A3D45CB79",
		name: "MultiXcapital Ganache Wallet",
	},
];

// Chain mapping for Viem (now includes Ganache)
const CHAIN_MAP = {
	"1": mainnet,
	"56": bsc,
	"137": polygon,
	"1337": ganacheChain, // Added Ganache chain
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

	// New function to add Ganache network to MetaMask
	addGanacheNetwork: async () => {
		const provider = getWalletProvider();
		if (!provider) {
			throw new Error("No wallet provider found");
		}

		try {
			await provider.request({
				method: 'wallet_addEthereumChain',
				params: [{
					chainId: '0x539', // 1337 in hex
					chainName: 'Ganache',
					nativeCurrency: {
						name: 'Ether',
						symbol: 'ETH',
						decimals: 18,
					},
					rpcUrls: ['http://127.0.0.1:7545'],
					blockExplorerUrls: ['http://127.0.0.1:7545'],
				}],
			});
			return true;
		} catch (error) {
			console.error('Failed to add Ganache network:', error);
			return false;
		}
	},

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
			const chainIdDecimal = parseInt(chainId, 16).toString();
			const currentChain = get().supportedChains.find(chain => chain.id === chainIdDecimal);
			
			if (!currentChain) {
				// If it's Ganache chain ID but not recognized, try to add it
				if (chainIdDecimal === "1337") {
					const added = await get().addGanacheNetwork();
					if (!added) {
						throw new Error("Failed to add Ganache network to MetaMask");
					}
					// Retry finding the chain
					const retryChain = get().supportedChains.find(chain => chain.id === chainIdDecimal);
					if (!retryChain) {
						throw new Error("Ganache network not found after adding");
					}
				} else {
					throw new Error(`Unsupported chain ID: ${chainIdDecimal}`);
				}
			}

			// Create Viem clients with the correct chain
			const viemChain = getViemChain(chainIdDecimal);
			const publicClient = createPublicClient({
				chain: viemChain,
				transport: http(chainIdDecimal === "1337" ? "http://127.0.0.1:7545" : undefined),
			});

			const walletClient = createWalletClient({
				chain: viemChain,
				transport: custom(provider),
			});

			// Get balance
			const balance = await publicClient.getBalance({ address: address as `0x${string}` });
			const balanceInEth = parseFloat(formatEther(balance));

			const finalChain = currentChain || get().supportedChains.find(chain => chain.id === chainIdDecimal);
			const connection: WalletConnection = {
				address,
				chain: finalChain!.name.toLowerCase().replace(" ", "-"),
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
			const chainIdDecimal = parseInt(chainId, 16).toString();
			const currentChain = get().supportedChains.find(c => c.id === chainIdDecimal);
			if (!currentChain) return false;

			// Recreate clients
			const viemChain = getViemChain(chainIdDecimal);
			const publicClient = createPublicClient({ 
				chain: viemChain, 
				transport: http(chainIdDecimal === "1337" ? "http://127.0.0.1:7545" : undefined)
			});
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

			const hexChainId = `0x${parseInt(chainId).toString(16)}`;

			// Special handling for Ganache
			if (chainId === "1337") {
				try {
					// First try to switch to Ganache
					await provider.request({
						method: "wallet_switchEthereumChain",
						params: [{ chainId: hexChainId }],
					});
				} catch (switchError: any) {
					// If switching fails, try to add the network first
					if (switchError.code === 4902) {
						await get().addGanacheNetwork();
						// Then try switching again
						await provider.request({
							method: "wallet_switchEthereumChain",
							params: [{ chainId: hexChainId }],
						});
					} else {
						throw switchError;
					}
				}
			} else {
				// Regular chain switch
				await provider.request({
					method: "wallet_switchEthereumChain",
					params: [{ chainId: hexChainId }],
				});
			}

			// Update connection with new chain info
			const viemChain = getViemChain(chainId);
			const publicClient = createPublicClient({
				chain: viemChain,
				transport: http(chainId === "1337" ? "http://127.0.0.1:7545" : undefined),
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
				account: connection.address as `0x${string}`, // ← Added this line
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
				confirmations: receipt.confirmations || 0,
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
		"1337": "http://127.0.0.1:7545/tx/", // Ganache explorer URL
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