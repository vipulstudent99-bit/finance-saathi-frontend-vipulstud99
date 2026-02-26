import React, { useState, useEffect, useRef } from 'react';
import { partyApi } from '@/services/api';
import type { Party, PartyType } from '@/types';
import { Search, X } from 'lucide-react';

interface PartySearchInputProps {
  types: PartyType[];
  value: Party | null;
  onChange: (p: Party | null) => void;
  placeholder?: string;
  label?: string;
}

export function PartySearchInput({ types, value, onChange, placeholder, label }: PartySearchInputProps) {
  const [query, setQuery] = useState('');
  const [parties, setParties] = useState<Party[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadParties = async () => {
      setLoading(true);
      try {
        // Load all parties and filter by type
        const results = await Promise.all(
          types.includes('BOTH')
            ? [partyApi.list()]
            : types.map((t) => partyApi.list(t))
        );
        const all = results.flat();
        const unique = Array.from(new Map(all.map((p) => [p.id, p])).values());
        setParties(unique);
      } catch {}
      finally { setLoading(false); }
    };
    loadParties();
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const filtered = parties.filter(
    (p) =>
      types.some((t) => p.type === t || p.type === 'BOTH' || t === 'BOTH') &&
      (p.name.toLowerCase().includes(query.toLowerCase()) ||
        p.code.toLowerCase().includes(query.toLowerCase()))
  );

  if (value) {
    return (
      <div className="flex flex-col gap-1.5">
        {label && <label className="text-sm font-medium text-slate-700">{label}</label>}
        <div className="flex items-center justify-between h-10 px-3 rounded-lg border border-emerald-300 bg-emerald-50">
          <span className="text-sm font-medium text-emerald-800">{value.name}</span>
          <button
            onClick={() => { onChange(null); setQuery(''); }}
            className="text-emerald-600 hover:text-emerald-800"
            data-testid="party-clear"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1.5 relative" ref={containerRef}>
      {label && <label className="text-sm font-medium text-slate-700">{label}</label>}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <input
          className="h-10 w-full pl-9 pr-3 rounded-lg border border-slate-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder={placeholder || 'Search...'}
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          data-testid="party-search-input"
        />
      </div>
      {open && (
        <div className="absolute top-full mt-1 left-0 right-0 bg-white border border-slate-200 rounded-xl shadow-lg z-50 max-h-48 overflow-y-auto">
          {loading && <p className="text-sm text-slate-400 px-4 py-3">Loading...</p>}
          {!loading && filtered.length === 0 && (
            <p className="text-sm text-slate-400 px-4 py-3">No parties found</p>
          )}
          {filtered.map((p) => (
            <button
              key={p.id}
              data-testid={`party-option-${p.id}`}
              className="w-full text-left px-4 py-2.5 hover:bg-slate-50 text-sm transition-colors"
              onMouseDown={() => { onChange(p); setOpen(false); setQuery(''); }}
            >
              <span className="font-medium text-slate-800">{p.name}</span>
              <span className="ml-2 text-xs text-slate-400">{p.code}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
