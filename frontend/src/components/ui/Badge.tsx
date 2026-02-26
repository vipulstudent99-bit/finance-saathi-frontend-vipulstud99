import React from 'react';
import { cn } from '@/lib/utils';

type BadgeVariant =
  | 'draft' | 'posted' | 'cancelled'
  | 'dr' | 'cr'
  | 'customer' | 'supplier' | 'both'
  | 'success' | 'warning' | 'error' | 'info';

interface BadgeProps {
  variant: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

const variants: Record<BadgeVariant, string> = {
  draft:     'bg-amber-100 text-amber-700',
  posted:    'bg-emerald-100 text-emerald-700',
  cancelled: 'bg-slate-100 text-slate-500',
  dr:        'bg-blue-100 text-blue-700',
  cr:        'bg-rose-100 text-rose-700',
  customer:  'bg-blue-100 text-blue-700',
  supplier:  'bg-orange-100 text-orange-700',
  both:      'bg-purple-100 text-purple-700',
  success:   'bg-emerald-100 text-emerald-700',
  warning:   'bg-amber-100 text-amber-700',
  error:     'bg-rose-100 text-rose-700',
  info:      'bg-blue-100 text-blue-700',
};

export function Badge({ variant, children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
