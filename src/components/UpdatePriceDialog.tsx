import { useState } from 'react';
import { StockPrice } from '@/types';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RefreshCw } from 'lucide-react';

interface UpdatePriceDialogProps {
  stocks: { symbol: string; name: string }[];
  currentPrices: Map<string, StockPrice>;
  onUpdate: (symbol: string, price: number) => void;
}

export function UpdatePriceDialog({ stocks, currentPrices, onUpdate }: UpdatePriceDialogProps) {
  const [open, setOpen] = useState(false);
  const [symbol, setSymbol] = useState('');
  const [price, setPrice] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!symbol || !price) return;

    onUpdate(symbol, parseFloat(price));
    setSymbol('');
    setPrice('');
    setOpen(false);
  };

  const selectedStock = stocks.find(s => s.symbol === symbol);
  const currentPrice = symbol ? currentPrices.get(symbol)?.price : undefined;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Update Price
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Update Stock Price</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label>Stock</Label>
            <Select value={symbol} onValueChange={setSymbol}>
              <SelectTrigger>
                <SelectValue placeholder="Select stock" />
              </SelectTrigger>
              <SelectContent>
                {stocks.map((stock) => (
                  <SelectItem key={stock.symbol} value={stock.symbol}>
                    {stock.symbol} - {stock.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedStock && (
            <div className="bg-muted/50 rounded-lg p-3">
              <p className="text-sm text-muted-foreground">
                Current Price: {currentPrice ? `$${currentPrice.toFixed(2)}` : 'Not set'}
              </p>
            </div>
          )}

          <div className="space-y-2">
            <Label>New Price</Label>
            <Input
              type="number"
              step="any"
              placeholder="0.00"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
          </div>

          <Button type="submit" className="w-full">
            Update Price
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
