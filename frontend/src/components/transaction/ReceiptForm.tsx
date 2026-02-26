import React, { useState, useEffect } from 'react';
import { CheckCircle, Home, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
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
  const [note, setNote] = useState('');
  const [paymentMode, setPaymentMode] = useState<'CASH' | 'BANK'>('CASH');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState<{ amount: number; partyName: string; prevBalance?: number } | null>(null);
  const [receivables, setReceivables] = useState<OutstandingParty[]>([]);

  useEffect(() => {
    reportsApi.getReceivables().then(setReceivables).catch(() => {});
  }, []);

  const getCurrentOwed = () => {
    if (!party) return null;
    return receivables.find((r) => r.partyId === party.id)?.balance ?? null;
  };

  const owed = getCurrentOwed();

  const handleSubmit = async () => {
    if (!party) { setError('Please select a customer'); return; }
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await voucherApi.createDraft({
        voucherType: 'RECEIPT',
        subType: 'CASH_SALE', // backend expects a subType; receipt uses default
        totalAmount: Number(amount),
        paymentMode,
        voucherDate: date,
        narration: note || undefined,
        partyId: party.id,
      });
      setSuccess({ amount: Number(amount), partyName: party.name, prevBalance: owed ?? undefined });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    const newBalance = (success.prevBalance ?? 0) - success.amount;
    return (
      <div className="flex flex-col items-center py-12 px-4 text-center" data-testid="receipt-success">
        <div className="h-16 w-16 rounded-full bg-emerald-100 flex items-center justify-center mb-4">
          <CheckCircle className="h-8 w-8 text-emerald-600" />
        </div>
        <h2 className="text-xl font-bold text-slate-800 mb-2">Payment received!</h2>
        <p className="text-slate-500 mb-6">
          {success.prevBalance !== undefined
            ? `${success.partyName} now owes ${formatCurrency(Math.max(0, newBalance))} (was ${formatCurrency(success.prevBalance)})`
            : `${formatCurrency(success.amount)} received from ${success.partyName}`}
        </p>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => { setSuccess(null); setAmount(''); setNote(''); setParty(null); }}
            data-testid="record-another-receipt"
          >
            <Plus className="h-4 w-4" /> Record Another
          </Button>
          <Button variant="primary" onClick={() => navigate('/')} data-testid="go-home-after-receipt">
            <Home className="h-4 w-4" /> Go to Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-6 space-y-6" data-testid="receipt-form">
      <div>
        <h2 className="text-lg font-bold text-slate-800">Record Money Received</h2>
        <p className="text-sm text-slate-500">Which customer paid?</p>
      </div>

      <div className="space-y-2">
        <PartySearchInput
          types={['CUSTOMER', 'BOTH']}
          value={party}
          onChange={setParty}
          placeholder="Search customer by name..."
          label="Select Customer"
        />
        {party && owed !== null && (
          <p className="text-sm text-emerald-700 bg-emerald-50 px-3 py-2 rounded-lg">
            Currently owes you: <span className="font-bold">{formatCurrency(owed)}</span>
          </p>
        )}
      </div>

      <Input
        label="How much did they pay?"
        prefix="₹"
        type="number"
        inputMode="decimal"
        min="0"
        step="0.01"
        placeholder="0.00"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        data-testid="receipt-amount"
      />

      <div>
        <p className="text-sm font-medium text-slate-700 mb-2">Received in</p>
        <div className="grid grid-cols-2 gap-3">
          {(['CASH', 'BANK'] as const).map((m) => (
            <button
              key={m}
              data-testid={`receipt-payment-${m.toLowerCase()}`}
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
        data-testid="receipt-date"
      />

      <Input
        label="Note (optional)"
        placeholder="Optional note"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        data-testid="receipt-note"
      />

      {error && (
        <p className="text-sm text-rose-600 bg-rose-50 px-4 py-2 rounded-lg" data-testid="receipt-error">
          {error}
        </p>
      )}

      <Button
        variant="primary"
        size="lg"
        className="w-full"
        loading={loading}
        onClick={handleSubmit}
        data-testid="receipt-submit"
      >
        Save Receipt →
      </Button>
    </div>
  );
}
