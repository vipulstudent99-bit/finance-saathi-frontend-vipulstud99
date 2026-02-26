import React, { useState } from 'react';
import { CheckCircle, Home, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { voucherApi } from '@/services/api';
import { formatCurrency } from '@/utils/formatCurrency';
import { todayAPI } from '@/utils/formatDate';

export function AdjustmentForm() {
  const navigate = useNavigate();
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');
  const [date, setDate] = useState(todayAPI());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState<{ amount: number } | null>(null);

  const handleSubmit = async () => {
    if (!reason.trim()) { setError('Please provide a reason for the adjustment'); return; }
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await voucherApi.createDraft({
        voucherType: 'JOURNAL',
        subType: 'MANUAL_JOURNAL',
        totalAmount: Number(amount),
        paymentMode: 'CASH',
        voucherDate: date,
        narration: reason,
      });
      setSuccess({ amount: Number(amount) });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex flex-col items-center py-12 px-4 text-center" data-testid="adjustment-success">
        <div className="h-16 w-16 rounded-full bg-emerald-100 flex items-center justify-center mb-4">
          <CheckCircle className="h-8 w-8 text-emerald-600" />
        </div>
        <h2 className="text-xl font-bold text-slate-800 mb-2">Adjustment recorded!</h2>
        <p className="text-slate-500 mb-6">{formatCurrency(success.amount)} adjustment saved</p>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => { setSuccess(null); setAmount(''); setReason(''); }}
            data-testid="record-another-adjustment"
          >
            <Plus className="h-4 w-4" /> Record Another
          </Button>
          <Button variant="primary" onClick={() => navigate('/')} data-testid="go-home-after-adjustment">
            <Home className="h-4 w-4" /> Go to Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-6 space-y-6" data-testid="adjustment-form">
      <div>
        <h2 className="text-lg font-bold text-slate-800">Record an Adjustment</h2>
        <p className="text-sm text-slate-500">
          For corrections, depreciation, or special entries. This is an advanced entry.
        </p>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
        <p className="text-sm text-amber-800">
          This entry will be recorded as a manual journal. Use this only for corrections or special accounting entries.
        </p>
      </div>

      <Input
        label="Reason (required)"
        placeholder="e.g. Depreciation on machinery, Opening stock adjustment"
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        autoFocus
        data-testid="adjustment-reason"
      />

      <Input
        label="Amount"
        prefix="₹"
        type="number"
        inputMode="decimal"
        min="0"
        step="0.01"
        placeholder="0.00"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        data-testid="adjustment-amount"
      />

      <Input
        label="Date"
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        data-testid="adjustment-date"
      />

      {error && (
        <p className="text-sm text-rose-600 bg-rose-50 px-4 py-2 rounded-lg" data-testid="adjustment-error">
          {error}
        </p>
      )}

      <Button
        variant="primary"
        size="lg"
        className="w-full"
        loading={loading}
        onClick={handleSubmit}
        data-testid="adjustment-submit"
      >
        Save Adjustment →
      </Button>
    </div>
  );
}
