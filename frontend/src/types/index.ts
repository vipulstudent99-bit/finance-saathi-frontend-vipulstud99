export type VoucherType = 'SALE' | 'PURCHASE' | 'RECEIPT' | 'PAYMENT' | 'CONTRA' | 'JOURNAL';
export type VoucherSubType =
  | 'CASH_SALE'
  | 'CREDIT_SALE'
  | 'CASH_PURCHASE'
  | 'CREDIT_PURCHASE'
  | 'VENDOR_PAYMENT'
  | 'EXPENSE_PAYMENT'
  | 'OWNER_WITHDRAWAL'
  | 'CASH_TO_BANK'
  | 'BANK_TO_CASH'
  | 'MANUAL_JOURNAL'
  | 'RECEIPT';
export type PaymentCategory = 'SALARY' | 'RENT' | 'FREIGHT' | 'UTILITY' | 'OTHER';
export type VoucherStatus = 'DRAFT' | 'POSTED' | 'CANCELLED';
export type PartyType = 'CUSTOMER' | 'SUPPLIER' | 'BOTH';
export type BalanceSide = 'DR' | 'CR';
export type PaymentMode = 'CASH' | 'BANK';

export interface Party {
  id: string;
  code: string;
  name: string;
  type: PartyType;
  phone?: string;
  email?: string;
  address?: string;
  openingBalance: number;
  openingBalanceSide: BalanceSide;
  createdAt: string;
}

export interface Voucher {
  voucherId: string;
  voucherType: VoucherType;
  subType: VoucherSubType | null;
  voucherDate: string;
  totalAmount: number;
  status: VoucherStatus;
  narration?: string | null;
  partyId?: string | null;
  partyName?: string | null;
  voucherNumber?: number | null;
  createdAt: string;
}

export interface CreateVoucherPayload {
  voucherType: VoucherType;
  subType: VoucherSubType;
  totalAmount: number;
  paymentMode: PaymentMode;
  voucherDate: string;
  narration?: string;
  partyId?: string;
  paymentCategory?: PaymentCategory;
}

export interface TrialBalanceRow {
  accountId?: string;
  accountCode?: string;
  accountName: string;
  accountType?: string;
  debit: number;
  credit: number;
  balance?: number;
  balanceSide?: BalanceSide;
}

export interface TrialBalanceReport {
  rows: TrialBalanceRow[];
  totalDebit: number;
  totalCredit: number;
  isBalanced: boolean;
}

// P&L line item (one account row)
export interface ProfitLossLineItem {
  accountId: string;
  accountCode: string;
  accountName: string;
  amount: number;
}

// Full P&L response shape from backend
export interface ProfitLossReport {
  income: ProfitLossLineItem[];       // array of income account rows
  expenses: ProfitLossLineItem[];     // array of expense account rows
  totalIncome: number;                // ← was incorrectly typed as `income: number`
  totalExpenses: number;              // ← was incorrectly typed as `expenses: number`
  netProfit: number;
}

export interface LedgerEntry {
  date: string;
  voucherId: string;
  voucherNumber?: number;
  narration?: string;
  debit: number;
  credit: number;
  balance: number;
  balanceSide: BalanceSide;
}

export interface PartyLedger {
  party: Party;
  openingBalance: number;
  openingBalanceSide: BalanceSide;
  transactions: LedgerEntry[];
  closingBalance: number;
  closingBalanceSide: BalanceSide;
}

export interface OutstandingParty {
  partyId: string;
  code: string;
  name: string;
  balance: number;
  balanceSide: BalanceSide;
}
