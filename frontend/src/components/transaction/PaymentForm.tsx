import React, { useState, useEffect } from 'react';
import { CheckCircle, Home, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { voucherApi, reportsApi } from '@/services/api';
import { formatCurrency } from '@/utils/formatCurrency';
import { todayAPI } from '@/utils/formatDate';
import type { Party, OutstandingParty, VoucherSubType } from '@/types';
import { PartySearchInput } from './PartySearchInput';

type PayFor = 'SUPPLIER' | 'SALARY' | 'RENT' | 'FREIGHT' | 'UTILITY' | 'OTHER';

const PAY_OPTIONS: { key: PayFor; label: string; icon: string; subType: VoucherSubType }[] = [
  { key: 'SUPPLIER', label: 'Supplier Bill', icon: '🏢', subType: 'VENDOR_PAYMENT' },
  { key: 'SALARY', label: 'Salary', icon: '👷', subType: 'EXPENSE_PAYMENT' },
  { key: 'RENT', label: 'Rent', icon: '🏠', subType: 'EXPENSE_PAYMENT' },
  { key: 'FREIGHT', label: 'Freight', icon: '🚚', subType: 'EXPENSE_PAYMENT' },
  { key: 'UTILITY', label: 'Utility', icon: '⚡', subType: 'EXPENSE_PAYMENT' },
  { key: 'OTHER', label: 'Other Expense', icon: '📦', subType: 'EXPENSE_PAYMENT' },
];

export function PaymentForm() {
  const navigate = useNavigate();
  const [payFor, setPayFor] = useState<PayFor | null>(null);
  const [party, setParty] = useState<Party | null>(null);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(todayAPI());
  const [paymentMode, setPaymentMode] = useState<'CASH' | 'BANK'>('CASH');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState<{ amount: number; label: string } | null>(null);
  const [payables, setPayables] = useState<OutstandingParty[]>([]);

  useEffect(() => {
    reportsApi.getPayables().then(setPayables).catch(() => {});
  }, []);

  const getOwed = () => {
    if (!party) return null;
    return payables.find((p) => p.partyId === party.id)?.balance ?? null;
  };

  const handleSubmit = async () => {
    if (!payFor) { setError('Please select what you paid for'); return; }
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }
    if (payFor === 'SUPPLIER' && !party) {
      setError('Please select a supplier');
      return;
    }
    setError('');
    setLoading(true);
    const opt = PAY_OPTIONS.find((o) => o.key === payFor)!;
    const narration =
      payFor === 'OTHER'
        ? description
        : payFor === 'SUPPLIER'
        ? note || undefined
        : PAY_OPTIONS.find((o) => o.key === payFor)?.label;
    try {
      await voucherApi.createDraft({
        voucherType: 'PAYMENT',
        subType: opt.subType,
        totalAmount: Number(amount),
        paymentMode,
        voucherDate: date,
        narration: narration || undefined,
        partyId: payFor === 'SUPPLIER' ? party?.id : undefined,
      });
      setSuccess({ amount: Number(amount), label: opt.label });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex flex-col items-center py-12 px-4 text-center" data-testid="payment-success">
        <div className="h-16 w-16 rounded-full bg-emerald-100 flex items-center justify-center mb-4">
          <CheckCircle className="h-8 w-8 text-emerald-600" />
        </div>
        <h2 className="text-xl font-bold text-slate-800 mb-2">Payment recorded!</h2>
        <p className="text-slate-500 mb-6">
          {formatCurrency(success.amount)} payment for {success.label} saved
        </p>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => { setSuccess(null); setAmount(''); setParty(null); setPayFor(null); setDescription(''); }}
            data-testid="record-another-payment"
          >
            <Plus className="h-4 w-4" /> Record Another
          </Button>
          <Button variant="primary" onClick={() => navigate('/')} data-testid="go-home-after-payment">
            <Home className="h-4 w-4" /> Go to Home
          </Button>
        </div>
      </div>
    );
  }

  const owed = getOwed();

  return (
    <div className="max-w-lg mx-auto px-4 py-6 space-y-6" data-testid="payment-form">
      <div>
        <h2 className="text-lg font-bold text-slate-800">Record a Payment</h2>
        <p className="text-sm text-slate-500">What did you pay for?</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {PAY_OPTIONS.map((opt) => (
          <button
            key={opt.key}
            data-testid={`payment-type-${opt.key.toLowerCase()}`}
            onClick={() => setPayFor(opt.key)}
            className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 text-sm font-medium transition-all ${
              payFor === opt.key
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
            }`}
          >
            <span className="text-xl">{opt.icon}</span>
            {opt.label}
          </button>
        ))}
      </div>

      {payFor === 'SUPPLIER' && (
        <div className="space-y-2">
          <PartySearchInput
            types={['SUPPLIER', 'BOTH']}
            value={party}
            onChange={setParty}
            placeholder="Search supplier by name..."
            label="Select Supplier"
          />
          {party && owed !== null && (
            <p className="text-sm text-rose-700 bg-rose-50 px-3 py-2 rounded-lg">
              You currently owe them: <span className="font-bold">{formatCurrency(owed)}</span>
            </p>
          )}
        </div>
      )}

      {payFor === 'OTHER' && (
        <Input
          label="Describe the expense"
          placeholder="e.g. Office supplies"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          autoFocus
          data-testid="payment-description"
        />
      )}

      <Input
        label="How much?"
        prefix="₹"
        type="number"
        inputMode="decimal"
        min="0"
        step="0.01"
        placeholder="0.00"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        data-testid="payment-amount"
      />

      <div>
        <p className="text-sm font-medium text-slate-700 mb-2">Paid from</p>
        <div className="grid grid-cols-2 gap-3">
          {(['CASH', 'BANK'] as const).map((m) => (
            <button
              key={m}
              data-testid={`payment-mode-${m.toLowerCase()}`}
              onClick={() => setPaymentMode(m)}
              className={`py-2.5 rounded-lg border-2 text-sm font-medium transition-all ${
                paymentMode === m
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-slate-200 text-slate-600 hover:border-slate-300'
              }`}
            >
              {m === 'CASH' ? 'Cash' : 'Bank'}
            </button>
          ))}
        </div>
      </div>

      <Input
        label="Date"
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        data-testid="payment-date"
      />

      <Input
        label="Note (optional)"
        placeholder="Optional note"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        data-testid="payment-note"
      />

      {error && (
        <p className="text-sm text-rose-600 bg-rose-50 px-4 py-2 rounded-lg" data-testid="payment-error">
          {error}
        </p>
      )}

      <Button
        variant="primary"
        size="lg"
        className="w-full"
        loading={loading}
        onClick={handleSubmit}
        data-testid="payment-submit"
      >
        Save Payment →
      </Button>
    </div>
  );
}
