// Price API utility for converting crypto to USD
// Using CoinGecko API for real-time price data

interface PriceData {
  [key: string]: {
    usd: number;
  };
}

const COINGECKO_API_URL = "https://api.coingecko.com/api/v3/simple/price";

// Cache for price data (5 minutes)
const priceCache = new Map<string, { price: number; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Supported cryptocurrencies
const SUPPORTED_CURRENCIES = {
  ethereum: "eth",
  bitcoin: "btc", 
  "usd-coin": "usdc",
  "binancecoin": "bnb",
  matic: "matic",
} as const;

export async function getCryptoPrice(
  currency: string,
  amount: number
): Promise<{ usdValue: number; price: number }> {
  const normalizedCurrency = currency.toLowerCase();
  
  // Check cache first
  const cached = priceCache.get(normalizedCurrency);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return {
      usdValue: amount * cached.price,
      price: cached.price,
    };
  }

  try {
    // Map currency to CoinGecko ID
    const coinId = Object.entries(SUPPORTED_CURRENCIES).find(
      ([_, symbol]) => symbol === normalizedCurrency
    )?.[0];

    if (!coinId) {
      throw new Error(`Unsupported currency: ${currency}`);
    }

    const response = await fetch(
      `${COINGECKO_API_URL}?ids=${coinId}&vs_currencies=usd`
    );

    if (!response.ok) {
      throw new Error(`Price API error: ${response.status}`);
    }

    const data: PriceData = await response.json();
    const price = data[coinId]?.usd;

    if (!price) {
      throw new Error(`Price not found for ${currency}`);
    }

    // Cache the price
    priceCache.set(normalizedCurrency, {
      price,
      timestamp: Date.now(),
    });

    return {
      usdValue: amount * price,
      price,
    };
  } catch (error) {
    console.error("Failed to fetch crypto price:", error);
    
    // Fallback prices (for development/testing)
    const fallbackPrices: Record<string, number> = {
      eth: 1700,
      btc: 45000,
      usdc: 1,
      bnb: 300,
      matic: 0.8,
    };

    const fallbackPrice = fallbackPrices[normalizedCurrency] || 1;
    
    return {
      usdValue: amount * fallbackPrice,
      price: fallbackPrice,
    };
  }
}

export async function getMultipleCryptoPrices(
  currencies: string[]
): Promise<Record<string, number>> {
  const coinIds = currencies
    .map((currency) => {
      const normalizedCurrency = currency.toLowerCase();
      return Object.entries(SUPPORTED_CURRENCIES).find(
        ([_, symbol]) => symbol === normalizedCurrency
      )?.[0];
    })
    .filter(Boolean);

  if (coinIds.length === 0) {
    return {};
  }

  try {
    const response = await fetch(
      `${COINGECKO_API_URL}?ids=${coinIds.join(",")}&vs_currencies=usd`
    );

    if (!response.ok) {
      throw new Error(`Price API error: ${response.status}`);
    }

    const data: PriceData = await response.json();
    const prices: Record<string, number> = {};

    currencies.forEach((currency) => {
      const normalizedCurrency = currency.toLowerCase();
      const coinId = Object.entries(SUPPORTED_CURRENCIES).find(
        ([_, symbol]) => symbol === normalizedCurrency
      )?.[0];
      
      if (coinId && data[coinId]) {
        prices[normalizedCurrency] = data[coinId].usd;
      }
    });

    return prices;
  } catch (error) {
    console.error("Failed to fetch multiple crypto prices:", error);
    
    // Return fallback prices
    const fallbackPrices: Record<string, number> = {
      eth: 1700,
      btc: 45000,
      usdc: 1,
      bnb: 300,
      matic: 0.8,
    };

    return currencies.reduce((acc, currency) => {
      const normalizedCurrency = currency.toLowerCase();
      acc[normalizedCurrency] = fallbackPrices[normalizedCurrency] || 1;
      return acc;
    }, {} as Record<string, number>);
  }
}

// Get company wallet address for a specific chain
export function getCompanyWalletAddress(chain: string): string {
  const companyWallets: Record<string, string> = {
    ethereum: "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b1",
    bsc: "0x8ba1f109551bD432803012645Hac136c22C85B",
    polygon: "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984",
  };

  return companyWallets[chain.toLowerCase()] || companyWallets.ethereum;
}

// Format currency amount
export function formatCurrency(amount: number, currency: string = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(amount);
}

// Format crypto amount
export function formatCryptoAmount(amount: number, currency: string): string {
  const decimals = currency.toLowerCase() === "btc" ? 8 : 6;
  return `${amount.toFixed(decimals)} ${currency.toUpperCase()}`;
}
