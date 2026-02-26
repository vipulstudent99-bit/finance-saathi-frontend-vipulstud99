import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  Home,
  Plus,
  Clock,
  Users,
  TrendingUp,
  TrendingDown,
  BarChart2,
  List,
  ChevronLeft,
  ChevronRight,
  BookOpen,
} from 'lucide-react';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

const navGroups = [
  {
    items: [
      { to: '/', icon: Home, label: 'Home', exact: true },
      { to: '/record', icon: Plus, label: 'Record Transaction' },
    ],
  },
  {
    label: 'TRANSACTIONS',
    items: [
      { to: '/pending', icon: Clock, label: 'Pending Entries' },
      { to: '/entries', icon: List, label: 'All Entries' },
    ],
  },
  {
    label: 'PEOPLE',
    items: [
      { to: '/parties', icon: Users, label: 'Customers & Suppliers' },
      { to: '/receivables', icon: TrendingUp, label: 'Who Owes You' },
      { to: '/payables', icon: TrendingDown, label: 'Who You Owe' },
    ],
  },
  {
    label: 'REPORTS',
    items: [
      { to: '/trial-balance', icon: BookOpen, label: 'Account Summary' },
      { to: '/profit-loss', icon: BarChart2, label: 'How Did We Do?' },
    ],
  },
];

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const location = useLocation();

  return (
    <aside
      className={cn(
        'hidden md:flex flex-col fixed top-0 left-0 h-full bg-slate-900 text-slate-100 transition-all duration-300 z-40',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Logo */}
      <div className="flex items-center justify-between px-4 py-5 border-b border-slate-800">
        {!collapsed && (
          <div>
            <div className="font-bold text-white text-lg tracking-tight font-display">
              FinanceSaathi
            </div>
            <div className="text-xs text-slate-400">Your business, organized</div>
          </div>
        )}
        {collapsed && (
          <div className="w-full flex justify-center">
            <span className="text-blue-400 font-bold text-xl">FS</span>
          </div>
        )}
        <button
          onClick={onToggle}
          className="shrink-0 text-slate-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-slate-800"
          data-testid="sidebar-toggle"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 overflow-y-auto">
        {navGroups.map((group, gi) => (
          <div key={gi} className="mb-4">
            {group.label && !collapsed && (
              <p className="px-4 mb-1 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                {group.label}
              </p>
            )}
            {group.items.map((item) => {
              const isActive = item.exact
                ? location.pathname === item.to
                : location.pathname.startsWith(item.to);
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  data-testid={`nav-${item.to.replace(/\//g, '') || 'home'}`}
                  className={cn(
                    'flex items-center gap-3 px-4 py-2.5 mx-2 rounded-lg text-sm font-medium transition-all',
                    isActive
                      ? 'bg-slate-800 text-white'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800',
                    collapsed && 'justify-center px-2'
                  )}
                  title={collapsed ? item.label : undefined}
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
        <div className="p-4 border-t border-slate-800">
          <p className="text-xs text-slate-500">FinanceSaathi v1.0</p>
        </div>
      )}
    </aside>
  );
}
