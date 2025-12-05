import { CryptoPrice } from '@/types';

const COINGECKO_API = 'https://api.coingecko.com/api/v3';
const TWELVE_DATA_API = 'https://api.twelvedata.com';
const TWELVE_DATA_API_KEY = 'ef7394cc31534524800fcba527164727';

export async function fetchCryptoPrices(ids: string[] = []): Promise<CryptoPrice[]> {
  const defaultIds = ['bitcoin', 'ethereum', 'binancecoin', 'ripple', 'solana', 'cardano', 'dogecoin', 'tron', 'avalanche-2', 'chainlink'];
  const coinIds = ids.length > 0 ? ids : defaultIds;
  
  try {
    const response = await fetch(
      `${COINGECKO_API}/coins/markets?vs_currency=usd&ids=${coinIds.join(',')}&order=market_cap_desc&sparkline=false`
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch crypto prices');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching crypto prices:', error);
    return [];
  }
}

export async function fetchSingleCryptoPrice(id: string): Promise<number | null> {
  try {
    const response = await fetch(
      `${COINGECKO_API}/simple/price?ids=${id}&vs_currency=usd`
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch crypto price');
    }
    
    const data = await response.json();
    return data[id]?.usd || null;
  } catch (error) {
    console.error('Error fetching crypto price:', error);
    return null;
  }
}

export async function searchCrypto(query: string): Promise<{ id: string; name: string; symbol: string }[]> {
  try {
    const response = await fetch(
      `${COINGECKO_API}/search?query=${encodeURIComponent(query)}`
    );
    
    if (!response.ok) {
      throw new Error('Failed to search crypto');
    }
    
    const data = await response.json();
    return data.coins?.slice(0, 10) || [];
  } catch (error) {
    console.error('Error searching crypto:', error);
    return [];
  }
}

// Twelve Data API functions
export interface StockPriceData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  lastUpdated: string;
}

export async function fetchStockPrice(symbol: string, exchange: string): Promise<StockPriceData | null> {
  try {
    const response = await fetch(
      `${TWELVE_DATA_API}/price?symbol=${symbol}&apikey=${TWELVE_DATA_API_KEY}&exchange=${exchange}`
    );
    
    if (!response.ok) {
      console.error(`Failed to fetch price for ${symbol}`);
      return null;
    }
    
    const data = await response.json();
    
    if (data.code === 400 || data.status === 'error') {
      console.error(`Error fetching ${symbol}:`, data.message);
      return null;
    }
    
    return {
      symbol,
      name: symbol,
      price: parseFloat(data.price),
      change: 0,
      changePercent: 0,
      lastUpdated: new Date().toISOString(),
    };
  } catch (error) {
    console.error(`Error fetching stock price for ${symbol}:`, error);
    return null;
  }
}

export async function fetchStockQuote(symbol: string, exchange: string): Promise<StockPriceData | null> {
  try {
    const response = await fetch(
      `${TWELVE_DATA_API}/quote?symbol=${symbol}&apikey=${TWELVE_DATA_API_KEY}&exchange=${exchange}`
    );
    
    if (!response.ok) {
      console.error(`Failed to fetch quote for ${symbol}`);
      return null;
    }
    
    const data = await response.json();
    
    if (data.code === 400 || data.status === 'error') {
      console.error(`Error fetching ${symbol}:`, data.message);
      return null;
    }
    
    return {
      symbol: data.symbol,
      name: data.name || symbol,
      price: parseFloat(data.close),
      change: parseFloat(data.change) || 0,
      changePercent: parseFloat(data.percent_change) || 0,
      lastUpdated: new Date().toISOString(),
    };
  } catch (error) {
    console.error(`Error fetching stock quote for ${symbol}:`, error);
    return null;
  }
}

export async function fetchMultipleStockPrices(
  symbols: { symbol: string; name: string }[],
  exchange: string
): Promise<StockPriceData[]> {
  const prices: StockPriceData[] = [];
  
  // Fetch prices in parallel but with a small delay to avoid rate limits
  for (const stock of symbols) {
    const quote = await fetchStockQuote(stock.symbol, exchange);
    if (quote) {
      quote.name = stock.name; // Use the friendly name
      prices.push(quote);
    }
    // Small delay to avoid hitting rate limits (adjust as needed)
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  return prices;
}

// Egyptian stocks - users create their own
export const EGX_STOCKS: { symbol: string; name: string }[] = [];

// Saudi stocks - users create their own
export const TADAWUL_STOCKS: { symbol: string; name: string }[] = [];

// Fetch Egyptian stock prices
export async function fetchEgyptianStockPrices(): Promise<StockPriceData[]> {
  return fetchMultipleStockPrices(EGX_STOCKS, 'XEGX');
}

// Fetch Saudi stock prices
export async function fetchSaudiStockPrices(): Promise<StockPriceData[]> {
  return fetchMultipleStockPrices(TADAWUL_STOCKS, 'XTAD');
}
