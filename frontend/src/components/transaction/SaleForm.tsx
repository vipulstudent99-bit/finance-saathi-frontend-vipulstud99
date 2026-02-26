import React, { useState, useEffect, useRef } from 'react';
import { CheckCircle, Home, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { voucherApi, partyApi } from '@/services/api';
import { formatCurrency } from '@/utils/formatCurrency';
import { todayAPI } from '@/utils/formatDate';
import type { Party } from '@/types';
import { PartySearchInput } from './PartySearchInput';

export function SaleForm() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<'CREDIT' | 'CASH'>('CASH');
  const [party, setParty] = useState<Party | null>(null);
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(todayAPI());
  const [note, setNote] = useState('');
  const [paymentMode, setPaymentMode] = useState<'CASH' | 'BANK'>('CASH');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState<{ amount: number; partyName?: string } | null>(null);
  const amountRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setTimeout(() => amountRef.current?.focus(), 100);
  }, [mode]);

  const handleSubmit = async () => {
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }
    if (mode === 'CREDIT' && !party) {
      setError('Please select a customer');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await voucherApi.createDraft({
        voucherType: 'SALE',
        subType: mode === 'CREDIT' ? 'CREDIT_SALE' : 'CASH_SALE',
        totalAmount: Number(amount),
        paymentMode: mode === 'CASH' ? paymentMode : 'CASH',
        voucherDate: date,
        narration: note || undefined,
        partyId: party?.id || undefined,
      });
      setSuccess({ amount: Number(amount), partyName: party?.name });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex flex-col items-center py-12 px-4 text-center" data-testid="sale-success">
        <div className="h-16 w-16 rounded-full bg-emerald-100 flex items-center justify-center mb-4">
          <CheckCircle className="h-8 w-8 text-emerald-600" />
        </div>
        <h2 className="text-xl font-bold text-slate-800 mb-2">Sale recorded!</h2>
        <p className="text-slate-500 mb-6">
          {success.partyName
            ? `${success.partyName} now owes you ${formatCurrency(success.amount)}`
            : `${formatCurrency(success.amount)} recorded as cash sale`}
        </p>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => {
              setSuccess(null);
              setAmount('');
              setNote('');
              setParty(null);
            }}
            data-testid="record-another-sale"
          >
            <Plus className="h-4 w-4" /> Record Another Sale
          </Button>
          <Button variant="primary" onClick={() => navigate('/')} data-testid="go-home-after-sale">
            <Home className="h-4 w-4" /> Go to Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-6 space-y-6" data-testid="sale-form">
      <div>
        <h2 className="text-lg font-bold text-slate-800">Record a Sale</h2>
        <p className="text-sm text-slate-500">Step 1 — Who bought?</p>
      </div>

      {/* Mode toggle */}
      <div className="grid grid-cols-2 gap-3">
        <button
          data-testid="sale-mode-credit"
          onClick={() => setMode('CREDIT')}
          className={`flex flex-col items-center gap-1 p-4 rounded-xl border-2 text-sm font-medium transition-all ${
            mode === 'CREDIT'
              ? 'border-blue-500 bg-blue-50 text-blue-700'
              : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
          }`}
        >
          <span className="text-lg">👤</span>
          A Customer (on credit)
        </button>
        <button
          data-testid="sale-mode-cash"
          onClick={() => setMode('CASH')}
          className={`flex flex-col items-center gap-1 p-4 rounded-xl border-2 text-sm font-medium transition-all ${
            mode === 'CASH'
              ? 'border-blue-500 bg-blue-50 text-blue-700'
              : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
          }`}
        >
          <span className="text-lg">💵</span>
          Cash / Walk-in customer
        </button>
      </div>

      {/* Party search */}
      {mode === 'CREDIT' && (
        <PartySearchInput
          types={['CUSTOMER', 'BOTH']}
          value={party}
          onChange={setParty}
          placeholder="Search customer by name..."
          label="Select Customer"
        />
      )}

      {/* Amount */}
      <Input
        ref={amountRef}
        label="Amount"
        prefix="₹"
        type="number"
        inputMode="decimal"
        min="0"
        step="0.01"
        placeholder="0.00"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        data-testid="sale-amount"
      />

      {/* Date */}
      <Input
        label="Date"
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        data-testid="sale-date"
      />

      {/* Note */}
      <Input
        label="Note (optional)"
        placeholder="e.g. 50 units of Product A"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        data-testid="sale-note"
      />

      {/* Payment mode for cash */}
      {mode === 'CASH' && (
        <div>
          <p className="text-sm font-medium text-slate-700 mb-2">Received in</p>
          <div className="grid grid-cols-2 gap-3">
            {(['CASH', 'BANK'] as const).map((m) => (
              <button
                key={m}
                data-testid={`sale-payment-${m.toLowerCase()}`}
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
      )}

      {error && (
        <p className="text-sm text-rose-600 bg-rose-50 px-4 py-2 rounded-lg" data-testid="sale-error">
          {error}
        </p>
      )}

      <Button
        variant="primary"
        size="lg"
        className="w-full"
        loading={loading}
        onClick={handleSubmit}
        data-testid="sale-submit"
      >
        Save Sale →
      </Button>
    </div>
  );
}
