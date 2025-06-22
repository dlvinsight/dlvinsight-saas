'use client';

import { Plus, Settings } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { AddAccountModal } from './AddAccountModal';

interface SellerAccount {
  id: string;
  name: string;
  marketplace: string;
  marketplaceCode: string;
  apiType: 'sp-api' | 'adv-api';
  status: 'active' | 'inactive' | 'error';
  lastSync: Date | null;
}

export function SourcesList() {
  const t = useTranslations('Sources');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [accounts, setAccounts] = useState<SellerAccount[]>([]);

  const handleAddAccount = () => {
    setIsAddModalOpen(true);
  };

  const handleAccountSettings = (accountId: string) => {
    // TODO: Navigate to account settings page
    console.log('Settings for account:', accountId);
  };

  const getStatusBadge = (status: SellerAccount['status']) => {
    const variants = {
      active: 'default' as const,
      inactive: 'secondary' as const,
      error: 'destructive' as const,
    };

    return (
      <Badge variant={variants[status]}>
        {t(`status.${status}`)}
      </Badge>
    );
  };

  const getApiTypeBadge = (apiType: SellerAccount['apiType']) => {
    return (
      <Badge variant="outline">
        {apiType.toUpperCase()}
      </Badge>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">{t('accounts_title')}</h2>
        <Button onClick={handleAddAccount} size="sm">
          <Plus className="mr-2 h-4 w-4" />
          {t('add_account')}
        </Button>
      </div>

      {accounts.length === 0 ? (
        <div className="text-center py-12 bg-muted/50 rounded-lg">
          <p className="text-muted-foreground mb-4">{t('no_accounts')}</p>
          <Button onClick={handleAddAccount}>
            <Plus className="mr-2 h-4 w-4" />
            {t('add_first_account')}
          </Button>
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('table.account_name')}</TableHead>
                <TableHead>{t('table.marketplace')}</TableHead>
                <TableHead>{t('table.api_type')}</TableHead>
                <TableHead>{t('table.status')}</TableHead>
                <TableHead>{t('table.last_sync')}</TableHead>
                <TableHead className="text-right">{t('table.actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {accounts.map((account) => (
                <TableRow key={account.id}>
                  <TableCell className="font-medium">{account.name}</TableCell>
                  <TableCell>{account.marketplace} ({account.marketplaceCode})</TableCell>
                  <TableCell>{getApiTypeBadge(account.apiType)}</TableCell>
                  <TableCell>{getStatusBadge(account.status)}</TableCell>
                  <TableCell>
                    {account.lastSync 
                      ? new Date(account.lastSync).toLocaleString()
                      : t('never_synced')
                    }
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleAccountSettings(account.id)}
                    >
                      <Settings className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <AddAccountModal 
        open={isAddModalOpen} 
        onOpenChange={setIsAddModalOpen}
        onAccountAdded={(newAccount) => {
          setAccounts([...accounts, newAccount]);
        }}
      />
    </div>
  );
}