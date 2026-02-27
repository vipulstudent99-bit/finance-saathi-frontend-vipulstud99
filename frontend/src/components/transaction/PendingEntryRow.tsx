import React, { useState } from 'react';
import { Check, Pencil, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { InlineConfirm } from '@/components/ui/InlineConfirm';
import { formatCurrency } from '@/utils/formatCurrency';
import { formatDate } from '@/utils/formatDate';
import { describeVoucher, getSubTypeLabel } from '@/utils/transactionHelpers';
import { voucherApi } from '@/services/api';
import type { Voucher } from '@/types';

interface PendingEntryRowProps {
  voucher: Voucher;
  onPosted: () => void;
  onDeleted: () => void;
  onEdit: (v: Voucher) => void;
}

// Badge colour per subType group
const getSubTypeBadgeClass = (subType: Voucher['subType'], voucherType: Voucher['voucherType']): string => {
  if (subType === 'CASH_SALE' || subType === 'CREDIT_SALE' || voucherType === 'RECEIPT') {
    return 'bg-emerald-100 text-emerald-700';
  }
  if (subType === 'CASH_PURCHASE' || subType === 'CREDIT_PURCHASE') {
    return 'bg-rose-100 text-rose-700';
  }
  if (subType === 'EXPENSE_PAYMENT' || subType === 'VENDOR_PAYMENT' || subType === 'OWNER_WITHDRAWAL') {
    return 'bg-amber-100 text-amber-700';
  }
  if (subType === 'CASH_TO_BANK' || subType === 'BANK_TO_CASH') {
    return 'bg-blue-100 text-blue-700';
  }
  return 'bg-slate-100 text-slate-600';
};

export function PendingEntryRow({ voucher, onPosted, onDeleted, onEdit }: PendingEntryRowProps) {
  const [posting, setPosting] = useState(false);
  const [postError, setPostError] = useState('');

  const handlePost = async () => {
    setPosting(true);
    setPostError('');
    try {
      await voucherApi.postVoucher(voucher.voucherId);
      onPosted();
    } catch (e) {
      setPostError(e instanceof Error ? e.message : 'Failed to confirm');
    } finally {
      setPosting(false);
    }
  };

  const handleDelete = async () => {
    await voucherApi.deleteDraft(voucher.voucherId);
    onDeleted();
  };

  const isIncome =
    voucher.voucherType === 'SALE' || voucher.voucherType === 'RECEIPT';

  const subTypeLabel = getSubTypeLabel(voucher.subType, voucher.voucherType);
  const subTypeBadgeClass = getSubTypeBadgeClass(voucher.subType, voucher.voucherType);

  return (
    <div
      className="bg-white rounded-xl border border-slate-200 p-4 hover:border-slate-300 transition-all"
      data-testid={`pending-entry-${voucher.voucherId}`}
    >
      <div className="flex items-start gap-3">
        <div className="mt-1 h-2.5 w-2.5 rounded-full bg-amber-400 shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="font-semibold text-slate-800 text-sm">
                {describeVoucher(voucher)}
              </p>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <span className="text-xs text-slate-400">{formatDate(voucher.voucherDate)}</span>
                {/* Human-readable subType badge — replaces the old N/A */}
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${subTypeBadgeClass}`}>
                  {subTypeLabel}
                </span>
                <Badge variant="draft">Pending</Badge>
              </div>
            </div>
            <div className="text-right shrink-0">
              <p
                className={`font-bold font-mono text-base ${
                  isIncome ? 'text-emerald-600' : 'text-rose-600'
                }`}
              >
                {isIncome ? '+' : '-'}
                {formatCurrency(voucher.totalAmount)}
              </p>
            </div>
          </div>

          {postError && (
            <p className="text-xs text-rose-600 mt-1">{postError}</p>
          )}

          {/* Actions */}
          <div className="flex items-center gap-3 mt-3 pt-3 border-t border-slate-100">
            <InlineConfirm
              label="Confirm & Lock"
              confirmLabel="Yes, Lock"
              onConfirm={handlePost}
              variant="success"
              loading={posting}
              data-testid={`confirm-entry-${voucher.voucherId}`}
            />
            <button
              onClick={() => onEdit(voucher)}
              className="flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-blue-600 transition-colors"
              data-testid={`edit-entry-${voucher.voucherId}`}
            >
              <Pencil className="h-3.5 w-3.5" /> Edit
            </button>
            <InlineConfirm
              label="Delete"
              confirmLabel="Yes, Delete"
              onConfirm={handleDelete}
              variant="destructive"
              data-testid={`delete-entry-${voucher.voucherId}`}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
