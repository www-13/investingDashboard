import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string;
  change?: number;
  icon?: ReactNode;
  className?: string;
}

export function StatCard({ title, value, change, icon, className }: StatCardProps) {
  const isPositive = change !== undefined && change >= 0;
  const isNegative = change !== undefined && change < 0;

  return (
    <div className={cn(
      "bg-card border border-border rounded-xl p-5 card-hover animate-fade-up",
      className
    )}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground mb-1">{title}</p>
          <p className="text-2xl font-semibold font-mono-nums">{value}</p>
          {change !== undefined && (
            <p className={cn(
              "text-sm font-mono-nums mt-1",
              isPositive && "text-success",
              isNegative && "text-destructive"
            )}>
              {isPositive ? '+' : ''}{change.toFixed(2)}%
            </p>
          )}
        </div>
        {icon && (
          <div className={cn(
            "w-10 h-10 rounded-lg flex items-center justify-center",
            isPositive && "bg-success/10 text-success",
            isNegative && "bg-destructive/10 text-destructive",
            change === undefined && "bg-primary/10 text-primary"
          )}>
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
