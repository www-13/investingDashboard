import { Trade, Holding, PortfolioSummary, StockPrice } from '@/types';

export function calculateHoldings(trades: Trade[], currentPrices: Map<string, number>): Holding[] {
  const holdingsMap = new Map<string, {
    symbol: string;
    name: string;
    totalQuantity: number;
    totalCost: number;
  }>();

  // Process trades to calculate holdings
  for (const trade of trades) {
    const existing = holdingsMap.get(trade.symbol) || {
      symbol: trade.symbol,
      name: trade.name,
      totalQuantity: 0,
      totalCost: 0,
    };

    if (trade.type === 'buy') {
      existing.totalQuantity += trade.quantity;
      existing.totalCost += trade.quantity * trade.price;
    } else {
      // For sells, reduce quantity (FIFO simplified)
      existing.totalQuantity -= trade.quantity;
    }

    holdingsMap.set(trade.symbol, existing);
  }

  // Convert to holdings array
  const holdings: Holding[] = [];
  
  for (const [symbol, data] of holdingsMap) {
    if (data.totalQuantity <= 0) continue;

    const currentPrice = currentPrices.get(symbol) || 0;
    const avgBuyPrice = data.totalCost / data.totalQuantity;
    const currentValue = data.totalQuantity * currentPrice;
    const unrealizedPnL = currentValue - data.totalCost;
    const unrealizedPnLPercent = data.totalCost > 0 ? (unrealizedPnL / data.totalCost) * 100 : 0;

    holdings.push({
      symbol: data.symbol,
      name: data.name,
      quantity: data.totalQuantity,
      avgBuyPrice,
      currentPrice,
      totalInvested: data.totalCost,
      currentValue,
      unrealizedPnL,
      unrealizedPnLPercent,
    });
  }

  return holdings;
}

export function calculateRealizedPnL(trades: Trade[]): number {
  // Group trades by symbol
  const tradesBySymbol = new Map<string, Trade[]>();
  
  for (const trade of trades) {
    const existing = tradesBySymbol.get(trade.symbol) || [];
    existing.push(trade);
    tradesBySymbol.set(trade.symbol, existing);
  }

  let totalRealizedPnL = 0;

  for (const [, symbolTrades] of tradesBySymbol) {
    // Sort by date
    const sorted = [...symbolTrades].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    // Use FIFO to calculate realized P&L
    const buyQueue: { quantity: number; price: number }[] = [];
    
    for (const trade of sorted) {
      if (trade.type === 'buy') {
        buyQueue.push({ quantity: trade.quantity, price: trade.price });
      } else {
        // Sell - match against buys FIFO
        let remainingToSell = trade.quantity;
        
        while (remainingToSell > 0 && buyQueue.length > 0) {
          const firstBuy = buyQueue[0];
          const sellQty = Math.min(remainingToSell, firstBuy.quantity);
          
          const costBasis = sellQty * firstBuy.price;
          const saleProceeds = sellQty * trade.price;
          totalRealizedPnL += saleProceeds - costBasis;
          
          firstBuy.quantity -= sellQty;
          remainingToSell -= sellQty;
          
          if (firstBuy.quantity <= 0) {
            buyQueue.shift();
          }
        }
      }
    }
  }

  return totalRealizedPnL;
}

export function calculatePortfolioSummary(holdings: Holding[], realizedPnL: number): PortfolioSummary {
  const totalInvested = holdings.reduce((sum, h) => sum + h.totalInvested, 0);
  const currentValue = holdings.reduce((sum, h) => sum + h.currentValue, 0);
  const unrealizedPnL = currentValue - totalInvested;
  const unrealizedPnLPercent = totalInvested > 0 ? (unrealizedPnL / totalInvested) * 100 : 0;

  return {
    totalInvested,
    currentValue,
    unrealizedPnL,
    unrealizedPnLPercent,
    realizedPnL,
  };
}

export function formatCurrency(value: number, currency: string = 'USD'): string {
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return formatter.format(value);
}

export function formatNumber(value: number, decimals: number = 2): string {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

export function formatPercent(value: number): string {
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(2)}%`;
}
