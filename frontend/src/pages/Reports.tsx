import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart2, BookOpen, TrendingUp, TrendingDown } from 'lucide-react';

const REPORT_CARDS = [
  {
    to: '/trial-balance',
    icon: BookOpen,
    title: 'Account Summary',
    description: 'All accounts and their debit/credit balances',
    color: 'text-blue-600',
    bg: 'bg-blue-50',
  },
  {
    to: '/profit-loss',
    icon: BarChart2,
    title: 'How Did We Do?',
    description: 'Income vs expenses, net profit or loss',
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
  },
  {
    to: '/receivables',
    icon: TrendingUp,
    title: 'Who Owes You',
    description: 'Outstanding amounts from customers',
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
  },
  {
    to: '/payables',
    icon: TrendingDown,
    title: 'Who You Owe',
    description: 'Outstanding amounts to suppliers',
    color: 'text-rose-600',
    bg: 'bg-rose-50',
  },
];

export default function Reports() {
  const navigate = useNavigate();

  return (
    <div className="max-w-3xl mx-auto px-4 py-6" data-testid="reports-page">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Reports</h1>
        <p className="text-sm text-slate-500 mt-0.5">Insights into your business</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {REPORT_CARDS.map((r) => (
          <button
            key={r.to}
            onClick={() => navigate(r.to)}
            className="flex items-start gap-4 bg-white rounded-xl border border-slate-200 p-5 text-left hover:border-slate-300 hover:shadow-md transition-all group"
            data-testid={`report-card-${r.to.replace('/', '')}`}
          >
            <div className={`p-2.5 rounded-lg ${r.bg} shrink-0`}>
              <r.icon className={`h-5 w-5 ${r.color}`} />
            </div>
            <div>
              <h3 className="font-semibold text-slate-800 group-hover:text-blue-700">{r.title}</h3>
              <p className="text-xs text-slate-500 mt-0.5">{r.description}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
