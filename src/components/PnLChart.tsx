import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell } from 'recharts';
import { Holding } from '@/types';
import { formatCurrency } from '@/lib/calculations';

interface PnLChartProps {
  holdings: Holding[];
  title?: string;
}

export function PnLChart({ holdings, title = "Unrealized P&L by Asset" }: PnLChartProps) {
  const data = holdings
    .filter(h => h.quantity > 0)
    .map(h => ({
      name: h.symbol.toUpperCase(),
      pnl: h.unrealizedPnL,
      percent: h.unrealizedPnLPercent,
    }))
    .sort((a, b) => b.pnl - a.pnl);

  if (data.length === 0) {
    return (
      <div className="bg-card border border-border rounded-xl p-6">
        <h3 className="text-lg font-semibold mb-4">{title}</h3>
        <div className="h-[300px] flex items-center justify-center text-muted-foreground">
          No holdings to display
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-xl p-6">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ left: 60, right: 20 }}>
            <XAxis type="number" tickFormatter={(v) => `$${v.toFixed(0)}`} />
            <YAxis type="category" dataKey="name" width={50} />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const item = payload[0].payload;
                  return (
                    <div className="bg-popover border border-border rounded-lg p-3 shadow-lg">
                      <p className="font-semibold">{item.name}</p>
                      <p className={`text-sm ${item.pnl >= 0 ? 'text-success' : 'text-destructive'}`}>
                        {formatCurrency(item.pnl)} ({item.percent >= 0 ? '+' : ''}{item.percent.toFixed(2)}%)
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar dataKey="pnl" radius={[0, 4, 4, 0]}>
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.pnl >= 0 ? 'hsl(var(--success))' : 'hsl(var(--destructive))'} 
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
