import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, TrendingDown, DollarSign, Landmark, Clock, ArrowRight } from 'lucide-react';
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
      const newErrors: Record<string, string> = {};
      if (rec.status === 'fulfilled') setReceivables(rec.value);
      else newErrors.receivables = 'Could not load receivables';
      if (pay.status === 'fulfilled') setPayables(pay.value);
      else newErrors.payables = 'Could not load payables';
      if (pl.status === 'fulfilled') setPlData(pl.value);
      else newErrors.pl = 'Could not load profit/loss';
      if (dr.status === 'fulfilled') setDrafts(dr.value.slice(0, 5));
      else newErrors.drafts = 'Could not load recent entries';
      if (tb.status === 'fulfilled') setTrialBalance(tb.value);
      else newErrors.tb = 'Could not load balances';
      setErrors(newErrors);
      setLoading(false);
    });
  }, []);

  const totalReceivable = receivables.reduce((s, r) => s + r.balance, 0);
  const totalPayable = payables.reduce((s, p) => s + p.balance, 0);

  const cashBalance = trialBalance?.rows
    .filter((r) => r.accountName.toLowerCase().includes('cash'))
    .reduce((s, r) => s + (r.balanceSide === 'DR' ? r.balance : -r.balance), 0) ?? null;

  const bankBalance = trialBalance?.rows
    .filter((r) => r.accountName.toLowerCase().includes('bank'))
    .reduce((s, r) => s + (r.balanceSide === 'DR' ? r.balance : -r.balance), 0) ?? null;

  const QUICK_ACTIONS = [
    { label: 'Sale', key: 'sale', color: 'bg-emerald-600 hover:bg-emerald-700', icon: '💰' },
    { label: 'Purchase', key: 'purchase', color: 'bg-rose-600 hover:bg-rose-700', icon: '🛒' },
    { label: 'Got Paid', key: 'receipt', color: 'bg-blue-600 hover:bg-blue-700', icon: '✅' },
    { label: 'Paid Bill', key: 'payment', color: 'bg-amber-600 hover:bg-amber-700', icon: '📤' },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6" data-testid="home-page">
      {/* Greeting */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">{getGreeting()} 👋</h1>
        <p className="text-sm text-slate-500 mt-0.5">Here's your business at a glance</p>
      </div>

      {/* Summary Strip */}
      <div className="flex gap-3 overflow-x-auto pb-1 -mx-1 px-1" data-testid="summary-strip">
        {[
          {
            label: 'Cash in Hand',
            value: cashBalance,
            icon: DollarSign,
            color: 'text-emerald-600',
            bg: 'bg-emerald-50',
            error: errors.tb,
          },
          {
            label: 'Bank Balance',
            value: bankBalance,
            icon: Landmark,
            color: 'text-blue-600',
            bg: 'bg-blue-50',
            error: errors.tb,
          },
          {
            label: 'This Month Sales',
            value: plData?.totalIncome ?? null,
            icon: TrendingUp,
            color: 'text-emerald-600',
            bg: 'bg-emerald-50',
            error: errors.pl,
          },
          {
            label: 'This Month Spend',
            value: plData?.totalExpenses ?? null,
            icon: TrendingDown,
            color: 'text-rose-600',
            bg: 'bg-rose-50',
            error: errors.pl,
          },
        ].map((card) => (
          <div
            key={card.label}
            className="flex-shrink-0 bg-white rounded-xl border border-slate-200 p-4 min-w-[150px]"
          >
            <div className={`h-8 w-8 rounded-lg ${card.bg} flex items-center justify-center mb-2`}>
              <card.icon className={`h-4 w-4 ${card.color}`} />
            </div>
            <p className="text-xs text-slate-500">{card.label}</p>
            {loading ? (
              <Skeleton className="h-6 w-20 mt-1" />
            ) : card.error ? (
              <p className="text-xs text-rose-500 mt-1">Unavailable</p>
            ) : card.value !== null ? (
              <p className={`font-mono font-bold text-base mt-0.5 ${card.color}`}>
                {formatCurrency(card.value)}
              </p>
            ) : (
              <p className="text-sm text-slate-400 mt-0.5">—</p>
            )}
          </div>
        ))}
      </div>

      {/* Profit Status */}
      {!loading && plData && (
        <div
          className={`rounded-xl p-4 flex items-center justify-between ${
            plData.netProfit >= 0
              ? 'bg-emerald-50 border border-emerald-200'
              : 'bg-rose-50 border border-rose-200'
          }`}
          data-testid="profit-status-card"
        >
          <div>
            <p className={`font-semibold ${plData.netProfit >= 0 ? 'text-emerald-800' : 'text-rose-800'}`}>
              {plData.netProfit >= 0
                ? `You're profitable this month`
                : `Loss this month — review expenses`}
            </p>
            <p className={`font-mono font-bold text-lg ${plData.netProfit >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
              {formatCurrency(Math.abs(plData.netProfit))}
            </p>
          </div>
          <span className="text-2xl">{plData.netProfit >= 0 ? '📈' : '📉'}</span>
        </div>
      )}

      {/* Receivables & Payables Quick View */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => navigate('/receivables')}
          className="bg-white rounded-xl border border-slate-200 p-4 text-left hover:border-emerald-300 hover:bg-emerald-50 transition-all group"
          data-testid="home-receivables-btn"
        >
          <p className="text-xs text-slate-500 mb-1">Who owes you</p>
          {loading ? (
            <Skeleton className="h-7 w-24" />
          ) : (
            <p className="font-mono font-bold text-emerald-600 text-xl">
              {formatCurrency(totalReceivable)}
            </p>
          )}
          <p className="text-xs text-blue-600 flex items-center gap-1 mt-2 group-hover:gap-2 transition-all">
            See list <ArrowRight className="h-3 w-3" />
          </p>
        </button>
        <button
          onClick={() => navigate('/payables')}
          className="bg-white rounded-xl border border-slate-200 p-4 text-left hover:border-rose-300 hover:bg-rose-50 transition-all group"
          data-testid="home-payables-btn"
        >
          <p className="text-xs text-slate-500 mb-1">You owe</p>
          {loading ? (
            <Skeleton className="h-7 w-24" />
          ) : (
            <p className="font-mono font-bold text-rose-600 text-xl">
              {formatCurrency(totalPayable)}
            </p>
          )}
          <p className="text-xs text-blue-600 flex items-center gap-1 mt-2 group-hover:gap-2 transition-all">
            See list <ArrowRight className="h-3 w-3" />
          </p>
        </button>
      </div>

      {/* Recent Activity */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-slate-800">Recent Activity</h2>
          <button
            onClick={() => navigate('/pending')}
            className="text-sm text-blue-600 hover:text-blue-800"
            data-testid="view-all-pending"
          >
            View all
          </button>
        </div>
        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => <Skeleton key={i} className="h-14" />)}
          </div>
        ) : errors.drafts ? (
          <p className="text-sm text-slate-500 py-4 text-center">{errors.drafts}</p>
        ) : drafts.length === 0 ? (
          <div className="text-center py-8 text-slate-400">
            <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No recent entries</p>
          </div>
        ) : (
          <div className="space-y-2" data-testid="recent-activity">
            {drafts.map((v) => {
              const isIncome = v.voucherType === 'SALE' || v.voucherType === 'RECEIPT';
              return (
                <div
                  key={v.voucherId}
                  className="flex items-center justify-between bg-white rounded-xl border border-slate-100 px-4 py-3 hover:border-slate-200 cursor-pointer"
                  onClick={() => navigate('/pending')}
                  data-testid={`recent-entry-${v.voucherId}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-sm">
                      {isIncome ? '💰' : '💸'}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-700">{describeVoucher(v)}</p>
                      <p className="text-xs text-slate-400">{formatDate(v.voucherDate)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`font-mono font-bold text-sm ${isIncome ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {isIncome ? '+' : '-'}{formatCurrency(v.totalAmount)}
                    </span>
                    <Badge variant={v.status === 'DRAFT' ? 'draft' : 'posted'}>
                      {v.status}
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Quick Record Shortcuts */}
      <div>
        <h2 className="font-semibold text-slate-800 mb-3">Quick Record</h2>
        <div className="grid grid-cols-4 gap-2">
          {QUICK_ACTIONS.map((a) => (
            <button
              key={a.key}
              data-testid={`quick-action-${a.key}`}
              onClick={() => navigate(`/record/${a.key}`)}
              className={`flex flex-col items-center gap-1.5 p-3 rounded-xl text-white text-xs font-medium transition-all active:scale-95 ${a.color}`}
            >
              <span className="text-xl">{a.icon}</span>
              {a.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
