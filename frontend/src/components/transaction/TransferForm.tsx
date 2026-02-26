import React, { useState } from 'react';
import { CheckCircle, Home, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
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
  const [success, setSuccess] = useState<{ amount: number } | null>(null);

  const handleSubmit = async () => {
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await voucherApi.createDraft({
        voucherType: 'CONTRA',
        subType: direction,
        totalAmount: Number(amount),
        paymentMode: direction === 'CASH_TO_BANK' ? 'CASH' : 'BANK',
        voucherDate: date,
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
      <div className="flex flex-col items-center py-12 px-4 text-center" data-testid="transfer-success">
        <div className="h-16 w-16 rounded-full bg-emerald-100 flex items-center justify-center mb-4">
          <CheckCircle className="h-8 w-8 text-emerald-600" />
        </div>
        <h2 className="text-xl font-bold text-slate-800 mb-2">Transfer recorded!</h2>
        <p className="text-slate-500 mb-6">
          {formatCurrency(success.amount)} transferred{' '}
          {direction === 'CASH_TO_BANK' ? 'from cash to bank' : 'from bank to cash'}
        </p>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => { setSuccess(null); setAmount(''); }}
            data-testid="record-another-transfer"
          >
            <Plus className="h-4 w-4" /> Record Another
          </Button>
          <Button variant="primary" onClick={() => navigate('/')} data-testid="go-home-after-transfer">
            <Home className="h-4 w-4" /> Go to Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-6 space-y-6" data-testid="transfer-form">
      <div>
        <h2 className="text-lg font-bold text-slate-800">Record a Transfer</h2>
        <p className="text-sm text-slate-500">Moving money between cash and bank</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button
          data-testid="transfer-cash-to-bank"
          onClick={() => setDirection('CASH_TO_BANK')}
          className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 text-sm font-medium transition-all ${
            direction === 'CASH_TO_BANK'
              ? 'border-blue-500 bg-blue-50 text-blue-700'
              : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
          }`}
        >
          <span className="text-2xl">💵→🏦</span>
          Cash → Bank
        </button>
        <button
          data-testid="transfer-bank-to-cash"
          onClick={() => setDirection('BANK_TO_CASH')}
          className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 text-sm font-medium transition-all ${
            direction === 'BANK_TO_CASH'
              ? 'border-blue-500 bg-blue-50 text-blue-700'
              : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
          }`}
        >
          <span className="text-2xl">🏦→💵</span>
          Bank → Cash
        </button>
      </div>

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
        autoFocus
        data-testid="transfer-amount"
      />

      <Input
        label="Date"
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        data-testid="transfer-date"
      />

      {error && (
        <p className="text-sm text-rose-600 bg-rose-50 px-4 py-2 rounded-lg" data-testid="transfer-error">
          {error}
        </p>
      )}

      <Button
        variant="primary"
        size="lg"
        className="w-full"
        loading={loading}
        onClick={handleSubmit}
        data-testid="transfer-submit"
      >
        Save Transfer →
      </Button>
    </div>
  );
}
