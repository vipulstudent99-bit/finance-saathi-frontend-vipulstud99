import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Banknote, Building2, TrendingUp, TrendingDown,
  ShoppingCart, Package, ArrowDownCircle, ArrowUpCircle, ArrowRight,
} from 'lucide-react';
import { reportsApi, voucherApi } from '@/services/api';
import { formatCurrency } from '@/utils/formatCurrency';
import { formatDate, getGreeting, getFirstDayOfMonth, todayAPI } from '@/utils/formatDate';
import { describeVoucher } from '@/utils/transactionHelpers';
import { Skeleton } from '@/components/ui/LoadingSpinner';
import { Badge } from '@/components/ui/Badge';
import type { OutstandingParty, ProfitLossReport, Voucher, TrialBalanceReport } from '@/types';

export default function Home() {
  const navigate = useNavigate();
  const [receivables, setReceivables] = useState<OutstandingParty[]>([]);
  const [payables, setPayables] = useState<OutstandingParty[]>([]);
  const [plData, setPlData] = useState<ProfitLossReport | null>(null);
  const [drafts, setDrafts] = useState<Voucher[]>([]);
  const [trialBalance, setTrialBalance] = useState<TrialBalanceReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const from = getFirstDayOfMonth();
    const to = todayAPI();
    Promise.allSettled([
      reportsApi.getReceivables(),
      reportsApi.getPayables(),
      reportsApi.getProfitLoss(from, to),
      voucherApi.listDrafts(),
      reportsApi.getTrialBalance(),
    ]).then(([rec, pay, pl, dr, tb]) => {
      const e: Record<string, string> = {};
      if (rec.status === 'fulfilled') setReceivables(rec.value);
      else e.receivables = 'Unavailable';
      if (pay.status === 'fulfilled') setPayables(pay.value);
      else e.payables = 'Unavailable';
      if (pl.status === 'fulfilled') setPlData(pl.value);
      else e.pl = 'Unavailable';
      if (dr.status === 'fulfilled') setDrafts(dr.value.slice(0, 5));
      else e.drafts = 'Could not load entries';
      if (tb.status === 'fulfilled') setTrialBalance(tb.value);
      else e.tb = 'Unavailable';
      setErrors(e);
      setLoading(false);
    });
  }, []);

  const totalReceivable = receivables.reduce((s, r) => s + r.balance, 0);
  const totalPayable = payables.reduce((s, p) => s + p.balance, 0);

  const cashBalance = trialBalance?.rows
    .filter(r => r.accountName.toLowerCase().includes('cash'))
    .reduce((s, r) => s + (r.balanceSide === 'DR' ? r.balance ?? r.debit - r.credit : -(r.balance ?? r.credit - r.debit)), 0) ?? null;

  const bankBalance = trialBalance?.rows
    .filter(r => r.accountName.toLowerCase().includes('bank'))
    .reduce((s, r) => s + (r.balanceSide === 'DR' ? r.balance ?? r.debit - r.credit : -(r.balance ?? r.credit - r.debit)), 0) ?? null;

  const STAT_CARDS = [
    { label: 'Cash in Hand', value: cashBalance, icon: Banknote, bg: 'bg-emerald-100', color: 'text-emerald-600', sub: 'Current balance', err: errors.tb },
    { label: 'Bank Balance', value: bankBalance, icon: Building2, bg: 'bg-blue-100', color: 'text-blue-600', sub: 'Across accounts', err: errors.tb },
    { label: 'This Month Sales', value: plData?.income ?? null, icon: TrendingUp, bg: 'bg-emerald-100', color: 'text-emerald-600', sub: 'Total income', err: errors.pl },
    { label: 'This Month Spend', value: plData?.expenses ?? null, icon: TrendingDown, bg: 'bg-rose-100', color: 'text-rose-600', sub: 'Total expenses', err: errors.pl },
  ];

  const QUICK_ACTIONS = [
    { label: 'Sale', desc: 'Record a sale', key: 'sale?m=CASH', icon: ShoppingCart, bg: 'bg-emerald-100', color: 'text-emerald-600' },
    { label: 'Purchase', desc: 'Record a purchase', key: 'purchase?m=CASH', icon: Package, bg: 'bg-rose-100', color: 'text-rose-600' },
    { label: 'Got Paid', desc: 'Received payment', key: 'receipt', icon: ArrowDownCircle, bg: 'bg-blue-100', color: 'text-blue-600' },
    { label: 'Paid Bill', desc: 'Made a payment', key: 'payment?t=VENDOR', icon: ArrowUpCircle, bg: 'bg-amber-100', color: 'text-amber-600' },
  ];

  const borderByType: Record<string, string> = {
    SALE: 'border-l-emerald-500', RECEIPT: 'border-l-blue-500',
    PURCHASE: 'border-l-rose-500', PAYMENT: 'border-l-amber-500',
    CONTRA: 'border-l-slate-500', JOURNAL: 'border-l-purple-500',
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-8 space-y-8" data-testid="home-page">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">{getGreeting()} 👋</h1>
        <p className="text-sm text-slate-500 mt-1">Here's your business at a glance</p>
      </div>

      {/* Stat Cards — 4 col grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4" data-testid="summary-strip">
        {STAT_CARDS.map((c) => (
          <div key={c.label} className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
            <div className={`h-10 w-10 rounded-xl ${c.bg} flex items-center justify-center`}>
              <c.icon className={`h-5 w-5 ${c.color}`} />
            </div>
            <p className="text-xs uppercase tracking-widest text-slate-500 font-medium mt-3">{c.label}</p>
            {loading ? (
              <Skeleton className="h-7 w-28 mt-1" />
            ) : c.err ? (
              <p className="text-sm text-slate-400 mt-1">Unavailable</p>
            ) : c.value !== null ? (
              <p className={`text-2xl font-bold font-mono mt-1 ${c.color}`}>{formatCurrency(c.value)}</p>
            ) : (
              <p className="text-2xl font-bold font-mono mt-1 text-slate-300">—</p>
            )}
            <p className="text-xs text-slate-400 mt-0.5">{c.sub}</p>
          </div>
        ))}
      </div>

      {/* Profit Status */}
      {!loading && plData && (
        <div
          className={`rounded-2xl p-5 flex items-center justify-between ${
            plData.netProfit >= 0
              ? 'bg-emerald-50 border-l-4 border-emerald-500 border border-emerald-100'
              : 'bg-rose-50 border-l-4 border-rose-500 border border-rose-100'
          }`}
          data-testid="profit-status-card"
        >
          <div>
            <p className={`text-sm font-medium ${plData.netProfit >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
              {plData.netProfit >= 0 ? "You're profitable this month" : 'Loss this month — review expenses'}
            </p>
            <p className={`text-3xl font-mono font-bold mt-1 ${plData.netProfit >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
              {formatCurrency(Math.abs(plData.netProfit))}
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl mb-1">{plData.netProfit >= 0 ? '📈' : '📉'}</div>
            <button
              onClick={() => navigate('/profit-loss')}
              className={`text-xs font-medium flex items-center gap-1 ${plData.netProfit >= 0 ? 'text-emerald-600 hover:text-emerald-800' : 'text-rose-600 hover:text-rose-800'}`}
            >
              View P&L <ArrowRight className="h-3 w-3" />
            </button>
          </div>
        </div>
      )}

      {/* Who Owes You / You Owe */}
      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={() => navigate('/receivables')}
          className="group bg-white rounded-xl border border-slate-200 shadow-sm p-5 text-left min-h-[100px] hover:border-emerald-300 hover:shadow-md transition-all"
          data-testid="home-receivables-btn"
        >
          <p className="text-xs uppercase tracking-widest text-slate-500 font-medium">Who owes you</p>
          {loading ? <Skeleton className="h-7 w-28 mt-2" /> : (
            <p className="text-2xl font-mono font-bold text-emerald-600 mt-1">{formatCurrency(totalReceivable)}</p>
          )}
          <p className="text-xs text-slate-400 mt-0.5">{receivables.length} customers</p>
          <p className="text-xs text-emerald-600 flex items-center gap-1 mt-2">
            See list <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
          </p>
        </button>
        <button
          onClick={() => navigate('/payables')}
          className="group bg-white rounded-xl border border-slate-200 shadow-sm p-5 text-left min-h-[100px] hover:border-rose-300 hover:shadow-md transition-all"
          data-testid="home-payables-btn"
        >
          <p className="text-xs uppercase tracking-widest text-slate-500 font-medium">You owe</p>
          {loading ? <Skeleton className="h-7 w-28 mt-2" /> : (
            <p className="text-2xl font-mono font-bold text-rose-600 mt-1">{formatCurrency(totalPayable)}</p>
          )}
          <p className="text-xs text-slate-400 mt-0.5">{payables.length} suppliers</p>
          <p className="text-xs text-rose-600 flex items-center gap-1 mt-2">
            See list <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
          </p>
        </button>
      </div>

      {/* Recent Activity */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold text-slate-800">Recent Activity</h2>
          <button
            onClick={() => navigate('/pending')}
            className="text-xs text-emerald-600 hover:text-emerald-800 flex items-center gap-1"
            data-testid="view-all-pending"
          >
            View All <ArrowRight className="h-3 w-3" />
          </button>
        </div>
        {loading ? (
          <div className="space-y-2">{[1,2,3].map(i => <Skeleton key={i} className="h-16" />)}</div>
        ) : errors.drafts ? (
          <div className="bg-slate-50 rounded-xl border border-slate-200 px-4 py-8 text-center text-sm text-slate-400">{errors.drafts}</div>
        ) : drafts.length === 0 ? (
          <div className="bg-slate-50 rounded-xl border border-slate-200 px-4 py-8 text-center">
            <p className="text-sm text-slate-400">No recent entries</p>
          </div>
        ) : (
          <div className="space-y-2" data-testid="recent-activity">
            {drafts.map((v) => {
              const isIncome = v.voucherType === 'SALE' || v.voucherType === 'RECEIPT';
              const borderColor = borderByType[v.voucherType] || 'border-l-slate-300';
              return (
                <div
                  key={v.voucherId}
                  onClick={() => navigate('/pending')}
                  className={`bg-white rounded-xl border border-slate-100 border-l-4 ${borderColor} px-4 py-3 flex items-center justify-between hover:bg-slate-50 cursor-pointer transition-colors`}
                  data-testid={`recent-entry-${v.voucherId}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-slate-100 flex items-center justify-center text-sm shrink-0">
                      {isIncome ? '💰' : '💸'}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-700">{describeVoucher(v)}</p>
                      <p className="text-xs text-slate-400">{formatDate(v.voucherDate)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`font-mono font-bold text-sm ${isIncome ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {isIncome ? '+' : '-'}{formatCurrency(v.totalAmount)}
                    </span>
                    <Badge variant={v.status === 'DRAFT' ? 'draft' : 'posted'}>{v.status}</Badge>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Quick Record */}
      <div>
        <h2 className="text-base font-semibold text-slate-800 mb-3">Quick Record</h2>
        <div className="grid grid-cols-4 gap-3">
          {QUICK_ACTIONS.map((a) => (
            <button
              key={a.key}
              data-testid={`quick-action-${a.key.split('?')[0]}`}
              onClick={() => navigate(`/record/${a.key}`)}
              className="bg-white rounded-xl border border-slate-200 p-4 text-left hover:shadow-md hover:-translate-y-0.5 transition-all group"
            >
              <div className={`h-9 w-9 rounded-xl ${a.bg} flex items-center justify-center mb-2`}>
                <a.icon className={`h-4 w-4 ${a.color}`} />
              </div>
              <p className="text-sm font-medium text-slate-800">{a.label}</p>
              <p className="text-xs text-slate-400 mt-0.5">{a.desc}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
