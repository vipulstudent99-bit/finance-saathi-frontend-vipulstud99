import type { VoucherType, VoucherSubType } from '@/types';

export const describeVoucher = (v: {
  voucherType: VoucherType;
  subType?: VoucherSubType;
  partyName?: string;
  narration?: string;
}): string => {
  switch (v.subType) {
    case 'CASH_SALE': return 'Cash Sale';
    case 'CREDIT_SALE': return `Sale to ${v.partyName || 'Customer'}`;
    case 'CASH_PURCHASE': return v.narration ? `Cash Purchase — ${v.narration}` : 'Cash Purchase';
    case 'CREDIT_PURCHASE': return `Purchase from ${v.partyName || 'Supplier'}`;
    case 'VENDOR_PAYMENT': return `Paid ${v.partyName || 'Supplier'}`;
    case 'EXPENSE_PAYMENT': return v.narration ? v.narration : 'Expense Payment';
    case 'OWNER_WITHDRAWAL': return 'Owner Withdrawal';
    case 'CASH_TO_BANK': return 'Cash → Bank Transfer';
    case 'BANK_TO_CASH': return 'Bank → Cash Withdrawal';
    case 'MANUAL_JOURNAL': return v.narration ? v.narration : 'Adjustment Entry';
    default:
      switch (v.voucherType) {
        case 'RECEIPT': return `Received from ${v.partyName || 'Customer'}`;
        case 'PAYMENT': return 'Payment Made';
        default: return v.voucherType;
      }
  }
};

export const needsParty = (subType?: VoucherSubType): boolean =>
  ['CREDIT_SALE', 'CREDIT_PURCHASE', 'VENDOR_PAYMENT'].includes(subType || '');

export const isIncomeType = (v: {
  voucherType: VoucherType;
  subType?: VoucherSubType;
}): boolean =>
  v.voucherType === 'SALE' || v.voucherType === 'RECEIPT';

export const TRANSACTION_TYPES = [
  {
    key: 'sale',
    icon: 'DollarSign',
    title: 'I Sold Something',
    description: 'Record a sale to customer or cash sale',
    color: 'green',
    voucherType: 'SALE' as VoucherType,
  },
  {
    key: 'purchase',
    icon: 'ShoppingCart',
    title: 'I Bought Something',
    description: 'Record a purchase from supplier',
    color: 'red',
    voucherType: 'PURCHASE' as VoucherType,
  },
  {
    key: 'receipt',
    icon: 'CheckCircle',
    title: 'Got Money from Customer',
    description: 'Customer paid their outstanding bill',
    color: 'green',
    voucherType: 'RECEIPT' as VoucherType,
  },
  {
    key: 'payment',
    icon: 'Send',
    title: 'Paid a Bill or Expense',
    description: 'Paid supplier, salary, rent, or any expense',
    color: 'red',
    voucherType: 'PAYMENT' as VoucherType,
  },
  {
    key: 'transfer',
    icon: 'ArrowLeftRight',
    title: 'Moved Money',
    description: 'Transferred cash to bank or bank to cash',
    color: 'blue',
    voucherType: 'CONTRA' as VoucherType,
  },
  {
    key: 'adjustment',
    icon: 'FileText',
    title: 'Correction / Adjustment',
    description: 'Fix an error or record a special entry',
    color: 'amber',
    voucherType: 'JOURNAL' as VoucherType,
  },
];
