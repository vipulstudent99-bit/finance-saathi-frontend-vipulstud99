import React, { useState, useEffect } from 'react';
import { reportsApi } from '@/services/api';
import { ReceivablesTable } from '@/components/reports/ReceivablesTable';
import { EmptyState } from '@/components/ui/EmptyState';
import { PageLoader } from '@/components/ui/LoadingSpinner';
import { useNavigate } from 'react-router-dom';
import { TrendingUp } from 'lucide-react';
import type { OutstandingParty } from '@/types';

export default function Receivables() {
  const navigate = useNavigate();
  const [data, setData] = useState<OutstandingParty[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    reportsApi.getReceivables()
      .then(setData)
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <PageLoader />;

  return (
    <div className="max-w-3xl mx-auto px-4 py-6" data-testid="receivables-page">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Who Owes You</h1>
        <p className="text-sm text-slate-500 mt-0.5">Outstanding amounts from customers</p>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 text-rose-700 text-sm mb-4">
          {error}
        </div>
      )}

      {!error && data.length === 0 ? (
        <EmptyState
          icon={<TrendingUp className="h-12 w-12" />}
          title="No outstanding receivables"
          description="All customers are clear. Record a credit sale to get started."
          actionLabel="Record a Sale"
          onAction={() => navigate('/record/sale')}
          data-testid="receivables-empty-state"
        />
      ) : (
        <ReceivablesTable data={data} />
      )}
    </div>
  );
}
