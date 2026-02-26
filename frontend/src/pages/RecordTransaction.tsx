import React from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { ArrowLeft, ShoppingCart, FileText, Package, Receipt, Wallet, ArrowDownCircle, ArrowUpCircle, User, ChevronRight } from 'lucide-react';
import { SaleForm } from '@/components/transaction/SaleForm';
import { PurchaseForm } from '@/components/transaction/PurchaseForm';
import { ReceiptForm } from '@/components/transaction/ReceiptForm';
import { PaymentForm } from '@/components/transaction/PaymentForm';
import { TransferForm } from '@/components/transaction/TransferForm';
import { AdjustmentForm } from '@/components/transaction/AdjustmentForm';

const MONEY_IN = [
  { key: 'sale?m=CASH',   Icon: ShoppingCart, title: 'Cash Sale',         desc: 'Customer paid cash on the spot',    bg: 'bg-emerald-100', color: 'text-emerald-600' },
  { key: 'sale?m=CREDIT', Icon: FileText,     title: 'Credit Sale',       desc: 'Customer will pay later',           bg: 'bg-emerald-100', color: 'text-emerald-600' },
  { key: 'receipt',       Icon: ArrowDownCircle, title: 'Received Payment', desc: 'Customer cleared their dues',      bg: 'bg-blue-100',    color: 'text-blue-600' },
];

const MONEY_OUT = [
  { key: 'purchase?m=CASH',   Icon: Package,         title: 'Cash Purchase',   desc: 'Paid cash for goods/materials',        bg: 'bg-rose-100',   color: 'text-rose-600' },
  { key: 'purchase?m=CREDIT', Icon: Receipt,         title: 'Supplier Bill',   desc: 'Bill from supplier, pay later',        bg: 'bg-rose-100',   color: 'text-rose-600' },
  { key: 'payment?t=EXPENSE', Icon: Wallet,          title: 'Expense Payment', desc: 'Salary, rent, freight or other',       bg: 'bg-amber-100',  color: 'text-amber-600' },
  { key: 'payment?t=VENDOR',  Icon: ArrowUpCircle,   title: 'Paid a Bill',     desc: 'Paid outstanding to supplier',         bg: 'bg-orange-100', color: 'text-orange-600' },
  { key: 'payment?t=WITHDRAWAL', Icon: User,         title: 'Owner Withdrawal', desc: 'Personal withdrawal from business',   bg: 'bg-purple-100', color: 'text-purple-600' },
];

function TxnCard({ item, onClick }: { item: (typeof MONEY_IN)[0]; onClick: () => void }) {
  return (
    <button
      data-testid={`txn-type-${item.key.split('?')[0]}`}
      onClick={onClick}
      className="flex items-center gap-4 bg-white rounded-2xl border border-slate-200 p-5 text-left hover:border-emerald-400 hover:shadow-md hover:bg-emerald-50/30 hover:-translate-y-0.5 transition-all group cursor-pointer w-full"
    >
      <div className={`h-12 w-12 rounded-2xl ${item.bg} flex items-center justify-center shrink-0`}>
        <item.Icon className={`h-6 w-6 ${item.color}`} />
      </div>
      <div className="flex-1">
        <p className="font-semibold text-slate-800 text-sm">{item.title}</p>
        <p className="text-xs text-slate-500 mt-0.5">{item.desc}</p>
      </div>
      <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-slate-500 shrink-0" />
    </button>
  );
}

function TransactionHub() {
  const navigate = useNavigate();
  return (
    <div className="max-w-5xl mx-auto px-6 py-8" data-testid="transaction-type-grid">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Record Transaction</h1>
        <p className="text-sm text-slate-500 mt-1">Choose a transaction type to record</p>
      </div>

      <div className="mb-6">
        <p className="text-xs uppercase tracking-widest text-slate-500 font-semibold mb-3">Sales & Receipts — Money Coming In</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {MONEY_IN.map(item => (
            <TxnCard key={item.key} item={item} onClick={() => navigate(`/record/${item.key}`)} />
          ))}
        </div>
      </div>

      <div>
        <p className="text-xs uppercase tracking-widest text-slate-500 font-semibold mb-3">Purchases & Payments — Money Going Out</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {MONEY_OUT.map(item => (
            <TxnCard key={item.key} item={item} onClick={() => navigate(`/record/${item.key}`)} />
          ))}
        </div>
      </div>
    </div>
  );
}

function FormWrapper({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  return (
    <div>
      <div className="max-w-xl mx-auto px-4 pt-6">
        <button
          onClick={() => navigate('/record')}
          className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-800 transition-colors mb-4"
          data-testid="back-to-record-types"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
      </div>
      {children}
    </div>
  );
}

export default function RecordTransaction() {
  return (
    <div data-testid="record-transaction-page">
      <Routes>
        <Route index element={<TransactionHub />} />
        <Route path="sale" element={<FormWrapper><SaleForm /></FormWrapper>} />
        <Route path="purchase" element={<FormWrapper><PurchaseForm /></FormWrapper>} />
        <Route path="receipt" element={<FormWrapper><ReceiptForm /></FormWrapper>} />
        <Route path="payment" element={<FormWrapper><PaymentForm /></FormWrapper>} />
        <Route path="transfer" element={<FormWrapper><TransferForm /></FormWrapper>} />
        <Route path="adjustment" element={<FormWrapper><AdjustmentForm /></FormWrapper>} />
      </Routes>
    </div>
  );
}
