import React, { useState, useEffect, useRef } from 'react';
import { CheckCircle2, Home, Plus, ShoppingCart } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { voucherApi } from '@/services/api';
import { formatCurrency } from '@/utils/formatCurrency';
import { todayAPI } from '@/utils/formatDate';
import type { Party } from '@/types';
import { PartySearchInput } from './PartySearchInput';

export function SaleForm() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [mode, setMode] = useState<'CREDIT' | 'CASH'>(
    searchParams.get('m') === 'CREDIT' ? 'CREDIT' : 'CASH'
  );
  const [party, setParty] = useState<Party | null>(null);
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(todayAPI());
  const [showNote, setShowNote] = useState(false);
  const [note, setNote] = useState('');
  const [paymentMode, setPaymentMode] = useState<'CASH' | 'BANK'>('CASH');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState<{ amount: number; partyName?: string; posted: boolean } | null>(null);
  const amountRef = useRef<HTMLInputElement>(null);

  useEffect(() => { setTimeout(() => amountRef.current?.focus(), 100); }, [mode]);

  const handleSubmit = async (post = false) => {
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) { setError('Please enter a valid amount'); return; }
    if (mode === 'CREDIT' && !party) { setError('Please select a customer'); return; }
    setError(''); setLoading(true);
    try {
      const voucher = await voucherApi.createDraft({
        voucherType: 'SALE', subType: mode === 'CREDIT' ? 'CREDIT_SALE' : 'CASH_SALE',
        totalAmount: Number(amount), paymentMode: mode === 'CASH' ? paymentMode : 'CASH',
        voucherDate: date, narration: note || undefined, partyId: party?.id,
      });
      if (post) await voucherApi.postVoucher(voucher.voucherId);
      setSuccess({ amount: Number(amount), partyName: party?.name, posted: post });
    } catch (e) { setError(e instanceof Error ? e.message : 'Failed to save'); }
    finally { setLoading(false); }
  };

  if (success) {
    return (
      <div className="max-w-xl mx-auto px-4 py-6">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 flex flex-col items-center text-center" data-testid="sale-success">
          <CheckCircle2 className="h-16 w-16 text-emerald-500 mb-4" />
          <h2 className="text-xl font-bold text-slate-800">Entry {success.posted ? 'Posted' : 'Saved as Draft'} Successfully!</h2>
          <p className="text-3xl font-mono text-emerald-600 font-bold mt-3">{formatCurrency(success.amount)}</p>
          <p className="text-slate-500 mt-2 text-sm">
            {success.partyName ? `${success.partyName} now owes you ₹${success.amount}` : 'Cash sale recorded'}
          </p>
          <div className="flex gap-3 mt-6">
            <Button variant="secondary" onClick={() => { setSuccess(null); setAmount(''); setNote(''); setParty(null); }} data-testid="record-another-sale">
              <Plus className="h-4 w-4" /> Record Another Sale
            </Button>
            <Button variant="primary" onClick={() => navigate('/')} data-testid="go-home-after-sale">
              <Home className="h-4 w-4" /> Go to Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-6" data-testid="sale-form">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-emerald-100 flex items-center justify-center">
            <ShoppingCart className="h-6 w-6 text-emerald-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">{mode === 'CREDIT' ? 'Credit Sale' : 'Cash Sale'}</h2>
            <p className="text-sm text-slate-500 mt-0.5">{mode === 'CREDIT' ? 'Customer will pay later' : 'Customer paid cash on the spot'}</p>
          </div>
        </div>

        {/* Mode toggle */}
        <div>
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2 block">Sale Type</label>
          <div className="grid grid-cols-2 gap-3">
            {[{ v: 'CASH', label: '💵 Cash Sale' }, { v: 'CREDIT', label: '👤 Credit Sale' }].map(({ v, label }) => (
              <button
                key={v}
                data-testid={`sale-mode-${v.toLowerCase()}`}
                onClick={() => setMode(v as any)}
                className={`py-3 rounded-xl border-2 text-sm font-medium transition-all ${
                  mode === v ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
              >{label}</button>
            ))}
          </div>
        </div>

        {mode === 'CREDIT' && (
          <PartySearchInput types={['CUSTOMER', 'BOTH']} value={party} onChange={setParty} placeholder="Select customer..." label="Customer" />
        )}

        {/* Amount */}
        <div>
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2 block">Amount</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl font-mono font-bold select-none">₹</span>
            <input
              ref={amountRef}
              type="number" inputMode="decimal" min="0" step="0.01" placeholder="0.00"
              value={amount} onChange={e => setAmount(e.target.value)}
              className="w-full pl-10 pr-4 py-3 text-2xl font-mono font-bold text-slate-900 border-2 border-slate-200 focus:border-emerald-500 rounded-xl outline-none transition-colors"
              data-testid="sale-amount"
            />
          </div>
        </div>

        {/* Date */}
        <div>
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2 block">Date</label>
          <input type="date" value={date} onChange={e => setDate(e.target.value)}
            className="w-full border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            data-testid="sale-date" />
        </div>

        {/* Cash payment mode */}
        {mode === 'CASH' && (
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2 block">Received In</label>
            <div className="flex gap-1 p-1 bg-slate-100 rounded-xl inline-flex">
              {(['CASH', 'BANK'] as const).map(m => (
                <button key={m} data-testid={`sale-payment-${m.toLowerCase()}`} onClick={() => setPaymentMode(m)}
                  className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${paymentMode === m ? 'bg-white shadow text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}>
                  {m === 'CASH' ? 'Cash' : 'Bank'}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Note */}
        {!showNote ? (
          <button onClick={() => setShowNote(true)} className="text-sm text-slate-400 hover:text-slate-600 flex items-center gap-1 transition-colors" data-testid="sale-note-toggle">
            + Add a note (optional)
          </button>
        ) : (
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2 block">Note</label>
            <textarea value={note} onChange={e => setNote(e.target.value)} rows={2} placeholder="e.g. 50 units of Product A"
              className="w-full border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
              data-testid="sale-note" />
          </div>
        )}

        {error && <p className="text-sm text-rose-600 bg-rose-50 px-4 py-2 rounded-lg" data-testid="sale-error">{error}</p>}

        {/* Buttons */}
        <div className="flex gap-3 pt-2">
          <Button variant="secondary" size="lg" className="flex-1" loading={loading} onClick={() => handleSubmit(false)} data-testid="sale-save-draft">Save as Draft</Button>
          <Button variant="primary" size="lg" className="flex-1" loading={loading} onClick={() => handleSubmit(true)} data-testid="sale-submit">Post Entry ✓</Button>
        </div>
      </div>
    </div>
  );
}
