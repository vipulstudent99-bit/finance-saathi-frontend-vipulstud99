import React, { useState } from 'react';
import { CheckCircle2, Home, Plus, Package } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { voucherApi } from '@/services/api';
import { formatCurrency } from '@/utils/formatCurrency';
import { todayAPI } from '@/utils/formatDate';
import type { Party } from '@/types';
import { PartySearchInput } from './PartySearchInput';

export function PurchaseForm() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [mode, setMode] = useState<'CREDIT' | 'CASH'>(
    searchParams.get('m') === 'CREDIT' ? 'CREDIT' : 'CASH'
  );
  const [party, setParty] = useState<Party | null>(null);
  const [narration, setNarration] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(todayAPI());
  const [paymentMode, setPaymentMode] = useState<'CASH' | 'BANK'>('CASH');
  const [showNote, setShowNote] = useState(false);
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState<{ amount: number; partyName?: string; posted: boolean } | null>(null);

  const handleSubmit = async (post = false) => {
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) { setError('Please enter a valid amount'); return; }
    if (mode === 'CREDIT' && !party) { setError('Please select a supplier'); return; }
    setError(''); setLoading(true);
    try {
      const voucher = await voucherApi.createDraft({
        voucherType: 'PURCHASE', subType: mode === 'CREDIT' ? 'CREDIT_PURCHASE' : 'CASH_PURCHASE',
        totalAmount: Number(amount), paymentMode: mode === 'CASH' ? paymentMode : 'CASH',
        voucherDate: date, narration: narration || note || undefined, partyId: party?.id,
      });
      if (post) await voucherApi.postVoucher(voucher.voucherId);
      setSuccess({ amount: Number(amount), partyName: party?.name, posted: post });
    } catch (e) { setError(e instanceof Error ? e.message : 'Failed to save'); }
    finally { setLoading(false); }
  };

  if (success) {
    return (
      <div className="max-w-xl mx-auto px-4 py-6">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 flex flex-col items-center text-center" data-testid="purchase-success">
          <CheckCircle2 className="h-16 w-16 text-emerald-500 mb-4" />
          <h2 className="text-xl font-bold text-slate-800">Entry {success.posted ? 'Posted' : 'Saved as Draft'} Successfully!</h2>
          <p className="text-3xl font-mono text-rose-600 font-bold mt-3">{formatCurrency(success.amount)}</p>
          <p className="text-slate-500 mt-2 text-sm">
            {success.partyName ? `Purchase from ${success.partyName}` : 'Cash purchase recorded'}
          </p>
          <div className="flex gap-3 mt-6">
            <Button variant="secondary" onClick={() => { setSuccess(null); setAmount(''); setNarration(''); setParty(null); }} data-testid="record-another-purchase">
              <Plus className="h-4 w-4" /> Record Another
            </Button>
            <Button variant="primary" onClick={() => navigate('/')} data-testid="go-home-after-purchase">
              <Home className="h-4 w-4" /> Go to Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-6" data-testid="purchase-form">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 space-y-6">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-rose-100 flex items-center justify-center">
            <Package className="h-6 w-6 text-rose-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">{mode === 'CREDIT' ? 'Supplier Bill' : 'Cash Purchase'}</h2>
            <p className="text-sm text-slate-500 mt-0.5">{mode === 'CREDIT' ? 'Bill from supplier, pay later' : 'Paid cash for goods/materials'}</p>
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2 block">Purchase Type</label>
          <div className="grid grid-cols-2 gap-3">
            {[{ v: 'CASH', label: '💵 Cash Purchase' }, { v: 'CREDIT', label: '🧾 Supplier Bill' }].map(({ v, label }) => (
              <button key={v} data-testid={`purchase-mode-${v.toLowerCase()}`} onClick={() => setMode(v as any)}
                className={`py-3 rounded-xl border-2 text-sm font-medium transition-all ${mode === v ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-slate-200 text-slate-600 hover:border-slate-300'}`}>{label}</button>
            ))}
          </div>
        </div>

        {mode === 'CREDIT' && (
          <PartySearchInput types={['SUPPLIER', 'BOTH']} value={party} onChange={setParty} placeholder="Select supplier..." label="Supplier" />
        )}

        <div>
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2 block">What did you buy?</label>
          <input value={narration} onChange={e => setNarration(e.target.value)} placeholder="e.g. Raw materials, office supplies" autoFocus
            className="w-full border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            data-testid="purchase-narration" />
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2 block">Amount</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl font-mono font-bold select-none">₹</span>
            <input type="number" inputMode="decimal" min="0" step="0.01" placeholder="0.00"
              value={amount} onChange={e => setAmount(e.target.value)}
              className="w-full pl-10 pr-4 py-3 text-2xl font-mono font-bold text-slate-900 border-2 border-slate-200 focus:border-emerald-500 rounded-xl outline-none transition-colors"
              data-testid="purchase-amount" />
          </div>
        </div>

        {mode === 'CASH' && (
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2 block">Paid From</label>
            <div className="flex gap-1 p-1 bg-slate-100 rounded-xl inline-flex">
              {(['CASH', 'BANK'] as const).map(m => (
                <button key={m} data-testid={`purchase-payment-${m.toLowerCase()}`} onClick={() => setPaymentMode(m)}
                  className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${paymentMode === m ? 'bg-white shadow text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}>
                  {m === 'CASH' ? 'Cash' : 'Bank'}
                </button>
              ))}
            </div>
          </div>
        )}

        <div>
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2 block">Date</label>
          <input type="date" value={date} onChange={e => setDate(e.target.value)}
            className="w-full border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            data-testid="purchase-date" />
        </div>

        {error && <p className="text-sm text-rose-600 bg-rose-50 px-4 py-2 rounded-lg" data-testid="purchase-error">{error}</p>}

        <div className="flex gap-3 pt-2">
          <Button variant="secondary" size="lg" className="flex-1" loading={loading} onClick={() => handleSubmit(false)} data-testid="purchase-save-draft">Save as Draft</Button>
          <Button variant="primary" size="lg" className="flex-1" loading={loading} onClick={() => handleSubmit(true)} data-testid="purchase-submit">Post Entry ✓</Button>
        </div>
      </div>
    </div>
  );
}
