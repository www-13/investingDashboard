import { Trade } from '@/types';
import { formatCurrency, formatNumber } from '@/lib/calculations';
import { Trash2, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';

interface TradeTableProps {
  trades: Trade[];
  onDelete: (id: string) => void;
  currency?: string;
}

export function TradeTable({ trades, onDelete, currency = 'USD' }: TradeTableProps) {
  if (trades.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>No trades recorded yet</p>
        <p className="text-sm mt-1">Add your first trade to start tracking</p>
      </div>
    );
  }

  const sortedTrades = [...trades].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <div className="rounded-lg border border-border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead>Date</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Asset</TableHead>
            <TableHead className="text-right">Quantity</TableHead>
            <TableHead className="text-right">Price</TableHead>
            <TableHead className="text-right">Total</TableHead>
            <TableHead className="w-12"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedTrades.map((trade, index) => (
            <TableRow
              key={trade.id}
              className="animate-fade-up"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <TableCell className="font-mono-nums text-sm">
                {new Date(trade.date).toLocaleDateString()}
              </TableCell>
              <TableCell>
                <span className={cn(
                  "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium",
                  trade.type === 'buy' ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"
                )}>
                  {trade.type === 'buy' ? (
                    <ArrowDownRight className="h-3 w-3" />
                  ) : (
                    <ArrowUpRight className="h-3 w-3" />
                  )}
                  {trade.type.toUpperCase()}
                </span>
              </TableCell>
              <TableCell>
                <div>
                  <p className="font-medium">{trade.symbol}</p>
                  <p className="text-xs text-muted-foreground">{trade.name}</p>
                </div>
              </TableCell>
              <TableCell className="text-right font-mono-nums">
                {formatNumber(trade.quantity, 4)}
              </TableCell>
              <TableCell className="text-right font-mono-nums">
                {formatCurrency(trade.price, currency)}
              </TableCell>
              <TableCell className="text-right font-mono-nums font-medium">
                {formatCurrency(trade.quantity * trade.price, currency)}
              </TableCell>
              <TableCell>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                  onClick={() => onDelete(trade.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
