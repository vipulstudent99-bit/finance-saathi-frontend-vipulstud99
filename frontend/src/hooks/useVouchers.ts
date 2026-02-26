import { useState, useEffect } from 'react';
import { voucherApi } from '@/services/api';
import type { Voucher } from '@/types';

export function useVouchers() {
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await voucherApi.listDrafts();
      setVouchers(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load entries');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return { vouchers, loading, error, reload: load };
}
