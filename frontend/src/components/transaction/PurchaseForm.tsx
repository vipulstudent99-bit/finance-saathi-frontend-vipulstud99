import React, { useState, useEffect } from 'react';
import { CheckCircle, Home, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { voucherApi } from '@/services/api';
import { formatCurrency } from '@/utils/formatCurrency';
import { todayAPI } from '@/utils/formatDate';
import type { Party } from '@/types';
import { PartySearchInput } from './PartySearchInput';

export function PurchaseForm() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<'CREDIT' | 'CASH'>('CASH');
  const [party, setParty] = useState<Party | null>(null);
  const [narration, setNarration] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(todayAPI());
  const [paymentMode, setPaymentMode] = useState<'CASH' | 'BANK'>('CASH');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState<{ amount: number; partyName?: string } | null>(null);

  const handleSubmit = async () => {
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }
    if (mode === 'CREDIT' && !party) {
      setError('Please select a supplier');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await voucherApi.createDraft({
        voucherType: 'PURCHASE',
        subType: mode === 'CREDIT' ? 'CREDIT_PURCHASE' : 'CASH_PURCHASE',
        totalAmount: Number(amount),
        paymentMode: mode === 'CASH' ? paymentMode : 'CASH',
        voucherDate: date,
        narration: narration || undefined,
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
      <div className="flex flex-col items-center py-12 px-4 text-center" data-testid="purchase-success">
        <div className="h-16 w-16 rounded-full bg-emerald-100 flex items-center justify-center mb-4">
          <CheckCircle className="h-8 w-8 text-emerald-600" />
        </div>
        <h2 className="text-xl font-bold text-slate-800 mb-2">Purchase recorded!</h2>
        <p className="text-slate-500 mb-6">
          {success.partyName
            ? `Purchase from ${success.partyName} of ${formatCurrency(success.amount)} saved`
            : `${formatCurrency(success.amount)} recorded as cash purchase`}
        </p>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => { setSuccess(null); setAmount(''); setNarration(''); setParty(null); }}
            data-testid="record-another-purchase"
          >
            <Plus className="h-4 w-4" /> Record Another
          </Button>
          <Button variant="primary" onClick={() => navigate('/')} data-testid="go-home-after-purchase">
            <Home className="h-4 w-4" /> Go to Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-6 space-y-6" data-testid="purchase-form">
      <div>
        <h2 className="text-lg font-bold text-slate-800">Record a Purchase</h2>
        <p className="text-sm text-slate-500">Who did you buy from?</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button
          data-testid="purchase-mode-credit"
          onClick={() => setMode('CREDIT')}
          className={`flex flex-col items-center gap-1 p-4 rounded-xl border-2 text-sm font-medium transition-all ${
            mode === 'CREDIT'
              ? 'border-blue-500 bg-blue-50 text-blue-700'
              : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
          }`}
        >
          <span className="text-lg">👤</span>
          A Supplier (on credit)
        </button>
        <button
          data-testid="purchase-mode-cash"
          onClick={() => setMode('CASH')}
          className={`flex flex-col items-center gap-1 p-4 rounded-xl border-2 text-sm font-medium transition-all ${
            mode === 'CASH'
              ? 'border-blue-500 bg-blue-50 text-blue-700'
              : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
          }`}
        >
          <span className="text-lg">💵</span>
          Cash / Direct purchase
        </button>
      </div>

      {mode === 'CREDIT' && (
        <PartySearchInput
          types={['SUPPLIER', 'BOTH']}
          value={party}
          onChange={setParty}
          placeholder="Search supplier by name..."
          label="Select Supplier"
        />
      )}

      <Input
        label="What did you buy? (required)"
        placeholder="e.g. Raw materials, office supplies"
        value={narration}
        onChange={(e) => setNarration(e.target.value)}
        autoFocus
        data-testid="purchase-narration"
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
        data-testid="purchase-amount"
      />

      {mode === 'CASH' && (
        <div>
          <p className="text-sm font-medium text-slate-700 mb-2">How did you pay?</p>
          <div className="grid grid-cols-2 gap-3">
            {(['CASH', 'BANK'] as const).map((m) => (
              <button
                key={m}
                data-testid={`purchase-payment-${m.toLowerCase()}`}
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

      <Input
        label="Date"
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        data-testid="purchase-date"
      />

      {error && (
        <p className="text-sm text-rose-600 bg-rose-50 px-4 py-2 rounded-lg" data-testid="purchase-error">
          {error}
        </p>
      )}

      <Button
        variant="primary"
        size="lg"
        className="w-full"
        loading={loading}
        onClick={handleSubmit}
        data-testid="purchase-submit"
      >
        Save Purchase →
      </Button>
    </div>
  );
}
