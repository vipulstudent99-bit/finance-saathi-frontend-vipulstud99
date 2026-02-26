import React, { useState } from 'react';
import { Button } from './Button';

interface InlineConfirmProps {
  label: string;
  confirmLabel?: string;
  onConfirm: () => void | Promise<void>;
  variant?: 'destructive' | 'success';
  loading?: boolean;
  'data-testid'?: string;
}

export function InlineConfirm({
  label,
  confirmLabel = 'Yes, confirm',
  onConfirm,
  variant = 'destructive',
  loading,
  'data-testid': testId,
}: InlineConfirmProps) {
  const [confirming, setConfirming] = useState(false);
  const [running, setRunning] = useState(false);

  const handleConfirm = async () => {
    setRunning(true);
    try {
      await onConfirm();
    } finally {
      setRunning(false);
      setConfirming(false);
    }
  };

  if (!confirming) {
    return (
      <button
        data-testid={testId}
        onClick={() => setConfirming(true)}
        className="text-sm font-medium text-slate-500 hover:text-rose-600 transition-colors"
      >
        {label}
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2 animate-fade-in">
      <span className="text-xs text-slate-500">Are you sure?</span>
      <Button
        size="sm"
        variant={variant}
        loading={running || loading}
        onClick={handleConfirm}
        data-testid={`${testId}-confirm`}
      >
        {confirmLabel}
      </Button>
      <button
        className="text-xs text-slate-400 hover:text-slate-600"
        onClick={() => setConfirming(false)}
        data-testid={`${testId}-cancel`}
      >
        Cancel
      </button>
    </div>
  );
}
