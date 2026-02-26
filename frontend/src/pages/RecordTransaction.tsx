import React from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { TransactionTypeGrid } from '@/components/transaction/TransactionTypeGrid';
import { SaleForm } from '@/components/transaction/SaleForm';
import { PurchaseForm } from '@/components/transaction/PurchaseForm';
import { ReceiptForm } from '@/components/transaction/ReceiptForm';
import { PaymentForm } from '@/components/transaction/PaymentForm';
import { TransferForm } from '@/components/transaction/TransferForm';
import { AdjustmentForm } from '@/components/transaction/AdjustmentForm';

function FormWrapper({ children, title }: { children: React.ReactNode; title: string }) {
  const navigate = useNavigate();
  return (
    <div>
      <div className="flex items-center gap-2 px-4 pt-4">
        <button
          onClick={() => navigate('/record')}
          className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-800 transition-colors"
          data-testid="back-to-record-types"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>
      </div>
      {children}
    </div>
  );
}

export default function RecordTransaction() {
  const navigate = useNavigate();

  return (
    <div data-testid="record-transaction-page">
      <Routes>
        <Route
          index
          element={
            <div className="max-w-4xl mx-auto px-4 py-6">
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-slate-800">What happened?</h1>
                <p className="text-sm text-slate-500 mt-0.5">Record a business event</p>
              </div>
              <TransactionTypeGrid />
            </div>
          }
        />
        <Route
          path="sale"
          element={
            <FormWrapper title="Record a Sale">
              <SaleForm />
            </FormWrapper>
          }
        />
        <Route
          path="purchase"
          element={
            <FormWrapper title="Record a Purchase">
              <PurchaseForm />
            </FormWrapper>
          }
        />
        <Route
          path="receipt"
          element={
            <FormWrapper title="Record Money Received">
              <ReceiptForm />
            </FormWrapper>
          }
        />
        <Route
          path="payment"
          element={
            <FormWrapper title="Record a Payment">
              <PaymentForm />
            </FormWrapper>
          }
        />
        <Route
          path="transfer"
          element={
            <FormWrapper title="Record a Transfer">
              <TransferForm />
            </FormWrapper>
          }
        />
        <Route
          path="adjustment"
          element={
            <FormWrapper title="Record an Adjustment">
              <AdjustmentForm />
            </FormWrapper>
          }
        />
      </Routes>
    </div>
  );
}
