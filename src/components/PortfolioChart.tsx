import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Holding } from '@/types';
import { formatCurrency } from '@/lib/calculations';

interface PortfolioChartProps {
  holdings: Holding[];
  title?: string;
}

const COLORS = [
  'hsl(var(--primary))',
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
  '#8884d8',
  '#82ca9d',
  '#ffc658',
  '#ff7c43',
];

export function PortfolioChart({ holdings, title = "Portfolio Allocation" }: PortfolioChartProps) {
  const data = holdings
    .filter(h => h.currentValue > 0)
    .map((h, index) => ({
      name: h.symbol.toUpperCase(),
      value: h.currentValue,
      color: COLORS[index % COLORS.length],
    }))
    .sort((a, b) => b.value - a.value);

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

  const totalValue = data.reduce((sum, d) => sum + d.value, 0);

  return (
    <div className="bg-card border border-border rounded-xl p-6">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={2}
              dataKey="value"
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              labelLine={false}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} stroke="transparent" />
              ))}
            </Pie>
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const item = payload[0].payload;
                  const percentage = ((item.value / totalValue) * 100).toFixed(1);
                  return (
                    <div className="bg-popover border border-border rounded-lg p-3 shadow-lg">
                      <p className="font-semibold">{item.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatCurrency(item.value)} ({percentage}%)
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
      <div className="mt-4 grid grid-cols-2 gap-2">
        {data.slice(0, 6).map((item, index) => (
          <div key={index} className="flex items-center gap-2 text-sm">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: item.color }}
            />
            <span className="truncate">{item.name}</span>
            <span className="text-muted-foreground ml-auto">
              {((item.value / totalValue) * 100).toFixed(0)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
