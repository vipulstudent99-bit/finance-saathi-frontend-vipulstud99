import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, Plus, Clock, Users, BarChart2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const tabs = [
  { to: '/', icon: Home, label: 'Home', exact: true },
  { to: '/pending', icon: Clock, label: 'Pending' },
  { to: '/record', icon: Plus, label: 'Record', center: true },
  { to: '/parties', icon: Users, label: 'People' },
  { to: '/profit-loss', icon: BarChart2, label: 'Reports' },
];

export function BottomNav() {
  const location = useLocation();

  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white border-t border-slate-200 safe-area-bottom">
      <div className="flex items-center justify-around h-16">
        {tabs.map((tab) => {
          const isActive = tab.exact
            ? location.pathname === tab.to
            : location.pathname.startsWith(tab.to);

          if (tab.center) {
            return (
              <NavLink
                key={tab.to}
                to={tab.to}
                data-testid={`mobile-nav-record`}
                className="flex flex-col items-center justify-center -mt-4"
              >
                <div
                  className={cn(
                    'h-14 w-14 rounded-full flex items-center justify-center shadow-lg transition-all',
                    isActive ? 'bg-blue-700' : 'bg-blue-600 hover:bg-blue-700'
                  )}
                >
                  <Plus className="h-7 w-7 text-white" />
                </div>
                <span className="text-[10px] mt-1 text-slate-500">{tab.label}</span>
              </NavLink>
            );
          }

          return (
            <NavLink
              key={tab.to}
              to={tab.to}
              data-testid={`mobile-nav-${tab.label.toLowerCase()}`}
              className={cn(
                'flex flex-col items-center justify-center gap-1 flex-1 py-2 transition-colors',
                isActive ? 'text-blue-600' : 'text-slate-400'
              )}
            >
              <tab.icon className="h-5 w-5" />
              <span className="text-[10px]">{tab.label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
