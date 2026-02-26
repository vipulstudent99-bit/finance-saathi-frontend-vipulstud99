import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import Home from '@/pages/Home';
import RecordTransaction from '@/pages/RecordTransaction';
import PendingEntries from '@/pages/PendingEntries';
import Parties from '@/pages/Parties';
import PartyDetail from '@/pages/PartyDetail';
import Reports from '@/pages/Reports';
import TrialBalance from '@/pages/TrialBalance';
import ProfitLoss from '@/pages/ProfitLoss';
import Receivables from '@/pages/Receivables';
import Payables from '@/pages/Payables';

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/record/*" element={<RecordTransaction />} />
          <Route path="/pending" element={<PendingEntries />} />
          <Route path="/entries" element={<div className="p-6 text-slate-500 text-center">All Entries — Coming Soon</div>} />
          <Route path="/parties" element={<Parties />} />
          <Route path="/parties/:id" element={<PartyDetail />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/trial-balance" element={<TrialBalance />} />
          <Route path="/profit-loss" element={<ProfitLoss />} />
          <Route path="/receivables" element={<Receivables />} />
          <Route path="/payables" element={<Payables />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
