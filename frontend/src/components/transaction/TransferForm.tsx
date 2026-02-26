import React, { useState } from 'react';
import { CheckCircle2, Home, Plus, ArrowLeftRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { voucherApi } from '@/services/api';
import { formatCurrency } from '@/utils/formatCurrency';
import { todayAPI } from '@/utils/formatDate';

export function TransferForm() {
  const navigate = useNavigate();
  const [direction, setDirection] = useState<'CASH_TO_BANK' | 'BANK_TO_CASH'>('CASH_TO_BANK');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(todayAPI());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState<{ amount: number; posted: boolean } | null>(null);

  const handleSubmit = async (post = false) => {
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) { setError('Please enter a valid amount'); return; }
    setError(''); setLoading(true);
    try {
      const voucher = await voucherApi.createDraft({
        voucherType: 'CONTRA', subType: direction,
        totalAmount: Number(amount),
        paymentMode: direction === 'CASH_TO_BANK' ? 'CASH' : 'BANK',
        voucherDate: date,
      });
      if (post) await voucherApi.postVoucher(voucher.voucherId);
      setSuccess({ amount: Number(amount), posted: post });
    } catch (e) { setError(e instanceof Error ? e.message : 'Failed to save'); }
    finally { setLoading(false); }
  };

  if (success) {
    return (
      <div className="max-w-xl mx-auto px-4 py-6">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 flex flex-col items-center text-center" data-testid="transfer-success">
          <CheckCircle2 className="h-16 w-16 text-emerald-500 mb-4" />
          <h2 className="text-xl font-bold text-slate-800">Entry {success.posted ? 'Posted' : 'Saved as Draft'} Successfully!</h2>
          <p className="text-3xl font-mono text-slate-700 font-bold mt-3">{formatCurrency(success.amount)}</p>
          <p className="text-slate-500 mt-2 text-sm">
            {direction === 'CASH_TO_BANK' ? 'Cash → Bank transfer' : 'Bank → Cash withdrawal'}
          </p>
          <div className="flex gap-3 mt-6">
            <Button variant="secondary" onClick={() => { setSuccess(null); setAmount(''); }} data-testid="record-another-transfer">
              <Plus className="h-4 w-4" /> Record Another
            </Button>
            <Button variant="primary" onClick={() => navigate('/')} data-testid="go-home-after-transfer">
              <Home className="h-4 w-4" /> Go to Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-6" data-testid="transfer-form">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 space-y-6">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-slate-100 flex items-center justify-center">
            <ArrowLeftRight className="h-6 w-6 text-slate-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">Record a Transfer</h2>
            <p className="text-sm text-slate-500 mt-0.5">Moving money between cash and bank</p>
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2 block">Direction</label>
          <div className="grid grid-cols-2 gap-3">
            {[
              { v: 'CASH_TO_BANK', label: '💵 → 🏦', sub: 'Cash to Bank' },
              { v: 'BANK_TO_CASH', label: '🏦 → 💵', sub: 'Bank to Cash' },
            ].map(({ v, label, sub }) => (
              <button key={v} data-testid={`transfer-${v.toLowerCase().replace('_', '-')}`} onClick={() => setDirection(v as any)}
                className={`flex flex-col items-center gap-1 p-4 rounded-xl border-2 text-sm font-medium transition-all ${
                  direction === v ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-slate-200 text-slate-600 hover:border-slate-300'
                }`}>
                <span className="text-2xl">{label}</span>
                <span className="text-xs">{sub}</span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2 block">Amount</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl font-mono font-bold select-none">₹</span>
            <input type="number" inputMode="decimal" min="0" step="0.01" placeholder="0.00" autoFocus
              value={amount} onChange={e => setAmount(e.target.value)}
              className="w-full pl-10 pr-4 py-3 text-2xl font-mono font-bold text-slate-900 border-2 border-slate-200 focus:border-emerald-500 rounded-xl outline-none transition-colors"
              data-testid="transfer-amount" />
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2 block">Date</label>
          <input type="date" value={date} onChange={e => setDate(e.target.value)}
            className="w-full border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            data-testid="transfer-date" />
        </div>

        {error && <p className="text-sm text-rose-600 bg-rose-50 px-4 py-2 rounded-lg" data-testid="transfer-error">{error}</p>}

        <div className="flex gap-3 pt-2">
          <Button variant="secondary" size="lg" className="flex-1" loading={loading} onClick={() => handleSubmit(false)}>Save as Draft</Button>
          <Button variant="primary" size="lg" className="flex-1" loading={loading} onClick={() => handleSubmit(true)} data-testid="transfer-submit">Post Entry ✓</Button>
        </div>
      </div>
    </div>
  );
}
