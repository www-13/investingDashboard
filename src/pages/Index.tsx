import { useEffect, useState, useMemo } from 'react';
import { Layout } from '@/components/Layout';
import { StatCard } from '@/components/StatCard';
import { HoldingsTable } from '@/components/HoldingsTable';
import { MarketAllocationChart } from '@/components/MarketAllocationChart';
import { PerformanceOverview } from '@/components/PerformanceOverview';
import { PortfolioChart } from '@/components/PortfolioChart';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { Trade, CryptoPrice } from '@/types';
import { calculateHoldings, calculateRealizedPnL, calculatePortfolioSummary, formatCurrency } from '@/lib/calculations';
import { fetchCryptoPrices } from '@/lib/api';
import { Wallet, TrendingUp, TrendingDown, DollarSign, Bitcoin, Building2, Landmark } from 'lucide-react';
import { Link } from 'react-router-dom';

const Index = () => {
  const [cryptoTrades] = useLocalStorage<Trade[]>('crypto-trades', []);
  const [egxTrades] = useLocalStorage<Trade[]>('egx-trades', []);
  const [tadawulTrades] = useLocalStorage<Trade[]>('tadawul-trades', []);
  
  const [cryptoPrices, setCryptoPrices] = useState<CryptoPrice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPrices = async () => {
      setLoading(true);
      const prices = await fetchCryptoPrices();
      setCryptoPrices(prices);
      setLoading(false);
    };
    loadPrices();
  }, []);

  // Calculate crypto holdings
  const cryptoPriceMap = useMemo(() => {
    const map = new Map<string, number>();
    cryptoPrices.forEach(p => map.set(p.id, p.current_price));
    return map;
  }, [cryptoPrices]);

  const cryptoHoldings = useMemo(() => 
    calculateHoldings(cryptoTrades, cryptoPriceMap),
    [cryptoTrades, cryptoPriceMap]
  );

  const cryptoRealizedPnL = useMemo(() => 
    calculateRealizedPnL(cryptoTrades),
    [cryptoTrades]
  );

  const cryptoSummary = useMemo(() => 
    calculatePortfolioSummary(cryptoHoldings, cryptoRealizedPnL),
    [cryptoHoldings, cryptoRealizedPnL]
  );

  // Calculate EGX data (no price tracking - only realized P&L and total invested)
  const egxRealizedPnL = useMemo(() => 
    calculateRealizedPnL(egxTrades),
    [egxTrades]
  );

  const egxTotalInvested = useMemo(() => {
    return egxTrades
      .filter(t => t.type === 'buy')
      .reduce((sum, t) => sum + (t.quantity * t.price), 0);
  }, [egxTrades]);

  const egxTradeCount = useMemo(() => {
    const symbols = new Set(egxTrades.map(t => t.symbol));
    return symbols.size;
  }, [egxTrades]);

  // Calculate Tadawul data (no price tracking - only realized P&L and total invested)
  const tadawulRealizedPnL = useMemo(() => 
    calculateRealizedPnL(tadawulTrades),
    [tadawulTrades]
  );

  const tadawulTotalInvested = useMemo(() => {
    return tadawulTrades
      .filter(t => t.type === 'buy')
      .reduce((sum, t) => sum + (t.quantity * t.price), 0);
  }, [tadawulTrades]);

  const tadawulTradeCount = useMemo(() => {
    const symbols = new Set(tadawulTrades.map(t => t.symbol));
    return symbols.size;
  }, [tadawulTrades]);

  // Calculate EGX holdings (using total invested as value)
  const egxHoldings = useMemo(() => {
    const holdingsMap = new Map<string, { symbol: string; name: string; totalQuantity: number; totalCost: number }>();
    
    for (const trade of egxTrades) {
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
        existing.totalQuantity -= trade.quantity;
      }
      
      holdingsMap.set(trade.symbol, existing);
    }
    
    return Array.from(holdingsMap.values())
      .filter(h => h.totalQuantity > 0)
      .map(h => ({
        symbol: h.symbol,
        name: h.name,
        quantity: h.totalQuantity,
        avgBuyPrice: h.totalCost / h.totalQuantity,
        currentPrice: h.totalCost / h.totalQuantity, // Use avg buy price as current price
        totalInvested: h.totalCost,
        currentValue: h.totalCost, // Use total invested as current value
        unrealizedPnL: 0,
        unrealizedPnLPercent: 0,
      }));
  }, [egxTrades]);

  // Calculate Tadawul holdings (using total invested as value)
  const tadawulHoldings = useMemo(() => {
    const holdingsMap = new Map<string, { symbol: string; name: string; totalQuantity: number; totalCost: number }>();
    
    for (const trade of tadawulTrades) {
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
        existing.totalQuantity -= trade.quantity;
      }
      
      holdingsMap.set(trade.symbol, existing);
    }
    
    return Array.from(holdingsMap.values())
      .filter(h => h.totalQuantity > 0)
      .map(h => ({
        symbol: h.symbol,
        name: h.name,
        quantity: h.totalQuantity,
        avgBuyPrice: h.totalCost / h.totalQuantity,
        currentPrice: h.totalCost / h.totalQuantity, // Use avg buy price as current price
        totalInvested: h.totalCost,
        currentValue: h.totalCost, // Use total invested as current value
        unrealizedPnL: 0,
        unrealizedPnLPercent: 0,
      }));
  }, [tadawulTrades]);

  // Total portfolio (only crypto has unrealized P&L)
  const totalValue = cryptoSummary.currentValue + egxTotalInvested + tadawulTotalInvested;
  const totalInvested = cryptoSummary.totalInvested + egxTotalInvested + tadawulTotalInvested;
  const totalUnrealizedPnL = cryptoSummary.unrealizedPnL; // Only crypto tracks unrealized P&L
  const totalRealizedPnL = cryptoSummary.realizedPnL + egxRealizedPnL + tadawulRealizedPnL;
  const totalUnrealizedPnLPercent = totalInvested > 0 ? (totalUnrealizedPnL / totalInvested) * 100 : 0;

  // For the chart - show all holdings from all markets
  const allHoldingsForChart = [...cryptoHoldings, ...egxHoldings, ...tadawulHoldings];
  
  // For the holdings table - only show crypto (only crypto has current prices)
  const allHoldingsForTable = [...cryptoHoldings];

  const marketCards = [
    {
      title: 'Crypto',
      icon: Bitcoin,
      link: '/crypto',
      value: cryptoSummary.currentValue,
      invested: cryptoSummary.totalInvested,
      realizedPnL: cryptoSummary.realizedPnL,
      unrealizedPnL: cryptoSummary.unrealizedPnL,
      unrealizedPnLPercent: cryptoSummary.unrealizedPnLPercent,
      holdings: cryptoHoldings.length,
      hasUnrealizedPnL: true,
    },
    {
      title: 'Egyptian Exchange',
      icon: Building2,
      link: '/egx',
      value: egxTotalInvested,
      invested: egxTotalInvested,
      realizedPnL: egxRealizedPnL,
      unrealizedPnL: 0,
      unrealizedPnLPercent: 0,
      holdings: egxTradeCount,
      hasUnrealizedPnL: false,
    },
    {
      title: 'Saudi Exchange',
      icon: Landmark,
      link: '/tadawul',
      value: tadawulTotalInvested,
      invested: tadawulTotalInvested,
      realizedPnL: tadawulRealizedPnL,
      unrealizedPnL: 0,
      unrealizedPnLPercent: 0,
      holdings: tadawulTradeCount,
      hasUnrealizedPnL: false,
    },
  ];

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold mb-2">Portfolio Dashboard</h1>
          <p className="text-muted-foreground">
            Track your investments across crypto and stock markets
          </p>
        </div>

        {/* Main Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Portfolio Value"
            value={formatCurrency(totalValue)}
            icon={<Wallet className="h-5 w-5" />}
          />
          <StatCard
            title="Total Invested"
            value={formatCurrency(totalInvested)}
            icon={<DollarSign className="h-5 w-5" />}
          />
          <StatCard
            title="Unrealized P&L"
            value={formatCurrency(totalUnrealizedPnL)}
            change={totalUnrealizedPnLPercent}
            icon={totalUnrealizedPnL >= 0 ? <TrendingUp className="h-5 w-5" /> : <TrendingDown className="h-5 w-5" />}
          />
          <StatCard
            title="Realized P&L"
            value={formatCurrency(totalRealizedPnL)}
            change={totalRealizedPnL >= 0 ? (totalRealizedPnL > 0 ? 100 : 0) : -100}
            icon={totalRealizedPnL >= 0 ? <TrendingUp className="h-5 w-5" /> : <TrendingDown className="h-5 w-5" />}
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <MarketAllocationChart
            cryptoValue={cryptoSummary.currentValue}
            egxValue={egxTotalInvested}
            tadawulValue={tadawulTotalInvested}
          />
          <PerformanceOverview
            cryptoRealizedPnL={cryptoSummary.realizedPnL}
            cryptoUnrealizedPnL={cryptoSummary.unrealizedPnL}
            egxRealizedPnL={egxRealizedPnL}
            egxUnrealizedPnL={0}
            tadawulRealizedPnL={tadawulRealizedPnL}
            tadawulUnrealizedPnL={0}
          />
        </div>

        {/* Asset Allocation */}
        {allHoldingsForChart.length > 0 && (
          <PortfolioChart holdings={allHoldingsForChart} title="Portfolio Allocation by Investment" />
        )}

        {/* Market Breakdown */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Markets</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {marketCards.map((market, index) => (
              <Link
                key={market.title}
                to={market.link}
                className="bg-card border border-border rounded-xl p-5 card-hover animate-fade-up block"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <market.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{market.title}</h3>
                    <p className="text-xs text-muted-foreground">{market.holdings} holdings</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">{market.hasUnrealizedPnL ? 'Current Value' : 'Total Invested'}</span>
                    <span className="font-mono-nums font-medium">{formatCurrency(market.value)}</span>
                  </div>
                  {market.hasUnrealizedPnL ? (
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Unrealized P&L</span>
                      <span className={`font-mono-nums font-medium ${market.unrealizedPnL >= 0 ? 'text-success' : 'text-destructive'}`}>
                        {market.unrealizedPnL >= 0 ? '+' : ''}{formatCurrency(market.unrealizedPnL)}
                        <span className="text-xs ml-1">({market.unrealizedPnL >= 0 ? '+' : ''}{market.unrealizedPnLPercent.toFixed(2)}%)</span>
                      </span>
                    </div>
                  ) : (
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Realized P&L</span>
                      <span className={`font-mono-nums font-medium ${market.realizedPnL >= 0 ? 'text-success' : 'text-destructive'}`}>
                        {market.realizedPnL >= 0 ? '+' : ''}{formatCurrency(market.realizedPnL)}
                      </span>
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Crypto Holdings */}
        {allHoldingsForTable.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Crypto Holdings</h2>
            <HoldingsTable holdings={allHoldingsForTable} />
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Index;
