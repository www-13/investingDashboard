import { formatCurrency, formatPercent } from '@/lib/calculations';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface PriceCardProps {
  symbol: string;
  name: string;
  price: number;
  change?: number;
  image?: string;
  currency?: string;
}

export function PriceCard({ symbol, name, price, change, image, currency = 'USD' }: PriceCardProps) {
  const isPositive = change !== undefined && change >= 0;

  return (
    <div className="bg-card border border-border rounded-xl p-4 card-hover animate-fade-up">
      <div className="flex items-center gap-3">
        {image && (
          <img src={image} alt={name} className="w-10 h-10 rounded-full" />
        )}
        <div className="flex-1 min-w-0">
          <p className="font-semibold truncate">{symbol.toUpperCase()}</p>
          <p className="text-sm text-muted-foreground truncate">{name}</p>
        </div>
        <div className="text-right">
          <p className="font-mono-nums font-semibold">
            {formatCurrency(price, currency)}
          </p>
          {change !== undefined && (
            <div className={cn(
              "flex items-center justify-end gap-1 text-sm font-mono-nums",
              isPositive ? "text-success" : "text-destructive"
            )}>
              {isPositive ? (
                <TrendingUp className="h-3 w-3" />
              ) : (
                <TrendingDown className="h-3 w-3" />
              )}
              <span>{formatPercent(change)}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
