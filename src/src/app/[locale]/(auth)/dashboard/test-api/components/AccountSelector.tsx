import { useEffect, useState } from 'react';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { fetchSellerAccounts } from '../../sources/actions';
import type { SellerAccount } from '../types';

type AccountSelectorProps = {
  value: string;
  onValueChange: (value: string) => void;
  disabled?: boolean;
};

export function AccountSelector({ value, onValueChange, disabled }: AccountSelectorProps) {
  const [accounts, setAccounts] = useState<SellerAccount[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadAccounts = async () => {
      setIsLoading(true);
      const result = await fetchSellerAccounts();
      if (result.success) {
        setAccounts(result.accounts);
        if (result.accounts.length > 0 && !value) {
          const firstAccount = result.accounts[0];
          if (firstAccount) {
            onValueChange(firstAccount.id);
          }
        }
      }
      setIsLoading(false);
    };

    loadAccounts();
  }, [value, onValueChange]);

  if (isLoading) {
    return (
      <Select disabled>
        <SelectTrigger className="w-full max-w-md">
          <SelectValue placeholder="Loading accounts..." />
        </SelectTrigger>
      </Select>
    );
  }

  if (accounts.length === 0) {
    return (
      <Select disabled>
        <SelectTrigger className="w-full max-w-md">
          <SelectValue placeholder="No accounts available" />
        </SelectTrigger>
      </Select>
    );
  }

  return (
    <Select value={value} onValueChange={onValueChange} disabled={disabled}>
      <SelectTrigger className="w-full max-w-md">
        <SelectValue placeholder="Select an account" />
      </SelectTrigger>
      <SelectContent>
        {accounts.map(account => (
          <SelectItem key={account.id} value={account.id}>
            {account.name}
            {' '}
            -
            {' '}
            {account.marketplace}
            {' '}
            (
            {account.marketplaceCode}
            )
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
