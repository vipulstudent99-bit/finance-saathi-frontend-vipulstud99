import React, { useState } from 'react';
import { reportsApi } from '@/services/api';
import { TrialBalanceTable } from '@/components/reports/TrialBalanceTable';
import { PageLoader } from '@/components/ui/LoadingSpinner';
import { Button } from '@/components/ui/Button';
import type { TrialBalanceReport } from '@/types';

export default function TrialBalance() {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [report, setReport] = useState<TrialBalanceReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [loaded, setLoaded] = useState(false);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await reportsApi.getTrialBalance(from || undefined, to || undefined);
      setReport(data);
      setLoaded(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load trial balance');
    } finally {
      setLoading(false);
    }
  };

  // Auto-load on mount
  React.useEffect(() => { load(); }, []);

  return (
    <div className="max-w-5xl mx-auto px-4 py-6" data-testid="trial-balance-page">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Account Summary</h1>
        <p className="text-sm text-slate-500 mt-0.5">All accounts and their balances</p>
      </div>

      {/* Date range filter */}
      <div className="flex gap-3 items-end mb-6 flex-wrap">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-600">From (optional)</label>
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="h-9 px-3 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            data-testid="tb-from-date"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-600">To (optional)</label>
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="h-9 px-3 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            data-testid="tb-to-date"
          />
        </div>
        <Button variant="primary" loading={loading} onClick={load} data-testid="tb-load-btn">
          Load
        </Button>
      </div>

      {loading && <PageLoader />}

      {!loading && error && (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 text-rose-700 text-sm">
          {error}
        </div>
      )}

      {!loading && !error && report && <TrialBalanceTable report={report} />}
    </div>
  );
}
