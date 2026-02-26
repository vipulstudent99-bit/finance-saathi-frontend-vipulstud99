import React from 'react';
import { useLocation } from 'react-router-dom';
import { Search } from 'lucide-react';

const pageTitles: Record<string, string> = {
  '/': 'Dashboard',
  '/record': 'Record Transaction',
  '/pending': 'Pending Entries',
  '/entries': 'All Entries',
  '/parties': 'Customers & Suppliers',
  '/receivables': 'Who Owes You',
  '/payables': 'Who You Owe',
  '/trial-balance': 'Account Summary',
  '/profit-loss': 'How Did We Do?',
};

export function TopBar() {
  const location = useLocation();
  const title =
    Object.entries(pageTitles).find(([path]) =>
      path === '/' ? location.pathname === '/' : location.pathname.startsWith(path)
    )?.[1] || 'FinanceSaathi';

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200 px-4 md:px-6 h-14 flex items-center justify-between">
      <h1 className="font-semibold text-slate-800 text-base">{title}</h1>
      <div className="flex items-center gap-2">
        <button
          className="flex items-center gap-2 text-slate-400 hover:text-slate-600 transition-colors px-3 py-1.5 rounded-lg hover:bg-slate-100 text-sm"
          data-testid="topbar-search"
        >
          <Search className="h-4 w-4" />
          <span className="hidden sm:inline">Search</span>
        </button>
      </div>
    </header>
  );
}
