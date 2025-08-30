export interface TokenInfo {
	symbol: string;
	name: string;
	decimals: number;
	address?: string;
	chainId: string;
	logoUrl?: string;
	coingeckoId?: string;
}

export interface PriceData {
	symbol: string;
	price: number;
	change24h: number;
	lastUpdated: Date;
}

export const SUPPORTED_TOKENS: TokenInfo[] = [
	{
		symbol: "ETH",
		name: "Ethereum",
		decimals: 18,
		chainId: "1",
		logoUrl: "/tokens/eth.png",
		coingeckoId: "ethereum",
	},
	{
		symbol: "BTC",
		name: "Bitcoin",
		decimals: 8,
		chainId: "1",
		logoUrl: "/tokens/btc.png",
		coingeckoId: "bitcoin",
	},
	{
		symbol: "USDC",
		name: "USD Coin",
		decimals: 6,
		address: "0xA0b86a33E6441b8435b662303c0f218C8F8c0c0c",
		chainId: "1",
		logoUrl: "/tokens/usdc.png",
		coingeckoId: "usd-coin",
	},
	{
		symbol: "USDT",
		name: "Tether USD",
		decimals: 6,
		address: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
		chainId: "1",
		logoUrl: "/tokens/usdt.png",
		coingeckoId: "tether",
	},
	{
		symbol: "BNB",
		name: "BNB",
		decimals: 18,
		chainId: "56",
		logoUrl: "/tokens/bnb.png",
		coingeckoId: "binancecoin",
	},
	{
		symbol: "MATIC",
		name: "Polygon",
		decimals: 18,
		chainId: "137",
		logoUrl: "/tokens/matic.png",
		coingeckoId: "matic-network",
	},
];

export class MockPriceService {
	private static prices: Map<string, PriceData> = new Map();

	static async getPrice(symbol: string): Promise<PriceData> {
		// Simulate API delay
		await new Promise((resolve) => setTimeout(resolve, 500));

		// Mock price data with realistic values
		const mockPrices: Record<string, { price: number; change24h: number }> = {
			ETH: {
				price: 2000 + Math.random() * 400 - 200,
				change24h: Math.random() * 20 - 10,
			},
			BTC: {
				price: 40000 + Math.random() * 8000 - 4000,
				change24h: Math.random() * 15 - 7.5,
			},
			USDC: {
				price: 1.0 + Math.random() * 0.02 - 0.01,
				change24h: Math.random() * 0.5 - 0.25,
			},
			USDT: {
				price: 1.0 + Math.random() * 0.02 - 0.01,
				change24h: Math.random() * 0.5 - 0.25,
			},
			BNB: {
				price: 300 + Math.random() * 100 - 50,
				change24h: Math.random() * 12 - 6,
			},
			MATIC: {
				price: 0.8 + Math.random() * 0.4 - 0.2,
				change24h: Math.random() * 15 - 7.5,
			},
		};

		const priceInfo = mockPrices[symbol] || { price: 1, change24h: 0 };

		const priceData: PriceData = {
			symbol,
			price: priceInfo.price,
			change24h: priceInfo.change24h,
			lastUpdated: new Date(),
		};

		this.prices.set(symbol, priceData);
		return priceData;
	}

	static async getPrices(symbols: string[]): Promise<PriceData[]> {
		return Promise.all(symbols.map((symbol) => this.getPrice(symbol)));
	}

	static getCachedPrice(symbol: string): PriceData | null {
		return this.prices.get(symbol) || null;
	}
}

export interface TransactionRequest {
	to: string;
	value: string;
	data?: string;
	gasLimit?: string;
	gasPrice?: string;
}

export class TransactionBuilder {
	static buildNativeTransfer(to: string, amount: number): TransactionRequest {
		return {
			to,
			value: (amount * 1e18).toString(), // Convert to wei
			gasLimit: "21000",
		};
	}

	static buildTokenTransfer(
		tokenAddress: string,
		to: string,
		amount: number,
		decimals: number
	): TransactionRequest {
		// Mock ERC-20 transfer data
		const transferData = `0xa9059cbb${to.slice(2).padStart(64, "0")}${(
			amount * Math.pow(10, decimals)
		)
			.toString(16)
			.padStart(64, "0")}`;

		return {
			to: tokenAddress,
			value: "0",
			data: transferData,
			gasLimit: "65000",
		};
	}
}

export const validateAddress = (address: string): boolean => {
	return /^0x[a-fA-F0-9]{40}$/.test(address);
};

export const validateAmount = (
	amount: string,
	balance: number
): { isValid: boolean; error?: string } => {
	const numAmount = Number.parseFloat(amount);

	if (isNaN(numAmount) || numAmount <= 0) {
		return { isValid: false, error: "Invalid amount" };
	}

	if (numAmount > balance) {
		return { isValid: false, error: "Insufficient balance" };
	}

	return { isValid: true };
};

export const formatCurrency = (amount: number, currency = "USD"): string => {
	return new Intl.NumberFormat("en-US", {
		style: "currency",
		currency,
		minimumFractionDigits: 2,
		maximumFractionDigits: 2,
	}).format(amount);
};

export const formatCrypto = (
	amount: number,
	symbol: string,
	decimals = 4
): string => {
	return `${amount.toFixed(decimals)} ${symbol}`;
};

export const formatPercentage = (value: number): string => {
	const sign = value >= 0 ? "+" : "";
	return `${sign}${value.toFixed(2)}%`;
};

export const calculateCryptoAmount = (
	usdAmount: number,
	cryptoPrice: number
): number => {
	return usdAmount / cryptoPrice;
};

export const calculateUsdValue = (
	cryptoAmount: number,
	cryptoPrice: number
): number => {
	return cryptoAmount * cryptoPrice;
};

export const calculateGasFee = (gasLimit: number, gasPrice: number): number => {
	return (gasLimit * gasPrice) / 1e18; // Convert from wei to ETH
};

export interface SimulatedTransaction {
	hash: string;
	status: "pending" | "confirmed" | "failed";
	confirmations: number;
	gasUsed: number;
	effectiveGasPrice: number;
	blockNumber?: number;
	timestamp: Date;
}

export const simulateTransaction = async (
	request: TransactionRequest
): Promise<SimulatedTransaction> => {
	// Simulate network delay
	await new Promise((resolve) => setTimeout(resolve, 2000));

	const hash = `0x${Array.from({ length: 64 }, () =>
		Math.floor(Math.random() * 16).toString(16)
	).join("")}`;

	return {
		hash,
		status: Math.random() > 0.1 ? "confirmed" : "pending", // 90% success rate
		confirmations: Math.floor(Math.random() * 12) + 1,
		gasUsed: Number.parseInt(request.gasLimit || "21000"),
		effectiveGasPrice: Math.floor(Math.random() * 50 + 10) * 1e9, // 10-60 gwei
		blockNumber: Math.floor(Math.random() * 1000000) + 18000000,
		timestamp: new Date(),
	};
};
