import React from 'react';
import { formatCurrency } from '@/utils/formatCurrency';
import type { ProfitLossReport } from '@/types';

interface ProfitLossViewProps {
  report: ProfitLossReport;
  period?: string;
}

export function ProfitLossView({ report, period }: ProfitLossViewProps) {
  const isProfit = report.netProfit >= 0;

  return (
    <div className="space-y-6" data-testid="profit-loss-view">
      {period && (
        <p className="text-sm text-slate-500">{period}</p>
      )}

      {/* Revenue */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-5 py-3 bg-emerald-50 border-b border-emerald-100">
          <h3 className="font-semibold text-emerald-800">Revenue / Income</h3>
        </div>
        <div className="divide-y divide-slate-100">
          {report.income.map((item) => (
            <div key={item.accountId} className="flex justify-between px-5 py-3">
              <span className="text-sm text-slate-700">{item.accountName}</span>
              <span className="font-mono text-sm text-slate-800">{formatCurrency(item.amount)}</span>
            </div>
          ))}
          {report.income.length === 0 && (
            <p className="px-5 py-3 text-sm text-slate-400">No income entries</p>
          )}
        </div>
        <div className="flex justify-between px-5 py-3 bg-emerald-50 border-t border-emerald-100">
          <span className="font-bold text-emerald-800">Total Revenue</span>
          <span className="font-mono font-bold text-emerald-700 text-lg">
            {formatCurrency(report.totalIncome)}
          </span>
        </div>
      </div>

      {/* Expenses */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-5 py-3 bg-rose-50 border-b border-rose-100">
          <h3 className="font-semibold text-rose-800">Expenses</h3>
        </div>
        <div className="divide-y divide-slate-100">
          {report.expenses.map((item) => (
            <div key={item.accountId} className="flex justify-between px-5 py-3">
              <span className="text-sm text-slate-700">{item.accountName}</span>
              <span className="font-mono text-sm text-slate-800">{formatCurrency(item.amount)}</span>
            </div>
          ))}
          {report.expenses.length === 0 && (
            <p className="px-5 py-3 text-sm text-slate-400">No expense entries</p>
          )}
        </div>
        <div className="flex justify-between px-5 py-3 bg-rose-50 border-t border-rose-100">
          <span className="font-bold text-rose-800">Total Expenses</span>
          <span className="font-mono font-bold text-rose-700 text-lg">
            {formatCurrency(report.totalExpenses)}
          </span>
        </div>
      </div>

      {/* Net Result */}
      <div
        className={`rounded-2xl p-6 text-center ${
          isProfit
            ? 'bg-gradient-to-br from-emerald-50 to-emerald-100 border border-emerald-200'
            : 'bg-gradient-to-br from-rose-50 to-rose-100 border border-rose-200'
        }`}
        data-testid="pl-net-result"
      >
        <p className={`text-sm font-medium mb-1 ${isProfit ? 'text-emerald-600' : 'text-rose-600'}`}>
          {isProfit ? 'Net Profit' : 'Net Loss'}
        </p>
        <p
          className={`font-mono font-bold text-3xl ${
            isProfit ? 'text-emerald-700' : 'text-rose-700'
          }`}
        >
          {formatCurrency(Math.abs(report.netProfit))}
        </p>
        <p className="text-2xl mt-2">{isProfit ? '📈' : '📉'}</p>
      </div>
    </div>
  );
}
