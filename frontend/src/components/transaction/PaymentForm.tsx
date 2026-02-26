import React, { useState, useEffect } from 'react';
import { CheckCircle2, Home, Plus } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { voucherApi, reportsApi } from '@/services/api';
import { formatCurrency } from '@/utils/formatCurrency';
import { todayAPI } from '@/utils/formatDate';
import type { Party, OutstandingParty, VoucherSubType, PaymentCategory } from '@/types';
import { PartySearchInput } from './PartySearchInput';

type PayFor = 'SUPPLIER' | 'SALARY' | 'RENT' | 'FREIGHT' | 'UTILITY' | 'OTHER' | 'WITHDRAWAL';

const EXPENSE_CATS: { key: PayFor; label: string; icon: string; bg: string; activeBg: string; category?: PaymentCategory; subType: VoucherSubType }[] = [
  { key: 'SALARY',     label: 'Salary',    icon: '💼', bg: 'bg-slate-50',  activeBg: 'border-blue-500 bg-blue-50',   category: 'SALARY',   subType: 'EXPENSE_PAYMENT' },
  { key: 'RENT',       label: 'Rent',      icon: '🏠', bg: 'bg-slate-50',  activeBg: 'border-purple-500 bg-purple-50', category: 'RENT',   subType: 'EXPENSE_PAYMENT' },
  { key: 'FREIGHT',    label: 'Freight',   icon: '🚚', bg: 'bg-slate-50',  activeBg: 'border-orange-500 bg-orange-50', category: 'FREIGHT',subType: 'EXPENSE_PAYMENT' },
  { key: 'UTILITY',    label: 'Utility',   icon: '⚡', bg: 'bg-slate-50',  activeBg: 'border-yellow-500 bg-yellow-50', category: 'UTILITY',subType: 'EXPENSE_PAYMENT' },
  { key: 'OTHER',      label: 'Other',     icon: '📦', bg: 'bg-slate-50',  activeBg: 'border-slate-500 bg-slate-100', category: 'OTHER',  subType: 'EXPENSE_PAYMENT' },
];

export function PaymentForm() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initType = searchParams.get('t');

  const [mode, setMode] = useState<'EXPENSE' | 'VENDOR' | 'WITHDRAWAL'>(
    initType === 'VENDOR' ? 'VENDOR' : initType === 'WITHDRAWAL' ? 'WITHDRAWAL' : 'EXPENSE'
  );
  const [expenseCat, setExpenseCat] = useState<PayFor | null>(null);
  const [party, setParty] = useState<Party | null>(null);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(todayAPI());
  const [paymentMode, setPaymentMode] = useState<'CASH' | 'BANK'>('CASH');
  const [showNote, setShowNote] = useState(false);
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState<{ amount: number; label: string; posted: boolean } | null>(null);
  const [payables, setPayables] = useState<OutstandingParty[]>([]);

  useEffect(() => { reportsApi.getPayables().then(setPayables).catch(() => {}); }, []);

  const owed = party ? (payables.find(p => p.partyId === party.id)?.balance ?? null) : null;

  const handleSubmit = async (post = false) => {
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) { setError('Please enter a valid amount'); return; }
    if (mode === 'EXPENSE' && !expenseCat) { setError('Please select expense category'); return; }
    if (mode === 'VENDOR' && !party) { setError('Please select a supplier'); return; }
    setError(''); setLoading(true);

    let subType: VoucherSubType = 'EXPENSE_PAYMENT';
    let paymentCategory: PaymentCategory | undefined;
    let narration: string | undefined;
    let partyId: string | undefined;

    if (mode === 'VENDOR') {
      subType = 'VENDOR_PAYMENT';
      partyId = party?.id;
      narration = note || undefined;
    } else if (mode === 'WITHDRAWAL') {
      subType = 'OWNER_WITHDRAWAL';
      narration = note || undefined;
    } else if (expenseCat) {
      const cat = EXPENSE_CATS.find(c => c.key === expenseCat)!;
      subType = 'EXPENSE_PAYMENT';
      paymentCategory = cat.category;
      narration = expenseCat === 'OTHER' ? description : (note || cat.label);
    }

    try {
      const voucher = await voucherApi.createDraft({
        voucherType: 'PAYMENT', subType, totalAmount: Number(amount),
        paymentMode, voucherDate: date, narration, partyId, paymentCategory,
      });
      if (post) await voucherApi.postVoucher(voucher.voucherId);
      setSuccess({ amount: Number(amount), label: mode === 'VENDOR' ? 'Supplier Payment' : mode === 'WITHDRAWAL' ? 'Owner Withdrawal' : (expenseCat || 'Expense'), posted: post });
    } catch (e) { setError(e instanceof Error ? e.message : 'Failed to save'); }
    finally { setLoading(false); }
  };

  if (success) {
    return (
      <div className="max-w-xl mx-auto px-4 py-6">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 flex flex-col items-center text-center" data-testid="payment-success">
          <CheckCircle2 className="h-16 w-16 text-emerald-500 mb-4" />
          <h2 className="text-xl font-bold text-slate-800">Entry {success.posted ? 'Posted' : 'Saved as Draft'} Successfully!</h2>
          <p className="text-3xl font-mono text-rose-600 font-bold mt-3">{formatCurrency(success.amount)}</p>
          <p className="text-slate-500 mt-2 text-sm">{success.label} recorded</p>
          <div className="flex gap-3 mt-6">
            <Button variant="secondary" onClick={() => { setSuccess(null); setAmount(''); setParty(null); setExpenseCat(null); setDescription(''); }} data-testid="record-another-payment">
              <Plus className="h-4 w-4" /> Record Another
            </Button>
            <Button variant="primary" onClick={() => navigate('/')} data-testid="go-home-after-payment">
              <Home className="h-4 w-4" /> Go to Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-6" data-testid="payment-form">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 space-y-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Record a Payment</h2>
          <p className="text-sm text-slate-500 mt-0.5">What did you pay for?</p>
        </div>

        {/* Payment Mode tabs */}
        <div className="flex gap-1 bg-slate-100 p-1 rounded-xl">
          {[
            { key: 'EXPENSE', label: 'Expense' },
            { key: 'VENDOR', label: 'Supplier Bill' },
            { key: 'WITHDRAWAL', label: 'Withdrawal' },
          ].map(({ key, label }) => (
            <button key={key} data-testid={`payment-type-${key.toLowerCase()}`}
              onClick={() => setMode(key as any)}
              className={`flex-1 py-1.5 rounded-lg text-sm font-medium transition-all ${mode === key ? 'bg-white shadow text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}>
              {label}
            </button>
          ))}
        </div>

        {/* Expense category grid */}
        {mode === 'EXPENSE' && (
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3 block">Category</label>
            <div className="grid grid-cols-3 gap-3">
              {EXPENSE_CATS.map(cat => (
                <button key={cat.key} data-testid={`payment-type-${cat.key.toLowerCase()}`}
                  onClick={() => setExpenseCat(cat.key)}
                  className={`border-2 rounded-xl p-4 cursor-pointer text-center transition-all ${
                    expenseCat === cat.key ? cat.activeBg : `border-slate-200 ${cat.bg} hover:border-slate-300`
                  }`}>
                  <div className="text-2xl mb-1">{cat.icon}</div>
                  <p className="text-xs font-semibold text-slate-600">{cat.label}</p>
                </button>
              ))}
            </div>
            {expenseCat === 'OTHER' && (
              <input value={description} onChange={e => setDescription(e.target.value)} placeholder="Describe the expense"
                className="mt-3 w-full border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                data-testid="payment-description" autoFocus />
            )}
          </div>
        )}

        {/* Vendor supplier search */}
        {mode === 'VENDOR' && (
          <div className="space-y-2">
            <PartySearchInput types={['SUPPLIER', 'BOTH']} value={party} onChange={setParty} placeholder="Select supplier..." label="Supplier" />
            {party && owed !== null && (
              <div className="bg-rose-50 border border-rose-200 rounded-lg px-3 py-2 text-sm text-rose-700">
                You currently owe: <span className="font-bold font-mono">{formatCurrency(owed)}</span>
              </div>
            )}
          </div>
        )}

        {mode === 'WITHDRAWAL' && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
            <p className="text-sm text-amber-700">This records a personal withdrawal from the business account.</p>
          </div>
        )}

        {/* Amount */}
        <div>
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2 block">Amount</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl font-mono font-bold select-none">₹</span>
            <input type="number" inputMode="decimal" min="0" step="0.01" placeholder="0.00"
              value={amount} onChange={e => setAmount(e.target.value)}
              className="w-full pl-10 pr-4 py-3 text-2xl font-mono font-bold text-slate-900 border-2 border-slate-200 focus:border-emerald-500 rounded-xl outline-none transition-colors"
              data-testid="payment-amount" />
          </div>
        </div>

        {/* Paid from */}
        <div>
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2 block">Paid From</label>
          <div className="flex gap-1 p-1 bg-slate-100 rounded-xl inline-flex">
            {(['CASH', 'BANK'] as const).map(m => (
              <button key={m} data-testid={`payment-mode-${m.toLowerCase()}`} onClick={() => setPaymentMode(m)}
                className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${paymentMode === m ? 'bg-white shadow text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}>
                {m === 'CASH' ? 'Cash' : 'Bank'}
              </button>
            ))}
          </div>
        </div>

        {/* Date */}
        <div>
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2 block">Date</label>
          <input type="date" value={date} onChange={e => setDate(e.target.value)}
            className="w-full border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            data-testid="payment-date" />
        </div>

        {!showNote ? (
          <button onClick={() => setShowNote(true)} className="text-sm text-slate-400 hover:text-slate-600 transition-colors" data-testid="payment-note-toggle">
            + Add a note (optional)
          </button>
        ) : (
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2 block">Note</label>
            <textarea value={note} onChange={e => setNote(e.target.value)} rows={2}
              className="w-full border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
              data-testid="payment-note" />
          </div>
        )}

        {error && <p className="text-sm text-rose-600 bg-rose-50 px-4 py-2 rounded-lg" data-testid="payment-error">{error}</p>}

        <div className="flex gap-3 pt-2">
          <Button variant="secondary" size="lg" className="flex-1" loading={loading} onClick={() => handleSubmit(false)} data-testid="payment-save-draft">Save as Draft</Button>
          <Button variant="primary" size="lg" className="flex-1" loading={loading} onClick={() => handleSubmit(true)} data-testid="payment-submit">Post Entry ✓</Button>
        </div>
      </div>
    </div>
  );
}
