import { useState } from 'react';
import { Trade } from '@/types';
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
import { Plus } from 'lucide-react';

interface AddTradeDialogProps {
  onAdd: (trade: Omit<Trade, 'id'>) => void;
  assets: { symbol: string; name: string }[];
  allowCustom?: boolean;
}

export function AddTradeDialog({ onAdd, assets, allowCustom = false }: AddTradeDialogProps) {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<'buy' | 'sell'>('buy');
  const [symbol, setSymbol] = useState('');
  const [customSymbol, setCustomSymbol] = useState('');
  const [customName, setCustomName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [price, setPrice] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const selectedAsset = assets.find(a => a.symbol === symbol);
    const finalSymbol = symbol === 'custom' ? customSymbol : symbol;
    const finalName = symbol === 'custom' ? customName : (selectedAsset?.name || '');

    if (!finalSymbol || !quantity || !price) return;

    // Keep crypto symbols lowercase (for API matching), uppercase others
    const isCryptoAsset = assets.some(a => a.symbol === symbol && a.symbol === a.symbol.toLowerCase());
    
    onAdd({
      symbol: isCryptoAsset ? finalSymbol.toLowerCase() : finalSymbol.toUpperCase(),
      name: finalName,
      type,
      quantity: parseFloat(quantity),
      price: parseFloat(price),
      date,
    });

    // Reset form
    setType('buy');
    setSymbol('');
    setCustomSymbol('');
    setCustomName('');
    setQuantity('');
    setPrice('');
    setDate(new Date().toISOString().split('T')[0]);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Add Trade
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Record New Trade</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Type</Label>
              <Select value={type} onValueChange={(v) => setType(v as 'buy' | 'sell')}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="buy">Buy</SelectItem>
                  <SelectItem value="sell">Sell</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Date</Label>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Asset</Label>
            <Select value={symbol} onValueChange={setSymbol}>
              <SelectTrigger>
                <SelectValue placeholder="Select asset" />
              </SelectTrigger>
              <SelectContent>
                {assets.map((asset) => (
                  <SelectItem key={asset.symbol} value={asset.symbol}>
                    {asset.symbol} - {asset.name}
                  </SelectItem>
                ))}
                {allowCustom && (
                  <SelectItem value="custom">+ Custom Asset</SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>

          {symbol === 'custom' && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Symbol</Label>
                <Input
                  placeholder="e.g., AAPL"
                  value={customSymbol}
                  onChange={(e) => setCustomSymbol(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Name</Label>
                <Input
                  placeholder="e.g., Apple Inc."
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                />
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Quantity</Label>
              <Input
                type="number"
                step="any"
                placeholder="0.00"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Price</Label>
              <Input
                type="number"
                step="any"
                placeholder="0.00"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
            </div>
          </div>

          <Button type="submit" className="w-full">
            Record Trade
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
