import React from 'react';
import { Badge } from '@/components/ui/Badge';
import { formatCurrency } from '@/utils/formatCurrency';
import type { TrialBalanceReport } from '@/types';

interface TrialBalanceTableProps {
  report: TrialBalanceReport;
}

export function TrialBalanceTable({ report }: TrialBalanceTableProps) {
  return (
    <div data-testid="trial-balance-table">
      {/* Balanced status */}
      <div
        className={`mb-4 flex items-center gap-3 rounded-xl p-4 ${
          report.isBalanced
            ? 'bg-emerald-50 border border-emerald-200'
            : 'bg-rose-50 border border-rose-200'
        }`}
      >
        <span className={`text-lg ${report.isBalanced ? 'text-emerald-600' : 'text-rose-600'}`}>
          {report.isBalanced ? '✅' : '❌'}
        </span>
        <div>
          {report.isBalanced ? (
            <p className="font-semibold text-emerald-700">Books are balanced</p>
          ) : (
            <>
              <p className="font-semibold text-rose-700">Books are NOT balanced</p>
              <p className="text-sm text-rose-600">
                Difference: {formatCurrency(Math.abs(report.totalDebit - report.totalCredit))}
              </p>
            </>
          )}
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="text-left px-4 py-3 font-semibold text-slate-600">Account</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-600 hidden sm:table-cell">Type</th>
              <th className="text-right px-4 py-3 font-semibold text-slate-600">Debit</th>
              <th className="text-right px-4 py-3 font-semibold text-slate-600">Credit</th>
              <th className="text-right px-4 py-3 font-semibold text-slate-600">Balance</th>
            </tr>
          </thead>
          <tbody>
            {report.rows.map((row) => (
              <tr
                key={row.accountId}
                className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
                data-testid={`tb-row-${row.accountId}`}
              >
                <td className="px-4 py-3">
                  <div>
                    <p className="font-medium text-slate-800">{row.accountName}</p>
                    <p className="text-xs text-slate-400">{row.accountCode}</p>
                  </div>
                </td>
                <td className="px-4 py-3 hidden sm:table-cell">
                  <span className="text-xs text-slate-500">{row.accountType}</span>
                </td>
                <td className="px-4 py-3 text-right font-mono text-slate-700">
                  {row.debit > 0 ? formatCurrency(row.debit) : '—'}
                </td>
                <td className="px-4 py-3 text-right font-mono text-slate-700">
                  {row.credit > 0 ? formatCurrency(row.credit) : '—'}
                </td>
                <td className="px-4 py-3 text-right">
                  <span className="font-mono font-semibold text-slate-800">
                    {formatCurrency(row.balance)}
                  </span>
                  <Badge variant={row.balanceSide === 'DR' ? 'dr' : 'cr'} className="ml-1.5">
                    {row.balanceSide}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-slate-50 font-bold border-t-2 border-slate-200">
              <td className="px-4 py-3 text-slate-800" colSpan={2}>Totals</td>
              <td className="px-4 py-3 text-right font-mono text-slate-800">
                {formatCurrency(report.totalDebit)}
              </td>
              <td className="px-4 py-3 text-right font-mono text-slate-800">
                {formatCurrency(report.totalCredit)}
              </td>
              <td className="px-4 py-3" />
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
