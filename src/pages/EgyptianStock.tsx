import { useMemo } from 'react';
import { Layout } from '@/components/Layout';
import { StatCard } from '@/components/StatCard';
import { TradeTable } from '@/components/TradeTable';
import { AddTradeDialog } from '@/components/AddTradeDialog';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { Trade } from '@/types';
import { calculateRealizedPnL, formatCurrency } from '@/lib/calculations';
import { Building2, TrendingUp, TrendingDown } from 'lucide-react';

const EgyptianStock = () => {
  const [trades, setTrades] = useLocalStorage<Trade[]>('egx-trades', []);
  const [customStocks, setCustomStocks] = useLocalStorage<{ symbol: string; name: string }[]>('egx-custom-stocks', []);

  const realizedPnL = useMemo(() => 
    calculateRealizedPnL(trades),
    [trades]
  );

  // Calculate total invested from all buy trades
  const totalInvested = useMemo(() => {
    return trades
      .filter(t => t.type === 'buy')
      .reduce((sum, t) => sum + (t.quantity * t.price), 0);
  }, [trades]);

  const handleAddTrade = (trade: Omit<Trade, 'id'>) => {
    const newTrade: Trade = {
      ...trade,
      id: crypto.randomUUID(),
    };
    setTrades(prev => [...prev, newTrade]);

    // Add stock to custom stocks if not already there
    if (!customStocks.find(s => s.symbol === trade.symbol)) {
      setCustomStocks(prev => [...prev, { symbol: trade.symbol, name: trade.name }]);
    }
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
              <Building2 className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Egyptian Stock Exchange</h1>
              <p className="text-muted-foreground">EGX - Manual Price Tracking</p>
            </div>
          </div>
          <AddTradeDialog onAdd={handleAddTrade} assets={customStocks} allowCustom />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <StatCard
            title="Total Invested"
            value={formatCurrency(totalInvested)}
            icon={<Building2 className="h-5 w-5" />}
          />
          <StatCard
            title="Realized P&L"
            value={formatCurrency(realizedPnL)}
            icon={realizedPnL >= 0 ? <TrendingUp className="h-5 w-5" /> : <TrendingDown className="h-5 w-5" />}
          />
        </div>

        {/* Trade History */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Trade History</h2>
          <TradeTable trades={trades} onDelete={handleDeleteTrade} />
        </div>
      </div>
    </Layout>
  );
};

export default EgyptianStock;
