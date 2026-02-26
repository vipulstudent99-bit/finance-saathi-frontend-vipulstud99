import React, { useState, useEffect } from 'react';
import { reportsApi } from '@/services/api';
import { ProfitLossView } from '@/components/reports/ProfitLossView';
import { PageLoader } from '@/components/ui/LoadingSpinner';
import { Button } from '@/components/ui/Button';
import { getFinancialYearDates, toAPIDate } from '@/utils/formatDate';
import type { ProfitLossReport } from '@/types';

export default function ProfitLoss() {
  const fy = getFinancialYearDates();
  const [from, setFrom] = useState(fy.from);
  const [to, setTo] = useState(fy.to);
  const [report, setReport] = useState<ProfitLossReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await reportsApi.getProfitLoss(from, to);
      setReport(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load report');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const period = `${from} to ${to}`;

  return (
    <div className="max-w-3xl mx-auto px-4 py-6" data-testid="profit-loss-page">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">How Did We Do?</h1>
        <p className="text-sm text-slate-500 mt-0.5">Profit & Loss Statement</p>
      </div>

      {/* Date range */}
      <div className="flex gap-3 items-end mb-6 flex-wrap">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-600">From</label>
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="h-9 px-3 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            data-testid="pl-from-date"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-600">To</label>
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="h-9 px-3 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            data-testid="pl-to-date"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => { const d = getFinancialYearDates(); setFrom(d.from); setTo(d.to); }}
            data-testid="pl-fy-btn"
          >
            This Financial Year
          </Button>
          <Button variant="primary" loading={loading} onClick={load} data-testid="pl-load-btn">
            Load
          </Button>
        </div>
      </div>

      {loading && <PageLoader />}

      {!loading && error && (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 text-rose-700 text-sm">
          {error}
        </div>
      )}

      {!loading && !error && report && <ProfitLossView report={report} period={period} />}
    </div>
  );
}
