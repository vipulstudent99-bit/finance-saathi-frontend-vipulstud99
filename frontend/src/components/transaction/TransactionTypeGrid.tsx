import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  DollarSign,
  ShoppingCart,
  CheckCircle,
  Send,
  ArrowLeftRight,
  FileText,
  ChevronRight,
} from 'lucide-react';
import { TRANSACTION_TYPES } from '@/utils/transactionHelpers';

const iconMap: Record<string, React.ElementType> = {
  DollarSign,
  ShoppingCart,
  CheckCircle,
  Send,
  ArrowLeftRight,
  FileText,
};

const colorMap: Record<string, { bg: string; icon: string; border: string }> = {
  green: {
    bg: 'hover:bg-emerald-50',
    icon: 'text-emerald-600 bg-emerald-100',
    border: 'hover:border-emerald-200',
  },
  red: {
    bg: 'hover:bg-rose-50',
    icon: 'text-rose-600 bg-rose-100',
    border: 'hover:border-rose-200',
  },
  blue: {
    bg: 'hover:bg-blue-50',
    icon: 'text-blue-600 bg-blue-100',
    border: 'hover:border-blue-200',
  },
  amber: {
    bg: 'hover:bg-amber-50',
    icon: 'text-amber-600 bg-amber-100',
    border: 'hover:border-amber-200',
  },
};

export function TransactionTypeGrid() {
  const navigate = useNavigate();

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4" data-testid="transaction-type-grid">
      {TRANSACTION_TYPES.map((t) => {
        const Icon = iconMap[t.icon];
        const colors = colorMap[t.color];
        return (
          <button
            key={t.key}
            data-testid={`txn-type-${t.key}`}
            onClick={() => navigate(`/record/${t.key}`)}
            className={`flex flex-col items-start gap-3 p-5 rounded-xl border border-slate-200 bg-white text-left transition-all duration-200 group ${colors.bg} ${colors.border} hover:shadow-md`}
          >
            <div className={`p-2.5 rounded-lg ${colors.icon}`}>
              <Icon className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-slate-800 text-sm group-hover:text-slate-900">
                {t.title}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5 leading-snug">{t.description}</p>
            </div>
            <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-slate-500 self-end transition-transform group-hover:translate-x-0.5" />
          </button>
        );
      })}
    </div>
  );
}
