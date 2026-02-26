import { useState, useEffect } from 'react';
import { partyApi } from '@/services/api';
import type { Party, PartyType } from '@/types';

export function useParties(type?: PartyType) {
  const [parties, setParties] = useState<Party[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await partyApi.list(type);
      setParties(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load parties');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [type]);

  return { parties, loading, error, reload: load };
}
