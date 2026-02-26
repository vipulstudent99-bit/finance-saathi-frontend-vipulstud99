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
      const matchType =
        !filterType ||
        p.type === filterType ||
        p.type === 'BOTH';
      const matchQuery =
        !query ||
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        p.code.toLowerCase().includes(query.toLowerCase());
      return matchType && matchQuery;
    });
  }, [parties, filterType, query]);

  const handleSaved = (p: Party) => {
    reload();
    setShowForm(false);
    setEditParty(null);
  };

  const activeTabLabel =
    filterType === 'CUSTOMER' ? 'Customer' : filterType === 'SUPPLIER' ? 'Supplier' : 'Party';

  return (
    <div className="max-w-3xl mx-auto px-4 py-6" data-testid="parties-page">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Customers & Suppliers</h1>
          <p className="text-sm text-slate-500 mt-0.5">{parties.length} total parties</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
          data-testid="add-party-btn"
        >
          <Plus className="h-4 w-4" />
          Add {activeTabLabel}
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-xl mb-4 w-fit">
        {FILTER_TABS.map((t) => (
          <button
            key={t.value}
            data-testid={`filter-tab-${t.value || 'all'}`}
            onClick={() => setFilterType(t.value)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
              filterType === t.value
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <input
          className="h-10 w-full pl-9 pr-3 rounded-lg border border-slate-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Search by name or code..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          data-testid="party-search"
        />
      </div>

      {loading && <TableSkeleton rows={5} />}

      {!loading && error && (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 text-rose-700 text-sm">
          {error}. <button className="underline" onClick={reload}>Try again</button>
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
