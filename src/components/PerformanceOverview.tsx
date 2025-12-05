import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { formatCurrency } from '@/lib/calculations';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface PerformanceData {
  name: string;
  realizedPnL: number;
  unrealizedPnL: number;
  totalPnL: number;
}

interface PerformanceOverviewProps {
  cryptoRealizedPnL: number;
  cryptoUnrealizedPnL: number;
  egxRealizedPnL: number;
  egxUnrealizedPnL: number;
  tadawulRealizedPnL: number;
  tadawulUnrealizedPnL: number;
}

export function PerformanceOverview({
  cryptoRealizedPnL,
  cryptoUnrealizedPnL,
  egxRealizedPnL,
  egxUnrealizedPnL,
  tadawulRealizedPnL,
  tadawulUnrealizedPnL,
}: PerformanceOverviewProps) {
  const data: PerformanceData[] = [
    {
      name: 'Crypto',
      realizedPnL: cryptoRealizedPnL,
      unrealizedPnL: cryptoUnrealizedPnL,
      totalPnL: cryptoRealizedPnL + cryptoUnrealizedPnL,
    },
    {
      name: 'EGX',
      realizedPnL: egxRealizedPnL,
      unrealizedPnL: egxUnrealizedPnL,
      totalPnL: egxRealizedPnL + egxUnrealizedPnL,
    },
    {
      name: 'Tadawul',
      realizedPnL: tadawulRealizedPnL,
      unrealizedPnL: tadawulUnrealizedPnL,
      totalPnL: tadawulRealizedPnL + tadawulUnrealizedPnL,
    },
  ];

  const totalRealizedPnL = cryptoRealizedPnL + egxRealizedPnL + tadawulRealizedPnL;
  const totalUnrealizedPnL = cryptoUnrealizedPnL + egxUnrealizedPnL + tadawulUnrealizedPnL;
  const totalPnL = totalRealizedPnL + totalUnrealizedPnL;

  const hasData = data.some(d => d.realizedPnL !== 0 || d.unrealizedPnL !== 0);

  if (!hasData) {
    return (
      <div className="bg-card border border-border rounded-xl p-6">
        <h3 className="text-lg font-semibold mb-4">Performance Overview</h3>
        <div className="h-[350px] flex items-center justify-center text-muted-foreground">
          No performance data yet
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-xl p-6">
      <h3 className="text-lg font-semibold mb-2">Performance Overview</h3>
      <p className="text-sm text-muted-foreground mb-4">Profit & Loss breakdown by market</p>
      
      {/* Total Summary */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-muted/50 rounded-lg p-4">
          <p className="text-xs text-muted-foreground mb-1">Total P&L</p>
          <p className={`text-xl font-bold font-mono-nums flex items-center gap-1 ${
            totalPnL >= 0 ? 'text-success' : 'text-destructive'
          }`}>
            {totalPnL >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
            {formatCurrency(totalPnL)}
          </p>
        </div>
        <div className="bg-blue-500/10 rounded-lg p-4">
          <p className="text-xs text-muted-foreground mb-1">Realized</p>
          <p className={`text-xl font-bold font-mono-nums ${
            totalRealizedPnL >= 0 ? 'text-success' : 'text-destructive'
          }`}>
            {formatCurrency(totalRealizedPnL)}
          </p>
        </div>
        <div className="bg-purple-500/10 rounded-lg p-4">
          <p className="text-xs text-muted-foreground mb-1">Unrealized</p>
          <p className={`text-xl font-bold font-mono-nums ${
            totalUnrealizedPnL >= 0 ? 'text-success' : 'text-destructive'
          }`}>
            {formatCurrency(totalUnrealizedPnL)}
          </p>
        </div>
      </div>

      {/* Chart */}
      <div className="h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis 
              dataKey="name" 
              stroke="hsl(var(--muted-foreground))"
              style={{ fontSize: '12px' }}
            />
            <YAxis 
              stroke="hsl(var(--muted-foreground))"
              style={{ fontSize: '12px' }}
              tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-popover border border-border rounded-lg p-3 shadow-lg">
                      <p className="font-semibold mb-2">{data.name}</p>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between gap-4">
                          <span className="text-muted-foreground">Realized:</span>
                          <span className={data.realizedPnL >= 0 ? 'text-success' : 'text-destructive'}>
                            {formatCurrency(data.realizedPnL)}
                          </span>
                        </div>
                        <div className="flex justify-between gap-4">
                          <span className="text-muted-foreground">Unrealized:</span>
                          <span className={data.unrealizedPnL >= 0 ? 'text-success' : 'text-destructive'}>
                            {formatCurrency(data.unrealizedPnL)}
                          </span>
                        </div>
                        <div className="flex justify-between gap-4 pt-1 border-t border-border">
                          <span className="font-medium">Total:</span>
                          <span className={`font-medium ${data.totalPnL >= 0 ? 'text-success' : 'text-destructive'}`}>
                            {formatCurrency(data.totalPnL)}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar dataKey="realizedPnL" stackId="a" fill="#3b82f6" radius={[0, 0, 4, 4]}>
              {data.map((entry, index) => (
                <Cell key={`cell-realized-${index}`} fill={entry.realizedPnL >= 0 ? '#10b981' : '#ef4444'} />
              ))}
            </Bar>
            <Bar dataKey="unrealizedPnL" stackId="a" fill="#a855f7" radius={[4, 4, 0, 0]}>
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-unrealized-${index}`} 
                  fill={entry.unrealizedPnL >= 0 ? '#10b98180' : '#ef444480'}
                  opacity={0.7}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="flex justify-center gap-6 mt-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm bg-green-500" />
          <span className="text-muted-foreground">Realized P&L</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm bg-green-500/70" />
          <span className="text-muted-foreground">Unrealized P&L</span>
        </div>
      </div>
    </div>
  );
}
