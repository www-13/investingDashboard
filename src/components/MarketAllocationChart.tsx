import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { formatCurrency } from '@/lib/calculations';
import { Bitcoin, Building2, Landmark } from 'lucide-react';

interface MarketAllocationData {
  name: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

interface MarketAllocationChartProps {
  cryptoValue: number;
  egxValue: number;
  tadawulValue: number;
}

const MARKET_COLORS = {
  crypto: '#F7931A',
  egx: '#e11d48',
  tadawul: '#059669',
};

export function MarketAllocationChart({ cryptoValue, egxValue, tadawulValue }: MarketAllocationChartProps) {
  const data: MarketAllocationData[] = [
    {
      name: 'Cryptocurrency',
      value: cryptoValue,
      icon: Bitcoin,
      color: MARKET_COLORS.crypto,
    },
    {
      name: 'Egyptian Exchange',
      value: egxValue,
      icon: Building2,
      color: MARKET_COLORS.egx,
    },
    {
      name: 'Saudi Exchange',
      value: tadawulValue,
      icon: Landmark,
      color: MARKET_COLORS.tadawul,
    },
  ].filter(d => d.value > 0);

  const totalValue = data.reduce((sum, d) => sum + d.value, 0);

  if (totalValue === 0) {
    return (
      <div className="bg-card border border-border rounded-xl p-6">
        <h3 className="text-lg font-semibold mb-4">Portfolio Allocation by Market</h3>
        <div className="h-[350px] flex items-center justify-center text-muted-foreground">
          No investments yet. Start by adding trades!
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-xl p-6">
      <h3 className="text-lg font-semibold mb-4">Portfolio Allocation by Market</h3>
      <div className="h-[350px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={70}
              outerRadius={120}
              paddingAngle={5}
              dataKey="value"
              label={({ name, percent }) => `${name.split(' ')[0]} ${(percent * 100).toFixed(1)}%`}
              labelLine={{ stroke: 'hsl(var(--border))', strokeWidth: 1 }}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} stroke="hsl(var(--background))" strokeWidth={2} />
              ))}
            </Pie>
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const item = payload[0].payload;
                  const percentage = ((item.value / totalValue) * 100).toFixed(1);
                  const Icon = item.icon;
                  return (
                    <div className="bg-popover border border-border rounded-lg p-4 shadow-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Icon className="h-4 w-4" style={{ color: item.color }} />
                        <p className="font-semibold">{item.name}</p>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {formatCurrency(item.value)}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {percentage}% of total portfolio
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-6 space-y-3">
        {data.map((item, index) => {
          const Icon = item.icon;
          const percentage = ((item.value / totalValue) * 100).toFixed(1);
          return (
            <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <div className="flex items-center gap-3">
                <div 
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: `${item.color}20` }}
                >
                  <Icon className="h-5 w-5" style={{ color: item.color }} />
                </div>
                <div>
                  <p className="font-medium">{item.name}</p>
                  <p className="text-sm text-muted-foreground">{formatCurrency(item.value)}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-mono-nums font-semibold text-lg">{percentage}%</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
