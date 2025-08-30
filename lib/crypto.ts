import { mainnet, bsc } from "viem/chains";

export const SUPPORTED_CHAINS = {
	ethereum: mainnet,
	bsc: bsc,
} as const;

export const COMPANY_WALLETS = {
	ethereum: "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b1", // Mock company wallet
	bsc: "0x8ba1f109551bD432803012645Hac136c9c1e4a1", // Mock company wallet
} as const;

export type SupportedChain = keyof typeof SUPPORTED_CHAINS;

// Mock wallet connection for development
export const connectWallet = async (): Promise<{
	address: string;
	chain: SupportedChain;
	balance: string;
}> => {
	// Simulate wallet connection delay
	await new Promise((resolve) => setTimeout(resolve, 1000));

	// Mock successful connection
	return {
		address: "0x1234567890123456789012345678901234567890",
		chain: "ethereum",
		balance: "2.5", // Mock ETH balance
	};
};

export const getBalance = async (
	address: string,
	chain: SupportedChain
): Promise<string> => {
	// Mock balance check
	await new Promise((resolve) => setTimeout(resolve, 500));
	return Math.random() * 10 + 0.1 + ""; // Random balance between 0.1-10
};

export const sendTransaction = async (
	to: string,
	amount: string,
	chain: SupportedChain
): Promise<{ hash: string; success: boolean }> => {
	// Mock transaction
	await new Promise((resolve) => setTimeout(resolve, 2000));

	return {
		hash: "0x" + Math.random().toString(16).substring(2, 66),
		success: Math.random() > 0.1, // 90% success rate
	};
};

export const formatCurrency = (
	amount: string | number,
	currency = "USD"
): string => {
	return new Intl.NumberFormat("en-US", {
		style: "currency",
		currency,
	}).format(Number(amount));
};

export const formatCrypto = (
	amount: string | number,
	symbol: string
): string => {
	return `${Number(amount).toFixed(6)} ${symbol}`;
};
