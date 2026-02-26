import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Phone, Mail, MapPin } from 'lucide-react';
import { reportsApi, partyApi } from '@/services/api';
import { formatCurrency } from '@/utils/formatCurrency';
import { formatDate, todayAPI, getFirstDayOfMonth } from '@/utils/formatDate';
import { PartyLedgerTimeline } from '@/components/parties/PartyLedgerTimeline';
import { PageLoader } from '@/components/ui/LoadingSpinner';
import { Badge } from '@/components/ui/Badge';
import type { Party, PartyLedger } from '@/types';

export default function PartyDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [party, setParty] = useState<Party | null>(null);
  const [ledger, setLedger] = useState<PartyLedger | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [from, setFrom] = useState(getFirstDayOfMonth());
  const [to, setTo] = useState(todayAPI());

  const loadData = async () => {
    if (!id) return;
    setLoading(true);
    setError('');
    try {
      const [p, l] = await Promise.all([
        partyApi.getById(id),
        reportsApi.getPartyLedger(id, from, to),
      ]);
      setParty(p);
      setLedger(l);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load party details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, [id, from, to]);

  if (loading) return <PageLoader />;

  if (error) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-6">
        <button onClick={() => navigate('/parties')} className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-800 mb-4">
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 text-rose-700">{error}</div>
      </div>
    );
  }

  if (!party || !ledger) return null;

  const { closingBalance, closingBalanceSide } = ledger;
  const isSettled = closingBalance === 0;
  const owes = closingBalanceSide === 'DR';

  return (
    <div className="max-w-3xl mx-auto px-4 py-6" data-testid="party-detail-page">
      {/* Back */}
      <button
        onClick={() => navigate('/parties')}
        className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-800 mb-4"
        data-testid="back-to-parties"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Customers & Suppliers
      </button>

      {/* Party Info */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 mb-4">
        <div className="flex items-start gap-4">
          <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
            <span className="text-blue-600 font-bold text-lg">{party.name.charAt(0).toUpperCase()}</span>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-bold text-slate-800">{party.name}</h1>
              <Badge variant={party.type === 'CUSTOMER' ? 'customer' : party.type === 'SUPPLIER' ? 'supplier' : 'both'}>
                {party.type}
              </Badge>
            </div>
            <div className="flex flex-wrap gap-3 mt-2">
              {party.phone && (
                <div className="flex items-center gap-1 text-xs text-slate-500">
                  <Phone className="h-3 w-3" />{party.phone}
                </div>
              )}
              {party.email && (
                <div className="flex items-center gap-1 text-xs text-slate-500">
                  <Mail className="h-3 w-3" />{party.email}
                </div>
              )}
              {party.address && (
                <div className="flex items-center gap-1 text-xs text-slate-500">
                  <MapPin className="h-3 w-3" />{party.address}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Balance Card */}
        <div
          className={`mt-4 rounded-xl p-4 text-center ${
            isSettled
              ? 'bg-slate-50 border border-slate-200'
              : owes
              ? 'bg-emerald-50 border border-emerald-200'
              : 'bg-rose-50 border border-rose-200'
          }`}
          data-testid="party-balance-card"
        >
          {isSettled ? (
            <p className="font-semibold text-slate-600">All settled ✅</p>
          ) : owes ? (
            <>
              <p className="text-sm text-emerald-600 font-medium">Owes you</p>
              <p className="font-mono font-bold text-emerald-700 text-2xl">{formatCurrency(closingBalance)}</p>
            </>
          ) : (
            <>
              <p className="text-sm text-rose-600 font-medium">You owe</p>
              <p className="font-mono font-bold text-rose-700 text-2xl">{formatCurrency(closingBalance)}</p>
            </>
          )}
        </div>
      </div>

      {/* Date Range Filter */}
      <div className="flex gap-3 items-end mb-4">
        <div className="flex flex-col gap-1 flex-1">
          <label className="text-xs font-medium text-slate-600">From</label>
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="h-9 px-3 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            data-testid="party-from-date"
          />
        </div>
        <div className="flex flex-col gap-1 flex-1">
          <label className="text-xs font-medium text-slate-600">To</label>
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="h-9 px-3 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            data-testid="party-to-date"
          />
        </div>
      </div>

      {/* Transaction Timeline */}
      <PartyLedgerTimeline entries={ledger.transactions} />

      {/* Sticky closing balance */}
      <div className="sticky bottom-20 md:bottom-6 mt-4 bg-white rounded-xl border border-slate-200 shadow-lg p-4 flex justify-between items-center">
        <span className="text-sm font-medium text-slate-600">Closing Balance</span>
        <div className="flex items-center gap-2">
          <span className={`font-mono font-bold text-lg ${owes ? 'text-emerald-600' : isSettled ? 'text-slate-600' : 'text-rose-600'}`}>
            {formatCurrency(closingBalance)}
          </span>
          {!isSettled && (
            <Badge variant={closingBalanceSide === 'DR' ? 'dr' : 'cr'}>{closingBalanceSide}</Badge>
          )}
        </div>
      </div>

      {/* CTA */}
      <button
        onClick={() => navigate('/record')}
        className="mt-3 w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-3 rounded-xl font-medium hover:bg-blue-700 transition-colors"
        data-testid="party-record-transaction-btn"
      >
        <Plus className="h-4 w-4" />
        Record Transaction with {party.name}
      </button>
    </div>
  );
}
