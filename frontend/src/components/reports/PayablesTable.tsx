import React from 'react';
import { useNavigate } from 'react-router-dom';
import { formatCurrency } from '@/utils/formatCurrency';
import type { OutstandingParty } from '@/types';

interface PayablesTableProps {
  data: OutstandingParty[];
}

export function PayablesTable({ data }: PayablesTableProps) {
  const navigate = useNavigate();
  const total = data.reduce((s, p) => s + p.balance, 0);

  return (
    <div data-testid="payables-table">
      {/* Total banner */}
      <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 mb-4 flex items-center justify-between">
        <span className="text-sm font-medium text-rose-800">Total payable</span>
        <span className="font-mono font-bold text-rose-700 text-xl">
          {formatCurrency(total)}
        </span>
      </div>

      <div className="space-y-2">
        {data.map((p) => (
          <div
            key={p.partyId}
            className="flex items-center justify-between bg-white rounded-xl border border-slate-200 px-4 py-3 hover:border-slate-300 transition-all"
            data-testid={`payable-row-${p.partyId}`}
          >
            <div>
              <p className="font-semibold text-slate-800 text-sm">{p.name}</p>
              <p className="text-xs text-slate-400">{p.code}</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-mono font-bold text-rose-600">
                {formatCurrency(p.balance)}
              </span>
              <button
                onClick={() => navigate(`/parties/${p.partyId}`)}
                className="text-xs font-medium text-blue-600 hover:text-blue-800 px-2 py-1 rounded-lg hover:bg-blue-50 transition-colors"
                data-testid={`view-payable-${p.partyId}`}
              >
                View Account
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
