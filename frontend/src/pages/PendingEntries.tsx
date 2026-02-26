import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, Plus } from 'lucide-react';
import { PendingEntryRow } from '@/components/transaction/PendingEntryRow';
import { EmptyState } from '@/components/ui/EmptyState';
import { TableSkeleton } from '@/components/ui/LoadingSpinner';
import { useVouchers } from '@/hooks/useVouchers';
import type { Voucher } from '@/types';

export default function PendingEntries() {
  const navigate = useNavigate();
  const { vouchers, loading, error, reload } = useVouchers();
  const [editingVoucher, setEditingVoucher] = useState<Voucher | null>(null);

  const pending = vouchers.filter((v) => v.status === 'DRAFT');

  return (
    <div className="max-w-3xl mx-auto px-4 py-6" data-testid="pending-entries-page">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Pending Entries</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          These are saved but not yet confirmed. Confirm to lock permanently.
        </p>
      </div>

      {loading && <TableSkeleton rows={4} />}

      {!loading && error && (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 text-rose-700 text-sm">
          {error}. <button className="underline" onClick={reload}>Try again</button>
        </div>
      )}

      {!loading && !error && pending.length === 0 && (
        <EmptyState
          title="No pending entries"
          description="All transactions are confirmed. Record a new transaction to get started."
          actionLabel="Record a Transaction"
          onAction={() => navigate('/record')}
          data-testid="pending-empty-state"
        />
      )}

      {!loading && !error && pending.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">
              {pending.length} pending entr{pending.length === 1 ? 'y' : 'ies'}
            </p>
            <button
              onClick={() => navigate('/record')}
              className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
              data-testid="add-new-entry-btn"
            >
              <Plus className="h-4 w-4" />
              New Entry
            </button>
          </div>
          {pending.map((v) => (
            <PendingEntryRow
              key={v.voucherId}
              voucher={v}
              onPosted={reload}
              onDeleted={reload}
              onEdit={setEditingVoucher}
            />
          ))}
        </div>
      )}
    </div>
  );
}
