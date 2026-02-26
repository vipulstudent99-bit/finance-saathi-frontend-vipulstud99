import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  Home, Plus, Clock, Users, TrendingUp, TrendingDown,
  BarChart2, BookOpen, ChevronLeft, ChevronRight, List,
} from 'lucide-react';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

const navGroups = [
  {
    label: 'OVERVIEW',
    items: [
      { to: '/', icon: Home, label: 'Dashboard', exact: true },
    ],
  },
  {
    label: 'TRANSACTIONS',
    items: [
      { to: '/record', icon: Plus, label: 'Record Transaction' },
      { to: '/pending', icon: Clock, label: 'Pending Entries' },
    ],
  },
  {
    label: 'PARTIES',
    items: [
      { to: '/parties', icon: Users, label: 'Customers & Suppliers' },
      { to: '/receivables', icon: TrendingUp, label: 'Who Owes You' },
      { to: '/payables', icon: TrendingDown, label: 'Who You Owe' },
    ],
  },
  {
    label: 'REPORTS',
    items: [
      { to: '/trial-balance', icon: BookOpen, label: 'Trial Balance' },
      { to: '/profit-loss', icon: BarChart2, label: 'Profit & Loss' },
    ],
  },
];

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const location = useLocation();

  return (
    <aside
      className={cn(
        'hidden md:flex flex-col fixed top-0 left-0 h-full bg-[#0F172A] text-slate-400 transition-all duration-300 z-40',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Logo */}
      <div className="flex items-center justify-between px-5 py-5 border-b border-slate-800">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-emerald-500 flex items-center justify-center text-white font-bold text-sm">
              ₹
            </div>
            <span className="font-bold text-white text-lg tracking-tight font-display">
              FinanceSaathi
            </span>
          </div>
        )}
        {collapsed && (
          <div className="w-full flex justify-center">
            <div className="h-7 w-7 rounded-lg bg-emerald-500 flex items-center justify-center text-white font-bold text-sm">
              ₹
            </div>
          </div>
        )}
        <button
          onClick={onToggle}
          className="shrink-0 text-slate-500 hover:text-white transition-colors p-1 rounded-lg hover:bg-slate-800"
          data-testid="sidebar-toggle"
        >
          {collapsed
            ? <ChevronRight className="h-4 w-4" />
            : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-3 overflow-y-auto">
        {navGroups.map((group, gi) => (
          <div key={gi}>
            {group.label && !collapsed && (
              <p className="text-[10px] uppercase tracking-widest text-slate-600 font-semibold px-5 pt-4 pb-1">
                {group.label}
              </p>
            )}
            {collapsed && gi > 0 && <div className="my-2 mx-3 border-t border-slate-800" />}
            {group.items.map((item) => {
              const isActive = item.exact
                ? location.pathname === item.to
                : location.pathname.startsWith(item.to);
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  data-testid={`nav-${item.to.replace(/\//g, '') || 'home'}`}
                  title={collapsed ? item.label : undefined}
                  className={cn(
                    'flex items-center gap-3 px-4 py-2.5 mx-2 rounded-lg text-sm transition-all',
                    isActive
                      ? 'bg-emerald-600 text-white font-medium'
                      : 'text-slate-400 hover:bg-slate-800 hover:text-white',
                    collapsed && 'justify-center px-2'
                  )}
                >
                  <item.icon className={cn('shrink-0', collapsed ? 'h-5 w-5' : 'h-4 w-4')} />
                  {!collapsed && item.label}
                </NavLink>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Footer */}
      {!collapsed && (
        <div className="px-5 pb-4 border-t border-slate-800 pt-3">
          <p className="text-slate-700 text-xs">v1.5</p>
        </div>
      )}
    </aside>
  );
}
