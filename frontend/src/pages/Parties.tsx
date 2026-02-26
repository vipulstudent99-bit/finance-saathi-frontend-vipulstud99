import React, { useState, useMemo } from 'react';
import { Plus, Search, Users } from 'lucide-react';
import { PartyCard } from '@/components/parties/PartyCard';
import { PartyForm } from '@/components/parties/PartyForm';
import { EmptyState } from '@/components/ui/EmptyState';
import { TableSkeleton } from '@/components/ui/LoadingSpinner';
import { useParties } from '@/hooks/useParties';
import type { Party, PartyType } from '@/types';

const FILTER_TABS: { label: string; value: '' | PartyType }[] = [
  { label: 'All', value: '' },
  { label: 'Customers', value: 'CUSTOMER' },
  { label: 'Suppliers', value: 'SUPPLIER' },
];

export default function Parties() {
  const [filterType, setFilterType] = useState<'' | PartyType>('');
  const [query, setQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editParty, setEditParty] = useState<Party | null>(null);

  const { parties, loading, error, reload } = useParties();

  const filtered = useMemo(() => {
    return parties.filter((p) => {
      const matchType = !filterType || p.type === filterType || p.type === 'BOTH';
      const matchQuery =
        !query ||
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        (p.phone || '').includes(query) ||
        p.code.toLowerCase().includes(query.toLowerCase());
      return matchType && matchQuery;
    });
  }, [parties, filterType, query]);

  const handleSaved = () => { reload(); setShowForm(false); setEditParty(null); };

  const activeTabLabel = filterType === 'CUSTOMER' ? 'Customer' : filterType === 'SUPPLIER' ? 'Supplier' : 'Party';

  return (
    <div className="max-w-5xl mx-auto px-6 py-8" data-testid="parties-page">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-900">Customers & Suppliers</h1>
            <span className="bg-slate-100 text-slate-600 text-xs font-medium px-2 py-0.5 rounded-full">
              {parties.length} {parties.length === 1 ? 'party' : 'parties'}
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">Manage your business contacts and outstanding balances</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-emerald-700 transition-colors"
          data-testid="add-party-btn"
        >
          <Plus className="h-4 w-4" /> Add {activeTabLabel}
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-fit mt-4 mb-3">
        {FILTER_TABS.map((t) => (
          <button
            key={t.value}
            data-testid={`filter-tab-${t.value || 'all'}`}
            onClick={() => setFilterType(t.value)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
              filterType === t.value
                ? 'bg-white shadow-sm text-slate-900'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative mb-5">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <input
          className="h-11 w-full pl-10 pr-4 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          placeholder="Search by name, phone..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          data-testid="party-search"
        />
      </div>

      {loading && <TableSkeleton rows={5} />}

      {!loading && error && (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 text-rose-700 text-sm">
          {error}. <button className="underline font-medium" onClick={reload}>Try again</button>
        </div>
      )}

      {!loading && !error && filtered.length === 0 && (
        <EmptyState
          icon={<Users className="h-12 w-12" />}
          title={query ? 'No parties found' : 'No parties yet'}
          description={query ? 'Try a different search term' : 'Add your first customer or supplier'}
          actionLabel={query ? undefined : `Add ${activeTabLabel}`}
          onAction={() => setShowForm(true)}
          data-testid="parties-empty-state"
        />
      )}

      {!loading && !error && filtered.length > 0 && (
        <div className="space-y-2">
          {filtered.map((p) => (
            <PartyCard
              key={p.id}
              party={p}
              onEdit={(party) => { setEditParty(party); setShowForm(true); }}
              onDeleted={reload}
            />
          ))}
        </div>
      )}

      {(showForm || editParty) && (
        <PartyForm
          party={editParty}
          onSaved={handleSaved}
          onClose={() => { setShowForm(false); setEditParty(null); }}
        />
      )}
    </div>
  );
}
