import React, { useState, useEffect } from 'react';
import { CheckCircle2, Home, Plus, ArrowDownCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { voucherApi, reportsApi } from '@/services/api';
import { formatCurrency } from '@/utils/formatCurrency';
import { todayAPI } from '@/utils/formatDate';
import type { Party, OutstandingParty } from '@/types';
import { PartySearchInput } from './PartySearchInput';

export function ReceiptForm() {
  const navigate = useNavigate();
  const [party, setParty] = useState<Party | null>(null);
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(todayAPI());
  const [showNote, setShowNote] = useState(false);
  const [note, setNote] = useState('');
  const [paymentMode, setPaymentMode] = useState<'CASH' | 'BANK'>('CASH');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState<{ amount: number; partyName: string; prevBalance?: number; posted: boolean } | null>(null);
  const [receivables, setReceivables] = useState<OutstandingParty[]>([]);

  useEffect(() => { reportsApi.getReceivables().then(setReceivables).catch(() => {}); }, []);

  const owed = party ? (receivables.find(r => r.partyId === party.id)?.balance ?? null) : null;

  const handleSubmit = async (post = false) => {
    if (!party) { setError('Please select a customer'); return; }
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) { setError('Please enter a valid amount'); return; }
    setError(''); setLoading(true);
    try {
      // Correct subType for receipt as per backend contract
      const voucher = await voucherApi.createDraft({
        voucherType: 'RECEIPT', subType: 'RECEIPT',
        totalAmount: Number(amount), paymentMode,
        voucherDate: date, narration: note || undefined, partyId: party.id,
      });
      if (post) await voucherApi.postVoucher(voucher.voucherId);
      setSuccess({ amount: Number(amount), partyName: party.name, prevBalance: owed ?? undefined, posted: post });
    } catch (e) { setError(e instanceof Error ? e.message : 'Failed to save'); }
    finally { setLoading(false); }
  };

  if (success) {
    const newBalance = Math.max(0, (success.prevBalance ?? 0) - success.amount);
    return (
      <div className="max-w-xl mx-auto px-4 py-6">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 flex flex-col items-center text-center" data-testid="receipt-success">
          <CheckCircle2 className="h-16 w-16 text-emerald-500 mb-4" />
          <h2 className="text-xl font-bold text-slate-800">Entry {success.posted ? 'Posted' : 'Saved as Draft'} Successfully!</h2>
          <p className="text-3xl font-mono text-emerald-600 font-bold mt-3">{formatCurrency(success.amount)}</p>
          <p className="text-slate-500 mt-2 text-sm">
            {success.prevBalance !== undefined
              ? `${success.partyName} now owes ${formatCurrency(newBalance)} (was ${formatCurrency(success.prevBalance)})`
              : `Payment from ${success.partyName} recorded`}
          </p>
          <div className="flex gap-3 mt-6">
            <Button variant="secondary" onClick={() => { setSuccess(null); setAmount(''); setNote(''); setParty(null); }} data-testid="record-another-receipt">
              <Plus className="h-4 w-4" /> Record Another
            </Button>
            <Button variant="primary" onClick={() => navigate('/')} data-testid="go-home-after-receipt">
              <Home className="h-4 w-4" /> Go to Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-6" data-testid="receipt-form">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 space-y-6">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-blue-100 flex items-center justify-center">
            <ArrowDownCircle className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">Received Payment</h2>
            <p className="text-sm text-slate-500 mt-0.5">Customer cleared their dues</p>
          </div>
        </div>

        <div className="space-y-2">
          <PartySearchInput types={['CUSTOMER', 'BOTH']} value={party} onChange={setParty} placeholder="Select customer..." label="Customer" />
          {party && owed !== null && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2 text-sm text-emerald-700">
              Currently owes you: <span className="font-bold font-mono">{formatCurrency(owed)}</span>
            </div>
          )}
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2 block">Amount Received</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl font-mono font-bold select-none">₹</span>
            <input type="number" inputMode="decimal" min="0" step="0.01" placeholder="0.00"
              value={amount} onChange={e => setAmount(e.target.value)} autoFocus
              className="w-full pl-10 pr-4 py-3 text-2xl font-mono font-bold text-slate-900 border-2 border-slate-200 focus:border-emerald-500 rounded-xl outline-none transition-colors"
              data-testid="receipt-amount" />
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2 block">Received In</label>
          <div className="flex gap-1 p-1 bg-slate-100 rounded-xl inline-flex">
            {(['CASH', 'BANK'] as const).map(m => (
              <button key={m} data-testid={`receipt-payment-${m.toLowerCase()}`} onClick={() => setPaymentMode(m)}
                className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${paymentMode === m ? 'bg-white shadow text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}>
                {m === 'CASH' ? 'Cash' : 'Bank'}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2 block">Date</label>
          <input type="date" value={date} onChange={e => setDate(e.target.value)}
            className="w-full border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            data-testid="receipt-date" />
        </div>

        {!showNote ? (
          <button onClick={() => setShowNote(true)} className="text-sm text-slate-400 hover:text-slate-600 transition-colors" data-testid="receipt-note-toggle">
            + Add a note (optional)
          </button>
        ) : (
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2 block">Note</label>
            <textarea value={note} onChange={e => setNote(e.target.value)} rows={2} placeholder="Optional note"
              className="w-full border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
              data-testid="receipt-note" />
          </div>
        )}

        {error && <p className="text-sm text-rose-600 bg-rose-50 px-4 py-2 rounded-lg" data-testid="receipt-error">{error}</p>}

        <div className="flex gap-3 pt-2">
          <Button variant="secondary" size="lg" className="flex-1" loading={loading} onClick={() => handleSubmit(false)} data-testid="receipt-save-draft">Save as Draft</Button>
          <Button variant="primary" size="lg" className="flex-1" loading={loading} onClick={() => handleSubmit(true)} data-testid="receipt-submit">Post Entry ✓</Button>
        </div>
      </div>
    </div>
  );
}
