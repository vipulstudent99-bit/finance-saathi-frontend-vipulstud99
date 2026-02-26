import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { BottomNav } from './BottomNav';
import { ToastContainer } from '@/components/ui/Toast';
import { useToast } from '@/hooks/useToast';

interface LayoutProps {
  children: React.ReactNode;
}

export const ToastContext = React.createContext<{
  addToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}>({ addToast: () => {} });

export function Layout({ children }: LayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { toasts, addToast, removeToast } = useToast();

  return (
    <ToastContext.Provider value={{ addToast }}>
      <div className="min-h-screen bg-slate-50 flex">
        <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed((p) => !p)} />
        <div
          className={`flex-1 flex flex-col transition-all duration-300 ${
            sidebarCollapsed ? 'md:ml-16' : 'md:ml-64'
          }`}
        >
          <TopBar />
          <main className="flex-1 overflow-auto pb-20 md:pb-6">{children}</main>
        </div>
        <BottomNav />
        <ToastContainer toasts={toasts} onRemove={removeToast} />
      </div>
    </ToastContext.Provider>
  );
}

export const useAppToast = () => React.useContext(ToastContext);
