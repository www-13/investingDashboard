import { Holding } from '@/types';
import { formatCurrency, formatNumber, formatPercent } from '@/lib/calculations';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface HoldingsTableProps {
  holdings: Holding[];
  currency?: string;
}

export function HoldingsTable({ holdings, currency = 'USD' }: HoldingsTableProps) {
  if (holdings.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>No holdings yet</p>
        <p className="text-sm mt-1">Buy some assets to see your portfolio</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead>Asset</TableHead>
            <TableHead className="text-right">Quantity</TableHead>
            <TableHead className="text-right">Avg. Buy Price</TableHead>
            <TableHead className="text-right">Current Price</TableHead>
            <TableHead className="text-right">Value</TableHead>
            <TableHead className="text-right">Unrealized P&L</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {holdings.map((holding, index) => {
            const isProfit = holding.unrealizedPnL >= 0;
            return (
              <TableRow
                key={holding.symbol}
                className="animate-fade-up"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <TableCell>
                  <div>
                    <p className="font-medium">{holding.symbol}</p>
                    <p className="text-xs text-muted-foreground">{holding.name}</p>
                  </div>
                </TableCell>
                <TableCell className="text-right font-mono-nums">
                  {formatNumber(holding.quantity, 4)}
                </TableCell>
                <TableCell className="text-right font-mono-nums">
                  {formatCurrency(holding.avgBuyPrice, currency)}
                </TableCell>
                <TableCell className="text-right font-mono-nums">
                  {formatCurrency(holding.currentPrice, currency)}
                </TableCell>
                <TableCell className="text-right font-mono-nums font-medium">
                  {formatCurrency(holding.currentValue, currency)}
                </TableCell>
                <TableCell className="text-right">
                  <div className={cn(
                    "flex items-center justify-end gap-2",
                    isProfit ? "text-success" : "text-destructive"
                  )}>
                    {isProfit ? (
                      <TrendingUp className="h-4 w-4" />
                    ) : (
                      <TrendingDown className="h-4 w-4" />
                    )}
                    <div className="text-right">
                      <p className="font-mono-nums font-medium">
                        {formatCurrency(holding.unrealizedPnL, currency)}
                      </p>
                      <p className="text-xs font-mono-nums">
                        {formatPercent(holding.unrealizedPnLPercent)}
                      </p>
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
