import React, { useState, useMemo } from 'react';
import { Plus, Search, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PendingEntryRow } from '@/components/transaction/PendingEntryRow';
import { EmptyState } from '@/components/ui/EmptyState';
import { TableSkeleton } from '@/components/ui/LoadingSpinner';
import { useVouchers } from '@/hooks/useVouchers';
import type { Voucher, VoucherType } from '@/types';

type FilterType = 'ALL' | VoucherType;

const FILTERS: { key: FilterType; label: string }[] = [
  { key: 'ALL', label: 'All' },
  { key: 'SALE', label: 'Sales' },
  { key: 'PURCHASE', label: 'Purchases' },
  { key: 'PAYMENT', label: 'Payments' },
  { key: 'RECEIPT', label: 'Receipts' },
];

export default function PendingEntries() {
  const navigate = useNavigate();
  const { vouchers, loading, error, reload } = useVouchers();
  const [filter, setFilter] = useState<FilterType>('ALL');

  const pending = useMemo(() => {
    const drafts = vouchers.filter(v => v.status === 'DRAFT');
    return filter === 'ALL' ? drafts : drafts.filter(v => v.voucherType === filter);
  }, [vouchers, filter]);

  const totalDrafts = vouchers.filter(v => v.status === 'DRAFT').length;

  return (
    <div className="max-w-5xl mx-auto px-6 py-8" data-testid="pending-entries-page">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-900">Pending Entries</h1>
            {totalDrafts > 0 && (
              <span className="bg-amber-100 text-amber-700 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                {totalDrafts} draft{totalDrafts !== 1 ? 's' : ''} awaiting
              </span>
            )}
          </div>
          <p className="text-sm text-slate-500 mt-1">Saved but not yet confirmed. Confirm to lock permanently.</p>
        </div>
        <button
          onClick={() => navigate('/record')}
          className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-emerald-700 transition-colors"
          data-testid="add-new-entry-btn"
        >
          <Plus className="h-4 w-4" /> New Entry
        </button>
      </div>

      {/* Filter pills */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-fit mb-5">
        {FILTERS.map(f => (
          <button
            key={f.key}
            data-testid={`filter-${f.key.toLowerCase()}`}
            onClick={() => setFilter(f.key)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
              filter === f.key
                ? 'bg-white shadow-sm text-slate-900'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading && <TableSkeleton rows={4} />}

      {!loading && error && (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 text-rose-700 text-sm">
          {error}.{' '}
          <button className="underline font-medium" onClick={reload}>Try again</button>
        </div>
      )}

      {!loading && !error && pending.length === 0 && (
        <EmptyState
          icon={<Clock className="h-12 w-12" />}
          title="No pending entries"
          description="All transactions are confirmed. Record a new transaction to get started."
          actionLabel="Record a Transaction"
          onAction={() => navigate('/record')}
          data-testid="pending-empty-state"
        />
      )}

      {!loading && !error && pending.length > 0 && (
        <div className="space-y-3">
          {pending.map((v) => (
            <PendingEntryRow
              key={v.voucherId}
              voucher={v}
              onPosted={reload}
              onDeleted={reload}
              onEdit={() => {}}
            />
          ))}
        </div>
      )}
    </div>
  );
}
