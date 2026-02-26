import React from 'react';
import { formatCurrency } from '@/utils/formatCurrency';
import { formatDate } from '@/utils/formatDate';
import { Badge } from '@/components/ui/Badge';
import type { LedgerEntry } from '@/types';

interface PartyLedgerTimelineProps {
  entries: LedgerEntry[];
}

function groupByMonth(entries: LedgerEntry[]): Record<string, LedgerEntry[]> {
  return entries.reduce<Record<string, LedgerEntry[]>>((acc, e) => {
    const d = new Date(e.date);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    if (!acc[key]) acc[key] = [];
    acc[key].push(e);
    return acc;
  }, {});
}

function monthLabel(key: string): string {
  const [y, m] = key.split('-');
  const d = new Date(Number(y), Number(m) - 1, 1);
  return d.toLocaleString('en-IN', { month: 'long', year: 'numeric' }).toUpperCase();
}

export function PartyLedgerTimeline({ entries }: PartyLedgerTimelineProps) {
  if (!entries.length) {
    return (
      <div className="py-10 text-center text-slate-400 text-sm">No transactions in this period</div>
    );
  }

  const grouped = groupByMonth(entries);
  const months = Object.keys(grouped).sort().reverse();

  return (
    <div className="space-y-6" data-testid="ledger-timeline">
      {months.map((month) => (
        <div key={month}>
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
            {monthLabel(month)}
          </h3>
          <div className="space-y-2">
            {grouped[month].map((entry) => {
              const isDebit = entry.debit > 0;
              return (
                <div
                  key={`${entry.voucherId}-${entry.date}`}
                  className="flex items-center gap-3 bg-white rounded-xl border border-slate-100 p-3"
                  data-testid={`ledger-entry-${entry.voucherId}`}
                >
                  <div className="text-xs text-slate-400 w-16 shrink-0">
                    {formatDate(entry.date)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-700 truncate">
                      {entry.narration || (entry.voucherNumber ? `Entry #${entry.voucherNumber}` : 'Transaction')}
                    </p>
                  </div>
                  <div className={`text-sm font-bold font-mono shrink-0 ${isDebit ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {isDebit ? '+' : '-'}{formatCurrency(isDebit ? entry.debit : entry.credit)}
                  </div>
                  <div className="text-xs text-slate-500 shrink-0 text-right w-24">
                    <span className="font-mono">{formatCurrency(entry.balance)}</span>
                    <Badge variant={entry.balanceSide === 'DR' ? 'dr' : 'cr'} className="ml-1">
                      {entry.balanceSide}
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
