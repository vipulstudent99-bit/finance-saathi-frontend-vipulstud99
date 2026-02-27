import type { VoucherType, VoucherSubType } from '@/types';

// Human-readable labels for every subType
const SUB_TYPE_LABELS: Record<VoucherSubType, string> = {
  CASH_SALE:        'Cash Sale',
  CREDIT_SALE:      'Credit Sale',
  CASH_PURCHASE:    'Cash Purchase',
  CREDIT_PURCHASE:  'Credit Purchase',
  VENDOR_PAYMENT:   'Vendor Payment',
  EXPENSE_PAYMENT:  'Expense',
  OWNER_WITHDRAWAL: 'Owner Withdrawal',
  CASH_TO_BANK:     'Cash → Bank',
  BANK_TO_CASH:     'Bank → Cash',
  MANUAL_JOURNAL:   'Adjustment',
  RECEIPT:          'Receipt',
};

// Fallback labels when subType is null
const VOUCHER_TYPE_LABELS: Record<VoucherType, string> = {
  SALE:     'Sale',
  PURCHASE: 'Purchase',
  RECEIPT:  'Receipt',
  PAYMENT:  'Payment',
  CONTRA:   'Transfer',
  JOURNAL:  'Adjustment',
};

export const getSubTypeLabel = (
  subType: VoucherSubType | null | undefined,
  voucherType: VoucherType
): string => {
  if (subType && SUB_TYPE_LABELS[subType]) return SUB_TYPE_LABELS[subType];
  return VOUCHER_TYPE_LABELS[voucherType] ?? voucherType;
};

export const describeVoucher = (v: {
  voucherType: VoucherType;
  subType?: VoucherSubType | null;
  partyName?: string | null;
  narration?: string | null;
}): string => {
  switch (v.subType) {
    case 'CASH_SALE':        return 'Cash Sale';
    case 'CREDIT_SALE':      return `Sale to ${v.partyName || 'Customer'}`;
    case 'CASH_PURCHASE':    return v.narration ? `Cash Purchase — ${v.narration}` : 'Cash Purchase';
    case 'CREDIT_PURCHASE':  return `Purchase from ${v.partyName || 'Supplier'}`;
    case 'VENDOR_PAYMENT':   return `Paid ${v.partyName || 'Supplier'}`;
    case 'EXPENSE_PAYMENT':  return v.narration ? v.narration : 'Expense Payment';
    case 'OWNER_WITHDRAWAL': return 'Owner Withdrawal';
    case 'CASH_TO_BANK':     return 'Cash → Bank Transfer';
    case 'BANK_TO_CASH':     return 'Bank → Cash Withdrawal';
    case 'MANUAL_JOURNAL':   return v.narration ? v.narration : 'Adjustment Entry';
    default:
      switch (v.voucherType) {
        case 'RECEIPT': return `Received from ${v.partyName || 'Customer'}`;
        case 'PAYMENT': return 'Payment Made';
        default: return VOUCHER_TYPE_LABELS[v.voucherType] ?? v.voucherType;
      }
  }
};

export const needsParty = (subType?: VoucherSubType | null): boolean =>
  ['CREDIT_SALE', 'CREDIT_PURCHASE', 'VENDOR_PAYMENT'].includes(subType || '');

export const isIncomeType = (v: {
  voucherType: VoucherType;
  subType?: VoucherSubType | null;
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
