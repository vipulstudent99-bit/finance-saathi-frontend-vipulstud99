import React from 'react';
import { cn } from '@/lib/utils';

type BadgeVariant = 'draft' | 'posted' | 'cancelled' | 'dr' | 'cr' | 'customer' | 'supplier' | 'both' | 'success' | 'warning' | 'error' | 'info';

interface BadgeProps {
  variant: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

const variants: Record<BadgeVariant, string> = {
  draft: 'bg-amber-100 text-amber-800 border border-amber-200',
  posted: 'bg-slate-100 text-slate-600 border border-slate-200',
  cancelled: 'bg-rose-100 text-rose-700 border border-rose-200',
  dr: 'bg-blue-100 text-blue-700 border border-blue-200',
  cr: 'bg-rose-100 text-rose-700 border border-rose-200',
  customer: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
  supplier: 'bg-blue-100 text-blue-700 border border-blue-200',
  both: 'bg-purple-100 text-purple-700 border border-purple-200',
  success: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
  warning: 'bg-amber-100 text-amber-800 border border-amber-200',
  error: 'bg-rose-100 text-rose-700 border border-rose-200',
  info: 'bg-blue-100 text-blue-700 border border-blue-200',
};

export function Badge({ variant, children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
