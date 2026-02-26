# FinanceSaathi — PRD

## Problem Statement
Build the complete frontend for FinanceSaathi — an internal finance system for manufacturing/wholesale businesses. Target users are business owners and staff (non-accountants). The UI must allow recording a transaction in under 30 seconds.

## Architecture
- **Frontend**: React 18 + Vite 7 + TypeScript + Tailwind CSS
- **Backend (external)**: Express/Node.js at localhost:3001 (not built by this project)
- **Vite Proxy**: `/api` → `http://localhost:3001`
- **No auth** (future phase)

## What Has Been Implemented (Feb 26, 2026)

### Setup
- Converted from CRA to Vite + TypeScript fresh setup
- vite.config.ts with proxy, allowedHosts:true, resolve aliases
- tsconfig.json with path aliases (@/*)
- index.html with font imports (Manrope, Inter, JetBrains Mono)

### Design System
- Dark sidebar (slate-900), light main content (slate-50)
- Green (#10B981) for incoming/positive, Red (#E11D48) for outgoing/negative
- Amber for pending/draft, Blue (#2563EB) for primary actions
- JetBrains Mono for financial numbers
- Indian currency formatting (₹1,00,000.00) via en-IN locale

### Pages Built
1. **Home/Dashboard** (`/`) - Greeting, summary strip (Cash/Bank/Sales/Spend), profit status card, receivables+payables quick view, recent activity, quick record shortcuts
2. **Record Transaction** (`/record`) - 6 large cards grid → navigates to form
3. **Sale Form** (`/record/sale`) - Customer credit vs cash toggle, party search, amount, date, payment mode
4. **Purchase Form** (`/record/purchase`) - Supplier credit vs cash, narration, amount
5. **Receipt Form** (`/record/receipt`) - Customer search with current owed balance, amount, payment mode
6. **Payment Form** (`/record/payment`) - 6 payment categories, supplier search, amount
7. **Transfer Form** (`/record/transfer`) - Cash↔Bank direction toggle
8. **Adjustment Form** (`/record/adjustment`) - Reason + amount for journal entries
9. **Pending Entries** (`/pending`) - DRAFT vouchers with inline confirm/edit/delete
10. **Customers & Suppliers** (`/parties`) - Filter tabs, live search, add/edit party form
11. **Party Detail** (`/parties/:id`) - Balance card, date range filter, transaction timeline
12. **Receivables** (`/receivables`) - Outstanding customers list with totals
13. **Payables** (`/payables`) - Outstanding suppliers list with totals
14. **Trial Balance** (`/trial-balance`) - Account summary table with balanced status
15. **Profit & Loss** (`/profit-loss`) - Income/expense breakdown, net result card
16. **Reports Hub** (`/reports`) - Landing page for all reports

### Components Built
- Layout: Sidebar (dark, collapsible), TopBar, BottomNav (mobile 5-tab)
- UI: Button, Input, Select, Badge, Card, Toast, LoadingSpinner/Skeleton, EmptyState, InlineConfirm
- Transaction: TransactionTypeGrid, SaleForm, PurchaseForm, ReceiptForm, PaymentForm, TransferForm, AdjustmentForm, PendingEntryRow, PartySearchInput
- Parties: PartyCard, PartyForm, PartyLedgerTimeline
- Reports: TrialBalanceTable, ProfitLossView, ReceivablesTable, PayablesTable

### Services & Utilities
- `src/services/api.ts` - Centralized API client for all endpoints
- `src/utils/formatCurrency.ts` - Indian number formatting
- `src/utils/formatDate.ts` - DD/MM/YYYY formatting, financial year calculation
- `src/utils/transactionHelpers.ts` - describeVoucher(), TRANSACTION_TYPES constants
- `src/hooks/useToast.ts`, `useParties.ts`, `useVouchers.ts`

## Core Requirements
- No backend code (Express, Prisma, Node.js)
- No auth
- No accounting calculations in frontend
- All API calls via /api proxy to localhost:3001
- Error states shown when API fails (no mock data)
- Inline confirmations (no modals) for destructive actions
- Indian number formatting ₹1,00,000.00
- After save: stay on same page, show success state

## P0 — Complete ✅
All pages and forms as specified

## P1 — Next Actions
- [ ] Add "All Entries" page (posted vouchers list) — placeholder exists
- [ ] Sale form: improve validation error visibility (currently works but may need better styling)
- [ ] Party ledger: add "last transaction date" in party detail
- [ ] Edit pending entry: wire up edit modal/form for updating draft vouchers
- [ ] Date picker: consider custom date picker component for better UX

## P2 — Future
- [ ] Authentication (JWT or Google OAuth)
- [ ] Export reports to PDF/Excel
- [ ] Multi-business support
- [ ] SMS notifications for overdue receivables
