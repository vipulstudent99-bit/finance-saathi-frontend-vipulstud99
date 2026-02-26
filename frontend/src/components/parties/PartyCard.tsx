import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Phone, ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { formatCurrency } from '@/utils/formatCurrency';
import type { Party } from '@/types';

interface PartyCardProps {
  party: Party;
  onEdit: (p: Party) => void;
  balance?: number;
  balanceSide?: 'DR' | 'CR';
}

export function PartyCard({ party, onEdit, balance, balanceSide }: PartyCardProps) {
  const navigate = useNavigate();

  const balanceColor =
    balanceSide === 'DR'
      ? 'text-emerald-600'
      : balanceSide === 'CR'
      ? 'text-rose-600'
      : 'text-slate-500';

  const balanceLabel =
    balanceSide === 'DR'
      ? `Owes you ${formatCurrency(balance ?? 0)}`
      : balanceSide === 'CR'
      ? `You owe ${formatCurrency(balance ?? 0)}`
      : 'All settled';

  return (
    <div
      className="bg-white rounded-xl border border-slate-200 p-4 hover:border-slate-300 transition-all"
      data-testid={`party-card-${party.id}`}
    >
      <div className="flex items-start gap-3">
        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
          <span className="text-blue-600 font-bold text-sm">{party.name.charAt(0).toUpperCase()}</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold text-slate-800 text-sm">{party.name}</h3>
            <Badge variant={party.type === 'CUSTOMER' ? 'customer' : party.type === 'SUPPLIER' ? 'supplier' : 'both'}>
              {party.type}
            </Badge>
          </div>
          {party.phone && (
            <div className="flex items-center gap-1 mt-0.5">
              <Phone className="h-3 w-3 text-slate-400" />
              <span className="text-xs text-slate-500">{party.phone}</span>
            </div>
          )}
          {balance !== undefined && (
            <p className={`text-sm font-semibold mt-1 ${balanceColor}`}>{balanceLabel}</p>
          )}
        </div>
        <div className="flex gap-2 shrink-0">
          <button
            onClick={() => navigate(`/parties/${party.id}`)}
            className="text-xs font-medium text-blue-600 hover:text-blue-800 px-2 py-1 rounded-lg hover:bg-blue-50 transition-colors flex items-center gap-1"
            data-testid={`view-party-${party.id}`}
          >
            View Account <ChevronRight className="h-3 w-3" />
          </button>
          <button
            onClick={() => onEdit(party)}
            className="text-xs font-medium text-slate-500 hover:text-slate-700 px-2 py-1 rounded-lg hover:bg-slate-100 transition-colors"
            data-testid={`edit-party-${party.id}`}
          >
            Edit
          </button>
        </div>
      </div>
    </div>
  );
}
