import { useEffect, useState, useMemo, useCallback } from 'react';
import { Layout } from '@/components/Layout';
import { StatCard } from '@/components/StatCard';
import { TradeTable } from '@/components/TradeTable';
import { HoldingsTable } from '@/components/HoldingsTable';
import { AddTradeDialog } from '@/components/AddTradeDialog';
import { PriceCard } from '@/components/PriceCard';
import { PortfolioChart } from '@/components/PortfolioChart';
import { PnLChart } from '@/components/PnLChart';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { Trade, CryptoPrice } from '@/types';
import { calculateHoldings, calculateRealizedPnL, calculatePortfolioSummary, formatCurrency } from '@/lib/calculations';
import { fetchCryptoPrices } from '@/lib/api';
import { Bitcoin, Wallet, TrendingUp, TrendingDown, RefreshCw, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

const CRYPTO_ASSETS = [
  { symbol: 'bitcoin', name: 'Bitcoin' },
  { symbol: 'ethereum', name: 'Ethereum' },
  { symbol: 'binancecoin', name: 'BNB' },
  { symbol: 'ripple', name: 'XRP' },
  { symbol: 'solana', name: 'Solana' },
  { symbol: 'cardano', name: 'Cardano' },
  { symbol: 'dogecoin', name: 'Dogecoin' },
  { symbol: 'tron', name: 'TRON' },
  { symbol: 'avalanche-2', name: 'Avalanche' },
  { symbol: 'chainlink', name: 'Chainlink' },
];

const Crypto = () => {
  const [trades, setTrades] = useLocalStorage<Trade[]>('crypto-trades', []);
  const [prices, setPrices] = useState<CryptoPrice[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [apiError, setApiError] = useState(false);

  const loadPrices = useCallback(async () => {
    setLoading(true);
    setApiError(false);
    try {
      const data = await fetchCryptoPrices();
      if (data.length > 0) {
        setPrices(data);
        setLastUpdate(new Date());
      } else {
        setApiError(true);
        toast.error('Failed to fetch prices. CoinGecko may be rate-limiting requests.');
      }
    } catch (error) {
      setApiError(true);
      toast.error('Failed to fetch crypto prices');
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadPrices();
    // Auto-refresh every 2 minutes (to avoid rate limits)
    const interval = setInterval(loadPrices, 120000);
    return () => clearInterval(interval);
  }, [loadPrices]);

  const priceMap = useMemo(() => {
    const map = new Map<string, number>();
    prices.forEach(p => map.set(p.id, p.current_price));
    return map;
  }, [prices]);

  const holdings = useMemo(() => 
    calculateHoldings(trades, priceMap),
    [trades, priceMap]
  );

  const realizedPnL = useMemo(() => 
    calculateRealizedPnL(trades),
    [trades]
  );

  const summary = useMemo(() => 
    calculatePortfolioSummary(holdings, realizedPnL),
    [holdings, realizedPnL]
  );

  const handleAddTrade = (trade: Omit<Trade, 'id'>) => {
    const newTrade: Trade = {
      ...trade,
      id: crypto.randomUUID(),
    };
    setTrades(prev => [...prev, newTrade]);
  };

  const handleDeleteTrade = (id: string) => {
    setTrades(prev => prev.filter(t => t.id !== id));
  };

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Bitcoin className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Cryptocurrency</h1>
              <p className="text-muted-foreground">
                {lastUpdate && `Last updated: ${lastUpdate.toLocaleTimeString()}`}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={loadPrices}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
            <AddTradeDialog onAdd={handleAddTrade} assets={CRYPTO_ASSETS} />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Portfolio Value"
            value={formatCurrency(summary.currentValue)}
            icon={<Wallet className="h-5 w-5" />}
          />
          <StatCard
            title="Total Invested"
            value={formatCurrency(summary.totalInvested)}
            icon={<Bitcoin className="h-5 w-5" />}
          />
          <StatCard
            title="Unrealized P&L"
            value={formatCurrency(summary.unrealizedPnL)}
            change={summary.unrealizedPnLPercent}
            icon={summary.unrealizedPnL >= 0 ? <TrendingUp className="h-5 w-5" /> : <TrendingDown className="h-5 w-5" />}
          />
          <StatCard
            title="Realized P&L"
            value={formatCurrency(summary.realizedPnL)}
            icon={summary.realizedPnL >= 0 ? <TrendingUp className="h-5 w-5" /> : <TrendingDown className="h-5 w-5" />}
          />
        </div>

        {/* Live Prices */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-xl font-semibold">Live Prices</h2>
            {apiError && (
              <div className="flex items-center gap-1 text-sm text-amber-500">
                <AlertCircle className="h-4 w-4" />
                <span>API rate limited - prices may be stale</span>
              </div>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
            {prices.slice(0, 10).map((coin) => (
              <PriceCard
                key={coin.id}
                symbol={coin.symbol}
                name={coin.name}
                price={coin.current_price}
                change={coin.price_change_percentage_24h}
                image={coin.image}
              />
            ))}
          </div>
        </div>

        {/* Charts */}
        {holdings.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <PortfolioChart holdings={holdings} />
            <PnLChart holdings={holdings} />
          </div>
        )}

        {/* Holdings & Trades */}
        <Tabs defaultValue="holdings" className="space-y-4">
          <TabsList>
            <TabsTrigger value="holdings">Holdings</TabsTrigger>
            <TabsTrigger value="trades">Trade History</TabsTrigger>
          </TabsList>
          <TabsContent value="holdings">
            <HoldingsTable holdings={holdings} />
          </TabsContent>
          <TabsContent value="trades">
            <TradeTable trades={trades} onDelete={handleDeleteTrade} />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Crypto;
