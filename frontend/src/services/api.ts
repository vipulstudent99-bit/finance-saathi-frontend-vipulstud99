import type {
  CreateVoucherPayload,
  OutstandingParty,
  Party,
  PartyLedger,
  PartyType,
  ProfitLossReport,
  TrialBalanceReport,
  Voucher,
} from '@/types';

const BASE = '/api';

async function req<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    ...options,
  });
  if (!res.ok) {
    let msg = `Request failed (${res.status})`;
    try {
      const err = await res.json();
      msg = err.message || err.detail || err.error || msg;
    } catch {}
    throw new Error(msg);
  }
  // 204 No Content
  if (res.status === 204) return undefined as unknown as T;
  return res.json();
}

export const voucherApi = {
  createDraft: (payload: CreateVoucherPayload) =>
    req<Voucher>('/vouchers/draft', { method: 'POST', body: JSON.stringify(payload) }),
  listDrafts: () => req<Voucher[]>('/vouchers/drafts'),
  updateDraft: (id: string, payload: Partial<CreateVoucherPayload>) =>
    req<Voucher>(`/vouchers/draft/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
  deleteDraft: (id: string) =>
    req<void>(`/vouchers/draft/${id}`, { method: 'DELETE' }),
  postVoucher: (id: string) =>
    req<Voucher>(`/vouchers/${id}/post`, { method: 'POST' }),
};

export const partyApi = {
  create: (payload: Omit<Party, 'id' | 'createdAt' | 'code'>) =>
    req<Party>('/parties', { method: 'POST', body: JSON.stringify(payload) }),
  list: (type?: PartyType) =>
    req<Party[]>(`/parties${type ? `?type=${type}` : ''}`),
  getById: (id: string) => req<Party>(`/parties/${id}`),
  update: (id: string, payload: Partial<Party>) =>
    req<Party>(`/parties/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
  delete: (id: string) => req<void>(`/parties/${id}`, { method: 'DELETE' }),
};

export const reportsApi = {
  getTrialBalance: (from?: string, to?: string) => {
    const p = new URLSearchParams();
    if (from) p.set('from', from);
    if (to) p.set('to', to);
    const qs = p.toString();
    return req<TrialBalanceReport>(`/reports/trial-balance${qs ? `?${qs}` : ''}`);
  },
  getProfitLoss: (from: string, to: string) =>
    req<ProfitLossReport>(`/reports/profit-loss?from=${from}&to=${to}`),
  getPartyLedger: (partyId: string, from?: string, to?: string) => {
    const p = new URLSearchParams({ partyId });
    if (from) p.set('from', from);
    if (to) p.set('to', to);
    return req<PartyLedger>(`/reports/party-ledger?${p}`);
  },
  getReceivables: () => req<OutstandingParty[]>('/reports/receivables'),
  getPayables: () => req<OutstandingParty[]>('/reports/payables'),
};
