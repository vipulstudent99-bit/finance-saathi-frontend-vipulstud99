import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { partyApi } from '@/services/api';
import type { Party, PartyType, BalanceSide } from '@/types';

interface PartyFormProps {
  party?: Party | null;
  onSaved: (p: Party) => void;
  onClose: () => void;
}

const partyTypeOptions = [
  { value: 'CUSTOMER', label: 'Customer' },
  { value: 'SUPPLIER', label: 'Supplier' },
  { value: 'BOTH', label: 'Both (Customer & Supplier)' },
];

const balanceSideOptions = [
  { value: 'DR', label: 'DR (They owe you)' },
  { value: 'CR', label: 'CR (You owe them)' },
];

export function PartyForm({ party, onSaved, onClose }: PartyFormProps) {
  const [name, setName] = useState(party?.name || '');
  const [type, setType] = useState<PartyType>(party?.type || 'CUSTOMER');
  const [phone, setPhone] = useState(party?.phone || '');
  const [email, setEmail] = useState(party?.email || '');
  const [address, setAddress] = useState(party?.address || '');
  const [openingBalance, setOpeningBalance] = useState(String(party?.openingBalance || '0'));
  const [openingBalanceSide, setOpeningBalanceSide] = useState<BalanceSide>(
    party?.openingBalanceSide || 'DR'
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!name.trim()) { setError('Name is required'); return; }
    setError('');
    setLoading(true);
    try {
      const payload = {
        name: name.trim(),
        type,
        phone: phone || undefined,
        email: email || undefined,
        address: address || undefined,
        openingBalance: Number(openingBalance) || 0,
        openingBalanceSide,
      };
      let saved: Party;
      if (party) {
        saved = await partyApi.update(party.id, payload);
      } else {
        saved = await partyApi.create(payload as any);
      }
      onSaved(saved);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <h2 className="font-bold text-slate-800">{party ? 'Edit Party' : 'Add New Party'}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-5 space-y-4">
          <Input
            label="Name *"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
            data-testid="party-form-name"
          />
          <Select
            label="Type"
            options={partyTypeOptions}
            value={type}
            onChange={(e) => setType(e.target.value as PartyType)}
            data-testid="party-form-type"
          />
          <Input
            label="Phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            data-testid="party-form-phone"
          />
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            data-testid="party-form-email"
          />
          <Input
            label="Address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            data-testid="party-form-address"
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Opening Balance"
              prefix="₹"
              type="number"
              min="0"
              step="0.01"
              value={openingBalance}
              onChange={(e) => setOpeningBalance(e.target.value)}
              data-testid="party-form-opening-balance"
            />
            <Select
              label="Balance Side"
              options={balanceSideOptions}
              value={openingBalanceSide}
              onChange={(e) => setOpeningBalanceSide(e.target.value as BalanceSide)}
              data-testid="party-form-balance-side"
            />
          </div>
          {error && <p className="text-sm text-rose-600 bg-rose-50 px-4 py-2 rounded-lg">{error}</p>}
        </div>
        <div className="flex gap-3 p-5 pt-0">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button variant="primary" loading={loading} onClick={handleSubmit} className="flex-1" data-testid="party-form-submit">
            {party ? 'Save Changes' : 'Add Party'}
          </Button>
        </div>
      </div>
    </div>
  );
}
