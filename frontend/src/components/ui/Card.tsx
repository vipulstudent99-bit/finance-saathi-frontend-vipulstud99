import React from 'react';
import { cn } from '@/lib/utils';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  'data-testid'?: string;
}

export function Card({ children, className, onClick, 'data-testid': testId }: CardProps) {
  return (
    <div
      data-testid={testId}
      onClick={onClick}
      className={cn(
        'rounded-xl border border-slate-200 bg-white shadow-sm',
        onClick && 'cursor-pointer hover:shadow-md hover:border-slate-300 transition-all duration-200',
        className
      )}
    >
      {children}
    </div>
  );
}

interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export function CardHeader({ children, className }: CardHeaderProps) {
  return <div className={cn('p-5 pb-3', className)}>{children}</div>;
}

export function CardContent({ children, className }: CardHeaderProps) {
  return <div className={cn('p-5 pt-0', className)}>{children}</div>;
}

export function CardFooter({ children, className }: CardHeaderProps) {
  return <div className={cn('p-5 pt-0', className)}>{children}</div>;
}
