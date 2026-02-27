import React, { useEffect, useState } from 'react';
import { Building2, Calendar } from 'lucide-react';
import { formatCurrency } from '@/utils/formatCurrency';
import { formatDate, getFirstDayOfMonth, todayAPI } from '@/utils/formatDate';
import { Skeleton } from '@/components/ui/LoadingSpinner';

const BASE = '/api';

async function getBankBook(from?: string, to?: string) {
  const p = new URLSearchParams();
  if (from) p.set('from', from);
  if (to) p.set('to', to);
  const qs = p.toString();
  const res = await fetch(`${BASE}/reports/bank-book${qs ? `?${qs}` : ''}`);
  if (!res.ok) throw new Error('Failed to fetch bank book');
  return res.json();
}

interface Transaction {
  date: string;
  voucherId: string;
  voucherNumber?: number;
  voucherType: string;
  subType?: string;
  narration?: string;
  partyName?: string;
  debit: number;
  credit: number;
  balance: number;
  balanceSide: 'DR' | 'CR';
}

interface BankBookData {
  accountName: string;
  accountCode: string;
  openingBalance: number;
  openingBalanceSide: 'DR' | 'CR';
  transactions: Transaction[];
  totalDebit: number;
  totalCredit: number;
  closingBalance: number;
  closingBalanceSide: 'DR' | 'CR';
}

export default function BankBook() {
  const [data, setData] = useState<BankBookData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [from, setFrom] = useState(getFirstDayOfMonth());
  const [to, setTo] = useState(todayAPI());

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getBankBook(from, to);
      setData(result);
    } catch (e: any) {
      setError(e.message ?? 'Error loading bank book');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [from, to]);

  return (
    <div className="max-w-5xl mx-auto px-6 py-8 space-y-6" data-testid="bank-book-page">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-blue-100 flex items-center justify-center">
            <Building2 className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Bank Book</h1>
            <p className="text-sm text-slate-500">All bank transactions</p>
          </div>
        </div>
      </div>

      {/* Date Filter */}
      <div className="flex items-center gap-3 bg-white border border-slate-200 rounded-xl p-4">
        <Calendar className="h-4 w-4 text-slate-400 shrink-0" />
        <div className="flex items-center gap-2 flex-wrap">
          <label className="text-sm text-slate-600">From</label>
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="text-sm border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <label className="text-sm text-slate-600">To</label>
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="text-sm border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Summary Cards */}
      {!loading && data && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <p className="text-xs text-slate-500 uppercase tracking-wider">Opening Balance</p>
            <p className="text-xl font-mono font-bold text-slate-700 mt-1">{formatCurrency(data.openingBalance)}</p>
            <p className="text-xs text-slate-400">{data.openingBalanceSide}</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <p className="text-xs text-slate-500 uppercase tracking-wider">Total In</p>
            <p className="text-xl font-mono font-bold text-emerald-600 mt-1">{formatCurrency(data.totalDebit)}</p>
            <p className="text-xs text-slate-400">Credits received</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <p className="text-xs text-slate-500 uppercase tracking-wider">Total Out</p>
            <p className="text-xl font-mono font-bold text-rose-600 mt-1">{formatCurrency(data.totalCredit)}</p>
            <p className="text-xs text-slate-400">Payments made</p>
          </div>
          <div className="bg-white rounded-xl border border-blue-200 bg-blue-50 p-4">
            <p className="text-xs text-blue-700 uppercase tracking-wider">Closing Balance</p>
            <p className="text-xl font-mono font-bold text-blue-700 mt-1">{formatCurrency(data.closingBalance)}</p>
            <p className="text-xs text-blue-600">{data.closingBalanceSide}</p>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm" data-testid="bank-book-table">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Date</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Particulars</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Type</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-emerald-600 uppercase tracking-wider">In (DR)</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-rose-600 uppercase tracking-wider">Out (CR)</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Balance</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [1,2,3,4,5].map(i => (
                  <tr key={i} className="border-b border-slate-100">
                    {[1,2,3,4,5,6].map(j => (
                      <td key={j} className="px-4 py-3"><Skeleton className="h-4 w-full" /></td>
                    ))}
                  </tr>
                ))
              ) : error ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-rose-500">{error}</td>
                </tr>
              ) : !data || data.transactions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-slate-400">No transactions in this period</td>
                </tr>
              ) : (
                data.transactions.map((tx, i) => (
                  <tr key={tx.voucherId + i} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{formatDate(tx.date)}</td>
                    <td className="px-4 py-3">
                      <p className="text-slate-800 font-medium">{tx.narration || tx.partyName || '—'}</p>
                      {tx.partyName && tx.narration && <p className="text-xs text-slate-400">{tx.partyName}</p>}
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-block bg-slate-100 text-slate-600 text-xs px-2 py-0.5 rounded-full">
                        {tx.subType || tx.voucherType}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-mono">
                      {tx.debit > 0 ? <span className="text-emerald-600 font-semibold">{formatCurrency(tx.debit)}</span> : <span className="text-slate-300">—</span>}
                    </td>
                    <td className="px-4 py-3 text-right font-mono">
                      {tx.credit > 0 ? <span className="text-rose-600 font-semibold">{formatCurrency(tx.credit)}</span> : <span className="text-slate-300">—</span>}
                    </td>
                    <td className="px-4 py-3 text-right font-mono">
                      <span className={tx.balanceSide === 'DR' ? 'text-blue-700 font-bold' : 'text-rose-700 font-bold'}>
                        {formatCurrency(tx.balance)} {tx.balanceSide}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            {!loading && data && data.transactions.length > 0 && (
              <tfoot>
                <tr className="bg-slate-50 border-t-2 border-slate-300">
                  <td colSpan={3} className="px-4 py-3 text-sm font-semibold text-slate-700">Totals</td>
                  <td className="px-4 py-3 text-right font-mono font-bold text-emerald-600">{formatCurrency(data.totalDebit)}</td>
                  <td className="px-4 py-3 text-right font-mono font-bold text-rose-600">{formatCurrency(data.totalCredit)}</td>
                  <td className="px-4 py-3 text-right font-mono font-bold text-slate-800">
                    {formatCurrency(data.closingBalance)} {data.closingBalanceSide}
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    </div>
  );
}
